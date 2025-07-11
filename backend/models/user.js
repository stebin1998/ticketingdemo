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
  bannerImage: { 
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
  
  // Profile fields (Phase 2)
  username: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allow null values but enforce uniqueness when set
  },
  bio: {
    type: String,
    required: false,
    maxlength: 500
  },
  location: {
    type: String,
    required: false
  },
  
  // Social media fields
  socialMedia: {
    instagram: { type: String, required: false },
    tiktok: { type: String, required: false },
    twitter: { type: String, required: false },
    facebook: { type: String, required: false },
    youtube: { type: String, required: false }
  },
  
  // Follow system (for Phase 3 - prepared but not implemented yet)
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
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