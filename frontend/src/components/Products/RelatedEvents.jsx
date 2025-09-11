import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import styles from "../../styles/styles";
import EventCard from "../Events/EventCard";
import ProductCardNew from "../Route/ProductCard/ProductCardNew";
import { useTranslation } from "react-i18next";

const RelatedEvents = ({ data, isEvent = false }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [relatedData, setRelatedData] = useState([]);
    const { allEvents } = useSelector((state) => state.events);
    const { allProducts } = useSelector((state) => state.products);
    
    // Debug logging
    console.log("RelatedEvents - Current language:", i18n.language);
    console.log("RelatedEvents - Translation result:", t('product.relatedProducts', 'Related Products'));
    console.log("RelatedEvents - Translation result:", t('product.relatedEvents', 'Related Events'));

    // Filter related items by the same category as the current item
    useEffect(() => {
        if (data) {
            if (isEvent && allEvents) {
                // For events, show related events
                const relatedEvents = allEvents.filter((event) => 
                    event.category === data.category && event._id !== data._id
                );
                setRelatedData(relatedEvents.slice(0, 4));
            } else if (!isEvent && allProducts) {
                // For products, show related products
                const relatedProducts = allProducts.filter((product) => 
                    product.category === data.category && product._id !== data._id
                );
                setRelatedData(relatedProducts.slice(0, 4));
            }
        }
    }, [data, allEvents, allProducts, isEvent]);

    return (
        <div className={isRTL ? 'rtl' : 'ltr'}>
            {data && relatedData.length > 0 && (
                <div className={`p-4 ${styles.section}`}>
                    <h2 className={`${styles.heading} text-[25px] font-[500] border-b mb-5`}>
                        {isEvent 
                            ? t('product.relatedEvents', 'Related Events')
                            : t('product.relatedProducts', 'Related Products')
                        }
                    </h2>
                    <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-4 xl:gap-[30px] mb-12">
                        {relatedData.map((item, index) => (
                            isEvent ? (
                                <EventCard data={item} key={index} />
                            ) : (
                                <ProductCardNew data={item} key={index} />
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RelatedEvents;
