import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiMenu, FiX, FiBell, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import atlasEcom from "../../../Assests/images/atlasEcom.png";
import Avatar from "../../Common/Avatar";

const DashboardHeader = () => {
    const { user } = useSelector((state) => state.user);
    const { t } = useTranslation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check screen size on mount and resize
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobile && isMobileMenuOpen && !event.target.closest('.header-container')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isMobileMenuOpen]);

    // Function to open mobile sidebar
    const openMobileSidebar = () => {
        console.log('DashboardHeader: openMobileSidebar called');
        
        // Try multiple approaches to communicate with sidebar
        try {
            // Approach 1: Custom event on window
            console.log('DashboardHeader: Dispatching custom event on window');
            window.dispatchEvent(new CustomEvent('openMobileSidebar'));
            
            // Approach 2: Custom event on document
            console.log('DashboardHeader: Dispatching custom event on document');
            document.dispatchEvent(new CustomEvent('openMobileSidebar'));
            
            // Approach 3: Try using a different event name
            console.log('DashboardHeader: Dispatching openSidebar event');
            window.dispatchEvent(new CustomEvent('openSidebar'));
            document.dispatchEvent(new CustomEvent('openSidebar'));
            
            // Approach 4: Try using localStorage as a fallback
            console.log('DashboardHeader: Setting localStorage flag');
            localStorage.setItem('openSidebar', 'true');
            
        } catch (error) {
            console.error('DashboardHeader: Error dispatching custom event:', error);
        }
        
        setIsMobileMenuOpen(false); // Close the header mobile menu
    };

    return (
        <div className="w-full bg-white shadow-lg border-b border-gray-200 sticky top-0 left-0 z-30 header-container">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-5 lg:py-6">
                <div className="flex items-center justify-between">
                    {/* Left Section - Logo */}
                    <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
                        <Link to="/" className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                            <img
                                src={atlasEcom}
                                alt="Atlas Ecom Logo"
                                className="h-12 w-auto sm:h-14 lg:h-16"
                            />
                            <div className="hidden md:block min-w-0">
                                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{t("common.atlasEcom", "Atlas Ecom")}</h1>
                                <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">{t("common.sellerPortal", "Seller Portal")}</p>
                            </div>
                        </Link>
                    </div>

                    {/* Right Section - User Profile & Actions */}
                    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                        {/* User Profile */}
                        <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                            <div className="hidden md:block text-right min-w-0">
                                <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-900 truncate">{user?.name || t("common.seller", "Seller")}</p>
                                <p className="text-xs lg:text-sm text-gray-500 truncate">{user?.shop?.name || t("common.shopName", "Shop Name")}</p>
                            </div>
                            <Link to="/shop/me" className="group">
                                <div className="relative">
                                    <Avatar 
                                        user={user} 
                                        size="lg" 
                                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-2 border-gray-200 group-hover:border-blue-500 transition-colors duration-200"
                                    />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-3 sm:w-3 lg:w-4 lg:h-4 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                            </Link>
                        </div>

                        {/* Mobile Menu Button - This opens the sidebar */}
                        <button 
                            onClick={openMobileSidebar}
                            className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                        >
                            <FiMenu size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-gray-50">
                    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 space-y-3">
                        {/* User Info */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center space-x-3">
                                <Avatar 
                                    user={user} 
                                    size="lg" 
                                    className="w-12 h-12 border-2 border-gray-200"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name || t("common.seller", "Seller")}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.shop?.name || t("common.shopName", "Shop Name")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb Navigation */}
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-3 sm:py-4 lg:py-5 bg-gray-50 border-t border-gray-200">
                <nav className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 text-xs sm:text-sm lg:text-base text-gray-600">
                    <Link to="/dashboard" className="hover:text-blue-600 transition-colors duration-200 truncate">
                        Dashboard
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-900 font-medium truncate">Seller Portal</span>
                </nav>
            </div>
        </div>
    );
};

export default DashboardHeader;
