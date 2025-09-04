import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import AllEvents from "../../components/Shop/AllEvents";

const ShopDashboardEventsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            <div className="flex flex-col lg:flex-row w-full">
                {/* Sidebar - Always rendered, manages own visibility */}
                <DashboardSideBar />
                
                {/* Main Content */}
                <div className="flex-1 w-full">
                    <AllEvents />
                </div>
            </div>
        </div>
    );
};

export default ShopDashboardEventsPage;
