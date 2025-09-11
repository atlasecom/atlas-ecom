import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import EventCard from "../components/Events/EventCard";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import Loader from "../components/Layout/Loader";
import { useTranslation } from "react-i18next";
import { FiSearch, FiFilter, FiX, FiCalendar, FiMapPin, FiTag } from "react-icons/fi";
import { AiOutlineEye } from "react-icons/ai";
import { categoriesData } from "../static/data";

const EventsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { allEvents, isLoading } = useSelector((state) => state.events);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Get unique categories and locations from events
  const eventCategories = [...new Set(allEvents.map(event => event.category).filter(Boolean))];
  const categories = categoriesData.filter(cat =>
    eventCategories.includes(cat.title.en) ||
    eventCategories.includes(cat.title.fr) ||
    eventCategories.includes(cat.title.ar)
  );
  const locations = [...new Set(allEvents.map(event => event.location).filter(Boolean))];

  // Filter events based on search and filters
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = !searchTerm || 
      event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    const matchesLocation = !selectedLocation || event.location === selectedLocation;
    
    const eventPrice = event.discountPrice || event.originalPrice || 0;
    const matchesMinPrice = !minPrice || eventPrice >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || eventPrice <= parseFloat(maxPrice);

    return matchesSearch && matchesCategory && matchesLocation && matchesMinPrice && matchesMaxPrice;
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
    setSelectedLocation("");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={isRTL ? 'rtl' : 'ltr'}>
      <Header activeHeading={4} />
      
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
                  {t('eventsPage.title', 'Discover Amazing Events')} - {i18n.language}
                </h1>
                
                {/* Compact Stats */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6">
                  <div className="text-center px-2">
                    <div className="text-lg sm:text-xl font-bold text-white">{allEvents.length}</div>
                    <div className="text-orange-200 text-xs font-medium">{t("eventsPage.totalEvents", "Total Events")}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg sm:text-xl font-bold text-white">{categories.length}</div>
                    <div className="text-orange-200 text-xs font-medium">{t("eventsPage.categories", "Categories")}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="text-lg sm:text-xl font-bold text-white">{locations.length}</div>
                    <div className="text-orange-200 text-xs font-medium">{t("eventsPage.locations", "Locations")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Professional Filter Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Find Your Perfect Event</h2>
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <FiFilter size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="font-semibold">{t('eventsPage.filters', 'Filters')}</span>
              </button>

              {/* Reset Filters Button */}
              {(searchTerm || selectedCategory || selectedLocation || minPrice || maxPrice) && (
                <button
                  onClick={resetFilters}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-red-600 border-2 border-gray-300 rounded-xl hover:border-red-300 transition-all duration-300 font-semibold text-sm sm:text-base"
                >
                  {t('eventsPage.reset', 'Reset')}
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('eventsPage.searchPlaceholder', 'Search events by name, description, or category...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base lg:text-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX size={16} className="sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 sm:mb-6">{t('eventsPage.filterOptions', 'Filter Options')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <FiTag className="mr-2 text-orange-500" />
                    {t('eventsPage.category', 'Category')}
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base"
                  >
                    <option value="">{t('eventsPage.allCategories', 'All Categories')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.title.en}>
                        {category.title[i18n.language] || category.title.en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <FiMapPin className="mr-2 text-orange-500" />
                    {t('eventsPage.location', 'Location')}
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm sm:text-base"
                  >
                    <option value="">{t('eventsPage.allLocations', 'All Locations')}</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Price */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700">
                    <span className="mr-2 text-orange-500">DH</span>
                    {t('eventsPage.minPrice', 'Min Price')}
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
                    <span className="mr-2 text-orange-500">DH</span>
                    {t('eventsPage.maxPrice', 'Max Price')}
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

        {/* Compact Results Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
{t("eventsPage.eventsFound", "{{count}} Event{{plural}} Found", { 
                count: filteredEvents.length, 
                plural: filteredEvents.length !== 1 ? 's' : '' 
              })} - {i18n.language}
            </h3>
            {(searchTerm || selectedCategory || selectedLocation || minPrice || maxPrice) && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500 hidden sm:inline">•</span>
                <span className="text-xs text-gray-600">
                  {searchTerm && t("eventsPage.searchFilter", "\"{{term}}\"", { term: searchTerm })}
                  {selectedCategory && ` ${t("eventsPage.inCategory", "in {{category}}", { category: selectedCategory })}`}
                  {selectedLocation && ` ${t("eventsPage.atLocation", "at {{location}}", { location: selectedLocation })}`}
                  {(minPrice || maxPrice) && ` (${minPrice || '0'} - ${maxPrice || '∞'})`}
                </span>
              </div>
            )}
          </div>
          
          {filteredEvents.length > 0 && (
            <div className="text-xs text-gray-500">
{t("eventsPage.pageOf", "Page {{current}} of {{total}}", { current: currentPage, total: totalPages })}
            </div>
          )}
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <div className="max-w-md mx-auto px-4">
              <div className="text-gray-400 mb-3 sm:mb-4">
                <FiCalendar size={48} className="sm:w-16 sm:h-16 mx-auto" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                {t('eventsPage.noEventsFound', 'No events found')}
              </h3>
              <p className="text-sm text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                {searchTerm || selectedCategory || selectedLocation || minPrice || maxPrice
                  ? t('eventsPage.tryAdjustingFilters', 'Try adjusting your search criteria or filters to find more events')
                  : t('eventsPage.noEventsAvailable', 'No events are currently available. Check back soon for new events!')
                }
              </p>
              {(searchTerm || selectedCategory || selectedLocation || minPrice || maxPrice) && (
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                >
{t("eventsPage.clearAllFilters", "Clear All Filters")}
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
              {currentItems && currentItems.length > 0 ? currentItems.map((event) => (
                <EventCard key={event._id} data={event} isEvent={true} />
              )) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No events found</p>
                </div>
              )}
            </div>

            {/* Professional Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 sm:mt-12">
                <div className="flex items-center space-x-1 sm:space-x-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-1 sm:p-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <span className="hidden sm:inline">{t('eventsPage.previous', 'Previous')}</span>
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
                    <span className="hidden sm:inline">{t('eventsPage.next', 'Next')}</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default EventsPage;
