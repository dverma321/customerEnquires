const express = require('express');
const router = express.Router();
const Message = require('../model/CustomerMessage');

const multer = require('multer');
const cloudinary = require('cloudinary').v2;


// Cloudinary configuration

cloudinary.config({
    cloud_name: process.env.cloudinary_name,
    api_key: process.env.cloudinary_apikey,
    api_secret: process.env.cloudinary_secretkey
});



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

// Remove Data permanently from both mongoose and cloudinary

router.delete('/remove_message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find the message to get the public ID of the image
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Extract the public ID from the image URL
    const imageUrl = message.imageUrl;
    if (imageUrl) {
      // Extract the public ID by removing the base URL and the file extension
      const publicId = imageUrl
        .split('/')
        .slice(-2)
        .join('/')
        .split('.')[0]; // 'customer_enquiry/zxnjnjvlxufddrpemt9u'

      // Delete the image from Cloudinary if it exists
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete the message from the database
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
