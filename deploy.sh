#!/bin/bash

# Deployment script for Ticksy
# This script builds the project and deploys it to Firebase.

echo "🚀 Starting deployment process..."

# 1. Build the project
echo "📦 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Aborting deployment."
    exit 1
fi

# 2. Deploy to Firebase
echo "🔥 Deploying to Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "🎉 Deployment complete! Ticksy is live."
else
    echo "❌ Deployment failed."
    exit 1
fi
