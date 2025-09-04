import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllUsers from "../components/Admin/AllUsers";

const AdminDashboardUsers = () => {
  return (
    <div className="w-full">
      <AdminHeader />
      <div className="w-full flex flex-col lg:flex-row">
        <AdminSideBar />
        <div className="flex-1 w-full">
          <AllUsers />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardUsers;
