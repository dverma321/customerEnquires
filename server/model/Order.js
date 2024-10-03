const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerCity: { type: String },
  customerState: { type: String, required: true },
  orderDate: { type: Date, required: true },  
  productName : {type: String, require: true},
  price: {type: Number, required: true},
  status: { type: String, default: 'pending' }, 
  reimburse: { type: Boolean, default: false }, 
  platform: { type: String, required: true }, 
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
