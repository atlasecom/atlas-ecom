import React from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import Lottie from "react-lottie";
import animationData from "../Assests/animations/107043-success.json";
import { useTranslation } from "react-i18next";

const OrderSuccessPage = () => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    
    return (
        <div className={isRTL ? 'rtl' : 'ltr'}>
            <Header />
            <Success />
            <Footer />
        </div>
    );
};

const Success = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };
    
    return (
        <div className="flex flex-col items-center justify-center py-10">
            <Lottie options={defaultOptions} width={300} height={300} />
            <h5 className={`text-center mb-14 text-[25px] text-[#000000a1] ${isRTL ? 'font-arabic' : ''}`}>
                {t('orderSuccess.message')}
            </h5>
            <br />
            <br />
        </div>
    );
};

export default OrderSuccessPage;