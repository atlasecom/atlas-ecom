import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAuthToken } from "../../utils/auth";
import { FiSearch, FiX, FiMenu, FiUser, FiPhone, FiCalendar, FiClock, FiCheck, FiTrash2 } from "react-icons/fi";
import { GrWorkshop } from "react-icons/gr";
import Loader from "../Layout/Loader";
import Avatar from "../Common/Avatar";

const AllSellers = () => {
  const { t } = useTranslation();
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    filterAndSortSellers();
  }, [sellers, searchTerm, statusFilter, sortBy]);

  const fetchSellers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      console.log('📡 Fetching sellers...');
      
      const response = await axios.get(`${server}/api/admin/sellers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📦 Sellers response:', response.data);
      
      if (response.data.success) {
        console.log('✅ Setting sellers:', response.data.sellers.length, 'sellers');
        console.log('📊 Sellers data:', response.data.sellers.map(s => ({
          id: s._id,
          name: s.name,
          isApproved: s.isApproved,
          shop: s.shop ? { id: s.shop._id, name: s.shop.name, isApproved: s.shop?.isApproved } : null
        })));
        setSellers(response.data.sellers);
      } else {
        toast.error("Failed to fetch sellers");
      }
    } catch (error) {
      console.error("Error fetching sellers:", error);
      toast.error("Failed to fetch sellers");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortSellers = () => {
    let filtered = [...sellers];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(seller =>
        seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (seller.shop && seller.shop.name && seller.shop.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (seller.phoneNumber && seller.phoneNumber.includes(searchTerm)) ||
        (seller.address && seller.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(seller => seller.isApproved === (statusFilter === "approved"));
    }

    // Sort sellers
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "email":
        filtered.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
        break;
      default:
        break;
    }

    setFilteredSellers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("newest");
  };

  const handleApprove = async (id) => {
    try {
      const token = getAuthToken();
      console.log('🔄 Approving seller:', id);
      
      const response = await axios.post(`${server}/api/admin/sellers/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Approve response:', response.data);
      toast.success("Seller approved successfully!");
      
      // Wait for the sellers list to refresh
      await fetchSellers();
      console.log('✅ Sellers list refreshed');
    } catch (error) {
      console.error("Error approving seller:", error);
      toast.error(error.response?.data?.message || "Failed to approve seller");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = getAuthToken();
      console.log('🔄 Rejecting seller:', id);
      
      const response = await axios.post(`${server}/api/admin/sellers/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Reject response:', response.data);
      toast.success("Seller rejected successfully!");
      
      // Wait for the sellers list to refresh
      await fetchSellers();
      console.log('✅ Sellers list refreshed');
    } catch (error) {
      console.error("Error rejecting seller:", error);
      toast.error(error.response?.data?.message || "Failed to reject seller");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${server}/api/admin/sellers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Seller deleted successfully!");
      setOpen(false);
      fetchSellers();
    } catch (error) {
      console.error("Error deleting seller:", error);
      toast.error(error.response?.data?.message || "Failed to delete seller");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen flex-1">
      {/* Mobile Menu Indicator */}
      <div className="lg:hidden p-3 sm:p-4 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FiMenu className="text-blue-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">Mobile Navigation</p>
            <p className="text-xs text-blue-700">Use the blue menu button in the header to navigate</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          All Sellers
        </h1>
        <p className="text-sm lg:text-base text-gray-600">
          Manage and monitor all sellers in the platform
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Sellers</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{sellers.length}</p>
            </div>
            <div className="bg-blue-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <GrWorkshop className="text-blue-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Approved Sellers</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                {sellers.filter(s => s.isApproved).length}
              </p>
            </div>
            <div className="bg-green-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiCheck className="text-green-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Pending Approval</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                {sellers.filter(s => !s.isApproved).length}
              </p>
            </div>
            <div className="bg-orange-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <FiClock className="text-orange-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Active Shops</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                {sellers.filter(s => s.isApproved && s.shop).length}
              </p>
            </div>
            <div className="bg-purple-100 p-2 lg:p-3 rounded-full flex-shrink-0 ml-2">
              <GrWorkshop className="text-purple-600 text-base sm:text-lg lg:text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 mb-6 lg:mb-8">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sellers by name, email, shop, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base flex-1 sm:flex-none"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm sm:text-base flex-1 sm:flex-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter !== "all" || sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
              >
                <FiX size={16} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-xs sm:text-sm text-gray-600">
            Showing {filteredSellers.length} of {sellers.length} sellers
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== "all" && ` (${statusFilter})`}
          </div>
        </div>
      </div>

      {/* Sellers Grid */}
      {filteredSellers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <GrWorkshop size={64} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sellers found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search criteria or filters"
              : "No sellers have been registered yet"
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {filteredSellers.map((seller) => (
            <div key={seller._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-shadow">
              {/* Seller Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Avatar 
                    user={seller} 
                    size="lg" 
                    className="w-10 h-10 sm:w-12 sm:h-12"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{seller.name || "No Name"}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{seller.email}</p>
                  </div>
                </div>
                <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  seller.isApproved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {seller.isApproved ? 'Approved' : 'Pending'}
                </div>
              </div>

              {/* Shop Info */}
              {seller.shop && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1 sm:mb-2">
                    <GrWorkshop className="text-blue-600 text-sm sm:text-base" />
                    <span className="font-medium text-gray-900 text-sm sm:text-base truncate">{seller.shop.name}</span>
                  </div>
                  {seller.shop.description && (
                    <p className="text-xs sm:text-sm text-gray-600">{seller.shop.description}</p>
                  )}
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
                {seller.phoneNumber && (
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                    <FiPhone className="text-xs sm:text-sm" />
                    <span className="truncate">{seller.phoneNumber}</span>
                  </div>
                )}
                {seller.address && (
                  <div className="flex items-start space-x-2 text-xs sm:text-sm text-gray-600">
                    <FiUser className="mt-0.5 text-xs sm:text-sm" />
                    <span className="truncate">{seller.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                  <FiCalendar className="text-xs sm:text-sm" />
                  <span className="truncate">Joined: {new Date(seller.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                {!seller.isApproved ? (
                  <button
                    onClick={() => handleApprove(seller._id)}
                    className="w-full sm:flex-1 bg-green-600 text-white text-xs sm:text-sm py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <FiCheck className="mr-1 text-xs sm:text-sm" />
                    <span className="truncate">Approve</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleReject(seller._id)}
                    className="w-full sm:flex-1 bg-orange-600 text-white text-xs sm:text-sm py-2 px-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
                  >
                    <FiX className="mr-1 text-xs sm:text-sm" />
                    <span className="truncate">Reject</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setUserId(seller._id);
                    setOpen(true);
                  }}
                  className="w-full sm:w-auto bg-red-600 text-white text-xs sm:text-sm py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  title="Delete Seller"
                >
                  <FiTrash2 className="text-xs sm:text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Delete Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Delete Seller</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Are you sure you want to delete this seller? This action will permanently remove:
            </p>
            <ul className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 space-y-1">
              <li>• The seller's account</li>
              <li>• Their shop and all products</li>
              <li>• All associated data</li>
            </ul>
            <p className="text-red-600 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              This action cannot be undone!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
              <button
                onClick={() => setOpen(false)}
                className="w-full sm:flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(userId)}
                className="w-full sm:flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllSellers;

