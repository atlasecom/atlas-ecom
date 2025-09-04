import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllProductsShop } from "../../redux/actions/product";
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCardNew";
import { backend_url, server } from "../../server";
import Ratings from "../Products/Ratings";
import { getAllEventsShop } from "../../redux/actions/event";
import { loadUser } from "../../redux/actions/user";
import axios from "axios";
import { getAuthToken } from "../../utils/auth";
import Avatar from "../Common/Avatar";

const ShopProfileData = ({ isOwner }) => {
    const { products } = useSelector((state) => state.products);
    const { events } = useSelector((state) => state.events);
    const { user } = useSelector((state) => state.user);
    const { id } = useParams(); // Shop ID from URL
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    
    // Local state for fetched data when not owner
    const [localProducts, setLocalProducts] = useState([]);
    const [localEvents, setLocalEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [active, setActive] = useState(1);

    // Determine which data to use based on isOwner
    const currentProducts = isOwner ? products : localProducts;
    const currentEvents = isOwner ? events : localEvents;

    // Data fetching logic based on isOwner prop
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const token = getAuthToken();
            
            try {
                let shopId;
                
                if (isOwner) {
                    // If owner, use user's shop ID
                    if (user?.shop?._id || user?.shop) {
                        shopId = user.shop._id || user.shop;
                    } else {
                        console.log('No shop found for user');
                        setIsLoading(false);
                        return;
                    }
                } else {
                    // If not owner, use shop ID from URL
                    shopId = id;
                }
                
                console.log('Fetching data for shop:', shopId);
                
                // Fetch products
                const productsResponse = await axios.get(`${server}/api/shops/${shopId}/products`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (productsResponse.data.success) {
                    if (isOwner) {
                        setLocalProducts(productsResponse.data.products || []);
                    } else {
                        setLocalProducts(productsResponse.data.products || []);
                    }
                }
                
                // Fetch events
                const eventsResponse = await axios.get(`${server}/api/shops/${shopId}/events`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (eventsResponse.data.success) {
                    if (isOwner) {
                        setLocalEvents(eventsResponse.data.events || []);
                    } else {
                        setLocalEvents(eventsResponse.data.events || []);
                    }
                }
                
                console.log('Products fetched:', productsResponse.data.products?.length || 0);
                console.log('Events fetched:', eventsResponse.data.events?.length || 0);
                
            } catch (error) {
                console.error('Error fetching shop data:', error);
                setLocalProducts([]);
                setLocalEvents([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [isOwner, user?.shop?._id, user?.shop, id]);


    // Ensure allReviews is safely calculated and filtered for valid user data
    const allReviews = currentProducts && currentProducts.length > 0 
        ? currentProducts
            .map((product) => product.reviews || [])
            .flat()
            .filter((review) => review && review.user && review.user.avatar && review.user.name) // Only include reviews with valid user data
        : [];

    // Loading state
    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('shopProfile.loading', 'Loading shop data...')}</p>
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
                            {t('shopProfile.shopProducts', 'Shop Products')}
                        </h5>
                    </div>
                    <div className="flex items-center" onClick={() => setActive(2)}>
                        <h5
                            className={`font-[600] text-[20px] ${active === 2 ? "text-red-500" : "text-[#333]"
                                } cursor-pointer ${i18n.language === 'ar' ? 'pl-[20px]' : 'pr-[20px]'}`}
                        >
                            {t('shopProfile.runningEvents', 'Running Events')}
                        </h5>
                    </div>

                    {/* <div className="flex items-center" onClick={() => setActive(3)}>
                        <h5
                            className={`font-[600] text-[20px] ${active === 3 ? "text-red-500" : "text-[#333]"
                                } cursor-pointer ${i18n.language === 'ar' ? 'pl-[20px]' : 'pr-[20px]'}`}
                        >
                            {t('shopProfile.shopReviews', 'Shop Reviews')}
                        </h5>
                    </div> */}
                </div>
                <div>
                    {
                        isOwner && (
                            <div>
                                <Link to="/dashboard">
                                    <div className={`${styles.button} !rounded-[4px] h-[42px]`}>
                                        <span className="text-[#fff]">{t('shopProfile.goDashboard', 'Go Dashboard')}</span>
                                    </div>
                                </Link>
                            </div>
                        )
                    }
                </div>
            </div>

            <br />

            {active === 1 && (
                <div>
                    {currentProducts && currentProducts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0">
                            {currentProducts.map((i, index) => (
                                <ProductCard data={i} key={index} isShop={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📦</span>
                            </div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-2">
                                {t('shopProfile.noProducts', 'No Products Available')}
                            </h5>
                            <p className="text-gray-600 mb-4">
                                {t('shopProfile.noProductsDesc', 'This shop hasn\'t added any products yet.')}
                            </p>
                            {isOwner && (
                                <Link to="/dashboard-create-product" className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    <span className="mr-2">➕</span>
                                    {t('shopProfile.createFirstProduct', 'Create Your First Product')}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}

            {active === 2 && (
                <div className="w-full">
                    {currentEvents && currentEvents.length > 0 ? (
                        <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-3 lg:gap-[25px] xl:grid-cols-4 xl:gap-[20px] mb-12 border-0">
                            {currentEvents.map((i, index) => (
                                <ProductCard
                                    data={i}
                                    key={index}
                                    isShop={true}
                                    isEvent={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="w-full text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🎉</span>
                            </div>
                            <h5 className="text-lg font-semibold text-gray-900 mb-2">
                                {t('shopProfile.noEvents', 'No Events Available')}
                            </h5>
                            <p className="text-gray-600 mb-4">
                                {t('shopProfile.noEventsDesc', 'This shop hasn\'t created any events yet.')}
                            </p>
                            {isOwner && (
                                <Link to="/dashboard-create-event" className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    <span className="mr-2">✨</span>
                                    {t('shopProfile.createFirstEvent', 'Create Your First Event')}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Shop reviews */}
            {active === 3 && (
                <div className="w-full">
                    {allReviews &&
                        (allReviews || []).map((item, index) => (
                            <div className="w-full flex my-4" key={index}>
                                <Avatar 
                                    user={item.user} 
                                    size="lg" 
                                    className="w-[50px] h-[50px]"
                                />

                                <div className={i18n.language === 'ar' ? 'pr-2' : 'pl-2'}>
                                    <div className="flex w-full items-center">
                                        <h1 className={`font-[600] ${i18n.language === 'ar' ? 'pl-2' : 'pr-2'}`}>{item.user.name}</h1>
                                        <Ratings rating={item.rating} />
                                    </div>
                                    <p className="font-[400] text-[#000000a7]">{item?.comment}</p>

                                    <p className="text-[#000000a7] text-[14px]">{item.createdAt.substring(0, 10)}</p>


                                </div>
                            </div>
                        ))}
                    {allReviews && allReviews.length === 0 && (
                        <h5 className="w-full text-center py-5 text-[18px]">
                            {t('shopProfile.noReviews', 'No Reviews have for this shop!')}
                        </h5>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShopProfileData;