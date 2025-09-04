import React from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsStarHalf } from "react-icons/bs";
import { useTranslation } from "react-i18next";


const Ratings = ({ rating }) => {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const stars = [];

    // Handle case when rating is 0 or undefined (no reviews)
    const actualRating = rating || 0;

    for (let i = 1; i <= 5; i++) {
        if (i <= actualRating && actualRating > 0) {
            stars.push(
                <AiFillStar
                    key={i}
                    size={20}
                    color="#f6b100"
                    className={`${isRTL ? 'ml-2' : 'mr-2'} cursor-pointer`}
                />
            );
        } else if (i === Math.ceil(actualRating) && !Number.isInteger(actualRating) && actualRating > 0) {
            stars.push(
                <BsStarHalf
                    key={i}
                    size={17}
                    color="#f6ba00"
                    className={`${isRTL ? 'ml-2' : 'mr-2'} cursor-pointer`}
                />
            );
        } else {
            stars.push(
                <AiOutlineStar
                    key={i}
                    size={20}
                    color="#f6ba00"
                    className={`${isRTL ? 'ml-2' : 'mr-2'} cursor-pointer`}
                />
            );
        }
    }

    return <div className={`flex ${isRTL ? 'flex-row-reverse' : ''}`}> {stars}</div>;

}

export default Ratings