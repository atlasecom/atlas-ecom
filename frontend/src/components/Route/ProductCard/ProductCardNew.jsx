import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AiFillHeart,
  AiOutlineHeart,
} from "react-icons/ai";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";

import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import Ratings from "../../Products/Ratings";
import { server } from "../../../server";
import { toast } from "react-toastify";

const ProductCard = ({ data, isEvent }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [click, setClick] = useState(false);
  const dispatch = useDispatch();

  // Get currency symbol based on language
  const getCurrency = () => {
    return isRTL ? "درهم" : "dh";
  };

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === data._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist, data._id]);

  // Early return if data is undefined or null (AFTER all hooks)
  if (!data) {
    return null;
  }

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  // Phone number normalization for WhatsApp (Morocco +212)
  const normalizePhone = (phone) => {
    let digits = phone.replace(/\D/g, ""); // remove non-digits
    
    // If number starts with 0, replace with 212 (Morocco country code)
    if (digits.startsWith("0")) {
      digits = "212" + digits.slice(1);
    }
    // If number doesn't start with 212, add it (Morocco country code)
    else if (!digits.startsWith("212")) {
      digits = "212" + digits;
    }
    
    return digits;
  };

  // WhatsApp handler
  const handleWhatsAppClick = () => {
    console.log('WhatsApp clicked, shop data:', data.shop);
    
    if (data.shop?.phoneNumber) {
      const normalizedPhone = normalizePhone(data.shop.phoneNumber);
      console.log('Normalized phone:', normalizedPhone);
      window.open(
        `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(
          `${data.name}: ${t(
            "productCard.whatsAppMessage",
            "Hello, I'm interested in your product"
          )}`
        )}`,
        "_blank"
      );
    } else {
      console.log('No phone number found');
      toast.error(
        t(
          "productCard.noPhoneNumber",
          "Seller has not provided a phone number for WhatsApp."
        )
      );
    }
  };

  // Telegram handler
  const handleTelegramClick = () => {
    if (data.shop?.telegram) {
      window.open(`https://t.me/${data.shop.telegram}`, "_blank");
    } else {
      toast.error(
        t(
          "productCard.noTelegramInfo",
          "Seller has not provided a Telegram username."
        )
      );
    }
  };

  const productLink = isEvent === true
    ? `/product/${data._id}?isEvent=true`
    : `/product/${data._id}`;

  // Get image URL with multiple fallbacks and null checks
  const getImageUrl = () => {
    if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
      const imageObj = data.images[0];
      // Handle different image formats with cache busting
      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
        const imageUrl = imageObj.url;
        if (typeof imageUrl === 'string') {
          // Don't add cache busting to data URIs
          if (imageUrl.startsWith('data:')) {
            return imageUrl;
          }
          if (imageUrl.startsWith("http")) {
            // Force HTTPS for production URLs
            const httpsUrl = imageUrl.replace('http://', 'https://');
            return httpsUrl + '?v=' + Date.now();
          }
          // For relative paths like /uploads/events/filename.jpg
          const baseUrl = server.replace(/\/$/, "").replace('http://', 'https://');
          return `${baseUrl}${imageUrl}?v=${Date.now()}`;
        }
      }
      if (typeof imageObj === 'string') {
        // Don't add cache busting to data URIs
        if (imageObj.startsWith('data:')) {
          return imageObj;
        }
        if (imageObj.startsWith("http")) {
          // Force HTTPS for production URLs
          const httpsUrl = imageObj.replace('http://', 'https://');
          return httpsUrl + '?v=' + Date.now();
        }
        // For direct string paths
        const baseUrl = server.replace(/\/$/, "").replace('http://', 'https://');
        return `${baseUrl}/${imageObj.replace(/^\//, "")}?v=${Date.now()}`;
      }
    }
    if (data?.image) {
      const imageObj = data.image;
      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
        const imageUrl = imageObj.url;
        if (typeof imageUrl === 'string') {
          // Don't add cache busting to data URIs
          if (imageUrl.startsWith('data:')) {
            return imageUrl;
          }
          if (imageUrl.startsWith("http")) {
            // Force HTTPS for production URLs
            const httpsUrl = imageUrl.replace('http://', 'https://');
            return httpsUrl + '?v=' + Date.now();
          }
          const baseUrl = server.replace(/\/$/, "").replace('http://', 'https://');
          return `${baseUrl}${imageUrl}?v=${Date.now()}`;
        }
      }
      if (typeof imageObj === 'string') {
        // Don't add cache busting to data URIs
        if (imageObj.startsWith('data:')) {
          return imageObj;
        }
        if (imageObj.startsWith("http")) {
          // Force HTTPS for production URLs
          const httpsUrl = imageObj.replace('http://', 'https://');
          return httpsUrl + '?v=' + Date.now();
        }
        const baseUrl = server.replace(/\/$/, "").replace('http://', 'https://');
        return `${baseUrl}/${imageObj.replace(/^\//, "")}?v=${Date.now()}`;
      }
    }
    return isEvent ? '/default-event.png' : '/default-product.png';
  };

  // Safe access to data properties with fallbacks
  const productName = data?.name || 'Product Name';
  const productId = data?._id || '';
  const discountPrice = data?.discountPrice || 0;
  const originalPrice = data?.originalPrice || 0;
  const stock = data?.stock || 0;
  const ratings = data?.ratings || 0;
  const reviews = data?.reviews || [];

  // Debug logging for seller data (can be removed after testing)
  console.log('Product:', productName, 'Shop phone:', data.shop?.phoneNumber, 'Telegram:', data.shop?.telegram);

  return (
    <>
      <div className="w-full bg-white rounded-xl xl:rounded-2xl shadow-md hover:shadow-lg xl:hover:shadow-xl 2xl:hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 xl:border-gray-200 2xl:border-gray-300 group xl:group-hover:scale-[1.01] 2xl:group-hover:scale-[1.02]">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Link to={productLink} className="block">
            <img
              src={getImageUrl()}
              alt={productName}
              className="w-full h-32 sm:h-36 lg:h-40 xl:h-40 2xl:h-40 object-cover group-hover:scale-105 xl:group-hover:scale-110 2xl:group-hover:scale-110 transition-transform duration-700 ease-out bg-white"
              onError={(e) => {
                console.error('Image load error for product:', productName, 'URL:', e.target.src);
                // Try alternative loading methods
                const imageObj = data?.images?.[0];
                if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                  // Try without cache busting
                  const imageUrl = imageObj.url;
                  if (typeof imageUrl === 'string' && imageUrl.startsWith("http")) {
                    e.target.src = imageUrl;
                  } else if (typeof imageUrl === 'string') {
                    e.target.src = `${server.replace(/\/$/, "")}${imageUrl}`;
                  } else {
                    e.target.src = isEvent ? '/default-event.png' : '/default-product.png';
                  }
                } else {
                  e.target.src = isEvent ? '/default-event.png' : '/default-product.png';
                  e.target.onerror = null;
                }
              }}
              onLoad={() => {
                console.log('Image loaded successfully for product:', productName);
              }}
              loading="lazy"
            />
          </Link>



          {/* Discount Badge */}
          {originalPrice > 0 && originalPrice > discountPrice && (
            <div className="absolute top-1 left-1 xl:top-2 xl:left-2 2xl:top-2 2xl:left-2">
              <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white text-xs xl:text-xs 2xl:text-sm font-bold px-2 py-0.5 xl:px-2.5 xl:py-1 2xl:px-3 2xl:py-1.5 rounded-full shadow-md xl:shadow-lg 2xl:shadow-xl">
                -
                {Math.round(
                  ((originalPrice - discountPrice) / originalPrice) * 100
                )}
                %
              </span>
            </div>
          )}

          {/* Stock Status Badge */}
          {stock === 0 && (
            <div className="absolute top-1 left-1 xl:top-2 xl:left-2 2xl:top-2 2xl:left-2">
              <span className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white text-xs xl:text-xs 2xl:text-sm font-bold px-2 py-0.5 xl:px-2.5 xl:py-1 2xl:px-3 2xl:py-1.5 rounded-full shadow-md xl:shadow-lg 2xl:shadow-xl">
                {t("productCard.outOfStock", "Out of Stock")}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-2 sm:p-3 xl:p-3 2xl:p-4">
          {/* Product Name */}
          <Link to={productLink} className="block group">
            <h4 className="font-bold text-gray-900 hover:text-orange-600 transition-colors duration-300 line-clamp-2 text-sm sm:text-base xl:text-base 2xl:text-lg leading-tight mb-1.5 sm:mb-2 xl:mb-2 2xl:mb-3 group-hover:text-orange-600">
              {productName && typeof productName === 'string' && productName.length > 40 ? productName.slice(0, 40) + "..." : productName}
            </h4>

            {/* Ratings */}
            <div className="flex items-center gap-1 xl:gap-1.5 2xl:gap-2 mb-1.5 sm:mb-2 xl:mb-2 2xl:mb-3">
              <Ratings rating={ratings || 0} />
              <span className="text-xs sm:text-xs xl:text-xs 2xl:text-sm text-gray-500 font-medium">
                {Array.isArray(reviews) && reviews.length > 0 ? `(${reviews.length})` : "(0)"}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-1 sm:gap-1.5 xl:gap-2 2xl:gap-3 mb-1.5 sm:mb-2 xl:mb-2 2xl:mb-3">
              <h5 className="text-lg sm:text-xl xl:text-xl 2xl:text-2xl font-bold text-gray-900">
                {discountPrice} {getCurrency()}
              </h5>
              {originalPrice > 0 && originalPrice > discountPrice && (
                <h4 className="text-sm sm:text-base xl:text-base 2xl:text-lg text-gray-400 line-through font-medium">
                  {originalPrice} {getCurrency()}
                </h4>
              )}
            </div>

            {/* Stock Indicator */}
            {stock < 10 && stock > 0 && (
              <div className="mb-2 sm:mb-3 xl:mb-3 2xl:mb-4">
                <span className="inline-flex items-center gap-1 xl:gap-1.5 2xl:gap-2 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 text-xs sm:text-xs xl:text-xs 2xl:text-sm font-medium px-2 sm:px-2.5 xl:px-3 2xl:px-4 py-0.5 sm:py-1 xl:py-1.5 2xl:py-2 rounded-md xl:rounded-lg 2xl:rounded-xl border border-orange-200 shadow-sm xl:shadow-sm 2xl:shadow-md">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  {t("productCard.onlyLeft", "Only {{count}} left", {
                    count: stock,
                  })}
                </span>
              </div>
            )}
          </Link>

          {/* Professional Favorites Button */}
          <div className="mt-2 sm:mt-3 xl:mt-3 2xl:mt-4">
            <button
              className={`w-full font-bold py-2 sm:py-2.5 xl:py-2.5 2xl:py-3 px-2 sm:px-3 xl:px-3 2xl:px-4 rounded-lg xl:rounded-lg 2xl:rounded-xl transition-all duration-500 hover:shadow-md xl:hover:shadow-lg 2xl:hover:shadow-xl active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 xl:gap-1.5 2xl:gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group border-0 ${
                click 
                  ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white shadow-md xl:shadow-lg 2xl:shadow-xl' 
                  : 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white shadow-md xl:shadow-lg 2xl:shadow-xl'
              }`}
              onClick={() => click ? removeFromWishlistHandler(data) : addToWishlistHandler(data)}
              disabled={!stock || stock === 0}
            >
              {/* Enhanced Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              
              {/* Subtle Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl xl:rounded-3xl 2xl:rounded-4xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-500 ${
                click ? 'bg-red-400' : 'bg-orange-400'
              }`}></div>
              
              {click ? (
                <>
                  <div className="relative z-10 flex items-center gap-1 sm:gap-1.5 xl:gap-1.5 2xl:gap-2">
                    <div className="relative">
                      <AiFillHeart size={14} className="sm:w-4 sm:h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-red-100 drop-shadow-sm" />
                      <div className="absolute inset-0 bg-red-300 rounded-full blur-md opacity-40 animate-ping"></div>
                      <div className="absolute inset-0 bg-red-200 rounded-full blur-sm opacity-60 animate-pulse"></div>
                    </div>
                    <span className="font-bold text-xs sm:text-xs xl:text-xs 2xl:text-sm tracking-wide">{t("productCard.removeFromFavorites", "Remove from Favorites")}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative z-10 flex items-center gap-1 sm:gap-1.5 xl:gap-1.5 2xl:gap-2">
                    <div className="relative">
                      <AiOutlineHeart size={14} className="sm:w-4 sm:h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-orange-100 drop-shadow-sm" />
                      <div className="absolute inset-0 bg-orange-300 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                      <div className="absolute inset-0 bg-orange-200 rounded-full blur-sm opacity-40 group-hover:opacity-60 transition-all duration-500"></div>
                    </div>
                    <span className="font-bold text-xs sm:text-xs xl:text-xs 2xl:text-sm tracking-wide">{t("productCard.addToFavorites", "Add to Favorites")}</span>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* WhatsApp and Telegram Buttons */}
          <div className="mt-2 sm:mt-3 xl:mt-3 2xl:mt-4 flex gap-2">
            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppClick}
              className="flex-1 font-bold py-1 sm:py-1.5 xl:py-2 2xl:py-2.5 px-2 sm:px-2.5 xl:px-3 2xl:px-4 rounded-md xl:rounded-lg 2xl:rounded-xl transition-all duration-300 hover:shadow-md xl:hover:shadow-lg 2xl:hover:shadow-xl active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 xl:gap-1.5 2xl:gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group border-0 bg-gradient-to-br from-green-500 via-green-600 to-green-700 hover:from-green-600 hover:via-green-700 hover:to-green-800 text-white shadow-sm xl:shadow-lg 2xl:shadow-xl min-h-[28px] sm:min-h-[36px] touch-manipulation"
            >
              {/* Enhanced Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              
              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 rounded-md xl:rounded-lg 2xl:rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-500 bg-green-400"></div>
              
              <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 xl:gap-1.5 2xl:gap-2 w-full">
                <FaWhatsapp size={10} className="sm:w-3 sm:h-3 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 text-green-100 drop-shadow-sm flex-shrink-0" />
                <span className="font-medium text-xs tracking-wide text-center">WhatsApp</span>
              </div>
            </button>

            {/* Telegram Button */}
            <button
              onClick={handleTelegramClick}
              className="flex-1 font-bold py-1 sm:py-1.5 xl:py-2 2xl:py-2.5 px-2 sm:px-2.5 xl:px-3 2xl:px-4 rounded-md xl:rounded-lg 2xl:rounded-xl transition-all duration-300 hover:shadow-md xl:hover:shadow-lg 2xl:hover:shadow-xl active:scale-95 flex items-center justify-center gap-1 sm:gap-1.5 xl:gap-1.5 2xl:gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group border-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white shadow-sm xl:shadow-lg 2xl:shadow-xl min-h-[28px] sm:min-h-[36px] touch-manipulation"
            >
              {/* Enhanced Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              
              {/* Subtle Glow Effect */}
              <div className="absolute inset-0 rounded-md xl:rounded-lg 2xl:rounded-xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-500 bg-blue-400"></div>
              
              <div className="relative z-10 flex items-center justify-center gap-1 sm:gap-1.5 xl:gap-1.5 2xl:gap-2 w-full">
                <FaTelegram size={10} className="sm:w-3 sm:h-3 xl:w-4 xl:h-4 2xl:w-5 2xl:h-5 text-blue-100 drop-shadow-sm flex-shrink-0" />
                <span className="font-medium text-xs tracking-wide text-center">Telegram</span>
              </div>
            </button>
          </div>
        </div>
      </div>




    </>
  );
};

export default ProductCard;
