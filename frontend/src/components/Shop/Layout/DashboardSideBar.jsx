import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiX, FiBarChart, FiPackage, FiPlus, FiSettings, FiShop } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";

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
        { 
            id: 1, 
            path: "/dashboard", 
            icon: RxDashboard, 
            label: "Dashboard", 
            description: "Overview & Analytics",
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        { 
            id: 2, 
            path: "/dashboard-products", 
            icon: FiPackage, 
            label: "All Products", 
            description: "Manage Products",
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        { 
            id: 3, 
            path: "/dashboard-create-product", 
            icon: FiPlus, 
            label: "Create Product", 
            description: "Add New Product",
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        { 
            id: 4, 
            path: "/dashboard-events", 
            icon: FiBarChart, 
            label: "All Events", 
            description: "Manage Events",
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200'
        },
        { 
            id: 5, 
            path: "/dashboard-create-event", 
            icon: FiPlus, 
            label: "Create Event", 
            description: "Launch Event",
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
        },
        { 
            id: 6, 
            path: "/settings", 
            icon: FiSettings, 
            label: "Shop Settings", 
            description: "Shop Configuration",
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
        },
        { 
            id: 7, 
            path: "/shop/me", 
            icon: FiShop, 
            label: "Shop Profile", 
            description: "Shop Information",
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200'
        }
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
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.id;
                    
                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`group relative block w-full p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 ${
                                isActive
                                    ? `${item.bgColor} ${item.borderColor} border-2 ${item.color} shadow-md`
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200'
                            }`}
                        >
                            <div className="relative flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                                {/* Icon with Admin-style Design */}
                                <div className={`p-2 rounded-lg transition-colors ${
                                    isActive ? item.bgColor : 'group-hover:bg-gray-100'
                                }`}>
                                    <Icon size={20} className={isActive ? item.color : 'text-gray-500'} />
                                </div>
                                
                                {/* Text Content */}
                                <div className="hidden 800px:block flex-1 min-w-0">
                                    <h3 className={`font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 truncate ${
                                        isActive ? item.color : 'text-gray-900'
                                    }`}>
                                        {item.label}
                                    </h3>
                                    <p className={`text-xs lg:text-sm transition-all duration-300 truncate ${
                                        isActive ? 'text-gray-600' : 'text-gray-500'
                                    }`}>
                                        {item.description}
                                    </p>
                                </div>
                                
                                {/* Arrow Icon with Animation */}
                                <div className={`hidden 800px:block transition-all duration-300 flex-shrink-0 transform group-hover:translate-x-1 ${
                                    isActive ? item.color : 'text-gray-400 group-hover:text-gray-600'
                                }`}>
                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    );
                })}
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
                        const Icon = item.icon;
                        const isActive = active === item.id;
                        
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                        ? `${item.bgColor} ${item.borderColor} border-2 ${item.color} shadow-md` 
                                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:shadow-sm'
                                }`}
                            >
                                <div className={`p-2 rounded-lg transition-colors ${
                                    isActive ? item.bgColor : 'group-hover:bg-gray-100'
                                }`}>
                                    <Icon size={20} className={isActive ? item.color : 'text-gray-500'} />
                                </div>
                                
                                <span className="pl-3 font-medium transition-colors flex-1 min-w-0 truncate ${
                                    isActive ? item.color : 'text-gray-700'
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