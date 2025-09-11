// Example: VerifyEmail.jsx
import React, { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { server } from "../server";
import { useTranslation } from "react-i18next";

const VerifyEmail = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const { seller } = useSelector((state) => state.seller);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = seller.email;

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post(`${server}/shop/verify-email`, {
        email,
        code,
      });
      setMessage(response.data.message);

      // If verification is successful, update global state and navigate
      if (response.data.success) {
        dispatch({
          type: "UpdateSellerVerified",
          payload: true,
        });
        // Optionally, you can reload seller data here if needed
        navigate("/dashboard");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || t('verifyEmail.verificationFailed')
      );
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg("");
    try {
      const response = await axios.post(`${server}/shop/regenerate-code`, { email });
      setResendMsg(response.data.message || t('verifyEmail.codeResent'));
    } catch (error) {
      setResendMsg(
        error.response?.data?.message || t('verifyEmail.resendFailed')
      );
    }
    setResendLoading(false);
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
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            {t('verifyEmail.title', 'Verify Your Email')}
          </h2>
          <p className="text-gray-600 text-sm">
            {t('verifyEmail.subtitle', 'Enter the verification code sent to your email')}
          </p>
          {email && (
            <p className="text-gray-500 text-xs mt-1">
              {t('verifyEmail.sentTo', 'Code sent to')}: <span className="font-medium">{email}</span>
            </p>
          )}
        </div>

        {/* Verification Card */}
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 animate-slide-up">
          <form onSubmit={handleVerify} className="space-y-6">
            {/* Verification Code Input */}
            <div className="group">
              <label
                htmlFor="code"
                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                {t('verifyEmail.enterCode', 'Verification Code')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="code"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder={t('verifyEmail.codePlaceholder', 'Enter 6-digit code')}
                  className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white focus:bg-white text-center tracking-widest text-lg font-mono ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                  dir={isRTL ? "rtl" : "ltr"}
                  maxLength="6"
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Verify Button */}
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
                    {t("verifyEmail.verifying", "Verifying...")}
                  </span>
                </div>
              ) : (
                <span className="font-semibold">
                  {t('verifyEmail.verifyButton', 'Verify Email')}
                </span>
              )}
            </button>
          </form>

          {/* Resend Code Button */}
          <div className="mt-6">
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className={`w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95 ${
                resendLoading ? "cursor-not-allowed" : ""
              }`}
            >
              {resendLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  <span>{t("verifyEmail.resending", "Resending...")}</span>
                </div>
              ) : (
                t('verifyEmail.resendButton', 'Resend Code')
              )}
            </button>
          </div>

          {/* Message Display */}
          {(message || resendMsg) && (
            <div className={`mt-6 p-4 rounded-xl ${
              message 
                ? "bg-red-50 border border-red-200 text-red-700" 
                : "bg-green-50 border border-green-200 text-green-700"
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {message ? (
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className={`ml-3 text-sm font-medium ${isRTL ? "text-right" : "text-left"}`}>
                  {message || resendMsg}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Login Link */}
        <div className="text-center mt-8 animate-fade-in-delayed">
          <Link
            to="/shop-login"
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
            {t('verifyEmail.backToLogin', 'Back to Login')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;