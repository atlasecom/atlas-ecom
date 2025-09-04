#!/bin/bash

# Atlas Ecom - Render Deployment Script
# This script helps you prepare your project for Render deployment

echo "🚀 Atlas Ecom - Render Deployment Preparation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "✅ Project structure verified"

# Check if backendd directory exists
if [ ! -d "backendd" ]; then
    echo "❌ Error: backendd directory not found"
    exit 1
fi

echo "✅ Backend directory found"

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found"
    exit 1
fi

echo "✅ Frontend directory found"

# Check if config.env.example exists
if [ ! -f "backendd/config.env.example" ]; then
    echo "❌ Error: config.env.example not found"
    exit 1
fi

echo "✅ Environment template found"

# Create production build for frontend
echo "📦 Building frontend for production..."
cd frontend
npm install
npm run build
cd ..

echo "✅ Frontend build completed"

# Check if build directory exists
if [ ! -d "frontend/build" ]; then
    echo "❌ Error: Frontend build failed"
    exit 1
fi

echo "✅ Frontend build verified"

# Display next steps
echo ""
echo "🎉 Project is ready for Render deployment!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://dashboard.render.com/"
echo "2. Create a new Web Service for backend"
echo "3. Create a new Static Site for frontend"
echo "4. Follow the instructions in RENDER_DEPLOYMENT.md"
echo ""
echo "📚 Documentation:"
echo "- RENDER_DEPLOYMENT.md - Complete Render deployment guide"
echo "- DEPLOYMENT.md - General deployment guide"
echo "- README.md - Project documentation"
echo ""
echo "🔗 Useful Links:"
echo "- Render Dashboard: https://dashboard.render.com/"
echo "- MongoDB Atlas: https://www.mongodb.com/atlas"
echo "- Google Cloud Console: https://console.cloud.google.com/"
echo ""
echo "Good luck with your deployment! 🚀"
