// server/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../model/CustomerMessage');
const authenticate = require('../middleware/authentication');

// pagination route for fetching all messages from the all users

router.get('/admin_messages', async (req, res) => {
  try {
    
    const adminEmail = 'divyanshuverma36@gmail.com';
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 5; // Default to 10 messages per page if not provided
    const skip = (page - 1) * limit; // Calculate how many messages to skip

    // Fetch paginated messages
    
    const messages = await Message.find({ 
      receiverEmail: adminEmail,
      closeTicket: false // Exclude messages where closeTicket is true
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort messages by date descending

    const totalMessages = await Message.countDocuments({ receiverEmail: adminEmail });

    if (messages.length === 0) {
      return res.status(404).json({ message: 'No messages found for the admin.' });
    }

    // Map and group messages by user email, including order ID, platform, and created date
    const groupedMessages = messages.map(msg => ({
      _id: msg._id, 
      name: msg.name,
      email: msg.email,
      orderId: msg.orderId,
      platform: msg.platform,
      content: msg.content,
      createdAt: msg.createdAt,
      responses: msg.responses,
      imageUrl: msg.imageUrl
    }));

    res.status(200).json({
      messages: groupedMessages,
      totalPages: Math.ceil(totalMessages / limit), // Calculate total pages
      currentPage: page // Return current page number
    });
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages for the admin.' });
  }
});

// Send a message response from admin

router.post('/send_response/:id', async (req, res) => {
  try {
    const { message, sender } = req.body; // Ensure you're sending both 'message' and 'sender'
    const messageId = req.params.id;

    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Add the new reply to the responses array
    originalMessage.responses.push({
      message: message,
      sender: sender, // Ensure 'sender' is included in the response object
      sentAt: new Date(),
    });

    // await originalMessage.save();

    res.json({ message: 'Reply added successfully', updatedMessage: originalMessage });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
