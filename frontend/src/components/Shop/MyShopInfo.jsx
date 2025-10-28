import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { backend_url, server } from "../../server";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";
import { getAuthToken } from "../../utils/auth";
import { removeAuthToken } from "../../utils/auth";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/actions/user";
import Avatar from "../Common/Avatar";
import { FiPackage, FiSettings, FiStar, FiMapPin, FiPhone, FiCalendar, FiLogOut } from "react-icons/fi";

const MyShopInfo = () => {
  const { user } = useSelector((state) => state.user);
  const [shopData, setShopData] = useState({});
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchShopData = async () => {
      if (user?.shop?._id || user?.shop) {
        setIsLoading(true);
        const token = getAuthToken();
        const shopId = user.shop._id || user.shop;

        try {
          console.log('Fetching shop data for:', shopId);

          // Fetch shop data
          const shopResponse = await axios.get(`${server}/api/shops/${shopId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (shopResponse.data.success) {
            setShopData(shopResponse.data.shop);
          }

          // Fetch products for review count
          const productsResponse = await axios.get(`${server}/api/shops/${shopId}/products`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (productsResponse.data.success) {
            setProducts(productsResponse.data.products || []);
          }

          console.log('Shop data fetched successfully');
          console.log('Products count:', productsResponse.data.products?.length || 0);

        } catch (error) {
          console.error('Error fetching shop data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchShopData();
  }, [user?.shop?._id, user?.shop]);

  const logoutHandler = async () => {
    navigate("/");
    removeAuthToken();
    dispatch(logoutUser());
  };

  const totalReviewsLength = products.reduce(
    (acc, product) => acc + (product.reviews?.length || 0),
    0
  );
  const totalRatings = products.reduce(
    (acc, product) =>
      acc +
      (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0),
    0
  );
  const averageRating = totalRatings / totalReviewsLength || 0;

  return (
    <>
      {isLoading ? (
        <div className="p-8">
          <Loader />
        </div>
      ) : (
        <div className={`${i18n.language === "ar" ? "rtl" : "ltr"}`}>
          {/* Shop Header */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-6 lg:p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-full flex justify-center mb-4 sm:mb-6">
                <div className="relative">
                  <Avatar 
                    user={user || {}} 
                    size="xl" 
                    className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 border-4 border-white shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 border-3 border-white rounded-full shadow-lg"></div>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 truncate px-2">
                {shopData.name || user?.shop?.name}
              </h3>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xs mx-auto px-4 line-clamp-3">
                {shopData.description || user?.shop?.description || t("shop.noDescription", "No description available")}
              </p>
            </div>
          </div>

          {/* Shop Stats */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Products Count */}
            <div className="flex items-center p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-100 overflow-hidden">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                <FiPackage className="text-white text-lg sm:text-xl" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm text-blue-600 font-semibold leading-tight truncate">{t("myShop.totalProducts", "Total Products")}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight truncate">{products.length}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl border border-yellow-100 overflow-hidden">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                <FiStar className="text-white text-lg sm:text-xl" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs sm:text-sm text-yellow-600 font-semibold leading-tight truncate">{t("myShop.shopRatings", "Shop Rating")}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight truncate">{averageRating.toFixed(1)}/5</p>
                <p className="text-xs text-gray-500 font-medium leading-tight truncate">{totalReviewsLength} {t("myShop.reviews", "reviews")}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {t("myShop.contactInfo", "Contact Information")}
              </h4>
              
              {shopData.address || user?.shop?.address ? (
                <div className="flex items-start p-3 bg-blue-50 rounded-lg overflow-hidden">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <FiMapPin className="text-white text-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-blue-600 font-medium mb-1">{t("myShop.address", "Address")}</p>
                    <p className="text-sm text-gray-900 break-words">{shopData.address || user?.shop?.address}</p>
                  </div>
                </div>
              ) : null}

              {shopData.phoneNumber || user?.shop?.phoneNumber ? (
                <div className="flex items-start p-3 bg-green-50 rounded-lg overflow-hidden">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <FiPhone className="text-white text-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-green-600 font-medium mb-1">{t("myShop.phoneNumber", "Phone Number")}</p>
                    <p className="text-sm text-gray-900 break-words">{shopData.phoneNumber || user?.shop?.phoneNumber}</p>
                  </div>
                </div>
              ) : null}

              {shopData.telegram || user?.shop?.telegram ? (
                <div className="flex items-start p-3 bg-blue-50 rounded-lg overflow-hidden">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-blue-600 font-medium mb-1">{t("myShop.telegram", "Telegram")}</p>
                    <p className="text-sm text-gray-900 break-words truncate">@{shopData.telegram || user?.shop?.telegram}</p>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start p-3 bg-purple-50 rounded-lg overflow-hidden">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <FiCalendar className="text-white text-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-purple-600 font-medium mb-1">{t("myShop.joinedOn", "Joined On")}</p>
                  <p className="text-sm text-gray-900 break-words">
                    {shopData?.createdAt?.slice(0, 10) ||
                      user?.shop?.createdAt?.slice(0, 10)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
              <Link to="/settings" className="block">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                  <span className="flex items-center justify-center text-sm sm:text-base">
                    <FiSettings className="mr-2 sm:mr-3 flex-shrink-0" size={18} />
                    <span className="truncate">{t("myShop.editShop", "Edit Shop")}</span>
                  </span>
                </button>
              </Link>

              <button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                onClick={logoutHandler}
              >
                <span className="flex items-center justify-center text-sm sm:text-base">
                  <FiLogOut className="mr-2 sm:mr-3 flex-shrink-0" size={18} />
                  <span className="truncate">{t("myShop.logOut", "Log Out")}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MyShopInfo;
