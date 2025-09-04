import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx";
import AdminDashboardMain from "../components/Admin/AdminDashboardMain.jsx";

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="w-full flex flex-col lg:flex-row">
        {/* Sidebar - Always rendered but positioned differently on mobile vs desktop */}
        <AdminSideBar />
        
        {/* Main Content - Full width on mobile, remaining width on desktop */}
        <div className="w-full lg:flex-1 lg:min-w-0">
          <AdminDashboardMain />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
