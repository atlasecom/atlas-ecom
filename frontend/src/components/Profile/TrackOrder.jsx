import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getAllOrdersOfUser } from "../../redux/actions/order";
import { useTranslation } from "react-i18next";

const TrackOrder = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const { orders } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const { id } = useParams();

    useEffect(() => {
        dispatch(getAllOrdersOfUser(user._id));
    }, [dispatch]);

    const data = orders && orders.find((item) => item._id === id);

    return (
        <div className={`w-full h-[80vh] flex justify-center items-center ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {" "}
            <>
                {data && data?.status === "Processing" ? (
                    <h1 className={`text-[20px] ${isRTL ? 'text-right' : 'text-left'}`}>{t('trackOrder.processing')}</h1>
                ) : data?.status === "Transferred to delivery partner" ? (
                    <h1 className={`text-[20px] ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('trackOrder.transferredToDelivery')}
                    </h1>
                ) : data?.status === "Shipping" ? (
                    <h1 className={`text-[20px] ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('trackOrder.shipping')}
                    </h1>
                ) : data?.status === "Received" ? (
                    <h1 className={`text-[20px] ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('trackOrder.received')}
                    </h1>
                ) : data?.status === "On the way" ? (
                    <h1 className={`text-[20px] ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('trackOrder.onTheWay')}
                    </h1>
                ) : data?.status === "Delivered" ? (
                    <h1 className={`text-[20px] ${isRTL ? 'text-right' : 'text-left'}`}>{t('trackOrder.delivered')}</h1>
                ) : data?.status === "Processing refund" ? (
                    <h1 className={`text-[20px] ${isRTL ? 'text-right' : 'text-left'}`}>{t('trackOrder.processingRefund')}</h1>
                ) : data?.status === "Refund Success" ? (
                    <h1 className={`text-[20px] ${isRTL ? 'text-right' : 'text-left'}`}>{t('trackOrder.refundSuccess')}</h1>
                ) : null}
            </>

        </div>
    )
}

export default TrackOrder