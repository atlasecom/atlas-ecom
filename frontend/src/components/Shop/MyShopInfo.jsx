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
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center text-white">
            <div className="w-full flex justify-center mb-4">
              <div className="relative">
                <Avatar 
                  user={user || {}} 
                  size="xl" 
                  className="w-24 h-24 border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {shopData.name || user?.shop?.name}
            </h3>
            <p className="text-orange-100 text-sm leading-relaxed">
              {shopData.description || user?.shop?.description || t("shop.noDescription", "No description available")}
            </p>
          </div>

          {/* Shop Stats */}
          <div className="p-6 space-y-6">
            {/* Products Count */}
            <div className="flex items-center p-4 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-lg">📦</span>
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">{t("myShop.totalProducts", "Total Products")}</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center p-4 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white text-lg">⭐</span>
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">{t("myShop.shopRatings", "Shop Rating")}</p>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}/5</p>
                <p className="text-xs text-gray-500">{totalReviewsLength} {t("myShop.reviews", "reviews")}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                {t("myShop.contactInfo", "Contact Information")}
              </h4>
              
              {shopData.address || user?.shop?.address ? (
                <div className="flex items-start p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm">📍</span>
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium">{t("myShop.address", "Address")}</p>
                    <p className="text-gray-900">{shopData.address || user?.shop?.address}</p>
                  </div>
                </div>
              ) : null}

              {shopData.phoneNumber || user?.shop?.phoneNumber ? (
                <div className="flex items-start p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3 mt-1">
                    <span className="text-white text-sm">📞</span>
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium">{t("myShop.phoneNumber", "Phone Number")}</p>
                    <p className="text-gray-900">{shopData.phoneNumber || user?.shop?.phoneNumber}</p>
                  </div>
                </div>
              ) : null}

              <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <span className="text-white text-sm">📅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">{t("myShop.joinedOn", "Joined On")}</p>
                  <p className="text-gray-900">
                    {shopData?.createdAt?.slice(0, 10) ||
                      user?.shop?.createdAt?.slice(0, 10)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Link to="/settings" className="block">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <span className="flex items-center justify-center">
                    <span className="mr-2">⚙️</span>
                    {t("myShop.editShop", "Edit Shop")}
                  </span>
                </button>
              </Link>

              <button
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                onClick={logoutHandler}
              >
                <span className="flex items-center justify-center">
                  <span className="mr-2">🚪</span>
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
