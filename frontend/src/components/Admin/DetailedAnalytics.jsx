import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import { toast } from "react-toastify";
import { 
  FiEye, FiHeart, FiTrendingUp, FiPackage, FiCalendar, 
  FiUsers, FiBarChart2, FiMessageCircle, FiStar, FiShoppingBag,
  FiRefreshCw, FiFilter, FiSearch, FiDownload
} from "react-icons/fi";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import Loader from "../Layout/Loader";

const DetailedAnalytics = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('products'); // products, events, sellers
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [sortBy, setSortBy] = useState('views');
  const [searchTerm, setSearchTerm] = useState('');
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    fetchData();
  }, [activeTab, sortBy, limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      let endpoint = '';
      let params = { sortBy, limit };

      if (activeTab === 'products') {
        endpoint = `${server}/api/admin/analytics/products`;
      } else if (activeTab === 'events') {
        endpoint = `${server}/api/admin/analytics/events`;
      } else if (activeTab === 'sellers') {
        endpoint = `${server}/api/admin/analytics/sellers`;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        setData(response.data[activeTab] || []);
      }
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error(`Error fetching ${activeTab} analytics`);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (activeTab === 'products') {
      return item.name?.toLowerCase().includes(searchLower) ||
             item.shop?.name?.toLowerCase().includes(searchLower);
    } else if (activeTab === 'events') {
      return item.name?.toLowerCase().includes(searchLower) ||
             item.shop?.name?.toLowerCase().includes(searchLower);
    } else if (activeTab === 'sellers') {
      return item.name?.toLowerCase().includes(searchLower) ||
             item.email?.toLowerCase().includes(searchLower) ||
             item.shop?.name?.toLowerCase().includes(searchLower);
    }
    return true;
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num || 0;
  };

  const getImageUrl = (images) => {
    if (!images || !images.length) return '/placeholder-image.jpg';
    if (typeof images[0] === 'string') return images[0];
    return images[0]?.url || '/placeholder-image.jpg';
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {t("analytics.detailedAnalytics", "Detailed Analytics")}
        </h1>
        <p className="text-gray-600">
          {t("analytics.detailedDesc", "Comprehensive performance metrics for products, events, and sellers")}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-2 p-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiPackage />
            {t("analytics.products", "Products")}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiCalendar />
            {t("analytics.events", "Events")}
          </button>
          <button
            onClick={() => setActiveTab('sellers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'sellers'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiUsers />
            {t("analytics.sellers", "Sellers")}
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("analytics.search", "Search...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="views">{t("analytics.sortByViews", "Most Views")}</option>
            <option value="favorites">{t("analytics.sortByFavorites", "Most Favorites")}</option>
            <option value="whatsapp">{t("analytics.sortByWhatsApp", "Most WhatsApp Clicks")}</option>
            <option value="telegram">{t("analytics.sortByTelegram", "Most Telegram Clicks")}</option>
            <option value="engagement">{t("analytics.sortByEngagement", "Highest Engagement")}</option>
            {activeTab === 'sellers' && (
              <>
                <option value="products">{t("analytics.sortByProducts", "Most Products")}</option>
                <option value="profileViews">{t("analytics.sortByProfileViews", "Profile Views")}</option>
              </>
            )}
          </select>

          {/* Limit */}
          <select
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="20">Top 20</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>

          {/* Refresh */}
          <button
            onClick={fetchData}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            title={t("analytics.refresh", "Refresh")}
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {t("analytics.showing", "Showing")} {filteredData.length} {t("analytics.results", "results")}
      </div>

      {/* Products Table */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("analytics.product", "Product")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("analytics.shop", "Shop")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiEye /> {t("analytics.views", "Views")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiHeart /> {t("analytics.favorites", "Favorites")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FaWhatsapp /> WhatsApp
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FaTelegram /> Telegram
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiTrendingUp /> {t("analytics.engagement", "Engagement")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiStar /> {t("analytics.rating", "Rating")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiShoppingBag /> {t("analytics.sold", "Sold")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((product, index) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12">
                          <img
                            src={getImageUrl(product.images)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ${product.discountPrice}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {product.shop?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatNumber(product.viewCount)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {formatNumber(product.favoritesCount)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.favoriteRate}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {formatNumber(product.whatsappClicks)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.whatsappRate}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatNumber(product.telegramClicks)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {product.telegramRate}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {formatNumber(product.totalEngagement)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FiStar className="text-yellow-400" />
                        <span className="text-sm font-medium">{product.ratings?.toFixed(1) || '0.0'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-gray-900">
                      {product.sold_out || 0}
                      <div className="text-xs text-gray-500 mt-1">
                        {product.conversionRate}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Events Table */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("analytics.event", "Event")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("analytics.shop", "Shop")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiEye /> {t("analytics.views", "Views")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiHeart /> {t("analytics.favorites", "Favorites")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FaWhatsapp /> WhatsApp
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FaTelegram /> Telegram
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiTrendingUp /> {t("analytics.engagement", "Engagement")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("analytics.status", "Status")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12">
                          <img
                            src={getImageUrl(event.images)}
                            alt={event.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {event.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.start_Date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {event.shop?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatNumber(event.viewCount)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {formatNumber(event.favoritesCount)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.favoriteRate}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {formatNumber(event.whatsappClicks)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.whatsappRate}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatNumber(event.telegramClicks)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {event.telegramRate}%
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {formatNumber(event.totalEngagement)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === 'Running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sellers Table */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("analytics.seller", "Seller")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("analytics.products", "Products")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("analytics.events", "Events")}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiEye /> {t("analytics.profileViews", "Profile Views")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiEye /> {t("analytics.productViews", "Product Views")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FaWhatsapp /> WhatsApp
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FaTelegram /> Telegram
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiHeart /> {t("analytics.favorites", "Favorites")}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center justify-center gap-1">
                      <FiTrendingUp /> {t("analytics.totalEngagement", "Total Engagement")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {seller.name?.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {seller.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {seller.shop?.name || 'No shop'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {seller.productsCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {seller.eventsCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {formatNumber(seller.shop?.profileViews || 0)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatNumber((seller.totalProductViews || 0) + (seller.totalEventViews || 0))}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {formatNumber((seller.totalProductWhatsApp || 0) + (seller.totalEventWhatsApp || 0))}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {formatNumber((seller.totalProductTelegram || 0) + (seller.totalEventTelegram || 0))}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        {formatNumber((seller.totalProductFavorites || 0) + (seller.totalEventFavorites || 0))}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
                        {formatNumber(seller.totalEngagement || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FiBarChart2 className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("analytics.noData", "No Data Found")}
          </h3>
          <p className="text-gray-500">
            {t("analytics.noDataDesc", "Try adjusting your filters or search term")}
          </p>
        </div>
      )}
    </div>
  );
};

export default DetailedAnalytics;

