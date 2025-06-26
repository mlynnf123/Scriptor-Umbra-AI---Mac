#!/bin/bash

# Build script for Linux
echo "Building Scriptor Umbra AI for Linux..."

# Clean previous builds
echo "Cleaning previous builds..."
npm run clean

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Create Linux distribution
echo "Creating Linux distribution..."
npm run dist:linux

echo "Linux build complete! Check the dist/ folder for the output."

