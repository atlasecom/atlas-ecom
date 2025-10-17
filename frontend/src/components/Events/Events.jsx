import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../styles/styles";
import EventCard from "./EventCard";
import axios from "axios";
import { server } from "../../server";
import { shuffleArray } from "../../utils/shuffle";

const ITEMS_PER_PAGE = 50;

const Events = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch events from server
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${server}/events?limit=50`);
      if (response.data.success) {
        const allEvents = response.data.events || [];
        
        // Show all events (including future events)
        const activeEvents = allEvents;
        
        setAllEvents(activeEvents);
      }
    } catch (error) {
      console.error('❌ Error fetching events:', error);
      setAllEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Sort events: boosted first, then random for normal events
  const sortedEvents = (() => {
    if (!allEvents || allEvents.length === 0) return [];
    
    // Separate boosted and normal events
    const boostedEvents = allEvents.filter(event => event.isBoosted);
    const normalEvents = allEvents.filter(event => !event.isBoosted);
    
    // Sort boosted events by priority (highest first)
    boostedEvents.sort((a, b) => {
      if (a.boostPriority !== b.boostPriority) {
        return b.boostPriority - a.boostPriority;
      }
      // If same priority, sort by creation date (newer first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    // Shuffle normal events for true randomization
    const shuffledNormalEvents = shuffleArray(normalEvents);
    
    // Combine: boosted first, then shuffled normal events
    return [...boostedEvents, ...shuffledNormalEvents];
  })();

  const totalPages = Math.ceil((sortedEvents?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = sortedEvents?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  
  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 py-6 sm:py-8 xl:py-10 2xl:py-12">
      <div className="w-full px-0">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {t('events.title', 'Popular Events')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
{t('events.subtitle', 'Discover amazing events happening around you')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8 mb-8 sm:mb-12 xl:mb-16 2xl:mb-20 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {isLoading ? (
            <div className="col-span-full text-center py-8 xl:py-10 2xl:py-12">
              <div className="inline-flex items-center gap-2 xl:gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 border-b-2 border-purple-600"></div>
                <p className="text-sm xl:text-base 2xl:text-lg font-medium">{t('events.loading', 'Loading events...')}</p>
              </div>
            </div>
          ) : currentEvents?.length > 0 ? (
            currentEvents.map((event, index) => (
              <EventCard 
                data={event} 
                isEvent={true} 
                key={event._id || index} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 xl:py-10 2xl:py-12">
              <div className="max-w-sm xl:max-w-md 2xl:max-w-lg mx-auto">
                <div className="text-gray-400 mb-3 xl:mb-4 2xl:mb-5">
                  <svg className="w-12 h-12 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 mb-2 xl:mb-3">
                  {t('events.noEvents', 'No events available')}
                </h3>
                <p className="text-sm xl:text-base 2xl:text-lg text-gray-600">
{t('events.checkBackSoon', 'Check back soon for exciting events!')}
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
                <span className="hidden sm:inline">{t('events.prev', 'Previous')}</span>
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
                    className={`px-2 sm:px-4 xl:px-6 2xl:px-8 py-2 xl:py-3 2xl:py-4 text-xs sm:text-sm xl:text-base 2xl:text-lg font-semibold rounded-xl xl:rounded-2xl transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg xl:shadow-xl 2xl:shadow-2xl'
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
                className="px-2 sm:px-4 xl:px-6 2xl:px-8 py-2 xl:py-3 2xl:py-4 text-xs sm:text-sm xl:text-base 2xl:text-lg font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl xl:rounded-2xl hover:bg-gray-50 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <span className="hidden sm:inline">{t('events.next', 'Next')}</span>
                <span className="sm:hidden">Next</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
