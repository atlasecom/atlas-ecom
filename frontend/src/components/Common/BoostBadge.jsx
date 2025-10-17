import React from 'react';

const BoostBadge = ({ type = 'sponsored', size = 'sm', className = '' }) => {
  const getBadgeConfig = () => {
    switch (type) {
      case 'sponsored':
        return {
          image: '/Sponsored.png',
          alt: 'Sponsorisé'
        };
      case 'verified':
        return {
          image: '/trustedseller.png',
          alt: 'Vendeur Vérifié'
        };
      case 'boosted':
        return {
          image: '/Sponsored.png',
          alt: 'Boosté'
        };
      default:
        return {
          image: '/Sponsored.png',
          alt: 'Premium'
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    xs: 'w-8 h-4 sm:w-10 sm:h-5',
    sm: 'w-10 h-5 sm:w-12 sm:h-6',
    md: 'w-12 h-6 sm:w-16 sm:h-8',
    lg: 'w-16 h-8 sm:w-20 sm:h-10',
    xl: 'w-20 h-10 sm:w-24 sm:h-12',
  };

  return (
    <div className={`${sizeClasses[size]} relative group ${className}`}>
      <img
        src={config.image}
        alt={config.alt}
        className="w-full h-full object-contain drop-shadow-md hover:drop-shadow-lg transition-all duration-200"
        title={config.alt}
      />
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </div>
  );
};

export default BoostBadge;
