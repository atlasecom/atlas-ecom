import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllEvents from "../components/Admin/AllEvents";

const AdminDashboardEvents = () => {
  return (
    <div className="w-full">
      <AdminHeader />
      <div className="w-full flex flex-col lg:flex-row">
        <AdminSideBar />
        <div className="flex-1 w-full">
          <AllEvents />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardEvents;
