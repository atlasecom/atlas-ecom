const express = require('express');
const whatsappService = require('../services/whatsappService');
const router = express.Router();

// @desc    Get WhatsApp service status
// @route   GET /api/whatsapp/status
// @access  Public
router.get('/status', async (req, res) => {
  try {
    const health = await whatsappService.healthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get WhatsApp status',
      error: error.message
    });
  }
});

// @desc    Get WhatsApp QR code
// @route   GET /api/whatsapp/qr
// @access  Public
router.get('/qr', async (req, res) => {
  try {
    const qrCode = whatsappService.getQRCode();
    if (qrCode) {
      res.json({
        success: true,
        qrCode: qrCode,
        message: 'Scan this QR code with your WhatsApp mobile app'
      });
    } else {
      res.json({
        success: false,
        message: whatsappService.isConnected() ? 'WhatsApp already connected' : 'QR code not available'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get QR code',
      error: error.message
    });
  }
});

// @desc    Send test WhatsApp message
// @route   POST /api/whatsapp/test
// @access  Public
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and message are required'
      });
    }

    const result = await whatsappService.sendMessage(phoneNumber, message);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test message sent successfully',
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to send test message',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send test message',
      error: error.message
    });
  }
});

// @desc    Disconnect WhatsApp
// @route   POST /api/whatsapp/disconnect
// @access  Public
router.post('/disconnect', async (req, res) => {
  try {
    await whatsappService.disconnect();
    res.json({
      success: true,
      message: 'WhatsApp disconnected successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect WhatsApp',
      error: error.message
    });
  }
});

module.exports = router;



