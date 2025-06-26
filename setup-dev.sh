#!/bin/bash

# Development setup script for Scriptor Umbra AI
echo "Setting up Scriptor Umbra AI development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create build directory if it doesn't exist
mkdir -p build

# Run initial build
echo "Running initial build..."
npm run build:dev

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "Available commands:"
echo "  npm start          - Start the application"
echo "  npm run dev        - Start in development mode"
echo "  npm run build      - Build for production"
echo "  npm run watch      - Watch files and rebuild"
echo "  npm run lint       - Run ESLint"
echo "  npm run test       - Run tests"
echo "  npm run dist:mac   - Build macOS distribution"
echo "  npm run dist:win   - Build Windows distribution"
echo "  npm run dist:linux - Build Linux distribution"
echo ""
echo "VS Code users:"
echo "  - Open this folder in VS Code"
echo "  - Install recommended extensions when prompted"
echo "  - Use Ctrl+Shift+P -> 'Tasks: Run Task' to access build tasks"
echo "  - Use F5 to start debugging"
echo ""

