import Donation from '../models/Donation.js';
import { ApiError } from '../utils/ApiError.js';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

/**
 * Create a new donation
 */
export const createDonation = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      amount,
      currency = 'LKR',
      donationType = 'ONE_TIME',
      purpose,
      paymentMethod,
      notes,
      isAnonymous = false,
      userId,
    } = req.body;

    // Validate required fields
    if (!name || !email || !amount || !purpose || !paymentMethod) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    // Validate donation amount
    if (amount < 100) {
      throw new ApiError(400, 'Minimum donation amount is 100 LKR');
    }

    const donation = new Donation({
      donor: {
        name,
        email,
        phone,
        userId: userId || null,
      },
      amount,
      currency,
      donationType,
      purpose,
      paymentMethod,
      notes,
      isAnonymous,
    });

    // Set payment status based on payment method
    if (paymentMethod === 'BANK_TRANSFER') {
      donation.paymentStatus = 'PENDING';
    } else {
      // In a real implementation, this would integrate with a payment gateway
      // For now, we'll simulate a successful payment
      donation.paymentStatus = 'COMPLETED';
      donation.paymentId = `SIM-${Date.now()}`;
    }

    await donation.save();

    // Send confirmation email for completed payments
    if (donation.paymentStatus === 'COMPLETED') {
      await sendReceiptEmail(donation);
      donation.receiptSent = true;
      await donation.save();
    }

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      donation: {
        id: donation._id,
        amount: donation.amount,
        currency: donation.currency,
        purpose: donation.purpose,
        transactionReference: donation.transactionReference,
        paymentStatus: donation.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all donations with pagination and filtering options
 */
export const getDonations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Apply filters if provided
    const filter = {};
    
    if (req.query.status) {
      filter.paymentStatus = req.query.status;
    }
    
    if (req.query.purpose) {
      filter.purpose = req.query.purpose;
    }
    
    if (req.query.fromDate && req.query.toDate) {
      filter.createdAt = {
        $gte: new Date(req.query.fromDate),
        $lte: new Date(req.query.toDate),
      };
    }
    
    // Handle user filtering (admin only)
    if (req.query.email) {
      filter['donor.email'] = req.query.email;
    }
    
    const donations = await Donation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalDonations = await Donation.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: donations.length,
      totalDonations,
      totalPages: Math.ceil(totalDonations / limit),
      currentPage: page,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get donation by ID
 */
export const getDonationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const donation = await Donation.findById(id);
    
    if (!donation) {
      throw new ApiError(404, 'Donation not found');
    }
    
    res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update donation payment status (admin only)
 */
export const updateDonationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, manuallyVerified } = req.body;
    
    const donation = await Donation.findById(id);
    
    if (!donation) {
      throw new ApiError(404, 'Donation not found');
    }
    
    // Update payment status
    if (paymentStatus) {
      donation.paymentStatus = paymentStatus;
    }
    
    // Mark as manually verified if needed
    if (manuallyVerified !== undefined) {
      donation.manuallyVerified = manuallyVerified;
      donation.verifiedBy = req.userId; // Assuming user ID is provided from auth middleware
    }
    
    // Send receipt if payment is completed and receipt not sent yet
    if (donation.paymentStatus === 'COMPLETED' && !donation.receiptSent) {
      await sendReceiptEmail(donation);
      donation.receiptSent = true;
    }
    
    await donation.save();
    
    res.status(200).json({
      success: true,
      message: 'Donation status updated successfully',
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get donation statistics 
 */
export const getDonationStatistics = async (req, res, next) => {
  try {
    // Get total donations by purpose
    const purposeStats = await Donation.aggregate([
      { $match: { paymentStatus: 'COMPLETED' } },
      { $group: {
          _id: '$purpose',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get total donations by month for the current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Donation.aggregate([
      { 
        $match: { 
          paymentStatus: 'COMPLETED',
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get overall stats
    const totalDonations = await Donation.countDocuments({ paymentStatus: 'COMPLETED' });
    const totalAmount = await Donation.aggregate([
      { $match: { paymentStatus: 'COMPLETED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    // Get recurring donation stats
    const recurringStats = await Donation.aggregate([
      { $match: { donationType: { $ne: 'ONE_TIME' }, paymentStatus: 'COMPLETED' } },
      { $group: {
          _id: '$donationType',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      statistics: {
        totalDonations,
        totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
        purposeStats,
        monthlyStats,
        recurringStats
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send receipt email to donor
 */
const sendReceiptEmail = async (donation) => {
  const receiptHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #e62e5c;">Thank You for Your Donation</h1>
        <p>Your generosity helps us care for animals in need.</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <h2 style="color: #333; margin-top: 0;">Donation Receipt</h2>
        <p><strong>Transaction Reference:</strong> ${donation.transactionReference}</p>
        <p><strong>Date:</strong> ${new Date(donation.createdAt).toLocaleDateString()}</p>
        <p><strong>Donor:</strong> ${donation.donor.name}</p>
        <p><strong>Email:</strong> ${donation.donor.email}</p>
        <p><strong>Amount:</strong> ${donation.currency} ${donation.amount.toLocaleString()}</p>
        <p><strong>Purpose:</strong> ${getPurposeLabel(donation.purpose)}</p>
        <p><strong>Payment Method:</strong> ${getPaymentMethodLabel(donation.paymentMethod)}</p>
        <p><strong>Donation Type:</strong> ${getDonationTypeLabel(donation.donationType)}</p>
      </div>
      
      <div style="color: #666; font-size: 14px; line-height: 1.5;">
        <p>This donation receipt may be used for tax purposes. PawHaven is a registered non-profit organization in Sri Lanka.</p>
        <p>If you have any questions, please contact us at <a href="mailto:donations@pawhaven.org" style="color: #e62e5c;">donations@pawhaven.org</a>.</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #888; font-size: 12px;">
        <p>PawHaven - Helping animals in need across Sri Lanka</p>
        <p>© ${new Date().getFullYear()} PawHaven. All rights reserved.</p>
      </div>
    </div>
  `;
  
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to: donation.donor.email,
    subject: 'Thank You for Your Donation to PawHaven',
    html: receiptHTML,
  };
  
  return await transporter.sendMail(mailOptions);
};

/**
 * Helper functions to get display labels
 */
const getPurposeLabel = (purpose) => {
  const purposeLabels = {
    'RESCUE': 'Animal Rescue Operations',
    'MEDICAL': 'Medical Care for Animals',
    'FEEDING': 'Animal Feeding Programs',
    'GENERAL': 'General Support',
  };
  return purposeLabels[purpose] || purpose;
};

const getPaymentMethodLabel = (method) => {
  const methodLabels = {
    'CREDIT_CARD': 'Credit/Debit Card',
    'BANK_TRANSFER': 'Bank Transfer',
    'MOBILE_PAYMENT': 'Mobile Payment',
  };
  return methodLabels[method] || method;
};

const getDonationTypeLabel = (type) => {
  const typeLabels = {
    'ONE_TIME': 'One-time Donation',
    'MONTHLY': 'Monthly Recurring Donation',
    'QUARTERLY': 'Quarterly Recurring Donation',
    'YEARLY': 'Yearly Recurring Donation',
  };
  return typeLabels[type] || type;
}; 