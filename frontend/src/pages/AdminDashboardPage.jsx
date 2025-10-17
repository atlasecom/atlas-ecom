import React from "react";
import AdminHeader from "../components/Layout/AdminHeader";
import AdminSideBar from "../components/Admin/Layout/AdminSideBar.jsx";
import AdminDashboardMain from "../components/Admin/AdminDashboardMain.jsx";

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex h-screen">
        {/* Sidebar - Always rendered but positioned differently on mobile vs desktop */}
        <AdminSideBar />
        
        {/* Main Content - Full width on mobile, remaining width on desktop */}
        <div className="flex-1 overflow-y-auto">
          <AdminDashboardMain />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
