// server/models/CustomerMessage.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  orderId: String,
  platform: String,
  imageUrl: String,
  content: {
    type: String,
    required: true,
  },
  receiverEmail: {
    type: String,
    default: 'divyanshuverma36@gmail.com' // Fixed receiver email
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  responses: [
    {
      message: String,
      sentAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],

    closeTicket: { type: Boolean, default: false },
  
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
