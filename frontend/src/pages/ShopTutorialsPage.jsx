import React from "react";
import DashboardHeader from "../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../components/Shop/Layout/DashboardSideBar";
import TutorialsList from "../components/Shop/TutorialsList";

const ShopTutorialsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden 800px:block w-[80px] 800px:w-[330px]">
          <DashboardSideBar active={4} />
        </div>
        <div className="flex-1 w-full">
          <TutorialsList />
        </div>
      </div>
    </div>
  );
};

export default ShopTutorialsPage;

