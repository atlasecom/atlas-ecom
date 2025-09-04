import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "../../../static/data";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const CategorySlider = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${category.title[i18n.language] || category.title.en}`);
  };

  return (
    <div className="bg-white py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            <FaArrowLeft className="text-gray-600" size={12} />
          </button>
          
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            <FaArrowRight className="text-gray-600" size={12} />
          </button>

          {/* Categories Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-10"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              scrollBehavior: 'smooth'
            }}
          >
            {categoriesData.map((category, index) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="flex flex-col items-center text-center cursor-pointer group flex-shrink-0 transform hover:scale-105 transition-all duration-300"
              >
                {/* Category Icon Container */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center mb-2 group-hover:shadow-lg group-hover:border-orange-200 transition-all duration-300">
                  <img
                    src={category.image_Url}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain group-hover:scale-110 transition-transform duration-300"
                    alt={category.title[i18n.language] || category.title.en}
                  />
                </div>
                
                {/* Category Title */}
                <h3 className="text-xs font-medium text-gray-800 group-hover:text-orange-600 transition-colors duration-300 max-w-16 sm:max-w-20 text-center leading-tight">
                  {category.title[i18n.language] || category.title.en}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySlider;
