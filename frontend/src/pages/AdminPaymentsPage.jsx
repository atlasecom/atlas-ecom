import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import AdminHeader from '../components/Layout/AdminHeader';
import AdminSideBar from '../components/Admin/Layout/AdminSideBar';
import { 
  FiDollarSign, 
  FiUsers, 
  FiBarChart,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import apiClient from '../utils/apiClient';

const AdminPaymentsPage = () => {
  const { user } = useSelector(state => state.user);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  // Charger les statistiques
  useEffect(() => {
    loadStats();
  }, [period, refreshKey]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/payments?period=${period}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      toast.error('Failed to fetch payment statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('fr-MA').format(num || 0);
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex h-screen">
          <AdminSideBar />
          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payment data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="flex h-screen">
        <AdminSideBar />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
                  <p className="mt-2 text-gray-600">Monitor revenue, subscriptions, and payment analytics</p>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={period}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                  <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FiDollarSign className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats?.totalEarnings || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FiCheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Paiements Réussis</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(stats?.totalPayments || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <FiUsers className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vendeurs Vérifiés</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(stats?.totalSellers || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <FiBarChart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Revenu Moyen</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats?.totalPayments > 0 ? stats.totalEarnings / stats.totalPayments : 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique des revenus (simulation) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Revenus</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <FiBarChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Graphique des revenus</p>
                  <p className="text-sm text-gray-400">(À implémenter avec une librairie de graphiques)</p>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiDollarSign className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Exporter les Données</span>
                </button>
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiBarChart className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Générer Rapport</span>
                </button>
                <button className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiUsers className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Gérer Vendeurs</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentsPage;
