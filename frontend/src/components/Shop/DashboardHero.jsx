import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { getAuthToken } from "../../utils/auth";
import { FiPackage, FiBarChart, FiPlus, FiAlertTriangle, FiSmartphone, FiCamera, FiStar } from "react-icons/fi";

const DashboardHero = () => {
    const { user } = useSelector((state) => state.user);
    const [products, setProducts] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalEvents: 0,
        lowStockProducts: 0,
        activeEvents: 0
    });

    // Fetch products from server
    const fetchProducts = async (shopId) => {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            console.log('Fetching products for shop:', shopId);
            const response = await axios.get(`${server}/api/shops/${shopId}/products`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Products response:', response.data);
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to fetch products: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    // Format date function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Fetch events from server
    const fetchEvents = async (shopId) => {
        try {
            setLoading(true);
            setError(null);
            const token = getAuthToken();
            console.log('Fetching events for shop:', shopId);
            const response = await axios.get(`${server}/api/shops/${shopId}/events`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Events response:', response.data);
            if (response.data.success) {
                setEvents(response.data.events);
                console.log('Events set:', response.data.events);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
            setError('Failed to fetch events: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('DashboardHero - User state:', user);
        console.log('DashboardHero - User shop:', user?.shop);
        console.log('DashboardHero - User role:', user?.role);
        console.log('DashboardHero - Is authenticated:', !!user);
        
        if (user && user.shop) {
            const shopId = user.shop._id || user.shop;
            console.log('DashboardHero - Shop ID:', shopId);
            if (shopId) {
                fetchProducts(shopId);
                fetchEvents(shopId);
            } else {
                console.log('DashboardHero - Invalid shop ID');
                setError('Invalid shop ID');
            }
        } else if (user && !user.shop) {
            console.log('DashboardHero - User has no shop');
            setError('No shop found for this user. Please create a shop first.');
        } else {
            console.log('DashboardHero - No user data');
            setError('Please login to access the dashboard');
        }
    }, [user]);

    useEffect(() => {
        if (products.length > 0 || events.length > 0) {
            const lowStockProducts = products.filter(product => product.stock < 10).length;
            const activeEvents = events.filter(event => new Date(event.Finish_Date) > new Date()).length;

            setStats({
                totalProducts: products.length,
                totalEvents: events.length,
                lowStockProducts,
                activeEvents
            });
        }
    }, [products, events]);



    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                    <button 
                        onClick={() => {
                            if (user && user.shop) {
                                const shopId = user.shop._id || user.shop;
                                if (shopId) {
                                    fetchProducts(shopId);
                                    fetchEvents(shopId);
                                }
                            }
                        }}
                        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Mobile Menu Indicator */}
            <div className="lg:hidden bg-blue-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
                <FiSmartphone size={16} />
                Seller Dashboard - Swipe or use menu button to navigate
            </div>

            {/* Main Content */}
            <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
                <div className="w-full">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
                        {/* Total Products */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                            <div className="relative bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-5 lg:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                                        <FiPackage className="text-2xl sm:text-3xl text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.totalProducts}</p>
                                    </div>
                                </div>
                                {stats.lowStockProducts > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                                            <FiAlertTriangle size={16} />
                                            {stats.lowStockProducts} products low on stock
                                        </p>
                                    </div>
                                )}
                                <Link 
                                    to="/dashboard-products"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors duration-200"
                                >
                                    View Products
                                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        {/* Total Events */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                            <div className="relative bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-5 lg:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                                        <FiBarChart className="text-2xl sm:text-3xl text-white" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-600 mb-1">Total Events</p>
                                        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{stats.totalEvents}</p>
                                    </div>
                                </div>
                                {stats.activeEvents > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                        <p className="text-sm text-green-700 font-medium">
                                            🎯 {stats.activeEvents} active events running
                                        </p>
                                    </div>
                                )}
                                <Link 
                                    to="/dashboard-events"
                                    className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold text-sm transition-colors duration-200"
                                >
                                    View Events
                                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Products */}
                    <div className="mb-6 sm:mb-8 lg:mb-10">
                        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 sm:px-5 lg:px-6 py-4 border-b border-blue-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                                    <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Recent Products</h2>
                                    <Link
                                        to="/dashboard-products"
                                        className="inline-flex items-center text-blue-700 hover:text-blue-800 font-semibold transition-colors duration-200 text-sm sm:text-base"
                                    >
                                        View All Products
                                        <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="p-4 sm:p-5 lg:p-6">
                                {products && products.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                                        {products.slice(0, 6).map((product) => (
                                            <div key={product._id} className="group bg-gray-50 rounded-lg p-4 hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-blue-300">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300 flex-shrink-0">
                                                        {product.images && product.images.length > 0 ? (
                                                            <img
                                                                src={(() => {
                                                                    const imageObj = product.images[0];
                                                                    if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                                                                        const imageUrl = imageObj.url;
                                                                        if (typeof imageUrl === 'string' && imageUrl.startsWith("http")) {
                                                                            // Force HTTPS for production URLs
                                                                            return imageUrl.replace('http://', 'https://');
                                                                        }
                                                                        if (typeof imageUrl === 'string') {
                                                                            return `/uploads/${imageUrl}`;
                                                                        }
                                                                    }
                                                                    if (typeof imageObj === 'string') {
                                                                        if (imageObj.startsWith("http")) {
                                                                            // Force HTTPS for production URLs
                                                                            return imageObj.replace('http://', 'https://');
                                                                        }
                                                                        return `/uploads/${imageObj}`;
                                                                    }
                                                                    return '/default-product.png';
                                                                })()}
                                                                alt={product.name}
                                                                className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg"
                                                                onError={(e) => {
                                                                    e.target.src = '/default-product.png';
                                                                }}
                                                            />
                                                        ) : (
                                                            <FiCamera className="text-xl sm:text-2xl text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 truncate mb-1 text-sm sm:text-base">{product.name}</h4>
                                                        <p className="text-base sm:text-lg font-bold text-orange-600 mb-2">{product.originalPrice} - {product.discountPrice} DH</p>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                            <div className="flex items-center space-x-1">
                                                                <FiStar className="text-yellow-400" size={14} />
                                                                <span className="text-sm text-gray-600 font-medium">{product.ratings || 0}</span>
                                                            </div>
                                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                                                product.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                            }`}>
                                                                Stock: {product.stock}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FiPackage className="text-3xl sm:text-4xl text-blue-600" />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Products Yet</h3>
                                        <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto px-4">Start building your shop by creating your first product</p>
                                        <Link
                                            to="/dashboard-create-product"
                                            className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                                        >
                                            <FiPlus className="mr-2" size={16} />
                                            Create Your First Product
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Events */}
                    <div className="mb-6 sm:mb-8 lg:mb-10">
                        <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 sm:px-5 lg:px-6 py-4 border-b border-green-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                                    <h2 className="text-xl sm:text-2xl font-bold text-green-900">Recent Events</h2>
                                    <Link
                                        to="/dashboard-events"
                                        className="inline-flex items-center text-green-700 hover:text-green-800 font-semibold transition-colors duration-200 text-sm sm:text-base"
                                    >
                                        View All Events
                                        <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="p-4 sm:p-5 lg:p-6">
                                {events && events.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                                        {events.slice(0, 6).map((event) => (
                                            <div key={event._id} className="group bg-gray-50 rounded-lg p-4 hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-green-300">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300 flex-shrink-0">
                                                        {event.images && event.images.length > 0 ? (
                                                            <img
                                                                src={(() => {
                                                                    const imageObj = event.images[0];
                                                                    if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                                                                        const imageUrl = imageObj.url;
                                                                        // Don't add cache busting to data URIs
                                                                        if (imageUrl.startsWith('data:')) {
                                                                            return imageUrl;
                                                                        }
                                                                        if (typeof imageUrl === 'string' && imageUrl.startsWith("http")) {
                                                                            return imageUrl + '?v=' + Date.now();
                                                                        }
                                                                        if (typeof imageUrl === 'string') {
                                                                            return `${server.replace(/\/$/, "")}${imageUrl}?v=${Date.now()}`;
                                                                        }
                                                                    }
                                                                    if (typeof imageObj === 'string') {
                                                                        // Don't add cache busting to data URIs
                                                                        if (imageObj.startsWith('data:')) {
                                                                            return imageObj;
                                                                        }
                                                                        if (imageObj.startsWith("http")) {
                                                                            return imageObj + '?v=' + Date.now();
                                                                        }
                                                                        return `${server.replace(/\/$/, "")}/${imageObj.replace(/^\//, "")}?v=${Date.now()}`;
                                                                    }
                                                                    return '/default-event.png';
                                                                })()}
                                                                alt={event.name}
                                                                className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-lg"
                                                                onError={(e) => {
                                                                    e.target.src = '/default-event.png';
                                                                }}
                                                            />
                                                        ) : (
                                                            <span className="text-xl sm:text-2xl text-gray-400">🎉</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-gray-900 truncate mb-1 text-sm sm:text-base">{event.name}</h4>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {formatDate(event.start_Date)} - {formatDate(event.Finish_Date)}
                                                        </p>
                                                        <div className="flex flex-col gap-2">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                                                event.status === 'Running' ? 'bg-green-100 text-green-700' :
                                                                event.status === 'Ended' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {event.status === 'Running' ? '🟢 Running' : 
                                                                 event.status === 'Ended' ? '⚫ Ended' : '🟡 Upcoming'}
                                                            </span>
                                                            <span className="text-sm text-orange-600 font-medium">
                                                                {event.originalPrice} - {event.discountPrice} DH
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 sm:py-12">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FiBarChart className="text-3xl sm:text-4xl text-green-600" />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">No Events Yet</h3>
                                        <p className="text-sm sm:text-base text-gray-600 mb-4 max-w-md mx-auto px-4">Create exciting events to promote your products and attract customers</p>
                                        <Link
                                            to="/dashboard-create-event"
                                            className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                                        >
                                            <FiPlus className="mr-2" size={16} />
                                            Create Your First Event
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHero;