import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import DashboardHeader from '../components/Shop/Layout/DashboardHeader';
import DashboardSideBar from '../components/Shop/Layout/DashboardSideBar';
import { 
  FiCheckCircle, 
  FiStar, 
  FiEye, 
  FiDollarSign,
  FiBarChart,
  FiClock,
  FiX,
  FiCreditCard,
  FiShield,
  FiZap
} from 'react-icons/fi';
import apiClient from '../utils/apiClient';

const DashboardSubscription = () => {
  const { user } = useSelector(state => state.user);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [boostStats, setBoostStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [boostClicks, setBoostClicks] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger l'abonnement
      const subscriptionRes = await apiClient.get('/api/payments/subscription');
      setSubscription(subscriptionRes.data.subscription);
      
      // Charger les statistiques de boost
      setBoostStats(user?.boostStats || { totalSpent: 0, totalClicks: 0, activeBoosts: 0 });
      
      // Charger les produits du vendeur
      const productsRes = await apiClient.get('/api/products/seller');
      setProducts(productsRes.data.products);
      
      // Charger les événements du vendeur
      const eventsRes = await apiClient.get('/api/events/seller');
      setEvents(eventsRes.data.events);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error(t("subscription.paymentError", "Erreur lors du chargement des données"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifiedBadgePurchase = (duration) => {
    setPaymentType('verified_badge');
    setPaymentDetails({ duration });
    setShowPaymentModal(true);
  };

  const handleProductBoost = () => {
    if (!selectedProduct) {
      toast.error(t("subscription.selectProductFirst", "Veuillez sélectionner un produit"));
      return;
    }
    if (boostClicks < 10) {
      toast.error(t("subscription.minimumClicks", "Minimum 10 clics requis"));
      return;
    }
    setPaymentType('product_boost');
    setPaymentDetails({ 
      productId: selectedProduct, 
      clicks: boostClicks,
      amount: boostClicks * 5 
    });
    setShowPaymentModal(true);
  };

  const handleEventBoost = () => {
    if (!selectedEvent) {
      toast.error(t("subscription.selectEventFirst", "Veuillez sélectionner un événement"));
      return;
    }
    if (boostClicks < 10) {
      toast.error(t("subscription.minimumClicks", "Minimum 10 clics requis"));
      return;
    }
    setPaymentType('event_boost');
    setPaymentDetails({ 
      eventId: selectedEvent, 
      clicks: boostClicks,
      amount: boostClicks * 5 
    });
    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    try {
      const response = await apiClient.post('/api/payments/mock-payment', {
        amount: paymentDetails.amount,
        paymentType: paymentType,
        duration: paymentDetails.duration,
        relatedEntityId: paymentDetails.productId || paymentDetails.eventId
      });

      if (response.data.success) {
        toast.success(t("subscription.paymentSuccess", "Paiement effectué avec succès!"));
        setShowPaymentModal(false);
        loadData(); // Recharger les données
      } else {
        toast.error(t("subscription.paymentError", "Erreur lors du paiement"));
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Erreur lors du paiement');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="flex flex-col lg:flex-row w-full">
          <DashboardSideBar />
          <div className="flex-1 w-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t("subscription.loadingData", "Loading subscription data...")}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="flex flex-col lg:flex-row w-full">
        <DashboardSideBar />
        <div className="flex-1 w-full p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{t("subscription.title", "Subscription & Boost Management")}</h1>
              <p className="mt-2 text-gray-600">{t("subscription.description", "Manage your verified badge and boost your products and events")}</p>
            </div>

            {/* Badge Vérifié Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${subscription?.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <FiShield className={`h-6 w-6 ${subscription?.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t("subscription.verifiedBadge", "Badge Vérifié")}</h3>
                    <p className="text-sm text-gray-600">
                      {subscription?.isActive ? (
                        `${t("subscription.activeUntil", "Actif jusqu'au")} ${new Date(subscription.endDate).toLocaleDateString()}`
                      ) : (
                        t("subscription.notActive", "Non actif")
                      )}
                    </p>
                  </div>
                </div>
                {!subscription?.isActive && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVerifiedBadgePurchase('monthly')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t("subscription.buyMonthly", "Acheter (500 DH/mois)")}
                    </button>
                    <button
                      onClick={() => handleVerifiedBadgePurchase('annual')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {t("subscription.buyAnnual", "Acheter (5000 DH/an)")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques de Boost */}
            {boostStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FiDollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Dépensé</p>
                      <p className="text-2xl font-bold text-gray-900">{boostStats.totalSpent} MAD</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full">
                      <FiEye className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Clics</p>
                      <p className="text-2xl font-bold text-gray-900">{boostStats.totalClicks}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <FiZap className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Boosts Actifs</p>
                      <p className="text-2xl font-bold text-gray-900">{boostStats.activeBoosts}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <FiBarChart className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">ROI Moyen</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {boostStats.totalClicks > 0 ? Math.round((boostStats.totalClicks * 0.1) / boostStats.totalSpent * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Boost Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Boost Products</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un produit</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choisir un produit</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de clics (5 MAD/clic)</label>
                  <input
                    type="number"
                    min="10"
                    value={boostClicks}
                    onChange={(e) => setBoostClicks(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total: {boostClicks * 5} MAD</span>
                <button
                  onClick={handleProductBoost}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Boost Product
                </button>
              </div>
            </div>

            {/* Boost Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Boost Events</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sélectionner un événement</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choisir un événement</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id}>{event.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de clics (5 MAD/clic)</label>
                  <input
                    type="number"
                    min="10"
                    value={boostClicks}
                    onChange={(e) => setBoostClicks(parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">Total: {boostClicks * 5} MAD</span>
                <button
                  onClick={handleEventBoost}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Boost Event
                </button>
              </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Confirmer le Paiement</h3>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <FiCreditCard className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {paymentType === 'verified_badge' && 'Badge Vérifié'}
                          {paymentType === 'product_boost' && 'Boost de Produit'}
                          {paymentType === 'event_boost' && 'Boost d\'Événement'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {paymentType === 'verified_badge' && (
                            paymentDetails.duration === 'annual' ? '5000 MAD/an' : '500 MAD/mois'
                          )}
                          {paymentType === 'product_boost' && `${paymentDetails.amount} MAD (${paymentDetails.clicks} clics)`}
                          {paymentType === 'event_boost' && `${paymentDetails.amount} MAD (${paymentDetails.clicks} clics)`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Mode de paiement: Mock Payment</p>
                      <p className="text-sm text-gray-600">Le paiement sera simulé pour les tests</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={processPayment}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSubscription;