import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../src/server";
import { Link } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import { useTranslation } from "react-i18next";
import Avatar from "../components/Common/Avatar";

const SellerGrid = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const sellersPerPage = 10; // Change as needed

  useEffect(() => {
    const token = getAuthToken();
    axios
      .get(`${server}/shops`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setSellers(res.data.shops);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load sellers:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-lg text-gray-600">{t('sellers.loading', 'Loading sellers...')}</p>
    </div>
  );

  // Pagination logic
  const totalPages = Math.ceil(sellers.length / sellersPerPage);
  const indexOfLastSeller = currentPage * sellersPerPage;
  const indexOfFirstSeller = indexOfLastSeller - sellersPerPage;
  const currentSellers = sellers.slice(indexOfFirstSeller, indexOfLastSeller);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t('sellers.title', 'Our Sellers')}
        </h1>
        <p className="text-gray-600">
          {t('sellers.subtitle', 'Discover amazing shops and their products')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentSellers.map((seller) => (
          <Link
            to={`/shop/preview/${seller._id}`}
            key={seller._id}
            className="group bg-white shadow-md rounded-2xl hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            {/* Banner Image with Status Badge */}
            <div className="relative h-32 w-full overflow-hidden">
              <img
                src={seller.banner || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDQwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjEyOCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNjM2NkYxIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzM4NTVGNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMTI4IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+CjxjaXJjbGUgY3g9IjgwIiBjeT0iMzIiIHI9IjgiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMyIvPgo8Y2lyY2xlIGN4PSIzMjAiIGN5PSI5NiIgcj0iMTIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8Y2lyY2xlIGN4PSIzNjAiIGN5PSIyNCIgcj0iNiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yNSIvPgo8L3N2Zz4K"}
                alt="Seller Banner"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDQwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXIiIHgxPSIwIiB5MT0iMCIgeDI9IjQwMCIgeTI9IjEyOCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjNjM2NkYxIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzM4NTVGNSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMTI4IiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXIpIi8+CjxjaXJjbGUgY3g9IjgwIiBjeT0iMzIiIHI9IjgiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMyIvPgo8Y2lyY2xlIGN4PSIzMjAiIGN5PSI5NiIgcj0iMTIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8Y2lyY2xlIGN4PSIzNjAiIGN5PSIyNCIgcj0iNiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4yNSIvPgo8L3N2Zz4K";
                }}
              />
              {/* Status Badge */}
              <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  {t('sellers.status.active', 'Active')}
                </span>
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>

            {/* Seller Content */}
            <div className="p-6 relative">
              {/* Avatar with Status Ring */}
              <div className="relative mx-auto w-fit -mt-12 mb-4">
                <div className="relative z-10">
                  <Avatar 
                    user={seller.owner || { name: seller.name }} 
                    size="2xl" 
                    className="w-20 h-20 border-4 border-white shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 p-1 -m-1">
                  <div className="bg-white rounded-full w-full h-full"></div>
                </div>
              </div>

              {/* Shop Info */}
              <div className="text-center space-y-2">
                <h3 className="font-bold text-lg text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                  {seller.name}
                </h3>
                
                {seller.description && (
                  <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                    {seller.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="space-y-1 text-sm text-gray-600">
                  {seller.owner?.email && (
                    <p className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="truncate">{seller.owner.email}</span>
                    </p>
                  )}
                  
                  {seller.phoneNumber && (
                    <p className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span>{seller.phoneNumber}</span>
                    </p>
                  )}
                  
                  {seller.address && (
                    <p className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{seller.address}</span>
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-4 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">{seller.productCount}</p>
                    <p className="text-xs text-gray-500">{t('sellers.stats.products', 'Products')}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">
                      {seller.eventCount}
                    </p>
                    <p className="text-xs text-gray-500">{t('sellers.stats.events', 'Events')}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800">{seller.reviews?.length || 0}</p>
                    <p className="text-xs text-gray-500">{t('sellers.stats.reviews', 'Reviews')}</p>
                  </div>
                </div>

                {/* Join Date */}
                <div className="pt-2">
                  <p className="text-xs text-gray-400">
                    {t('sellers.joinDate', 'Joined {{date}}', {
                      date: new Date(seller.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-MA' : 'en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"></div>
          </Link>
        ))}
      </div>

      {/* Enhanced Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-12">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
            </svg>
            {t('sellers.pagination.previous', 'Previous')}
          </button>

          <div className="flex gap-1">
            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              const isActive = currentPage === pageNumber;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg transform scale-105" 
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            {t('sellers.pagination.next', 'Next')}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRTL ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
            </svg>
          </button>
        </div>
      )}

      {/* Results summary */}
      <div className="text-center mt-6">
        <p className="text-gray-500 text-sm">
          {t('sellers.pagination.showing', 'Showing {{start}}-{{end}} of {{total}} sellers', {
            start: indexOfFirstSeller + 1,
            end: Math.min(indexOfLastSeller, sellers.length),
            total: sellers.length
          })}
        </p>
      </div>
    </div>
  );
};

export default SellerGrid;
