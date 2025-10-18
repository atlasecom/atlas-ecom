import React, { useState, useEffect } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { server, backend_url } from "../../server";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setAuthToken } from "../../utils/auth";
import atlasLogo from "../../Assests/images/atlasEcom - Copie.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const isRTL = i18n.language === "ar";

  // Handle Google OAuth success
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const googleSuccess = searchParams.get("google_success");
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const error = searchParams.get("error");

    if (error === 'oauth_failed') {
      toast.error(t("login.googleLoginError", "Google authentication failed. Please try again."));
      // Clean up URL
      navigate("/login", { replace: true });
      return;
    }

    if (googleSuccess === 'true' && token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        console.log('✅ Google OAuth success:', user.email, user.role);
        
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
        console.error('❌ Error parsing Google OAuth user data:', parseError);
        toast.error(t("login.googleLoginError", "Google authentication failed. Please try again."));
        navigate("/login", { replace: true });
      }
    }
  }, [location.search, navigate, dispatch, t]);



  const handleGoogleLogin = () => {
        window.location.href = `${backend_url}/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${server}/api/auth/login`,
        { email, password },
        // {withCredentials:true}
      );
      toast.success(t("login.loginSuccess", "Login Success!"));
      
      
      
      // Use user data from login response to set user in Redux store
      if (res.data.user) {
        dispatch({
          type: "LoadUserSuccess",
          payload: res.data.user,
        });
      }
      if(res.data.token){
        setAuthToken(res.data.token)
      }
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          t("login.loginError", "Login failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-red-50 py-8 px-4 sm:px-6 lg:px-8 ${
        isRTL ? "rtl" : "ltr"
      }`}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ minHeight: "100vh" }}
    >
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/3 -right-20 w-60 h-60 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-3000"></div>
      </div>

      <div className="relative max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-4">
            <Link to="/" className="inline-block">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <img 
                  src={atlasLogo} 
                  alt="Atlas Ecom" 
                  className="w-16 h-16 object-contain"
                />
              </div>
            </Link>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            {t("login.welcomeBack", "Welcome Back!")}
          </h2>
          <p className="text-gray-600 text-sm">
            {t("login.signInToContinue", "Sign in to your account to continue")}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8  animate-slide-up">
          {/* Google Login Button - Top */}
          <button
            onClick={handleGoogleLogin}
            className="w-full mb-6 flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FcGoogle size={20} />
            <span className="text-sm font-medium text-gray-700">
              {t("login.continueWithGoogle", "Continue with Google")}
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="mx-4">
                <span className="text-sm text-gray-500 font-medium">
                  {t("login.orContinueWith", "Or continue with email")}
                </span>
              </div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="group">
              <label
                htmlFor="email"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("login.emailAddress", "Email Address")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  placeholder={t(
                    "login.emailPlaceholder",
                    "Enter your email address"
                  )}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                    isRTL ? "text-right pl-12" : "text-left pr-12"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <div className={`absolute inset-y-0 ${isRTL ? "left-0 pl-3" : "right-0 pr-3"} flex items-center pointer-events-none`}>
                  <svg
                    className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label
                htmlFor="password"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("login.password", "Password")}
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  required
                  placeholder={t(
                    "login.passwordPlaceholder",
                    "Enter your password"
                  )}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                    isRTL ? "text-right " : "text-left pr-12"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <button
                  type="button"
                  className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 ${
                    isRTL ? "left-3" : "right-3"
                  }`}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? (
                    <AiOutlineEye size={20} />
                  ) : (
                    <AiOutlineEyeInvisible size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div
              className={`flex items-center justify-between ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="remember-me"
                  id="remember-me"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded transition-colors duration-200"
                />
                <label
                  htmlFor="remember-me"
                  className={`text-sm text-gray-700 font-medium ${
                    isRTL ? "mr-2" : "ml-2"
                  }`}
                >
                  {t("login.rememberMe", "Remember me")}
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-semibold text-red-600 hover:text-red-500 transition-colors duration-200 hover:underline"
                >
                  {t("login.forgotPassword", "Forgot password?")}
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3.5 px-4 rounded-xl hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 ${
                loading ? "cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="font-semibold">
                    {t("login.signingIn", "Signing in...")}
                  </span>
                </div>
              ) : (
                <span className="font-semibold">
                  {t("login.signIn", "Sign In")}
                </span>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className={`mt-8 text-center ${isRTL ? "space-x-reverse" : ""}`}>
            <p className="text-sm text-gray-600">
              {t("login.noAccount", "Don't have an account?")}{" "}
              <Link
                to="/sign-up"
                className="font-bold text-red-600 hover:text-red-500 transition-colors duration-200 hover:underline"
              >
                {t("login.signUp", "Sign up here")}
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-8 animate-fade-in-delayed">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium group"
          >
            <svg
              className={`w-4 h-4 ${
                isRTL ? "ml-2 rotate-180" : "mr-2"
              } group-hover:-translate-x-1 transition-transform duration-200`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t("login.backToHome", "Back to Home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
