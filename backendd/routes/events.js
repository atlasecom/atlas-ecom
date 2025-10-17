const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const Event = require('../models/Event');
const Shop = require('../models/Shop');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { getImageUrlFromFile } = require('../utils/imageUtils');

const router = express.Router();

// @desc    Track WhatsApp/Telegram clicks for events
// @route   POST /api/events/:id/track-click
// @access  Public
router.post('/:id/track-click', async (req, res) => {
  try {
    const { type } = req.body; // 'whatsapp' or 'telegram'
    
    if (!type || !['whatsapp', 'telegram'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid click type. Must be "whatsapp" or "telegram"' 
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Initialize click tracking if not exists
    if (!event.clickTracking) {
      event.clickTracking = {
        whatsapp: 0,
        telegram: 0,
        total: 0
      };
    }

    // Increment click count
    event.clickTracking[type]++;
    event.clickTracking.total++;

    // Check if boost clicks are exhausted
    if (event.isBoosted && event.boostClicksRemaining) {
      event.boostClicksRemaining--;
      
      // If clicks exhausted, remove boost
      if (event.boostClicksRemaining <= 0) {
        event.isBoosted = false;
        event.boostPriority = 0;
        event.boostExpiresAt = null;
        event.boostClicksRemaining = 0;
      }
    }

    await event.save();

    res.json({ 
      success: true, 
      message: 'Click tracked successfully',
      clicksRemaining: event.boostClicksRemaining || 0,
      isBoosted: event.isBoosted
    });

  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
    
    // For testing: show all events including upcoming ones
    // TODO: Re-enable date filtering in production
    // const currentDate = new Date();
    // query.$or = [
    //   { start_Date: { $exists: false } }, // Events without start date
    //   { start_Date: { $lte: currentDate } } // Events that have started
    // ];
    
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
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

    // Get all events first to implement dynamic sorting
    const allEvents = await Event.find(query)
      .populate('shop', 'name avatar phoneNumber telegram verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image');

    // Separate boosted and normal events
    const boostedEvents = allEvents.filter(event => event.isBoosted);
    const normalEvents = allEvents.filter(event => !event.isBoosted);

    // Sort boosted events by priority (highest first)
    boostedEvents.sort((a, b) => {
      if (a.boostPriority !== b.boostPriority) {
        return b.boostPriority - a.boostPriority;
      }
      // If same priority, sort by start date
      return new Date(a.start_Date) - new Date(b.start_Date);
    });

    // Sort normal events randomly for dynamic ordering using Fisher-Yates shuffle
    for (let i = normalEvents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [normalEvents[i], normalEvents[j]] = [normalEvents[j], normalEvents[i]];
    }

    // Combine: boosted first, then normal events
    const sortedEvents = [...boostedEvents, ...normalEvents];

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const events = sortedEvents.slice(startIndex, endIndex);

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
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image')
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
  body('subcategory').notEmpty().withMessage('Subcategory is required'),
  body('start_Date').isISO8601().withMessage('Start date must be a valid date'),
  body('Finish_Date').isISO8601().withMessage('Finish date must be a valid date'),
  body('originalPrice').isNumeric().withMessage('Original price must be numeric'),
  body('discountPrice').optional().isNumeric().withMessage('Discount price must be numeric'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minOrderQuantity').optional().isInt({ min: 1 }).withMessage('Minimum order quantity must be at least 1'),
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

    const { name, description, category, subcategory, start_Date, Finish_Date, originalPrice, discountPrice, stock, minOrderQuantity } = req.body;

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
      subcategory,
      start_Date: new Date(start_Date),
      Finish_Date: new Date(Finish_Date),
      originalPrice: parseFloat(originalPrice),
      discountPrice: discountPrice ? parseFloat(discountPrice) : parseFloat(originalPrice),
      stock: parseInt(stock),
      minOrderQuantity: parseInt(minOrderQuantity) || 1,
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

    // Handle image updates
    console.log('🔍 Event image update debug:', {
      hasFiles: req.files && req.files.length > 0,
      filesCount: req.files ? req.files.length : 0,
      hasImagesToKeep: !!updateData.imagesToKeep,
      imagesToKeepValue: updateData.imagesToKeep,
      currentImagesCount: event.images ? event.images.length : 0
    });

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
      
      console.log('🔍 New event images to add:', newImages);
      
      // If imagesToKeep is provided, use it; otherwise keep all existing images and add new ones
      if (updateData.imagesToKeep) {
        try {
          const imagesToKeep = JSON.parse(updateData.imagesToKeep);
          console.log('🔍 Event images to keep:', imagesToKeep);
          
          const existingImages = (event.images || []).filter(img => 
            imagesToKeep.some(keepImg => keepImg.public_id === img.public_id)
          );
          
          console.log('🔍 Filtered existing event images:', existingImages);
          updateData.images = [...existingImages, ...newImages];
        } catch (error) {
          console.error('Error parsing imagesToKeep:', error);
          // Fallback: keep all existing images and add new ones
          updateData.images = [...(event.images || []), ...newImages];
        }
      } else {
        // Keep all existing images and add new ones
        updateData.images = [...(event.images || []), ...newImages];
      }
    } else if (updateData.imagesToKeep) {
      // No new images uploaded, but images were removed
      try {
        const imagesToKeep = JSON.parse(updateData.imagesToKeep);
        console.log('🔍 No new event files, images to keep:', imagesToKeep);
        
        const existingImages = (event.images || []).filter(img => 
          imagesToKeep.some(keepImg => keepImg.public_id === img.public_id)
        );
        
        console.log('🔍 Final event images after removal:', existingImages);
        updateData.images = existingImages;
      } catch (error) {
        console.error('Error parsing imagesToKeep:', error);
        // Keep existing images if parsing fails
        updateData.images = event.images || [];
      }
    } else {
      // No new images and no imagesToKeep - keep existing images
      console.log('🔍 No event image changes, keeping existing images');
      updateData.images = event.images || [];
    }
    
    console.log('🔍 Final updateData.images for event:', updateData.images);
    
    // Remove imagesToKeep from updateData as it's not an event field
    delete updateData.imagesToKeep;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('shop', 'name avatar phoneNumber telegram')
     .populate('category', 'name nameAr nameFr image')
     .populate('subcategory', 'name nameAr nameFr image');

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

// @desc    Add event review
// @route   POST /api/events/:id/reviews
// @access  Private (Authenticated users)
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
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

    const { rating, comment } = req.body;
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user already reviewed this event
    const existingReview = event.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this event'
      });
    }

    // Add the review
    const review = {
      user: req.user._id,
      rating: parseInt(rating),
      comment: comment.trim(),
      createdAt: new Date()
    };

    event.reviews.push(review);

    // Calculate average rating
    const totalRating = event.reviews.reduce((sum, review) => sum + review.rating, 0);
    event.ratings = totalRating / event.reviews.length;

    await event.save();

    // Populate the user field in the new review
    await event.populate('reviews.user', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: event.reviews[event.reviews.length - 1]
    });
  } catch (error) {
    console.error('Add event review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
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

// @desc    Track event view
// @route   POST /api/events/:id/view
// @access  Public
router.post('/:id/view', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment view count
    event.viewCount = (event.viewCount || 0) + 1;
    await event.save();

    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking view',
      error: error.message
    });
  }
});

// @desc    Track WhatsApp click
// @route   POST /api/events/:id/whatsapp-click
// @access  Public
router.post('/:id/whatsapp-click', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Increment WhatsApp clicks
    event.whatsappClicks = (event.whatsappClicks || 0) + 1;
    await event.save();

    res.json({
      success: true,
      message: 'WhatsApp click tracked successfully'
    });
  } catch (error) {
    console.error('Track WhatsApp click error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking WhatsApp click',
      error: error.message
    });
  }
});

module.exports = router;
