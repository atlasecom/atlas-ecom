import React, { useState } from "react";
import {
  AiOutlineLogin,
  AiOutlineMessage,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { RiLockPasswordLine } from "react-icons/ri";
import { RxPerson } from "react-icons/rx";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineAdminPanelSettings } from "react-icons/md";


import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { logoutUser } from "../../redux/actions/user";
import { removeAuthToken } from "../../utils/auth";
import Avatar from "../Common/Avatar";

const ProfileSidebar = ({ active, setActive }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user } = useSelector((state) => state.user);

  const logoutHandler = async () => {
    setIsLoggingOut(true);
    try {
      // const token = getAuthToken();
      // await axios.get(`${backend_url}auth/logout`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      toast.success(t("profile.sidebar.logoutSuccess", "Logged out successfully"));
      navigate("/");
      removeAuthToken();
      dispatch(logoutUser());
      
    } catch (err) {
      console.error("Logout error:", err);
      toast.error(t("profile.sidebar.logoutError", "Logout failed. Please try again."));
      // Still dispatch logout to clear local state even if backend request fails
      dispatch(logoutUser());
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      id: 1,
      icon: <RxPerson size={22} />,
      label: t("profile.sidebar.profile"),
      active: active === 1,
    },
    {
      id: 6,
      icon: <RiLockPasswordLine size={22} />,
      label: t("profile.sidebar.changePassword"),
      active: active === 6,
    },
  ];

  // Add admin dashboard if user is admin
  if (user && user?.role === "Admin") {
    menuItems.push({
      id: 8,
      icon: <MdOutlineAdminPanelSettings size={22} />,
      label: t("profile.sidebar.adminDashboard"),
      active: active === 8,
      isLink: true,
      url: "/admin/dashboard",
    });
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
      {/* User Info Header */}
      <div className="text-center mb-8 pb-6 border-b border-gray-100">
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <Avatar 
            user={user} 
            size="xl" 
            className="w-full h-full border-4 border-orange-100 shadow-lg"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {user?.name || "User"}
        </h3>
        <p className="text-sm text-gray-500">
          {user?.email || "user@example.com"}
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const menuItem = (
            <div
              key={item.id}
              className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                item.active
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
              onClick={() => !item.isLink && setActive(item.id)}
            >
              <div className={`mr-3 ${item.active ? "text-white" : "text-gray-500 group-hover:text-orange-500"}`}>
                {item.icon}
              </div>
              <span className="font-medium">{item.label}</span>
            </div>
          );

          if (item.isLink) {
            return (
              <Link key={item.id} to={item.url}>
                {menuItem}
              </Link>
            );
          }

          return menuItem;
        })}
      </nav>

      {/* Logout Button */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          onClick={isLoggingOut ? null : logoutHandler}
          disabled={isLoggingOut}
          className={`w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
            isLoggingOut
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
          }`}
        >
          {isLoggingOut ? (
            <>
              <AiOutlineLoading3Quarters size={18} className="animate-spin mr-2" />
              {t("profile.sidebar.loggingOut", "Logging out...")}
            </>
          ) : (
            <>
              <AiOutlineLogin size={18} className="mr-2" />
              {t("profile.sidebar.logout")}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileSidebar;
