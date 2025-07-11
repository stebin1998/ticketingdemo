const mongoose = require('mongoose');

const eventSlotSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  startTime: { type: String, required: true }, 
  endDate: { type: Date, required: true },
  endTime: { type: String, required: true },
});

const ticketTierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['free', 'paid', 'donation'], required: true },
  price: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 0 },
  description: { type: String },
  active: { type: Boolean, default: true },
  public: { type: Boolean, default: true },
});

const discountCodeSchema = new mongoose.Schema({
  code: { type: String },
  tiers: [{ type: String }], 
  maxUses: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  startDate: { type: Date },
  endDate: { type: Date },
});

const locationSchema = new mongoose.Schema({
  eventType: { type: String, enum: ['physical', 'online', 'hybrid'], required: true },
  venueName: { type: String },
  streetAddress: { type: String },
  city: { type: String },
  stateProvince: { type: String },
  postalCode: { type: String },
  country: { type: String },
});

const eventSettingsSchema = new mongoose.Schema({
  refundPolicy: {
    type: String,
    enum: [
      '1_day_before',
      '2_days_before',
      '14_days_before',
      '30_days_before',
      'no_refund',
    ],
    required: true,
  },
  refundPolicyText: { type: String },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  publishStatus: { type: String, enum: ['draft', 'published'], default: 'draft' },
});

const organizerContactSchema = new mongoose.Schema({
  email: { type: String },
  phone: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  twitter: { type: String },
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  genre: { type: String },
  tags: [{ type: String }],
  location: locationSchema,
  files: [{ type: String }], 
  dateTimes: {
    isMultiDate: { type: Boolean, default: false },
    eventSlots: [eventSlotSchema],
    singleStartDate: { type: Date },
    singleStartTime: { type: String },
    singleEndDate: { type: Date },
    singleEndTime: { type: String },
  },
  ticketTiers: [ticketTierSchema],
  discountCodes: [discountCodeSchema],
  eventSettings: eventSettingsSchema,
  organizerContact: organizerContactSchema,
  
  // Creator tracking (Phase 1)
  creatorUID: {
    type: String,
    required: true // Firebase UID of the event creator
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // MongoDB User ID of the creator
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', eventSchema);
