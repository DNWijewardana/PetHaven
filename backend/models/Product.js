import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    default: 0,
    min: [0, 'Discount price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['FOOD', 'TOYS', 'ACCESSORIES', 'HEALTHCARE', 'GROOMING', 'BEDS', 'TRAINING', 'OTHER']
  },
  petType: {
    type: String,
    required: [true, 'Pet type is required'],
    enum: ['DOG', 'CAT', 'BIRD', 'FISH', 'SMALL_ANIMAL', 'REPTILE', 'ALL']
  },
  brand: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: 'Product image'
    }
  }],
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  inStock: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  seller: {
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: [true, 'Seller information is required']
    },
    name: {
      type: String,
      required: [true, 'Seller name is required']
    },
    email: {
      type: String,
      required: [true, 'Seller email is required']
    },
    phone: {
      type: String
    },
    preferredContactMethod: {
      type: String,
      enum: ['EMAIL', 'PHONE', 'BOTH'],
      default: 'EMAIL'
    }
  },
  isUserListing: {
    type: Boolean,
    default: true
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    review: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numRatings: {
    type: Number,
    default: 0
  },
  requiresPrescription: {
    type: Boolean,
    default: false
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  sku: {
    type: String,
    trim: true
  },
  tags: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: {
      type: String
    },
    city: {
      type: String
    },
    province: {
      type: String
    }
  }
}, { timestamps: true });

// Index for searching products
productSchema.index({ 
  name: 'text', 
  description: 'text',
  brand: 'text',
  tags: 'text'
});

// Geospatial index for location-based queries
productSchema.index({ location: '2dsphere' });

// Middleware to ensure inStock reflects stockQuantity
productSchema.pre('save', function(next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

// Calculate average rating when a rating is added or updated
productSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.numRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.numRatings = this.ratings.length;
  }
  return this.save();
};

const Product = mongoose.model('Product', productSchema);

export default Product; 