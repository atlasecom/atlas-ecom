const mongoose = require('mongoose');

const eventBoostSchema = new mongoose.Schema({
  // Événement boosté
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  
  // Vendeur propriétaire
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Paiement associé
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  
  // Statut du boost
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'expired', 'cancelled'],
    default: 'active'
  },
  
  // Configuration du boost
  config: {
    maxClicks: {
      type: Number,
      required: true,
      min: 1
    },
    costPerClick: {
      type: Number,
      required: true,
      min: 0
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  // Statistiques
  stats: {
    totalClicks: {
      type: Number,
      default: 0
    },
    remainingClicks: {
      type: Number,
      required: true
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    remainingBudget: {
      type: Number,
      required: true
    },
    lastClickAt: Date,
    clickHistory: [{
      clickedAt: Date,
      cost: Number,
      source: String, // 'home', 'search', 'category', etc.
      userAgent: String,
      ipAddress: String
    }]
  },
  
  // Dates
  startDate: {
    type: Date,
    default: Date.now
  },
  
  endDate: Date,
  
  // Priorité (plus élevé = affiché en premier)
  priority: {
    type: Number,
    default: 1
  },
  
  // Notes
  notes: String,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour les recherches et le tri
eventBoostSchema.index({ event: 1, status: 1 });
eventBoostSchema.index({ seller: 1, status: 1 });
eventBoostSchema.index({ status: 1, priority: -1, createdAt: -1 });
eventBoostSchema.index({ 'stats.remainingClicks': 1, status: 1 });

// Middleware pour mettre à jour updatedAt
eventBoostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Méthode pour enregistrer un clic
eventBoostSchema.methods.recordClick = function(source, userAgent, ipAddress) {
  if (this.status !== 'active' || this.stats.remainingClicks <= 0) {
    return false;
  }
  
  const cost = this.config.costPerClick;
  
  this.stats.totalClicks += 1;
  this.stats.remainingClicks -= 1;
  this.stats.totalSpent += cost;
  this.stats.remainingBudget -= cost;
  this.stats.lastClickAt = new Date();
  
  this.stats.clickHistory.push({
    clickedAt: new Date(),
    cost: cost,
    source: source,
    userAgent: userAgent,
    ipAddress: ipAddress
  });
  
  // Marquer comme terminé si plus de clics
  if (this.stats.remainingClicks <= 0) {
    this.status = 'completed';
  }
  
  return true;
};

// Méthode pour vérifier si le boost est actif
eventBoostSchema.methods.isActive = function() {
  return this.status === 'active' && 
         this.stats.remainingClicks > 0 && 
         this.stats.remainingBudget > 0 &&
         (!this.endDate || this.endDate > new Date());
};

module.exports = mongoose.model('EventBoost', eventBoostSchema);
