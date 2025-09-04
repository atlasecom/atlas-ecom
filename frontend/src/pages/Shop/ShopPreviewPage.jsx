import React, { useEffect } from "react";
import styles from "../../styles/styles";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../../components/Layout/Header";
import Footer from "../../components/Layout/Footer";

const ShopPreviewPage = () => {
  const { user } = useSelector((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.shop?._id === id) {
      navigate("/shop/me");
    }
  }, [id, user, navigate]);

  if (user?.shop?._id === id) {
    return null; // prevent rendering before redirect
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className={`${styles.section} py-10`}>
        <div className="w-full 800px:flex justify-between">
          <div className="800px:w-[25%] bg-[#fff] rounded-[4px] shadow-sm 800px:overflow-y-scroll 800px:h-[90vh] 800px:sticky top-10 left-0 z-10">
            <ShopInfo isOwner={false} />
          </div>
          <div className="800px:w-[72%] mt-5 800px:mt-['unset'] rounded-[4px]">
            <ShopProfileData isOwner={false} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ShopPreviewPage;
