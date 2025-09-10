import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCardNew";
import axios from "axios";
import { server } from "../../../server";

const ITEMS_PER_PAGE = 50;

const FeaturedProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all products from server
  const fetchAllProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${server}/products`);
      if (response.data.success) {
        setAllProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const totalPages = Math.ceil((allProducts?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentProducts = allProducts?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top is now handled globally by ScrollToTop component
    }
  };

  return (
    <div className="w-full px-0 py-6 sm:py-8 xl:py-10 2xl:py-12">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          {t('featuredProduct.title', 'Featured Products')}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
          Discover our handpicked selection of premium products
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8 mb-8 sm:mb-12 xl:mb-16 2xl:mb-20 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {isLoading ? (
          <div className="col-span-full text-center py-8 xl:py-10 2xl:py-12">
            <div className="inline-flex items-center gap-2 xl:gap-3 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 border-b-2 border-orange-600"></div>
              <p className="text-sm xl:text-base 2xl:text-lg font-medium">{t('featuredProduct.loading', 'Loading products...')}</p>
            </div>
          </div>
        ) : currentProducts?.length > 0 ? (
          currentProducts.map((i, index) => (
            <ProductCard data={i} isEvent={false} key={index} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 xl:py-10 2xl:py-12">
            <div className="max-w-sm xl:max-w-md 2xl:max-w-lg mx-auto">
              <div className="text-gray-400 mb-3 xl:mb-4 2xl:mb-5">
                <svg className="w-12 h-12 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 mb-2 xl:mb-3">
                {t('featuredProduct.noProducts', 'No products available')}
              </h3>
              <p className="text-sm xl:text-base 2xl:text-lg text-gray-600">
                Check back soon for amazing products!
              </p>
            </div>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mb-6 sm:mb-8 xl:mb-10 2xl:mb-12">
          <div className="flex items-center space-x-1 sm:space-x-2 bg-white rounded-lg xl:rounded-xl shadow-md xl:shadow-lg border border-gray-200 p-1 sm:p-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <span className="hidden sm:inline">{t('featuredProduct.prev', 'Previous')}</span>
              <span className="sm:hidden">Prev</span>
            </button>

            {Array.from({ length: Math.min(totalPages, window.innerWidth < 640 ? 5 : window.innerWidth < 1280 ? 7 : 9) }, (_, i) => {
              let pageNum;
              const maxVisible = window.innerWidth < 640 ? 5 : window.innerWidth < 1280 ? 7 : 9;
              if (totalPages <= maxVisible) {
                pageNum = i + 1;
              } else if (currentPage <= Math.floor(maxVisible / 2) + 1) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - Math.floor(maxVisible / 2)) {
                pageNum = totalPages - maxVisible + 1 + i;
              } else {
                pageNum = currentPage - Math.floor(maxVisible / 2) + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all duration-300 ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                      : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <span className="hidden sm:inline">{t('featuredProduct.next', 'Next')}</span>
              <span className="sm:hidden">Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedProduct;
