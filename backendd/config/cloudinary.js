const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
                               process.env.CLOUDINARY_API_KEY &&
                               process.env.CLOUDINARY_API_SECRET;

let upload;

if (isCloudinaryConfigured) {
  console.log('✅ Using Cloudinary for image storage');
  
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Configure Cloudinary Storage for multer
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'atlas-ecom', // Folder name in Cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 800, height: 600, crop: 'limit' }, // Auto-resize images
        { quality: 'auto' }, // Auto-optimize quality
        { fetch_format: 'auto' } // Auto-optimize format
      ],
      // Ensure secure_url is generated
      use_filename: true,
      unique_filename: true,
      // Force HTTPS URLs
      secure: true
    }
  });

  // Create multer upload middleware
  upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });
} else {
  console.log('⚠️ Cloudinary not configured, using local storage fallback');
  
  // Fallback to local storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads/products';
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });
}

module.exports = {
  cloudinary: isCloudinaryConfigured ? cloudinary : null,
  upload
};
