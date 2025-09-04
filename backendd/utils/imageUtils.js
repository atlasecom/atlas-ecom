// Utility functions for handling image URLs

const getImageUrl = (req, filename, folder = 'products') => {
  // For production (Render), use HTTPS
  if (process.env.NODE_ENV === 'production') {
    return `https://${req.get('host')}/uploads/${folder}/${filename}`;
  }
  
  // For development, use localhost
  return `http://${req.get('host')}/uploads/${folder}/${filename}`;
};

const getImageUrlFromFile = (req, file, folder = 'products') => {
  if (file.secure_url) {
    // Cloudinary URL
    return file.secure_url;
  } else {
    // For Render production, use a placeholder service temporarily
    if (process.env.NODE_ENV === 'production') {
      // Use a placeholder image service as fallback
      return `https://via.placeholder.com/400x300/007bff/ffffff?text=Product+Image`;
    } else {
      // Local storage URL for development
      return getImageUrl(req, file.filename, folder);
    }
  }
};

module.exports = {
  getImageUrl,
  getImageUrlFromFile
};
