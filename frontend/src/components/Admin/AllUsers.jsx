import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAllUsers } from "../../redux/actions/user";
import { AiOutlineDelete, AiOutlineUser, AiOutlineMail, AiOutlineCalendar, AiOutlinePhone, AiOutlineEye, AiOutlineFilter } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import { useTranslation } from "react-i18next";
import { FiSearch, FiX } from "react-icons/fi";
import Loader from "../Layout/Loader";
import Avatar from "../Common/Avatar";

const AllUsers = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, roleFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${server}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(t("admin.allUsers.fetchError", "Failed to fetch users"));
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(t("admin.allUsers.fetchError", "Failed to fetch users"));
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
        (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Sort users
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
      case "role":
        filtered.sort((a, b) => (a.role || "").localeCompare(b.role || ""));
        break;
      default:
        break;
    }

    setFilteredUsers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setSortBy("newest");
  };

  const handleDelete = async (id) => {
    try {
      const token = getAuthToken();
      await axios.delete(`${server}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("User deleted successfully!");
      setOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          All Users
        </h1>
        <p className="text-gray-600">
          Manage and monitor all users in the platform
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t("admin.allUsers.totalUsers", "Total Users")}</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <AiOutlineUser className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t("admin.allUsers.customers", "Customers")}</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'user').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <AiOutlineUser className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t("admin.allUsers.sellers", "Sellers")}</p>
              <p className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.role === 'seller').length}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AiOutlineUser className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{t("admin.allUsers.admins", "Admins")}</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <AiOutlineUser className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Roles</option>
                <option value="user">Customers</option>
                <option value="seller">Sellers</option>
                <option value="admin">Admins</option>
              </select>

              {/* Sort Filter */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="role">Sort by Role</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || roleFilter !== "all" || sortBy !== "newest") && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
              >
                <FiX size={16} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {users.length} users
            {searchTerm && ` matching "${searchTerm}"`}
            {roleFilter !== "all" && ` (${roleFilter})`}
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AiOutlineUser size={64} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t("admin.allUsers.noUsersFound", "No users found")}</h3>
          <p className="text-gray-500">
            {searchTerm || roleFilter !== "all" 
              ? t("admin.allUsers.tryAdjustingFilters", "Try adjusting your search criteria or filters")
              : t("admin.allUsers.noUsersRegistered", "No users have been registered yet")
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* User Header */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Avatar 
                      user={user} 
                      size="lg" 
                      className="w-12 h-12 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name || t("admin.allUsers.noName", "No Name")}</h3>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'seller' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </div>
                </div>
                <div className="pl-16">
                  <p className="text-sm text-gray-500 break-all">{user.email}</p>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-2 mb-4">
                {user.phoneNumber && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <AiOutlinePhone />
                    <span>{user.phoneNumber}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <AiOutlineUser className="mt-0.5" />
                    <span>{user.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AiOutlineCalendar />
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <AiOutlineMail />
                  <span>{t("admin.allUsers.verified", "Verified")}: {user.isVerified ? t("common.yes", "Yes") : t("common.no", "No")}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewProfile(user)}
                  className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <AiOutlineEye className="mr-1" />
                  View Profile
                </button>
                <button
                  onClick={() => {
                    setUserId(user._id);
                    setOpen(true);
                  }}
                  className="bg-red-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  title={t("admin.allUsers.deleteUser", "Delete User")}
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("admin.allUsers.deleteUser", "Delete User")}</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user? This action will permanently remove:
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-1">
              <li>• The user's account</li>
              <li>• All associated data</li>
              {users.find(u => u._id === userId)?.role === 'seller' && (
                <li>• Their shop and products</li>
              )}
            </ul>
            <p className="text-red-600 text-sm font-medium mb-6">
              This action cannot be undone!
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(userId)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t("admin.allUsers.userProfile", "User Profile")}</h3>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <RxCross1 size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Avatar and Basic Info */}
              <div className="text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                  <Avatar 
                    user={selectedUser} 
                    size="xl" 
                    className="w-24 h-24"
                  />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedUser.name || t("admin.allUsers.noName", "No Name")}</h4>
                <p className="text-gray-600 mb-1">{selectedUser.email}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  selectedUser.role === 'seller' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedUser.role}
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">{t("admin.allUsers.contactInformation", "Contact Information")}</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    {selectedUser.phoneNumber && (
                      <div className="flex items-center space-x-2">
                        <AiOutlinePhone />
                        <span>{selectedUser.phoneNumber}</span>
                      </div>
                    )}
                    {selectedUser.address && (
                      <div className="flex items-start space-x-2">
                        <AiOutlineUser className="mt-0.5" />
                        <span>{selectedUser.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-2">{t("admin.allUsers.accountInformation", "Account Information")}</h5>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <AiOutlineCalendar />
                      <span>Joined: {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AiOutlineMail />
                      <span>{t("admin.allUsers.verified", "Verified")}: {selectedUser.isVerified ? t("common.yes", "Yes") : t("common.no", "No")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setUserId(selectedUser._id);
                    setOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
