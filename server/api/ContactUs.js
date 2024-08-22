const express = require('express');
const router = express.Router();
const Message = require('../model/CustomerMessage');

// import getIo

const { getIo } = require('../socket'); 
console.log("GetIO : ", getIo);

// for saving image

const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Cloudinary configuration

cloudinary.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_apikey,
  api_secret: process.env.cloudinary_secretkey
});

// Use memory storage for uploading files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit



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


// Route to handle replies with an attachment

router.post('/reply/:id', upload.single('file'), async (req, res) => {
  try {
    const { message, sender } = req.body;
    const messageId = req.params.id;

    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    let attachmentUrl = null;

    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${base64Image}`, {
        folder: "customer_enquiry",
        use_filename: true,
      });
      attachmentUrl = result.secure_url;
    }

    const newReply = {
      message: message,
      sender: sender,
      sentAt: new Date(),
      attachment: attachmentUrl, 
    };

    originalMessage.responses.push(newReply);
    await originalMessage.save(); // Save the updated message

    const io = getIo(); // Get the io instance
    io.emit('receiveReply', originalMessage); // Emit the entire updated message

    res.json({ message: 'Reply added successfully', updatedMessage: originalMessage });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
