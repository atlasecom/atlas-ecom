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
                    size={16}
                    color="#f6b100"
                    className="star-icon flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4"
                    style={{ marginRight: isRTL ? '0' : '2px', marginLeft: isRTL ? '2px' : '0' }}
                />
            );
        } else if (i === Math.ceil(actualRating) && !Number.isInteger(actualRating) && actualRating > 0) {
            stars.push(
                <BsStarHalf
                    key={i}
                    size={14}
                    color="#f6ba00"
                    className="star-icon flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4"
                    style={{ marginRight: isRTL ? '0' : '2px', marginLeft: isRTL ? '2px' : '0' }}
                />
            );
        } else {
            stars.push(
                <AiOutlineStar
                    key={i}
                    size={16}
                    color="#f6ba00"
                    className="star-icon flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4"
                    style={{ marginRight: isRTL ? '0' : '2px', marginLeft: isRTL ? '2px' : '0' }}
                />
            );
        }
    }

    return <div className={`star-rating inline-flex items-center gap-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}> {stars}</div>;

}

export default Ratings