import fitz
import requests
import json
import warnings
import openpyxl
import pandas as pd
import os

warnings.filterwarnings("ignore", category=Warning)


# Azure OpenAI Configuration
API_KEY = os.environ['API_KEY']
AZURE_ENDPOINT = "https://rmbs-pdf-scrubber.openai.azure.com"
DEPLOYMENT_NAME = "gpt-4o-mini"
API_VERSION = "2024-08-01-preview"

PDF_PATH = "rmbs_file_scrape.pdf"

def full(pdf_path):
    print("Starting the full process...")

    # Extract text from PDF
    text = extract_text_from_pdf(pdf_path)
    
    # Check if text is empty or too short
    if not text or len(text.strip()) < 100:
        print("Warning: Extracted text appears to be empty or very short!")
        print("Raw text content:")
        print("-" * 50)
        print(text)
        print("-" * 50)
        raise Exception("PDF text extraction failed or produced insufficient text")
    
    print("\nProceeding with GPT processing...")
    
    # Sends the text to GPT and retrieves the response
    gpt_response = askGpt(text)
    print("Received GPT response.")

    # Save GPT response to file
    with open("gpt_response.txt", "w") as f:
        f.write(gpt_response)
    print("GPT response saved to gpt_response.txt")

    # Parse the response to extract the requested information
    financial_details = parse_gpt_response(gpt_response)
    print("\nParsed Financial Details:")
    print("-" * 50)
    for key, value in financial_details.items():
        print(f"{key}: {value}")
    print("-" * 50)

    # Store parsed variables in a dictionary with exact key matching
    financial_information = {
        "Closing Date": financial_details.get("Closing Date", "N/A"),
        "First Payment Date": financial_details.get("First Payment Date", "N/A"),
        "Day Count System": financial_details.get("Day Count System", "N/A"),
        "Payment Frequency": financial_details.get("Payment Frequency", "N/A"),
        "Payment Frequency Add. Description": financial_details.get("Payment Frequency Add. Description", "N/A"),
        "Description": financial_details.get("Description", "N/A"),
        "Rate Adjustment Frequency": financial_details.get("Rate Adjustment Frequency", "N/A"),
        "Initial Asset Balance": financial_details.get("Initial Asset Balance", "N/A"),
        "Current Prepaid Balance": financial_details.get("Current Prepaid Balance", "N/A"),
        "Asset Amortization Type": financial_details.get("Asset Amortization Type", "N/A"),
        "WA Fixed Rate": financial_details.get("WA Fixed Rate", "N/A"),
        "Prepayment Type": financial_details.get("Prepayment Type", "N/A"),
        "Fixed Prepayment Rate": financial_details.get("Fixed Prepayment Rate", "N/A"),
        "Default Rate": financial_details.get("Default Rate", "N/A"),
        "Recoverable": financial_details.get("Recoverable", "N/A"),
        "Original Term": financial_details.get("Original Term", "N/A"),
        "Loss Multiple": financial_details.get("Loss Multiple", "N/A"),
        "Base Losses": financial_details.get("Base Losses", "N/A"),
        "Remaining Term": financial_details.get("Remaining Term", "N/A"),
        "Discount Rate": financial_details.get("Discount Rate", "N/A"),
        "WA Original Amortization Term": financial_details.get("WA Original Amortization Term", "N/A"),
        "WA Original Balloon Payment Month": financial_details.get("WA Original Balloon Payment Month", "N/A"),
        "WA Original Interest Only Period": financial_details.get("WA Original Interest Only Period", "N/A"),
        "WA Original Interest Capitalization Period": financial_details.get("WA Original Interest Capitalization Period", "N/A"),
        "WALA": financial_details.get("WALA", "N/A"),
        "Recoveries Lag": financial_details.get("Recoveries Lag", "N/A"),
    }

    # Print all financial details
    print("\nFinancial Information:")
    for key, value in financial_information.items():
        print(f"{key}: {value}")


