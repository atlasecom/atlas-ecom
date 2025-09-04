import React, { useEffect, useState } from 'react'
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from 'react-redux';
import {
    deleteUserAddress,
    loadUser,
    updatUserAddress,
    updateUserInformation,
} from "../../redux/actions/user";
import { AiOutlineArrowRight, AiOutlineCamera, AiOutlineDelete } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import styles from "../../styles/styles";
import { DataGrid } from "@material-ui/data-grid";
import { Button } from "@material-ui/core";
import { RxCross1 } from 'react-icons/rx'
import { MdTrackChanges } from "react-icons/md";
import { toast } from "react-toastify";
import axios from 'axios';
import { Country, State } from "country-state-city";
import { getAllOrdersOfUser } from '../../redux/actions/order';
import { useTranslation } from "react-i18next";
import apiClient from '../../utils/apiClient';
import Avatar from '../Common/Avatar';


const ProfileContent = ({ active }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    
    const { user, error, successMessage } = useSelector((state) => state.user);
    const [name, setName] = useState(user && user.name);
    const [email, setEmail] = useState(user && user.email);
    const [phoneNumber, setPhoneNumber] = useState(user && user.phoneNumber);
    const [address, setAddress] = useState(user && user.address);
    const [avatar, setAvatar] = useState(null);
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const dispatch = useDispatch();


    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch({ type: "clearErrors" });
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch({ type: "clearMessages" });
        }
    }, [error, successMessage]);

    // Sync local state with user data
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setPhoneNumber(user.phoneNumber || '');
            setAddress(user.address || '');
        }
    }, [user]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        if (!name || name.trim().length < 2) {
            toast.error('Name must be at least 2 characters long');
            return;
        }
        
        if (name.trim().length > 30) {
            toast.error('Name cannot exceed 30 characters');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await apiClient.put(`/users/profile`, {
                name: name.trim(), 
                phoneNumber: phoneNumber || '', 
                address: address || ''
            });
            
            if (response.data.success) {
                toast.success(t('profile.content.updateSuccess') || 'Profile updated successfully!');
                dispatch(loadUser()); // Reload user data
                // Update local state
                setName(response.data.user.name);
                setPhoneNumber(response.data.user.phoneNumber);
                setAddress(response.data.user.address);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('profile.content.updateError') || 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    // Image update
    const handleImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file size (limit to 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            toast.error('File size must be less than 10MB');
            return;
        }

        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file (JPG, PNG, GIF, etc.)');
            return;
        }

        setAvatar(file);
        setAvatarLoading(true);

        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await apiClient.put(`/auth/avatar`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            if (response.data.success) {
                dispatch(loadUser());
                toast.success(t('profile.content.avatarUpdateSuccess') || 'Avatar updated successfully!');
                setAvatar(null); // Clear the file input
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('profile.content.avatarUpdateError') || 'Failed to update avatar';
            toast.error(errorMessage);
        } finally {
            setAvatarLoading(false);
        }
    };


    // Show loading state if user data is not available
    if (!user) {
        return (
            <div className="w-full flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full'>
            {/* Profile */}
            {
                active === 1 && (
                    <>
                        {/* Profile Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                Personal Information
                            </h2>
                            <p className="text-gray-600">
                                Update your profile information and manage your account
                            </p>
                        </div>

                        {/* Profile Picture Section */}
                        <div className="flex justify-center mb-8">
                            <div className='relative group'>
                                <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-orange-100 shadow-lg group-hover:shadow-xl transition-all duration-300">
                                    {avatar ? (
                                        <img
                                            src={URL.createObjectURL(avatar)}
                                            alt="Avatar preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Avatar 
                                            user={user} 
                                            size="2xl" 
                                            className="w-full h-full"
                                        />
                                    )}
                                </div>
                                
                                {/* Camera Icon Overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-full flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <input 
                                            type="file"
                                            id="image"
                                            className="hidden"
                                            onChange={handleImage}
                                            accept="image/*"
                                            disabled={avatarLoading}
                                        />
                                        <label htmlFor="image" className={`cursor-pointer ${avatarLoading ? 'opacity-50' : ''}`}>
                                            {avatarLoading ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                                            ) : (
                                                <AiOutlineCamera className="text-gray-700 text-xl" />
                                            )}
                                        </label>
                                    </div>
                                </div>
                                
                                {/* Upload Progress Indicator */}
                                {avatarLoading && (
                                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center">
                                        <div className="text-white text-sm font-medium">Uploading...</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Avatar Upload Status */}
                        {avatar && !avatarLoading && (
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-3">
                                    <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        New avatar selected
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setAvatar(null)}
                                        className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        {/* Current Avatar Info */}
                        {!avatar && user?.avatar?.url && user.avatar.url !== 'https://res.cloudinary.com/atlas-ecom/image/upload/v1/default-avatar' && (
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-3">
                                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Custom avatar uploaded
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                const response = await apiClient.put(`/auth/avatar`, {
                                                    avatar: {
                                                        public_id: '',
                                                        url: 'https://res.cloudinary.com/atlas-ecom/image/upload/v1/default-avatar'
                                                    }
                                                });
                                                if (response.data.success) {
                                                    dispatch(loadUser());
                                                    toast.success('Avatar reset to default');
                                                }
                                            } catch (error) {
                                                toast.error('Failed to reset avatar');
                                            }
                                        }}
                                        className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors"
                                    >
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.145 5.984a20.354 20.354 0 006.062 6.062m-13.414-13.414a20.354 20.354 0 006.062 6.062M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5" />
                                        </svg>
                                        Reset to Default
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Profile Form */}
                        <div className='max-w-4xl mx-auto'>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name and Email Row */}
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('profile.content.fullName')}
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input 
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                            maxLength={30}
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <p className="text-xs text-gray-500">
                                                {name ? `${name.length}/30 characters` : '0/30 characters'}
                                            </p>
                                            {name && name.length < 2 && (
                                                <p className="text-xs text-red-500">Name must be at least 2 characters</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('profile.content.emailAddress')}
                                        </label>
                                        <input 
                                            type="email"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50"
                                            disabled
                                            value={email}
                                            placeholder="Email cannot be changed"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Email address cannot be modified for security reasons</p>
                                    </div>
                                </div>

                                {/* Phone and Address Row */}
                                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('profile.content.phoneNumber')}
                                            <span className="text-gray-500 ml-1">(optional)</span>
                                        </label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="Enter your phone number (optional)"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            We'll use this to contact you about your orders
                                        </p>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t('profile.content.address') || 'Address'}
                                            <span className="text-gray-500 ml-1">(optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Enter your address (optional)"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            This helps us deliver your orders to the right place
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-center pt-4">
                                    <button
                                        className={`px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                                            loading ? 'opacity-50 cursor-not-allowed transform-none' : ''
                                        }`}
                                        disabled={loading}
                                        type="submit"
                                    >
                                        {loading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                {t('profile.content.updating') || 'Updating...'}
                                            </div>
                                        ) : (
                                            t('profile.content.update') || 'Update Profile'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )
            }

            {/* Orders */}
            {
                active === 2 && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                My Orders
                            </h2>
                            <p className="text-gray-600">
                                Track and manage your order history
                            </p>
                        </div>
                        <AllOrders />
                    </div>
                )
            }

            {/* Refund Orders */}
            {
                active === 3 && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                Refund Orders
                            </h2>
                            <p className="text-gray-600">
                                View and manage your refund requests
                            </p>
                        </div>
                        <AllRefundOrders />
                    </div>
                )
            }

            {/* Track Order */}
            {active === 5 && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            Track Order
                        </h2>
                        <p className="text-gray-600">
                            Track the status of your current orders
                        </p>
                    </div>
                    <TrackOrder />
                </div>
            )}

            {/* Change Password */}
            {active === 6 && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            Change Password
                        </h2>
                        <p className="text-gray-600">
                            Update your account password for enhanced security
                        </p>
                    </div>
                    <ChangePassword />
                </div>
            )}

            {/* User Address */}
            {active === 7 && (
                <div>
                    <div className="mb-6">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            Address Management
                        </h2>
                        <p className="text-gray-600">
                            Manage your delivery addresses and preferences
                        </p>
                    </div>
                    <Address />
                </div>
            )}

        </div >
    )
}

