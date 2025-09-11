import React, { useState } from "react";
import { server } from "../server";
import axios from "axios";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const ShopForgotPassword = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${server}/auth/forgot-password`, { email });
      setSent(true);
      toast.success(t('shopForgotPassword.resetLinkSent'));
    } catch (err) {
      toast.error(
        err.response?.data?.message || t('shopForgotPassword.sendResetFailed')
      );
    }
    setLoading(false);
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
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            {t('shopForgotPassword.title', 'Forgot Password')}
          </h2>
          <p className="text-gray-600 text-sm">
            {t('shopForgotPassword.subtitle', 'Enter your email to receive a password reset link')}
          </p>
        </div>

        {/* Reset Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 animate-slide-up">
          {sent ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('shopForgotPassword.emailSentTitle', 'Email Sent!')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('shopForgotPassword.resetLinkSentMessage', 'We have sent a password reset link to your email address.')}
                </p>
              </div>
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold py-3.5 px-4 rounded-xl hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center"
                >
                  {t('shopForgotPassword.backToLogin', 'Back to Login')}
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="group">
                <label
                  htmlFor="email"
                  className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {t('shopForgotPassword.emailLabel', 'Email Address')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    required
                    placeholder={t('shopForgotPassword.emailPlaceholder', 'Enter your email address')}
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
                      {t("shopForgotPassword.sending", "Sending...")}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold">
                    {t('shopForgotPassword.sendResetButton', 'Send Reset Link')}
                  </span>
                )}
              </button>

              {/* Back to Login Link */}
              <div className={`text-center ${isRTL ? "space-x-reverse" : ""}`}>
                <p className="text-sm text-gray-600">
                  {t('shopForgotPassword.rememberPassword', 'Remember your password?')}{" "}
                  <Link
                    to="/login"
                    className="font-bold text-red-600 hover:text-red-500 transition-colors duration-200 hover:underline"
                  >
                    {t('shopForgotPassword.backToLogin', 'Back to Login')}
                  </Link>
                </p>
              </div>
            </form>
          )}
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
            {t('shopForgotPassword.backToHome', 'Back to Home')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopForgotPassword;
