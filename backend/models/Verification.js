import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  // The pet that's being verified
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  
  // The user who reported finding the pet
  finder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // The user claiming to be the owner
  claimant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Verification method used
  verificationMethod: {
    type: String,
    enum: ['TAG', 'MICROCHIP', 'PHOTO', 'QUESTIONS', 'MANUAL'],
    required: true
  },
  
  // Status of verification
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'REJECTED', 'DISPUTED'],
    default: 'PENDING'
  },
  
  // Verification data
  verificationData: {
    // For tag/microchip verification
    uniqueIdentifier: String,
    
    // For security questions
    questions: [
      {
        question: String,
        expectedAnswer: String,
        providedAnswer: String,
        isCorrect: Boolean
      }
    ],
    
    // For photo verification
    ownerPhotos: [String],
    finderPhotos: [String],
    
    // Admin notes
    adminNotes: String
  },
  
  // Chat history between finder and claimant
  chatHistory: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      message: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  
  // If there was a dispute, this will contain the reason
  disputeReason: String,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Expiry time for verification (temporary chat will be disabled after this)
  expiresAt: {
    type: Date,
    default: function() {
      // Default to 7 days from creation
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }
  }
});

// Update the updatedAt timestamp before saving
verificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a compound index to ensure unique verification attempts
verificationSchema.index({ pet: 1, claimant: 1 }, { unique: true });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification; 