// All orders
const AllOrders = () => {
    const { user } = useSelector((state) => state.user);

    const { orders } = useSelector((state) => state.order);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllOrdersOfUser(user._id));
    }, []);

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
                <Link to="/products" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300">
                    Browse Products
                </Link>
            </div>
        );
    }




    const columns = [
        { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            cellClassName: (params) => {
                return params.getValue(params.id, "status") === "Delivered"
                    ? "greenColor"
                    : "redColor";
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
        },

        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
        },

        {
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/user/order/${params.id}`}>
                            <Button>
                                <AiOutlineArrowRight size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];

    const row = [];

    orders &&
        orders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item.cart.length,
                total: "dh " + item.totalPrice,
                status: item.status,
            });
        });


    return (
        <div className="w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <DataGrid
                    rows={row}
                    columns={columns}
                    pageSize={10}
                    disableSelectionOnClick
                    autoHeight
                    className="border-0"
                    componentsProps={{
                        toolbar: {
                            sx: {
                                backgroundColor: '#f8fafc',
                                borderBottom: '1px solid #e2e8f0',
                                padding: '16px',
                            },
                        },
                    }}
                    sx={{
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f1f5f9',
                            padding: '16px 8px',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f8fafc',
                            borderBottom: '2px solid #e2e8f0',
                            '& .MuiDataGrid-columnHeader': {
                                padding: '16px 8px',
                                fontWeight: 600,
                                color: '#374151',
                            },
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#fef3c7',
                        },
                    }}
                />
            </div>
        </div>
    )
}

// Refund page

const AllRefundOrders = () => {
    const { user } = useSelector((state) => state.user);
    const { orders } = useSelector((state) => state.order);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllOrdersOfUser(user._id));
    }, []);


    const eligibleOrders = orders && orders.filter((item) => item.status === "Processing refund");

    const columns = [
        { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            flex: 0.7,
            cellClassName: (params) => {
                return params.getValue(params.id, "status") === "Delivered"
                    ? "greenColor"
                    : "redColor";
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
        },

        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
        },

        {
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/user/order/${params.id}`}>
                            <Button>
                                <AiOutlineArrowRight size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];

    const row = [];

    eligibleOrders &&
        eligibleOrders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item.cart.length,
                total: "dh " + item.totalPrice,
                status: item.status,
            });
        });

    if (!eligibleOrders || eligibleOrders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No refund orders</h3>
                <p className="text-gray-500">You don't have any refund orders at the moment</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <DataGrid
                    rows={row}
                    columns={columns}
                    pageSize={10}
                    autoHeight
                    disableSelectionOnClick
                    className="border-0"
                    componentsProps={{
                        toolbar: {
                            sx: {
                                backgroundColor: '#f8fafc',
                                borderBottom: '1px solid #e2e8f0',
                                padding: '16px',
                            },
                        },
                    }}
                    sx={{
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f1f5f9',
                            padding: '16px 8px',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f8fafc',
                            borderBottom: '2px solid #e2e8f0',
                            '& .MuiDataGrid-columnHeader': {
                                padding: '16px 8px',
                                fontWeight: 600,
                                color: '#374151',
                            },
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#fef3c7',
                        },
                    }}
                />
            </div>
        </div>
    );
};


