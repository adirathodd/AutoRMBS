# Use official Node.js image as base
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files to the container
COPY . .

# Install Python and required dependencies
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install -r requirements.txt  # Ensure you have a requirements.txt file for Python dependencies

# Expose port (matches the one in your server.js)
EXPOSE 3000

# Start the Node.js server
CMD ["node", "server.js"]