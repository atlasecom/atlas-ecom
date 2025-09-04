import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import DashboardHeader from "./Layout/DashboardHeader";
import MyShopInfo from "./MyShopInfo";
import MyShopProfileData from "./MyShopProfileData";

const MyShopProfile = () => {
    const { user } = useSelector((state) => state.user);
    const { t, i18n } = useTranslation();

    // Show loading if user data is not available
    if (!user || !user.shop) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-xl text-gray-600 font-medium">{t("shop.loadingShop", "Loading your shop...")}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen ${i18n.language === 'ar' ? 'rtl' : 'ltr'}`}>
            {/* Dashboard Header */}
            <DashboardHeader />
            
            {/* Main Content - Full Width */}
            <div className="w-full py-6 px-0">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
                    {/* Shop Info Section - Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
                            <MyShopInfo />
                        </div>
                    </div>
                    
                    {/* Shop Profile Data Section - Main Content */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <MyShopProfileData />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default MyShopProfile;
