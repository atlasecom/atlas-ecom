# 📱 Twilio WhatsApp Setup for Production

## 🚀 Quick Setup Guide

### Step 1: Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your phone number

### Step 2: Get WhatsApp Sandbox Access
1. In Twilio Console, go to **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Follow the instructions to get your WhatsApp sandbox number
3. Send the provided code to the sandbox number from your phone

### Step 3: Get API Credentials
1. In Twilio Console, go to **Settings** > **General**
2. Copy your **Account SID** and **Auth Token**
3. Note your **WhatsApp Sandbox Number** (starts with +1 415...)

### Step 4: Add Environment Variables to Render
In your Render backend service, add these environment variables:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Step 5: Deploy
1. Push your code to GitHub
2. Render will automatically redeploy
3. Check the logs for "✅ Twilio WhatsApp service initialized and ready"

## 🔧 How It Works

- **Development**: Uses `whatsapp-web.js` with QR code scanning
- **Production**: Uses Twilio WhatsApp API (no QR code needed)
- **Automatic**: The system automatically chooses the right method based on environment

## 📞 Testing

### Test in Development:
```bash
cd backendd
node server.local.js
# Scan QR code when it appears
```

### Test in Production:
1. Go to your production website
2. Try signing up with a phone number
3. Check your phone for WhatsApp message

## 💰 Pricing

- **Sandbox**: Free for testing (limited numbers)
- **Production**: Pay per message (very affordable)
- **Free Trial**: $15 credit included

## 🎯 Benefits

- ✅ **No QR Code Scanning**: Works in production
- ✅ **Reliable**: Official WhatsApp Business API
- ✅ **Scalable**: Handles high volume
- ✅ **Professional**: Official WhatsApp branding
- ✅ **Global**: Works worldwide

## 🔍 Troubleshooting

### If WhatsApp messages don't send:

#### Step 1: Check Environment Variables
1. Verify all three variables are set in production:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER` (must include `whatsapp:` prefix)
2. Check `NODE_ENV=production` is set

#### Step 2: Check Server Logs
Look for these log messages:
- `✅ Twilio WhatsApp Service initialized successfully` - Good!
- `⚠️ Twilio WhatsApp credentials not configured` - Missing env vars
- `📱 Attempting to send WhatsApp message via Twilio` - Message attempt
- `✅ WhatsApp message sent via Twilio successfully!` - Success!
- `❌ Twilio WhatsApp send message error` - Error occurred

#### Step 3: Common Error Codes & Solutions

**Error Code 21211 or 63007: "Phone number not in sandbox"**
- **Problem**: If using Twilio WhatsApp Sandbox, phone numbers must join first
- **Solution**: 
  1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
  2. Find your sandbox join code (e.g., "join XXXX")
  3. Send that code FROM your phone TO the Twilio sandbox number (e.g., +1 415 523 8886)
  4. Wait for confirmation message
  5. Now your number can receive messages from the sandbox

**Error Code 21608: "Unsubscribed recipient"**
- **Problem**: Phone number has unsubscribed from WhatsApp
- **Solution**: Ask user to send START to your WhatsApp number

**"Invalid phone number format"**
- **Problem**: Phone number format is incorrect
- **Solution**: Ensure format is `whatsapp:+212XXXXXXXXX` (country code + number, no leading 0)

#### Step 4: Test Twilio Connection
1. Check Twilio Console → Monitor → Logs → Errors
2. Verify account has credits/balance
3. Check if WhatsApp service is enabled for your account

### If you get "not configured" error:
1. Add all three Twilio environment variables
2. Ensure `NODE_ENV=production` is set
3. Redeploy your backend service
4. Check the logs for initialization status

### Debug Checklist:
- [ ] `TWILIO_ACCOUNT_SID` is set (starts with `AC`)
- [ ] `TWILIO_AUTH_TOKEN` is set (32+ characters)
- [ ] `TWILIO_WHATSAPP_NUMBER` starts with `whatsapp:+`
- [ ] `NODE_ENV=production` is set
- [ ] Phone number joined Twilio WhatsApp sandbox (if using sandbox)
- [ ] Twilio account has credits
- [ ] Check server logs for detailed error messages

## 📋 Next Steps

1. **Set up Twilio account** (5 minutes)
2. **Add environment variables** to Render
3. **Deploy and test** (2 minutes)
4. **Upgrade to production** when ready (optional)

Your WhatsApp will now work in production! 🎉
