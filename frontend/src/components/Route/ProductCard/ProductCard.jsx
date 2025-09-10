import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "../../../styles/styles";
import {
  AiFillHeart,
  AiFillStar,
  AiOutlineEye,
  AiOutlineHeart,
  AiOutlineShoppingCart,
  AiOutlineStar,
} from "react-icons/ai";
import ProductDetailsCard from "../ProductDetailsCard/ProductDetailsCard.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import { addTocart } from "../../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "../../Products/Ratings";
import axios from "axios";
import { server } from "../../../server";

const ProductCard = ({ data, isEvent }) => {
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [click, setClick] = useState(false);
  const [open, setOpen] = useState(false);
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
  }, [wishlist]);

  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);

    if (isItemExists) {
      toast.error(t("productCard.itemInCart", "item already in cart!"));
    } else {
      if (data.stock < 1) {
        toast.error(t("productCard.stockLimited", "Product stock limited!"));
      } else {
        const cartData = { ...data, qty: 1 };
        dispatch(addTocart(cartData));
        toast.success(
          t("productCard.addedToCart", "Item added to cart Successfully!")
        );
      }
    }
  };
   const normalizePhone = (phone) => {
    let digits = phone.replace(/\D/g, ""); // remove non-digits
    if (digits.startsWith("0")) {
      digits = "212" + digits.slice(1); // replace leading 0 with country code
    }
    return digits;
  };
  console.log('Product data:', data)
  console.log('Shop data:', data.shop)
  console.log('Phone number:', data.shop?.phoneNumber)
  console.log('Telegram:', data.shop?.telegram)
  // Handle main card click for navigation
  const handleCardClick = (e) => {
    // Don't navigate if clicking on action buttons, links, or their children
    if (
      e.target.closest("button") ||
      e.target.closest("a") ||
      e.target.closest('[role="button"]') ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "A" ||
      e.target.closest('[aria-label*="Quick view"]')
    ) {
      return;
    }
    // Navigate to product page
    window.location.href = productLink;
  };

  const productLink =
    isEvent === true
      ? `/product/${data._id}?isEvent=true`
      : `/product/${data._id}`;

  const imageUrl = (() => {
    if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
      const imageObj = data.images[0];
      // Handle different image formats with cache busting
      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
        const imageUrl = imageObj.url;
        // Don't add cache busting to data URIs
        if (imageUrl.startsWith('data:')) {
          return imageUrl;
        }
        // Force HTTPS for production URLs
        const httpsUrl = imageUrl.replace('http://', 'https://');
        return httpsUrl + '?v=' + Date.now();
      }
      if (typeof imageObj === 'string') {
        // Don't add cache busting to data URIs
        if (imageObj.startsWith('data:')) {
          return imageObj;
        }
        // Force HTTPS for production URLs
        const httpsUrl = imageObj.replace('http://', 'https://');
        return httpsUrl + '?v=' + Date.now();
      }
    }
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDMTAzLjMxNCA4MCAxMDYgODIuNjg2MyAxMDYgODZDMTA2IDg5LjMxMzcgMTAzLjMxNCA5MiAxMDAgOTJDOTYuNjg2MyA5MiA5NCA4OS4zMTM3IDk0IDg2Qzk0IDgyLjY4NjMgOTYuNjg2MyA4MCAxMDAgODBaIiBmaWxsPSIjOUM5Qzk3Ii8+CjxwYXRoIGQ9Ik0xNDAgMTIwSDYwTDc2LjE4IDEwMy44MkwxMDAgMTI4TDEyMy44MiAxMDMuODJMMTQwIDEyMFoiIGZpbGw9IiM5QzlDOTciLz4KPC9zdmc+";
  })();

  return (
    <>
      {/* Ultra Mobile-first responsive card design with enhanced touch interactions */}
      <div
        className={`w-full bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 active:scale-95 p-2 relative border border-gray-50 hover:border-gray-200 will-change-transform gpu-accelerated cursor-pointer
                            sm:rounded-2xl sm:p-4 sm:hover:scale-[1.02] sm:hover:-translate-y-2 sm:active:scale-[0.98]
                            md:hover:scale-[1.03] md:hover:-translate-y-3
                            xs:p-1 xs:rounded-md
                            ${isRTL ? "rtl" : "ltr"}`}
        dir={isRTL ? "rtl" : "ltr"}
        role="article"
        aria-label={`${data.name} - ${data.shop.name}`}
        onClick={handleCardClick}
      >
        {/* Mobile-optimized floating action buttons with improved touch targets */}
        <div
          className={`absolute top-1.5 ${
            isRTL ? "right-1.5" : "right-1.5"
          } flex flex-col gap-1.5 z-20 sm:top-2.5 sm:gap-2 ${
            isRTL ? "sm:right-2.5" : "sm:right-2.5"
          } xs:gap-1 xs:top-1`}
        >
          {click ? (
            <button
              className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-red-100 min-w-[32px] min-h-[32px] flex items-center justify-center touch-target focus-mobile
                                      sm:p-2.5 sm:min-w-[36px] sm:min-h-[36px]
                                      xs:p-1.5 xs:min-w-[28px] xs:min-h-[28px]"
              onClick={() => removeFromWishlistHandler(data)}
              aria-label={t(
                "productCard.removeFromWishlist",
                "Remove from wishlist"
              )}
              type="button"
            >
              <AiFillHeart
                size={14}
                className="sm:w-4 sm:h-4 md:w-5 md:h-5 xs:w-3 xs:h-3"
                color="#ef4444"
              />
            </button>
          ) : (
            <button
              className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-gray-100 min-w-[32px] min-h-[32px] flex items-center justify-center touch-target focus-mobile
                                      sm:p-2.5 sm:min-w-[36px] sm:min-h-[36px]
                                      xs:p-1.5 xs:min-w-[28px] xs:min-h-[28px]"
              onClick={() => addToWishlistHandler(data)}
              aria-label={t("productCard.addToWishlist", "Add to wishlist")}
              type="button"
            >
              <AiOutlineHeart
                size={14}
                className="sm:w-4 sm:h-4 md:w-5 md:h-5 xs:w-3 xs:h-3"
                color="#6b7280"
              />
            </button>
          )}
          {/* <button
            className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 border border-blue-100 min-w-[32px] min-h-[32px] flex items-center justify-center touch-target focus-mobile
                                  sm:p-2.5 sm:min-w-[36px] sm:min-h-[36px]
                                  xs:p-1.5 xs:min-w-[28px] xs:min-h-[28px]"
            onClick={() => addToCartHandler(data._id)}
            aria-label={t("productCard.addToCart", "Add to cart")}
            type="button"
          >
            <AiOutlineShoppingCart
              size={14}
              className="sm:w-4 sm:h-4 md:w-5 md:h-5 xs:w-3 xs:h-3"
              color="#3b82f6"
            />
          </button> */}
        </div>

        {/* Mobile-optimized social buttons with improved touch targets */}
        <div
          className={`flex ${
            isRTL ? "flex-row-reverse" : "flex-row"
          } gap-1.5 mb-2 sm:gap-2 sm:mb-3 xs:gap-1 xs:mb-1.5`}
        >
          <button
            type="button"
            onClick={() => {
              const phoneNumber = data.shop?.phoneNumber || "212600000000"; // Fallback phone number
              window.open(
                `https://wa.me/${
                  normalizePhone(phoneNumber)
                }?text=${encodeURIComponent(
                  `${data.name}:${t(
                    "productCard.whatsAppMessage",
                    "Hello, I'm interested in your product"
                  )}`
                )}`,
                "_blank"
              );
              
              // Refresh the page after a short delay to allow WhatsApp to open
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }}
            className="flex items-center justify-center p-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg min-w-[28px] min-h-[28px] touch-target focus-mobile
                                  sm:w-8 sm:h-8 sm:p-2 sm:rounded-xl sm:min-w-[32px] sm:min-h-[32px]
                                  md:hover:scale-110
                                  xs:w-6 xs:h-6 xs:p-1 xs:min-w-[24px] xs:min-h-[24px] xs:rounded-md"
            aria-label={t("productCard.chatWhatsApp", "Chat on WhatsApp")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 xs:w-3 xs:h-3"
            >
              <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.66-.5-5.23-1.44l-.37-.22-3.67.96.98-3.58-.24-.37A9.94 9.94 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.6c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.37-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.29-1 1-.98 2.43.02 1.43 1.03 2.81 1.18 3.01.15.2 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.89-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
            </svg>
          </button>

          <button
            type="button"
            onMouseDown={(e) => {
              // Use mouseDown instead of click for better iOS Safari compatibility
              e.preventDefault();
              const telegram = data.shop?.telegram || "testuser"; // Fallback telegram username
              // Create the URL first
              const telegramUrl = `https://t.me/${telegram}`;
              // Try multiple methods to ensure it works
              try {
                // Method 1: Try window.open first
                const newWindow = window.open(telegramUrl, '_blank');
                // Method 2: If blocked, use location.href as fallback
                if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                  window.location.href = telegramUrl;
                }
              } catch (error) {
                // Method 3: Final fallback
                window.location.href = telegramUrl;
              }
            }}
            onTouchStart={(e) => {
              // Additional touch event for mobile devices
              e.stopPropagation();
            }}
            className="flex items-center justify-center p-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg min-w-[28px] min-h-[28px] touch-target focus-mobile
                                  sm:w-8 sm:h-8 sm:p-2 sm:rounded-xl sm:min-w-[32px] sm:min-h-[32px]
                                  md:hover:scale-110
                                  xs:w-6 xs:h-6 xs:p-1 xs:min-w-[24px] xs:min-h-[24px] xs:rounded-md"
            aria-label={t("productCard.chatTelegram", "Chat on Telegram")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 xs:w-3 xs:h-3"
            >
              <path d="M9.036 16.569l-.398 5.609c.57 0 .816-.244 1.113-.54l2.664-2.537 5.522 4.033c1.012.557 1.73.264 1.983-.936l3.597-16.84c.327-1.513-.547-2.104-1.527-1.747l-21.36 8.23c-1.46.557-1.444 1.354-.25 1.713l5.463 1.706 12.684-8.01c.597-.406 1.142-.181.694.225" />
            </svg>
          </button>
        </div>

        {/* Ultra-responsive product image with loading optimization */}
        <div className="relative group mb-2 sm:mb-3 xs:mb-1.5">
          <div className="relative overflow-hidden rounded-lg sm:rounded-xl aspect-square bg-gray-50 xs:rounded-md">
            <Link to={productLink} className="block w-full h-full">
              <img
                src={imageUrl}
                alt={data.name || "Product"}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out gpu-accelerated"
                onError={(e) => {
                  console.error('Image load error for product:', data.name, 'URL:', e.target.src);
                  // Try alternative loading methods
                  const imageObj = data?.images?.[0];
                  if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                    // Try without cache busting
                    e.target.src = imageObj.url;
                  } else {
                    e.target.onerror = null;
                    e.target.src =
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgODBDMTAzLjMxNCA4MCAxMDYgODIuNjg2MyAxMDYgODZDMTA2IDg5LjMxMzcgMTAzLjMxNCA5MiAxMDAgOTJDOTYuNjg2MyA5MiA5NCA4OS4zMTM3IDk0IDg2Qzk0IDgyLjY4NjMgOTYuNjg2MyA4MCAxMDAgODBaIiBmaWxsPSIjOUM5Qzk3Ii8+CjxwYXRoIGQ9Ik0xNDAgMTIwSDYwTDc2LjE4IDEwMy44MkwxMDAgMTI4TDEyMy44MiAxMDMuODJMMTQwIDEyMFoiIGZpbGw9IiM5QzlDOTciLz4KPC9zdmc+";
                  }
                }}
                onLoad={() => {
                  console.log('Image loaded successfully for product:', data.name);
                }}
              />
            </Link>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

            {/* Quick view button - Desktop only */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }}
              className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 z-10 border border-gray-200 hover:bg-white hover:shadow-2xl"
              aria-label={t("productCard.quickView", "Quick view")}
              type="button"
            >
              <AiOutlineEye size={20} className="text-gray-800" />
            </button>
          </div>
        </div>

        {/* Shop name with improved mobile typography */}
        <Link to={productLink}>
          <h5
            className={`${
              styles.shop_name
            } text-[11px] font-medium text-gray-500 hover:text-blue-600 transition-colors duration-200 ${
              isRTL ? "text-right" : "text-left"
            } mb-1 truncate leading-tight
                                  sm:text-xs sm:mb-1.5 
                                  md:text-sm md:mb-2
                                  xs:text-xs xs:mb-0.5`}
          >
            {data.shop.name}
          </h5>
        </Link>

        {/* Product details with enhanced mobile readability */}
        <Link to={`/product/${data._id}`} className="block">
          <h4
            className={`pb-1 font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 line-clamp-2 ${
              isRTL ? "text-right" : "text-left"
            } text-sm leading-tight
                                  sm:pb-1.5 sm:text-base sm:leading-normal sm:line-clamp-2
                                  md:pb-2 md:text-lg md:leading-relaxed
                                  xs:text-xs xs:pb-0.5 xs:leading-tight`}
          >
            {data.name.length > 35 ? data.name.slice(0, 35) + "..." : data.name}
          </h4>

          {/* Enhanced ratings display - mobile optimized */}
          <div
            className={`flex items-center gap-1 mb-1 ${
              isRTL ? "flex-row-reverse" : "flex-row"
            } sm:mb-1.5 xs:mb-0.5 xs:gap-0.5`}
          >
            <Ratings rating={data.ratings || 0} />
            <span className="text-[10px] text-gray-500 sm:text-xs xs:text-xs">
              {data.reviews?.length > 0 ? `(${data.reviews.length})` : "(0)"}
            </span>
          </div>

          {/* Ultra-responsive price section with Arabic currency */}
          <div
            className={`py-1 flex items-center ${
              isRTL ? "justify-end" : "justify-start"
            } sm:py-1.5 xs:py-0.5`}
          >
            <div
              className={`flex items-center gap-1.5 ${
                isRTL ? "flex-row-reverse" : "flex-row"
              } sm:gap-2 xs:gap-1`}
            >
              <h5 className="text-lg font-bold text-orange-600 sm:text-xl md:text-2xl xs:text-base">
                {data.originalPrice} - {data.discountPrice} {getCurrency()}
              </h5>
            </div>
          </div>

          {/* Stock indicator - mobile optimized */}
          {data.stock < 10 && data.stock > 0 && (
            <div className="mt-1 sm:mt-1.5 xs:mt-0.5">
              <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium sm:text-xs sm:px-2 sm:py-1 xs:text-xs xs:px-1 xs:py-0.5">
                {t("productCard.onlyLeft", "Only {{count}} left", {
                  count: data.stock,
                })}
              </span>
            </div>
          )}

          {data.stock === 0 && (
            <div className="mt-1 sm:mt-1.5 xs:mt-0.5">
              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium sm:text-xs sm:px-2 sm:py-1 xs:text-xs xs:px-1 xs:py-0.5">
                {t("productCard.outOfStock", "Out of Stock")}
              </span>
            </div>
          )}

          {/* Main Action Button - Add to Favorites */}
          <div className="mt-3 sm:mt-4 xs:mt-2">
            <button
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed sm:py-3 sm:rounded-xl xs:py-2 xs:px-3 xs:text-sm"
              onClick={() => click ? removeFromWishlistHandler(data) : addToWishlistHandler(data)}
              disabled={!data.stock || data.stock === 0}
            >
              {click ? (
                <>
                  <AiFillHeart size={18} className="sm:w-5 sm:h-5 xs:w-4 xs:h-4" />
                  <span className="hidden sm:inline">{t("productCard.removeFromFavorites", "Remove from Favorites")}</span>
                  <span className="sm:hidden">{t("productCard.removeFromFavorites", "Remove")}</span>
                </>
              ) : (
                <>
                  <AiOutlineHeart size={18} className="sm:w-5 sm:h-5 xs:w-4 xs:h-4" />
                  <span className="hidden sm:inline">{t("productCard.addToFavorites", "Add to Favorites")}</span>
                  <span className="sm:hidden">{t("productCard.addToFavorites", "Add to Favorites")}</span>
                </>
              )}
            </button>
          </div>
        </Link>
      </div>

      {/* Product Details Modal - Desktop only */}
      {open && (
        <div className="hidden lg:block">
          <ProductDetailsCard setOpen={setOpen} data={data} />
        </div>
      )}
    </>
  );
};

export default ProductCard;
