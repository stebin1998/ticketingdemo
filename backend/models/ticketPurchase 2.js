const mongoose = require('mongoose');

const ticketPurchaseSchema = new mongoose.Schema({
  // User who purchased the ticket
  buyerUID: {
    type: String,
    required: true // Firebase UID of the buyer
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // MongoDB User ID of the buyer
  },
  
  // Event details
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  
  // Ticket details
  ticketTierName: {
    type: String,
    required: true
  },
  ticketTierType: {
    type: String,
    enum: ['free', 'paid', 'donation'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerTicket: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Purchase details
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'confirmed'
  },
  
  // Payment details (for future integration)
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'stripe', 'free'],
    default: 'free'
  },
  transactionId: {
    type: String,
    required: false // For payment processing
  },
  
  // Ticket codes (for entry)
  ticketCodes: [{
    code: { type: String, required: true },
    used: { type: Boolean, default: false },
    usedAt: { type: Date }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
ticketPurchaseSchema.index({ buyerUID: 1, eventId: 1 });
ticketPurchaseSchema.index({ eventId: 1 });
ticketPurchaseSchema.index({ buyerUID: 1, purchaseDate: -1 });

module.exports = mongoose.model('TicketPurchase', ticketPurchaseSchema); 