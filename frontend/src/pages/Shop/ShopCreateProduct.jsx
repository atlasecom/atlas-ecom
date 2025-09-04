import React from 'react'
import DashboardHeader from '../../components/Shop/Layout/DashboardHeader'
import DashboardSideBar from '../../components/Shop/Layout/DashboardSideBar'
import CreateProduct from "../../components/Shop/CreateProduct";

const ShopCreateProduct = () => {
    return (
        <div>
            <DashboardHeader />
            <div className="flex items-start w-full">
                <div className="w-[80px] 800px:w-[330px]">
                    <DashboardSideBar />
                </div>
                <div className="flex-1">
                    <CreateProduct />
                </div>
            </div>
        </div>
    )
}

export default ShopCreateProduct