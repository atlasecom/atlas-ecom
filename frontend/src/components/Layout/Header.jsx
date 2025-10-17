import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/styles";
import { productData } from "../../static/data";
import { useLocation } from "react-router-dom";
import {motion, AnimatePresence } from 'framer-motion'
import {
  AiOutlineSearch,
  AiOutlineUser,
  AiOutlineHeart,
} from "react-icons/ai";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { BiMenuAltLeft } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import DropDown from "./DropDown";
import Navbar from "./Navbar";
import LanguageChanger from "./LanguageChanger";
import { useSelector, useDispatch } from "react-redux";
import { backend_url, server } from "../../server";
import { addToWishlist, removeFromWishlist } from "../../redux/actions/wishlist";
import { useCategories } from "../../hooks/useCategories";

import { RxCross1 } from "react-icons/rx";
import atlasLogo from "../../Assests/images/atlasEcom.png";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Avatar from "../Common/Avatar";

// Add custom scrollbar styles
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const Header = ({ activeHeading }) => {
  const { isSeller } = useSelector((state) => state.seller);
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { allProducts } = useSelector((state) => state.products);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { categories, subcategories, loading: categoriesLoading } = useCategories();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [active, setActive] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [open, setOpen] = useState(false); // mobile menu
  const [showWishlist, setShowWishlist] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // Initialize document direction on component mount
  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlTerm = params.get("item") || "";
    setSearchTerm(urlTerm);
  }, [location.search]);
  const navigate = useNavigate();
  const handleSearchSubmit = () => {
    const term = searchTerm.trim();
    if (!term) return;
    setOpen(false);
    navigate(`/products/search?item=${encodeURIComponent(term)}`);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${backend_url}/login/google`;
  };

  const toggleWishlist = () => {
    setShowWishlist(!showWishlist);
  };

  const addToWishlistHandler = async (product) => {
    try {
      await dispatch(addToWishlist(product._id));
      toast.success(t("wishlist.addedToWishlist", "Added to wishlist!"));
    } catch (error) {
      console.error('Header - Add to wishlist error:', error);
      toast.error(error.response?.data?.message || t("wishlist.wishlistError", "Failed to add to wishlist"));
    }
  };

  const removeFromWishlistHandler = async (product) => {
    try {
      console.log('Header - Remove from wishlist called with:', product);
      console.log('Header - Product ID:', product?._id);
      console.log('Header - Product ID type:', typeof product?._id);
      
      if (!product || !product._id) {
        toast.error(t("wishlist.invalidProduct", "Invalid product data"));
        return;
      }
      
      await dispatch(removeFromWishlist(product._id));
      toast.success(t("wishlist.removedFromWishlist", "Removed from wishlist!"));
    } catch (error) {
      console.error('Header - Remove from wishlist error:', error);
      console.error('Header - Error response:', error.response?.data);
      toast.error(error.response?.data?.message || t("wishlist.wishlistError", "Failed to remove from wishlist"));
    }
  };
  // Handle search change
  const searchTimeout = useRef();

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!term.trim()) {
      setSearchData(null);
      setSearchLoading(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const { data } = await axios.get(
          `${server}/api/products/search?term=${encodeURIComponent(term)}&limit=8`
        );
        
        setSearchData(data.products || []);
      } catch (error) {
        setSearchData([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400); // 400ms debounce
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 70) {
        setActive(true);
      } else {
        setActive(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchData && !event.target.closest('.search-container')) {
        setSearchData(null);
      }
      if (showWishlist && !event.target.closest('.wishlist-container')) {
        setShowWishlist(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchData, showWishlist]);


  return (
    <>
      {/* Inject custom scrollbar styles */}
      <style>{customScrollbarStyles}</style>
      
      {/* Top Header Bar - Desktop */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
{t("header.deliveryMorocco", "Delivery throughout Morocco")}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
{t("header.customerSupport", "24/7 Customer Support")}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageChanger />
          </div>
        </div>
      </div>

      {/* Top Header Bar - Mobile */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-1 lg:hidden">
        <div className="px-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {(isAuthenticated && (user?.role === "admin" || user?.role === "seller")) && (
              <Link
                to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
                className="flex items-center gap-1 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded transition-colors text-xs font-medium"
              >
                {t("header.dashboard", "Dashboard")}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {[
              { code: 'en', flag: 'https://flagcdn.com/w20/us.png', alt: 'EN' },
              { code: 'fr', flag: 'https://flagcdn.com/w20/fr.png', alt: 'FR' },
              { code: 'ar', flag: 'https://flagcdn.com/w20/ma.png', alt: 'AR' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  document.dir = lang.code === "ar" ? "rtl" : "ltr";
                }}
                className={`p-0.2 rounded transition-all ${
                  i18n.language === lang.code 
                    ? 'bg-white/20 ring-1 ring-white/40 scale-105' 
                    : 'bg-white/5 hover:bg-white/15'
                }`}
                title={lang.alt}
              >
                <img src={lang.flag} alt={lang.alt} className="w-5 h-3.5 object-cover rounded-[1px]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`${active ? 'shadow-lg bg-white/95 backdrop-blur-md' : 'bg-white'} transition-all duration-300 sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img
                  src={atlasLogo}
                  alt="Atlas Ecom Logo"
                  className="h-16 w-auto"
                />
              </Link>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8 search-container">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchSubmit();
                }}
                className="w-full"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t("header.searchBar.placeholder")}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-slate-700 placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-500 transition-colors"
                  >
                    <AiOutlineSearch size={20} />
                  </button>
                  
                  {/* Search Results Dropdown */}
                  {(searchData || searchLoading) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-80 overflow-y-auto z-50 w-full">
                  {searchLoading ? (
                    <div className="px-4 py-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto mb-2"></div>
                      <p className="text-slate-600 text-sm">{t("header.searching", "Searching...")}</p>
                    </div>
                  ) : searchData.length > 0 ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-orange-700">
                            {t("header.foundProducts", "Found {{count}} product", { count: searchData.length })}
                          </p>
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="p-1">
                        {searchData.map((i, index) => (
                          <div key={index} className="group flex items-center p-2 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 rounded-lg border border-transparent hover:border-orange-200 mb-1 last:mb-0">
                            <Link to={`/product/${i._id}`} className="flex items-center flex-1">
                              <div className="relative">
                                <img
                                  src={(() => {
                                    if (i?.images && Array.isArray(i.images) && i.images.length > 0) {
                                      const imageObj = i.images[0];
                                      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                                        const imageUrl = imageObj.url;
                                        if (typeof imageUrl === 'string' && imageUrl.startsWith("http")) {
                                          return imageUrl;
                                        }
                                        if (typeof imageUrl === 'string') {
                                          return `${backend_url}/${imageUrl.replace(/^\/+/, "")}`;
                                        }
                                      }
                                      if (typeof imageObj === 'string') {
                                        if (imageObj.startsWith("http")) {
                                          return imageObj;
                                        }
                                        return `${backend_url}/${imageObj.replace(/^\/+/, "")}`;
                                      }
                                    }
                                    return '/default-product.png';
                                  })()}
                                  alt="img"
                                  className="w-10 h-10 object-cover rounded-lg shadow-sm mr-3"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-800 truncate group-hover:text-orange-600 transition-colors text-sm">{i.name}</h3>
                                <div className="flex items-center space-x-1 mt-1">
                                  {i.category && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                                      {typeof i.category === 'object' 
                                        ? (i18n.language === 'ar' ? i.category.nameAr : 
                                           i18n.language === 'fr' ? i.category.nameFr : 
                                           i.category.name)
                                        : i.category}
                                    </span>
                                  )}
                                  {i.subcategory && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                      {typeof i.subcategory === 'object' 
                                        ? (i18n.language === 'ar' ? i.subcategory.nameAr : 
                                           i18n.language === 'fr' ? i.subcategory.nameFr : 
                                           i.subcategory.name)
                                        : i.subcategory}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 mt-1">
                                  <span className="text-sm font-bold text-orange-600">
                                    {i.discountPrice || i.originalPrice} DH
                                  </span>
                                  {i.discountPrice && i.originalPrice && i.discountPrice < i.originalPrice && (
                                    <span className="text-xs text-gray-500 line-through">
                                      {i.originalPrice} DH
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                            
                            {/* Add to Wishlist Button */}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToWishlistHandler(i);
                              }}
                              className="ml-2 p-2 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-full transition-all duration-300 hover:scale-110 group-hover:bg-orange-100"
                              title="Add to Wishlist"
                            >
                              <AiOutlineHeart size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-1">{t("header.noProductsFound", "No products found")}</h3>
                      <p className="text-slate-600 text-xs">{t("header.tryDifferentKeywords", "Try searching with different keywords")}</p>
                    </div>
                  )}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">
              {/* Wishlist */}
              <div className="relative group wishlist-container">
                <button
                  onClick={toggleWishlist}
                  className="flex items-center justify-center px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 border border-transparent hover:border-orange-200 hover:shadow-md transform hover:scale-105"
                >
                  <div className="relative">
                    <AiOutlineHeart size={22} className="text-orange-600 transition-all duration-300 group-hover:text-orange-700" />
                    {wishlist && wishlist.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
                        {wishlist.length > 99 ? '99+' : wishlist.length}
                      </span>
                    )}
                  </div>
                </button>

                {/* Wishlist Dropdown */}
                {showWishlist && (
                  <div className="absolute top-full right-0 mt-2 w-[85vw] sm:w-96 max-w-sm bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform -translate-x-1/2 sm:translate-x-0 left-1/2 sm:left-auto">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <AiOutlineHeart size={14} className="sm:w-5 sm:h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-lg font-bold">{t("header.wishlist", "Wishlist")}</h3>
                            <p className="text-orange-100 text-xs sm:text-sm">
                              {wishlist && wishlist.length > 0 ? `${wishlist.length} ${t("common.item", "item")}` : t("header.empty", "Empty")}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={toggleWishlist}
                          className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          <RxCross1 size={12} className="sm:w-4 sm:h-4 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-6">
                      {wishlist && wishlist.length > 0 ? (
                        <div className="space-y-2 sm:space-y-4 max-h-48 sm:max-h-80 overflow-y-auto custom-scrollbar">
                          {wishlist.map((item, index) => (
                            <div key={index} className="group/item bg-gray-50 hover:bg-white rounded-md sm:rounded-xl p-2.5 sm:p-4 transition-all duration-300 border border-gray-100 hover:border-orange-200 hover:shadow-lg">
                              <div className="flex items-center space-x-2.5 sm:space-x-4">
                                <div className="relative">
                                  <Link
                                    to={item.isEvent ? `/product/${item._id}?isEvent=true` : `/product/${item._id}`}
                                    onClick={() => setShowWishlist(false)}
                                    className="block"
                                  >
                                    <img
                                      src={item.images && item.images.length > 0 ? item.images[0].url : '/default-product.png'}
                                      alt={item.name}
                                      className="w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-md sm:rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-md sm:rounded-lg"></div>
                                  </Link>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Link
                                    to={item.isEvent ? `/product/${item._id}?isEvent=true` : `/product/${item._id}`}
                                    onClick={() => setShowWishlist(false)}
                                    className="block"
                                  >
                                    <h4 className="font-semibold text-slate-800 truncate text-xs sm:text-base group-hover/item:text-orange-600 transition-colors hover:text-orange-600 cursor-pointer">
                                      {item.name}
                                    </h4>
                                  </Link>
                                  <div className="flex items-center space-x-1 sm:space-x-2 mt-0.5 sm:mt-1">
                                    <span className="text-sm sm:text-lg font-bold text-orange-600">
                                      {item.originalPrice} - {item.discountPrice} DH
                                    </span>
                                  </div>
                                  {item.shop && (
                                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1 truncate">
                                      by {item.shop.name}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col space-y-1 sm:space-y-2">
                                  <button
                                    onClick={() => removeFromWishlistHandler(item)}
                                    className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group-hover/item:bg-red-200"
                                    title="Remove from wishlist"
                                  >
                                    <RxCross1 size={10} className="sm:w-3.5 sm:h-3.5" />
                                  </button>
                                  <Link
                                    to={item.isEvent ? `/product/${item._id}?isEvent=true` : `/product/${item._id}`}
                                    onClick={() => setShowWishlist(false)}
                                    className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 hover:bg-orange-200 text-orange-600 hover:text-orange-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 group-hover/item:bg-orange-200"
                                    title="View product"
                                  >
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-12">
                          <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                            <AiOutlineHeart size={20} className="sm:w-8 sm:h-8 text-orange-500" />
                          </div>
                          <h4 className="text-sm sm:text-lg font-semibold text-slate-700 mb-1 sm:mb-2">{t("header.emptyWishlist", "Empty wishlist")}</h4>
                          <p className="text-xs sm:text-base text-slate-500 mb-3 sm:mb-6 px-1">{t("header.addProductsYouLove", "Add products you love!")}</p>
                          <button
                            onClick={toggleWishlist}
                            className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-md sm:rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-xs sm:text-base"
                          >
                            {t("header.startShopping", "Start Shopping")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="relative group">
                {isAuthenticated ? (
                  <Link to="/profile" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200">
                    <Avatar user={user} size="sm" className="border-2 border-orange-200" />
                    <span className="hidden md:block text-sm font-medium text-slate-700">
                      {user.name}
                    </span>
                  </Link>
                ) : (
                  <Link to="/login" className="flex items-center space-x-2 p-3 rounded-lg hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <AiOutlineUser size={20} className="text-orange-600" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-slate-700">
                      Sign In / Sign Up
                    </span>
                  </Link>
                )}
              </div>

              {/* Get Started Button */}
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="hidden md:inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t("header.getStarted", "Sign In / Sign Up")}
                  <IoIosArrowForward className="ml-2" />
                </Link>
              ) : user && user.role === "admin" ? (
                <Link
                  to="/admin/dashboard"
                  className="hidden md:inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t("header.goDashboard", "Go Dashboard")}
                  <IoIosArrowForward className="ml-2" />
                </Link>
              ) : user && user.role === "seller" ? (
                <Link
                  to="/dashboard"
                  className="hidden md:inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t("header.goDashboard", "Go Dashboard")}
                  <IoIosArrowForward className="ml-2" />
                </Link>
              ) : null}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-orange-500 transition-colors"
              >
                <BiMenuAltLeft size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-black text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Categories Dropdown - Desktop & Mobile */}
            <div className="relative">
              <button
                onClick={() => setDropDown(!dropDown)}
                className={`flex items-center gap-2 px-4 lg:px-6 py-3 lg:py-4 bg-orange-600 hover:bg-orange-500 transition-colors rounded-lg ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}
              >
                <BiMenuAltLeft size={20} className={i18n.language === 'ar' ? 'rotate-180' : ''} />
                <span className="font-medium text-sm lg:text-base">{t("navbar.allCategories", "All Categories")}</span>
                <IoIosArrowDown size={16} className={`transition-transform ${dropDown ? 'rotate-180' : ''}`} />
              </button>

        {dropDown && (
          <div 
            className={`absolute top-full z-50 bg-white shadow-2xl border border-gray-200 rounded-lg mt-2 overflow-hidden w-[95vw] lg:w-[900px] max-w-[95vw] ${i18n.language === 'ar' ? 'right-0' : 'left-0'}`}
            onMouseLeave={() => setHoveredCategory(null)}
          >
                  {categoriesLoading ? (
                    <div className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
                      <p className="text-slate-600 text-sm">{t("header.loadingCategories", "Loading categories...")}</p>
                    </div>
                  ) : categories.length > 0 ? (
                    <>
                      {/* Mobile Version - Professional List with expandable subcategories */}
                      <div className="lg:hidden">
                        {/* Header */}
                        <div className={`sticky top-0 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100 px-4 py-3 z-10 ${i18n.language === 'ar' ? 'text-right' : ''}`}>
                          <div className={`flex items-center justify-between ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                <BiMenuAltLeft className={`text-white ${i18n.language === 'ar' ? 'rotate-180' : ''}`} size={18} />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-gray-800">{t("header.allCategories", "All Categories")}</h3>
                                <p className="text-xs text-gray-500">{categories.length} {t("header.categoriesAvailable", "categories available")}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setDropDown(false)}
                              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                            >
                              <RxCross1 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Categories List */}
                        <div className="p-5 max-h-[65vh] overflow-y-auto custom-scrollbar">
                          {categories.map((category, index) => {
                            const categorySubcategories = subcategories.filter(sub => sub.category === category._id);
                            return (
                              <div 
                                key={category._id} 
                                className="mb-5 last:mb-0 animate-fadeIn"
                                style={{ animationDelay: `${index * 0.05}s` }}
                              >
                                {/* Category Card */}
                                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-orange-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                                  {/* Category Header */}
                                  <Link
                                    to={`/products?category=${category._id}`}
                                    className={`flex items-center p-5 group ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}
                                    onClick={() => setDropDown(false)}
                                  >
                                    {/* Category Image */}
                                    <div className="relative flex-shrink-0">
                                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl p-0.5 group-hover:scale-110 transition-transform duration-300">
                                        <img
                                          src={category.image?.url || '/default-product.png'}
                                          alt={i18n.language === 'ar' ? category.nameAr : 
                                               i18n.language === 'fr' ? category.nameFr : 
                                               category.name}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      </div>
                                      {categorySubcategories.length > 0 && (
                                        <div className={`absolute -top-1 w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg ${i18n.language === 'ar' ? '-left-1' : '-right-1'}`}>
                                          {categorySubcategories.length}
                                        </div>
                                      )}
                                    </div>

                                    {/* Category Info */}
                                    <div className={`flex-1 min-w-0 ${i18n.language === 'ar' ? 'mr-4 text-right' : 'ml-4'}`}>
                                      <h4 className="text-base font-bold text-gray-800 group-hover:text-orange-600 transition-colors truncate">
                                        {i18n.language === 'ar' ? category.nameAr : 
                                         i18n.language === 'fr' ? category.nameFr : 
                                         category.name}
                                      </h4>
                                      <p className="text-sm text-gray-500 mt-1">
                                        {categorySubcategories.length > 0 
                                          ? `${categorySubcategories.length} ${t("header.subcategories", "subcategories")}`
                                          : t("header.viewAll", "View all products")
                                        }
                                      </p>
                                    </div>

                                    {/* Arrow Icon */}
                                    <IoIosArrowForward 
                                      className={`text-gray-400 group-hover:text-orange-600 transition-all flex-shrink-0 ${i18n.language === 'ar' ? 'mr-2 rotate-180 group-hover:-translate-x-1' : 'ml-2 group-hover:translate-x-1'}`}
                                      size={20} 
                                    />
                                  </Link>
                                  
                                  {/* Subcategories Grid */}
                                  {categorySubcategories.length > 0 && (
                                    <div className="border-t border-gray-100 bg-white/50 backdrop-blur-sm">
                                      <div className="p-4 grid grid-cols-2 gap-3">
                                        {categorySubcategories.map((subcategory) => (
                                          <Link
                                            key={subcategory._id}
                                            to={`/products?category=${category._id}&subcategory=${subcategory._id}`}
                                            className={`group/sub flex items-start px-4 py-3 text-sm bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 border border-gray-100 hover:border-orange-200 rounded-lg transition-all duration-200 hover:shadow-md ${i18n.language === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                                            onClick={() => setDropDown(false)}
                                          >
                                            <div className={`w-2 h-2 bg-orange-400 rounded-full mt-1.5 flex-shrink-0 group-hover/sub:bg-orange-600 ${i18n.language === 'ar' ? 'ml-3' : 'mr-3'}`}></div>
                                            <span className="text-gray-700 group-hover/sub:text-orange-600 group-hover/sub:font-medium transition-all line-clamp-2 leading-tight">
                                              {i18n.language === 'ar' ? subcategory.nameAr : 
                                               i18n.language === 'fr' ? subcategory.nameFr : 
                                               subcategory.name}
                                            </span>
                                          </Link>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent border-t border-gray-100 px-4 py-3">
                          <Link
                            to="/products"
                            onClick={() => setDropDown(false)}
                            className={`flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {t("header.viewAllProducts", "View All Products")}
                          </Link>
                        </div>
                      </div>

                      {/* Desktop Version - Two Panel Layout */}
                      <div className={`hidden lg:flex min-h-[400px] ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                        {/* Categories Sidebar */}
                        <div className={`w-64 bg-gray-50 ${i18n.language === 'ar' ? 'border-l' : 'border-r'} border-gray-200`}>
                          <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                              {t("header.allCategories", "All Categories")}
                            </h3>
                            <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar">
                              {categories.map((category) => {
                                const categorySubcategories = subcategories.filter(sub => sub.category === category._id);
                                const isHovered = hoveredCategory === category._id;
                                return (
                                  <div 
                                    key={category._id} 
                                    className="group"
                                    onMouseEnter={() => setHoveredCategory(category._id)}
                                  >
                                    <Link
                                      to={`/products?category=${category._id}`}
                                      className={`flex items-center px-3 py-2.5 text-sm rounded-md transition-all duration-200 ${
                                        isHovered 
                                          ? 'text-orange-600 bg-white shadow-sm' 
                                          : 'text-gray-700 hover:text-orange-600 hover:bg-white'
                                      } ${i18n.language === 'ar' ? 'flex-row-reverse text-right' : ''}`}
                                      onClick={() => setDropDown(false)}
                                    >
                                      <img
                                        src={category.image?.url || '/default-product.png'}
                                        alt={i18n.language === 'ar' ? category.nameAr : 
                                             i18n.language === 'fr' ? category.nameFr : 
                                             category.name}
                                        className={`w-5 h-5 object-cover rounded flex-shrink-0 ${i18n.language === 'ar' ? 'ml-3' : 'mr-3'}`}
                                      />
                                      <span className="flex-1 truncate">
                                        {i18n.language === 'ar' ? category.nameAr : 
                                         i18n.language === 'fr' ? category.nameFr : 
                                         category.name}
                                      </span>
                                      {categorySubcategories.length > 0 && (
                                        <IoIosArrowForward size={12} className={`transition-colors ${i18n.language === 'ar' ? 'mr-2 rotate-180' : 'ml-2'} ${
                                          isHovered ? 'text-orange-500' : 'text-gray-400'
                                        }`} />
                                      )}
                                    </Link>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                      {/* Subcategories Panel */}
                      <div className="flex-1 min-w-0 bg-white">
                        <div className="p-6">
                          {hoveredCategory ? (
                            (() => {
                              const selectedCategory = categories.find(cat => cat._id === hoveredCategory);
                              const categorySubcategories = subcategories.filter(sub => sub.category === hoveredCategory);
                              
                              if (!selectedCategory) return null;
                              
                              return (
                                <div>
                                  {/* Category Header */}
                                  <div className="mb-6">
                                    <div className={`flex items-center mb-3 ${i18n.language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
                                      <img
                                        src={selectedCategory.image?.url || '/default-product.png'}
                                        alt={i18n.language === 'ar' ? selectedCategory.nameAr : 
                                             i18n.language === 'fr' ? selectedCategory.nameFr : 
                                             selectedCategory.name}
                                        className={`w-8 h-8 object-cover rounded ${i18n.language === 'ar' ? 'ml-3' : 'mr-3'}`}
                                      />
                                      <h4 className="text-lg font-semibold text-gray-800">
                                        {i18n.language === 'ar' ? selectedCategory.nameAr : 
                                         i18n.language === 'fr' ? selectedCategory.nameFr : 
                                         selectedCategory.name}
                                      </h4>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-orange-200 to-transparent"></div>
                                  </div>

                                  {/* Subcategories Grid */}
                                  {categorySubcategories.length > 0 ? (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                      {categorySubcategories.map((subcategory) => (
                                        <Link
                                          key={subcategory._id}
                                          to={`/products?category=${hoveredCategory}&subcategory=${subcategory._id}`}
                                          className={`block p-3 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:shadow-sm border border-transparent hover:border-orange-200 cursor-pointer ${i18n.language === 'ar' ? 'text-right' : ''}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            console.log('Subcategory clicked:', subcategory.name, 'ID:', subcategory._id);
                                            console.log('Category ID:', hoveredCategory);
                                            console.log('Navigation URL:', `/products?category=${hoveredCategory}&subcategory=${subcategory._id}`);
                                            setDropDown(false);
                                            // Navigate programmatically
                                            window.location.href = `/products?category=${hoveredCategory}&subcategory=${subcategory._id}`;
                                          }}
                                        >
                                          <div className={`flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-2 h-2 bg-orange-400 rounded-full ${i18n.language === 'ar' ? 'ml-3' : 'mr-3'}`}></div>
                                            <span className="truncate">
                                              {i18n.language === 'ar' ? subcategory.nameAr : 
                                               i18n.language === 'fr' ? subcategory.nameFr : 
                                               subcategory.name}
                                            </span>
                                          </div>
                                        </Link>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                      </div>
                                      <p className="text-gray-500 text-sm">{t("header.noSubcategories", "No subcategories available")}</p>
                                    </div>
                                  )}

                                  {/* View All Category Link */}
                                  <div className="mt-6 pt-4 border-t border-gray-200">
                                    <Link
                                      to={`/products?category=${hoveredCategory}`}
                                      className={`inline-flex items-center px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}
                                      onClick={() => setDropDown(false)}
                                    >
                                      {t("header.viewAllInCategory", "View All Products in")} {i18n.language === 'ar' ? selectedCategory.nameAr : 
                                       i18n.language === 'fr' ? selectedCategory.nameFr : 
                                       selectedCategory.name}
                                      <IoIosArrowForward size={14} className="ml-2" />
                                    </Link>
                                  </div>
                                </div>
                              );
                            })()
                          ) : (
                            <div className="text-center py-12">
                              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                              </div>
                              <h4 className="text-lg font-semibold text-gray-800 mb-2">{t("header.selectCategory", "Select a Category")}</h4>
                              <p className="text-gray-500 text-sm">{t("header.hoverToSeeSubcategories", "Hover over a category to see its subcategories")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      </div>
                    </>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-slate-600 text-sm">{t("header.noCategories", "No categories available")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Navbar active={activeHeading} />
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">|</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="lg:hidden bg-white border-b border-orange-200 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
          className="relative"
        >
          <input
            type="search"
            placeholder={t("header.searchBar.placeholder")}
            className="w-full pl-10 pr-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            type="submit"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400"
          >
            <AiOutlineSearch size={20} />
          </button>
        </form>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-800">{t("header.menu", "Menu")}</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <RxCross1 size={24} />
                  </button>
                </div>

                <Navbar active={activeHeading} />

                {/* Categories Section for Mobile */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-700">
                      {t("header.categories", "Categories")}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {categoriesLoading ? (
                      <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
                        <p className="text-slate-600 text-sm">{t("header.loadingCategories", "Loading categories...")}</p>
                      </div>
                    ) : categories.length > 0 ? (
                      categories.map((category) => {
                        const categorySubcategories = subcategories.filter(sub => sub.category === category._id);
                        return (
                          <div key={category._id} className="bg-gray-50 rounded-lg p-4">
                            <Link
                              to={`/products?category=${category._id}`}
                              onClick={() => setOpen(false)}
                              className="flex items-center px-2 py-2 text-slate-700 hover:text-orange-600 rounded-md transition-colors font-medium"
                            >
                              <img
                                src={category.image?.url || '/default-product.png'}
                                alt={i18n.language === 'ar' ? category.nameAr : 
                                     i18n.language === 'fr' ? category.nameFr : 
                                     category.name}
                                className="w-6 h-6 object-cover rounded mr-3"
                              />
                              <span className="flex-1">
                                {i18n.language === 'ar' ? category.nameAr : 
                                 i18n.language === 'fr' ? category.nameFr : 
                                 category.name}
                              </span>
                              {categorySubcategories.length > 0 && (
                                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">
                                  {categorySubcategories.length} {t("header.items", "items")}
                                </span>
                              )}
                            </Link>
                            {categorySubcategories.length > 0 && (
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                {categorySubcategories.slice(0, 6).map((subcategory) => (
                                  <Link
                                    key={subcategory._id}
                                    to={`/products?category=${category._id}&subcategory=${subcategory._id}`}
                                    onClick={() => setOpen(false)}
                                    className="block px-3 py-2 text-xs text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors border border-transparent hover:border-orange-200"
                                  >
                                    <div className="flex items-center">
                                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                                      <span className="truncate">
                                        {i18n.language === 'ar' ? subcategory.nameAr : 
                                         i18n.language === 'fr' ? subcategory.nameFr : 
                                         subcategory.name}
                                      </span>
                                    </div>
                                  </Link>
                                ))}
                                {categorySubcategories.length > 6 && (
                                  <Link
                                    to={`/products?category=${category._id}`}
                                    onClick={() => setOpen(false)}
                                    className="block px-3 py-2 text-xs text-orange-500 hover:text-orange-600 font-medium bg-orange-50 hover:bg-orange-100 rounded-md transition-colors"
                                  >
                                    +{categorySubcategories.length - 6} {t("header.more", "more")}
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <p className="text-slate-600 text-sm">{t("header.noCategories", "No categories available")}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-orange-200">
                  {!isAuthenticated ? (
                    <Link
                      to="/login"
                      className="block w-full text-center py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                    >
                      {t("header.getStarted", "Sign In / Sign Up")}
                    </Link>
                  ) : user && user.role === "admin" ? (
                    <Link
                      to="/admin/dashboard"
                      className="block w-full text-center py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                    >
                      {t("header.goDashboard", "Go Dashboard")}
                    </Link>
                  ) : user && user.role === "seller" ? (
                    <Link
                      to="/dashboard"
                      className="block w-full text-center py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300"
                    >
                      {t("header.goDashboard", "Go Dashboard")}
                    </Link>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
};

export default Header;
