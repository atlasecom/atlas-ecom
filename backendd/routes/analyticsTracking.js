const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Event = require('../models/Event');
const Shop = require('../models/Shop');

// @desc    Track product view
// @route   POST /api/track/product/:id/view
// @access  Public
router.post('/product/:id/view', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, {
      $inc: { viewCount: 1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Track product view error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Track product WhatsApp click
// @route   POST /api/track/product/:id/whatsapp
// @access  Public
router.post('/product/:id/whatsapp', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, {
      $inc: { whatsappClicks: 1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Track product WhatsApp click error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Track product Telegram click
// @route   POST /api/track/product/:id/telegram
// @access  Public
router.post('/product/:id/telegram', async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, {
      $inc: { telegramClicks: 1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Track product Telegram click error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Track product favorite add
// @route   POST /api/track/product/:id/favorite
// @access  Public
router.post('/product/:id/favorite', async (req, res) => {
  try {
    const { action } = req.body; // 'add' or 'remove'
    await Product.findByIdAndUpdate(req.params.id, {
      $inc: { favoritesCount: action === 'add' ? 1 : -1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Track product favorite error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Track event view
// @route   POST /api/track/event/:id/view
// @access  Public
router.post('/event/:id/view', async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { viewCount: 1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Track event view error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Track event WhatsApp click
// @route   POST /api/track/event/:id/whatsapp
// @access  Public
router.post('/event/:id/whatsapp', async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { whatsappClicks: 1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Track event WhatsApp click error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Track event Telegram click
// @route   POST /api/track/event/:id/telegram
// @access  Public
router.post('/event/:id/telegram', async (req, res) => {
  try {
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { telegramClicks: 1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Track event Telegram click error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Track event favorite add
// @route   POST /api/track/event/:id/favorite
// @access  Public
router.post('/event/:id/favorite', async (req, res) => {
  try {
    const { action } = req.body; // 'add' or 'remove'
    await Event.findByIdAndUpdate(req.params.id, {
      $inc: { favoritesCount: action === 'add' ? 1 : -1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Track event favorite error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Track shop profile view
// @route   POST /api/track/shop/:id/profile-view
// @access  Public
router.post('/shop/:id/profile-view', async (req, res) => {
  try {
    await Shop.findByIdAndUpdate(req.params.id, {
      $inc: { profileViews: 1 }
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Track shop profile view error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

