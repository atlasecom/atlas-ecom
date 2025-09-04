# Atlas Ecom - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Vercel/Netlify account (for frontend)
- Railway/Heroku/DigitalOcean account (for backend)

## 📋 Deployment Steps

### 1. Backend Deployment (Railway/Heroku/DigitalOcean)

#### Environment Variables Setup
Create these environment variables in your hosting platform:

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
GOOGLE_CALLBACK_URL=https://your-backend-url.com/auth/google/callback

# Frontend URL
FRONTEND_URL=https://your-frontend-url.com
```

#### Deploy Backend
1. Connect your GitHub repository to Railway/Heroku
2. Set the root directory to `backendd`
3. Set the build command: `npm install`
4. Set the start command: `npm start`
5. Deploy

### 2. Frontend Deployment (Vercel/Netlify)

#### Environment Variables Setup
Create these environment variables:

```env
REACT_APP_SERVER=https://your-backend-url.com
REACT_APP_BACKEND_URL=https://your-backend-url.com
REACT_APP_SOCKET_ENDPOINT=https://your-backend-url.com
```

#### Deploy Frontend
1. Connect your GitHub repository to Vercel/Netlify
2. Set the root directory to `frontend`
3. Set the build command: `npm run build`
4. Set the publish directory: `build`
5. Deploy

### 3. Database Setup (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Whitelist your server IP addresses
4. Get the connection string
5. Update the MONGODB_URI environment variable

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-backend-url.com/auth/google/callback`
6. Update environment variables

### 5. Email Setup (Gmail)

1. Enable 2-Factor Authentication on Gmail
2. Generate an App Password
3. Update EMAIL_USER and EMAIL_PASS environment variables

## 🔧 Post-Deployment

### 1. Test All Features
- [ ] User registration/login
- [ ] Google OAuth login
- [ ] Forgot password
- [ ] Product creation/management
- [ ] Event creation/management
- [ ] Shop management
- [ ] Admin panel

### 2. Security Checklist
- [ ] Change default JWT secret
- [ ] Use HTTPS in production
- [ ] Set secure CORS origins
- [ ] Enable rate limiting
- [ ] Set up monitoring

### 3. Performance Optimization
- [ ] Enable gzip compression
- [ ] Set up CDN for static assets
- [ ] Optimize images
- [ ] Enable caching

## 📊 Monitoring

### Health Check Endpoints
- Backend: `https://your-backend-url.com/health`
- Frontend: Check if the app loads correctly

### Logs
Monitor your hosting platform's logs for:
- Error messages
- Performance issues
- Security alerts

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check FRONTEND_URL environment variable
   - Verify CORS settings in server.js

2. **Database Connection Issues**
   - Check MONGODB_URI format
   - Verify IP whitelist in MongoDB Atlas

3. **Google OAuth Issues**
   - Check redirect URIs in Google Console
   - Verify environment variables

4. **Email Issues**
   - Check Gmail App Password
   - Verify SMTP settings

## 📞 Support

For deployment issues, check:
1. Hosting platform documentation
2. MongoDB Atlas documentation
3. Google Cloud Console documentation

---

**Atlas Ecom** - Professional B2B E-commerce Platform
