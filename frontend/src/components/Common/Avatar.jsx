import React from 'react';
import { backend_url } from '../../server';

const Avatar = ({ user, size = 'md', className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-6 h-6 text-xs';
      case 'sm': return 'w-8 h-8 text-sm';
      case 'md': return 'w-10 h-10 text-base';
      case 'lg': return 'w-12 h-12 text-lg';
      case 'xl': return 'w-16 h-16 text-xl';
      case '2xl': return 'w-20 h-20 text-2xl';
      default: return 'w-10 h-10 text-base';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getColorClass = (name) => {
    if (!name) return 'bg-gray-500';
    
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500'
    ];
    
    const colorIndex = name.charCodeAt(0) % colors.length;
    return colors[colorIndex];
  };

  // Get the proper avatar URL
  const getAvatarUrl = () => {
    if (user?.avatar) {
      let avatarUrl = null;
      
      // Handle avatar object with url property
      if (typeof user.avatar === 'object' && user.avatar.url) {
        avatarUrl = user.avatar.url;
      }
      // Handle avatar as direct string
      else if (typeof user.avatar === 'string') {
        avatarUrl = user.avatar;
      }
      
      // If we have a valid avatar URL that's not the default
      if (avatarUrl && avatarUrl !== 'https://res.cloudinary.com/atlas-ecom/image/upload/v1/default-avatar') {
        // If it's a relative path, prepend backend URL
        if (avatarUrl.startsWith('/uploads/')) {
          return `${backend_url}${avatarUrl}`;
        }
        // If it's already a full URL, use it as is
        if (avatarUrl.startsWith('http')) {
          return avatarUrl;
        }
        // If it's just a filename, construct the full path
        if (!avatarUrl.startsWith('/') && !avatarUrl.startsWith('http')) {
          return `${backend_url}/uploads/avatars/${avatarUrl}`;
        }
      }
    }
    return null;
  };

  const avatarUrl = getAvatarUrl();
  
  if (avatarUrl) {
    return (
      <>
        <img
          src={avatarUrl}
          alt={`${user?.name || 'User'} avatar`}
          className={`${getSizeClasses()} rounded-full object-cover ${className}`}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Hidden fallback that shows when image fails */}
        <div
          className={`${getSizeClasses()} ${getColorClass(user?.name)} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
          style={{ display: 'none' }}
        >
          {getInitials(user?.name)}
        </div>
      </>
    );
  }

  // Fallback to initials avatar
  return (
    <div
      className={`${getSizeClasses()} ${getColorClass(user?.name)} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {getInitials(user?.name)}
    </div>
  );
};

export default Avatar;
