import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../../../hooks/useCategories";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const CategorySlider = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  
  // Use dynamic categories from API
  const { categories, loading: categoriesLoading } = useCategories();

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 150;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category._id}`);
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Professional Navigation Arrows */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute -left-2 sm:left-0 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-xl border-2 border-white flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Scroll left"
          >
            <FaArrowLeft className="text-white" size={16} />
          </button>
          
          <button
            onClick={() => handleScroll('right')}
            className="absolute -right-2 sm:right-0 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full shadow-xl border-2 border-white flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Scroll right"
          >
            <FaArrowRight className="text-white" size={16} />
          </button>

          {/* Categories Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-12 sm:px-14 py-2"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth'
            }}
          >
            {categoriesLoading ? (
              <div className="flex items-center justify-center w-full py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-sm text-gray-600">Loading categories...</span>
              </div>
            ) : (
              categories.map((category, index) => {
                const categoryName = i18n.language === 'ar' ? category.nameAr : 
                                   i18n.language === 'fr' ? category.nameFr : 
                                   category.name;
                
                return (
                  <div
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className="flex-shrink-0 w-16 sm:w-20 cursor-pointer group"
                  >
                    {/* Card with Orange Gradient Background - MUCH SMALLER (1/3 size) */}
                    <div className="relative bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-md shadow-md hover:shadow-lg transition-all duration-300 p-1 sm:p-1.5 overflow-hidden group-hover:scale-105 transform">
                      {/* Decorative Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-8 h-8 bg-white rounded-full -mr-4 -mt-4"></div>
                        <div className="absolute bottom-0 left-0 w-6 h-6 bg-white rounded-full -ml-3 -mb-3"></div>
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        {/* Category Label (small text at top) */}
                        <p className="text-[7px] sm:text-[8px] text-gray-900 font-medium mb-0.5 truncate leading-tight">
                          {categoryName}
                        </p>
                        
                        {/* Category Name (large title) */}
                        <h3 className="text-[9px] sm:text-[10px] font-black text-gray-900 mb-1 uppercase leading-none tracking-tight truncate">
                          {categoryName.split(' ')[0] || categoryName}
                        </h3>
                        
                        {/* Image Container with Border */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-sm border border-blue-500 shadow-inner overflow-hidden">
                          <div className="aspect-square flex items-center justify-center">
                            <img
                              src={category.image?.url || '/default-product.png'}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              alt={categoryName}
                              onError={(e) => {
                                e.target.src = '/default-product.png';
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;
