import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCardNew";
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
            <div className="flex w-full items-center justify-between">
                <div className="w-full flex">
                    <div className="flex items-center" onClick={() => setActive(1)}>
                        <h5
                            className={`font-[600] text-[20px] ${active === 1 ? "text-red-500" : "text-[#333]"
                                } cursor-pointer ${i18n.language === 'ar' ? 'pl-[20px]' : 'pr-[20px]'}`}
                        >
                            {t("myShop.myProducts")}
                        </h5>
                    </div>
                    <div className="flex items-center" onClick={() => setActive(2)}>
                        <h5
                            className={`font-[600] text-[20px] ${active === 2 ? "text-red-500" : "text-[#333]"
                                } cursor-pointer ${i18n.language === 'ar' ? 'pl-[20px]' : 'pr-[20px]'}`}
                        >
                            {t("myShop.myEvents")}
                        </h5>
                    </div>

                    <div className="flex items-center" onClick={() => setActive(3)}>
                        <h5
                            className={`font-[600] text-[20px] ${active === 3 ? "text-red-500" : "text-[#333]"
                                } cursor-pointer ${i18n.language === 'ar' ? 'pl-[20px]' : 'pr-[20px]'}`}
                        >
                            {t("myShop.shopReviews")}
                        </h5>
                    </div>
                </div>
                
            </div>

            <br />

            {active === 1 && (
                <div>
                    {products && products.length > 0 ? (
                        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0">
                            {products.map((product, index) => (
                                <ProductCard data={product} key={index} isShop={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiPackage className="text-2xl text-blue-600" />
                            </div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-2">
                                {t("myShop.noProducts", "No Products Available")}
                            </h5>
                            <p className="text-gray-600 mb-4">
                                {t("myShop.noProductsDesc", "You haven't added any products to your shop yet.")}
                            </p>
                            <Link to="/dashboard-create-product" className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <FiPlus className="mr-2" size={16} />
                                {t("myShop.createFirstProduct", "Create Your First Product")}
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {active === 2 && (
                <div className="w-full">
                    {events && events.length > 0 ? (
                        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0">
                            {events.map((event, index) => (
                                <ProductCard
                                    data={event}
                                    key={index}
                                    isShop={true}
                                    isEvent={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiBarChart className="text-2xl text-green-600" />
                            </div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-2">
                                {t("myShop.noEvents", "No Events Available")}
                            </h5>
                            <p className="text-gray-600 mb-4">
                                {t("myShop.noEventsDesc", "You haven't created any events for your shop yet.")}
                            </p>
                            <Link to="/dashboard-create-event" className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                <FiPlus className="mr-2" size={16} />
                                {t("myShop.createFirstEvent", "Create Your First Event")}
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Shop reviews */}
            {active === 3 && (
                <div className="w-full">
                    {loadingUsers && (
                        <div className="flex items-center justify-center py-4">
                            <div className="flex items-center gap-2 text-gray-600">
                                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                <span>{t("common.loadingUserData", "Loading user information...")}</span>
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
                                <div className="w-full flex my-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200" key={index}>
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
                        <div className="w-full text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">💬</span>
                            </div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-2">
                                {t("myShop.noReviews", "No Reviews Yet")}
                            </h5>
                            <p className="text-gray-600 mb-4 max-w-md mx-auto">
                                {t("myShop.noReviewsDesc", "Your shop hasn't received any reviews yet. Reviews will appear here once customers rate your products or events.")}
                            </p>
                            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Product Reviews
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Event Reviews
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyShopProfileData;
