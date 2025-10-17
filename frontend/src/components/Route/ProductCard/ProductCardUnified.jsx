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

const ProductCard = ({ data, isEvent, isShop = false }) => {
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

      dispatch(removeFromWishlist(productId));
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

      dispatch(addToWishlist(data));
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

  const handleWhatsAppClick = () => {
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
  };

  const handleTelegramClick = () => {
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
    <div className={`w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group min-w-0 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Image Container */}
      <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
        <img
          src={getImageUrl()}
          alt={productName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = isEvent ? '/default-event.png' : '/default-product.png';
          }}
        />
        
        {/* Discount Badge */}
        {originalPrice > discountPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round(((originalPrice - discountPrice) / originalPrice) * 100)}%
          </div>
        )}

        {/* Stock Status Badge */}
        {stock === 0 && (
          <div className="absolute top-2 left-2 bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {t("productCard.outOfStock", "Out of Stock")}
          </div>
        )}

        {/* Wishlist Button */}
        {!isShop && (
          <button
            onClick={() => click ? removeFromWishlistHandler(data) : addToWishlistHandler(data)}
            className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-colors duration-200"
          >
            {click ? (
              <AiFillHeart className="text-red-500" size={16} />
            ) : (
              <AiOutlineHeart className="text-gray-600" size={16} />
            )}
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 min-w-0">
        {/* Product Name */}
        <Link to={productLink} className="block group">
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2 text-sm sm:text-base leading-tight mb-2 group-hover:text-blue-600">
            {productName.length > 50 ? productName.slice(0, 50) + "..." : productName}
          </h3>
        </Link>

        {/* Boost and Verified Badges */}
        <div className={`flex flex-wrap gap-1 mb-2 ${isRTL ? "justify-end" : "justify-start"}`}>
          {data.isBoosted && (
            <BoostBadge type="sponsored" size="xs" />
          )}
          {data.shop?.verifiedBadge && (
            <VerifiedBadge size="xs" />
          )}
        </div>

        {/* Ratings */}
        <div className="flex items-center gap-1 mb-2 min-w-0">
          <div className="flex-shrink-0 min-w-0">
            <Ratings rating={ratings} />
          </div>
          <span className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0 whitespace-nowrap">
            {reviews.length > 0 ? `(${reviews.length})` : "(0)"}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-orange-600">
            {discountPrice} {getCurrency()}
          </span>
          {originalPrice > discountPrice && (
            <span className="text-sm text-gray-500 line-through">
              {originalPrice} {getCurrency()}
            </span>
          )}
        </div>

        {/* Stock Indicator */}
        {stock < 10 && stock > 0 && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-md">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              {t("productCard.onlyLeft", "Only {{count}} left", { count: stock })}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {!isShop && (
          <div className="flex gap-2">
            <button
              onClick={handleWhatsAppClick}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <FaWhatsapp size={12} />
              <span className="hidden sm:inline">{t("common.whatsapp", "WhatsApp")}</span>
            </button>
            <button
              onClick={handleTelegramClick}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1"
            >
              <FaTelegram size={12} />
              <span className="hidden sm:inline">{t("common.telegram", "Telegram")}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
