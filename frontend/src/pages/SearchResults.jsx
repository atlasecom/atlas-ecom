import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { server } from "../server";
import { useTranslation } from "react-i18next";
import { getAuthToken } from "../utils/auth";

const SearchResults = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Get search term from query string
  const params = new URLSearchParams(location.search);
  const term = params.get("item");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const { data } = await axios.get(
          `${server}/product/search?term=${encodeURIComponent(term)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProducts(data.products || []);
      } catch (error) {
        setProducts([]);
      }
      setLoading(false);
    };
    if (term) fetchProducts();
  }, [term]);

  if (loading) return <div className="text-center p-4">{t('searchResults.loading')}</div>;

  return (
    <div className={`p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <h2 className={`text-xl font-bold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        {t('searchResults.title')} "{term}"
      </h2>
      {products.length === 0 ? (
        <div className={`text-center ${isRTL ? 'font-arabic' : ''}`}>
          {t('searchResults.noProducts')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(products || []).map((product) => (
            <div key={product._id} className="border rounded p-2">
              <img
                src={product.image_Url?.[0]?.url || "/placeholder.png"}
                alt={product.name}
                className="w-full h-40 object-cover mb-2"
              />
              <h3 className={`font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
                {product.name}
              </h3>
              <p className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                {product.description}
              </p>
              <div className={`mt-2 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                DH{product.price}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;