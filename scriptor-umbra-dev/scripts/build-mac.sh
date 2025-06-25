#!/bin/bash

# Build script for macOS
echo "Building Scriptor Umbra AI for macOS..."

# Clean previous builds
echo "Cleaning previous builds..."
npm run clean

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Create macOS distribution
echo "Creating macOS distribution..."
npm run dist:mac

echo "macOS build complete! Check the dist/ folder for the output."

