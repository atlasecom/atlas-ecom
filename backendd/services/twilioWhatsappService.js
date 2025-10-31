const twilio = require('twilio');

class TwilioWhatsAppService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.isReady = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return this.isReady;
    }

    try {
      console.log('🔧 Initializing Twilio WhatsApp Service...');
      
      // Get Twilio credentials from environment variables
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

      if (!accountSid || !authToken || !whatsappNumber) {
        console.log('⚠️ Twilio WhatsApp credentials not configured');
        this.isInitialized = true;
        this.isReady = false;
        return false;
      }

      // Initialize Twilio client
      this.client = twilio(accountSid, authToken);
      this.whatsappNumber = whatsappNumber;
      
      this.isInitialized = true;
      this.isReady = true;
      
      console.log('✅ Twilio WhatsApp Service initialized successfully');
      console.log('   Account SID:', accountSid.substring(0, 10) + '...');
      console.log('   WhatsApp Number:', whatsappNumber);
      console.log('   Environment:', process.env.NODE_ENV || 'not set');
      
      // Detect if using sandbox (sandbox numbers typically have specific patterns)
      const isSandbox = whatsappNumber.includes('+14155238886') || 
                       whatsappNumber.includes('+1 415 523 8886') ||
                       whatsappNumber.includes('sandbox');
      
      if (isSandbox) {
        console.log('   ⚠️  DETECTED: Using Twilio WhatsApp Sandbox');
        console.log('   ℹ️  IMPORTANT: Recipients must join sandbox before receiving messages');
        console.log('   ℹ️  Steps to join:');
        console.log('      1. Get sandbox join code from Twilio Console');
        console.log('      2. Send join code FROM recipient phone TO sandbox number');
        console.log('      3. Wait for confirmation message');
        console.log('      4. 24-hour messaging window starts after join');
      } else {
        console.log('   ✅ Using Twilio WhatsApp Production API');
        console.log('   ℹ️  Ensure your business is approved for WhatsApp Business API');
      }
      
      return true;

    } catch (error) {
      console.error('❌ Twilio WhatsApp initialization failed:', error);
      this.isInitialized = true;
      this.isReady = false;
      return false;
    }
  }

  async sendMessage(phoneNumber, message) {
    if (!this.isReady || !this.client) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.error('❌ Twilio WhatsApp service is not ready. Check environment variables:');
        console.error('   TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'SET' : 'NOT SET');
        console.error('   TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'SET' : 'NOT SET');
        console.error('   TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER || 'NOT SET');
        return {
          success: false,
          error: 'Twilio WhatsApp service is not ready. Check environment variables and logs.',
          phoneNumber: phoneNumber
        };
      }
    }

    try {
      // Format phone number for WhatsApp
      let formattedNumber = phoneNumber.replace(/\D/g, '');
      
      // Add country code if not present (assuming Moroccan numbers)
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '212' + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith('212')) {
        formattedNumber = '212' + formattedNumber;
      }

      // WhatsApp format: whatsapp:+countrycode+number
      const whatsappNumber = `whatsapp:+${formattedNumber}`;

      console.log('📱 Attempting to send WhatsApp message via Twilio:');
      console.log('   From:', this.whatsappNumber);
      console.log('   To:', whatsappNumber);
      console.log('   Original phone:', phoneNumber);

      // Send message via Twilio WhatsApp API
      const response = await this.client.messages.create({
        body: message,
        from: this.whatsappNumber,
        to: whatsappNumber
      });
      
      console.log('✅ WhatsApp message sent via Twilio successfully!');
      console.log('   Message SID:', response.sid);
      console.log('   Status:', response.status);
      console.log('   Error Code:', response.errorCode || 'None');
      console.log('   Error Message:', response.errorMessage || 'None');
      
      // Check if message is queued and provide helpful info
      if (response.status === 'queued') {
        console.log('   ⚠️  Message is queued. Checking delivery status...');
        console.log('   ℹ️  If using Twilio WhatsApp Sandbox:');
        console.log('      1. Recipient must join sandbox first');
        console.log('      2. Send join code FROM recipient TO sandbox number');
        console.log('      3. Wait for confirmation message');
        console.log('      4. There is a 24-hour messaging window');
        console.log('   ℹ️  Check Twilio Console → Monitor → Logs for delivery status');
      }
      
      // Check delivery status after a short delay
      setTimeout(async () => {
        try {
          const messageStatus = await this.client.messages(response.sid).fetch();
          console.log('   📊 Message Status Update:');
          console.log('      Status:', messageStatus.status);
          console.log('      Error Code:', messageStatus.errorCode || 'None');
          console.log('      Error Message:', messageStatus.errorMessage || 'None');
          
          if (messageStatus.status === 'failed' || messageStatus.status === 'undelivered' || messageStatus.errorCode) {
            console.log('   ❌ Message delivery failed!');
            if (messageStatus.errorCode === 63007) {
              console.log('   💡 Solution: Recipient must join Twilio WhatsApp Sandbox first');
            } else if (messageStatus.errorCode === 63016) {
              console.log('   💡 Error 63016: Message delivery failed');
              console.log('   📋 Possible reasons:');
              console.log('      1. Phone number is not registered on WhatsApp');
              console.log('      2. WhatsApp account is not active on that phone');
              console.log('      3. Phone number format is incorrect');
              console.log('      4. Recipient has blocked the sender number');
              console.log('      5. WhatsApp Business API approval pending');
              console.log('   🔍 Action: Verify the phone number has active WhatsApp account');
            } else if (messageStatus.errorCode) {
              console.log('   💡 Error Code:', messageStatus.errorCode);
              console.log('   📋 Check Twilio documentation for error code:', messageStatus.errorCode);
            }
          } else if (messageStatus.status === 'delivered') {
            console.log('   ✅ Message delivered successfully!');
          } else if (messageStatus.status === 'sent') {
            console.log('   📤 Message sent (waiting for delivery confirmation)');
          }
        } catch (err) {
          console.log('   ⚠️  Could not check message status:', err.message);
        }
      }, 3000); // Check after 3 seconds
      
      return {
        success: true,
        messageId: response.sid,
        phoneNumber: phoneNumber,
        formattedNumber: whatsappNumber,
        provider: 'twilio',
        status: response.status,
        errorCode: response.errorCode,
        errorMessage: response.errorMessage
      };

    } catch (error) {
      console.error('❌ Twilio WhatsApp send message error:');
      console.error('   Error code:', error.code);
      console.error('   Error message:', error.message);
      console.error('   Phone number:', phoneNumber);
      console.error('   Full error:', error);
      
      // Check for specific Twilio error codes
      let errorMessage = error.message;
      if (error.code === 21211) {
        errorMessage = 'Invalid phone number format. For Twilio WhatsApp sandbox, you must join the sandbox first by sending the join code to the sandbox number.';
      } else if (error.code === 21608) {
        errorMessage = 'Unsubscribed recipient. The phone number has unsubscribed from WhatsApp messages.';
      } else if (error.code === 63007) {
        errorMessage = 'Phone number not in WhatsApp sandbox. Send join code to Twilio sandbox number first.';
      } else if (error.code === 63016) {
        errorMessage = 'Message delivery failed. Phone number may not be registered on WhatsApp, account inactive, or number format incorrect.';
      }
      
      return {
        success: false,
        error: errorMessage,
        errorCode: error.code,
        phoneNumber: phoneNumber,
        provider: 'twilio',
        details: error.toString()
      };
    }
  }

  async sendVerificationCode(phoneNumber, code) {
    const message = `🔐 Atlas E-commerce Verification Code\n\nYour verification code is: *${code}*\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.\n\nBest regards,\nAtlas E-commerce Team`;
    
    return await this.sendMessage(phoneNumber, message);
  }

  isServiceReady() {
    return this.isReady;
  }
}

module.exports = new TwilioWhatsAppService();
