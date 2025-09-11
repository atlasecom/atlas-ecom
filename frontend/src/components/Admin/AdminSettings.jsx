import React, { useState, useEffect } from "react";
import { FiSave, FiRefreshCw, FiGlobe, FiUsers, FiUserPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import { useTranslation } from "react-i18next";

const AdminSettings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'general', label: t("admin.settings.general", "General"), icon: FiGlobe },
    { id: 'admin', label: t("admin.settings.adminManagement", "Admin Management"), icon: FiUsers }
  ];

  const [settings, setSettings] = useState({
    general: {
      siteName: 'Atlas Ecom',
      siteDescription: 'Your trusted B2B e-commerce platform',
      adminEmail: 'admin@atlasecom.com',
      timezone: 'UTC',
      language: 'English'
    },
    admin: {
      newAdminName: '',
      newAdminEmail: '',
      newAdminPassword: '',
      newAdminConfirmPassword: ''
    }
  });

  const [adminList, setAdminList] = useState([]);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  // Fetch admins when component mounts or when admin tab is selected
  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdmins();
    }
  }, [activeTab]);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async (category) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Here you would typically save to backend
  };

  const handleReset = (category) => {
    // Reset to default values
    const defaults = {
      general: {
        siteName: 'Atlas Ecom',
        siteDescription: 'Your trusted B2B e-commerce platform',
        adminEmail: 'admin@atlasecom.com',
        timezone: 'UTC',
        language: 'English'
      },
      admin: {
        newAdminName: '',
        newAdminEmail: '',
        newAdminPassword: '',
        newAdminConfirmPassword: ''
      }
    };
    setSettings(prev => ({
      ...prev,
      [category]: defaults[category]
    }));
  };

  // Fetch existing admins
  const fetchAdmins = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${server}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const admins = response.data.users.filter(user => user.role === 'admin');
        setAdminList(admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch admin list');
    }
  };

  // Create new admin account
  const handleCreateAdmin = async () => {
    const { newAdminName, newAdminEmail, newAdminPassword, newAdminConfirmPassword } = settings.admin;
    
    // Validation
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword || !newAdminConfirmPassword) {
      toast.error('All fields are required');
      return;
    }
    
    if (newAdminPassword !== newAdminConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newAdminPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsCreatingAdmin(true);
    try {
      const token = getAuthToken();
      const response = await axios.post(`${server}/admin/create-admin`, {
        name: newAdminName,
        email: newAdminEmail,
        password: newAdminPassword,
        role: 'admin'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Admin account created successfully');
        // Reset form
        setSettings(prev => ({
          ...prev,
          admin: {
            newAdminName: '',
            newAdminEmail: '',
            newAdminPassword: '',
            newAdminConfirmPassword: ''
          }
        }));
        // Refresh admin list
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.response?.data?.message || 'Failed to create admin account');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  // Delete admin account
  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await axios.delete(`${server}/admin/users/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Admin account deleted successfully');
        fetchAdmins();
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.message || 'Failed to delete admin account');
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-4 lg:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Email
          </label>
          <input
            type="email"
            value={settings.general.adminEmail}
            onChange={(e) => handleSettingChange('general', 'adminEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site Description
        </label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="EST">EST</option>
            <option value="PST">PST</option>
            <option value="GMT">GMT</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.general.language}
            onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="Arabic">Arabic</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAdminSettings = () => (
    <div className="space-y-6 lg:space-y-8">
      {/* Create New Admin Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <FiUserPlus className="text-blue-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900">Create New Admin Account</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Name *
            </label>
            <input
              type="text"
              value={settings.admin.newAdminName}
              onChange={(e) => handleSettingChange('admin', 'newAdminName', e.target.value)}
              placeholder="Enter admin name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Email *
            </label>
            <input
              type="email"
              value={settings.admin.newAdminEmail}
              onChange={(e) => handleSettingChange('admin', 'newAdminEmail', e.target.value)}
              placeholder="Enter admin email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={settings.admin.newAdminPassword}
              onChange={(e) => handleSettingChange('admin', 'newAdminPassword', e.target.value)}
              placeholder="Enter password (min 8 characters)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              value={settings.admin.newAdminConfirmPassword}
              onChange={(e) => handleSettingChange('admin', 'newAdminConfirmPassword', e.target.value)}
              placeholder="Confirm password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-center lg:justify-end">
          <button
            onClick={handleCreateAdmin}
            disabled={isCreatingAdmin}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            {isCreatingAdmin ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating Admin...</span>
              </>
            ) : (
              <>
                <FiUserPlus size={18} />
                <span>Create Admin Account</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Existing Admins Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 lg:mb-6">
          <div className="flex items-center gap-3">
            <FiUsers className="text-gray-600 text-xl" />
            <h3 className="text-lg font-semibold text-gray-900">Existing Admin Accounts</h3>
          </div>
          <button
            onClick={fetchAdmins}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
          >
            <FiRefreshCw size={14} />
            Refresh List
          </button>
        </div>
        
        {adminList.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiUsers className="mx-auto text-4xl text-gray-300 mb-3" />
            <p>No admin accounts found</p>
            <p className="text-sm">Click "Refresh List" to load existing admins</p>
          </div>
        ) : (
          <div className="space-y-3">
            {adminList.map((admin) => (
              <div key={admin._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 lg:p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-300 gap-4">
                <div className="flex items-center gap-3 lg:gap-4 w-full sm:w-auto">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-blue-700 font-bold text-base lg:text-lg">
                      {admin.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-base lg:text-lg truncate">{admin.name}</p>
                    <p className="text-sm text-gray-600 mb-1 truncate">{admin.email}</p>
                    <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Admin
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500 mb-1">Created</p>
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {admin._id !== 'current-user-id' && (
                    <button
                      onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-all duration-200 font-medium hover:shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );







  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'admin':
        return renderAdminSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="w-full p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Admin Settings</h1>
        <p className="text-sm lg:text-base text-gray-600">Manage your platform configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 lg:mb-8 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 lg:space-x-8 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
        {renderTabContent()}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 lg:mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => handleReset(activeTab)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FiRefreshCw className="inline mr-2" size={16} />
            Reset
          </button>
          <button
            onClick={() => handleSave(activeTab)}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FiRefreshCw className="inline mr-2 animate-spin" size={16} />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="inline mr-2" size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
