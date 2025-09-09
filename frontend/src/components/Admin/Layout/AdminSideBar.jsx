import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  FiUser, 
  FiSettings, 
  FiBarChart,
  FiPackage,
  FiShield,
  FiMenu,
  FiX
} from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";

const AdminSideBar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      id: 1,
      title: "Dashboard",
      icon: RxDashboard,
      path: '/admin/dashboard',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 2,
      title: "Sellers",
      icon: GrWorkshop,
      path: '/admin-sellers',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      badge: 2 // Pending approvals
    },
    {
      id: 3,
      title: "Products",
      icon: FiPackage,
      path: '/admin-products',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 4,
      title: "Users",
      icon: FiUser,
      path: '/admin-users',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: 5,
      title: "Events",
      icon: FiBarChart,
      path: '/admin-events',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 6,
      title: "Settings",
      icon: FiSettings,
      path: '/admin-settings',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Listen for custom event to open mobile menu
  React.useEffect(() => {
    const handleOpenMobileMenu = () => {
      console.log('Mobile menu event received - opening sidebar');
      setIsMobileMenuOpen(true);
    };

    window.addEventListener('openMobileMenu', handleOpenMobileMenu);
    
    return () => {
      window.removeEventListener('openMobileMenu', handleOpenMobileMenu);
    };
  }, []);

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      <div className="hidden lg:block lg:w-[330px] lg:flex-shrink-0">
        <div className="w-full h-[90vh] bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <RxDashboard className="text-white text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">Admin Panel</h2>
                <p className="text-sm text-gray-600 truncate">Management Tools</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                    active 
                      ? `${item.bgColor} ${item.borderColor} border-2 ${item.color} shadow-md` 
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:shadow-sm'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    active ? item.bgColor : 'group-hover:bg-gray-100'
                  }`}>
                    <Icon size={20} className={active ? item.color : 'text-gray-500'} />
                  </div>
                  
                  <span className="pl-3 font-medium transition-colors flex-1 min-w-0 truncate ${
                    active ? item.color : 'text-gray-700'
                  }">
                    {item.title}
                  </span>
                  
                  {/* Badge for pending approvals */}
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>


        </div>
      </div>

      {/* Mobile Sidebar System */}

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
      } lg:hidden fixed inset-y-0 left-0 z-[65] w-72 sm:w-80 h-full bg-white shadow-2xl border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <RxDashboard className="text-white text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">Admin Panel</h2>
                <p className="text-sm text-gray-600 truncate">Management Tools</p>
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

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
                  active 
                    ? `${item.bgColor} ${item.borderColor} border-2 ${item.color} shadow-md` 
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  active ? item.bgColor : 'group-hover:bg-gray-100'
                }`}>
                  <Icon size={20} className={active ? item.color : 'text-gray-500'} />
                </div>
                
                <span className="pl-3 font-medium transition-colors flex-1 min-w-0 truncate ${
                  active ? item.color : 'text-gray-700'
                }">
                  {item.title}
                </span>
                
                {/* Badge for pending approvals */}
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>


      </div>
    </>
  );
};

export default AdminSideBar;
