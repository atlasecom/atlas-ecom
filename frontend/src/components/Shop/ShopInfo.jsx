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
          <div className="w-full py-5">
            <div className="w-full flex item-center justify-center">
              <Avatar 
                user={data.owner || {}} 
                size="2xl" 
                className="w-[150px] h-[150px]"
              />
            </div>
            <h3 className="text-center py-2 text-[20px]">{data.name}</h3>
            <p className="text-[16px] text-[#000000a6] p-[10px] flex items-center">
              {data.description}
            </p>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">{t("shopInfo.address", "Address")}</h5>
            <h4 className="text-[#000000a6]">{data.address}</h4>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">
              {t("shopInfo.phoneNumber", "Phone Number")}
            </h5>
            <h4 className="text-[#000000a6]">{data.phoneNumber}</h4>
          </div>
          <div className="p-3">
            <h5 className="font-[600]">
              {t("shopInfo.totalProducts", "Total Products")}
            </h5>
            <h4 className="text-[#000000a6]">{productCount}</h4>
          </div>
          {/* <div className="p-3">
                            <h5 className="font-[600]">{t('shopInfo.shopRatings', 'Shop Ratings')}</h5>
                            <h4 className="text-[#000000b0]">{averageRating}/5</h4>
                        </div> */}
          <div className="p-3">
            <h5 className="font-[600]">
              {t("shopInfo.joinedOn", "Joined On")}
            </h5>
            <h4 className="text-[#000000b0]">
              {data?.createdAt?.slice(0, 10)}
            </h4>
          </div>
          {isOwner && (
            <div className="py-3 px-4">
              <Link to="/settings">
                <div
                  className={`${styles.button} !w-full !h-[42px] !rounded-[5px] mb-3`}
                >
                  <span className="text-white">
                    {t("shopInfo.editShop", "Edit Shop")}
                  </span>
                </div>
              </Link>

              <div
                className={`${styles.button} !w-full !h-[42px] !rounded-[5px] cursor-pointer`}
                onClick={logoutHandler}
              >
                <span className="text-white">
                  {t("shopInfo.logOut", "Log Out")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ShopInfo;
