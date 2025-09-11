import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../styles/styles";
import ProductCard from "../ProductCard/ProductCardNew";
import axios from "axios";
import { server } from "../../../server";

const BestDeals = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // Fetch all products from server and get best deals
  const fetchBestDeals = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${server}/products/`);
      if (response.data.success) {
        const allProducts = response.data.products || [];
        // Sort by sold_out in descending order and get top 5
        const sortedData = allProducts.sort((a, b) => b.sold_out - a.sold_out);
        const firstFive = sortedData.slice(0, 5);
        setData(firstFive);
      }
    } catch (error) {
      console.error('Error fetching best deals:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBestDeals();
  }, []);

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 py-6 sm:py-8 xl:py-10 2xl:py-12">
      <div className="w-full px-0">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {t('bestDeals.title', 'Best Deals')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
{t('bestDeals.subtitle', 'Don\'t miss out on these amazing deals and limited-time offers')}
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          {isLoading ? (
            <div className="col-span-full text-center py-8 xl:py-10 2xl:py-12">
              <div className="inline-flex items-center gap-2 xl:gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 xl:h-6 xl:w-6 2xl:h-7 2xl:w-7 border-b-2 border-orange-600"></div>
                <p className="text-sm xl:text-base 2xl:text-lg font-medium">{t('bestDeals.loading', 'Loading best deals...')}</p>
              </div>
            </div>
          ) : data && data.length > 0 ? (
            data.map((i, index) => <ProductCard data={i} key={index} />)
          ) : (
            <div className="col-span-full text-center py-8 xl:py-10 2xl:py-12">
              <div className="max-w-sm xl:max-w-md 2xl:max-w-lg mx-auto">
                <div className="text-gray-400 mb-3 xl:mb-4 2xl:mb-5">
                  <svg className="w-12 h-12 xl:w-16 xl:h-16 2xl:w-20 2xl:h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 mb-2 xl:mb-3">
                  {t('bestDeals.noDeals', 'No deals available')}
                </h3>
                <p className="text-sm xl:text-base 2xl:text-lg text-gray-600">
{t('bestDeals.checkBackSoon', 'Check back soon for amazing deals!')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestDeals;
