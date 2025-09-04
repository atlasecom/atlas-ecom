import React, { useEffect, useState } from "react";
import axios from "axios";
import { AiOutlineEye, AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { FiSearch, FiFilter, FiX, FiCalendar, FiMapPin, FiTag, FiDollarSign } from "react-icons/fi";
import { Link } from "react-router-dom";
import { server, backend_url } from "../../server";
import { useTranslation } from "react-i18next";
import { getAuthToken } from "../../utils/auth";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";

const AllEvents = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState("");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchEvents();
  }, []);

    const fetchEvents = async () => {
    setLoading(true);
      try {
        const token = getAuthToken();
      const response = await axios.get(`${server}/events/admin`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(response.data.events || []);
      } catch (error) {
        console.error("Error fetching events:", error);
        toast.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories and statuses from events
  const categories = [...new Set(events.map(event => event.category).filter(Boolean))];
  const statuses = [...new Set(events.map(event => event.status || 'active').filter(Boolean))];

  // Filter events based on search and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    const matchesStatus = !selectedStatus || (event.status || 'active') === selectedStatus;
    
    const eventPrice = event.discountPrice || event.originalPrice || 0;
    const matchesMinPrice = !minPrice || eventPrice >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || eventPrice <= parseFloat(maxPrice);

    return matchesSearch && matchesCategory && matchesStatus && matchesMinPrice && matchesMaxPrice;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedStatus("");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    try {
      const token = getAuthToken();
      const response = await axios.delete(`${server}/events/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(response.data.message || "Event deleted successfully");
      // Refresh the events list
      const updatedEvents = events.filter(event => event._id !== id);
      setEvents(updatedEvents);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get image URL with multiple fallbacks and null checks
  const getImageUrl = (event) => {
    if (event?.images && Array.isArray(event.images) && event.images.length > 0) {
      const imageObj = event.images[0];
      // Check if imageObj is an object with url property
      if (imageObj && typeof imageObj === 'object' && imageObj.url) {
        const imageUrl = imageObj.url;
        if (typeof imageUrl === 'string' && imageUrl.startsWith("http")) {
          return imageUrl;
        }
        if (typeof imageUrl === 'string') {
          return `${backend_url.replace(/\/$/, "")}/${imageUrl.replace(/^\//, "")}`;
        }
      }
      // Fallback for old format where images might be direct strings
      if (typeof imageObj === 'string') {
        if (imageObj.startsWith("http")) {
          return imageObj;
        }
        return `${backend_url.replace(/\/$/, "")}/${imageObj.replace(/^\//, "")}`;
      }
    }
    return '/default-event.png';
  };

  if (loading) {
        return (
      <div className="w-full flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen flex-1">
      {/* Mobile Menu Indicator */}
      <div className="lg:hidden p-3 sm:p-4 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiCalendar className="text-blue-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">Mobile Navigation</p>
            <p className="text-xs text-blue-700">Use the blue menu button in the header to navigate</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {t("admin.allEvents.title", "Manage Events")}
              </h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">
                {t("admin.allEvents.subtitle", "View, edit, and manage all events in your system")}
              </p>
            </div>

          </div>
        </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
          {/* Search Bar */}
          <div className="flex-1 w-full">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t("admin.allEvents.searchPlaceholder", "Search events by name, description, or category...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
          >
            <FiFilter size={18} />
            <span className="text-sm sm:text-base">{t("admin.allEvents.filters", "Filters")}</span>
          </button>

          {/* Reset Filters Button */}
          {(searchTerm || selectedCategory || selectedStatus || minPrice || maxPrice) && (
            <button
              onClick={resetFilters}
              className="w-full sm:w-auto px-4 py-2 sm:py-3 text-gray-600 hover:text-red-600 border border-gray-300 rounded-lg hover:border-red-300 transition-colors text-sm sm:text-base"
            >
              {t("admin.allEvents.reset", "Reset")}
            </button>
          )}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiTag className="inline mr-2 text-xs sm:text-sm" />
                  {t("admin.allEvents.category", "Category")}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">{t("admin.allEvents.allCategories", "All Categories")}</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiCalendar className="inline mr-2 text-xs sm:text-sm" />
                  {t("admin.allEvents.status", "Status")}
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">{t("admin.allEvents.allStatuses", "All Statuses")}</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiDollarSign className="inline mr-2 text-xs sm:text-sm" />
                  {t("admin.allEvents.minPrice", "Min Price")}
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  <FiDollarSign className="inline mr-2 text-xs sm:text-sm" />
                  {t("admin.allEvents.maxPrice", "Max Price")}
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-4 sm:mb-6 text-center">
        <p className="text-xs sm:text-sm text-gray-600">
          {t("admin.allEvents.resultsSummary", "Showing {{count}} of {{total}} events", {
            count: filteredEvents.length,
            total: events.length
          })}
          {searchTerm && ` matching "${searchTerm}"`}
          {selectedCategory && ` in ${selectedCategory}`}
          {selectedStatus && ` with status ${selectedStatus}`}
        </p>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-gray-400 mb-4">
            <FiCalendar size={64} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("admin.allEvents.noEventsFound", "No events found")}
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory || selectedStatus || minPrice || maxPrice
              ? t("admin.allEvents.tryAdjustingFilters", "Try adjusting your search criteria or filters")
              : t("admin.allEvents.noEventsAvailable", "No events are currently available")
            }
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
            {currentItems.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
                {/* Event Image */}
                <div className="relative h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  {event.images && event.images.length > 0 ? (
                    <img
                      src={getImageUrl(event)}
                      alt={event.name || 'Event'}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.src = '/default-event.png';
                        e.target.onerror = null;
                      }}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                      <div className="text-center">
                        <FiCalendar size={48} className="text-blue-400 mx-auto mb-2" />
                        <p className="text-blue-600 text-sm font-medium">No Image</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Image Overlay on Hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"></div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full shadow-sm ${
                      (event.status || 'active') === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {event.status || 'active'}
                    </span>
                  </div>
                  
                  {/* Stock Badge */}
                  {event.stock === 0 && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full border border-red-200 shadow-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  
                  {/* Price Badge */}
                  {event.discountPrice && event.originalPrice && event.originalPrice > event.discountPrice && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        -{Math.round(((event.originalPrice - event.discountPrice) / event.originalPrice) * 100)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Content */}
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg mb-2 line-clamp-2">
                    {event.name}
                  </h3>
                  
                  <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                    {event.category && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <FiTag className="mr-2 text-xs sm:text-sm" size={14} />
                        <span className="truncate">{event.category}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <FiMapPin className="mr-2 text-xs sm:text-sm" size={14} />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <FiCalendar className="mr-2 text-xs sm:text-sm" size={14} />
                      <span>Stock: {event.stock || 0}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                      {event.discountPrice || event.originalPrice || 0} dh
                    </span>
                    {event.originalPrice && event.originalPrice > (event.discountPrice || 0) && (
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {event.originalPrice} dh
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to={`/product/${event._id}?isEvent=true`}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
                    >
                      <AiOutlineEye size={16} />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => {
                        setEventId(event._id);
                        setOpen(true);
                      }}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm"
                    >
                      <AiOutlineDelete size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 lg:mt-8">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("admin.allEvents.previous", "Previous")}
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("admin.allEvents.next", "Next")}
                </button>
              </div>
            </div>
          )}
        </>
      )}
      </div>

      {/* Delete Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4">
            <div className="flex justify-end cursor-pointer mb-4">
              <RxCross1 size={20} onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 text-center mb-4 sm:mb-6">
              {t("admin.allEvents.deleteConfirmation", "Are you sure you want to delete this event?")}
            </h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                className="w-full sm:flex-1 px-4 py-2 sm:py-3 bg-gray-500 text-white text-sm sm:text-base rounded-lg hover:bg-gray-600 transition-colors"
                onClick={() => setOpen(false)}
              >
                {t("admin.allEvents.cancel", "Cancel")}
              </button>
              <button
                className="w-full sm:flex-1 px-4 py-2 sm:py-3 bg-red-600 text-white text-sm sm:text-base rounded-lg hover:bg-red-700 transition-colors"
                onClick={() => handleDelete(eventId)}
              >
                {t("admin.allEvents.confirm", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;
