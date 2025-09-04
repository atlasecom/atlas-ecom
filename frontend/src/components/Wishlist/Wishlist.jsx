import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RxCross1 } from "react-icons/rx";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeFromWishlist } from "../../redux/actions/wishlist";
import { backend_url } from "../../server";
import { useTranslation } from "react-i18next";

const Wishlist = ({ setOpenWishlist }) => {
  const { t } = useTranslation();
  const { wishlist } = useSelector((state) => state.wishlist);
  const dispatch = useDispatch();

  const removeFromWishlistHandler = (data) => {
    dispatch(removeFromWishlist(data));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-full bg-black/50 backdrop-blur-sm h-screen"
        style={{ zIndex: 99999 }}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-0 right-0 h-full w-[95%] sm:w-[85%] md:w-[70%] lg:w-[50%] xl:w-[40%] 2xl:w-[30%] overflow-y-auto bg-white flex flex-col shadow-2xl"
          style={{ zIndex: 99999 }}
        >
          {wishlist && wishlist.length === 0 ? (
            <div className="w-full h-screen flex flex-col items-center justify-center relative bg-gradient-to-br from-gray-50 to-white">
              <div className="absolute top-6 right-6 z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all duration-300"
                  onClick={() => setOpenWishlist(false)}
                >
                  <RxCross1 size={20} className="text-gray-600 hover:text-gray-800" />
                </motion.button>
              </div>
              
              <div className="text-center space-y-4 px-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                  <AiOutlineHeart size={32} className="sm:w-10 sm:h-10 text-orange-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{t("wishlist.empty", "Your wishlist is empty!")}</h3>
                <p className="text-sm sm:text-base text-gray-500 max-w-xs mx-auto">Start adding products you love to your favorites list</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1">
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-10">
                  <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <AiFillHeart size={20} className="sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Favorites</h2>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {wishlist && wishlist.length} {wishlist && wishlist.length === 1 ? t("common.item", "item") : t("common.items", "items")}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                      onClick={() => setOpenWishlist(false)}
                    >
                      <RxCross1 size={18} className="sm:w-5 sm:h-5 text-gray-600" />
                    </motion.button>
                  </div>
                </div>

                {/* Wishlist Items */}
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  {wishlist &&
                    wishlist.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CartSingle
                          data={item}
                          removeFromWishlistHandler={removeFromWishlistHandler}
                        />
                      </motion.div>
                    ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CartSingle = ({ data, removeFromWishlistHandler }) => {
  const { t, i18n } = useTranslation();
  const [value, setValue] = useState(1);
  const totalPrice = data.discountPrice * value;

  const formatCurrency = (amount) => {
    const currency = t("common.currency", "DH");
    return `${amount} ${currency}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Product Image */}
        <div className="relative flex-shrink-0">
          <img
            src={(() => {
              const image = data?.images?.[0];
              if (!image) return "/default-product.png";
              
              let imageUrl;
              if (typeof image === "string") {
                imageUrl = image;
              } else if (image && image.url) {
                imageUrl = image.url;
              } else {
                return "/default-product.png";
              }

              // Handle relative URLs by adding backend URL
              if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                imageUrl = `/${imageUrl}`;
              }
              
              if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
                imageUrl = `${backend_url.replace(/\/$/, "")}${imageUrl}`;
              }

              return imageUrl || "/default-product.png";
            })()}
            alt={data.name}
            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-lg sm:rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300"
            onError={(e) => {
              e.target.src = "/default-product.png";
              e.target.onerror = null;
            }}
          />
          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
              onClick={() => removeFromWishlistHandler(data)}
              title={t("wishlist.remove", "Remove from favorites")}
            >
              <RxCross1 size={14} className="sm:w-4 sm:h-4 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link to={`/product/${data._id}`} className="block group">
            <h3 className="font-semibold text-gray-800 text-base sm:text-lg leading-tight group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
              {data.name}
            </h3>
          </Link>
          
          {/* Price */}
          <div className="mt-2 sm:mt-3 flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
              {formatCurrency(totalPrice)}
            </span>
            {data.originalPrice > data.discountPrice && (
              <span className="text-sm sm:text-base md:text-lg text-gray-400 line-through">
                {formatCurrency(data.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {data.stock < 10 && data.stock > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 sm:gap-2 bg-orange-50 text-orange-700 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full border border-orange-200">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse"></div>
              Only {data.stock} left
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Wishlist;
