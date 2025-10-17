const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  // Utilisateur (vendeur)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Type d'abonnement
  type: {
    type: String,
    enum: ['verified_badge'],
    required: true
  },
  
  // Statut de l'abonnement
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'suspended'],
    default: 'active'
  },
  
  // Durée de l'abonnement
  duration: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  
  // Dates
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  // Montant payé
  amount: {
    type: Number,
    required: true
  },
  
  // Paiement associé
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  
  // Fonctionnalités incluses
  features: {
    verifiedBadge: {
      type: Boolean,
      default: true
    },
    prioritySupport: {
      type: Boolean,
      default: true
    },
    advancedAnalytics: {
      type: Boolean,
      default: true
    },
    customStoreUrl: {
      type: Boolean,
      default: false
    }
  },
  
  // Renouvellement automatique
  autoRenew: {
    type: Boolean,
    default: true
  },
  
  // Prochain paiement
  nextPaymentDate: Date,
  
  // Historique des paiements
  paymentHistory: [{
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    amount: Number,
    paidAt: Date,
    status: String
  }],
  
  // Notes
  notes: String,
  
  // Dates
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour les recherches
subscriptionSchema.index({ user: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });
subscriptionSchema.index({ type: 1, status: 1 });

// Middleware pour mettre à jour updatedAt
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour vérifier si l'abonnement est actif
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' && this.endDate > new Date();
};

// Méthode pour calculer les jours restants
subscriptionSchema.methods.getDaysRemaining = function() {
  if (!this.isActive()) return 0;
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
