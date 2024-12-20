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
      sender: { type: String, required: true }, // Add sender field
      sentAt: {
        type: Date,
        default: Date.now,
      },
      attachment: String, // Add attachment field to store the file URL
    }
  ],

    closeTicket: { type: Boolean, default: false },
  isHibernate: { type: Boolean, default: false },
  
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
