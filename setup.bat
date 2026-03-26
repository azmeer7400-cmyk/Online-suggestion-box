@echo off
echo.
echo =========================================
echo Online Suggestion Box - Setup Script
echo =========================================
echo.

echo [1/4] Checking if Node.js is installed...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [✓] Node.js found: 
node --version
echo.

echo [2/4] Installing npm dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo [✓] Dependencies installed
echo.

echo [3/4] Creating necessary directories...
if not exist "public\uploads" mkdir public\uploads
echo [✓] Directories ready
echo.

echo [4/4] Configuration check...
if not exist ".env" (
    echo Warning: .env file not found. Using default settings.
    echo Make sure MongoDB is running on localhost:27017
) else (
    echo [✓] .env file found
)
echo.

echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Make sure MongoDB is running
echo 2. Run: npm start
echo 3. Visit http://localhost:3000
echo.
pause
