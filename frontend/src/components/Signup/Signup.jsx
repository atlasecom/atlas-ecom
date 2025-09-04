import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RxAvatar } from "react-icons/rx";
import axios from "axios";
import { backend_url, server } from "../../server";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import { loadUser } from "../../redux/actions/user";
import { removeAuthToken, setAuthToken } from "../../utils/auth";
import Avatar from "../Common/Avatar";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [visible, setVisible] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();



  const handleGoogleLogin = () => {
          window.location.href = `${backend_url}/auth/google`;
  };

  // file upload
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        toast.error(
          t(
            "signup.invalidFileType",
            "Please select an image file (JPG, PNG, GIF, etc.)"
          )
        );
        e.target.value = ""; // Clear the input
        return;
      }

      // Check file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        toast.error(
          t("signup.fileTooLarge", "File size must be less than 10MB")
        );
        e.target.value = ""; // Clear the input
        return;
      }

      setAvatar(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    if (!name || !email || !password) {
      toast.error(
        t("signup.fillAllFields", "Please fill in all required fields")
      );
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      toast.error(
        t("signup.passwordTooShort", "Password must be at least 8 characters long")
      );
      setLoading(false);
      return;
    }

    // Check if server URL is defined
    if (!server) {
      toast.error(
        t(
          "signup.serverError",
          "Server configuration error. Please contact support."
        )
      );
      console.error("Server URL is undefined. Check environment variables.");
      setLoading(false);
      return;
    }

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };

      const newForm = new FormData();
      if (avatar) {
        newForm.append("image", avatar);
      }
      newForm.append("name", name);
      newForm.append("email", email);
      newForm.append("password", password);
      newForm.append("phoneNumber", phoneNumber || '');
      newForm.append("address", address || '');

      const res = await axios.post(`${server}/users/register`, newForm, config);

      toast.success(
        t("signup.accountCreated", "Account created successfully! Please log in to continue.")
      );
      setAvatar(null);

      // Registration successful - redirect to login page
      toast.success(
        t("signup.accountCreated", "Account created successfully! Please log in to continue.")
      );
      
      // Clear form and redirect to login page
      setAvatar(null);
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          t("signup.signupError", "Signup failed. Please try again.")
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
      style={{ minHeight: "100vh", minHeight: "100dvh" }}
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
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            {t("signup.title", "Create Your Account")}
          </h2>
          <p className="text-gray-600 text-sm">
            {t("signup.subtitle", "Join us and start your journey today")}
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 border border-white/20 animate-slide-up">
          {/* Google Signup Button - Top */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full mb-6 flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FcGoogle size={20} />
            <span className="text-sm font-medium text-gray-700">
              {t("signup.continueWithGoogle", "Continue with Google")}
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="mx-4">
                <span className="text-sm text-gray-500 font-medium">
                  {t("signup.orContinueWith", "Or continue with email")}
                </span>
              </div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name start */}
            <div className="group">
              <label
                htmlFor="name"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("signup.fullName", "Full Name")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="name"
                  required
                  placeholder={t(
                    "signup.fullNamePlaceholder",
                    "Enter your full name"
                  )}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                    isRTL ? "text-right" : "text-left pr-12"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <div
                  className={`absolute inset-y-0 ${
                    isRTL ? "left-0 pl-3" : "right-0 pr-3"
                  } flex items-center pointer-events-none`}
                >
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Full Name end */}

            {/* Email address */}
            <div className="group">
              <label
                htmlFor="email"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("signup.email", "Email Address")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  required
                  placeholder={t(
                    "signup.emailPlaceholder",
                    "Enter your email address"
                  )}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                    isRTL ? "text-right" : "text-left pr-12"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <div
                  className={`absolute inset-y-0 ${
                    isRTL ? "left-0 pl-3" : "right-0 pr-3"
                  } flex items-center pointer-events-none`}
                >
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
            {/* Email address end */}
            {/* Password start */}
            <div className="group">
              <label
                htmlFor="password"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("signup.password", "Password")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={visible ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  required
                  placeholder={t(
                    "signup.passwordPlaceholder",
                    "Enter your password"
                  )}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                    isRTL ? "text-right" : "text-left pr-12"
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
            {/* Password end */}

            {/* Phone Number start */}
            <div className="group">
              <label
                htmlFor="phoneNumber"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("signup.phoneNumber", "Phone Number")}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  id="phoneNumber"
                  autoComplete="tel"
                  placeholder={t(
                    "signup.phoneNumberPlaceholder",
                    "Enter your phone number (optional)"
                  )}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                    isRTL ? "text-right" : "text-left pr-12"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <div
                  className={`absolute inset-y-0 ${
                    isRTL ? "left-0 pl-3" : "right-0 pr-3"
                  } flex items-center pointer-events-none`}
                >
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Phone Number end */}

            {/* Address start */}
            <div className="group">
              <label
                htmlFor="address"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("signup.address", "Address")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  id="address"
                  autoComplete="address-line1"
                  placeholder={t(
                    "signup.addressPlaceholder",
                    "Enter your address (optional)"
                  )}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                    isRTL ? "text-right" : "text-left pr-12"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <div
                  className={`absolute inset-y-0 ${
                    isRTL ? "left-0 pl-3" : "right-0 pr-3"
                  } flex items-center pointer-events-none`}
                >
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Address end */}

            {/* Avatar start */}
            <div className="group">
              <label
                htmlFor="avatar"
                className={`block text-sm font-semibold text-gray-700 mb-2 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("signup.avatar", "Profile Picture")}
              </label>
              <div
                className={`flex items-center space-x-4 ${
                  isRTL ? "flex-row-reverse space-x-reverse" : "flex-row"
                }`}
              >
                <div className="relative">
                  <span className="inline-block h-16 w-16 rounded-full overflow-hidden ring-2 ring-gray-200 shadow-lg">
                    {avatar ? (
                      <img
                        src={URL.createObjectURL(avatar)}
                        alt={t("signup.avatarAlt", "Profile picture preview")}
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <Avatar 
                        user={{ name: name || 'User' }} 
                        size="lg" 
                        className="h-full w-full"
                      />
                    )}
                  </span>
                  {avatar && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Input file start */}
                <label
                  htmlFor="file-input"
                  className="flex items-center justify-center px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-gray-50/50 hover:bg-white hover:border-red-400 transition-all duration-300 cursor-pointer group"
                >
                  <svg
                    className="w-5 h-5 mr-2 text-gray-400 group-hover:text-red-500 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="group-hover:text-red-600 transition-colors duration-200">
                    {t("signup.uploadFile", "Upload Avatar")}
                  </span>
                  <input
                    type="file"
                    name="avatar"
                    id="file-input"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="sr-only"
                  />
                </label>
                {/* Input file end */}
              </div>
              <p
                className={`mt-2 text-xs text-gray-500 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("signup.avatarOptional", "Optional: JPG, PNG up to 10MB")}
              </p>
            </div>
            {/* Avatar end */}

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
                    {t("signup.creating", "Creating Account...")}
                  </span>
                </div>
              ) : (
                <span className="font-semibold">
                  {t("signup.submit", "Create Account")}
                </span>
              )}
            </button>

            {/* Sign In Link */}
            <div
              className={`mt-8 text-center ${isRTL ? "space-x-reverse" : ""}`}
            >
              <p className="text-sm text-gray-600">
                {t("signup.haveAccount", "Already have an account?")}{" "}
                <Link
                  to="/login"
                  className="font-bold text-red-600 hover:text-red-500 transition-colors duration-200 hover:underline"
                >
                  {t("signup.signIn", "Sign in here")}
                </Link>
              </p>
            </div>
          </form>
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
            {t("signup.backToHome", "Back to Home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
