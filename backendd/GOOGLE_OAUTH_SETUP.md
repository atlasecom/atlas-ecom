# Google OAuth Setup Guide

## 🔧 **Step-by-Step Google OAuth Configuration**

### **1. Create Google Cloud Project**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: `Atlas Ecom B2B`
4. Click "Create"

### **2. Enable Google+ API**

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### **3. Create OAuth 2.0 Credentials**

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Set the name: `Atlas Ecom OAuth`

### **4. Configure Authorized Redirect URIs**

Add these URIs in the "Authorized redirect URIs" section:

**For Production:**
```
https://atlas-ecom-1.onrender.com/auth/google/callback
```

**For Development:**
```
http://localhost:5000/auth/google/callback
```

### **5. Get Your Credentials**

After creating the OAuth client, you'll get:
- **Client ID**: Copy this value
- **Client Secret**: Copy this value

### **6. Update Environment Variables**

Update your `config.env` file with the new credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
GOOGLE_CALLBACK_URL=https://atlas-ecom-1.onrender.com/auth/google/callback

# Frontend Configuration
FRONTEND_URL=https://atlas-ecom-1.onrender.com
```

### **7. Test the Configuration**

1. Deploy your updated backend to Render
2. Try logging in with Google
3. Check the browser console for any errors

## 🚨 **Common Issues & Solutions**

### **Error: redirect_uri_mismatch**
- **Cause**: The redirect URI in Google Console doesn't match the one being sent
- **Solution**: Make sure both URIs are exactly the same (including https/http)

### **Error: invalid_client**
- **Cause**: Wrong Client ID or Client Secret
- **Solution**: Double-check your credentials in the environment variables

### **Error: access_denied**
- **Cause**: User denied permission or app not verified
- **Solution**: For testing, add your email to "Test users" in Google Console

## 📝 **Important Notes**

1. **HTTPS Required**: Google OAuth requires HTTPS in production
2. **Exact Match**: Redirect URIs must match exactly (no trailing slashes)
3. **Domain Verification**: For production, you may need to verify your domain
4. **Test Users**: Add test users if your app is in testing mode

## 🔍 **Debugging Steps**

1. Check browser console for errors
2. Verify environment variables are loaded correctly
3. Test with both localhost and production URLs
4. Check Google Cloud Console for any restrictions

## 📞 **Support**

If you're still having issues:
1. Check the Google Cloud Console error logs
2. Verify your OAuth configuration
3. Test with a simple redirect URI first
4. Make sure your domain is properly configured
