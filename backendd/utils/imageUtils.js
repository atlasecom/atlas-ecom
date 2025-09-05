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
  console.log('🔍 getImageUrlFromFile called with:', {
    hasSecureUrl: !!file.secure_url,
    hasFilename: !!file.filename,
    publicId: file.public_id,
    folder: folder,
    nodeEnv: process.env.NODE_ENV,
    fullFile: file
  });

  // Check if this is a Cloudinary response (has public_id and secure_url)
  if (file.public_id && file.secure_url) {
    console.log('✅ Using Cloudinary URL:', file.secure_url);
    return file.secure_url;
  }
  
  // Check if this is a Cloudinary response but missing secure_url (generate it)
  if (file.public_id && !file.secure_url) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName) {
      // Generate Cloudinary URL with transformations
      const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/c_limit,h_600,q_auto,w_800,f_auto/${file.public_id}`;
      console.log('🔧 Generated Cloudinary URL for public_id:', file.public_id);
      console.log('🔧 Generated URL:', cloudinaryUrl);
      return cloudinaryUrl;
    } else {
      console.log('⚠️ Cloudinary cloud name not found, falling back to placeholder');
    }
  }

  // Check if we have a Cloudinary path but missing public_id and secure_url
  if (file.path && file.path.includes('res.cloudinary.com') && !file.public_id && !file.secure_url) {
    console.log('🔧 Using Cloudinary path directly:', file.path);
    return file.path;
  }

  // Fallback to local storage or placeholder
  if (file.filename) {
    // Local storage URL for development
    const localUrl = getImageUrl(req, file.filename, folder);
    console.log('🔧 Using local storage URL:', localUrl);
    return localUrl;
  } else {
    // For Render production, use a data URI (base64 encoded image)
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️ Using placeholder image for production (no Cloudinary)');
      // Use a base64 encoded placeholder image
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFM0U0RTYiLz4KPHN2ZyB4PSIxNzUiIHk9IjEyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgNTAgNTAiIGZpbGw9IiM5QzlDOTciPgo8cGF0aCBkPSJNMjUgMTBDMjcuNzYxNCAxMCAzMCAxMi4yMzg2IDMwIDE1QzMwIDE3Ljc2MTQgMjcuNzYxNCAyMCAyNSAyMEMyMi4yMzg2IDIwIDIwIDE3Ljc2MTQgMjAgMTVDMjAgMTIuMjM4NiAyMi4yMzg2IDEwIDI1IDEwWiIgZmlsbD0iIzlDOUM5NyIvPgo8cGF0aCBkPSJNMzUgMzBIMTVMMjUuMTggMjUuMTgyTDM1IDMwWiIgZmlsbD0iIzlDOUM5NyIvPgo8L3N2Zz4KPHRleHQgeD0iMjAwIiB5PSIyNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+';
    } else {
      console.log('⚠️ No file information available');
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI1MCIgd2lkdGg9IjMwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFM0U0RTYiLz4KPHN2ZyB4PSIxNzUiIHk9IjEyNSIgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiB2aWV3Qm94PSIwIDAgNTAgNTAiIGZpbGw9IiM5QzlDOTciPgo8cGF0aCBkPSJNMjUgMTBDMjcuNzYxNCAxMCAzMCAxMi4yMzg2IDMwIDE1QzMwIDE3Ljc2MTQgMjcuNzYxNCAyMCAyNSAyMEMyMi4yMzg2IDIwIDIwIDE3Ljc2MTQgMjAgMTVDMjAgMTIuMjM4NiAyMi4yMzg2IDEwIDI1IDEwWiIgZmlsbD0iIzlDOUM5NyIvPgo8cGF0aCBkPSJNMzUgMzBIMTVMMjUuMTggMjUuMTgyTDM1IDMwWiIgZmlsbD0iIzlDOUM5NyIvPgo8L3N2Zz4KPHRleHQgeD0iMjAwIiB5PSIyNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2QjcyODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+';
    }
  }
};

module.exports = {
  getImageUrl,
  getImageUrlFromFile
};
