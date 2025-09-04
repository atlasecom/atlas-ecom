import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IoIosArrowDown } from 'react-icons/io';
import { createPortal } from 'react-dom';

const LanguageChanger = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState(null);

  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      flag: (
        <img 
          src="https://flagcdn.com/w20/us.png" 
          alt="US Flag" 
          className="w-5 h-3 md:w-6 md:h-4 object-cover"
        />
      )
    },
    { 
      code: 'fr', 
      name: 'Français', 
      flag: (
        <img 
          src="https://flagcdn.com/w20/fr.png" 
          alt="France Flag" 
          className="w-5 h-3 md:w-6 md:h-4 object-cover"
        />
      )
    },
    { 
      code: 'ar', 
      name: 'العربية', 
      flag: (
        <img 
          src="https://flagcdn.com/w20/ma.png" 
          alt="Morocco Flag" 
          className="w-5 h-3 md:w-6 md:h-4 object-cover"
        />
      )
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  // Initialize document direction on component mount and language change
  useEffect(() => {
    document.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === "ar" ? "rtl" : "ltr"; // Handle RTL for Arabic
    setIsOpen(false);
  };

  const handleToggle = (e) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect();
      setButtonRect(rect);
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Language Selector Button */}
      <button
        onClick={handleToggle}
        className={`flex items-center ${i18n.language === 'ar' ? 'space-x-reverse' : ''} space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 transition-all duration-200 hover:shadow-md`}
      >
        <div className="flex items-center">{currentLanguage.flag}</div>
        <span className="text-sm md:text-base font-medium text-gray-700 hidden sm:block">
          {currentLanguage.name}
        </span>
        <IoIosArrowDown 
          size={16} 
          className={`md:hidden text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
        <IoIosArrowDown 
          size={20} 
          className={`hidden md:block text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && buttonRect && createPortal(
        <div 
          className={`fixed bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px] md:min-w-[180px]`} 
          style={{ 
            zIndex: 9999999,
            top: buttonRect.bottom + 8,
            left: i18n.language === 'ar' ? buttonRect.left : buttonRect.right - (window.innerWidth >= 768 ? 180 : 160),
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center ${i18n.language === 'ar' ? 'space-x-reverse' : ''} space-x-3 px-4 py-3 md:px-5 md:py-4 ${i18n.language === 'ar' ? 'text-right' : 'text-left'} hover:bg-gray-50 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg ${
                currentLanguage.code === lang.code ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center">{lang.flag}</div>
              <span className="text-sm md:text-base font-medium">{lang.name}</span>
              {currentLanguage.code === lang.code && (
                <span className={`${i18n.language === 'ar' ? 'mr-auto' : 'ml-auto'} text-orange-500 md:text-lg`}>✓</span>
              )}
            </button>
          ))}
        </div>,
        document.body
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && createPortal(
        <div 
          className="fixed inset-0" 
          style={{ zIndex: 9999998 }}
          onClick={() => setIsOpen(false)}
        />,
        document.body
      )}
    </div>
  );
};

export default LanguageChanger;
