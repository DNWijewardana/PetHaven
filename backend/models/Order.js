import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  prescriptionFile: {
    type: String,
    default: null
  },
  prescriptionVerified: {
    type: Boolean,
    default: false
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  items: [orderItemSchema],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['STRIPE', 'PAYPAL']
  },
  paymentId: {
    type: String,
    required: true
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  charityAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  },
  trackingNumber: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Calculate totals before saving
orderSchema.pre('save', function(next) {
  // Calculate subtotal and charity amount
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate total including shipping and tax
  this.total = this.subtotal + this.shippingCost + this.tax;
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order; 