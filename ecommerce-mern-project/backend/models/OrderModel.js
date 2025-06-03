const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: false }, // URL or path to product image at time of order
  price: { type: Number, required: true },   // Price of one unit at time of order
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'Product' 
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
      ref: 'User' 
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    paymentMethod: { 
      type: String, 
      required: true 
    },
    paymentResult: {
      id: { type: String },          // Transaction ID from payment gateway
      status: { type: String },      // e.g., 'COMPLETED', 'PENDING'
      update_time: { type: String }, // Timestamp from payment gateway
      email_address: { type: String } // Payer's email from payment gateway
    },
    itemsPrice: { 
      type: Number, 
      required: true, 
      default: 0.0 
    }, // Sum of (item.price * item.qty)
    taxPrice: { 
      type: Number, 
      required: true, 
      default: 0.0 
    },
    shippingPrice: { 
      type: Number, 
      required: true, 
      default: 0.0 
    },
    totalPrice: { 
      type: Number, 
      required: true, 
      default: 0.0 
    }, // itemsPrice + taxPrice + shippingPrice
    isPaid: { 
      type: Boolean, 
      required: true, 
      default: false 
    },
    paidAt: { 
      type: Date 
    },
    isDelivered: { 
      type: Boolean, 
      required: true, 
      default: false 
    },
    deliveredAt: { 
      type: Date 
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt timestamps
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
