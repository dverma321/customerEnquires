// models/CustomerOrderRequest.js
const mongoose = require('mongoose');

const CustomerOrderRequestSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  orderDate: { type: Date, required: true },
  productName: { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  status: { type: String, default: "Pending" },
  userId: { // Reference to User model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserData', // Name of the User model
    required: true 
  },
}, { timestamps: true });

module.exports = mongoose.model('CustomerOrderRequest', CustomerOrderRequestSchema);
