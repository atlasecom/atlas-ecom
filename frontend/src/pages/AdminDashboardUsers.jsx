import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllUsers from "../components/Admin/AllUsers";

const AdminDashboardUsers = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex h-screen">
        <AdminSideBar />
        <div className="flex-1 overflow-y-auto">
          <AllUsers />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardUsers;
