import React, { useEffect, useState } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { useSelector } from "react-redux";
import Loader from "../components/Layout/Loader";
import styles from "../styles/styles";
import ProductCard from "../components/Route/ProductCard/ProductCardNew";
import { useTranslation } from "react-i18next";
import { FiTrendingUp, FiStar, FiShoppingBag, FiFilter } from "react-icons/fi";

const BestSellingPage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const { allProducts, isLoading } = useSelector((state) => state.products);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Get unique categories
  const categories = [...new Set((allProducts || []).map(product => product.category).filter(Boolean))];

  useEffect(() => {
    if (Array.isArray(allProducts)) {
      const sortedProducts = [...allProducts].sort(
        (a, b) => b.sold_out - a.sold_out
      );
      setData(sortedProducts);
      setFilteredData(sortedProducts);
      window.scrollTo(0, 0);
    }
  }, [allProducts]);

  // Filter products based on selected filters
  useEffect(() => {
    let filtered = [...data];

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (minPrice) {
      const price = parseFloat(minPrice);
      filtered = filtered.filter(product => {
        const productPrice = product.discountPrice || product.originalPrice || 0;
        return productPrice >= price;
      });
    }

    if (maxPrice) {
      const price = parseFloat(maxPrice);
      filtered = filtered.filter(product => {
        const productPrice = product.discountPrice || product.originalPrice || 0;
        return productPrice <= price;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [data, selectedCategory, minPrice, maxPrice]);

  // Pagination logic
  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem) || [];

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={isRTL ? "rtl" : "ltr"}>
          <Header activeHeading={2} />
          
          {/* Compact Hero Section */}
          <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}></div>
            </div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-center">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center mb-3 sm:mb-4 gap-3">
                  <FiTrendingUp className="text-2xl sm:text-3xl text-white mx-auto sm:mx-0 sm:mr-3" />
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                    {t("bestSellingPage.title", "Best Selling Products")}
                  </h1>
                </div>
                
                {/* Compact Stats */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
                  <div className="text-center px-2">
                    <div className="text-lg sm:text-xl font-bold text-white">{filteredData?.length || 0}</div>
                    <div className="text-orange-200 text-xs font-medium">{t("bestSellingPage.bestSellers", "Best Sellers")}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {data.length > 0 ? data[0]?.sold_out || 0 : 0}
                    </div>
                    <div className="text-orange-200 text-xs font-medium">{t("bestSellingPage.topSellerUnits", "Top Seller Units")}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg sm:text-xl font-bold text-white">{categories?.length || 0}</div>
                    <div className="text-orange-200 text-xs font-medium">{t("bestSellingPage.categories", "Categories")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Professional Filter Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{t("bestSellingPage.filterTitle", "Filter Best Sellers")}</h2>
                <div className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <FiFilter size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="font-semibold">{t("bestSellingPage.filters", "Filters")}</span>
                  </button>

                  {(selectedCategory || minPrice || maxPrice) && (
                    <button
                      onClick={resetFilters}
                      className="px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-red-600 border-2 border-gray-300 rounded-xl hover:border-red-300 transition-all duration-300 font-semibold text-sm sm:text-base"
                    >
{t("bestSellingPage.reset", "Reset")}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">{t("bestSellingPage.filterOptions", "Filter Options")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Category Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <FiStar className="mr-2 text-orange-500" />
{t("bestSellingPage.category", "Category")}
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base"
                      >
                        <option value="">{t("bestSellingPage.allCategories", "All Categories")}</option>
                        {categories && categories.length > 0 ? categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        )) : null}
                      </select>
                    </div>

                    {/* Min Price */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span className="mr-2 text-orange-500">$</span>
{t("bestSellingPage.minPrice", "Min Price")}
                      </label>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base"
                      />
                    </div>

                    {/* Max Price */}
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span className="mr-2 text-orange-500">$</span>
{t("bestSellingPage.maxPrice", "Max Price")}
                      </label>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="1000"
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compact Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
{t("bestSellingPage.bestSellersFound", "{{count}} Best Seller{{plural}} Found", { 
                    count: filteredData?.length || 0, 
                    plural: (filteredData?.length || 0) !== 1 ? 's' : '' 
                  })}
                </h3>
                {(selectedCategory || minPrice || maxPrice) && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 hidden sm:inline">•</span>
                    <span className="text-xs text-gray-600">
                      {selectedCategory && t("bestSellingPage.categoryFilter", "Category: {{category}}", { category: selectedCategory })}
                      {(minPrice || maxPrice) && ` • ${t("bestSellingPage.priceFilter", "Price: {{min}} - {{max}}", { min: minPrice || '0', max: maxPrice || '∞' })}`}
                    </span>
                  </div>
                )}
              </div>
              
              {(filteredData?.length || 0) > 0 && (
                <div className="text-xs text-gray-500 font-medium">
{t("bestSellingPage.pageOf", "Page {{current}} of {{total}}", { current: currentPage, total: totalPages })}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {(filteredData?.length || 0) === 0 ? (
              <div className="text-center py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <div className="max-w-md mx-auto px-4">
                  <div className="text-gray-400 mb-4 sm:mb-6">
                    <FiShoppingBag size={64} className="sm:w-20 sm:h-20 mx-auto" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
{t("bestSellingPage.noBestSellersFound", "No best sellers found")}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                    {(selectedCategory || minPrice || maxPrice)
                      ? t("bestSellingPage.tryAdjustingFilters", "Try adjusting your filters to find more best-selling products")
                      : t("bestSellingPage.noBestSellersAvailable", "No best-selling products are currently available. Check back soon!")
                    }
                  </p>
                  {(selectedCategory || minPrice || maxPrice) && (
                    <button
                      onClick={resetFilters}
                      className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
{t("bestSellingPage.clearAllFilters", "Clear All Filters")}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 xl:gap-8 mb-8 sm:mb-12">
                {currentItems && currentItems.length > 0 ? currentItems.map((product, index) => (
                  <div key={product._id} className="relative">
                    {/* Ranking Badge */}
                    <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full shadow-lg">
                      #{indexOfFirstItem + index + 1}
                    </div>
                    <ProductCard data={product} key={product._id} />
                  </div>
                )) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">No products found</p>
                  </div>
                )}
              </div>
            )}

            {/* Professional Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 sm:mt-12">
                <div className="flex items-center space-x-1 sm:space-x-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-1 sm:p-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>
                  
                  {Array.from({ length: Math.min(totalPages, window.innerWidth < 640 ? 5 : 7) }, (_, i) => {
                    let pageNum;
                    const maxVisible = window.innerWidth < 640 ? 5 : 7;
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
                        className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
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
                    className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Footer />
        </div>
      )}
    </>
  );
};

export default BestSellingPage;
