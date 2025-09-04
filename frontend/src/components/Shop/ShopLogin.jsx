import React, { useState } from 'react'
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import styles from "../../styles/styles";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import axios from "axios";
import { server } from "../../server";
import { toast } from "react-toastify";
import { getAuthToken } from "../../utils/auth";


const ShopLogin = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const { t, i18n } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false);

    const isRTL = i18n.language === 'ar';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(
                `${server}/auth/login`,
                { email, password }
            );
           
            toast.success(t('shopLogin.loginSuccess', 'Login Success!'));
           
        } catch (err) {
            toast.error(err.response?.data?.message || t('shopLogin.loginError', 'Login failed. Please try again.'));
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
                                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                                />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                        {t('shopLogin.title', 'Login to your Shop')}
                    </h2>
                    <p className="text-gray-600 text-sm">
                        {t('shopLogin.subtitle', 'Access your shop dashboard and manage your business')}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-8 animate-slide-up">
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <div className="group">
                            <label
                                htmlFor="email"
                                className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors duration-200 group-focus-within:text-blue-600 ${
                                    isRTL ? "text-right" : "text-left"
                                }`}
                            >
                                {t('shopLogin.email', 'Email address')}
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    name='email'
                                    id="email"
                                    autoComplete='email'
                                    required
                                    placeholder={t('shopLogin.emailPlaceholder', 'Please enter valid email')}
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
                                {t('shopLogin.password', 'Password')}
                            </label>
                            <div className="relative">
                                <input
                                    type={visible ? "text" : "password"}
                                    name='password'
                                    id="password"
                                    autoComplete='current-password'
                                    required
                                    placeholder={t('shopLogin.passwordPlaceholder', 'Enter your password')}
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
                                    {t('shopLogin.rememberMe', 'Remember me')}
                                </label>
                            </div>
                            <div className="text-sm">
                                <Link
                                    to="/shop-forgot-password"
                                    className="font-semibold text-red-600 hover:text-red-500 transition-colors duration-200 hover:underline"
                                >
                                    {t('shopLogin.forgotPassword', 'Forgot your password?')}
                                </Link>
                            </div>
                        </div>
                        {/* Submit Button */}
                        <button
                            type='submit'
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
                                        {t("shopLogin.signingIn", "Signing in...")}
                                    </span>
                                </div>
                            ) : (
                                <span className="font-semibold">
                                    {t('shopLogin.submit', 'Sign In')}
                                </span>
                            )}
                        </button>

                        {/* Sign Up Link */}
                        <div className={`mt-8 text-center ${isRTL ? "space-x-reverse" : ""}`}>
                            <p className="text-sm text-gray-600">
                                {t('shopLogin.noAccount', 'Not have any account?')}{" "}
                                <Link
                                    to="/shop-create"
                                    className="font-bold text-red-600 hover:text-red-500 transition-colors duration-200 hover:underline"
                                >
                                    {t('shopLogin.signUp', 'Sign Up')}
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
                        {t('shopLogin.backToHome', 'Back to Home')}
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default ShopLogin






