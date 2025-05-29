import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donor: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    // Optional connection to user account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  amount: {
    type: Number,
    required: true,
    min: 100, // Minimum donation of 100 LKR
  },
  currency: {
    type: String,
    default: 'LKR',
    enum: ['LKR', 'USD'],
  },
  donationType: {
    type: String,
    enum: ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY'],
    default: 'ONE_TIME',
  },
  purpose: {
    type: String,
    enum: ['RESCUE', 'MEDICAL', 'FEEDING', 'GENERAL'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['CREDIT_CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
  paymentId: {
    type: String,
    default: null,
  },
  transactionReference: {
    type: String,
    default: null,
  },
  receiptSent: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    default: null,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  // For recurring donations
  recurringStatus: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED'],
    default: null,
  },
  nextBillingDate: {
    type: Date,
    default: null,
  },
  // For internal tracking of conversions
  campaignSource: {
    type: String,
    default: null,
  },
  // For bank transfers that may be confirmed manually
  manuallyVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, { timestamps: true });

// Automatically generate a transaction reference if none provided
donationSchema.pre('save', function(next) {
  if (!this.transactionReference) {
    const prefix = 'DON';
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const timestamp = Date.now().toString().slice(-6);
    this.transactionReference = `${prefix}-${randomDigits}-${timestamp}`;
  }
  next();
});

// Set next billing date for recurring donations
donationSchema.pre('save', function(next) {
  if (this.donationType !== 'ONE_TIME' && !this.nextBillingDate) {
    const now = new Date();
    let nextDate = new Date(now);
    
    switch (this.donationType) {
      case 'MONTHLY':
        nextDate.setMonth(now.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(now.getMonth() + 3);
        break;
      case 'YEARLY':
        nextDate.setFullYear(now.getFullYear() + 1);
        break;
    }
    
    this.nextBillingDate = nextDate;
    this.recurringStatus = 'ACTIVE';
  }
  next();
});

const Donation = mongoose.model('Donation', donationSchema);

export default Donation; 