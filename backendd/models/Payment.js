const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Informations de base
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Informations utilisateur
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type de paiement
  paymentType: {
    type: String,
    enum: ['verified_badge', 'product_boost', 'event_boost'],
    required: true
  },
  
  // Montant
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  currency: {
    type: String,
    default: 'MAD'
  },
  
  // Statut du paiement
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  // Détails spécifiques selon le type
  details: {
    // Pour verified_badge
    verifiedBadge: {
      duration: {
        type: String,
        enum: ['monthly', 'yearly']
      },
      startDate: Date,
      endDate: Date
    },
    
    // Pour product_boost
    productBoost: {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      clicks: {
        type: Number,
        default: 0
      },
      maxClicks: {
        type: Number,
        required: function() {
          return this.paymentType === 'product_boost';
        }
      },
      costPerClick: {
        type: Number,
        default: 5
      }
    },
    
    // Pour event_boost
    eventBoost: {
      event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
      },
      clicks: {
        type: Number,
        default: 0
      },
      maxClicks: {
        type: Number,
        required: function() {
          return this.paymentType === 'event_boost';
        }
      },
      costPerClick: {
        type: Number,
        default: 5
      }
    }
  },
  
  // Informations de paiement mock
  mockPayment: {
    transactionId: String,
    paymentMethod: {
      type: String,
      default: 'mock_card'
    },
    cardLast4: {
      type: String,
      default: '1234'
    }
  },
  
  // Métadonnées
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  },
  
  // Dates
  paidAt: Date,
  expiresAt: Date,
  
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

// Index pour les recherches fréquentes
paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ paymentType: 1, status: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ createdAt: -1 });

// Middleware pour mettre à jour updatedAt
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
