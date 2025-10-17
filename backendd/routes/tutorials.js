const express = require("express");
const router = express.Router();
const Tutorial = require("../models/Tutorial");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const { getImageUrlFromFile } = require("../utils/imageUtils");

// ============================================
// ADMIN ROUTES - Create, Update, Delete
// ============================================

// Create tutorial (Admin only)
router.post("/admin/create", protect, authorize('admin'), upload.single("thumbnail"), async (req, res) => {
  try {
    const { title, titleAr, titleFr, description, descriptionAr, descriptionFr, videoUrl, category, duration, order } = req.body;

    console.log('📝 Creating tutorial with data:', {
      title,
      hasFile: !!req.file,
      fileDetails: req.file ? {
        filename: req.file.filename,
        public_id: req.file.public_id,
        secure_url: req.file.secure_url
      } : null
    });

    let thumbnailData = {};
    
    // Handle thumbnail upload
    if (req.file) {
      console.log('🖼️ Processing thumbnail upload...');
      const thumbnailUrl = getImageUrlFromFile(req, req.file, 'tutorials');
      console.log('✅ Thumbnail URL generated:', thumbnailUrl);
      
      thumbnailData = {
        public_id: req.file.public_id || req.file.filename,
        url: thumbnailUrl
      };
    }

    const tutorial = await Tutorial.create({
      title,
      titleAr,
      titleFr,
      description,
      descriptionAr,
      descriptionFr,
      videoUrl,
      thumbnail: thumbnailData,
      category,
      duration,
      order: order || 0,
      createdBy: req.user._id
    });

    console.log('✅ Tutorial created successfully:', tutorial._id);

    res.status(201).json({
      success: true,
      message: "Tutorial created successfully",
      tutorial
    });
  } catch (error) {
    console.error("❌ Create tutorial error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create tutorial"
    });
  }
});

// Get all tutorials (Admin)
router.get("/admin/all", protect, authorize('admin'), async (req, res) => {
  try {
    const tutorials = await Tutorial.find()
      .populate("createdBy", "name email")
      .sort({ category: 1, order: 1, createdAt: -1 });

    res.json({
      success: true,
      tutorials,
      total: tutorials.length
    });
  } catch (error) {
    console.error("Get tutorials error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tutorials"
    });
  }
});

// Update tutorial (Admin only)
router.put("/admin/:id", protect, authorize('admin'), upload.single("thumbnail"), async (req, res) => {
  try {
    const { title, titleAr, titleFr, description, descriptionAr, descriptionFr, videoUrl, category, duration, order, isActive } = req.body;

    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found"
      });
    }

    // Update fields
    if (title) tutorial.title = title;
    if (titleAr !== undefined) tutorial.titleAr = titleAr;
    if (titleFr !== undefined) tutorial.titleFr = titleFr;
    if (description) tutorial.description = description;
    if (descriptionAr !== undefined) tutorial.descriptionAr = descriptionAr;
    if (descriptionFr !== undefined) tutorial.descriptionFr = descriptionFr;
    if (videoUrl) tutorial.videoUrl = videoUrl;
    if (category) tutorial.category = category;
    if (duration) tutorial.duration = duration;
    if (order !== undefined) tutorial.order = order;
    if (isActive !== undefined) tutorial.isActive = isActive;

    // Handle new thumbnail upload
    if (req.file) {
      console.log('🖼️ Updating thumbnail...');
      const thumbnailUrl = getImageUrlFromFile(req, req.file, 'tutorials');
      console.log('✅ New thumbnail URL generated:', thumbnailUrl);
      
      tutorial.thumbnail = {
        public_id: req.file.public_id || req.file.filename,
        url: thumbnailUrl
      };
    }

    await tutorial.save();

    res.json({
      success: true,
      message: "Tutorial updated successfully",
      tutorial
    });
  } catch (error) {
    console.error("Update tutorial error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update tutorial"
    });
  }
});

// Delete tutorial (Admin only)
router.delete("/admin/:id", protect, authorize('admin'), async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found"
      });
    }

    await Tutorial.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Tutorial deleted successfully"
    });
  } catch (error) {
    console.error("Delete tutorial error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete tutorial"
    });
  }
});

// ============================================
// SELLER/USER ROUTES - View Tutorials
// ============================================

// Get all active tutorials (Sellers/Users)
router.get("/all", protect, async (req, res) => {
  try {
    const { category } = req.query;
    
    const query = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }

    const tutorials = await Tutorial.find(query)
      .select('-createdBy')
      .sort({ category: 1, order: 1, createdAt: -1 });

    // Group by category
    const groupedTutorials = tutorials.reduce((acc, tutorial) => {
      const cat = tutorial.category || 'other';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(tutorial);
      return acc;
    }, {});

    res.json({
      success: true,
      tutorials,
      groupedTutorials,
      total: tutorials.length
    });
  } catch (error) {
    console.error("Get tutorials error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tutorials"
    });
  }
});

// Get single tutorial by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const tutorial = await Tutorial.findById(req.params.id);
    
    if (!tutorial) {
      return res.status(404).json({
        success: false,
        message: "Tutorial not found"
      });
    }

    if (!tutorial.isActive && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "This tutorial is not available"
      });
    }

    // Increment views
    tutorial.views += 1;
    await tutorial.save();

    res.json({
      success: true,
      tutorial
    });
  } catch (error) {
    console.error("Get tutorial error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tutorial"
    });
  }
});

module.exports = router;

