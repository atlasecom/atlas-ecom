import React, { useState } from "react";
import { RxCross1 } from "react-icons/rx";
import styles from "../../styles/styles";
import { Link } from "react-router-dom";
import { IoBagHandleOutline } from "react-icons/io5";
import { HiOutlineMinus, HiPlus } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { backend_url } from "../../server";
import { addTocart, removeFromCart } from "../../redux/actions/cart";
import { useTranslation } from "react-i18next";

const Cart = ({ setOpenCart }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  //remove from cart
  const removeFromCartHandler = (data) => {
    dispatch(removeFromCart(data));
  };

  // Total price
  const totalPrice = cart.reduce(
    (acc, item) => acc + item.qty * item.discountPrice,
    0
  );

  const quantityChangeHandler = (data) => {
    dispatch(addTocart(data));
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-[#0000004b] h-screen" style={{ zIndex: 99999 }}>
      <div className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-full sm:w-[90%] md:w-[60%] lg:w-[40%] xl:w-[25%] bg-white flex flex-col overflow-y-scroll justify-between shadow-sm ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'} style={{ zIndex: 99999 }}>
        {cart && cart.length === 0 ? (
          <div className="w-full h-screen flex items-center justify-center">
            <div className={`flex w-full ${isRTL ? 'justify-start' : 'justify-end'} pt-5 ${isRTL ? 'pl-5' : 'pr-5'} fixed top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
              <RxCross1
                size={25}
                className="cursor-pointer"
                onClick={() => setOpenCart(false)}
              />
            </div>
            <h5>{t('cart.empty')}</h5>
          </div>
        ) : (
          <>
            <div>
              <div className={`flex w-full ${isRTL ? 'justify-start' : 'justify-end'} pt-5 ${isRTL ? 'pl-5' : 'pr-5'}`}>
                <RxCross1
                  size={25}
                  className="cursor-pointer"
                  onClick={() => setOpenCart(false)}
                />
              </div>
              {/* item length */}
              <div className={`${styles.noramlFlex} p-3 sm:p-4`}>
                <IoBagHandleOutline size={20} className="sm:w-6 sm:h-6" />
                <h5 className={`${isRTL ? 'pr-2' : 'pl-2'} text-lg sm:text-xl font-medium`}>
                  {cart && cart.length} {t('cart.items')}
                </h5>
              </div>

              {/* Cart Single item */}
              <br />
              <div className="w-full border-t">
                {cart &&
                  cart.map((i, index) => {
                    return (
                      <CartSingle
                        data={i}
                        key={index}
                        quantityChangeHandler={quantityChangeHandler}
                        removeFromCartHandler={removeFromCartHandler}
                      />
                    );
                  })}
              </div>
            </div>
            
            {/* Cart bottom section with total and checkout */}
            <div className={`px-3 sm:px-5 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
              <Link to="/checkout">
                <div className={`h-12 sm:h-[45px] flex items-center justify-center w-full bg-[#e44343] rounded-md hover:bg-[#d63384] transition-colors duration-200`}>
                  <h1 className="text-white text-base sm:text-lg font-semibold">
                    {t('cart.checkoutNow')} ({t('cart.currency')}{totalPrice})
                  </h1>
                </div>
              </Link>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

const CartSingle = ({ data, quantityChangeHandler, removeFromCartHandler }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  // const [value, setValue] = useState(data.qty); // Commented out since no quantity control
  // const totalPrice = data.discountPrice * value; // Commented out since no quantity control

  // Commented out increment and decrement functions
  /* const increment = (data) => {
    if (data.stock < value) {
      toast.error(t('cart.stockLimited'));
    } else {
      setValue(value + 1);
      const updateCartData = { ...data, qty: value + 1 };
      quantityChangeHandler(updateCartData);
    }
  };

  const decrement = (data) => {
    setValue(value === 1 ? 1 : value - 1);
    const updateCartData = { ...data, qty: value === 1 ? 1 : value - 1 };
    quantityChangeHandler(updateCartData);
  }; */

  return (
    <div className="border-b p-3 sm:p-4">
      <div className={`w-full flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Quantity controls - Commented out */}
        {/* <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-1.5 sm:gap-2 shrink-0`}>
          <div
            className={`bg-[#e44343] border border-[#e4434373] rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center cursor-pointer hover:bg-[#d63384] transition-colors duration-200`}
            onClick={() => increment(data)}
          >
            <HiPlus size={14} className="sm:w-4 sm:h-4" color="#fff" />
          </div>
          <span className={`text-center min-w-[20px] sm:min-w-[24px] font-medium text-sm sm:text-base`}>{data.qty}</span>
          <div
            className={`bg-[#a7abb14f] rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center cursor-pointer hover:bg-[#9ca3af3f] transition-colors duration-200`}
            onClick={() => decrement(data)}
          >
            <HiOutlineMinus size={14} className="sm:w-4 sm:h-4" color="#7d879c" />
          </div>
        </div> */}

        {/* Product image - Mobile optimized */}
        <div className="shrink-0">
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

              // Force HTTPS for production URLs
              if (imageUrl && imageUrl.startsWith('http://')) {
                imageUrl = imageUrl.replace('http://', 'https://');
              }

              // Handle relative URLs by adding backend URL
              if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                imageUrl = `/${imageUrl}`;
              }
              
              if (imageUrl && imageUrl.startsWith('/') && !imageUrl.startsWith('//')) {
                const baseUrl = backend_url.replace(/\/$/, "").replace('http://', 'https://');
                imageUrl = `${baseUrl}${imageUrl}`;
              }

              return imageUrl || "/default-product.png";
            })()}
            className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-cover rounded-md`}
            alt={t('cart.productImageAlt')}
            onError={(e) => {
              e.target.src = "/default-product.png";
              e.target.onerror = null;
            }}
          />
        </div>

        {/* Product details - Mobile optimized */}
        <div className={`flex-1 min-w-0 ${isRTL ? 'pr-2' : 'pl-2'}`}>
          <h1 className={`${isRTL ? 'text-right' : 'text-left'} font-semibold text-sm sm:text-base leading-tight line-clamp-2`}>
            {data.name}
          </h1>
          <h4 className={`font-normal text-xs sm:text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'} mt-1`}>
            {t('cart.currency')}{data.discountPrice} {/* × {value} */}
          </h4>
          <h4 className={`font-semibold text-sm sm:text-base text-[#d02222] ${isRTL ? 'text-right' : 'text-left'} mt-1`}>
            {t('cart.currency')}{data.discountPrice} {/* Changed from totalPrice to discountPrice */}
          </h4>
        </div>

        {/* Remove button - Mobile optimized */}
        <div className="shrink-0">
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            onClick={() => removeFromCartHandler(data)}
            aria-label={t('cart.removeItem', 'Remove item')}
          >
            <RxCross1
              size={18}
              className="sm:w-5 sm:h-5"
              color="#7d879c"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