def extract_text_from_pdf(pdf_path):
    """Converts PDF content into a text string."""
    print(f"Opening PDF: {pdf_path}")
    doc = fitz.open(pdf_path)
    text = ""
    for page_num, page in enumerate(doc):
        page_text = page.get_text()
        text += page_text
        # Print first 200 characters of each page for debugging
        print(f"\nPage {page_num + 1} preview:")
        print("-" * 50)
        print(page_text[:200] + "...")
        print("-" * 50)
    
    print(f"\nTotal text length: {len(text)} characters")
    
    # Save full text to file for inspection
    with open("extracted_text.txt", "w", encoding='utf-8') as f:
        f.write(text)
    print("Full text saved to 'extracted_text.txt' for inspection")
    
    return text

def askGpt(text):
    """Sends the text to Azure OpenAI API for processing in chunks."""
    print("Sending text to Azure OpenAI API...")
    
    # Calculate approximate tokens (rough estimate: 4 chars = 1 token)
    max_tokens = 2000
    chunk_size = max_tokens * 4
    
    # Split text into chunks
    chunks = [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]
    print(f"Split text into {len(chunks)} chunks")
    
    all_responses = []
    for i, chunk in enumerate(chunks):
        print(f"Processing chunk {i+1} of {len(chunks)}...")
        try:
            url = f"{AZURE_ENDPOINT}/openai/deployments/{DEPLOYMENT_NAME}/chat/completions"
            
            headers = {
                "api-key": API_KEY,
                "Content-Type": "application/json"
            }
            
            data = {
                "messages": [{
                    "role": "user",
                    "content": f"From the following text (part {i+1} of {len(chunks)}), extract any of these details you can find (include labels): "
                               f"Closing Date, First Payment Date, Day Count System, Payment Frequency, "
                               f"Payment Frequency Add. Description, Description, Rate Adjustment Frequency, Initial Asset Balance, "
                               f"Current Prepaid Balance, Asset Amortization Type, WA Fixed Rate, "
                               f"Prepayment Type, Fixed Prepayment Rate, Default Rate, Recoverable, "
                               f"Original Term, Loss Multiple, Base Losses, Remaining Term, Discount Rate, "
                               f"WA Original Amortization Term, WA Original Balloon Payment Month, "
                               f"WA Original Interest Only Period, WA Original Interest Capitalization Period, "
                               f"WALA, Recoveries Lag. "
                               f"Only include details if you find them in the text.\n\n{chunk}"
                }],
                "max_tokens": 1000,
                "temperature": 0.7
            }
            
            params = {
                "api-version": API_VERSION
            }
            
            response = requests.post(
                url,
                headers=headers,
                params=params,
                json=data
            )
            
            response_json = response.json()
            
            # Check for error in response
            if "error" in response_json:
                error_msg = response_json["error"].get("message", "Unknown error")
                print(f"Error in chunk {i+1}: {error_msg}")
                
                # If it's a token limit error, try with a smaller chunk
                if "token" in error_msg.lower():
                    smaller_chunk = chunk[:len(chunk)//2]
                    print(f"Retrying chunk {i+1} with smaller size...")
                    data["messages"][0]["content"] = f"From the following text, extract any of these details you can find (include labels): [same fields as above]... Only include details if you find them in the text.\n\n{smaller_chunk}"
                    response = requests.post(
                        url,
                        headers=headers,
                        params=params,
                        json=data
                    )
                    response_json = response.json()
            
            content = response_json["choices"][0]["message"]["content"]
            print(f"Successfully processed chunk {i+1}")
            all_responses.append(content)
            
        except Exception as e:
            print(f"Error processing chunk {i+1}: {str(e)}")
            continue
    
    if not all_responses:
        raise Exception("No successful responses were received")
    
    combined_response = "\n".join(all_responses)
    return combined_response

def parse_gpt_response(response):
    """Parses the GPT response to extract the requested details."""
    print("Parsing GPT response...")
    financial_details = {}
    lines = response.split("\n")
    
    # Clean up the response - remove bullet points and asterisks
    for line in lines:
        if ":" in line:  # Only process lines with a colon (key-value pairs)
            # Clean up the line by removing bullets, asterisks and extra spaces
            line = line.replace("- ", "").replace("* ", "").replace("**", "").strip()
            key, value = line.split(":", 1)
            key = key.strip()
            value = value.strip()
            
            # Handle special case for Recoveries Lag
            if "Recoveries Lag" in key:
                # Remove "(months)" from key if present and strip percentage sign if present
                key = "Recoveries Lag"
                value = value.replace("%", "")
            
            if value and value.lower() != "n/a":  # Only update if value is non-empty and not N/A
                financial_details[key] = value
    
    print("Parsed GPT response successfully.")
    return financial_details

def test_api():
    """Test the Azure OpenAI API connection with a minimal request"""
    url = f"{AZURE_ENDPOINT}/openai/deployments/{DEPLOYMENT_NAME}/chat/completions"
    
    headers = {
        "api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    data = {
        "messages": [{
            "role": "user",
            "content": "Say hello"
        }],
        "max_tokens": 100
    }
    
    params = {
        "api-version": API_VERSION
    }
    
    test_response = requests.post(
        url,
        headers=headers,
        params=params,
        json=data
    )
    print("Test response:", test_response.json())

# Execute the script
if __name__ == "__main__":
    test_api()  # Test API connection first
    full(PDF_PATH)  # Then run the full process





###Excell stuff
def save_to_excel(financial_details, excel_path="RMBS_Automation_copy.xlsx"):
    """Saves financial details to an Excel sheet."""
    # Check if the Excel file exists
    try:
        # Load the existing workbook
        wb = openpyxl.load_workbook(excel_path)
        print(f"Existing file found: {excel_path}")
    except FileNotFoundError:
        # Create a new workbook if the file doesn't exist
        wb = openpyxl.Workbook()
        print(f"Creating a new file: {excel_path}")
    
    closing_date = financial_details.get("Closing Date", "N/A")
    first_payment_date = financial_details.get("First Payment Date", "N/A")
    day_count_system = financial_details.get("Day Count System", "N/A")
    payment_frequency = financial_details.get("Payment Frequency", "N/A")
    rate_adjustment_frequency = financial_details.get("Rate Adjustment Frequency", "N/A")
    Asset_Level_Inputs = financial_details.get("Asset Level Inputs", "N/A")
    payment_frequency_additional = financial_details.get("Payment Frequency Add. Description", "N/A")
    initial_asset_balance = financial_details.get("Initial Asset Balance", "N/A")
    current_prepaid_balance = financial_details.get("Current Prepaid Balance", "N/A")
    asset_amortization_type = financial_details.get("Asset Amortization Type", "N/A")
    wa_fixed_rate = financial_details.get("WA Fixed Rate", "N/A")
    prepayment_type = financial_details.get("Prepayment Type", "N/A")
    fixed_prepayment_rate = financial_details.get("Fixed Prepayment Rate", "N/A")
    default_rate = financial_details.get("Default Rate", "N/A")
    recoverable = financial_details.get("Recoverable", "N/A")
    original_term = financial_details.get("Original Term", "N/A")
    loss_multiple = financial_details.get("Loss Multiple", "N/A")
    base_losses = financial_details.get("Base Losses", "N/A")
    remaining_term = financial_details.get("Remaining Term", "N/A")
    discount_rate = financial_details.get("Discount Rate", "N/A")
    description = financial_details.get("Description", "N/A")
    wa_original_amortization_term = financial_details.get("WA Original Amortization Term", "N/A")
    wa_original_balloon_payment_month = financial_details.get("WA Original Balloon Payment Month", "N/A")
    wa_original_interest_only_period = financial_details.get("WA Original Interest Only Period", "N/A")
    wa_original_interest_capitalization_period = financial_details.get("WA Original Interest Capitalization Period", "N/A")
    wala = financial_details.get("WALA", "N/A")
    recoveries_lag = financial_details.get("Recoveries Lag", "N/A")
    loss_multiple = financial_details.get("Loss Multiple", "N/A")
    base_losses = financial_details.get("Base Losses", "N/A")
    
