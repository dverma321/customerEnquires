// server/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../model/CustomerMessage');

// Route to get all messages for the admin

router.get('/admin_messages_withoutPagination', async (req, res) => {
  try {
    // Fetch all messages where receiverEmail matches admin's email
    const adminEmail = 'divyanshuverma36@gmail.com';
    const messages = await Message.find({ receiverEmail: adminEmail });

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
      responses: msg.responses
    }));

    res.status(200).json(groupedMessages);
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages for the admin.' });
  }
});

// pagination route for fetching all messages from the all users

router.get('/admin_messages', async (req, res) => {
  try {
    const adminEmail = 'divyanshuverma36@gmail.com';
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 5; // Default to 10 messages per page if not provided
    const skip = (page - 1) * limit; // Calculate how many messages to skip

    // Fetch paginated messages
    const messages = await Message.find({ receiverEmail: adminEmail })
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
      responses: msg.responses
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
    const messageId = req.params.id;
    const { responseMessage } = req.body;

    const message = await Message.findById(messageId);
        
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.responses.push({ message: responseMessage });
    await message.save();

    res.status(200).json({ message: 'Response sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to remove a message

router.delete('/remove_message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await Message.findByIdAndDelete(messageId);

    if (!result) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({ message: 'Message removed successfully' });
  } catch (error) {
    console.error('Error removing message:', error);
    res.status(500).json({ error: 'Error removing message' });
  }
});

module.exports = router;
