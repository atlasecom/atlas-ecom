import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { backend_url, server } from "../../server";
import styles from "../../styles/styles";
import Loader from "../Layout/Loader";
import { getAuthToken } from "../../utils/auth";
import { removeAuthToken } from "../../utils/auth";
import { logoutUser } from "../../redux/actions/user";
import { useNavigate } from "react-router-dom";
import Avatar from "../Common/Avatar";
import VerifiedBadge from "../Common/VerifiedBadge";
const ShopInfo = ({ isOwner }) => {
  const [data, setData] = useState({});
  const { products } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchShopData = async () => {
      setIsLoading(true);
      const token = getAuthToken();
      
      try {
        let shopId;
        
        if (isOwner) {
          // If owner, use user's shop ID
          shopId = user?.shop?._id || user?.shop;
        } else {
          // If not owner, use shop ID from URL
          shopId = id;
        }
        
        if (!shopId) {
          console.log('No shop ID available');
          setIsLoading(false);
          return;
        }
        
        console.log('Fetching shop info for:', shopId);
        
        const response = await axios.get(`${server}/api/shops/${shopId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.success) {
          setData(response.data.shop);
        }
        
      } catch (error) {
        console.error('Error fetching shop info:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShopData();
  }, [isOwner, user?.shop?._id, user?.shop, id]);

  const logoutHandler = async () => {
    navigate("/");
    removeAuthToken();
    dispatch(logoutUser());
  };

  const [productCount, setProductCount] = useState(0);

  // Fetch product count separately
  useEffect(() => {
    const fetchProductCount = async () => {
      const token = getAuthToken();
      
      try {
        let shopId;
        
        if (isOwner) {
          shopId = user?.shop?._id || user?.shop;
        } else {
          shopId = id;
        }
        
        if (!shopId) return;
        
        const response = await axios.get(`${server}/api/shops/${shopId}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setProductCount(response.data.products?.length || 0);
        }
        
      } catch (error) {
        console.error('Error fetching product count:', error);
        setProductCount(0);
      }
    };
    
    fetchProductCount();
  }, [isOwner, user?.shop?._id, user?.shop, id]);

  const totalReviewsLength =
    products &&
    products.reduce((acc, product) => acc + (product.reviews?.length || 0), 0);

  const totalRatings =
    products &&
    products.reduce(
      (acc, product) =>
        acc + (product.reviews?.reduce((sum, review) => sum + (review.rating || 0), 0) || 0),
      0
    );

  const averageRating = totalReviewsLength > 0 ? totalRatings / totalReviewsLength : 0;

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div className={`${i18n.language === "ar" ? "rtl" : "ltr"}`}>
          {/* Professional Header Section */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-t-lg">
            <div className="text-center">
              {/* Avatar with enhanced styling */}
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto mb-4 relative">
                  <Avatar 
                    user={data.owner || {}} 
                    size="2xl" 
                    className="w-full h-full rounded-full border-4 border-white shadow-xl"
                  />
                  {/* Verified badge overlay */}
                  {data.verifiedBadge && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                      <VerifiedBadge size="sm" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Shop name with enhanced styling */}
              <div className="mb-3">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{data.name}</h3>
                {data.verifiedBadge && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Verified Seller</span>
                  </div>
                )}
              </div>
              
              {/* Description with enhanced styling */}
              <p className="text-gray-600 text-sm leading-relaxed px-4">
                {data.description}
              </p>
            </div>
          </div>

          {/* Professional Info Cards */}
          <div className="p-6 space-y-4">
            {/* Address Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">{t("shopInfo.address", "Address")}</h5>
                  <p className="text-sm text-gray-600 break-words">{data.address}</p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">{t("shopInfo.phoneNumber", "Phone Number")}</h5>
                  <p className="text-sm text-gray-600">{data.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Products Count Card */}
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 leading-tight">{t("shopInfo.totalProducts", "Total Products")}</h5>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 leading-tight">{productCount}</p>
                </div>
              </div>
            </div>

            {/* Joined Date Card */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-semibold text-gray-900 mb-1">{t("shopInfo.joinedOn", "Joined On")}</h5>
                  <p className="text-sm text-gray-600">{data?.createdAt?.slice(0, 10)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons for Owner */}
          {isOwner && (
            <div className="p-6 pt-0 space-y-3">
              <Link to="/settings" className="block">
                <div className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-xl font-medium text-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    {t("shopInfo.editShop", "Edit Shop")}
                  </div>
                </div>
              </Link>

              <div
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-4 rounded-xl font-medium text-center transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                onClick={logoutHandler}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  {t("shopInfo.logOut", "Log Out")}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ShopInfo;
