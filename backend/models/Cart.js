import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
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
    required: true
  },
  prescriptionFile: {
    type: String,
    default: null
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Cart expires after 7 days of inactivity (in seconds)
  }
}, { timestamps: true });

// Pre-save hook to calculate subtotal
cartSchema.pre('save', function(next) {
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  next();
});

// Method to calculate cart totals
cartSchema.methods.calculateTotals = async function() {
  await this.populate('items.product');
  
  let charityAmount = 0;
  
  for (const item of this.items) {
    if (item.product) {
      const itemTotal = item.product.price * item.quantity;
      
      if (item.product.charityPercentage) {
        charityAmount += itemTotal * (item.product.charityPercentage / 100);
      }
    }
  }
  
  return {
    subtotal: this.subtotal,
    charityAmount,
    total: this.subtotal + charityAmount // Tax and shipping will be calculated at checkout
  };
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart; 