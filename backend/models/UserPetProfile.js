import mongoose from 'mongoose';

const vaccineRecordSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const petProfileSchema = new mongoose.Schema({
  userId: {
    type: String, // Auth0 user ID (sub)
    required: true,
    index: true
  },
  petName: {
    type: String,
    required: true
  },
  petType: {
    type: String,
    required: true,
    enum: ['DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER']
  },
  breed: {
    type: String
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'UNKNOWN']
  },
  color: {
    type: String
  },
  weight: {
    type: Number
  },
  microchipId: {
    type: String
  },
  profileImage: {
    type: String
  },
  additionalImages: [{
    type: String
  }],
  source: {
    type: String,
    enum: ['ADOPTED', 'LOST_FOUND', 'PERSONAL'],
    required: true
  },
  sourceReference: {
    // Reference to original report or adoption listing if applicable
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceModel'
  },
  sourceModel: {
    // Model name for the reference (Report or Pet)
    type: String,
    enum: ['Report', 'Pet']
  },
  notes: {
    type: String
  },
  medicalInfo: {
    type: String
  },
  vaccines: [vaccineRecordSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
petProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a compound index for faster lookups by userId + isActive
petProfileSchema.index({ userId: 1, isActive: 1 });

const UserPetProfile = mongoose.model('UserPetProfile', petProfileSchema);
export default UserPetProfile; 