import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Loader from "../components/Layout/Loader";
import ProductCard from "../components/Route/ProductCard/ProductCardNew";
import styles from "../styles/styles";
import axios from "axios";
import { server } from "../server";
import { useTranslation } from "react-i18next";
import { categoriesData } from "../static/data";
import { toast } from "react-toastify";
import { getAuthToken } from "../utils/auth";

const ProductsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [searchParams] = useSearchParams();
  const categoryData = searchParams.get("category");

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sellers, setSellers] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryData || "");
  const [selectedSeller, setSelectedSeller] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Mobile filter state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch sellers for dropdown
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const token = getAuthToken();
        const { data } = await axios.get(`${server}/shops`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(data);

        setSellers(data.shops || []);
      } catch (err) {
        console.error("Failed to fetch sellers", err);
        toast.error(
          t("productsPage.fetchSellersError", "Failed to fetch sellers")
        );
      }
    };
    fetchSellers();
  }, [t]);

  // Fetch all products (no filtering on server)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      const { data } = await axios.get(`${server}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setAllProducts([]);
      toast.error(
        t("productsPage.fetchProductsError", "Failed to fetch products")
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch products when component mounts or URL params change
  useEffect(() => {
    // Set category from URL if present
    if (categoryData) {
      setSelectedCategory(categoryData);
    }
    fetchProducts();
  }, [categoryData]);

  // Client-side filtering logic
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || 
      product.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSeller = !selectedSeller || 
      product.shop?._id === selectedSeller;

    const matchesMinPrice = !minPrice || 
      (product.discountPrice || product.originalPrice) >= parseFloat(minPrice);

    const matchesMaxPrice = !maxPrice || 
      (product.discountPrice || product.originalPrice) <= parseFloat(maxPrice);

    return matchesSearch && matchesCategory && matchesSeller && matchesMinPrice && matchesMaxPrice;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset filters handler
  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory(categoryData || ""); // Keep URL category if present
    setSelectedSeller("");
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className={isRTL ? "rtl" : "ltr"}>
          <Header activeHeading={3} />
          
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
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                  {t("productsPage.title", "Discover Amazing Products")} - {i18n.language}
                </h1>
                
                {/* Compact Stats */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
                  <div className="text-center px-2">
                    <div className="text-lg sm:text-xl font-bold text-white">{allProducts.length}</div>
                    <div className="text-orange-200 text-xs font-medium">{t("productsPage.totalProducts", "Total Products")}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg sm:text-xl font-bold text-white">{sellers.length}</div>
                    <div className="text-orange-200 text-xs font-medium">{t("productsPage.sellers", "Sellers")}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg sm:text-xl font-bold text-white">{categoriesData.length}</div>
                    <div className="text-orange-200 text-xs font-medium">{t("productsPage.categories", "Categories")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* === Compact Filter Section === */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t("productsPage.searchPlaceholder", "Search products...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                
                {/* Mobile Filter Toggle */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="w-full bg-orange-500 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors duration-300 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13H5a1 1 0 01-1-1V4z" />
                    </svg>
{t(showMobileFilters ? "productsPage.hideFilters" : "productsPage.showFilters", showMobileFilters ? "Hide Filters" : "Show Filters")}
                  </button>
                </div>

                {/* Mobile Filters */}
                {showMobileFilters && (
                  <div className="sm:hidden space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 text-sm"
                      >
                        <option value="">{t("productsPage.allCategories", "All Categories")}</option>
                        {categoriesData.map((cat) => (
                          <option key={cat.id} value={cat.title.en}>
                            {cat.title[i18n.language] || cat.title.en}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={selectedSeller}
                        onChange={(e) => setSelectedSeller(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 text-sm"
                      >
                        <option value="">{t("productsPage.allSellers", "All Sellers")}</option>
                        {sellers.map((seller) => (
                          <option key={seller._id} value={seller._id}>
                            {seller.name}
                          </option>
                        ))}
                      </select>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder={t("productsPage.minPrice", "Min Price")}
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 text-sm"
                        />
                        <span className="text-gray-500 text-sm">{t("productsPage.to", "to")}</span>
                        <input
                          type="number"
                          placeholder={t("productsPage.maxPrice", "Max Price")}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 text-sm"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-orange-300 hover:text-orange-600 transition-all duration-300 text-sm"
                    >
{t("productsPage.resetFilters", "Reset Filters")}
                    </button>
                  </div>
                )}

                {/* Desktop Filters */}
                <div className="hidden sm:flex flex-1 items-center gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 text-sm"
                  >
                    <option value="">{t("productsPage.allCategories", "All Categories")}</option>
                    {categoriesData.map((cat) => (
                      <option key={cat.id} value={cat.title.en}>
                        {cat.title[i18n.language] || cat.title.en}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={selectedSeller}
                    onChange={(e) => setSelectedSeller(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 text-sm"
                  >
                    <option value="">{t("productsPage.allSellers", "All Sellers")}</option>
                    {sellers.map((seller) => (
                      <option key={seller._id} value={seller._id}>
                        {seller.name}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex items-center gap-2 min-w-0">
                    <input
                      type="number"
                      placeholder={t("productsPage.min", "Min")}
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 text-sm"
                    />
                    <span className="text-gray-500 text-sm">-</span>
                    <input
                      type="number"
                      placeholder={t("productsPage.max", "Max")}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-20 px-2 py-2 border border-gray-200 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all duration-300 text-sm"
                    />
                  </div>
                  
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:border-orange-300 hover:text-orange-600 transition-all duration-300 text-sm whitespace-nowrap"
                  >
{t("productsPage.reset", "Reset")}
                  </button>
                </div>
              </div>
            </div>

            {/* === Compact Results Header === */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                  {loading ? (
                    t("productsPage.loadingProducts", "Loading products...")
                  ) : (
                    filteredProducts.length === 1 
                      ? t("productsPage.productsFoundSingular", "{{count}} Product Found", { count: filteredProducts.length }) + ` - ${i18n.language}`
                      : t("productsPage.productsFoundPlural", "{{count}} Products Found", { count: filteredProducts.length }) + ` - ${i18n.language}`
                  )}
                </h3>
                {(searchTerm || selectedSeller || selectedCategory || minPrice || maxPrice) && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 hidden sm:inline">•</span>
                    <span className="text-xs text-gray-600">
                      {searchTerm && t("productsPage.searchFilter", "Search: \"{{term}}\"", { term: searchTerm })}
                      {selectedSeller && ` • ${t("productsPage.sellerFilter", "Seller: {{name}}", { name: sellers.find(s => s._id === selectedSeller)?.name || 'Selected' })}`}
                      {selectedCategory && ` • ${t("productsPage.categoryFilter", "Category: {{category}}", { category: selectedCategory })}`}
                      {(minPrice || maxPrice) && ` • ${t("productsPage.priceFilter", "Price: {{min}} - {{max}}", { min: minPrice || '0', max: maxPrice || '∞' })}`}
                    </span>
                  </div>
                )}
              </div>
              
              {filteredProducts.length > 0 && (
                <div className="text-xs text-gray-500 font-medium">
{t("productsPage.pageOf", "Page {{current}} of {{total}}", { current: currentPage, total: totalPages })}
                </div>
              )}
            </div>

            {/* === Product Grid === */}
            {filteredProducts.length === 0 && !loading ? (
              <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="max-w-md mx-auto px-4">
                  <div className="text-gray-400 mb-3 sm:mb-4">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {t("productsPage.noProductsFound", "No products found")}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    {(searchTerm || selectedSeller || selectedCategory || minPrice || maxPrice)
                      ? t("productsPage.tryAdjustingFilters", "Try adjusting your search criteria or filters to find more products")
                      : t("productsPage.noProductsAvailable", "No products are currently available. Check back soon for new products!")
                    }
                  </p>
                  {(searchTerm || selectedSeller || selectedCategory || minPrice || maxPrice) && (
                    <button
                      onClick={resetFilters}
                      className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                    >
{t("productsPage.clearAllFilters", "Clear All Filters")}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 xl:gap-8 mb-8 sm:mb-12">
                {currentItems &&
                  currentItems.map((i, index) => (
                    <ProductCard data={i} isEvent={false} key={index} />
                  ))}
              </div>
            )}

            {/* === Compact Pagination === */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 sm:mt-8">
                <div className="flex items-center space-x-1 bg-white rounded-lg shadow-md border border-gray-200 p-1">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <span className="hidden sm:inline">{t("productsPage.prev", "Previous")}</span>
                    <span className="sm:hidden">{t("productsPage.prevShort", "Prev")}</span>
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
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300 ${
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
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <span className="hidden sm:inline">{t("productsPage.next", "Next")}</span>
                    <span className="sm:hidden">{t("productsPage.nextShort", "Next")}</span>
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

export default ProductsPage;
