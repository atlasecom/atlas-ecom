import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineHeart,
} from "react-icons/ai";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { toast } from "react-toastify";
import axios from "axios";
import CountDown from "./CountDown";
import { backend_url, server } from "../../server";
import BoostBadge from "../Common/BoostBadge";
import VerifiedBadge from "../Common/VerifiedBadge";

const EventCard = ({ data, isEvent = true }) => {
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

  // Early return if data is undefined or null
  if (!data || !data._id) {
    console.warn('EventCard: No data or missing _id', data);
    return null;
  }

  const removeFromWishlistHandler = async (data) => {
    if (!isAuthenticated) {
      toast.error(t("common.pleaseLogin", "Please login first!"));
      return;
    }
    
    try {
      await dispatch(removeFromWishlist(data._id));
      
      // Track favorite removal
      await axios.post(`${server}/api/track/event/${data._id}/favorite`, { action: 'remove' }).catch(err => 
        console.log('Analytics tracking failed:', err)
      );
      
      toast.success(t("eventCard.removedFromWishlist", "Removed from wishlist!"));
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      toast.error(error.response?.data?.message || t("eventCard.wishlistError", "Failed to remove from wishlist"));
    }
  };

  const addToWishlistHandler = async (data) => {
    if (!isAuthenticated) {
      toast.error(t("common.pleaseLogin", "Please login first!"));
      return;
    }
    
    try {
      await dispatch(addToWishlist(data._id));
      
      // Track favorite addition
      await axios.post(`${server}/api/track/event/${data._id}/favorite`, { action: 'add' }).catch(err => 
        console.log('Analytics tracking failed:', err)
      );
      
      toast.success(t("eventCard.addedToWishlist", "Added to wishlist!"));
    } catch (error) {
      console.error("Add to wishlist error:", error);
      toast.error(error.response?.data?.message || t("eventCard.wishlistError", "Failed to add to wishlist"));
    }
  };

  // WhatsApp handler
  const handleWhatsAppClick = async () => {
    try {
      if (data.shop?.phoneNumber) {
        // Track WhatsApp click
        await axios.post(`${server}/api/track/event/${data._id}/whatsapp`).catch(err => 
          console.log('Analytics tracking failed:', err)
        );
        
        const phoneNumber = data.shop.phoneNumber.replace(/\D/g, '');
        window.open(`https://wa.me/${phoneNumber}`, "_blank");
      } else {
        toast.error(
          t(
            "eventCard.noWhatsAppInfo",
            "Seller has not provided a WhatsApp number."
          )
        );
      }
    } catch (error) {
      console.error("WhatsApp error:", error);
      toast.error(t("common.whatsappError", "Failed to open WhatsApp"));
    }
  };

  // Telegram handler
  const handleTelegramClick = async () => {
    try {
      if (data.shop?.telegram) {
        // Track Telegram click
        await axios.post(`${server}/api/track/event/${data._id}/telegram`).catch(err => 
          console.log('Analytics tracking failed:', err)
        );
        
        const telegramUsername = data.shop.telegram.replace('@', '');
        window.open(`https://t.me/${telegramUsername}`, "_blank");
      } else {
        toast.error(
          t(
            "eventCard.noTelegramInfo",
            "Seller has not provided a Telegram username."
          )
        );
      }
    } catch (error) {
      console.error("Telegram error:", error);
      toast.error(t("common.telegramError", "Failed to open Telegram"));
    }
  };

  const eventLink = `/product/${data._id}?isEvent=true`;

  // Get image URL with multiple fallbacks and null checks
  const getImageUrl = () => {
    if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
      const imageObj = data.images[0];
      // Check if imageObj is an object with url property
      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
        const imageUrl = imageObj.url;
        if (typeof imageUrl === 'string' && imageUrl.startsWith("http")) {
          return imageUrl;
        }
        if (typeof imageUrl === 'string') {
          return `${backend_url.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
        }
      }
      // Fallback for old format where images might be direct strings
      if (typeof imageObj === 'string') {
        if (imageObj.startsWith("http")) {
          return imageObj;
        }
        return `${backend_url.replace(/\/$/, "")}/${imageObj.replace(/^\//, "")}`;
      }
    }
    return '/default-event.png';
  };

  // Safe access to data properties with fallbacks
  const eventName = data?.name || 'Event Name';
  const discountPrice = data?.discountPrice || 0;
  const originalPrice = data?.originalPrice || 0;
  const stock = data?.stock || 0;

  return (
    <div className={`w-full h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col border border-gray-100 hover:border-orange-200 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Clickable Link for entire card */}
      <Link to={eventLink} className="block flex-grow">
        {/* Image Container */}
        <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden cursor-pointer">
          <img
            src={getImageUrl()}
            alt={eventName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/default-event.png';
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
              <span className="text-xs sm:text-sm">{t("eventCard.outOfStock", "Out of Stock")}</span>
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
        <div className="p-3 sm:p-4 flex-grow flex flex-col">
          {/* Event Name */}
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2 text-xs sm:text-sm md:text-base leading-tight mb-1 sm:mb-2 group-hover:text-blue-600 cursor-pointer">
            {eventName.length > 40 ? eventName.slice(0, 40) + "..." : eventName}
          </h3>

          {/* Enhanced Countdown Timer Section */}
          <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 shadow-sm">
            <CountDown data={data} t={t} isRTL={isRTL} />
          </div>

          {/* Price */}
          <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            <span className="text-sm sm:text-lg font-bold text-orange-600">
              {originalPrice} - {discountPrice} {getCurrency()}
            </span>
          </div>

          {/* Stock Indicator */}
          {stock < 10 && stock > 0 && (
            <div className="mb-2 sm:mb-3">
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-md">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs">{t("eventCard.onlyLeft", "Only {{count}} left", { count: stock })}</span>
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Action Buttons */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1.5 sm:space-y-3">
        {/* Add to Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            click ? removeFromWishlistHandler(data) : addToWishlistHandler(data);
          }}
          className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 transform hover:scale-[1.02] ${
            click 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl' 
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-xl'
          }`}
        >
          {click ? (
            <AiFillHeart size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <AiOutlineHeart size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
          <span className="text-xs sm:text-sm font-semibold">
            {click ? t("eventCard.removeFromWishlist", "Remove") : t("eventCard.addToWishlist", "Add to wishlist")}
          </span>
        </button>

        {/* WhatsApp and Telegram Buttons - Dynamic based on availability */}
        <div className="flex gap-1.5 sm:gap-2 min-w-0">
          {/* WhatsApp Button - Always show if phone number is available */}
          {data.shop?.phoneNumber && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWhatsAppClick();
              }}
              className={`${
                data.shop?.telegram ? 'flex-1' : 'w-full'
              } bg-green-500 hover:bg-green-600 text-white py-2 sm:py-2.5 px-2 sm:px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] min-w-0 overflow-hidden`}
            >
              <FaWhatsapp className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold truncate">{t("common.whatsapp", "WhatsApp")}</span>
            </button>
          )}
          
          {/* Telegram Button - Only show if telegram is available */}
          {data.shop?.telegram && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTelegramClick();
              }}
              className={`${
                data.shop?.phoneNumber ? 'flex-1' : 'w-full'
              } bg-blue-500 hover:bg-blue-600 text-white py-2 sm:py-2.5 px-2 sm:px-3 md:px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 md:gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] min-w-0 overflow-hidden`}
            >
              <FaTelegram className="w-4 h-4 sm:w-5 sm:h-5 text-white flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold truncate">{t("common.telegram", "Telegram")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;