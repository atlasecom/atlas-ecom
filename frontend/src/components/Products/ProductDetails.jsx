import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/styles";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineMessage,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { backend_url, server } from "../../server";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../redux/actions/wishlist";
import { addTocart } from "../../redux/actions/cart";
import { toast } from "react-toastify";
import Ratings from "./Ratings";
import { useTranslation } from "react-i18next";
import Avatar from "../Common/Avatar";
import Loader from "../Layout/Loader";
import { useCategories } from "../../hooks/useCategories";
import axios from "axios";
import BoostBadge from "../Common/BoostBadge";
import VerifiedBadge from "../Common/VerifiedBadge";

const ProductDetails = ({ data, isEvent = false }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { cart } = useSelector((state) => state.cart);
  const { allProducts } = useSelector((state) => state.products);
  const { allEvents } = useSelector((state) => state.events);
  const dispatch = useDispatch();

  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(0);

  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  
  // Use dynamic categories from API
  const { categories, subcategories, getCategoryById, getSubcategoryById } = useCategories();

  // Debug product data
  useEffect(() => {
    if (data) {
      console.log('🔍 Product Data:', data);
      console.log('📦 Category:', data.category);
      console.log('📦 Category Type:', typeof data.category);
      console.log('📦 Subcategory:', data.subcategory);
      console.log('📦 Subcategory Type:', typeof data.subcategory);
    }
  }, [data]);

  // Helper function to get internationalized category name
  const getCategoryName = (categoryData) => {
    if (!categoryData) return t("common.unknownCategory", "Unknown Category");
    
    // If category is already populated (object)
    if (typeof categoryData === 'object' && categoryData !== null) {
      return i18n.language === 'ar' ? categoryData.nameAr : 
             i18n.language === 'fr' ? categoryData.nameFr : 
             categoryData.name || categoryData.nameEn;
    }
    
    // If category is just an ID (string), fetch from hook
    const category = getCategoryById(categoryData);
    if (!category) {
      console.warn('Category not found for ID:', categoryData);
      return t("common.unknownCategory", "Unknown Category");
    }
    
    return i18n.language === 'ar' ? category.nameAr : 
           i18n.language === 'fr' ? category.nameFr : 
           category.name;
  };

  // Helper function to get internationalized subcategory name
  const getSubcategoryName = (subcategoryData) => {
    if (!subcategoryData) return null;
    
    // If subcategory is already populated (object)
    if (typeof subcategoryData === 'object' && subcategoryData !== null) {
      return i18n.language === 'ar' ? subcategoryData.nameAr : 
             i18n.language === 'fr' ? subcategoryData.nameFr : 
             subcategoryData.name || subcategoryData.nameEn;
    }
    
    // If subcategory is just an ID (string), fetch from hook
    const subcategory = getSubcategoryById(subcategoryData);
    if (!subcategory) {
      console.warn('Subcategory not found for ID:', subcategoryData);
      return null;
    }
    
    return i18n.language === 'ar' ? subcategory.nameAr : 
           i18n.language === 'fr' ? subcategory.nameFr : 
           subcategory.name;
  };

  // Helper function to format currency based on language
  const formatCurrency = (amount) => {
    const currency = t("common.currency", "DH");
    if (i18n.language === "ar") {
      return `${amount} ${currency}`;
    } else {
      return `${amount} ${currency}`;
    }
  };

  // Helper function to format dates based on language
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    if (i18n.language === "ar") {
      // Arabic months with regular digits
      const arabicMonths = [
        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر",
      ];

      const arabicDays = [
        "الأحد",
        "الاثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
      ];

      const dayName = arabicDays[date.getDay()];
      const day = date.getDate();
      const month = arabicMonths[date.getMonth()];
      const year = date.getFullYear();

      return `${dayName}، ${day} ${month} ${year}`;
    } else {
      // English format
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // Helper function to get image URL with cache busting
  const getImageUrl = (image) => {
    if (!image) return "/default-product.png";
    
    let imageUrl;
    if (typeof image === "string") {
      imageUrl = image;
    } else if (image && image.url) {
      imageUrl = image.url;
    } else {
      return "/default-product.png";
    }

    // Don't process data URIs - return them as-is
    if (imageUrl.startsWith('data:')) {
      console.log("Generated image URL (data URI):", imageUrl);
      return imageUrl;
    }

    // Force HTTPS for production URLs
    if (imageUrl && imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://');
    }

    // Handle relative URLs by adding backend URL
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
      imageUrl = `/${imageUrl}`;
    }
    
    if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
      const baseUrl = backend_url.replace(/\/$/, "").replace('http://', 'https://');
      imageUrl = `${baseUrl}${imageUrl}`;
    }
    
    // Add cache busting parameter for regular URLs
    const finalUrl = `${imageUrl}?v=${Date.now()}`;
    console.log("Generated image URL:", finalUrl);
    return finalUrl;
  };

  // Helper function to handle image error
  const handleImageError = (e, image) => {
    console.error("Image failed to load:", image);
    
    // Try to reload without cache busting
    if (typeof image === "string") {
      e.target.src = image;
    } else if (image && image.url) {
      e.target.src = image.url;
    } else {
      e.target.src = "/default-product.png";
    }
  };



  // Check if item is in wishlist
  const isInWishlist = wishlist?.find((item) => item?._id === data?._id);

  // Check if item is in cart
  const isInCart = cart?.find((item) => item?._id === data?._id);

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error(t("common.pleaseLogin", "Please login first!"));
      return;
    }

    if (!data?._id) {
      toast.error(t("common.productNotFound", "Product not found!"));
      return;
    }

    if (isInWishlist) {
      dispatch(removeFromWishlist(data._id));
      toast.success(t("common.removedFromWishlist", "Removed from wishlist!"));
    } else {
      dispatch(addToWishlist(data));
      toast.success(t("common.addedToWishlist", "Added to wishlist!"));
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error(t("common.pleaseLogin", "Please login first!"));
      return;
    }

    if (!data?._id) {
      toast.error(t("common.productNotFound", "Product not found!"));
      return;
    }

    const cartData = {
      ...data,
      qty: 1,
    };
    dispatch(addTocart(cartData));
    toast.success(t("common.addedToCart", "Added to cart!"));
  };


  



  // Track view when component mounts
  useEffect(() => {
    if (data?._id) {
      const trackView = async () => {
        try {
          const endpoint = isEvent 
            ? `${server}/events/${data._id}/view`
            : `${server}/products/${data._id}/view`;
          
          await axios.post(endpoint);
        } catch (error) {
          console.error('Error tracking view:', error);
        }
      };
      
      trackView();
    }
  }, [data?._id, isEvent]);

  // Countdown timer for events
  useEffect(() => {
    if (!isEvent || !data?.Finish_Date) return;

    const timer = setInterval(() => {
      setCountdown(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isEvent, data?.Finish_Date]);

  // Debug logging
  console.log("ProductDetails - Data received:", data);
  console.log("ProductDetails - Images:", data?.images);
  console.log("ProductDetails - Is Event:", isEvent);

  if (!data) {
    return <Loader />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      <div className="w-[95%] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 sm:mb-8">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 flex-wrap">
              <Link to="/" className="hover:text-blue-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </Link>
              <span>/</span>
              <Link to={isEvent ? "/events" : "/products"} className="hover:text-blue-600 transition-colors">
                {isEvent ? t("common.events", "Events") : t("common.products", "Products")}
              </Link>
              <span>/</span>
              <Link 
                to={`/products?category=${data.category}`} 
                className="hover:text-blue-600 transition-colors"
              >
                {getCategoryName(data.category)}
              </Link>
              {data.subcategory && getSubcategoryName(data.subcategory) && (
                <>
                  <span>/</span>
                  <Link 
                    to={`/products?category=${data.category}&subcategory=${data.subcategory}`} 
                    className="hover:text-blue-600 transition-colors"
                  >
                    {getSubcategoryName(data.subcategory)}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-gray-900 font-medium">{data.name}</span>
            </div>
          </div>
        </nav>

        {/* Main Product Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Image Gallery Section */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="sticky top-4 sm:top-8">
                {/* Main Image */}
                <div className="relative mb-4 sm:mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden">
                  <img
                    src={data.images && data.images.length > 0 ? getImageUrl(data.images[select]) : (isEvent ? "/default-event.png" : "/default-product.png")}
                    alt={data.name}
                    className="w-full h-64 sm:h-80 lg:h-[450px] object-cover"
                    onError={(e) => {
                      console.error("Main image failed to load:", e.target.src);
                      e.target.src = isEvent ? "/default-event.png" : "/default-product.png";
                      e.target.onerror = null;
                    }}
                  />
                  
                  {/* Discount Badge */}
                  {data.discountPrice && data.originalPrice && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg transform -rotate-2">
                      <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                      {Math.round(((data.originalPrice - data.discountPrice) / data.originalPrice) * 100)}% OFF
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div className="absolute top-4 right-4">
                    {data.stock > 0 ? (
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        {t("common.inStock", "In Stock")}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {t("common.outOfStock", "Out of Stock")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Gallery */}
                {data.images && data.images.length > 1 && (
                  <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-4 scrollbar-hide">
                    {data.images.map((image, index) => (
                      <div
                        key={index}
                        className={`flex-shrink-0 rounded-xl border-3 transform hover:scale-105 transition-all duration-200 cursor-pointer ${
                          select === index
                            ? "border-blue-500 shadow-lg ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                        onClick={() => setSelect(index)}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${data.name} ${index + 1}`}
                          className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-cover rounded-xl"
                          onError={(e) => {
                            console.error("Thumbnail image failed to load:", e.target.src);
                            e.target.src = isEvent ? "/default-event.png" : "/default-product.png";
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Product Info Section */}
            <div className="p-4 sm:p-6 lg:p-8 800px:pl-10">
              {/* Category and Subcategory Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  {getCategoryName(data.category)}
                </span>
                {data.subcategory && getSubcategoryName(data.subcategory) && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {getSubcategoryName(data.subcategory)}
                  </span>
                )}
              </div>

              {/* Product/Event Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                {data.name}
              </h1>

              {/* Badges Section */}
              <div className="mb-4 sm:mb-6 flex flex-wrap gap-3">
                {/* Sponsored Badge */}
                {data.isBoosted && (
                  <div className="flex items-center">
                    <BoostBadge type="sponsored" size="md" />
                  </div>
                )}
                
                {/* Verified Seller Badge */}
                {data.shop?.verifiedBadge && (
                  <div className="flex items-center">
                    <VerifiedBadge size="md" />
                  </div>
                )}
              </div>

              {/* Product Description */}
              {!isEvent && data.description && (
                <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {t("common.productDescription", "Product Description")}
                  </h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {data.description}
                  </div>
                  {data.tags && data.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(Array.isArray(data.tags) ? data.tags : data.tags.split(',')).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                        >
                          {typeof tag === 'string' ? tag.trim() : tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Event Description */}
              {isEvent && data.description && (
                <div className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {t("common.eventDescription", "Event Description")}
                  </h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
                    {data.description}
                  </div>
                  {data.tags && data.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {(Array.isArray(data.tags) ? data.tags : data.tags.split(',')).map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                        >
                          {typeof tag === 'string' ? tag.trim() : tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Event Countdown Timer */}
              {isEvent && data.Finish_Date && (
                <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {t("common.eventCountdown", "Event Countdown")}
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {(() => {
                      const now = new Date().getTime();
                      const endDate = new Date(data.Finish_Date).getTime();
                      const timeLeft = endDate - now - (countdown * 1000);
                      
                      if (timeLeft <= 0) {
                        return (
                          <div className="col-span-4 text-center">
                            <span className="text-red-600 font-bold text-lg">
                              {t("common.eventEnded", "Event Ended")}
                            </span>
                          </div>
                        );
                      }
                      
                      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                      
                      return (
                        <>
                          <div className="text-center">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-2xl font-bold text-orange-600">{days}</div>
                              <div className="text-xs text-gray-600">{t("common.days", "Days")}</div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-2xl font-bold text-orange-600">{hours}</div>
                              <div className="text-xs text-gray-600">{t("common.hours", "Hours")}</div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-2xl font-bold text-orange-600">{minutes}</div>
                              <div className="text-xs text-gray-600">{t("common.minutes", "Minutes")}</div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-2xl font-bold text-orange-600">{seconds}</div>
                              <div className="text-xs text-gray-600">{t("common.seconds", "Seconds")}</div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {data.sold_out > 0 && (
                <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3 mb-4">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">
                    {data.sold_out} {t("common.sold", "sold")}
                  </span>
                </div>
              )}

              {/* Price Section */}
              <div className="mb-6 sm:mb-8 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 sm:p-6 border border-orange-200">
                <div className="text-3xl sm:text-4xl font-bold text-orange-600">
                  {formatCurrency(data.originalPrice)} - {formatCurrency(data.discountPrice)}
                </div>
                
                {/* Minimum Quantity Display */}
                <div className="mt-3 sm:mt-4 flex items-center gap-2 bg-orange-50 rounded-lg px-3 sm:px-4 py-2 border border-orange-200">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium text-orange-700">
                    {t("common.minimumQuantity", "Minimum quantity to order")}: <span className="font-bold">{data.minOrderQuantity || 1}</span>
                  </span>
                </div>
              </div>

              {/* Seller Information Card */}
              {data?.shop && (
                <div className="mb-6 sm:mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="relative">
                      {data?.shop?.avatar || data?.shop?.owner?.avatar ? (
                        <img
                          src={(() => {
                            const avatarUrl = data?.shop?.avatar || data?.shop?.owner?.avatar;
                            if (typeof avatarUrl === 'string' && avatarUrl.startsWith('http')) {
                              return avatarUrl;
                            }
                            if (typeof avatarUrl === 'string') {
                              return `${backend_url.replace(/\/$/, "")}${avatarUrl.startsWith('/') ? avatarUrl : `/${avatarUrl}`}`;
                            }
                            return `${backend_url}/uploads/default-avatar.png`;
                          })()}
                          alt={data.shop.name || "Shop"}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white shadow-xl object-cover"
                          onError={(e) => {
                            console.error("Shop avatar failed to load:", e.target.src);
                            e.target.src = `${backend_url}/uploads/default-avatar.png`;
                            e.target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-white shadow-xl flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {(() => {
                              const ownerName = data?.shop?.owner?.name || data?.shop?.name || "U";
                              if (typeof ownerName === 'string' && ownerName.trim()) {
                                const nameParts = ownerName.trim().split(" ");
                                if (nameParts.length >= 2) {
                                  return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
                                }
                                return ownerName[0].toUpperCase();
                              }
                              return "U";
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl mb-1 font-semibold text-gray-900">
                        {data?.shop?.name || t("common.unknownShop", "Unknown Shop")}
                      </h3>
                      {data?.shop?.address && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {data.shop.address}
                        </p>
                      )}
                      {data.shop?.isVerified && (
                        <span className="inline-flex items-center gap-1 mt-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t("common.verified", "Verified")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seller Statistics */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-center border border-gray-200 shadow-sm">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 leading-tight">
                        {(() => {
                          if (!data?.shop?._id) return 0;
                          
                          // Count products from this shop
                          const shopProducts = allProducts?.filter(product => 
                            product.shop && product.shop._id === data.shop._id
                          ) || [];
                          
                          // Count events from this shop
                          const shopEvents = allEvents?.filter(event => 
                            event.shop && event.shop._id === data.shop._id
                          ) || [];
                          
                          return shopProducts.length + shopEvents.length;
                        })()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 font-medium leading-tight">{t("common.items", "Items")}</div>
                    </div>
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 text-center border border-gray-200 shadow-sm">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600 leading-tight">
                        {(() => {
                          if (!data?.shop?._id) return "0.0";
                          
                          // Get all products and events from this shop
                          const shopProducts = allProducts?.filter(product => 
                            product.shop && product.shop._id === data.shop._id
                          ) || [];
                          
                          const shopEvents = allEvents?.filter(event => 
                            event.shop && event.shop._id === data.shop._id
                          ) || [];
                          
                          // Collect all reviews from shop's products and events
                          const allReviews = [];
                          
                          shopProducts.forEach(product => {
                            if (product.reviews && product.reviews.length > 0) {
                              allReviews.push(...product.reviews);
                            }
                          });
                          
                          shopEvents.forEach(event => {
                            if (event.reviews && event.reviews.length > 0) {
                              allReviews.push(...event.reviews);
                            }
                          });
                          
                          if (allReviews.length === 0) return "0.0";
                          
                          const totalRating = allReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
                          const averageRating = totalRating / allReviews.length;
                          return averageRating.toFixed(1);
                        })()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 font-medium leading-tight">{t("common.rating", "Rating")}</div>
                    </div>
                  </div>

                  {/* Shop Actions */}
                  {data?.shop?._id && (
                    <div className="mb-4 sm:mb-6">
                      <Link
                        to={`/shop/preview/${data.shop._id}`}
                        className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium text-sm sm:text-base"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {t("common.viewShop", "View Shop")}
                      </Link>
                    </div>
                  )}

                  {/* Contact Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    {data.shop?.phoneNumber && (
                      <button
                        onClick={async () => {
                          try {
                            // Track WhatsApp click
                            const endpoint = isEvent 
                              ? `${server}/events/${data._id}/whatsapp-click`
                              : `${server}/products/${data._id}/whatsapp-click`;
                            
                            await axios.post(endpoint);
                            
                            const phoneNumber = data.shop.phoneNumber.replace(/\D/g, '');
                            const message = `Hi, I'm interested in ${data.name}`;
                            window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
                          } catch (error) {
                            console.error("WhatsApp error:", error);
                            toast.error(t("common.whatsappError", "Failed to open WhatsApp"));
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium text-sm sm:text-base"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                        </svg>
                        {t("common.whatsapp", "WhatsApp")}
                      </button>
                    )}

                    {data.shop?.telegram && (
                      <button
                        onClick={() => {
                          try {
                            const telegramUsername = data.shop.telegram.replace('@', '');
                            window.open(`https://t.me/${telegramUsername}`, "_blank");
                          } catch (error) {
                            console.error("Telegram error:", error);
                            toast.error(t("common.telegramError", "Failed to open Telegram"));
                          }
                        }}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9.036 16.569l-.398 5.609c.57 0 .816-.244 1.113-.54l2.664-2.537 5.522 4.033c1.012.557 1.73.264 1.983-.936l3.597-16.84c.327-1.513-.547-2.104-1.527-1.747l-21.36 8.23c-1.46.557-1.444 1.354-.25 1.713l5.463 1.706 12.684-8.01c.597-.406 1.142-.181.694.225" />
                        </svg>
                        {t("common.telegram", "Telegram")}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center">
                <button
                  onClick={handleWishlistToggle}
                  className="group relative flex items-center justify-center gap-3 px-16 py-5 w-full max-w-md bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 text-white rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg overflow-hidden"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  
                  {/* Icon with animation */}
                  <div className="relative z-10">
                    {isInWishlist ? (
                      <AiFillHeart className="w-7 h-7 animate-pulse" />
                    ) : (
                      <AiOutlineHeart className="w-7 h-7 group-hover:scale-110 transition-transform duration-200" />
                    )}
                  </div>
                  
                  {/* Text */}
                  <span className="relative z-10">
                    {isInWishlist 
                      ? (isEvent ? t("common.removeFromEventFavorites", "Remove from Event Favorites") : t("common.removeFromFavorites", "Remove from Favorites"))
                      : (isEvent ? t("common.addToEventFavorites", "Add to Event Favorites") : t("common.addToFavorites", "Add to Favorites"))
                    }
                  </span>
                  
                  {/* Border glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-400 via-red-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
