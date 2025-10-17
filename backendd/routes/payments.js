const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const ProductBoost = require('../models/ProductBoost');
const EventBoost = require('../models/EventBoost');
const Product = require('../models/Product');
const Event = require('../models/Event');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const crypto = require('crypto');

// ============================================
// MOCK PAYMENT SYSTEM
// ============================================

// Générer un ID de commande unique
const generateOrderId = () => {
  return 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Générer un ID de transaction mock
const generateTransactionId = () => {
  return 'TXN_' + crypto.randomBytes(16).toString('hex').toUpperCase();
};

// ============================================
// ROUTES POUR VENDEURS
// ============================================

// Créer un paiement (badge vérifié ou boost)
router.post('/create', protect, authorize('seller'), async (req, res) => {
  try {
    const { paymentType, details } = req.body;
    const userId = req.user._id;

    // Validation des données
    if (!paymentType || !details) {
      return res.status(400).json({
        success: false,
        message: 'Payment type and details are required'
      });
    }

    let amount = 0;
    let orderId = generateOrderId();

    // Calculer le montant selon le type de paiement
    if (paymentType === 'verified_badge') {
      const { duration } = details;
      if (!duration || !['monthly', 'yearly'].includes(duration)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid duration for verified badge'
        });
      }
      
      amount = duration === 'monthly' ? 500 : 5000; // 500 MAD/mois ou 5000 MAD/an
    } else if (paymentType === 'product_boost') {
      const { productId, maxClicks } = details;
      if (!productId || !maxClicks || maxClicks <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product boost details'
        });
      }
      
      // Vérifier que le produit appartient au vendeur
      const product = await Product.findById(productId);
      if (!product || product.shop.toString() !== req.user.shop.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Product not found or not owned by seller'
        });
      }
      
      amount = maxClicks * 5; // 5 MAD par clic
    } else if (paymentType === 'event_boost') {
      const { eventId, maxClicks } = details;
      if (!eventId || !maxClicks || maxClicks <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid event boost details'
        });
      }
      
      // Vérifier que l'événement appartient au vendeur
      const event = await Event.findById(eventId);
      if (!event || event.shop.toString() !== req.user.shop.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Event not found or not owned by seller'
        });
      }
      
      amount = maxClicks * 5; // 5 MAD par clic
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment type'
      });
    }

    // Créer le paiement
    const payment = await Payment.create({
      orderId,
      user: userId,
      paymentType,
      amount,
      currency: 'MAD',
      status: 'pending',
      details,
      mockPayment: {
        transactionId: generateTransactionId(),
        paymentMethod: 'mock_card',
        cardLast4: '1234'
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referrer: req.get('Referer')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment: {
        orderId: payment.orderId,
        amount: payment.amount,
        currency: payment.currency,
        paymentType: payment.paymentType,
        status: payment.status
      }
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment'
    });
  }
});

// Traiter le paiement (simulation)
router.post('/process/:orderId', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body; // 'approve', 'decline', 'cancel'

    const payment = await Payment.findOne({ orderId, user: req.user._id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed'
      });
    }

    // Simuler le traitement du paiement
    if (action === 'approve') {
      payment.status = 'completed';
      payment.paidAt = new Date();
      
      // Traiter selon le type de paiement
      if (payment.paymentType === 'verified_badge') {
        await processVerifiedBadgePayment(payment);
      } else if (payment.paymentType === 'product_boost') {
        await processProductBoostPayment(payment);
      } else if (payment.paymentType === 'event_boost') {
        await processEventBoostPayment(payment);
      }
      
      await payment.save();
      
      res.json({
        success: true,
        message: 'Payment processed successfully',
        payment: {
          orderId: payment.orderId,
          status: payment.status,
          paidAt: payment.paidAt
        }
      });
    } else if (action === 'decline') {
      payment.status = 'failed';
      await payment.save();
      
      res.json({
        success: true,
        message: 'Payment declined',
        payment: {
          orderId: payment.orderId,
          status: payment.status
        }
      });
    } else {
      payment.status = 'cancelled';
      await payment.save();
      
      res.json({
        success: true,
        message: 'Payment cancelled',
        payment: {
          orderId: payment.orderId,
          status: payment.status
        }
      });
    }

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment'
    });
  }
});

// Obtenir l'abonnement du vendeur
router.get('/subscription', protect, authorize('seller'), async (req, res) => {
  try {
    const userId = req.user._id;

    const subscription = await Subscription.findOne({ user: userId, type: 'verified_badge' })
      .populate('payment', 'orderId amount status paidAt');

    res.json({
      success: true,
      subscription: subscription || null
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subscription'
    });
  }
});

// Obtenir l'historique des paiements du vendeur
router.get('/history', protect, authorize('seller'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentType } = req.query;
    const userId = req.user._id;

    const query = { user: userId };
    if (status) query.status = status;
    if (paymentType) query.paymentType = paymentType;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('details.productBoost.product', 'name')
      .populate('details.eventBoost.event', 'name');

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPayments: total
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment history'
    });
  }
});