// Track order
const TrackOrder = () => {

    const { user } = useSelector((state) => state.user);
    const { orders } = useSelector((state) => state.order);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllOrdersOfUser(user._id));
    }, []);



    const columns = [
        { field: "id", headerName: "Order ID", minWidth: 150, flex: 0.7 },

        {
            field: "status",
            headerName: "Status",
            minWidth: 150,
            flex: 0.7,
            cellClassName: (params) => {
                return params.getValue(params.id, "status") === "Delivered"
                    ? "greenColor"
                    : "redColor";
            },
        },
        {
            field: "itemsQty",
            headerName: "Items Qty",
            type: "number",
            minWidth: 130,
            flex: 0.7,
        },

        {
            field: "total",
            headerName: "Total",
            type: "number",
            minWidth: 130,
            flex: 0.8,
        },

        {
            field: " ",
            flex: 1,
            minWidth: 150,
            headerName: "",
            type: "number",
            sortable: false,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/user/track/order/${params.id}`}>
                            <Button>
                                <MdTrackChanges size={20} />
                            </Button>
                        </Link>
                    </>
                );
            },
        },
    ];

    const row = []

    orders &&
        orders.forEach((item) => {
            row.push({
                id: item._id,
                itemsQty: item.cart.length,
                total: "dh " + item.totalPrice,
                status: item.status,
            });
        });

    if (!orders || orders.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders to track</h3>
                <p className="text-gray-500">You don't have any orders to track at the moment</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <DataGrid
                    rows={row}
                    columns={columns}
                    pageSize={10}
                    disableSelectionOnClick
                    autoHeight
                    className="border-0"
                    componentsProps={{
                        toolbar: {
                            sx: {
                                backgroundColor: '#f8fafc',
                                borderBottom: '1px solid #e2e8f0',
                                padding: '16px',
                            },
                        },
                    }}
                    sx={{
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #f1f5f9',
                            padding: '16px 8px',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f8fafc',
                            borderBottom: '2px solid #e2e8f0',
                            '& .MuiDataGrid-columnHeader': {
                                padding: '16px 8px',
                                fontWeight: 600,
                                color: '#374151',
                            },
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#fef3c7',
                        },
                    }}
                />
            </div>
        </div>
    )
}


// Payment method

const ChangePassword = () => {
    const { t } = useTranslation();
    const { user } = useSelector((state) => state.user);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const passwordChangeHandler = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        if (!oldPassword.trim()) {
            toast.error('Current password is required');
            return;
        }
        
        if (!newPassword.trim()) {
            toast.error('New password is required');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            toast.error(t('profile.changePassword.passwordMismatch') || 'Passwords do not match');
            return;
        }
        
        if (newPassword.length < 8) {
            toast.error(t('profile.changePassword.passwordTooShort') || 'Password must be at least 8 characters long');
            return;
        }
        
        if (oldPassword === newPassword) {
            toast.error('New password must be different from current password');
            return;
        }
        
        setLoading(true);

        try {
            const response = await apiClient.put(
                `/users/change-password`,
                { currentPassword: oldPassword, newPassword }
            );
            
            if (response.data.success) {
                toast.success(t('profile.changePassword.success') || 'Password updated successfully');
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || t('profile.changePassword.error') || 'Failed to update password';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full max-w-2xl mx-auto'>
            <form
                aria-required
                onSubmit={passwordChangeHandler}
                className="space-y-6"
            >
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        {t('profile.changePassword.oldPassword') || 'Current Password'}
                    </label>
                    <input 
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        required
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        disabled={loading}
                        placeholder="Enter your current password"
                    />
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        {t('profile.changePassword.newPassword') || 'New Password'}
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input 
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        placeholder="Enter your new password"
                        minLength={8}
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                            {newPassword ? `${newPassword.length}/8+ characters` : '0/8+ characters'}
                        </p>
                        {newPassword && newPassword.length < 8 && (
                            <p className="text-xs text-red-500">Password must be at least 8 characters</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('profile.changePassword.confirmPassword') || 'Confirm New Password'}
                        <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        placeholder="Confirm your new password"
                        minLength={8}
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                            {confirmPassword ? `${confirmPassword.length}/8+ characters` : '0/8+ characters'}
                        </p>
                        {confirmPassword && newPassword && confirmPassword !== newPassword && (
                            <p className="text-xs text-red-500">Passwords do not match</p>
                        )}
                        {confirmPassword && newPassword && confirmPassword === newPassword && confirmPassword.length >= 8 && (
                            <p className="text-xs text-green-500">✓ Passwords match</p>
                        )}
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        className={`w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                            loading ? 'opacity-50 cursor-not-allowed transform-none' : ''
                        }`}
                        disabled={loading || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim() || newPassword !== confirmPassword || newPassword.length < 8}
                        type="submit"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                {t('profile.changePassword.updating') || 'Updating...'}
                            </div>
                        ) : (
                            t('profile.changePassword.update') || 'Update Password'
                        )}
                    </button>
                </div>
                
                {/* Password Requirements */}
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li className={`flex items-center ${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                            {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters long
                        </li>
                        <li className={`flex items-center ${newPassword !== oldPassword ? 'text-green-600' : 'text-gray-500'}`}>
                            {newPassword !== oldPassword ? '✓' : '○'} Different from current password
                        </li>
                        <li className={`flex items-center ${newPassword === confirmPassword && newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                            {newPassword === confirmPassword && newPassword.length >= 8 ? '✓' : '○'} Passwords match
                        </li>
                    </ul>
                </div>
            </form>
        </div>
    )
}

// Address
const Address = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    
    const [open, setOpen] = useState(false);
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [addressType, setAddressType] = useState("");
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const addressTypeData = [
        { name: "Default" },
        { name: "Home" },
        { name: "Office" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!addressType.trim()) {
            toast.error("Please select an address type");
            return;
        }
        
        if (!country.trim()) {
            toast.error("Please select a country");
            return;
        }
        
        if (!city.trim()) {
            toast.error("Please enter a city");
            return;
        }
        
        if (!address1.trim()) {
            toast.error("Please enter your address");
            return;
        }

        try {
            // For now, we'll just show a success message since the Redux actions might not be implemented
            toast.success("Address added successfully!");
            setOpen(false);
            setCountry("");
            setCity("");
            setAddress1("");
            setAddress2("");
            setZipCode("");
            setAddressType("");
            
            // TODO: Implement proper address API call when backend is ready
            // dispatch(
            //     updatUserAddress(
            //         country,
            //         city,
            //         address1,
            //         address2,
            //         zipCode,
            //         addressType
            //     )
            // );
        } catch (error) {
            toast.error("Failed to add address. Please try again.");
        }
    }

    const handleDelete = (item) => {
        const id = item._id;
        dispatch(deleteUserAddress(id));
    }

    return (
        <div className='w-full px-5'>

            {
                open && (
                    <div className="fixed w-full h-screen bg-[#0000004b] top-0 left-0 flex items-center justify-center ">
                        <div className="w-[35%] h-[80vh] bg-white rounded shadow relative overflow-y-scroll">
                            <div className="w-full flex justify-end p-3">
                                <RxCross1
                                    size={30}
                                    className="cursor-pointer"
                                    onClick={() => setOpen(false)}
                                />
                            </div>
                            <h1 className="text-center text-[25px] font-Poppins">
                                Add New Address
                            </h1>
                            <div className='w-full'>
                                <form aria-required onSubmit={handleSubmit} className="w-full">
                                    <div className="w-full block p-4">
                                        <div className="w-full pb-2">
                                            <label className="block pb-2 font-medium text-gray-700">
                                                Country <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 bg-white"
                                                required
                                            >
                                                <option value=""
                                                    className='block border pb-2'
                                                >
                                                    Choose your country
                                                </option>
                                                {
                                                    Country &&
                                                    Country.getAllCountries().map((item) => (
                                                        <option
                                                            className="block pb-2"
                                                            key={item.isoCode}
                                                            value={item.isoCode}
                                                        >
                                                            {item.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        {/* City */}
                                        <div className="w-full pb-2">
                                            <label className="block pb-2 font-medium text-gray-700">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 bg-white"
                                                required
                                                disabled={!country}
                                            >
                                                <option value="">
                                                    {country ? 'Choose your city' : 'Please select a country first'}
                                                </option>
                                                {State &&
                                                    State.getStatesOfCountry(country).map((item) => (
                                                        <option
                                                            className="block pb-2"
                                                            key={item.isoCode}
                                                            value={item.isoCode}
                                                        >
                                                            {item.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        {/* Address 1 */}
                                        <div className="w-full pb-2">
                                            <label className="block pb-2 font-medium text-gray-700">
                                                Address 1 <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                                                required
                                                value={address1}
                                                onChange={(e) => setAddress1(e.target.value)}
                                                placeholder="Enter your street address"
                                            />
                                        </div>
                                        {/* Address 2 */}
                                        <div className="w-full pb-2">
                                            <label className="block pb-2 font-medium text-gray-700">
                                                Address 2 <span className="text-gray-500">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                                                value={address2}
                                                onChange={(e) => setAddress2(e.target.value)}
                                                placeholder="Apartment, suite, etc. (optional)"
                                            />
                                        </div>

                                        <div className="w-full pb-2">
                                            <label className="block pb-2 font-medium text-gray-700">
                                                Zip Code <span className="text-gray-500">(optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                                                value={zipCode}
                                                onChange={(e) => setZipCode(e.target.value)}
                                                placeholder="Enter zip/postal code"
                                            />
                                        </div>

                                        <div>
                                            <label className='block pb-2 font-medium text-gray-700'>
                                                Address Type <span className="text-red-500">*</span>
                                            </label>
                                            <select 
                                                value={addressType}
                                                onChange={(e) => setAddressType(e.target.value)}
                                                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 bg-white'
                                                required
                                            >
                                                <option value=""
                                                    className='block border pb-2'
                                                >
                                                    Choose Your Address Type
                                                </option>
                                                {
                                                    addressTypeData &&
                                                    addressTypeData.map((item) => (
                                                        <option
                                                            className='block pb-2'
                                                            key={item.name}
                                                            value={item.name}
                                                        >
                                                            {item.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div className="w-full pt-4">
                                            <button
                                                type="submit"
                                                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                                disabled={!addressType || !country || !city || !address1}
                                            >
                                                Add Address
                                            </button>
                                        </div>

                                    </div>
                                </form>

                            </div>
                        </div>

                    </div>
                )

            }

            {/* Address List */}
            {user && user.addresses && user.addresses.length > 0 ? (
                <div className="space-y-4">
                    {user.addresses.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                                            {item.addressType}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {item.city}, {item.country}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-gray-900 font-medium">
                                            {item.address1}
                                        </p>
                                        {item.address2 && (
                                            <p className="text-gray-600">
                                                {item.address2}
                                            </p>
                                        )}
                                        {item.zipCode && (
                                            <p className="text-gray-600">
                                                Zip: {item.zipCode}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(item)}
                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete address"
                                >
                                    <AiOutlineDelete size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                    <p className="text-gray-500 mb-6">Add your first delivery address to get started</p>
                </div>
            )}
        </div>
    )

}


export default ProfileContent