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
          <div className="bg-orange-500 text-white font-semibold text-xs sm:text-sm px-1 sm:px-2 py-1 rounded-md min-w-[30px] sm:min-w-[35px] text-center">
            {timeLeft[interval]}
          </div>
        </div>
        
        {/* Time Label */}
        <span className="text-orange-600 text-xs mt-1 capitalize text-center">
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
        <div className="bg-red-500 text-white font-semibold text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg text-center">
          <span>{t ? t('countdown.timesUp', "Time's Up!") : "Time's Up!"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Countdown Header */}
      <div className="mb-1 sm:mb-2">
        <h3 className="text-xs font-semibold text-gray-700 mb-1 text-center sm:text-left">
          {t ? t('countdown.eventEndsIn', 'Event Ends In:') : 'Event Ends In:'}
        </h3>
      </div>

      {/* Countdown Timer Grid */}
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        {timerComponents}
      </div>

      {/* Simple Progress Bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-orange-500 h-1 rounded-full transition-all duration-1000"
            style={{
              width: `${Math.max(0, Math.min(100, ((+new Date(data.Finish_Date) - +new Date()) / (1000 * 60 * 60 * 24 * 30)) * 100))}%`
            }}
          ></div>
        </div>
      </div>

      {/* Simple Urgency Message */}
      {timeLeft.days <= 3 && timeLeft.days > 0 && (
        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-center sm:text-left">
          <span className="text-orange-700 text-xs">
            {t ? t('countdown.endingSoon', 'Ending soon!') : 'Ending soon!'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CountDown;
