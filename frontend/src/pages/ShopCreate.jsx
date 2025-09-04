import React, { useEffect, useState } from 'react'
import ShopCreate from "../components/Shop/ShopCreate";
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ShopCreatePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading } = useSelector((state) => state.user);
    const [pageLoading, setPageLoading] = useState(true);
    
    useEffect(() => {
        // Wait a bit for Redux state to be fully loaded
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 100);
        
        return () => clearTimeout(timer);
    }, []);
    
    // if user is already a seller then redirect to their shop
    useEffect(() => {
        if (isAuthenticated && user?.role === 'seller' && user?.shop) {
            navigate(`/shop/${user.shop}`);
        }
    }, [isAuthenticated, user, navigate]);
    
    // if user is not authenticated, redirect to login
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login');
        }
    }, [loading, isAuthenticated, navigate]);
    
    // Show loading while checking authentication
    if (loading || pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading shop creation page...</p>
                </div>
            </div>
        );
    }
    
    // Show loading while checking authentication
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Redirecting to login...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen">
            <ShopCreate />
        </div>
    )
}

export default ShopCreatePage