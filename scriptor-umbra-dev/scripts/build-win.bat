@echo off

REM Build script for Windows
echo Building Scriptor Umbra AI for Windows...

REM Clean previous builds
echo Cleaning previous builds...
call npm run clean

REM Install dependencies
echo Installing dependencies...
call npm install

REM Build the application
echo Building application...
call npm run build

REM Create Windows distribution
echo Creating Windows distribution...
call npm run dist:win

echo Windows build complete! Check the dist/ folder for the output.

