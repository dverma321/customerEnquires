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
    message.isHibernate = false; // Set isHibernate to false
    await message.save();

    res.status(200).json({ message: 'Ticket closed successfully' });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to handle replies with an attachment

const { sendEmail } = require('./Mailer.js');

router.post('/reply/:id', upload.single('file'), async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debugging: Log the request body

    const { message, sender } = req.body; 
    const messageId = req.params.id;

    // Find the original message
    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    let attachmentUrl = null;

    // Handle file upload if present
    if (req.file) {
      const base64Image = req.file.buffer.toString('base64');
      const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${base64Image}`, {
        folder: "customer_enquiry",
        use_filename: true,
      });
      attachmentUrl = result.secure_url;
    }

    // Create new reply
    const newReply = {
      message: message,
      sender: sender,
      sentAt: new Date(),
      attachment: attachmentUrl, 
    };

    // Update original message with the new reply
    originalMessage.responses.push(newReply);
    originalMessage.isHibernate = false; // Set isHibernate to false
    await originalMessage.save(); // Save the updated message

    // Emit the updated message to connected clients
    const io = getIo(); 
    io.emit('receiveReply', originalMessage); 

    // Fetch necessary details from the original message
    const { name, platform, isHibernate, orderId } = originalMessage;

    // Email details
    const adminEmail = 'divyanshuverma36@gmail.com';
    const subject = `New Reply Received from ${name}`;
    
    // Plain text version of the email
    const emailText = `You have received a new message from ${name}.\n\nPlatform: ${platform}\nIs Hibernate: ${isHibernate}`;

    // HTML version of the email
    const emailHtml = `
      <html>
        <body>
          <h2>New Message Received</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Platform:</strong> ${platform}</p>
          <p><strong>OrderID:</strong> ${orderId}</p>
          <p><strong>Is Hibernate:</strong> ${isHibernate}</p>
          ${attachmentUrl ? `<p><strong>Attachment:</strong> <a href="${attachmentUrl}">View Attachment</a></p>` : ''}
          <hr>
          <p><strong>Message Content:</strong></p>
          <p>${message}</p>
        </body>
      </html>
    `;

    // Send email to the admin with both text and HTML content
    await sendEmail(
      process.env.Auth_mail,      // from email
      adminEmail,                 // to email
      subject,
      emailText,                  // plain text
      emailHtml                   // HTML content
    );

    res.json({ message: 'Reply added successfully and email sent to admin', updatedMessage: originalMessage });
  } catch (error) {
    console.error('Error adding reply or sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
