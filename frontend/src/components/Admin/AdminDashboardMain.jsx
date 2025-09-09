import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllSellers } from "../../redux/actions/sellers";
import { FiTrendingUp, FiMenu, FiUser, FiPackage, FiBarChart, FiShoppingCart, FiCheckCircle, FiClock, FiArrowRight } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import { RxDashboard } from "react-icons/rx";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import Loader from "../Layout/Loader";

const AdminDashboardMain = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    approvedSellers: 0,
    pendingSellers: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // Fetch users count
      const usersResponse = await axios.get(`${server}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch sellers count
      const sellersResponse = await axios.get(`${server}/admin/sellers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch products count
      const productsResponse = await axios.get(`${server}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch orders count (if endpoint exists)
      let ordersCount = 0;
      try {
        const ordersResponse = await axios.get(`${server}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (ordersResponse.data.success) {
          ordersCount = ordersResponse.data.orders.length;
        }
      } catch (error) {
        console.log("Orders endpoint not available yet");
      }

      const sellers = sellersResponse.data.success ? sellersResponse.data.sellers : [];
      const users = usersResponse.data.success ? usersResponse.data.users : [];
      const products = productsResponse.data.success ? productsResponse.data.products : [];

      setStats({
        totalUsers: users.length,
        totalSellers: sellers.length,
        totalProducts: products.length,
        totalOrders: ordersCount,
        approvedSellers: sellers.filter(s => s.isApproved).length,
        pendingSellers: sellers.filter(s => !s.isApproved).length
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen">
      

      {/* Mobile Menu Indicator */}
      <div className="lg:hidden mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <FiMenu className="text-blue-600" size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900">Mobile Navigation</p>
            <p className="text-xs text-blue-700">Use the blue menu button in the header to navigate</p>
          </div>
        </div>
      </div>

      {/* Mobile Welcome Section */}
      <div className="lg:hidden mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-purple-600 text-2xl">🎯</span>
          </div>
          <h2 className="text-lg font-bold text-purple-900 mb-2">Welcome to Admin Dashboard</h2>
          <p className="text-sm text-purple-700">Manage your platform from anywhere with this mobile-optimized interface</p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm lg:text-base text-gray-600">
          Overview of platform statistics and management tools
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* Mobile Notice */}
        <div className="sm:hidden col-span-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">📱</span>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Mobile Dashboard</p>
              <p className="text-xs text-blue-700">Swipe to see all statistics</p>
            </div>
          </div>
        </div>
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow sm:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Total Users
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
              <div className="flex items-center mt-1 sm:mt-2">
                <FiTrendingUp className="text-blue-500 mr-1 text-xs sm:text-sm" />
                <span className="text-xs lg:text-sm text-blue-600 truncate">All registered users</span>
              </div>
            </div>
            <div className="bg-blue-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiUser className="text-blue-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        {/* Total Sellers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Total Sellers
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">{stats.totalSellers}</p>
              <div className="flex items-center mt-1 sm:mt-2">
                <GrWorkshop className="text-purple-500 mr-1 text-xs sm:text-sm" />
                <span className="text-xs lg:text-sm text-purple-600 truncate">Shop owners</span>
              </div>
            </div>
            <div className="bg-purple-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <GrWorkshop className="text-purple-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Total Products
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.totalProducts}</p>
              <div className="flex items-center mt-1 sm:mt-2">
                <FiTrendingUp className="text-green-500 mr-1 text-xs sm:text-sm" />
                <span className="text-xs lg:text-sm text-green-600 truncate">Available items</span>
              </div>
            </div>
            <div className="bg-green-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiPackage className="text-green-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Total Orders
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-600">{stats.totalOrders}</p>
              <div className="flex items-center mt-1 sm:mt-2">
                <FiTrendingUp className="text-indigo-500 mr-1 text-xs sm:text-sm" />
                <span className="text-xs lg:text-sm text-indigo-600 truncate">Customer orders</span>
              </div>
            </div>
            <div className="bg-indigo-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiShoppingCart className="text-indigo-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        {/* Approved Sellers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Approved Sellers
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.approvedSellers}</p>
              <div className="flex items-center mt-1 sm:mt-2">
                <FiTrendingUp className="text-green-500 mr-1 text-xs sm:text-sm" />
                <span className="text-xs lg:text-sm text-green-600 truncate">Active and verified</span>
              </div>
            </div>
            <div className="bg-green-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiCheckCircle className="text-green-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                Pending Approvals
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">{stats.pendingSellers}</p>
              <div className="flex items-center mt-1 sm:mt-2">
                <FiClock className="text-orange-500 mr-1 text-xs sm:text-sm" />
                <span className="text-xs lg:text-sm text-orange-600 truncate">Requires attention</span>
              </div>
            </div>
            <div className="bg-orange-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiClock className="text-orange-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="lg:hidden mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/admin-users"
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center hover:bg-blue-100 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <FiUser className="text-blue-600 text-xl" />
            </div>
            <p className="text-sm font-medium text-blue-900">Users</p>
          </Link>
          <Link
            to="/admin-sellers"
            className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center hover:bg-purple-100 transition-colors"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <GrWorkshop className="text-purple-600 text-xl" />
            </div>
            <p className="text-sm font-medium text-purple-900">Sellers</p>
          </Link>
        </div>
      </div>

      {/* Desktop Quick Actions */}
      <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* User Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">User Management</h3>
            <FiUser className="text-blue-600 text-base sm:text-lg lg:text-xl" />
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4">
            Manage user accounts, permissions, and monitor user activity across the platform.
          </p>
          <div className="space-y-2 sm:space-y-3">
            <Link
              to="/admin-users"
              className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-blue-700 font-medium text-xs sm:text-sm lg:text-base">View All Users</span>
              <FiArrowRight className="text-blue-600 text-sm sm:text-base" />
            </Link>
            <Link
              to="/admin-sellers"
              className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-purple-700 font-medium text-xs sm:text-sm lg:text-base">Manage Sellers</span>
              <FiArrowRight className="text-purple-600 text-sm sm:text-base" />
            </Link>
          </div>
        </div>

        {/* Content Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">Content Management</h3>
            <span className="text-green-600 text-base sm:text-lg lg:text-xl">📦</span>
          </div>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-3 sm:mb-4">
            Monitor products, events, and manage content quality across all shops.
          </p>
          <div className="space-y-2 sm:space-y-3">
            <Link
              to="/admin-products"
              className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-green-700 font-medium text-xs sm:text-sm lg:text-base">View All Products</span>
              <FiArrowRight className="text-green-600 text-sm sm:text-base" />
            </Link>
            <Link
              to="/admin-events"
              className="flex items-center justify-between p-2 sm:p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <span className="text-orange-700 font-medium text-xs sm:text-sm lg:text-base">Manage Events</span>
              <FiArrowRight className="text-orange-600 text-sm sm:text-base" />
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboardMain;
