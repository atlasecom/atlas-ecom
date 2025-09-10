import React, { useEffect, useState } from "react";
import {
  AiFillHeart,
  AiOutlineHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { FaWhatsapp, FaTelegram } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { backend_url, server } from "../../../server";
import styles from "../../../styles/styles";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addTocart } from "../../../redux/actions/cart";
import {
  addToWishlist,
  removeFromWishlist,
} from "../../../redux/actions/wishlist";
import axios from "axios";

const ProductDetailsCard = ({ setOpen, data }) => {
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useDispatch();
  // const [count, setCount] = useState(1) // Commented out since no quantity control
  const [click, setClick] = useState(false);
  const [select, setSelect] = useState(false);

  const handleWhatsAppClick = () => {
    if (data.shop.phoneNumber) {
      window.open(
        `https://wa.me/${data.shop.phoneNumber}?text=${encodeURIComponent(
          `${data.name}: ${t(
            "productCard.whatsAppMessage",
            "Hello, I'm interested in your product"
          )}`
        )}`,
        "_blank"
      );
    } else {
      window.alert(
        t(
          "productCard.noPhoneNumber",
          "Seller has not provided a phone number for WhatsApp."
        )
      );
    }
  };

  const handleTelegramClick = async () => {
    try {
      const response = await axios.get(
        `${server}/shops/${data.shop._id}`
      );
      const telegram = response.data.shop.telegram;
      if (telegram) {
        window.open(`https://t.me/${telegram}`, "_blank");
      } else {
        window.alert(
          t(
            "productCard.noTelegramInfo",
            "Seller has not provided a Telegram username or group."
          )
        );
      }
    } catch (error) {
      console.error("Error fetching seller info:", error);
      window.alert(
        t("productCard.fetchSellerError", "Failed to fetch seller info.")
      );
    }
  };

  // Commented out quantity control functions
  /* const decrementCount = () => {
        if (count > 1) {
            setCount(count - 1)
        }
    }
    const incrementCount = () => {
        setCount(count + 1)
    } */

  // Add to cart
  const addToCartHandler = (id) => {
    const isItemExists = cart && cart.find((i) => i._id === id);

    if (isItemExists) {
      toast.error(t("productCard.itemInCart", "item already in cart!"));
    } else {
      if (data.stock < 1) {
        // Changed from count to 1
        toast.error(t("productCard.stockLimited", "Product stock limited!"));
      } else {
        const cartData = { ...data, qty: 1 }; // Changed from count to 1
        dispatch(addTocart(cartData));
        toast.success(
          t("productCard.addedToCart", "Item added to cart Successfully!")
        );
      }
    }
  };

  useEffect(() => {
    if (wishlist && wishlist.find((i) => i._id === data._id)) {
      setClick(true);
    } else {
      setClick(false);
    }
  }, [wishlist]);

  // Remove from wish list
  const removeFromWishlistHandler = (data) => {
    setClick(!click);
    dispatch(removeFromWishlist(data));
  };

  // add to wish list
  const addToWishlistHandler = (data) => {
    setClick(!click);
    dispatch(addToWishlist(data));
  };

  return (
    <>
      {data && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
          style={{ zIndex: 99999 }}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="w-full max-w-4xl max-h-[95vh] bg-white rounded-xl sm:rounded-2xl shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            {/* Close button */}
            <button
              className={`absolute top-3 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 sm:top-4 ${
                isRTL ? "left-3 sm:left-4" : "right-3 sm:right-4"
              }`}
              onClick={() => setOpen(false)}
              aria-label="Close modal"
            >
              <RxCross1 size={20} className="text-gray-600" />
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[95vh] p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                {/* Image section */}
                <div className="w-full lg:w-1/2">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-50 mb-4">
                    <img
                      src={(() => {
                        if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
                          const imageObj = data.images[0];
                          // Handle different image formats with cache busting
                          if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                            const imageUrl = imageObj.url;
                            // Don't add cache busting to data URIs
                            if (imageUrl.startsWith('data:')) {
                              return imageUrl;
                            }
                            // Force HTTPS for production URLs
                            const httpsUrl = imageUrl.replace('http://', 'https://');
                            return httpsUrl + '?v=' + Date.now();
                          }
                          if (typeof imageObj === 'string') {
                            // Don't add cache busting to data URIs
                            if (imageObj.startsWith('data:')) {
                              return imageObj;
                            }
                            // Force HTTPS for production URLs
                            const httpsUrl = imageObj.replace('http://', 'https://');
                            return httpsUrl + '?v=' + Date.now();
                          }
                        }
                        return "/placeholder-image.jpg";
                      })()}
                      alt={data.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error for product:', data.name, 'URL:', e.target.src);
                        // Try alternative loading methods
                        const imageObj = data?.images?.[0];
                        if (imageObj && typeof imageObj === 'object' && imageObj.url) {
                          // Try without cache busting
                          e.target.src = imageObj.url;
                        } else {
                          e.target.src = "/placeholder-image.jpg";
                        }
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully for product:', data.name);
                      }}
                    />
                  </div>

                  {/* Shop info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <Link
                      to={`/shop/preview/${data.shop._id}`}
                      className="flex items-center hover:opacity-80 transition-opacity"
                    >
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800 mb-1">
                          {data.shop.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t("productCard.viewShop", "View Shop")}
                        </p>
                      </div>
                    </Link>

                    {/* Chat buttons */}
                    <div className="flex gap-2 mt-4">
                      {data.shop.phoneNumber && (
                        <button
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                          onClick={handleWhatsAppClick}
                          aria-label={t(
                            "productCard.chatWhatsApp",
                            "Chat on WhatsApp"
                          )}
                        >
                          <FaWhatsapp size={18} />
                          <span className="hidden sm:inline text-xs">
                            {t("productCard.chatWhatsApp", "WhatsApp")}
                          </span>
                        </button>
                      )}
                      <button
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        onClick={handleTelegramClick}
                        aria-label={t(
                          "productCard.chatTelegram",
                          "Chat on Telegram"
                        )}
                      >
                        <FaTelegram size={18} />
                        <span className="hidden sm:inline text-xs">
                          {t("productCard.chatTelegram", "Telegram")}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product details section */}
                <div className="w-full lg:w-1/2">
                  <h1
                    className={`text-2xl sm:text-3xl font-bold text-gray-900 mb-3 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {data.name}
                  </h1>

                  <p
                    className={`text-gray-600 mb-6 leading-relaxed ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {data.description}
                  </p>

                  {/* Price section */}
                  <div
                    className={`flex items-center gap-3 mb-8 ${
                      isRTL ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <h4 className="text-2xl sm:text-3xl font-bold text-orange-600">
                      {data.originalPrice} - {data.discountPrice} DH
                    </h4>
                  </div>

                  {/* Quantity and wishlist section */}
                  <div
                    className={`flex items-center justify-between mb-8 ${
                      isRTL ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* Quantity controls - Commented out */}
                    {/* <div className="flex items-center bg-gray-100 rounded-lg overflow-hidden">
                                            <button
                                                className='px-4 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200'
                                                onClick={decrementCount}
                                            >
                                                -
                                            </button>
                                            <span className='px-6 py-3 bg-white font-medium text-gray-800'>
                                                {count}
                                            </span>
                                            <button
                                                className='px-4 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200'
                                                onClick={incrementCount}
                                            >
                                                +
                                            </button>
                                        </div> */}

                    <button
                      onClick={() =>
                        click
                          ? removeFromWishlistHandler(data)
                          : addToWishlistHandler(data)
                      }
                      className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
                      aria-label={
                        click
                          ? t(
                              "productCard.removeFromWishlist",
                              "Remove from wishlist"
                            )
                          : t("productCard.addToWishlist", "Add to wishlist")
                      }
                    >
                      {click ? (
                        <AiFillHeart size={24} color="#ef4444" />
                      ) : (
                        <AiOutlineHeart size={24} color="#6b7280" />
                      )}
                    </button>
                  </div>

                  {/* Add to cart button */}
                  {/* <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-lg"
                    onClick={() => addToCartHandler(data._id)}
                  >
                    {t("productCard.addToCart", "Add to cart")}{" "}
                    <AiOutlineShoppingCart size={20} />
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductDetailsCard;
