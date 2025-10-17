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
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-full flex justify-center mb-6">
                <div className="relative">
                  <Avatar 
                    user={user || {}} 
                    size="xl" 
                    className="w-28 h-28 border-4 border-white shadow-2xl"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-3 border-white rounded-full shadow-lg"></div>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-3">
                {shopData.name || user?.shop?.name}
              </h3>
              <p className="text-blue-100 text-base leading-relaxed max-w-xs mx-auto">
                {shopData.description || user?.shop?.description || t("shop.noDescription", "No description available")}
              </p>
            </div>
          </div>

          {/* Shop Stats */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            {/* Products Count */}
            <div className="flex items-center p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl sm:rounded-2xl border border-blue-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                <FiPackage className="text-white text-lg sm:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-blue-600 font-semibold leading-tight">{t("myShop.totalProducts", "Total Products")}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{products.length}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center p-3 sm:p-4 lg:p-5 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl border border-yellow-100">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg flex-shrink-0">
                <FiStar className="text-white text-lg sm:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-yellow-600 font-semibold leading-tight">{t("myShop.shopRatings", "Shop Rating")}</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">{averageRating.toFixed(1)}/5</p>
                <p className="text-xs text-gray-500 font-medium leading-tight">{totalReviewsLength} {t("myShop.reviews", "reviews")}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {t("myShop.contactInfo", "Contact Information")}
              </h4>
              
              {shopData.address || user?.shop?.address ? (
                <div className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 mt-1">
                    <FiMapPin className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">{t("myShop.address", "Address")}</p>
                    <p className="text-gray-900">{shopData.address || user?.shop?.address}</p>
                  </div>
                </div>
              ) : null}

              {shopData.phoneNumber || user?.shop?.phoneNumber ? (
                <div className="flex items-start p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3 mt-1">
                    <FiPhone className="text-white text-sm" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">{t("myShop.phoneNumber", "Phone Number")}</p>
                    <p className="text-gray-900">{shopData.phoneNumber || user?.shop?.phoneNumber}</p>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start p-3 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <FiCalendar className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">{t("myShop.joinedOn", "Joined On")}</p>
                  <p className="text-gray-900">
                    {shopData?.createdAt?.slice(0, 10) ||
                      user?.shop?.createdAt?.slice(0, 10)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6">
              <Link to="/settings" className="block">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                  <span className="flex items-center justify-center">
                    <FiSettings className="mr-3" size={18} />
                    {t("myShop.editShop", "Edit Shop")}
                  </span>
                </button>
              </Link>

              <button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                onClick={logoutHandler}
              >
                <span className="flex items-center justify-center">
                  <FiLogOut className="mr-3" size={18} />
                  {t("myShop.logOut", "Log Out")}
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
