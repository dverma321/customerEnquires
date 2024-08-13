const express = require('express');
const router = express.Router();
const Message = require('../model/CustomerMessage');

// Route to fetch all resolved messages (closeTicket: true)
router.get('/resolved_messages', async (req, res) => {
  try {
    // Fetch messages where closeTicket is true
    const resolvedMessages = await Message.find({ closeTicket: true }).sort({ createdAt: -1 });

    if (resolvedMessages.length === 0) {
      return res.status(404).json({ message: 'No resolved messages found.' });
    }

    // Return the resolved messages
    res.status(200).json(resolvedMessages);
  } catch (error) {
    console.error('Error fetching resolved messages:', error);
    res.status(500).json({ message: 'Failed to fetch resolved messages.' });
  }
});

module.exports = router;
