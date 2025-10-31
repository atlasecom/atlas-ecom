# Twilio WhatsApp Error 63016 - Verification Checklist

## Error 63016: Message Delivery Failed

This error means Twilio accepted the message but WhatsApp couldn't deliver it. Follow this checklist to verify your Twilio account setup.

---

## ✅ Step 1: Check WhatsApp Business API Status

**Location:** Twilio Console → Messaging → WhatsApp Senders

### What to Check:
1. **Go to:** https://console.twilio.com/us1/develop/sms/whatsapp/learn
2. **Find your WhatsApp number:** `+212708000863`
3. **Check the Status:**
   - ✅ **"Approved"** = Ready to send messages
   - ⚠️ **"Pending"** = Still under review (messages may not deliver)
   - ❌ **"Rejected"** = Needs action or re-submission

### What You Should See:
- **Phone Number:** `+212708000863`
- **Status:** Should be "Approved" (green checkmark)
- **Business Name:** Should show your business name
- **WhatsApp Business Account ID:** Should be present

### If Status is "Pending":
- Wait for Twilio/WhatsApp approval (can take 24-48 hours)
- Check for any emails from Twilio requesting additional information
- Contact Twilio support if pending for more than 48 hours

### If Status is "Rejected":
- Click on the number to see rejection reason
- Fix the issue (usually business verification or documentation)
- Resubmit for approval

---

## ✅ Step 2: Verify WhatsApp Business Account Connection

**Location:** Twilio Console → Messaging → WhatsApp Senders → Your Number

### What to Check:
1. **Business Account Status:**
   - Should be connected to a verified WhatsApp Business Account
   - Should show Meta Business Account ID

2. **Phone Number Type:**
   - Should be "Business Account" (not sandbox)
   - If it shows "Sandbox", you need to complete business verification

### What You Should See:
- ✅ Connected to Meta Business Account
- ✅ Phone number verified
- ✅ Business profile completed

---

## ✅ Step 3: Check Account Credits and Balance

**Location:** Twilio Console → Billing → Account Balance

### What to Check:
1. **Account Balance:**
   - Should have sufficient credits ($0.005 per WhatsApp message)
   - Minimum recommended: $5.00

2. **Payment Method:**
   - Should have a valid payment method on file
   - Status should be "Active"

### If Low Balance:
- Add credits to your Twilio account
- Set up auto-recharge if needed

---

## ✅ Step 4: Verify Phone Number Format in Your Code

**Location:** Your environment variables

### Check Environment Variables:
```
TWILIO_WHATSAPP_NUMBER=whatsapp:+212708000863
```

**Important:**
- ✅ Must start with `whatsapp:`
- ✅ Must include country code with `+`
- ✅ No spaces
- ✅ Exact format: `whatsapp:+212708000863`

---

## ✅ Step 5: Check Message Logs for Details

**Location:** Twilio Console → Monitor → Logs → Messages

### What to Check:
1. **Find your Message SID:** `SM509b8772ecb64474b155cd7e068c8268`
2. **Check Status Column:**
   - Should see "undelivered" status
   - Click on the message to see details

3. **Check Error Details:**
   - **Error Code:** Should show `63016`
   - **Error Message:** Should show more details
   - **Direction:** Should be "outbound"

### What to Look For:
- Detailed error message (more than just the code)
- Webhook callbacks (if configured)
- Delivery attempts

---

## ✅ Step 6: Verify Recipient Phone Number

### For Testing:
1. **Ensure the phone number has WhatsApp:**
   - Test by sending a manual message from another WhatsApp
   - Verify WhatsApp is installed and active
   - Check if the number has blocked your business number

2. **Phone Number Format:**
   - Your code formats: `212657379482` → `whatsapp:+212657379482`
   - ✅ Correct format (Moroccan number with country code)

---

## ✅ Step 7: Check WhatsApp Business Profile

**Location:** Twilio Console → Messaging → WhatsApp Senders → Profile

### What to Verify:
1. **Business Display Name:**
   - Should be approved by WhatsApp
   - Should match your registered business name

2. **Business Category:**
   - Should be set appropriately

3. **Business Description:**
   - Should be completed

---

## ✅ Step 8: Test with Twilio's Test Tool

**Location:** Twilio Console → Messaging → Try it out → Send a WhatsApp message

### Steps:
1. Go to WhatsApp testing tool in Twilio Console
2. Enter recipient number: `+212657379482`
3. Send a test message
4. Check if it delivers

### What This Tells You:
- ✅ **If test message works:** Problem is in your code/environment
- ❌ **If test message fails:** Problem is with Twilio/WhatsApp setup

---

## 🔍 Most Common Issues & Solutions

### Issue 1: WhatsApp Business API Not Fully Approved
**Solution:**
- Wait for approval (24-48 hours typically)
- Complete all required business verification steps
- Submit all required documents

### Issue 2: Recipient Number Not Registered on WhatsApp
**Solution:**
- Verify the recipient has WhatsApp installed
- Test with a known working WhatsApp number
- Ensure recipient hasn't blocked your number

### Issue 3: Business Profile Incomplete
**Solution:**
- Complete WhatsApp Business Profile in Twilio Console
- Verify business information matches registration
- Wait for profile approval

### Issue 4: Rate Limiting
**Solution:**
- Check if you're sending too many messages too quickly
- WhatsApp has rate limits (especially for new businesses)
- Wait and retry after some time

---

## 📞 Next Steps If Still Not Working

1. **Contact Twilio Support:**
   - Go to: https://support.twilio.com/
   - Provide Message SID: `SM509b8772ecb64474b155cd7e068c8268`
   - Mention error code: `63016`
   - Ask about WhatsApp Business API status

2. **Check Twilio Status Page:**
   - https://status.twilio.com/
   - Look for any WhatsApp service issues

3. **Verify Recipient:**
   - Test with a different phone number
   - Ensure recipient's WhatsApp is active
   - Try sending from Twilio Console directly

---

## 🎯 Quick Verification Checklist

- [ ] WhatsApp Business API status is "Approved" (not "Pending")
- [ ] Account has sufficient credits/balance
- [ ] Phone number format is correct: `whatsapp:+212708000863`
- [ ] Business profile is completed in Twilio
- [ ] Test message from Twilio Console works
- [ ] Recipient phone number has active WhatsApp
- [ ] No errors in Twilio Console logs
- [ ] Payment method is active on account

---

## 📝 What to Share with Support

If you need to contact support, provide:
- **Message SID:** `SM509b8772ecb64474b155cd7e068c8268`
- **Error Code:** `63016`
- **Your WhatsApp Number:** `+212708000863`
- **Recipient Number:** `+212657379482`
- **WhatsApp Business API Status:** (from Step 1)
- **Screenshot of Message Logs:** (from Step 5)

