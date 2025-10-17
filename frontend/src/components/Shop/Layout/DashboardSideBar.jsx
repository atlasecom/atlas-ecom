import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiX, FiBarChart, FiPackage, FiPlus, FiSettings, FiHome, FiVideo } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import { useTranslation } from "react-i18next";

const DashboardSideBar = () => {
    const { t } = useTranslation();
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
            label: t("sidebar.dashboard", "Dashboard"), 
            description: t("sidebar.dashboardDesc", "Overview & Analytics"),
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        { 
            id: 2, 
            path: "/dashboard-products", 
            icon: FiPackage, 
            label: t("sidebar.allProducts", "All Products"), 
            description: t("sidebar.manageProducts", "Manage Products"),
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        { 
            id: 3, 
            path: "/dashboard-create-product", 
            icon: FiPlus, 
            label: t("sidebar.createProduct", "Create Product"), 
            description: t("sidebar.addNewProduct", "Add New Product"),
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200'
        },
        { 
            id: 4, 
            path: "/dashboard-tutorials", 
            icon: FiVideo, 
            label: t("sidebar.tutorials", "Tutorials"), 
            description: t("sidebar.learnPlatform", "Learn Platform"),
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-200'
        },
        { 
            id: 5, 
            path: "/dashboard-subscription", 
            icon: FiSettings, 
            label: t("sidebar.subscription", "Subscription"), 
            description: t("sidebar.boostVisibility", "Boost Visibility"),
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        { 
            id: 6, 
            path: "/dashboard-events", 
            icon: FiBarChart, 
            label: t("sidebar.allEvents", "All Events"), 
            description: t("sidebar.manageEvents", "Manage Events"),
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
            borderColor: 'border-pink-200'
        },
        { 
            id: 7, 
            path: "/dashboard-create-event", 
            icon: FiPlus, 
            label: t("sidebar.createEvent", "Create Event"), 
            description: t("sidebar.launchEvent", "Launch Event"),
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            borderColor: 'border-orange-200'
        },
        { 
            id: 8, 
            path: "/settings", 
            icon: FiSettings, 
            label: t("sidebar.shopSettings", "Shop Settings"), 
            description: t("sidebar.shopConfiguration", "Shop Configuration"),
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
        },
        { 
            id: 9, 
            path: "/shop/me", 
            icon: FiHome, 
            label: t("sidebar.shopProfile", "Shop Profile"), 
            description: t("sidebar.shopInformation", "Shop Information"),
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
        <div className="w-full h-screen bg-white shadow-lg border-r border-gray-200 overflow-y-auto sticky top-0">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-xl font-bold">A</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 truncate">{t("common.sellerPortal", "Seller Portal")}</h2>
                        <p className="text-sm text-gray-600 truncate">{t("sidebar.manageYourBusiness", "Manage your business")}</p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
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
                            
                            <span className={`pl-3 font-medium transition-colors flex-1 min-w-0 truncate ${
                                isActive ? item.color : 'text-gray-700'
                            }`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:w-[330px] lg:flex-shrink-0">
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
                                <h2 className="text-lg font-bold text-gray-900 truncate">{t("common.sellerPortal", "Seller Portal")}</h2>
                                <p className="text-sm text-gray-600 truncate">{t("sidebar.mobileNavigation", "Mobile Navigation")}</p>
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

            </div>
        </>
    );
};

export default DashboardSideBar;