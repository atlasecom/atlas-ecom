import React from "react";
import DashboardHeader from "../../components/Shop/Layout/DashboardHeader";
import DashboardSideBar from "../../components/Shop/Layout/DashboardSideBar";
import CreateEvent from "../../components/Shop/CreateEvent";

const ShopDashboardCreateEventPage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader />
            <div className="flex flex-col lg:flex-row w-full">
                {/* Sidebar - Always rendered, manages own visibility */}
                <DashboardSideBar />
                
                {/* Main Content */}
                <div className="flex-1 w-full">
                    <CreateEvent />
                </div>
            </div>
        </div>
    );
};

export default ShopDashboardCreateEventPage;
