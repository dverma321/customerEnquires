const express = require('express');
const router = express.Router();
const Message = require('../model/CustomerMessage');
const authenticate = require('../middleware/authentication');


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

    // Find the message to get the public ID of the image and attachments
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Delete the main image if it exists
    const mainImageUrl = message.imageUrl;
    if (mainImageUrl) {
      const mainImagePublicId = mainImageUrl
        .split('/')
        .slice(-2)
        .join('/')
        .split('.')[0]; // Extract public ID
      await cloudinary.uploader.destroy(mainImagePublicId);
    }

    // Delete all attachments in the responses
    const responseAttachments = message.responses.map(response => response.attachment).filter(attachment => attachment);

    for (const url of responseAttachments) {
      const publicId = url
        .split('/')
        .slice(-2)
        .join('/')
        .split('.')[0]; // Extract public ID
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
