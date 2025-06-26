const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUID: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  displayName: { 
    type: String, 
    required: false 
  },
  role: { 
    type: String, 
    enum: ['user', 'seller', 'admin'], 
    default: 'user' 
  },
  profilePicture: { 
    type: String, 
    required: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  lastLogin: { 
    type: Date, 
    default: Date.now 
  },
  
  // Seller-specific fields (only filled if role is 'seller')
  companyName: {
    type: String,
    required: false // Only required for sellers
  },
  website: {
    type: String,
    required: false
  },
  businessAddress: {
    type: String,
    required: false
  },
  contactNumber: {
    type: String,
    required: false
  },
  paymentInstitution: {
    type: String,
    required: false
  },
  paymentInfo: {
    type: String,
    required: false // Will store mock payment details
  }
}, {
  timestamps: true // This gives us createdAt and updatedAt automatically
});

// Remove duplicate indexes - the unique: true above already creates them

module.exports = mongoose.model('User', userSchema); 