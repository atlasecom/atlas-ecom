import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { backend_url, server } from "../../server";
import { AiOutlineCamera } from "react-icons/ai";
import styles from "../../styles/styles";
import axios from "axios";
import { loadUser } from "../../redux/actions/user";
import { toast } from "react-toastify";
import { getAuthToken } from "../../utils/auth";
import Avatar from "../Common/Avatar";

const ShopSettings = () => {
    const { user } = useSelector((state) => state.user);
    const { t, i18n } = useTranslation();
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

    // Shop banner updated
    const handleShopBanner = async (e) => {
        e.preventDefault();
        const file = e.target.files[0];
        if (!file) return;
        
        console.log('Shop banner upload started:', file.name);
        
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
        
        setImageLoading(true);

        const formData = new FormData();
        formData.append("image", file);
        formData.append("name", name);
        formData.append("description", description);
        formData.append("address", address);
        formData.append("phoneNumber", phoneNumber);
        formData.append("zipCode", zipCode);
        formData.append("telegram", telegram);
        
        console.log('Sending shop banner to:', `${server}/shops/${user.shop._id}`);

        try {
            const token = getAuthToken();
            const response = await axios.put(`${server}/shops/${user.shop._id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            
            console.log('Shop banner upload response:', response.data);
            
            if (response.data.success) {
                dispatch(loadUser());
                toast.success('Shop banner updated successfully!');
            }
        } catch (error) {
            console.error('Shop banner upload error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update shop banner';
            toast.error(errorMessage);
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



    return (
        <div className="w-full">
            <div className="w-full px-0 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
                <div className="max-w-4xl mx-auto px-2 sm:px-0">
                    {/* User Profile Section */}
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                        
                        {/* Profile Photo Section */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Photo</h3>
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Profile Preview"
                                            className="w-32 h-32 border-4 border-white shadow-lg rounded-full object-cover"
                                        />
                                    ) : uploadedAvatarUrl ? (
                                        <img
                                            src={(() => {
                                                console.log('Rendering uploaded avatar URL:', uploadedAvatarUrl);
                                                // Don't add cache busting to data URIs
                                                if (uploadedAvatarUrl.startsWith('data:')) {
                                                    return uploadedAvatarUrl;
                                                }
                                                if (uploadedAvatarUrl.startsWith('http')) {
                                                    return uploadedAvatarUrl + '?v=' + Date.now();
                                                } else {
                                                    return `${server.replace(/\/$/, "")}${uploadedAvatarUrl}?v=${Date.now()}`;
                                                }
                                            })()}
                                            alt="Profile Photo"
                                            className="w-32 h-32 border-4 border-white shadow-lg rounded-full object-cover"
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
                                            className="w-32 h-32 border-4 border-white shadow-lg"
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
                                    <label htmlFor="profile-photo" className={`absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-colors ${imageLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {imageLoading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <AiOutlineCamera className="text-white text-lg" />
                                        )}
                                    </label>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{user?.name || 'User'}</h4>
                                    <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Shop Banner Section */}
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop Banner</h3>
                        <div className="relative">
                            <input
                                type="file"
                                id="shop-banner"
                                className="hidden"
                                onChange={handleShopBanner}
                                accept="image/*"
                                disabled={imageLoading}
                            />
                            <label htmlFor="shop-banner" className={`cursor-pointer ${imageLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <img
                                    src={(() => {
                                        // Try to get shop banner first
                                        if (user.shop?.banner) {
                                            if (typeof user.shop.banner === 'object' && user.shop.banner.url) {
                                                const bannerUrl = user.shop.banner.url;
                                                // Don't add cache busting to data URIs
                                                if (bannerUrl.startsWith('data:')) {
                                                    return bannerUrl;
                                                }
                                                if (typeof bannerUrl === 'string' && bannerUrl.startsWith('http')) {
                                                    return bannerUrl + '?v=' + Date.now();
                                                }
                                                if (typeof bannerUrl === 'string') {
                                                    return `${server.replace(/\/$/, "")}${bannerUrl}?v=${Date.now()}`;
                                                }
                                            }
                                            if (typeof user.shop.banner === 'string') {
                                                // Don't add cache busting to data URIs
                                                if (user.shop.banner.startsWith('data:')) {
                                                    return user.shop.banner;
                                                }
                                                if (user.shop.banner.startsWith('http')) {
                                                    return user.shop.banner + '?v=' + Date.now();
                                                }
                                                return `${server.replace(/\/$/, "")}/${user.shop.banner.replace(/^\//, "")}?v=${Date.now()}`;
                                            }
                                        }
                                        
                                        // Fallback to user avatar
                                        if (user?.avatar) {
                                            if (typeof user.avatar === 'object' && user.avatar.url) {
                                                const avatarUrl = user.avatar.url;
                                                // Don't add cache busting to data URIs
                                                if (avatarUrl.startsWith('data:')) {
                                                    return avatarUrl;
                                                }
                                                if (typeof avatarUrl === 'string' && avatarUrl.startsWith('http')) {
                                                    return avatarUrl + '?v=' + Date.now();
                                                }
                                                if (typeof avatarUrl === 'string') {
                                                    return `${server.replace(/\/$/, "")}${avatarUrl}?v=${Date.now()}`;
                                                }
                                            }
                                            if (typeof user.avatar === 'string') {
                                                // Don't add cache busting to data URIs
                                                if (user.avatar.startsWith('data:')) {
                                                    return user.avatar;
                                                }
                                                if (user.avatar.startsWith('http')) {
                                                    return user.avatar + '?v=' + Date.now();
                                                }
                                                return `${server.replace(/\/$/, "")}/${user.avatar.replace(/^\//, "")}?v=${Date.now()}`;
                                            }
                                        }
                                        
                                        // Final fallback to default
                                        return '/default-shop-banner.png';
                                    })()}
                                    alt="Shop Banner"
                                    className="w-[200px] h-[200px] object-cover rounded-lg shadow-lg"
                                    onError={(e) => {
                                        console.error('Image load error for shop banner, URL:', e.target.src);
                                        // Try alternative loading methods
                                        if (user.shop?.banner) {
                                            const bannerObj = user.shop.banner;
                                            if (typeof bannerObj === 'object' && bannerObj.url) {
                                                const bannerUrl = bannerObj.url;
                                                if (typeof bannerUrl === 'string' && bannerUrl.startsWith('http')) {
                                                    e.target.src = bannerUrl;
                                                } else if (typeof bannerUrl === 'string') {
                                                    e.target.src = `${server.replace(/\/$/, "")}${bannerUrl}`;
                                                } else {
                                                    e.target.src = '/default-shop-banner.png';
                                                }
                                            } else if (typeof bannerObj === 'string') {
                                                if (bannerObj.startsWith('http')) {
                                                    e.target.src = bannerObj;
                                                } else {
                                                    e.target.src = `${server.replace(/\/$/, "")}/${bannerObj.replace(/^\//, "")}`;
                                                }
                                            } else {
                                                e.target.src = '/default-shop-banner.png';
                                            }
                                        } else {
                                            e.target.src = '/default-shop-banner.png';
                                        }
                                        e.target.onerror = null;
                                    }}
                                    onLoad={() => {
                                        console.log('Shop banner loaded successfully');
                                    }}
                                />
                                <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors">
                                    {imageLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    ) : (
                                        <AiOutlineCamera className="text-white text-lg" />
                                    )}
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
                
                {/* Shop Information Section */}
                <div className="w-full mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Shop Information</h2>
                </div>

                {/* shop info */}
                <form
                    aria-aria-required={true}
                    className="flex flex-col items-center"
                    onSubmit={updateHandler}
                >
                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className={`w-full ${i18n.language === 'ar' ? 'pr-[3%]' : 'pl-[3%]'}`}>
                            <label className="block pb-2">{t('shopSettings.shopName', 'Shop Name')}</label>
                        </div>
                        <input
                            type="name"
                            placeholder={`${user.shop?.name || ''}`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 ${
                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                            }`}
                            required
                            disabled={loading}
                        />
                    </div>
                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className={`w-full ${i18n.language === 'ar' ? 'pr-[3%]' : 'pl-[3%]'}`}>
                            <label className="block pb-2">{t('shopSettings.shopDescription', 'Shop description')}</label>
                        </div>
                        <input
                            type="name"
                            placeholder={`${user.shop?.description
                                ? user.shop.description
                                : t('shopSettings.descriptionPlaceholder') || 'Enter your shop description'
                                }`}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 ${
                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                            }`}
                            disabled={loading}
                        />
                    </div>
                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className={`w-full ${i18n.language === 'ar' ? 'pr-[3%]' : 'pl-[3%]'}`}>
                            <label className="block pb-2">{t('shopSettings.shopAddress', 'Shop Address')}</label>
                        </div>
                        <input
                            type="name"
                            placeholder={user.shop?.address || ''}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 ${
                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                            }`}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className={`w-full ${i18n.language === 'ar' ? 'pr-[3%]' : 'pl-[3%]'}`}>
                            <label className="block pb-2">{t('shopSettings.shopPhoneNumber', 'Shop Phone Number')}</label>
                        </div>
                        <input
                            type="number"
                            placeholder={user.shop?.phoneNumber || ''}
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 ${
                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                            }`}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className={`w-full ${i18n.language === 'ar' ? 'pr-[3%]' : 'pl-[3%]'}`}>
                            <label className="block pb-2">{t('shopSettings.shopZipCode', 'Shop Zip Code')}</label>
                        </div>
                        <input
                            type="number"
                            placeholder={user.shop?.zipCode || ''}
                            value={zipCode}
                            onChange={(e) => setZipcode(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 ${
                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                            }`}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <div className={`w-full ${i18n.language === 'ar' ? 'pr-[3%]' : 'pl-[3%]'}`}>
                            <label className="block pb-2">{t('shopSettings.telegram', 'Telegram')}</label>
                        </div>
                        <input
                            type="text"
                            placeholder={user.shop?.telegram || t('shopSettings.telegramPlaceholder') || 'Enter your Telegram username'}
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value)}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 ${
                                i18n.language === 'ar' ? 'text-right' : 'text-left'
                            }`}
                            disabled={loading}
                        />
                    </div>

                    <div className="w-[100%] flex items-center flex-col 800px:w-[50%] mt-5">
                        <input
                            type="submit"
                            value={loading ? (t('shopSettings.updating') || 'Updating...') : (t('shopSettings.updateShop') || 'Update Shop')}
                            className={`${styles.input} !w-[95%] mb-4 800px:mb-0 cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={loading}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopSettings;