import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../../../hooks/useCategories";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Categories = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  
  // Use dynamic categories from API
  const { categories, loading: categoriesLoading } = useCategories();

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 250;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });

    // Update current index for better UX
    const maxScroll = container.scrollWidth - container.clientWidth;
    if (newScrollLeft <= 0) {
      setCurrentIndex(0);
    } else if (newScrollLeft >= maxScroll) {
      setCurrentIndex(Math.ceil(categories.length / 5) - 1);
    } else {
      setCurrentIndex(Math.floor(newScrollLeft / scrollAmount));
    }
  };

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < Math.ceil(categories.length / 5) - 1;

  return (
    <div className="bg-gradient-to-br from-white via-orange-50 to-orange-100 py-16">
      {/* Categories Section - Cleaner and Smaller */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-orange-800 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-orange-600 max-w-2xl mx-auto">
            Discover our wide range of products organized into convenient categories
          </p>
        </div>

        {/* Desktop Categories - Smaller and Cleaner */}
        <div className="hidden lg:block relative">
          <div className="flex items-center justify-between mb-8">
            {/* Left Navigation Button */}
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`w-12 h-12 rounded-full shadow-lg border transition-all duration-300 transform hover:scale-105 ${
                canScrollLeft
                  ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
              }`}
            >
              <FaArrowLeft size={18} className="mx-auto" />
            </button>
            
            {/* Categories Container */}
            <div className="flex-1 mx-8">
              <div
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  scrollBehavior: 'smooth'
                }}
              >
                {categoriesLoading ? (
                  <div className="flex items-center justify-center w-full py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    <span className="ml-3 text-lg text-gray-600">Loading categories...</span>
                  </div>
                ) : (
                  categories.map((category, index) => (
                    <div
                      key={category._id + '-' + index}
                      onClick={() => navigate(`/products?category=${category._id}`)}
                      className="flex flex-col items-center text-center cursor-pointer group w-40 flex-shrink-0 transform hover:scale-105 transition-all duration-300"
                    >
                      {/* Smaller Category Card */}
                      <div className="w-28 h-28 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 mb-4 border-2 border-transparent group-hover:border-orange-300">
                        <img
                          src={category.image?.url || '/default-product.png'}
                          className="w-16 h-16 object-contain rounded-xl group-hover:scale-110 transition-transform duration-300"
                          alt="category"
                        />
                      </div>
                      
                      {/* Category Title */}
                      <h3 className="text-base font-semibold text-orange-800 group-hover:text-orange-600 transition-colors duration-300 mb-2">
                        {i18n.language === 'ar' ? category.nameAr : 
                         i18n.language === 'fr' ? category.nameFr : 
                         category.name}
                      </h3>
                      
                      {/* Subcategory count */}
                      {category.subcategories && category.subcategories.length > 0 && (
                        <p className="text-xs text-gray-500 mb-1">
                          {category.subcategories.length} subcategor{category.subcategories.length === 1 ? 'y' : 'ies'}
                        </p>
                      )}
                      
                      {/* Simple Underline */}
                      <div className="w-8 h-0.5 bg-orange-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100 origin-center"></div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Navigation Button */}
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`w-12 h-12 rounded-full shadow-lg border transition-all duration-300 transform hover:scale-105 ${
                canScrollRight
                  ? 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
              }`}
            >
              <FaArrowRight size={18} className="mx-auto" />
            </button>
          </div>
          
          {/* Simple Progress Indicator */}
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(categories.length / 5) }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'bg-orange-500 scale-125'
                      : 'bg-orange-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Categories - Smaller Grid */}
        <div className="lg:hidden">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {categoriesLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                <span className="ml-3 text-lg text-gray-600">Loading categories...</span>
              </div>
            ) : (
              categories.map((category, index) => (
                <div
                  key={category._id}
                  onClick={() => navigate(`/products?category=${category._id}`)}
                  className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-orange-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={category.image?.url || '/default-product.png'}
                      className="w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                      alt="category"
                    />
                  </div>
                  <h3 className="text-sm font-medium text-orange-800 text-center group-hover:text-orange-600 transition-colors duration-300">
                    {i18n.language === 'ar' ? category.nameAr : 
                     i18n.language === 'fr' ? category.nameFr : 
                     category.name}
                  </h3>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <p className="text-xs text-gray-500 text-center mt-1">
                      {category.subcategories.length} subcategor{category.subcategories.length === 1 ? 'y' : 'ies'}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
