#!/bin/bash

echo "Setting up the backend environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Please install Python3 and try again."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "pip3 is not installed. Please install pip3 and try again."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "MongoDB is not running. Please start MongoDB first."
    echo "You can start MongoDB using: brew services start mongodb-community"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install requirements
echo "Installing required packages..."
pip install -r requirements.txt

echo "Setup complete! You can now run the backend server using:"
echo "source venv/bin/activate"
echo "python run.py"

# Make the script executable
chmod +x setup.sh
