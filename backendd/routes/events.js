const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const Event = require('../models/Event');
const Shop = require('../models/Shop');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { getImageUrlFromFile } = require('../utils/imageUtils');

const router = express.Router();

// Function to automatically delete expired events
const deleteExpiredEvents = async () => {
  try {
    const now = new Date();
    const expiredEvents = await Event.find({
      Finish_Date: { $lt: now },
      isActive: true
    });

    if (expiredEvents.length > 0) {
      console.log(`Found ${expiredEvents.length} expired events to delete`);
      
      // Delete expired events
      const deleteResult = await Event.deleteMany({
        Finish_Date: { $lt: now },
        isActive: true
      });

      console.log(`Successfully deleted ${deleteResult.deletedCount} expired events`);
      return deleteResult.deletedCount;
    }
    return 0;
  } catch (error) {
    console.error('Error deleting expired events:', error);
    return 0;
  }
};

// Cloudinary upload is configured in ../config/cloudinary.js

// @desc    Get all events
// @route   GET /api/events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status, shop } = req.query;
    
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (shop) {
      query.shop = shop;
    }

    const events = await Event.find(query)
      .populate('shop', 'name avatar phoneNumber telegram')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ start_Date: 1 });

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('shop', 'name avatar description')
      .populate('reviews.user', 'name avatar');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
});

// @desc    Create event
// @route   POST /api/events
// @access  Private (Seller)
router.post('/', protect, authorize('seller'), upload.array('images', 5), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Event name must be between 2 and 100 characters'),
  body('description').notEmpty().withMessage('Description is required').isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('category').notEmpty().withMessage('Category is required'),
  body('start_Date').isISO8601().withMessage('Start date must be a valid date'),
  body('Finish_Date').isISO8601().withMessage('Finish date must be a valid date'),
  body('originalPrice').isNumeric().withMessage('Original price must be numeric'),
  body('discountPrice').optional().isNumeric().withMessage('Discount price must be numeric'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minOrderQuantity').optional().isInt({ min: 1 }).withMessage('Minimum order quantity must be at least 1'),
  body('tags').optional().isString().withMessage('Tags must be a string')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, category, start_Date, Finish_Date, originalPrice, discountPrice, stock, tags, minOrderQuantity } = req.body;

    // Check if user has a shop
    if (!req.user.shop) {
      return res.status(400).json({
        success: false,
        message: 'You must have a shop to create events'
      });
    }

    // Prepare event data
    const eventData = {
      name,
      description,
      category,
      start_Date: new Date(start_Date),
      Finish_Date: new Date(Finish_Date),
      originalPrice: parseFloat(originalPrice),
      discountPrice: discountPrice ? parseFloat(discountPrice) : parseFloat(originalPrice),
      stock: parseInt(stock),
      minOrderQuantity: parseInt(minOrderQuantity) || 1,
      tags: tags || "",
      shop: req.user.shop,
      status: 'Upcoming'
    };

    // Add images if uploaded
    if (req.files && req.files.length > 0) {
      eventData.images = req.files.map(file => {
        console.log('🔍 Processing event image:', {
          public_id: file.public_id,
          secure_url: file.secure_url,
          filename: file.filename,
          path: file.path
        });
        
        const imageUrl = getImageUrlFromFile(req, file, 'events');
        console.log('🔍 Generated event image URL:', imageUrl);
        
        return {
          public_id: file.public_id || file.filename,
          url: imageUrl
        };
      });
    }

    // Create event
    const event = await Event.create(eventData);
    await event.populate('shop', 'name avatar phoneNumber telegram');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Event owner or Admin)
router.put('/:id', protect, upload.array('images', 5), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Event name must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('start_Date').optional().isISO8601().withMessage('Start date must be a valid date'),
  body('Finish_Date').optional().isISO8601().withMessage('Finish date must be a valid date'),
  body('originalPrice').optional().isNumeric().withMessage('Original price must be numeric'),
  body('discountPrice').optional().isNumeric().withMessage('Discount price must be numeric'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.shop.toString() !== req.user.shop?.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event'
      });
    }

    const updateData = { ...req.body };
    
    // Convert dates if provided
    if (updateData.start_Date) {
      updateData.start_Date = new Date(updateData.start_Date);
    }
    if (updateData.Finish_Date) {
      updateData.Finish_Date = new Date(updateData.Finish_Date);
    }
    
    // Convert numbers if provided
    if (updateData.originalPrice) {
      updateData.originalPrice = parseFloat(updateData.originalPrice);
    }
    if (updateData.discountPrice) {
      updateData.discountPrice = parseFloat(updateData.discountPrice);
    }
    if (updateData.stock) {
      updateData.stock = parseInt(updateData.stock);
    }

    // Add new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => {
        console.log('🔍 Processing event update image:', {
          public_id: file.public_id,
          secure_url: file.secure_url,
          filename: file.filename,
          path: file.path
        });
        
        const imageUrl = getImageUrlFromFile(req, file, 'events');
        console.log('🔍 Generated event update image URL:', imageUrl);
        
        return {
          public_id: file.public_id || file.filename,
          url: imageUrl
        };
      });
      
      // Keep existing images and add new ones
      updateData.images = [...(event.images || []), ...newImages];
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('shop', 'name avatar phoneNumber telegram');

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Event owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ownership
    if (event.shop.toString() !== req.user.shop?.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
});

// @desc    Get shop events
// @route   GET /api/events/shop/:shopId
// @access  Public
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { shop: req.params.shopId, isActive: true };
    
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('shop', 'name avatar phoneNumber telegram')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ start_Date: 1 });

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get shop events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop events',
      error: error.message
    });
  }
});

module.exports = router;
