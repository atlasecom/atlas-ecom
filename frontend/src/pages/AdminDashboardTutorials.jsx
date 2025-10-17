import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar";
import AllTutorials from "../components/Admin/AllTutorials";

const AdminDashboardTutorials = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex">
        <div className="w-[80px] 800px:w-[330px]">
          <AdminSideBar active={9} />
        </div>
        <div className="flex-1 overflow-y-auto">
          <AllTutorials />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardTutorials;

