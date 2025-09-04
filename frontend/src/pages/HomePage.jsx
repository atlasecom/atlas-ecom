import React from "react";
import Header from "../components/Layout/Header";
import BestDeals from "../components/Route/BestDeals/BestDeals";
import Events from "../components/Events/Events";
import FeaturedProduct from "../components/Route/FeaturedProduct/FeaturedProduct";
import Features from "../components/Route/Features/Features";
import CategorySlider from "../components/Route/CategorySlider/CategorySlider";
// import Sponsored from "../components/Route/Sponsored";
import Footer from "../components/Layout/Footer";

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuthToken } from "../utils/auth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const error = searchParams.get("error");

    if (error === 'oauth_failed') {
      toast.error(t("login.googleLoginError", "Google login failed. Please try again."));
      // Clean up URL
      navigate('/', { replace: true });
    } else if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Set auth token
        setAuthToken(token);
        
        // Set user in Redux store
        dispatch({
          type: "LoadUserSuccess",
          payload: user,
        });
        
        toast.success(t("login.googleLoginSuccess", "Google login successful!"));
        
        // Clean up URL and navigate to home
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error(t("login.googleLoginError", "Google login failed. Please try again."));
        navigate('/', { replace: true });
      }
    } else if (token) {
      // Fallback for token without user data
      setAuthToken(token);
      navigate('/', { replace: true });
    }
  }, [location.search, navigate, dispatch, t]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-orange-100">
      <Header activeHeading={1} />
      

      
      <div className="relative z-10">
        <CategorySlider />
        <FeaturedProduct />
        <BestDeals />
        <Features />
        <Events />
        

      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
