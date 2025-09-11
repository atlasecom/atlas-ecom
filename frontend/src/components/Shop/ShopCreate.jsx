import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loadUser } from "../../redux/actions/user";
import { getAuthToken, removeAuthToken, setAuthToken } from "../../utils/auth";

const ShopCreate = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  // Shop Info only
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [telegram, setTelegram] = useState("");
  const [banner, setBanner] = useState();

  const [loading, setLoading] = useState(false);

  const isRTL = i18n.language === "ar";

  // ✅ Banner input handler
  const handleBannerInputChange = (e) => {
    const file = e.target.files[0];
    setBanner(file);
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!name.trim()) {
      toast.error("Shop name is required");
      return;
    }
    
    if (name.trim().length < 2) {
      toast.error("Shop name must be at least 2 characters long");
      return;
    }
    
    if (name.trim().length > 50) {
      toast.error("Shop name cannot exceed 50 characters");
      return;
    }
    
    if (!address.trim()) {
      toast.error("Business address is required");
      return;
    }
    
    if (!phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }
    
    if (!zipCode.trim()) {
      toast.error("Zip code is required");
      return;
    }
    
    if (isNaN(zipCode) || zipCode.trim().length < 3) {
      toast.error("Please enter a valid zip code");
      return;
    }
    
    setLoading(true);
    const token = getAuthToken();
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };
    const formData = new FormData();

    try {
      // Shop Information
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("address", address.trim());
      formData.append("phoneNumber", phoneNumber.trim());
      formData.append("zipCode", zipCode.trim());
      formData.append("telegram", telegram.trim());

      // ✅ Add shop banner if uploaded
      if (banner) {
        // Validate banner file
        if (banner.size > 10 * 1024 * 1024) { // 10MB
          toast.error("Banner file size must be less than 10MB");
          setLoading(false);
          return;
        }
        
        if (!banner.type.startsWith('image/')) {
          toast.error("Please select an image file for the banner");
          setLoading(false);
          return;
        }
        
        formData.append("image", banner);
      }

      const res = await axios.post(`${server}/shops/become-seller`, formData, config);
      
      if (res.data.success) {
        toast.success(
          res?.data?.message ||
            t("shopCreate.shopCreatedSuccess", "Shop created successfully!")
        );

        // Update user data
        dispatch(loadUser());
        
        // Navigate to dashboard or show approval message
        if (res.data.shop.isApproved) {
          navigate("/dashboard");
        } else {
          toast.info("Your shop is pending approval. You'll be notified once it's approved.");
          navigate("/");
        }
      }
    } catch (error) {
      console.error('Shop creation error:', error);
      
      if (error.response?.status === 400) {
        // Validation errors
        const errorMessage = error.response.data.message || "Please check your input and try again.";
        toast.error(errorMessage);
      } else if (error.response?.status === 401) {
        toast.error("Please log in to create a shop");
        navigate("/login");
      } else if (error.response?.status === 409) {
        toast.error("You already have a shop");
        navigate("/dashboard");
      } else {
        toast.error(error?.response?.data?.message || "Something went wrong. Please try again.");
      }
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

      <div className="relative max-w-2xl mx-auto">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            {t("shopCreate.title", "Create Your Shop")}
          </h2>
          <p className="text-gray-600 text-sm">
            {t(
              "shopCreate.subtitle",
              "Set up your shop and start selling today"
            )}
          </p>
        </div>

        {/* Shop Creation Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 animate-slide-up">
          {/* Info Section */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Important Information</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Your shop will be reviewed before approval</li>
                  <li>• You'll receive a notification once approved</li>
                  <li>• You can start adding products after approval</li>
                  <li>• All fields marked with * are required</li>
                </ul>
              </div>
            </div>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Shop Name */}
            <div className="group">
              <label
                htmlFor="name"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("shopCreate.shopName", "Shop Name")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t(
                  "shopCreate.shopNamePlaceholder",
                  "Enter your shop name"
                )}
                maxLength={50}
                className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {name ? `${name.length}/50 characters` : '0/50 characters'}
                </p>
                {name && name.length < 2 && (
                  <p className="text-xs text-red-500">Name must be at least 2 characters</p>
                )}
              </div>
            </div>

            {/* Business Description */}
            <div className="group">
              <label
                htmlFor="description"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("shopCreate.businessDescription", "Business Description")}
              </label>
              <textarea
                name="description"
                id="description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  "shopCreate.businessDescriptionPlaceholder",
                  "Tell customers about your business..."
                )}
                maxLength={500}
                className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {description ? `${description.length}/500 characters` : '0/500 characters'}
                </p>
                {description && description.length > 400 && (
                  <p className="text-xs text-orange-500">Getting close to character limit</p>
                )}
              </div>
            </div>

            {/* Business Address */}
            <div className="group">
              <label
                htmlFor="address"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("shopCreate.businessAddress", "Business Address")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t(
                  "shopCreate.businessAddressPlaceholder",
                  "Enter your business address"
                )}
                className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {/* Phone Number */}
            <div className="group">
              <label
                htmlFor="phoneNumber"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("shopCreate.phoneNumber", "Phone Number")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t(
                  "shopCreate.phoneNumberPlaceholder",
                  "06XXXXXXXX"
                )}
                className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {/* Zip Code */}
            <div className="group">
              <label
                htmlFor="zipCode"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("shopCreate.zipCode", "Zip Code")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="zipCode"
                id="zipCode"
                required
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder={t(
                  "shopCreate.zipCodePlaceholder",
                  "Enter zip code"
                )}
                className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {/* Telegram (Optional) */}
            <div className="group">
              <label
                htmlFor="telegram"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("shopCreate.telegram", "Telegram (Optional)")}
              </label>
              <input
                type="text"
                name="telegram"
                id="telegram"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder={t(
                  "shopCreate.telegramPlaceholder",
                  "e.g. myshopgroup or username"
                )}
                className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>

            {/* Banner Upload */}
            <div className="group">
              <label
                htmlFor="banner"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t("shopCreate.banner", "Shop Banner (Optional)")}
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="banner"
                  id="banner"
                  accept="image/*"
                  onChange={handleBannerInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className={`flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors duration-300 cursor-pointer ${
                    banner ? "bg-blue-50 border-blue-400" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <FiUploadCloud className="text-gray-500 text-2xl" />
                    <span className="text-gray-600">
                      {banner
                        ? banner.name
                        : t(
                            "shopCreate.chooseBannerFile",
                            "Choose banner file"
                          )}
                    </span>
                  </div>
                  <span className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors duration-200">
                    {t("shopCreate.browse", "Browse")}
                  </span>
                </div>
              </div>
              {banner && (
                <div className="mt-3">
                  <img
                    src={URL.createObjectURL(banner)}
                    alt="Banner preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !name.trim() || !address.trim() || !phoneNumber.trim() || !zipCode.trim()}
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
                      {t("shopCreate.creating", "Creating Shop...")}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold">
                    {t("shopCreate.submit", "Create Shop")}
                  </span>
                )}
              </button>
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
            {t("shopCreate.backToHome", "Back to Home")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCreate;
