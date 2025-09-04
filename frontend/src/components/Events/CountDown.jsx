import axios from "axios";
import React, { useEffect, useState } from "react";
import { server } from "../../server";

const CountDown = ({ data, t, isRTL }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const [deleted, setDeleted] = useState(false); // prevent repeat delete

  useEffect(() => {
    // Safety check - if no data, don't set up timer
    if (!data || !data.Finish_Date) {
      return;
    }

    // Calculate time left function - moved inside useEffect to fix ESLint warning
    const calculateTimeLeft = () => {
      try {
        if (!data || !data.Finish_Date) {
          return {};
        }
        
        const difference = +new Date(data.Finish_Date) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        }

        return timeLeft;
      } catch (error) {
        console.error('Error calculating time left:', error);
        return {};
      }
    };

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);

      const isExpired =
        !newTime.days && !newTime.hours &&
        !newTime.minutes && !newTime.seconds;

      if (isExpired && !deleted) {
        const token = localStorage.getItem("token");

        // TODO: Backend doesn't have delete event endpoint yet
        console.log("Event expired but delete endpoint not implemented in backend");
        setDeleted(true); // mark it deleted
      }

      // Stop the timer if event is deleted or expired
      if (isExpired || deleted) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer); // cleanup on unmount
  }, [data, deleted]);

  // Safety check - if no data, return fallback
  if (!data || !data.Finish_Date) {
    return (
      <div className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <span className="text-gray-500 text-sm">No end date set</span>
      </div>
    );
  }

  const timerComponents = Object.keys(timeLeft).map((interval) => {
    if (!timeLeft[interval]) return null;

    return (
      <div key={interval} className="flex flex-col items-center">
        <div className="relative">
          {/* Time Value */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-2xl md:text-3xl lg:text-4xl px-3 py-2 rounded-xl shadow-lg min-w-[60px] text-center hover:scale-105 transition-transform duration-300">
            {timeLeft[interval]}
          </div>
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-orange-400 rounded-xl blur-md opacity-30 animate-pulse"></div>
          
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
        </div>
        
        {/* Time Label */}
        <span className="text-orange-700 font-semibold text-xs md:text-sm mt-2 capitalize">
          {t ? t(`countdown.${interval}`, interval) : interval}
        </span>
      </div>
    );
  });

  // Check if event is expired
  const isExpired = Object.keys(timeLeft).length === 0 || 
    (!timeLeft.days && !timeLeft.hours && !timeLeft.minutes && !timeLeft.seconds);

  if (isExpired) {
    return (
      <div className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-lg md:text-xl px-6 py-3 rounded-2xl shadow-xl text-center transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-200 rounded-full animate-ping"></div>
            <span>{t ? t('countdown.timesUp', "Time's Up!") : "Time's Up!"}</span>
            <div className="w-3 h-3 bg-red-200 rounded-full animate-ping animation-delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Countdown Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {t ? t('countdown.eventEndsIn', 'Event Ends In:') : 'Event Ends In:'}
        </h3>
        <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"></div>
      </div>

      {/* Countdown Timer Grid */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {timerComponents}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>{t ? t('countdown.timeRemaining', 'Time Remaining') : 'Time Remaining'}</span>
          <span className="text-orange-600 font-semibold">
            {Math.max(0, Math.floor((+new Date(data.Finish_Date) - +new Date()) / (1000 * 60 * 60 * 24)))} days
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-1000 ease-out shadow-sm relative"
            style={{
              width: `${Math.max(0, Math.min(100, ((+new Date(data.Finish_Date) - +new Date()) / (1000 * 60 * 60 * 24 * 30)) * 100))}%`
            }}
          >
            {/* Shimmer effect on progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Urgency Message */}
      {timeLeft.days <= 3 && timeLeft.days > 0 && (
        <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl transform hover:scale-105 transition-transform duration-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
            <span className="text-orange-700 text-sm font-medium">
              {t ? t('countdown.endingSoon', 'Event ending soon! Don\'t miss out!') : 'Event ending soon! Don\'t miss out!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountDown;
