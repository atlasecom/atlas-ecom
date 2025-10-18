const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.isReady = false;
    this.qrCode = null;
    this.sessionPath = process.env.WHATSAPP_QR_CODE_PATH || './whatsapp-session';
    this.sessionName = process.env.WHATSAPP_SESSION_NAME || 'atlasecom-session';
  }

  async initialize() {
    if (this.isInitialized) {
      return this.isReady;
    }

    // Skip WhatsApp initialization in production
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ WhatsApp service disabled in production environment');
      this.isInitialized = true;
      this.isReady = false;
      return false;
    }

    try {
      console.log('🔧 Initializing WhatsApp Service...');
      
      // Ensure session directory exists
      if (!fs.existsSync(this.sessionPath)) {
        fs.mkdirSync(this.sessionPath, { recursive: true });
      }

      // Create WhatsApp client
      this.client = new Client({
        authStrategy: new LocalAuth({
          clientId: this.sessionName
        }),
        puppeteer: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-field-trial-config',
            '--disable-back-forward-cache',
            '--disable-ipc-flooding-protection',
            '--disable-hang-monitor',
            '--disable-prompt-on-repost',
            '--disable-sync',
            '--disable-translate',
            '--disable-windows10-custom-titlebar',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--disable-default-apps',
            '--disable-background-networking',
            '--disable-sync-preferences',
            '--disable-client-side-phishing-detection',
            '--disable-component-update',
            '--disable-domain-reliability',
            '--disable-features=TranslateUI',
            '--no-default-browser-check',
            '--no-first-run',
            '--no-pings',
            '--no-zygote',
            '--password-store=basic',
            '--use-mock-keychain',
            '--disable-logging',
            '--disable-gpu-logging',
            '--silent',
            '--log-level=3'
          ]
        }
      });

      // Event listeners
      this.client.on('qr', (qr) => {
        console.log('📱 WhatsApp QR Code generated. Scan with your phone to connect.');
        this.qrCode = qr;
        
        // Display QR code in terminal
        qrcode.generate(qr, { small: true });
        
        // Save QR code to file (optional)
        this.saveQRCodeToFile(qr);
      });

      this.client.on('ready', () => {
        console.log('✅ WhatsApp Client is ready!');
        this.isReady = true;
        this.qrCode = null;
      });

      this.client.on('authenticated', () => {
        console.log('🔐 WhatsApp authenticated successfully!');
      });

      this.client.on('auth_failure', (msg) => {
        console.error('❌ WhatsApp authentication failed:', msg);
        this.isReady = false;
      });

      this.client.on('disconnected', (reason) => {
        console.log('📱 WhatsApp client disconnected:', reason);
        this.isReady = false;
      });

      this.client.on('error', (error) => {
        console.error('❌ WhatsApp client error:', error);
        this.isReady = false;
      });

      // Initialize the client
      await this.client.initialize();
      this.isInitialized = true;

      return this.isReady;
    } catch (error) {
      console.error('❌ WhatsApp initialization error:', error);
      this.isInitialized = false;
      this.isReady = false;
      return false;
    }
  }

  async sendMessage(phoneNumber, message) {
    // In production, return a fallback response
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ WhatsApp service not available in production - using fallback');
      return {
        success: false,
        error: 'WhatsApp service not available in production',
        phoneNumber: phoneNumber,
        fallback: true
      };
    }

    try {
      if (!this.isReady) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('WhatsApp service is not ready');
        }
        
        // Wait a bit for the client to be fully ready
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Format phone number for WhatsApp (remove + and add country code if needed)
      let formattedNumber = phoneNumber.replace(/\D/g, '');
      
      // Add country code if not present (assuming Moroccan numbers)
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '212' + formattedNumber.substring(1);
      } else if (!formattedNumber.startsWith('212')) {
        formattedNumber = '212' + formattedNumber;
      }

      // WhatsApp format: country code + number + @c.us
      const whatsappNumber = formattedNumber + '@c.us';


      // Check if number exists on WhatsApp
      const isRegistered = await this.client.isRegisteredUser(whatsappNumber);
      if (!isRegistered) {
        throw new Error(`Phone number ${phoneNumber} is not registered on WhatsApp`);
      }

      // Send message
      const response = await this.client.sendMessage(whatsappNumber, message);
      
      return {
        success: true,
        messageId: response.id._serialized,
        phoneNumber: phoneNumber
      };

    } catch (error) {
      console.error('❌ WhatsApp send message error:', error);
      return {
        success: false,
        error: error.message,
        phoneNumber: phoneNumber
      };
    }
  }

  async sendVerificationCode(phoneNumber, code) {
    const message = `🔐 Atlas E-commerce Verification Code\n\nYour verification code is: *${code}*\n\nThis code will expire in 10 minutes.\n\nDo not share this code with anyone.\n\nBest regards,\nAtlas E-commerce Team`;
    
    return await this.sendMessage(phoneNumber, message);
  }

  getQRCode() {
    return this.qrCode;
  }

  isConnected() {
    return this.isReady;
  }

  async disconnect() {
    if (this.client) {
      await this.client.destroy();
      this.isReady = false;
      this.isInitialized = false;
      console.log('📱 WhatsApp client disconnected');
    }
  }

  saveQRCodeToFile(qrCode) {
    try {
      const qrPath = path.join(this.sessionPath, 'qr-code.txt');
      fs.writeFileSync(qrPath, qrCode);
      console.log(`📄 QR code saved to: ${qrPath}`);
    } catch (error) {
      console.error('Error saving QR code to file:', error);
    }
  }

  // Health check method
  async healthCheck() {
    return {
      isInitialized: this.isInitialized,
      isReady: this.isReady,
      hasQRCode: !!this.qrCode,
      sessionPath: this.sessionPath,
      sessionName: this.sessionName
    };
  }
}

// Create singleton instance
const whatsappService = new WhatsAppService();

module.exports = whatsappService;
