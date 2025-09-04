import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import ShopInfo from "../../components/Shop/ShopInfo";
import ShopProfileData from "../../components/Shop/ShopProfileData";

const ShopHomePage = () => {
  return (
    <div>
      <DashboardHeader />
      <div className="flex items-start w-full">
        <div className="w-[80px] 800px:w-[330px]">
          <DashboardSideBar />
        </div>
        <div className="flex-1 bg-[#f5f5f5] p-6">
          <div className="w-full 800px:flex py-10 justify-between">
            <div className="800px:w-[25%] bg-[#fff] rounded-[4px] shadow-sm 800px:overflow-y-scroll 800px:h-[90vh] 800px:sticky top-10 left-0 z-10">
              <ShopInfo isOwner={true} />
            </div>
            <div className="800px:w-[72%] mt-5 800px:mt-['unset'] rounded-[4px]">
              <ShopProfileData isOwner={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopHomePage;
