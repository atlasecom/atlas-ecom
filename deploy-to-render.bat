@echo off
echo 🚀 Atlas Ecom - Render Deployment Preparation
echo ==============================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo ✅ Project structure verified

REM Check if backendd directory exists
if not exist "backendd" (
    echo ❌ Error: backendd directory not found
    pause
    exit /b 1
)

echo ✅ Backend directory found

REM Check if frontend directory exists
if not exist "frontend" (
    echo ❌ Error: frontend directory not found
    pause
    exit /b 1
)

echo ✅ Frontend directory found

REM Check if config.env.example exists
if not exist "backendd\config.env.example" (
    echo ❌ Error: config.env.example not found
    pause
    exit /b 1
)

echo ✅ Environment template found

REM Create production build for frontend
echo 📦 Building frontend for production...
cd frontend
call npm install
call npm run build
cd ..

echo ✅ Frontend build completed

REM Check if build directory exists
if not exist "frontend\build" (
    echo ❌ Error: Frontend build failed
    pause
    exit /b 1
)

echo ✅ Frontend build verified

REM Display next steps
echo.
echo 🎉 Project is ready for Render deployment!
echo.
echo 📋 Next Steps:
echo 1. Go to https://dashboard.render.com/
echo 2. Create a new Web Service for backend
echo 3. Create a new Static Site for frontend
echo 4. Follow the instructions in RENDER_DEPLOYMENT.md
echo.
echo 📚 Documentation:
echo - RENDER_DEPLOYMENT.md - Complete Render deployment guide
echo - DEPLOYMENT.md - General deployment guide
echo - README.md - Project documentation
echo.
echo 🔗 Useful Links:
echo - Render Dashboard: https://dashboard.render.com/
echo - MongoDB Atlas: https://www.mongodb.com/atlas
echo - Google Cloud Console: https://console.cloud.google.com/
echo.
echo Good luck with your deployment! 🚀
pause
