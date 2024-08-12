// server/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const Message = require('../model/CustomerMessage');

// Route to handle sending messages
router.post('/send-message', async (req, res) => {
  const { name, email, orderId, message, platform } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message content is required.' });
  }

  if (!platform) {
    return res.status(402).json({ message: 'Platform is required.' });
  }

  if (!orderId) {
    return res.status(401).json({ message: 'Order ID is required.' });
  }

  try {
    // Save the message to the database
    const newMessage = new Message({
      content: message,
      name,
      email,
      orderId,
      platform,
      receiverEmail: 'divyanshuverma36@gmail.com' // Fixed receiver email
    });

    await newMessage.save();
    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

// server/routes/messageRoutes.js

router.get('/customer_previous_messages', async (req, res) => {
  const { senderEmail } = req.query;

  if (!senderEmail) {
    return res.status(400).json({ message: 'Sender email is required.' });
  }

  try {
    // Decode the senderEmail
    const decodedSenderEmail = decodeURIComponent(senderEmail);

    // Query messages where senderEmail matches and receiverEmail is fixed
    const messages = await Message.find({ 
      email: decodedSenderEmail,
      receiverEmail: "divyanshuverma36@gmail.com"
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});


module.exports = router;
