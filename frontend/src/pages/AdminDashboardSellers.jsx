import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllSellers from "../components/Admin/AllSellers";

const AdminDashboardSellers = () => {
  return (
    <div className="w-full">
      <AdminHeader />
      <div className="w-full flex flex-col lg:flex-row">
        <AdminSideBar />
        <div className="flex-1 w-full">
          <AllSellers />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSellers;
