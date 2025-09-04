import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuthToken } from "../utils/auth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function GoogleAuthHandler() {
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
      toast.error(t("login.googleLoginError", "Google authentication failed. Please try again."));
      navigate("/login", { replace: true });
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
        
        toast.success(t("login.googleLoginSuccess", "Google authentication successful!"));
        
        // Clean up URL and navigate to home
        navigate("/", { replace: true });
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error(t("login.googleLoginError", "Google authentication failed. Please try again."));
        navigate("/login", { replace: true });
      }
    } else if (token) {
      // Fallback for token without user data
      setAuthToken(token);
      navigate("/", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [location.search, navigate, dispatch, t]);

  return null; 
}