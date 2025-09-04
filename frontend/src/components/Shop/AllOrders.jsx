import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../Layout/Loader";
import { getAllOrdersOfShop } from "../../redux/actions/order";
import { toast } from "react-toastify";

const AllOrders = () => {
    const { orders, isLoading } = useSelector((state) => state.order);
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user && user.shop && user.shop._id) {
            dispatch(getAllOrdersOfShop(user.shop._id));
        }
    }, [dispatch, user]);

    useEffect(() => {
        let filtered = orders || [];
        
        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }
        
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(order => 
                order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.status.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        setFilteredOrders(filtered);
    }, [orders, statusFilter, searchTerm]);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            // Here you would typically make an API call to update the order status
            toast.success(`Order status updated to ${newStatus}`);
            // Refresh orders after update
            if (user && user.shop && user.shop._id) {
                dispatch(getAllOrdersOfShop(user.shop._id));
            }
        } catch (error) {
            toast.error('Failed to update order status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'Shipped':
                return 'bg-blue-100 text-blue-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            case 'Pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered':
                return '✅';
            case 'Processing':
                return '⏳';
            case 'Shipped':
                return '🚚';
            case 'Cancelled':
                return '❌';
            case 'Pending':
                return '⏸️';
            default:
                return '📋';
        }
    };

    if (isLoading) {
        return <Loader />;
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="w-full p-8 text-center">
                <span className="text-6xl mb-4 block">📦</span>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
                <p className="text-gray-500">Orders will appear here when customers make purchases</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="w-full px-0 sm:px-4 lg:px-6 py-2 sm:py-4 lg:py-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-0">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
                        <p className="text-gray-600">Manage and track all customer orders</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <span className="text-blue-600 text-xl">📊</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                                    <span className="text-yellow-600 text-xl">⏳</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {orders.filter(o => o.status === 'Pending').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-3 rounded-full mr-4">
                                    <span className="text-green-600 text-xl">✅</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Delivered</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {orders.filter(o => o.status === 'Delivered').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="bg-purple-100 p-3 rounded-full mr-4">
                                    <span className="text-purple-600 text-xl">💰</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        dh {orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
                                <input
                                    type="text"
                                    placeholder="Search by Order ID, customer name, or status..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="bg-gray-100 p-2 rounded-lg mr-3">
                                                        <span className="text-gray-600 text-sm font-medium">
                                                            #{order._id.slice(-6)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {order.cart.length} items
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {order.user?.name || 'Guest User'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {order.user?.email || 'No email'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)} {order.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    dh {order.totalPrice}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Link
                                                        to={`/order/${order._id}`}
                                                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs"
                                                    >
                                                        👁️ View
                                                    </Link>
                                                    {order.status === 'Pending' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order._id, 'Processing')}
                                                            className="bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors text-xs"
                                                        >
                                                            ⏳ Process
                                                        </button>
                                                    )}
                                                    {order.status === 'Processing' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order._id, 'Shipped')}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-xs"
                                                        >
                                                            🚚 Ship
                                                        </button>
                                                    )}
                                                    {order.status === 'Shipped' && (
                                                        <button
                                                            onClick={() => updateOrderStatus(order._id, 'Delivered')}
                                                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-xs"
                                                        >
                                                            ✅ Deliver
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
                            <span className="text-6xl mb-4 block">🔍</span>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllOrders;