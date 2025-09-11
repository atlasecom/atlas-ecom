import React, { useEffect, useState } from "react";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { server } from "../server";
import { getAuthToken } from "../utils/auth";
import Avatar from "../components/Common/Avatar";
import { AiOutlineShop, AiOutlineMail, AiOutlinePhone, AiOutlineEnvironment, AiOutlineStar, AiOutlineCalendar, AiOutlineEye } from "react-icons/ai";
import { Link } from "react-router-dom";
import { categoriesData } from "../static/data";

const SellersPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const sellersPerPage = 12;

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${server}/shops`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const sellersWithStats = await Promise.all(
          response.data.shops.map(async (seller) => {
            try {
              // Fetch products count for this seller
              const productsResponse = await axios.get(`${server}/products?shop=${seller._id}&limit=1000`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              const productCount = productsResponse.data.success ? productsResponse.data.products.length : 0;
              
              // Calculate average rating from products
              let totalRating = 0;
              let ratingCount = 0;
              
              if (productsResponse.data.success && productsResponse.data.products.length > 0) {
                productsResponse.data.products.forEach(product => {
                  if (product.ratings && product.ratings.length > 0) {
                    const productRating = product.ratings.reduce((sum, rating) => sum + rating, 0) / product.ratings.length;
                    totalRating += productRating;
                    ratingCount++;
                  }
                });
              }
              
              const averageRating = ratingCount > 0 ? totalRating / ratingCount : null;
              
              return {
                ...seller,
                productCount,
                averageRating
              };
            } catch (error) {
              console.error(`Error fetching stats for seller ${seller._id}:`, error);
              return {
                ...seller,
                productCount: 0,
                averageRating: null
              };
            }
          })
        );
        
        setSellers(sellersWithStats);
      } else {
        console.error("Failed to fetch sellers");
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort sellers
  const filteredSellers = sellers
    .filter(seller => {
      if (!searchTerm && categoryFilter === "all") {
        return true; // Show all sellers when no filters applied
      }
      
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = !searchTerm || 
                           seller.name?.toLowerCase().includes(searchLower) ||
                           seller.description?.toLowerCase().includes(searchLower) ||
                           seller.category?.toLowerCase().includes(searchLower) ||
                           seller.owner?.email?.toLowerCase().includes(searchLower);
      
      const matchesCategory = categoryFilter === "all" || seller.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredSellers.length / sellersPerPage);
  const indexOfLastSeller = currentPage * sellersPerPage;
  const indexOfFirstSeller = indexOfLastSeller - sellersPerPage;
  const currentSellers = filteredSellers.slice(indexOfFirstSeller, indexOfLastSeller);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className={isRTL ? 'rtl' : 'ltr'}>
        <Header activeHeading={5} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading amazing sellers...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className={isRTL ? 'rtl' : 'ltr'}>
      <Header activeHeading={5} />
      
      {/* Compact Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
              Discover Amazing Sellers
            </h1>
            <p className="text-sm sm:text-base text-orange-100 mb-4 max-w-3xl mx-auto">
              Connect with verified shops and discover unique products from trusted sellers across Morocco
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
                <span className="font-semibold">{sellers.length}+</span> Verified Sellers
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
                <span className="font-semibold">24/7</span> Support
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
                <span className="font-semibold">100%</span> Secure
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          
          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search sellers by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 text-gray-900 placeholder-gray-500"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                >
                  <option value="all">{t("sellersPage.allCategories", "All Categories")}</option>
                  {categoriesData.map((cat) => (
                    <option key={cat.id} value={cat.title.en}>
                      {cat.title[i18n.language] || cat.title.en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>



          {/* Search Results Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filteredSellers.length} Seller{filteredSellers.length !== 1 ? 's' : ''} Found
                </h2>
                {searchTerm && (
                  <p className="text-gray-600 mt-1">
                    Results for "<span className="font-semibold text-orange-600">{searchTerm}</span>"
                  </p>
                )}
                <p className="text-gray-500 text-sm mt-1">
                  Showing {indexOfFirstSeller + 1}-{Math.min(indexOfLastSeller, filteredSellers.length)} of {filteredSellers.length} results
                </p>
              </div>
              {(searchTerm || categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setSortBy('newest');
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 text-sm text-orange-600 hover:text-orange-700 font-medium hover:bg-orange-50 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Sellers Grid */}
          {currentSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentSellers.map((seller) => (
                <div key={seller._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 border border-gray-100">
                  {/* Header with Orange Background */}
                  <div 
                    className="relative h-20 overflow-hidden"
                    style={{
                      background: (() => {
                        // Generate different orange gradient backgrounds for variety
                        const gradients = [
                          'linear-gradient(135deg, #f97316 0%, #dc2626 100%)',
                          'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                          'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)',
                          'linear-gradient(135deg, #fdba74 0%, #f97316 100%)',
                          'linear-gradient(135deg, #fed7aa 0%, #fb923c 100%)'
                        ];
                        // Use seller ID to consistently assign colors
                        const colorIndex = seller._id.charCodeAt(seller._id.length - 1) % gradients.length;
                        return gradients[colorIndex];
                      })()
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    
                    {/* Verified Badge */}
                    {seller.isVerified && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 shadow-lg">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Shop Info */}
                  <div className="p-6">
                    {/* Avatar and Name */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative">
                        <Avatar user={seller.owner} size="lg" className="w-16 h-16 border-4 border-white shadow-lg" />
                        {seller.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                          {seller.name}
                        </h3>
                        {seller.category && (
                          <span className="inline-block bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium mt-1">
                            {seller.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {seller.description && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {seller.description}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mb-4">
                      {seller.owner?.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <AiOutlineMail className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="truncate">{seller.owner.email}</span>
                        </div>
                      )}
                      
                      {seller.phoneNumber && (
                        <div className="flex items-center text-sm text-gray-600">
                          <AiOutlinePhone className="w-4 h-4 mr-2 text-orange-500" />
                          <span>{seller.phoneNumber}</span>
                        </div>
                      )}
                      
                      {seller.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <AiOutlineEnvironment className="w-4 h-4 mr-2 text-orange-500" />
                          <span className="truncate">{seller.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="text-2xl font-bold text-orange-600">
                          {seller.productCount !== undefined ? seller.productCount : '...'}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Products</div>
                        {seller.productCount > 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            Active Shop
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                        <div className="text-2xl font-bold text-orange-600">
                          {seller.averageRating ? seller.averageRating.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 font-medium">Rating</div>
                        {seller.averageRating ? (
                          <div className="flex items-center justify-center mt-1">
                            {[...Array(5)].map((_, index) => (
                              <svg
                                key={index}
                                className={`w-3 h-3 ${
                                  index < Math.floor(seller.averageRating) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">
                              ({seller.averageRating.toFixed(1)})
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 mt-1">
                            No ratings yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Join Date */}
                    <div className="text-center text-xs text-gray-400 mb-4">
                      <AiOutlineCalendar className="w-4 h-4 inline mr-1" />
                      Joined {new Date(seller.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : 'en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}
                    </div>

                    {/* View Shop Button */}
                    <Link
                      to={`/shop/preview/${seller._id}`}
                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <AiOutlineEye className="w-5 h-5" />
                      View Shop
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <AiOutlineShop className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
{t(searchTerm || categoryFilter !== "all" ? "sellersPage.noSellersFound" : "sellersPage.noSellersAvailable", searchTerm || categoryFilter !== "all" ? "No sellers found" : "No sellers available")}
              </h3>
              <p className="text-gray-500 mb-6">
{t(searchTerm || categoryFilter !== "all" 
                  ? "sellersPage.noSellersMatchSearch" 
                  : "sellersPage.noSellersRegistered", 
                  searchTerm || categoryFilter !== "all" 
                    ? `No sellers match your search for "${searchTerm}"${categoryFilter !== "all" ? ` in ${categoryFilter}` : ""}`
                    : "There are currently no sellers registered on the platform"
                )}
              </p>
              {(searchTerm || categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setSortBy("newest");
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors"
                >
{t("sellersPage.clearAllFilters", "Clear All Filters")}
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                </svg>
                Previous
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isActive = currentPage === pageNumber;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${
                        isActive 
                          ? "bg-orange-600 text-white shadow-lg transform scale-105" 
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-orange-300"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SellersPage;
