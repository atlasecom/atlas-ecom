import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuthToken } from "../utils/auth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { server } from "../server";

export default function GoogleAuthHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processGoogleAuth = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get("token");
        const userParam = searchParams.get("user");
        const error = searchParams.get("error");

        console.log('🔍 Google Auth Handler - Processing:', { token: !!token, user: !!userParam, error });

        if (error === 'oauth_failed') {
          console.error('❌ OAuth failed:', error);
          toast.error(t("login.googleLoginError", "Google authentication failed. Please try again."));
          navigate("/login", { replace: true });
          return;
        }

        if (token && userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam));
            console.log('✅ User data received:', user.email, user.role);
            
            // Set auth token
            setAuthToken(token);
            
            // Set user in Redux store
            dispatch({
              type: "LoadUserSuccess",
              payload: user,
            });
            
            toast.success(t("login.googleLoginSuccess", "Welcome! You've been successfully logged in with Google."));
            
            // Clean up URL and navigate to home
            navigate("/", { replace: true });
          } catch (parseError) {
            console.error('❌ Error parsing user data:', parseError);
            toast.error(t("login.googleLoginError", "Google authentication failed. Please try again."));
            navigate("/login", { replace: true });
          }
        } else if (token) {
          // Fallback for token without user data - try to fetch user data
          console.log('⚠️ Token without user data, attempting to fetch user info');
          setAuthToken(token);
          
          // Try to load user data from the token
          try {
            const response = await fetch(`${server}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const userData = await response.json();
              dispatch({
                type: "LoadUserSuccess",
                payload: userData.user,
              });
              toast.success(t("login.googleLoginSuccess", "Welcome! You've been successfully logged in with Google."));
            }
          } catch (fetchError) {
            console.error('❌ Error fetching user data:', fetchError);
          }
          
          navigate("/", { replace: true });
        } else {
          console.log('❌ No token or user data found, redirecting to login');
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error('❌ Google Auth Handler error:', error);
        toast.error(t("login.googleLoginError", "Google authentication failed. Please try again."));
        navigate("/login", { replace: true });
      } finally {
        setIsProcessing(false);
      }
    };

    processGoogleAuth();
  }, [location.search, navigate, dispatch, t]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing Google authentication...</p>
        </div>
      </div>
    );
  }

  return null; 
}