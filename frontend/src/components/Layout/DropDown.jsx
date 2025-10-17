import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "../../styles/styles";

const DropDown = ({ categories, setDropDown, loading }) => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    
    const submitHandle = (category) => {
        navigate(`/products?category=${category._id}`);
        setDropDown(false);
        window.location.reload();
    };
    
    return (
        <div className="pb-4 w-[270px] bg-[#fff] absolute z-30 rounded-b-md shadow-sm">
            {loading ? (
                <div className="flex items-center justify-center px-4 py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-sm text-gray-600">Loading...</span>
                </div>
            ) : (
                categories &&
                categories.map((category, index) => (
                    <div
                        key={category._id || index}
                        className={`${styles.noramlFlex}`}
                        onClick={() => submitHandle(category)}
                    >
                        <img
                            src={category.image?.url || '/default-product.png'}
                            style={{
                                width: "25px",
                                height: "25px",
                                objectFit: "contain",
                                marginLeft: "10px",
                                userSelect: "none",
                            }}
                            alt="Drop Down img"
                        />
                        <h3 className="m-3 cursor-pointer select-none">
                            {i18n.language === 'ar' ? category.nameAr : 
                             i18n.language === 'fr' ? category.nameFr : 
                             category.name}
                        </h3>
                    </div>
                ))
            )}
        </div>
    );
};

export default DropDown;