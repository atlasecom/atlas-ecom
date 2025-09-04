import { MdAccountCircle } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { backend_url } from "../../server";
import atlasEcom from "../../Assests/images/atlasEcom.png";
import { AiOutlineLogout, AiOutlineSetting } from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import Avatar from "../Common/Avatar";
import { logoutUser } from "../../redux/actions/user";
import { removeAuthToken } from "../../utils/auth";
import { toast } from "react-toastify";

const AdminHeader = () => {
  const { user } = useSelector((state) => state.user);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isRTL = i18n.language === "ar";

  const handleLogout = async () => {
    try {
      // Clear auth token from localStorage
      removeAuthToken();
      
      // Dispatch logout action to clear Redux state
      dispatch(logoutUser());
      
      // Show success message
      toast.success(t('admin.header.logoutSuccess', 'Logged out successfully'));
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(t('admin.header.logoutError', 'Logout failed. Please try again.'));
      
      // Still logout even if there's an error
      removeAuthToken();
      dispatch(logoutUser());
      navigate('/login');
    }
  };

  return (
    <div className="w-full h-[80px] bg-white shadow-lg border-b border-gray-200 sticky top-0 left-0 z-30">
      <div className="w-full h-full flex items-center justify-between px-4 lg:px-6">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2 lg:space-x-3">
            <img
              src={atlasEcom}
              alt="Atlas Ecom Logo"
              className="h-8 w-auto lg:h-12"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs lg:text-sm text-gray-500">Management Dashboard</p>
            </div>
          </Link>
        </div>



        {/* User Profile Section */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* User Info */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
            <div className="text-right">
              <p className="text-xs lg:text-sm font-medium text-gray-900 truncate max-w-[120px] lg:max-w-none">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate max-w-[120px] lg:max-w-none">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>

          {/* User Avatar */}
          <div className="relative group">
            <Avatar 
              user={user} 
              size="md" 
              className="w-10 h-10 lg:w-12 lg:h-12 border-2 lg:border-3 border-gray-200 cursor-pointer hover:border-blue-500 hover:border-4 transition-all duration-300 shadow-md hover:shadow-lg"
            />
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-3 w-48 lg:w-56 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-2 group-hover:translate-y-0">
              <div className="py-3">
                <div className="px-3 lg:px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@example.com'}</p>
                </div>
                
                <Link 
                  to="/profile" 
                  className="flex items-center px-3 lg:px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <MdAccountCircle className="mr-2 lg:mr-3 text-gray-500 group-hover:text-blue-500" size={18} />
                  {t('admin.header.profile', 'Profile')}
                </Link>
                
                <Link 
                  to="/admin-settings" 
                  className="flex items-center px-3 lg:px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                >
                  <AiOutlineSetting className="mr-2 lg:mr-3 text-gray-500 group-hover:text-green-500" size={18} />
                  {t('admin.header.settings', 'Settings')}
                </Link>
                
                <hr className="my-2" />
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 lg:px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <AiOutlineLogout className="mr-2 lg:mr-3 text-red-500" size={18} />
                  {t('admin.header.logout', 'Logout')}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => {
              console.log('Header mobile menu button clicked - dispatching event');
              const event = new CustomEvent('openMobileMenu');
              window.dispatchEvent(event);
            }}
            className="md:hidden p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:shadow-lg transform hover:scale-105"
            aria-label="Open mobile menu"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
