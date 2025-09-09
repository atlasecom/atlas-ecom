import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiX } from "react-icons/fi";

const DashboardSideBar = () => {
    const location = useLocation();
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

    // Listen for custom event from header to open mobile sidebar
    useEffect(() => {
        const handleOpenMobileSidebar = () => {
            console.log('DashboardSideBar: Received openMobileSidebar event');
            setIsMobileMenuOpen(true);
        };

        // Listen for custom events
        window.addEventListener('openMobileSidebar', handleOpenMobileSidebar);
        document.addEventListener('openMobileSidebar', handleOpenMobileSidebar);
        window.addEventListener('openSidebar', handleOpenMobileSidebar);
        document.addEventListener('openSidebar', handleOpenMobileSidebar);
        
        // Fallback: Check localStorage periodically
        const checkLocalStorage = () => {
            if (localStorage.getItem('openSidebar') === 'true') {
                console.log('DashboardSideBar: Received localStorage signal');
                setIsMobileMenuOpen(true);
                localStorage.removeItem('openSidebar');
            }
        };
        
        const interval = setInterval(checkLocalStorage, 100);
        
        console.log('DashboardSideBar: Event listeners added');
        
        return () => {
            window.removeEventListener('openMobileSidebar', handleOpenMobileSidebar);
            document.removeEventListener('openMobileSidebar', handleOpenMobileSidebar);
            window.removeEventListener('openSidebar', handleOpenMobileSidebar);
            document.removeEventListener('openSidebar', handleOpenMobileSidebar);
            clearInterval(interval);
        };
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobile && isMobileMenuOpen && !event.target.closest('.sidebar-container')) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isMobileMenuOpen]);

    const menuItems = [
        { id: 1, path: "/dashboard", icon: "📊", label: "Dashboard", description: "Overview & Analytics" },
        { id: 2, path: "/dashboard-products", icon: "📦", label: "All Products", description: "Manage Products" },
        { id: 3, path: "/dashboard-create-product", icon: "➕", label: "Create Product", description: "Add New Product" },
        { id: 4, path: "/dashboard-events", icon: "🎉", label: "All Events", description: "Manage Events" },
        { id: 5, path: "/dashboard-create-event", icon: "✨", label: "Create Event", description: "Launch Event" },
        { id: 6, path: "/settings", icon: "⚙️", label: "Shop Settings", description: "Shop Configuration" },
        { id: 7, path: "/shop/me", icon: "🏪", label: "Shop Profile", description: "Shop Information" }
    ];

    // Function to determine which menu item should be active based on current location
    const getActiveItemId = () => {
        const currentPath = location.pathname;
        const activeItem = menuItems.find(item => item.path === currentPath);
        return activeItem ? activeItem.id : 1; // Default to Dashboard if no match
    };

    const active = getActiveItemId();

    const SidebarContent = () => (
        <div className="w-full h-[90vh] bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/50 shadow-2xl border-r border-blue-200/50 overflow-y-auto sticky top-0 left-0 z-10 backdrop-blur-sm">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 animate-pulse"></div>
                <div className="absolute top-1/4 right-0 w-32 h-32 bg-blue-300 rounded-full blur-3xl animate-bounce"></div>
                <div className="absolute bottom-1/4 left-0 w-24 h-24 bg-purple-300 rounded-full blur-2xl animate-pulse"></div>
            </div>

            {/* Logo Section */}
            <div className="relative p-3 sm:p-4 lg:p-6 border-b border-blue-200/50 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 backdrop-blur-sm">
                <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                        <span className="text-white text-sm sm:text-lg lg:text-xl font-bold">A</span>
                    </div>
                    <div className="hidden 800px:block min-w-0">
                        <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 truncate">Seller Portal</h2>
                        <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate">Manage your business</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="relative p-2 sm:p-3 lg:p-4 space-y-1 sm:space-y-2 lg:space-y-3">
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group relative block w-full p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            active === item.id
                                ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white shadow-2xl transform scale-105 border border-blue-300/50'
                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 hover:text-blue-700 hover:shadow-lg border border-transparent hover:border-blue-200/50'
                        }`}
                    >
                        {/* Active Indicator with Animation */}
                        {active === item.id && (
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 sm:h-8 lg:h-10 bg-white rounded-r-full shadow-lg animate-pulse"></div>
                        )}
                        
                        {/* Hover Background Effect */}
                        <div className={`absolute inset-0 rounded-lg sm:rounded-xl transition-all duration-300 ${
                            active === item.id 
                                ? 'bg-gradient-to-r from-white/20 to-transparent' 
                                : 'group-hover:bg-gradient-to-r group-hover:from-blue-100/50 group-hover:to-transparent'
                        }`}></div>
                        
                        <div className="relative flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                            {/* Icon with Enhanced Animation */}
                            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl lg:text-2xl transition-all duration-300 transform group-hover:scale-110 ${
                                active === item.id
                                    ? 'bg-white/20 backdrop-blur-sm shadow-lg'
                                    : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-100 group-hover:to-indigo-100 shadow-md group-hover:shadow-lg'
                            }`}>
                                {item.icon}
                            </div>
                            
                            {/* Text Content */}
                            <div className="hidden 800px:block flex-1 min-w-0">
                                <h3 className={`font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 truncate ${
                                    active === item.id ? 'text-white' : 'text-gray-900 group-hover:text-blue-700'
                                }`}>
                                    {item.label}
                                </h3>
                                <p className={`text-xs lg:text-sm transition-all duration-300 truncate ${
                                    active === item.id ? 'text-blue-100' : 'text-gray-500 group-hover:text-blue-600'
                                }`}>
                                    {item.description}
                                </p>
                            </div>
                            
                            {/* Arrow Icon with Animation */}
                            <div className={`hidden 800px:block transition-all duration-300 flex-shrink-0 transform group-hover:translate-x-1 ${
                                active === item.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                            }`}>
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </nav>

            {/* Bottom Section with Enhanced Design */}
            <div className="relative absolute bottom-0 left-0 right-0 p-2 sm:p-3 lg:p-4 border-t border-blue-200/50 bg-gradient-to-r from-gray-50 via-blue-50/30 to-indigo-50/30 backdrop-blur-sm">
                <div className="hidden 800px:block text-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full mx-auto mb-1 sm:mb-2 lg:mb-3 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                        <span className="text-white text-xs sm:text-sm lg:text-base">🚀</span>
                    </div>
                    <p className="text-xs lg:text-sm text-gray-600 font-medium">Seller Portal v2.0</p>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-80 sidebar-container">
                <SidebarContent />
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="lg:hidden fixed inset-0 z-[55] transition-opacity duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={`${
                isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } lg:hidden fixed inset-y-0 left-0 z-[65] w-72 sm:w-80 h-full bg-white shadow-2xl border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out sidebar-container`}>
                {/* Mobile Header */}
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl font-bold">A</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg font-bold text-gray-900 truncate">Seller Portal</h2>
                                <p className="text-sm text-gray-600 truncate">Mobile Navigation</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Items */}
                <div className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = active === item.id;
                        
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                        ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white shadow-md' 
                                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:shadow-sm'
                                }`}
                            >
                                <div className={`p-2 rounded-lg transition-colors ${
                                    isActive ? 'bg-white/20' : 'group-hover:bg-gray-100'
                                }`}>
                                    <span className="text-xl">{item.icon}</span>
                                </div>
                                
                                <span className="pl-3 font-medium transition-colors flex-1 min-w-0 truncate ${
                                    isActive ? 'text-white' : 'text-gray-700'
                                }">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Mobile Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <div className="text-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm">🚀</span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Seller Portal v2.0</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardSideBar;