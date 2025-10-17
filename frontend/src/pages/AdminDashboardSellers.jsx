import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllSellers from "../components/Admin/AllSellers";

const AdminDashboardSellers = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex h-screen">
        <AdminSideBar />
        <div className="flex-1 overflow-y-auto">
          <AllSellers />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSellers;
