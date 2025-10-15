#!/bin/bash

echo "Building OBS Background Generator..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the standalone version
echo "Building standalone HTML file..."
npm run build-standalone

echo "Build complete! Check the dist folder for the standalone HTML file."
echo "You can now use this file directly in OBS Studio as a Browser Source."
