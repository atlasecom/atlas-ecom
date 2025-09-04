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
    // For Render production, use a data URI (base64 encoded image)
    if (process.env.NODE_ENV === 'production') {
      // Use a base64 encoded placeholder image
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFM0U0RTYiLz4KPHN2ZyB4PSIxNzUiIHk9IjEyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgNTAgNTAiIGZpbGw9IiM5QzlDOTciPgo8cGF0aCBkPSJNMjUgMTBDMjcuNzYxNCAxMCAzMCAxMi4yMzg2IDMwIDE1QzMwIDE3Ljc2MTQgMjcuNzYxNCAyMCAyNSAyMEMyMi4yMzg2IDIwIDIwIDE3Ljc2MTQgMjAgMTVDMjAgMTIuMjM4NiAyMi4yMzg2IDEwIDI1IDEwWiIgZmlsbD0iIzlDOUM5NyIvPgo8cGF0aCBkPSJNMzUgMzBIMTVMMjUuMTggMjUuMTgyTDM1IDMwWiIgZmlsbD0iIzlDOUM5NyIvPgo8L3N2Zz4KPHRleHQgeD0iMjAwIiB5PSIyNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+';
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
