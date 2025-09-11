import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { productData } from '../../static/data'
import styles from "../../styles/styles";
import ProductCard from "../Route/ProductCard/ProductCardNew";
import { useTranslation } from "react-i18next";




const SuggestedProduct = ({ data }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const [products, setProducts] = useState([])
    const { allProducts } = useSelector((state) => state.products);
    const [productData, setProductData] = useState();
    
    // Debug logging
    console.log("SuggestedProduct - Current language:", i18n.language);
    console.log("SuggestedProduct - Translation result:", t('product.relatedProducts'));

    // Product is filter when the category is same as the current product when page is loaded
    useEffect(() => {
        const d = allProducts && allProducts.filter((i) => i.category === data.category)
        setProductData(d)
    }, [])

    return (
        <div className={isRTL ? 'rtl' : 'ltr'}>
            {
                data ? (
                    <div
                        className={`p-4 ${styles.section}`}>
                        <h2
                            className={`${styles.heading} text-[25px] font-[500] border-b mb-5`}
                        >
                            {t('product.relatedProducts')}
                        </h2>
                        <div className="grid grid-cols-2 gap-[20px] md:grid-cols-2 md:gap-[25px] lg:grid-cols-4 lg:gap-[25px] xl:grid-cols-5 xl:gap-[30px] mb-12">
                            {
                                productData && productData.map((i, index) => (
                                    <ProductCard data={i} key={index} />
                                ))
                            }
                        </div>
                    </div>
                ) : null
            }
        </div>
    )
}

export default SuggestedProduct