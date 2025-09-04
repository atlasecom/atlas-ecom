# 🚀 Atlas Ecom - Render Deployment Guide

## 📋 Render Deployment Steps

### 1. Backend Deployment on Render

#### Step 1: Create Backend Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Service Settings:**
- **Name**: `atlas-ecom-backend`
- **Root Directory**: `backendd`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Starter` (Free) or `Standard` (Paid)

#### Step 2: Environment Variables
Add these environment variables in Render dashboard:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/atlas_ecom

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Server
PORT=5000
NODE_ENV=production

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://atlas-ecom-backend.onrender.com/auth/google/callback

# Frontend URL
FRONTEND_URL=https://atlas-ecom-frontend.onrender.com
```

#### Step 3: Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment to complete
3. Note your backend URL: `https://atlas-ecom-backend.onrender.com`

### 2. Frontend Deployment on Render

#### Step 1: Create Frontend Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure the service:

**Static Site Settings:**
- **Name**: `atlas-ecom-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

#### Step 2: Environment Variables
Add these environment variables:

```env
REACT_APP_SERVER=https://atlas-ecom-backend.onrender.com
REACT_APP_BACKEND_URL=https://atlas-ecom-backend.onrender.com
REACT_APP_SOCKET_ENDPOINT=https://atlas-ecom-backend.onrender.com
```

#### Step 3: Deploy Frontend
1. Click **"Create Static Site"**
2. Wait for deployment to complete
3. Note your frontend URL: `https://atlas-ecom-frontend.onrender.com`

### 3. Database Setup (MongoDB Atlas)

#### Step 1: Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Choose **M0 Sandbox** (Free tier)
4. Select your preferred region

#### Step 2: Configure Database Access
1. Go to **"Database Access"**
2. Click **"Add New Database User"**
3. Create a user with **"Read and write to any database"** permissions
4. Note the username and password

#### Step 3: Configure Network Access
1. Go to **"Network Access"**
2. Click **"Add IP Address"**
3. Add **"0.0.0.0/0"** to allow access from anywhere (for Render)

#### Step 4: Get Connection String
1. Go to **"Clusters"**
2. Click **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your database user password

### 4. Google OAuth Setup

#### Step 1: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **"APIs & Services"** → **"Credentials"**
4. Edit your OAuth 2.0 Client ID
5. Add these **Authorized redirect URIs**:
   - `https://atlas-ecom-backend.onrender.com/auth/google/callback`

#### Step 2: Update Environment Variables
Update your backend environment variables in Render with the new callback URL.

### 5. Render-Specific Configuration

#### Auto-Deploy Settings
1. In Render dashboard, go to your service settings
2. Enable **"Auto-Deploy"** from main branch
3. This will automatically deploy when you push to GitHub

#### Custom Domain (Optional)
1. In Render dashboard, go to your service
2. Click **"Custom Domains"**
3. Add your domain name
4. Follow the DNS configuration instructions

### 6. Render Free Tier Limitations

#### Backend (Web Service)
- **Sleep**: Services sleep after 15 minutes of inactivity
- **Cold Start**: First request after sleep takes ~30 seconds
- **Bandwidth**: 100GB/month
- **Build Time**: 90 minutes/month

#### Frontend (Static Site)
- **Bandwidth**: 100GB/month
- **Build Time**: 90 minutes/month
- **No Sleep**: Static sites don't sleep

### 7. Performance Optimization for Render

#### Backend Optimization
1. **Keep-Alive**: Add keep-alive headers to prevent sleep
2. **Health Check**: Implement health check endpoint
3. **Caching**: Use Redis for session storage (upgrade to paid plan)

#### Frontend Optimization
1. **CDN**: Render automatically provides CDN
2. **Compression**: Enable gzip compression
3. **Caching**: Set proper cache headers

### 8. Monitoring and Logs

#### View Logs
1. Go to your service in Render dashboard
2. Click **"Logs"** tab
3. Monitor for errors and performance issues

#### Health Monitoring
- Backend Health: `https://atlas-ecom-backend.onrender.com/health`
- Frontend: Check if the site loads correctly

### 9. Troubleshooting Render Issues

#### Common Issues

1. **Service Sleeps**
   - **Solution**: Upgrade to paid plan or implement keep-alive
   - **Workaround**: Use external monitoring service to ping your app

2. **Build Failures**
   - **Check**: Environment variables are set correctly
   - **Check**: Dependencies in package.json
   - **Check**: Build logs for specific errors

3. **Database Connection Issues**
   - **Check**: MongoDB Atlas IP whitelist
   - **Check**: Connection string format
   - **Check**: Database user permissions

4. **CORS Errors**
   - **Check**: FRONTEND_URL environment variable
   - **Check**: CORS settings in server.js

### 10. Deployment Checklist

#### Pre-Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Google OAuth configured
- [ ] Environment variables prepared
- [ ] Code pushed to GitHub

#### Post-Deployment
- [ ] Backend service running
- [ ] Frontend site accessible
- [ ] Database connection working
- [ ] Google OAuth working
- [ ] Email functionality working
- [ ] All features tested

### 11. Cost Estimation

#### Free Tier
- **Backend**: Free (with limitations)
- **Frontend**: Free
- **Database**: Free (MongoDB Atlas M0)
- **Total**: $0/month

#### Paid Tier (Recommended for Production)
- **Backend**: $7/month (Starter plan)
- **Frontend**: Free
- **Database**: Free (MongoDB Atlas M0)
- **Total**: $7/month

---

## 🎉 Your Atlas Ecom is Ready!

After following these steps, your Atlas Ecom platform will be live at:
- **Frontend**: `https://atlas-ecom-frontend.onrender.com`
- **Backend**: `https://atlas-ecom-backend.onrender.com`

**Atlas Ecom** - Professional B2B E-commerce Platform on Render! 🚀
