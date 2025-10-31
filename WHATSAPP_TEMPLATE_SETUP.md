# 📱 WhatsApp Message Template Setup Guide

## Why Templates Are Required

**Error 63016** means: *"Failed to send freeform message because you are outside the allowed window"*

WhatsApp Business API has strict rules:
- ✅ **Message Templates**: Can be sent anytime (requires approval)
- ❌ **Freeform Messages**: Only within 24-hour window after customer messages you

For **phone verification codes** (first contact), you **MUST use a template**.

---

## 🚀 Quick Setup (2 Options)

### Option 1: Twilio Content Templates (Recommended - Easier)

1. **Go to Twilio Console:**
   - Navigate to: **Content** → **Templates** → **Create Template**
   - Or: https://console.twilio.com/us1/develop/sms/content-template-manager

2. **Create WhatsApp Template:**
   - **Name**: `verification_code` (or any name)
   - **Type**: WhatsApp
   - **Language**: English (or your preferred language)
   - **Template Content**: 
     ```
     🔐 Atlas E-commerce Verification Code

     Your verification code is: {{1}}

     This code will expire in 10 minutes.

     Do not share this code with anyone.
     ```
   - **Variables**: Add 1 variable for the code

3. **Get Content SID:**
   - After creating, copy the **Content SID** (starts with `HX...`)
   - Example: `HX1234567890abcdef1234567890abcdef`

4. **Add to Environment Variables:**
   ```env
   TWILIO_WHATSAPP_TEMPLATE_NAME=HX1234567890abcdef1234567890abcdef
   ```

---

### Option 2: Meta Business Manager Templates (More Control)

1. **Go to Meta Business Manager:**
   - Navigate to: https://business.facebook.com/
   - Go to **WhatsApp** → **Message Templates**

2. **Create New Template:**
   - **Category**: AUTHENTICATION
   - **Name**: `verification_code`
   - **Language**: English
   - **Template Content**:
     ```
     🔐 Atlas E-commerce Verification Code

     Your verification code is: {{1}}

     This code will expire in 10 minutes.

     Do not share this code with anyone.
     ```
   - Add variable `{{1}}` for the verification code

3. **Submit for Approval:**
   - Submit template to Meta/WhatsApp for approval
   - Wait for approval (usually 24-48 hours)
   - Once approved, template will appear in Twilio Console

4. **Get Template Name from Twilio:**
   - Go to: Twilio Console → Messaging → WhatsApp Senders → Your Number
   - Click **Message Templates**
   - Find your approved template
   - Copy the **Template Name** (usually matches what you named it)

5. **Add to Environment Variables:**
   ```env
   TWILIO_WHATSAPP_TEMPLATE_NAME=verification_code
   ```

---

## ⚙️ Configuration

After creating your template, add it to your production environment variables:

### On Render:
1. Go to your backend service → **Environment**
2. Add new variable:
   - **Key**: `TWILIO_WHATSAPP_TEMPLATE_NAME`
   - **Value**: Your template Content SID or name
3. **Save** and **Redeploy**

### Example Values:
```
# For Twilio Content Template (Content SID)
TWILIO_WHATSAPP_TEMPLATE_NAME=HX1234567890abcdef1234567890abcdef

# OR for Meta Business Manager Template (Template Name)
TWILIO_WHATSAPP_TEMPLATE_NAME=verification_code
```

---

## 🧪 Testing

1. **Deploy** your backend with the template variable
2. **Try signing up** with a phone number
3. **Check logs** for:
   - `📱 Attempting to send WhatsApp template via Twilio`
   - `✅ WhatsApp template sent via Twilio successfully!`
4. **Verify** you receive the message on WhatsApp

---

## 🔍 Troubleshooting

### Template Not Found Error:
- **Problem**: Template name/SID is incorrect
- **Solution**: 
  - Double-check the Content SID or template name
  - Ensure template is approved (for Meta templates)
  - Verify template is linked to your WhatsApp number

### Template Still Pending:
- **Problem**: Meta template not yet approved
- **Solution**: 
  - Wait for approval (24-48 hours)
  - Check Meta Business Manager for status
  - Use Twilio Content Template as temporary solution

### Error 63016 Still Appears:
- **Problem**: Template not configured or incorrect
- **Solution**:
  - Verify `TWILIO_WHATSAPP_TEMPLATE_NAME` is set in production
  - Check logs to see if template is being used
  - Redeploy after adding the variable

---

## 📋 Template Content Guidelines

### Required:
- ✅ Simple, clear message
- ✅ Variable for verification code: `{{1}}`
- ✅ Business name or identifier
- ✅ Expiration time mention

### Recommended Format:
```
🔐 [Business Name] Verification Code

Your verification code is: {{1}}

This code will expire in 10 minutes.

Do not share this code with anyone.

Best regards,
[Your Business Name]
```

### Avoid:
- ❌ Emojis (may not be approved by Meta)
- ❌ Promotional content (for AUTHENTICATION category)
- ❌ Links or external URLs (may be blocked)
- ❌ Too much text (keep it concise)

---

## 🎯 Next Steps

1. ✅ Create template (Option 1 or 2 above)
2. ✅ Add `TWILIO_WHATSAPP_TEMPLATE_NAME` to environment variables
3. ✅ Redeploy backend
4. ✅ Test phone verification
5. ✅ Verify messages are received

---

## 📞 Need Help?

- **Twilio Support**: https://support.twilio.com/
- **Meta Business Help**: https://business.facebook.com/help
- **Template Approval Issues**: Contact Twilio support with your template name

