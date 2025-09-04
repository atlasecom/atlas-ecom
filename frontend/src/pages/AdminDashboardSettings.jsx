import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AdminSettings from "../components/Admin/AdminSettings";

const AdminDashboardSettings = () => {
  return (
    <div className="w-full">
      <AdminHeader />
      <div className="w-full flex flex-col lg:flex-row">
        <AdminSideBar />
        <div className="flex-1 w-full">
          <AdminSettings />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSettings;
