import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  AiFillHeart,
  AiOutlineEye,
  AiOutlineHeart,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import CountDown from "./CountDown";
import { backend_url } from "../../server";

const EventCard = ({ data, isEvent = true }) => {
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

  // Early return if data is undefined or null
  if (!data || !data._id) {
    console.warn('EventCard: No data or missing _id', data);
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
    <>
      <div className="w-full bg-white rounded-xl xl:rounded-2xl shadow-md hover:shadow-lg xl:hover:shadow-xl 2xl:hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 xl:border-gray-200 2xl:border-gray-300 group xl:group-hover:scale-[1.01] 2xl:group-hover:scale-[1.02]">
        {/* Image Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Link to={eventLink} className="block">
            <img
              src={getImageUrl()}
              alt={eventName}
              className="w-full h-32 sm:h-36 lg:h-40 xl:h-40 2xl:h-40 object-cover group-hover:scale-105 xl:group-hover:scale-110 2xl:group-hover:scale-110 transition-transform duration-700 ease-out bg-white"
              onError={(e) => {
                console.log('Image failed to load:', e.target.src);
                e.target.src = '/default-event.png';
                e.target.onerror = null;
              }}
              loading="lazy"
            />
          </Link>

          {/* Quick Actions Overlay */}
          <div className="absolute top-1 right-1 xl:top-2 xl:right-2 2xl:top-2 2xl:right-2 flex flex-col gap-1 xl:gap-1.5 2xl:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-3 group-hover:translate-y-0">
            {/* Quick View Button */}
            <Link to={eventLink}>
              <button
                className="bg-white/95 backdrop-blur-sm rounded-full p-1.5 xl:p-2 2xl:p-2.5 shadow-md hover:shadow-lg xl:hover:shadow-xl 2xl:hover:shadow-2xl transition-all duration-300 hover:scale-110 xl:hover:scale-115 2xl:hover:scale-120 active:scale-95 border-0 min-w-[28px] min-h-[28px] xl:min-w-[32px] xl:min-h-[32px] 2xl:min-w-[36px] 2xl:min-h-[36px] flex items-center justify-center hover:bg-blue-50 xl:hover:bg-blue-100"
                aria-label={t("eventCard.quickView", "Quick view")}
              >
                <AiOutlineEye size={12} className="xl:w-3 xl:h-3 2xl:w-4 2xl:h-4 text-gray-700 group-hover:text-blue-600 xl:group-hover:text-blue-700 transition-colors duration-300" />
              </button>
            </Link>
          </div>

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
                {t("eventCard.outOfStock", "Out of Stock")}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-2 sm:p-3 xl:p-3 2xl:p-4">
          {/* Event Name */}
          <Link to={eventLink} className="block group">
            <h4 className="font-bold text-gray-900 hover:text-orange-600 transition-colors duration-300 line-clamp-2 text-sm sm:text-base xl:text-base 2xl:text-lg leading-tight mb-1.5 sm:mb-2 xl:mb-2 2xl:mb-3 group-hover:text-orange-600">
              {eventName && typeof eventName === 'string' && eventName.length > 40 ? eventName.slice(0, 40) + "..." : eventName}
            </h4>
          </Link>

          {/* Enhanced Countdown Timer Section */}
          <div className="mb-2 sm:mb-3 xl:mb-3 2xl:mb-4 p-2 sm:p-2.5 xl:p-3 2xl:p-3.5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg xl:rounded-xl 2xl:rounded-2xl border border-orange-200 shadow-sm xl:shadow-sm 2xl:shadow-md">
            <CountDown data={data} t={t} isRTL={isRTL} />
          </div>

          {/* Price Section */}
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
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 xl:w-2.5 xl:h-2.5 bg-orange-500 rounded-full animate-pulse"></div>
                {t("eventCard.onlyLeft", "Only {{count}} left", {
                  count: stock,
                })}
              </span>
            </div>
          )}

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
              <div className={`absolute inset-0 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-500 ${
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
                    <span className="font-bold text-xs sm:text-xs xl:text-xs 2xl:text-sm tracking-wide">{t("eventCard.removeFromFavorites", "Remove from Favorites")}</span>
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
                    <span className="font-bold text-xs sm:text-xs xl:text-xs 2xl:text-sm tracking-wide">{t("eventCard.addToFavorites", "Add to Favorites")}</span>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventCard;
