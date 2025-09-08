# Email Setup Guide for Contact Form

This guide will help you set up email functionality for the contact form to send emails to `atlasecom0@gmail.com`.

## Gmail App Password Setup

To send emails from the contact form, you need to set up a Gmail App Password:

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2-Factor Authentication

### Step 2: Generate App Password
1. Go back to "Security" settings
2. Under "Signing in to Google", click on "App passwords"
3. Select "Mail" as the app
4. Select "Other" as the device and enter "Atlas Ecom Backend"
5. Click "Generate"
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update Environment Variables
Add these to your `config.env` file:

```env
# Email Configuration
EMAIL_USER=atlasecom0@gmail.com
EMAIL_PASS=your-16-character-app-password
GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Important:** Replace `your-16-character-app-password` with the actual app password from Step 2.

## Testing the Email Functionality

1. Start your backend server: `npm start`
2. Go to the contact form on your website
3. Fill out and submit the form
4. Check your Gmail inbox at `atlasecom0@gmail.com`

## Troubleshooting

### Common Issues:

1. **"Invalid login" error:**
   - Make sure you're using the App Password, not your regular Gmail password
   - Ensure 2-Factor Authentication is enabled

2. **"Less secure app access" error:**
   - Use App Passwords instead of enabling "less secure apps"
   - App Passwords are more secure

3. **Emails not received:**
   - Check your spam folder
   - Verify the EMAIL_USER is set to `atlasecom0@gmail.com`
   - Check the server logs for error messages

### Server Logs
When emails are sent successfully, you'll see:
```
📧 Contact email sent successfully: <message-id>
✅ Contact email sent successfully to atlasecom0@gmail.com
```

If there's an error, you'll see:
```
❌ Error sending contact email: <error-message>
```

## Email Template

The contact form emails will include:
- Professional HTML formatting
- Contact form details (name, email, subject, message)
- Reply-to address set to the sender's email
- Timestamp of submission
- Atlas Ecom branding

## Security Notes

- Never commit your actual app password to version control
- Use environment variables for all sensitive data
- The app password is specific to this application and can be revoked if needed
- Consider using a dedicated Gmail account for business emails
