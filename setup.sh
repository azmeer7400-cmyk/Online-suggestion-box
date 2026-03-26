#!/bin/bash

echo ""
echo "========================================="
echo "Online Suggestion Box - Setup Script"
echo "========================================="
echo ""

echo "[1/4] Checking if Node.js is installed..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "[✓] Node.js found:"
node --version
echo ""

echo "[2/4] Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi
echo "[✓] Dependencies installed"
echo ""

echo "[3/4] Creating necessary directories..."
mkdir -p public/uploads
echo "[✓] Directories ready"
echo ""

echo "[4/4] Configuration check..."
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Using default settings."
    echo "Make sure MongoDB is running on localhost:27017"
else
    echo "[✓] .env file found"
fi
echo ""

echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Run: npm start"
echo "3. Visit http://localhost:3000"
echo ""