// Obtenir les statistiques de boost du vendeur
router.get('/boost-stats', protect, authorize('seller'), async (req, res) => {
  try {
    const userId = req.user._id;

    // Statistiques des boosts de produits
    const productBoosts = await ProductBoost.find({ seller: userId });
    const activeProductBoosts = productBoosts.filter(boost => boost.isActive());
    
    // Statistiques des boosts d'événements
    const eventBoosts = await EventBoost.find({ seller: userId });
    const activeEventBoosts = eventBoosts.filter(boost => boost.isActive());

    // Calculer les totaux
    const totalSpent = productBoosts.reduce((sum, boost) => sum + boost.stats.totalSpent, 0) +
                      eventBoosts.reduce((sum, boost) => sum + boost.stats.totalSpent, 0);
    
    const totalClicks = productBoosts.reduce((sum, boost) => sum + boost.stats.totalClicks, 0) +
                       eventBoosts.reduce((sum, boost) => sum + boost.stats.totalClicks, 0);

    res.json({
      success: true,
      stats: {
        totalSpent,
        totalClicks,
        activeBoosts: activeProductBoosts.length + activeEventBoosts.length,
        productBoosts: {
          total: productBoosts.length,
          active: activeProductBoosts.length,
          totalSpent: productBoosts.reduce((sum, boost) => sum + boost.stats.totalSpent, 0),
          totalClicks: productBoosts.reduce((sum, boost) => sum + boost.stats.totalClicks, 0)
        },
        eventBoosts: {
          total: eventBoosts.length,
          active: activeEventBoosts.length,
          totalSpent: eventBoosts.reduce((sum, boost) => sum + boost.stats.totalSpent, 0),
          totalClicks: eventBoosts.reduce((sum, boost) => sum + boost.stats.totalClicks, 0)
        }
      }
    });

  } catch (error) {
    console.error('Get boost stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get boost statistics'
    });
  }
});

// ============================================
// ROUTES POUR ADMIN
// ============================================

// Obtenir toutes les statistiques de paiement (admin)
router.get('/admin/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculer la date de début selon la période
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Statistiques générales
    const totalEarnings = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalPayments = await Payment.countDocuments({
      status: 'completed',
      createdAt: { $gte: startDate }
    });

    const totalSellers = await User.countDocuments({
      role: 'seller',
      verifiedBadge: true
    });

    // Statistiques par type
    const statsByType = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Top vendeurs par dépenses
    const topSellers = await Payment.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$user',
          totalSpent: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          totalSpent: 1,
          paymentCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalEarnings: totalEarnings[0]?.total || 0,
        totalPayments,
        totalSellers,
        statsByType,
        topSellers,
        period
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get admin statistics'
    });
  }
});

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// Traiter le paiement du badge vérifié
async function processVerifiedBadgePayment(payment) {
  const { duration } = payment.details.verifiedBadge;
  
  // Calculer les dates
  const startDate = new Date();
  const endDate = new Date();
  if (duration === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Mettre à jour l'utilisateur
  await User.findByIdAndUpdate(payment.user, {
    verifiedBadge: true,
    verifiedBadgeExpiresAt: endDate
  });

  // Créer ou mettre à jour l'abonnement
  await Subscription.findOneAndUpdate(
    { user: payment.user, type: 'verified_badge' },
    {
      user: payment.user,
      type: 'verified_badge',
      duration,
      startDate,
      endDate,
      amount: payment.amount,
      payment: payment._id,
      status: 'active',
      nextPaymentDate: endDate
    },
    { upsert: true, new: true }
  );
}

// Traiter le paiement du boost de produit
async function processProductBoostPayment(payment) {
  const { productId, maxClicks } = payment.details.productBoost;
  const costPerClick = 5;

  // Créer le boost de produit
  const productBoost = await ProductBoost.create({
    product: productId,
    seller: payment.user,
    payment: payment._id,
    config: {
      maxClicks,
      costPerClick,
      totalBudget: maxClicks * costPerClick
    },
    stats: {
      remainingClicks: maxClicks,
      remainingBudget: maxClicks * costPerClick
    }
  });

  // Mettre à jour le produit
  await Product.findByIdAndUpdate(productId, {
    isBoosted: true,
    boostPriority: 1,
    boostExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  });

  // Mettre à jour les statistiques du vendeur
  await User.findByIdAndUpdate(payment.user, {
    $inc: {
      'boostStats.totalSpent': payment.amount,
      'boostStats.activeBoosts': 1
    }
  });
}

// Traiter le paiement du boost d'événement
async function processEventBoostPayment(payment) {
  const { eventId, maxClicks } = payment.details.eventBoost;
  const costPerClick = 5;

  // Créer le boost d'événement
  const eventBoost = await EventBoost.create({
    event: eventId,
    seller: payment.user,
    payment: payment._id,
    config: {
      maxClicks,
      costPerClick,
      totalBudget: maxClicks * costPerClick
    },
    stats: {
      remainingClicks: maxClicks,
      remainingBudget: maxClicks * costPerClick
    }
  });

  // Mettre à jour l'événement
  await Event.findByIdAndUpdate(eventId, {
    isBoosted: true,
    boostPriority: 1,
    boostExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours
  });

  // Mettre à jour les statistiques du vendeur
  await User.findByIdAndUpdate(payment.user, {
    $inc: {
      'boostStats.totalSpent': payment.amount,
      'boostStats.activeBoosts': 1
    }
  });
}

module.exports = router;
