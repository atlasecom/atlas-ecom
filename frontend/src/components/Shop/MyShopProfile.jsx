import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DashboardHeader from "./Layout/DashboardHeader";
import DashboardSideBar from "./Layout/DashboardSideBar";
import MyShopInfo from "./MyShopInfo";
import MyShopProfileData from "./MyShopProfileData";

const MyShopProfile = () => {
    const { user } = useSelector((state) => state.user);
    const { t, i18n } = useTranslation();

    // Show loading if user data is not available
    if (!user) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-xl text-gray-600 font-medium">{t("shop.loadingShop", "Loading your shop...")}</div>
                </div>
            </div>
        );
    }

    // If user doesn't have a shop, show a message to create one
    if (!user.shop) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
                <DashboardHeader />
                <div className="flex flex-col lg:flex-row w-full">
                    <DashboardSideBar />
                    
                    <div className="flex-1 w-full">
                        <div className={`w-full min-h-screen ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
                            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 px-4 sm:px-6 lg:px-8">
                                <div className="max-w-7xl mx-auto">
                                    <div className="text-center">
                                        <h1 className="text-3xl font-bold mb-4">
                                            {t("myShop.noShopTitle", "No Shop Found")}
                                        </h1>
                                        <p className="text-blue-100 text-lg mb-8">
                                            {t("myShop.noShopMessage", "You need to create a shop to access this page.")}
                                        </p>
                                        <a
                                            href="/shop-create"
                                            className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200"
                                        >
                                            {t("myShop.createShop", "Create Your Shop")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
            <DashboardHeader />
            <div className="flex flex-col lg:flex-row w-full">
                {/* Sidebar - Always rendered, manages own visibility */}
                <DashboardSideBar />
                
                {/* Main Content */}
                <div className="flex-1 w-full">
                    <div className={`w-full min-h-screen ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
                        {/* Professional Header Section */}
                        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 px-4 sm:px-6 lg:px-8">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex flex-col lg:flex-row items-center justify-between">
                                    <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                                            <span className="text-3xl font-bold text-white">A</span>
                                        </div>
                                        <div>
                                            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
                                                {t("myShop.shopProfile", "Shop Profile")}
                                            </h1>
                                            <p className="text-blue-100 text-sm">
                                                {t("myShop.manageYourShop", "Manage and showcase your business")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold">{user?.shop?.name || t("myShop.myShop", "My Shop")}</div>
                                                <div className="text-blue-100 text-sm">{t("myShop.seller", "Seller")}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content - Full Width */}
                        <div className="w-full py-6 px-4 sm:px-6 lg:px-8">
                            <div className="max-w-7xl mx-auto">
                                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                                    {/* Shop Info Section - Sidebar */}
                                    <div className="xl:col-span-1">
                                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8 backdrop-blur-sm">
                                            <MyShopInfo />
                                        </div>
                                    </div>
                                    
                                    {/* Shop Profile Data Section - Main Content */}
                                    <div className="xl:col-span-3">
                                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm">
                                            <MyShopProfileData />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyShopProfile;
