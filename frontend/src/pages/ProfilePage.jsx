import React, { useState } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import styles from "../styles/styles";
import ProfileSideBar from "../components/Profile/ProfileSidebar";
import ProfileContent from "../components/Profile/ProfileContent";


const ProfilePage = () => {
    const [active, setActive] = useState(1);
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50">
            <Header />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Page Header */}
                <div className="mb-8 lg:mb-12">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                        My Profile
                    </h1>
                    <p className="text-lg text-gray-600">
                        Manage your account settings and preferences
                    </p>
                </div>
                
                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="lg:w-80 flex-shrink-0">
                        <ProfileSideBar active={active} setActive={setActive} />
                    </div>
                    
                    {/* Content Area */}
                    <div className="flex-1">
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 lg:p-8">
                            <ProfileContent active={active} />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ProfilePage