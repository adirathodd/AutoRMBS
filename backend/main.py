import os
from datetime import datetime, timedelta
from typing import Optional, Any
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse
from pydantic import BaseModel
from supabase import create_client, Client
import bcrypt
from jose import JWTError, jwt
from dotenv import load_dotenv
from scrape import scrape
from fastapi.middleware.cors import CORSMiddleware
import shutil

# -----------------------------------------------------------------------------
# FastAPI instance
# -----------------------------------------------------------------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your React app's URL, e.g. "http://localhost:3000"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

# -----------------------------------------------------------------------------
# Supabase setup
# -----------------------------------------------------------------------------
SUPABASE_URL = os.getenv("DB_URL")
SUPABASE_PASSWORD = os.getenv("DB_PASSWORD")

if not SUPABASE_URL or not SUPABASE_PASSWORD:
    raise ValueError("Please set the SUPABASE_URL and SUPABASE_KEY environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_PASSWORD)

# -----------------------------------------------------------------------------
# JWT settings
# -----------------------------------------------------------------------------
SECRET_KEY = os.getenv("JWT_KEY")
ALGORITHM = os.getenv("JWT_ALGO")
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# -----------------------------------------------------------------------------
# Pydantic Models
# -----------------------------------------------------------------------------
class User(BaseModel):
    id: Optional[str]
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class RegisterUser(BaseModel):
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# -----------------------------------------------------------------------------
# OAuth2PasswordBearer
# -----------------------------------------------------------------------------
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# -----------------------------------------------------------------------------
# Password hashing utilities
# -----------------------------------------------------------------------------
def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(plain_password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# -----------------------------------------------------------------------------
# JWT creation & decoding
# -----------------------------------------------------------------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token with given data (payload).
    If 'expires_delta' is provided, set the 'exp' (expiration) claim.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """
    Extract and validate the current user from the JWT in the Authorization header.
    If invalid or expired, raise HTTPException(401).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")  # 'sub' is a common JWT claim for subject
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Query user from DB
    try:
        result = (
            supabase
            .table("users")
            .select("*")
            .eq("username", username)
            .execute()
        )
        if not result.data:
            raise credentials_exception
        user_record = result.data[0]
        return User(
            id=str(user_record.get("id")),
            username=user_record["username"],
            email=user_record["email"],
            first_name=user_record.get("first_name"),
            last_name=user_record.get("last_name")
        )
    except Exception:
        raise credentials_exception

# -----------------------------------------------------------------------------
# Login (token generation) Endpoint
# -----------------------------------------------------------------------------
@app.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Logs in a user using OAuth2PasswordRequestForm:
      - form_data.username
      - form_data.password

    Returns a JWT access token on success.
    """
    # 1) Retrieve user by username
    try:
        result = (
            supabase
            .table("users")
            .select("*")
            .eq("username", form_data.username)
            .execute()
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password."
        )

    user_record = result.data[0]

    # 2) Verify password
    if not verify_password(form_data.password, user_record["password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password."
        )

    # 3) Create JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_record["username"]},
        expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")

# -----------------------------------------------------------------------------
# Register Endpoint
# -----------------------------------------------------------------------------
@app.post("/register")
def register_user(user: RegisterUser):
    """
    Example user registration. Accepts a JSON body:
    {
      "username": "...",
      "email": "...",
      "password": "...",
      "first_name": "...",
      "last_name": "..."
    }
    """

    # Check if username already exists
    check = (
        supabase
        .table("users")
        .select("*")
        .eq("username", user.username)
        .execute()
    )
    if check.data:
        raise HTTPException(status_code=400, detail="Username already taken.")
    
    # Check if email already exists
    check = (
        supabase
        .table("users")
        .select("*")
        .eq("email", user.email)
        .execute()
    )
    if check.data:
        raise HTTPException(status_code=400, detail="There is already an account with this email.")

    # Insert new user with hashed password
    hashed_pw = hash_password(user.password)
    new_user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_pw,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }
    try:
        supabase.table("users").insert(new_user_data).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {"message": "User registered successfully."}

# -----------------------------------------------------------------------------
# Protected Routes
# -----------------------------------------------------------------------------
@app.get("/profile")
def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Example of a protected route. The current user is extracted from the JWT.
    """
    return {
        "user_id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
    }

# -----------------------------------------------------------------------------
# PDF Scrape Endpoint
# -----------------------------------------------------------------------------
@app.post("/scrape")
async def scrape_pdf(file: UploadFile = File(...), current_user: Any = Depends(get_current_user)):
    """
    Protected endpoint that:
    - Accepts a PDF file upload.
    - Saves the file to 'uploads/{username}/{PDF_FILE}'.
    - Returns the JSON result.
    """

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed."
        )

    username = current_user.username
    user_uploads_folder = os.path.join("uploads", username)
    os.makedirs(user_uploads_folder, exist_ok=True)

    save_path = os.path.join(user_uploads_folder, file.filename)

    try:
        with open(save_path, "wb") as buffer:
            buffer.write(await file.read())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving uploaded file: {str(e)}"
        )

    try:
        result = scrape(save_path, username)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during PDF scraping: {str(e)}"
        )

    return {"scrape_result": result}

# -----------------------------------------------------------------------------
# Excel download Endpoint
# -----------------------------------------------------------------------------
@app.get("/download")
async def download(current_user: Any = Depends(get_current_user)):
    username = current_user.username
    if not username:
        raise HTTPException(status_code=400, detail="User not found.")
    
    file_path = f"downloads/{username}/output.xlsx"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Excel file not found.")
    
    return FileResponse(
        path=file_path,
        filename="output.xlsx",
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

# -----------------------------------------------------------------------------
# Logout and delete files (upload, download)
# -----------------------------------------------------------------------------
@app.post("/logout")
async def download(current_user: Any = Depends(get_current_user)):
    username = current_user.username
    if not username:
        raise HTTPException(status_code=400, detail="User not found.")
    
    downloads = f"downloads/{username}"
    uploads = f"uploads/{username}"
    
    for directory in (downloads, uploads):
        if os.path.exists(directory) and os.path.isdir(directory):
            try:
                shutil.rmtree(directory)
                print(f"Deleted directory: {directory}")
            except Exception as e:
                print(f"Error deleting {directory}: {e}")
        else:
            print(f"Directory {directory} does not exist.")