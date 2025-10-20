#!/bin/bash

# 🚀 NextEra Vercel Deployment Script
# This script will deploy your game to Vercel

echo "🎮 NextEra - Vercel Deployment"
echo "================================"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in
echo "🔐 Checking authentication..."
if ! vercel whoami &> /dev/null; then
    echo ""
    echo "⚠️  You need to log in to Vercel first."
    echo ""
    echo "Please run: vercel login"
    echo ""
    echo "This will open your browser for authentication."
    echo "After logging in, run this script again."
    exit 1
fi

echo "✅ Authenticated as: $(vercel whoami)"
echo ""

# Build the project
echo "🔨 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel deploy --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo ""
    echo "📱 Your game is now live!"
    echo "   Open the URL above on your iPhone to play!"
    echo ""
else
    echo "❌ Deployment failed!"
    exit 1
fi
