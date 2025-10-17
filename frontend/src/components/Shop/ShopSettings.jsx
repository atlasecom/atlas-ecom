import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import { FiTrash2, FiAlertTriangle } from "react-icons/fi";
import styles from "../../styles/styles";
import axios from "axios";
import { loadUser, logoutUser } from "../../redux/actions/user";
import { toast } from "react-toastify";
import { getAuthToken, removeAuthToken } from "../../utils/auth";
import Avatar from "../Common/Avatar";

const ShopSettings = () => {
    const { user } = useSelector((state) => state.user);
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState();
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState(null);
    const [name, setName] = useState(user.shop && user.shop.name);
    const [description, setDescription] = useState(user.shop && user.shop.description ? user.shop.description : "");
    const [address, setAddress] = useState(user.shop && user.shop.address);
    const [phoneNumber, setPhoneNumber] = useState(user.shop && user.shop.phoneNumber);
    const [zipCode, setZipcode] = useState(user.shop && user.shop.zipCode);
    const [telegram, setTelegram] = useState(user.shop && user.shop.telegram ? user.shop.telegram : "");
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    const dispatch = useDispatch();

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    // Clear uploaded avatar URL when user state updates
    useEffect(() => {
        if (user?.avatar && uploadedAvatarUrl) {
            // If user state has been updated with new avatar, clear the temporary URL
            setUploadedAvatarUrl(null);
        }
    }, [user?.avatar, uploadedAvatarUrl]);

    // Profile photo updated
    const handleProfilePhoto = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (!file) return;
        
        console.log('Profile photo upload started:', file.name);
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }
        
        // Create preview URL for immediate display
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
        setAvatar(file);
        setImageLoading(true);

        const formData = new FormData();
        formData.append("image", file);
        
        console.log('FormData contents:');
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        console.log('Sending profile photo to:', `${server}/auth/avatar`);

        try {
            const token = getAuthToken();
            console.log('Request headers:', {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            });
            const response = await axios.put(`${server}/auth/avatar`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            
            console.log('Profile photo upload response:', response.data);
            console.log('User avatar in response:', response.data.user?.avatar);
            
            if (response.data.success) {
                // Store the uploaded avatar URL for immediate display
                if (response.data.user && response.data.user.avatar) {
                    const avatarUrl = response.data.user.avatar;
                    console.log('Processing avatar URL:', avatarUrl);
                    if (typeof avatarUrl === 'object' && avatarUrl.url) {
                        console.log('Setting uploaded avatar URL (object):', avatarUrl.url);
                        setUploadedAvatarUrl(avatarUrl.url);
                    } else if (typeof avatarUrl === 'string') {
                        console.log('Setting uploaded avatar URL (string):', avatarUrl);
                        setUploadedAvatarUrl(avatarUrl);
                    }
                } else {
                    console.log('No avatar found in response');
                }
                
                // Clear the preview URL to free memory
                if (avatarPreview) {
                    URL.revokeObjectURL(avatarPreview);
                }
                setAvatarPreview(null);
                dispatch(loadUser());
                toast.success('Profile photo updated successfully!');
            }
        } catch (error) {
            console.error('Profile photo upload error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update profile photo';
            toast.error(errorMessage);
            // Clear preview on error
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
            setAvatarPreview(null);
        } finally {
            setImageLoading(false);
        }
    };


    const updateHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = getAuthToken();
            const response = await axios.put(`${server}/shops/${user.shop._id}`, {
                name,
                description,
                address,
                phoneNumber,
                zipCode,
                telegram,
            }, { 
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                toast.success(t('shopSettings.shopInfoUpdated') || 'Shop info updated successfully!');
                dispatch(loadUser());
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('shopSettings.updateError') || 'Failed to update shop info';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirmText !== "DELETE") {
            toast.error(t('shopSettings.confirmTextError') || 'Please type "DELETE" to confirm');
            return;
        }

        setDeleteLoading(true);
        
        try {
            const token = getAuthToken();
            const response = await axios.delete(`${server}/auth/delete-account`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                toast.success(t('shopSettings.accountDeleted') || 'Account deleted successfully');
                
                // Clear auth token and logout
                removeAuthToken();
                dispatch(logoutUser());
                
                // Navigate to home page
                navigate('/');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('shopSettings.deleteError') || 'Failed to delete account';
            toast.error(errorMessage);
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
            setConfirmText("");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error(t('shopSettings.passwordMismatch') || 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error(t('shopSettings.passwordTooShort') || 'Password must be at least 6 characters long');
            return;
        }

        setPasswordLoading(true);
        
        try {
            const token = getAuthToken();
            const response = await axios.put(`${server}/auth/change-password`, {
                currentPassword,
                newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                toast.success(t('shopSettings.passwordChanged') || 'Password changed successfully');
                setShowChangePassword(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('shopSettings.passwordChangeError') || 'Failed to change password';
            toast.error(errorMessage);
        } finally {
            setPasswordLoading(false);
        }
    };



    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
                            <svg className="text-white text-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                            {t("shopSettings.shopSettings", "Shop Settings")}
                        </h1>
                        <p className="text-gray-600 text-lg">
                            {t("shopSettings.settingsDescription", "Manage your shop information and account settings")}
                        </p>
                    </div>

                    {/* Main Settings Container */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 sm:p-8">
                        {/* Profile Photo Section */}
                        <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-200">
                            <div className="relative">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt={t("shopSettings.profilePhoto", "Profile Photo")}
                                        className="w-20 h-20 border-2 border-gray-200 rounded-full object-cover"
                                    />
                                ) : uploadedAvatarUrl ? (
                                    <img
                                        src={(() => {
                                            console.log('Rendering uploaded avatar URL:', uploadedAvatarUrl);
                                            if (uploadedAvatarUrl.startsWith('data:')) {
                                                return uploadedAvatarUrl;
                                            }
                                            if (uploadedAvatarUrl.startsWith('http')) {
                                                return uploadedAvatarUrl + '?v=' + Date.now();
                                            } else {
                                                return `${server.replace(/\/$/, "")}${uploadedAvatarUrl}?v=${Date.now()}`;
                                            }
                                        })()}
                                        alt={t("shopSettings.profilePhoto", "Profile Photo")}
                                        className="w-20 h-20 border-2 border-gray-200 rounded-full object-cover"
                                        onError={(e) => {
                                            console.error('Failed to load uploaded avatar:', e.target.src);
                                            setUploadedAvatarUrl(null);
                                        }}
                                        onLoad={() => {
                                            console.log('Uploaded avatar loaded successfully');
                                        }}
                                    />
                                ) : (
                                    <Avatar 
                                        user={user} 
                                        size="2xl" 
                                        className="w-20 h-20 border-2 border-gray-200"
                                    />
                                )}
                                <input
                                    type="file"
                                    id="profile-photo"
                                    className="hidden"
                                    onChange={handleProfilePhoto}
                                    accept="image/*"
                                    disabled={imageLoading}
                                />
                                <label htmlFor="profile-photo" className={`absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors ${imageLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {imageLoading ? (
                                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <AiOutlineCamera className="text-white text-xs" />
                                    )}
                                </label>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</h3>
                                <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                                <p className="text-xs text-blue-600 font-medium">{t("shopSettings.seller", "Seller")}</p>
                            </div>
                        </div>
                    </div>
                    
                </div>
                
                        {/* Shop Information Section */}
                        <div className="mb-8">
                            <div className="flex items-center mb-6">
                                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <h2 className="text-xl font-semibold text-gray-900">{t("shopSettings.shopInformation", "Shop Information")}</h2>
                            </div>
                            
                            <form
                                aria-aria-required={true}
                                onSubmit={updateHandler}
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            {t('shopSettings.shopName', 'Shop Name')} 
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={t('shopSettings.shopNamePlaceholder', 'Enter your shop name')}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {t('shopSettings.shopPhoneNumber', 'Phone Number')} 
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder={t('shopSettings.shopPhonePlaceholder', 'Enter your phone number')}
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {t('shopSettings.shopAddress', 'Address')} 
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={t('shopSettings.shopAddressPlaceholder', 'Enter your shop address')}
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                            </svg>
                                            {t('shopSettings.shopZipCode', 'Zip Code')} 
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={t('shopSettings.shopZipPlaceholder', 'Enter your zip code')}
                                            value={zipCode}
                                            onChange={(e) => setZipcode(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            {t('shopSettings.shopDescription', 'Description')}
                                        </label>
                                        <textarea
                                            placeholder={t('shopSettings.shopDescriptionPlaceholder', 'Enter your shop description')}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                            rows={4}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-semibold text-gray-700">
                                            <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            {t('shopSettings.telegram', 'Telegram')}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={t('shopSettings.telegramPlaceholder', 'Enter your Telegram username')}
                                            value={telegram}
                                            onChange={(e) => setTelegram(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-200">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                            loading
                                                ? 'bg-gray-400 cursor-not-allowed transform-none'
                                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                {t('shopSettings.updating') || 'Updating...'}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                {t('shopSettings.updateShop') || 'Update Shop'}
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Change Password Section */}
                        <div className="mb-8 pb-8 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <h2 className="text-xl font-semibold text-gray-900">{t('shopSettings.changePassword', 'Change Password')}</h2>
                                </div>
                                <button
                                    onClick={() => setShowChangePassword(!showChangePassword)}
                                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                                >
                                    {showChangePassword ? t('shopSettings.cancel', 'Cancel') : t('shopSettings.changePassword', 'Change Password')}
                                </button>
                            </div>
                            
                            {showChangePassword && (
                                <form onSubmit={handleChangePassword} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                {t('shopSettings.currentPassword', 'Current Password')} 
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                placeholder={t('shopSettings.currentPasswordPlaceholder', 'Current password')}
                                                required
                                                disabled={passwordLoading}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                {t('shopSettings.newPassword', 'New Password')} 
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                placeholder={t('shopSettings.newPasswordPlaceholder', 'New password')}
                                                required
                                                disabled={passwordLoading}
                                                minLength={6}
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="flex items-center text-sm font-semibold text-gray-700">
                                                <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {t('shopSettings.confirmNewPassword', 'Confirm Password')} 
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                                placeholder={t('shopSettings.confirmPasswordPlaceholder', 'Confirm password')}
                                                required
                                                disabled={passwordLoading}
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end pt-4 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                passwordLoading
                                                    ? 'bg-gray-400 cursor-not-allowed transform-none'
                                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl'
                                            }`}
                                        >
                                            {passwordLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    {t('shopSettings.updating', 'Updating...')}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    {t('shopSettings.updatePassword', 'Update Password')}
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Delete Account Section */}
                        <div className="pt-8">
                            <div className="flex items-center mb-6">
                                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <h2 className="text-xl font-semibold text-gray-900">{t('shopSettings.deleteAccount', 'Delete Account')}</h2>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                <p className="text-sm text-red-800 mb-4">
                                    {t('shopSettings.deleteAccountDescription', 'Once you delete your account, there is no going back. Please be certain.')}
                                </p>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-md hover:shadow-lg flex items-center"
                                >
                                    <FiTrash2 className="w-5 h-5 mr-2" />
                                    {t('shopSettings.deleteAccount', 'Delete Account')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                    <div className="flex items-center mb-4">
                        <FiAlertTriangle className="text-red-600 text-xl mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            {t('shopSettings.deleteAccount', 'Delete Account')}
                        </h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                        {t('shopSettings.deleteAccountConfirm', 'This action cannot be undone. This will permanently delete your account and remove all data from our servers.')}
                    </p>
                    
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('shopSettings.typeDeleteToConfirm', 'Type "DELETE" to confirm')}
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 text-center font-mono"
                            disabled={deleteLoading}
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setConfirmText("");
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={deleteLoading}
                        >
                            {t('shopSettings.cancel', 'Cancel')}
                        </button>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleteLoading || confirmText !== "DELETE"}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {deleteLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    {t('shopSettings.deleting', 'Deleting...')}
                                </>
                            ) : (
                                <>
                                    <FiTrash2 className="w-4 h-4 mr-2" />
                                    {t('shopSettings.deleteAccount', 'Delete Account')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            )}
        </>
    );
};

export default ShopSettings;