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
        return {
          success: false,
          error: 'Twilio WhatsApp service is not ready',
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

      // Send message via Twilio WhatsApp API
      const response = await this.client.messages.create({
        body: message,
        from: this.whatsappNumber,
        to: whatsappNumber
      });
      
      console.log('✅ WhatsApp message sent via Twilio:', response.sid);
      
      return {
        success: true,
        messageId: response.sid,
        phoneNumber: phoneNumber,
        provider: 'twilio'
      };

    } catch (error) {
      console.error('❌ Twilio WhatsApp send message error:', error);
      return {
        success: false,
        error: error.message,
        phoneNumber: phoneNumber,
        provider: 'twilio'
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
