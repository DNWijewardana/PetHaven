import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['LOST', 'FOUND', 'INJURED'],
    required: true
  },
  animalType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  images: [{
    type: String, // URLs to stored images
    required: true
  }],
  contactInfo: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RESOLVED', 'DELETED'],
    default: 'ACTIVE'
  },
  createdBy: {
    type: String, // Auth0 user ID (sub)
    index: true
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

// Create a 2dsphere index for geospatial queries
reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model('Report', reportSchema);
export default Report; 