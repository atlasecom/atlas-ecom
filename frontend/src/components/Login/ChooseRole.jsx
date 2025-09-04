import Header from "../Layout/Header";
import { useTranslation } from "react-i18next";
import { FiUser, FiShoppingBag } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function ChooseRole({action}) {
  const { t } = useTranslation();
  const sellerTo = action === 'login' ? '/shop-login' : '/shop-create';
  const customerTo = action === 'login' ? '/login' : '/sign-up';
  return (
    <>
      <Header />
      {/* Background Animation */}
      <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-100 py-10 px-4 sm:px-6">
        {/* Blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000 -z-10"></div>

        <div className="max-w-4xl mx-auto space-y-10">
          {/* Heading */}
          <div className="text-center">
            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f63b60] to-[#f89000] drop-shadow">
              {t("CompleteProfile.roleSelection.title")}
            </h2>
            <p className="mt-3 text-gray-600 text-base max-w-xl mx-auto">
              {t("CompleteProfile.roleSelection.subtitle")}
            </p>
          </div>

          {/* Options */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8">
            {/* Customer Card */}
            <Link to={customerTo} className="flex-1 group">
              <div className="border-2 rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-gray-200 hover:border-[#f89000]/70 p-6 sm:p-8">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-full bg-gray-100 text-[#f89000] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <FiUser />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                      {t("CompleteProfile.roleSelection.customer.title")}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {t("CompleteProfile.roleSelection.customer.description")}
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• {t("CompleteProfile.roleSelection.customer.features.browse")}</li>
                      <li>• {t("CompleteProfile.roleSelection.customer.features.track")}</li>
                      <li>• {t("CompleteProfile.roleSelection.customer.features.reviews")}</li>
                      <li>• {t("CompleteProfile.roleSelection.customer.features.wishlist")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Link>

            {/* Seller Card */}
            <Link to={sellerTo} className="flex-1 group">
              <div className="border-2 rounded-2xl bg-white/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 border-gray-200 hover:border-[#f63b60]/70 p-6 sm:p-8">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-full bg-gray-100 text-[#f63b60] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <FiShoppingBag />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                      {t("CompleteProfile.roleSelection.seller.title")}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {t("CompleteProfile.roleSelection.seller.description")}
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• {t("CompleteProfile.roleSelection.seller.features.list")}</li>
                      <li>• {t("CompleteProfile.roleSelection.seller.features.process")}</li>
                      <li>• {t("CompleteProfile.roleSelection.seller.features.analytics")}</li>
                      <li>• {t("CompleteProfile.roleSelection.seller.features.communications")}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
