const express = require('express');
const router = express.Router();
const Message = require('../model/CustomerMessage');


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
      receiverEmail: "divyanshuverma36@gmail.com",
      closeTicket: false // Exclude messages where closeTicket is true
    });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

// handle close ticket route

router.patch('/close_ticket/:id', async (req, res) => {
  try {
    const messageId = req.params.id;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    message.closeTicket = true; // Set closeTicket to true
    await message.save();

    res.status(200).json({ message: 'Ticket closed successfully' });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
