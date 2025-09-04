# 🚀 Render Quick Start Guide

## ⚡ Super Quick Deployment (5 Minutes)

### 1. Prepare Your Project
```bash
# Run the deployment preparation script
deploy-to-render.bat
```

### 2. Deploy Backend (2 minutes)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Set **Root Directory**: `backendd`
5. Add environment variables (see below)
6. Click **"Create Web Service"**

### 3. Deploy Frontend (2 minutes)
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repo
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Publish Directory**: `build`
6. Add environment variables (see below)
7. Click **"Create Static Site"**

### 4. Environment Variables

#### Backend Environment Variables:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/atlas_ecom
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=production
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/auth/google/callback
FRONTEND_URL=https://your-frontend-url.onrender.com
```

#### Frontend Environment Variables:
```env
REACT_APP_SERVER=https://your-backend-url.onrender.com
REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com
REACT_APP_SOCKET_ENDPOINT=https://your-backend-url.onrender.com
```

## 🎯 What You'll Get

- **Backend URL**: `https://atlas-ecom-backend.onrender.com`
- **Frontend URL**: `https://atlas-ecom-frontend.onrender.com`
- **Free Tier**: $0/month
- **Auto-Deploy**: Updates automatically when you push to GitHub

## 📚 Full Documentation

- **Complete Guide**: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- **General Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Project Docs**: [README.md](./README.md)

## 🆘 Need Help?

1. Check the [Render documentation](https://render.com/docs)
2. Review the [troubleshooting section](./RENDER_DEPLOYMENT.md#9-troubleshooting-render-issues)
3. Check your service logs in Render dashboard

---

**Atlas Ecom** - Ready for Render! 🚀
