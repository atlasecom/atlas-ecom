import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCard";
import { backend_url, server } from "../../server";
import Ratings from "../Products/Ratings";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";
import Avatar from "../Common/Avatar";
import { FiPackage, FiPlus, FiBarChart } from "react-icons/fi";

const MyShopProfileData = () => {
    const { user } = useSelector((state) => state.user);
    const { t, i18n } = useTranslation();
    
    const [products, setProducts] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [active, setActive] = useState(1);
    const [reviewUsersData, setReviewUsersData] = useState({});
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Fetch data for owner's shop
    useEffect(() => {
        const fetchShopData = async () => {
            if (user?.shop?._id || user?.shop) {
                setIsLoading(true);
                const token = getAuthToken();
                const shopId = user.shop._id || user.shop;
                
                try {
                    console.log('Fetching shop data for:', shopId);
                    
                    // Fetch products
                    const productsResponse = await axios.get(`${server}/api/shops/${shopId}/products`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (productsResponse.data.success) {
                        setProducts(productsResponse.data.products || []);
                    }
                    
                    // Fetch events
                    const eventsResponse = await axios.get(`${server}/api/shops/${shopId}/events`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (eventsResponse.data.success) {
                        setEvents(eventsResponse.data.events || []);
                    }
                    
                    console.log('Products fetched:', productsResponse.data.products?.length || 0);
                    console.log('Events fetched:', eventsResponse.data.events?.length || 0);
                    
                } catch (error) {
                    console.error("Error fetching shop data:", error);
                    setProducts([]);
                    setEvents([]);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        
        fetchShopData();
    }, [user?.shop?._id, user?.shop]);

    // Calculate reviews for tab 3 - include both product and event reviews
    const allReviews = [];
    
    // Add product reviews
    if (products && products.length > 0) {
        const productReviews = products
            .map((product) => product.reviews || [])
            .flat()
            .filter((review) => review && review.user)
            .map(review => ({ ...review, source: 'product' }));
        allReviews.push(...productReviews);
    }
    
    // Add event reviews
    if (events && events.length > 0) {
        const eventReviews = events
            .map((event) => event.reviews || [])
            .flat()
            .filter((review) => review && review.user)
            .map(review => ({ ...review, source: 'event' }));
        allReviews.push(...eventReviews);
    }
    
    // Sort reviews by creation date (newest first)
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Fetch full user information for reviews
    const fetchReviewUsersData = async (reviews) => {
        if (!reviews || reviews.length === 0) return;
        
        setLoadingUsers(true);
        const usersData = {};
        
        try {
            // Get unique user IDs - handle both product and event review structures
            const userIds = [...new Set(
                reviews.map(review => {
                    // For products: review.user, for events: review.user._id
                    return review.user?._id || review.user;
                }).filter(Boolean)
            )];
            
            // Fetch user data for each unique user ID
            const userPromises = userIds.map(async (userId) => {
                try {
                    const response = await axios.get(`${server}/users/${userId}`);
                    return { userId, userData: response.data.user };
                } catch (error) {
                    console.error(`Error fetching user data for ${userId}:`, error);
                    return { userId, userData: null };
                }
            });
            
            const userResults = await Promise.all(userPromises);
            
            // Build users data object
            userResults.forEach(({ userId, userData }) => {
                if (userData) {
                    usersData[userId] = userData;
                }
            });
            
            setReviewUsersData(usersData);
        } catch (error) {
            console.error("Error fetching review users data:", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch user data for reviews when active tab is 3 and reviews are available
    useEffect(() => {
        if (active === 3 && allReviews.length > 0) {
            fetchReviewUsersData(allReviews);
        }
    }, [active, allReviews.length]);

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t("myShop.loadingShopData", "Loading shop data...")}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Professional Header */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 px-8 py-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t("myShop.overview", "Shop Overview")}
                </h2>
                <p className="text-gray-600">
                    {t("myShop.overviewDesc", "Manage your products, events, and view customer feedback")}
                </p>
            </div>

            {/* Professional Tab Navigation */}
            <div className="px-8 py-6 border-b border-gray-100">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActive(1)}
                        className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                            active === 1
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                    >
                        <FiPackage className="mr-2" size={16} />
                        {t("myShop.myProducts")}
                        {products && products.length > 0 && (
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                active === 1 ? "bg-blue-500" : "bg-gray-300"
                            }`}>
                                {products.length}
                            </span>
                        )}
                    </button>
                    
                    <button
                        onClick={() => setActive(2)}
                        className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                            active === 2
                                ? "bg-green-600 text-white shadow-lg shadow-green-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                    >
                        <FiBarChart className="mr-2" size={16} />
                        {t("myShop.myEvents")}
                        {events && events.length > 0 && (
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                active === 2 ? "bg-green-500" : "bg-gray-300"
                            }`}>
                                {events.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActive(3)}
                        className={`flex items-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                            active === 3
                                ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                        }`}
                    >
                        <svg className="mr-2" size={16} width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        {t("myShop.shopReviews")}
                        {allReviews && allReviews.length > 0 && (
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                active === 3 ? "bg-purple-500" : "bg-gray-300"
                            }`}>
                                {allReviews.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-8">

                {active === 1 && (
                    <div>
                        {products && products.length > 0 ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {t("myShop.myProducts", "My Products")} ({products.length})
                                    </h3>
                                    <Link to="/dashboard-create-product" className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                                        <FiPlus className="mr-2" size={16} />
                                        {t("myShop.addProduct", "Add Product")}
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {products.map((product, index) => (
                                        <ProductCard data={product} key={index} isShop={true} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <FiPackage className="text-3xl text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {t("myShop.noProducts", "No Products Yet")}
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                                    {t("myShop.noProductsDesc", "Start building your shop by adding your first product. It's easy and takes just a few minutes!")}
                                </p>
                                <Link to="/dashboard-create-product" className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
                                    <FiPlus className="mr-3" size={20} />
                                    {t("myShop.createFirstProduct", "Create Your First Product")}
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {active === 2 && (
                    <div>
                        {events && events.length > 0 ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {t("myShop.myEvents", "My Events")} ({events.length})
                                    </h3>
                                    <Link to="/dashboard-create-event" className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md">
                                        <FiPlus className="mr-2" size={16} />
                                        {t("myShop.addEvent", "Add Event")}
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {events.map((event, index) => (
                                        <ProductCard
                                            data={event}
                                            key={index}
                                            isShop={true}
                                            isEvent={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <FiBarChart className="text-3xl text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {t("myShop.noEvents", "No Events Yet")}
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                                    {t("myShop.noEventsDesc", "Create exciting events to attract customers and boost your sales. Events help showcase your products in a special way!")}
                                </p>
                                <Link to="/dashboard-create-event" className="inline-flex items-center bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg">
                                    <FiPlus className="mr-3" size={20} />
                                    {t("myShop.createFirstEvent", "Create Your First Event")}
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Shop reviews */}
                {active === 3 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">
                                {t("myShop.shopReviews", "Customer Reviews")} ({allReviews?.length || 0})
                            </h3>
                            <div className="text-sm text-gray-500">
                                {t("myShop.reviewSummary", "Customer feedback and ratings")}
                            </div>
                        </div>
                        
                        {loadingUsers && (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <div className="animate-spin w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                                    <span className="font-medium">{t("common.loadingUserData", "Loading user information...")}</span>
                                </div>
                            </div>
                        )}
                    
                    {allReviews &&
                        allReviews.map((item, index) => {
                            // Handle different review structures for products vs events
                            const userId = item.user?._id || item.user;
                            const baseUserData = item.user?._id ? item.user : null; // If user._id exists, use item.user as base
                            
                            // Get full user data from fetched data or fallback to review.user
                            const fullUserData = reviewUsersData[userId] || baseUserData;
                            const userName = fullUserData?.name || t("common.anonymous", "Anonymous");
                            const userAvatar = fullUserData?.avatar;
                            
                            return (
                                <div className="w-full flex p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200" key={index}>
                                    <div className="flex-shrink-0">
                                        <Avatar 
                                            user={{ name: userName, avatar: userAvatar }} 
                                            size="lg" 
                                            className="w-[50px] h-[50px]"
                                        />
                                    </div>

                                    <div className={`flex-1 min-w-0 ${i18n.language === 'ar' ? 'pr-4' : 'pl-4'}`}>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col 400px:flex-row 400px:items-center gap-2">
                                                <div className="flex flex-col min-w-0">
                                                    <h1 className="font-[600] text-gray-900 break-words">{userName}</h1>
                                                    {fullUserData?.email && (
                                                        <p className="text-sm text-gray-500 break-all">
                                                            {fullUserData.email}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <Ratings rating={item.rating} />
                                                    <span className="text-sm text-gray-500 font-medium">({item.rating}/5)</span>
                                                </div>
                                            </div>
                                            
                                            {/* Review Source Badge */}
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    item.source === 'product' 
                                                        ? 'bg-blue-100 text-blue-700' 
                                                        : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {item.source === 'product' ? (
                                                        <span className="flex items-center gap-2">
                                                            <FiPackage size={14} />
                                                            Product Review
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <FiBarChart size={14} />
                                                            Event Review
                                                        </span>
                                                    )}
                                                </span>
                                                {item.createdAt && (
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <p className="font-[400] text-[#000000a7] break-words leading-relaxed text-sm">
                                                {item?.comment}
                                            </p>
                                            
                                            {/* Additional user information if available */}
                                            {fullUserData && (fullUserData.role || fullUserData.phoneNumber) && (
                                                <div className="flex flex-col 400px:flex-row gap-2 400px:gap-4 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                                    {fullUserData.role && (
                                                        <span className="bg-gray-100 px-2 py-1 rounded self-start">
                                                            {t(`common.${fullUserData.role}`, fullUserData.role)}
                                                        </span>
                                                    )}
                                                    {fullUserData.phoneNumber && (
                                                        <span className="break-all">
                                                            {t("common.phone", "Phone")}: {fullUserData.phoneNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {allReviews && allReviews.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <span className="text-3xl">💬</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    {t("myShop.noReviews", "No Reviews Yet")}
                                </h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                                    {t("myShop.noReviewsDesc", "Your shop hasn't received any reviews yet. Reviews will appear here once customers rate your products or events.")}
                                </p>
                                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span>Product Reviews</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>Event Reviews</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyShopProfileData;
