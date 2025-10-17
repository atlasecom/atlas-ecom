import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AiFillHeart,
  AiOutlineHeart,
} from "react-icons/ai";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import axios from "axios";

import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import Ratings from "../../Products/Ratings";
import { server } from "../../../server";
import { toast } from "react-toastify";
import BoostBadge from "../../Common/BoostBadge";
import VerifiedBadge from "../../Common/VerifiedBadge";

const ProductCard = ({ data, isEvent }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.user);
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

  const removeFromWishlistHandler = async (data) => {
    if (!isAuthenticated) {
      toast.error(t("common.pleaseLogin", "Please login first!"));
      return;
    }

    try {
      const productId = data._id || data.id || data.productId;
      if (!productId) {
        console.error("No valid product ID found");
        toast.error(t("common.error", "An error occurred"));
        return;
      }

      dispatch(removeFromWishlist(data._id));
      setClick(false);
      toast.success(t("common.removedFromWishlist", "Removed from wishlist!"));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error(t("common.error", "An error occurred"));
    }
  };

  const addToWishlistHandler = async (data) => {
    if (!isAuthenticated) {
      toast.error(t("common.pleaseLogin", "Please login first!"));
      return;
    }

    try {
      const productId = data._id || data.id || data.productId;
      if (!productId) {
        console.error("No valid product ID found");
        toast.error(t("common.error", "An error occurred"));
        return;
      }

      dispatch(addToWishlist(data._id));
      setClick(true);
      toast.success(t("common.addedToWishlist", "Added to wishlist!"));
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error(t("common.error", "An error occurred"));
    }
  };

  // Normalize phone number for WhatsApp
  const normalizePhone = (phone) => {
    if (!phone) return "";
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, "");
    // Add country code if not present
    if (cleaned.startsWith("0")) {
      cleaned = "212" + cleaned.substring(1);
    } else if (!cleaned.startsWith("212")) {
      cleaned = "212" + cleaned;
    }
    return cleaned;
  };

  const handleWhatsAppClick = async () => {
    if (!data.shop?.phoneNumber) {
      toast.error(t("productCard.noPhoneNumber", "Phone number not available"));
      return;
    }
    
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
    
    // Track click
    try {
      await axios.post(`/api/products/${data._id}/track-click`, {
        type: 'whatsapp'
      });
    } catch (error) {
      console.error('Error tracking WhatsApp click:', error);
    }
  };

  const handleTelegramClick = async () => {
    if (!data.shop?.telegram) {
      toast.error(t("productCard.noTelegram", "Telegram not available"));
      return;
    }
    
    const telegramUrl = data.shop.telegram.startsWith('@') 
      ? `https://t.me/${data.shop.telegram.substring(1)}`
      : data.shop.telegram.startsWith('http')
      ? data.shop.telegram
      : `https://t.me/${data.shop.telegram}`;
    
    window.open(telegramUrl, "_blank");
    
    // Track click
    try {
      await axios.post(`/api/products/${data._id}/track-click`, {
        type: 'telegram'
      });
    } catch (error) {
      console.error('Error tracking Telegram click:', error);
    }
  };

  // Get product image URL
  const getImageUrl = () => {
    if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
      const imageObj = data.images[0];
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
  const originalPrice = data?.originalPrice || data?.price || 0;
  const discountPrice = data?.discountPrice || data?.price || 0;
  const stock = data?.stock || 0;
  const ratings = data?.ratings || 0;
  const reviews = data?.reviews || [];
  const productLink = isEvent ? `/event/${data._id}` : `/product/${data._id}`;

  return (
    <div className={`w-full h-full bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col min-w-0 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Clickable Link for entire card */}
      <Link to={productLink} className="block flex-grow">
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden cursor-pointer">
        <img
          src={getImageUrl()}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = isEvent ? '/default-event.png' : '/default-product.png';
          }}
        />
        
        {/* Discount Badge - Top Right */}
        {originalPrice > discountPrice && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg shadow-xl border border-red-400 z-20 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-center">
              <span className="text-white font-black drop-shadow-sm text-xs sm:text-sm">
                -{Math.round(((originalPrice - discountPrice) / originalPrice) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Stock Status Badge - Top Right */}
        {stock === 0 && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-gradient-to-br from-gray-600 to-gray-700 text-white text-xs font-bold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg shadow-lg border border-gray-500 z-20">
            <span className="text-xs sm:text-sm">{t("productCard.outOfStock", "Out of Stock")}</span>
          </div>
        )}

        {/* Floating Badges on Image - Top Left */}
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex flex-col gap-1 z-10">
          {data.isBoosted && (
            <div className="bg-white/95 backdrop-blur-sm rounded-md sm:rounded-lg p-1 sm:p-1.5 shadow-lg border border-yellow-200">
              <BoostBadge type="sponsored" size="xs" />
            </div>
          )}
          {data.shop?.verifiedBadge && (
            <div className="bg-white/95 backdrop-blur-sm rounded-md sm:rounded-lg p-1 sm:p-1.5 shadow-lg border border-blue-200">
              <VerifiedBadge size="xs" />
            </div>
          )}
        </div>
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-4 flex-grow flex flex-col min-w-0">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2 text-xs sm:text-sm md:text-base leading-tight mb-1 sm:mb-2 group-hover:text-blue-600 cursor-pointer">
            {productName.length > 40 ? productName.slice(0, 40) + "..." : productName}
          </h3>


        {/* Ratings */}
        <div className="flex items-center gap-1 mb-1 sm:mb-2 min-w-0">
          <div className="flex-shrink-0 min-w-0">
            <Ratings rating={ratings} />
          </div>
          <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0 whitespace-nowrap">
            {reviews.length > 0 ? `(${reviews.length})` : "(0)"}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
          <span className="text-sm sm:text-lg font-bold text-orange-600">
            {discountPrice} {getCurrency()}
          </span>
          {originalPrice > discountPrice && (
            <span className="text-xs sm:text-sm text-gray-500 line-through">
              {originalPrice} {getCurrency()}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {stock < 10 && stock > 0 && (
          <div className="mb-2 sm:mb-3">
            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-md">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-xs">{t("productCard.onlyLeft", "Only {{count}} left", { count: stock })}</span>
            </span>
          </div>
        )}

        </div>
      </Link>

      {/* Action Buttons - Outside the clickable area */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-3">
        {/* Add to Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            click ? removeFromWishlistHandler(data) : addToWishlistHandler(data);
          }}
          className={`w-full py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 ${
            click 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg'
          }`}
        >
          {click ? (
            <AiFillHeart size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <AiOutlineHeart size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <span className="text-xs sm:text-sm font-semibold">
            {click ? t("productCard.removeFromWishlist", "Remove") : t("productCard.addToWishlist", "Add to wishlist")}
          </span>
        </button>

        {/* WhatsApp and Telegram Buttons */}
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleWhatsAppClick();
            }}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-0.5 sm:py-2.5 px-1.5 sm:px-3 rounded-lg sm:rounded-l-lg transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg"
          >
            <FaWhatsapp size={14} className="hidden sm:block w-4 h-4 text-white" />
            <span className="text-xs sm:text-sm font-medium">{t("common.whatsapp", "WhatsApp")}</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTelegramClick();
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-0.5 sm:py-2.5 px-1.5 sm:px-3 rounded-lg sm:rounded-r-lg transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2 shadow-md hover:shadow-lg"
          >
            <FaTelegram size={14} className="hidden sm:block w-4 h-4 text-white" />
            <span className="text-xs sm:text-sm font-medium">{t("common.telegram", "Telegram")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
