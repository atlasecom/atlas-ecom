import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import CreateEvent from "../../components/Shop/CreateEvent";
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar';

const ShopCreateEvents = () => {
    return (
        <div>
            <DashboardHeader />
            <div className="flex items-start w-full">
                <div className="w-[80px] 800px:w-[330px]">
                    <DashboardSideBar />
                </div>
                <div className="flex-1">
                    <CreateEvent />
                </div>
            </div>
        </div>
    )
}

export default ShopCreateEvents