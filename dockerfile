# Use an official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Install system dependencies for Python and virtual environment support
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Create a virtual environment and update PATH so that "python" points to it
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Copy Python dependencies file and install them in the venv
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Node.js dependency files and install them
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that your app listens on (adjust if needed)
EXPOSE 3000

# Use npm start (which in turn should call your "python" command as needed)
CMD ["node", "server.js"]