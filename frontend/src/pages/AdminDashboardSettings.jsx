import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminSettings from "../components/Admin/AdminSettings";

const AdminDashboardSettings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex h-screen">
        <AdminSideBar />
        <div className="flex-1 overflow-y-auto">
          <AdminSettings />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSettings;
