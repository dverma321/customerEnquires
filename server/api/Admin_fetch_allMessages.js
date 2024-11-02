const express = require('express');
const router = express.Router();
const Message = require('../model/CustomerMessage');
const authenticate = require('../middleware/authentication');

// import getIo

const { getIo } = require('../socket'); 

// pagination route for fetching all messages from the all users

router.get('/admin_messages', authenticate ,async (req, res) => {
  try {
    
    const adminEmail = 'divyanshuverma36@gmail.com';
    const { isAdmin } = req.rootUser;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Access denied. No data available for non-admin users.' });
    }
    
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
      imageUrl: msg.imageUrl,
      isHibernate: msg.isHibernate
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

router.post('/send_response_without_gmail/:id', async (req, res) => {
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

    await originalMessage.save();

    const io = getIo(); // Get the io instance
    io.emit('receiveReply', originalMessage); // Emit the entire updated message

    res.json({ message: 'Reply added successfully', updatedMessage: originalMessage });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// message with sending notification to customer

const { sendEmail } = require('./Mailer.js');

router.post('/send_response/:id', async (req, res) => {
  
  try {

    const { message, sender } = req.body;
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

    // Save the updated message
    await originalMessage.save();

    // Get the customer's email from the original message
    const customerEmail = originalMessage.email;
    const customerName = originalMessage.name;

    // Send email to the customer
    const subject = `Response from Admin regarding your inquiry`;
    const text = `Dear ${customerName},\n\nThe admin has responded to your message.\n\nResponse: ${message}`;
    const html = `<p>Dear ${customerName},</p><p>The admin has responded to your message.</p><p><strong>Response:</strong> ${message}</p>`;

    // Use the same sendEmail function to notify the customer
    await sendEmail(process.env.Auth_mail, customerEmail, subject, text, html);

    const io = getIo(); // Get the io instance
    io.emit('receiveReply', originalMessage); // Emit the entire updated message

    res.json({ message: 'Reply added and email sent successfully', updatedMessage: originalMessage });
  } catch (error) {
    console.error('Error adding reply or sending email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to update the isHibernate field
router.patch('/messages/:id/hibernate', authenticate, async (req, res) => {
  try {
    const messageId = req.params.id;

    // Find the message by ID and update isHibernate to true
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { isHibernate: true },
      { new: true }  // Return the updated document
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.status(200).json({ message: 'Message successfully hibernated', updatedMessage });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle isHibernate status
router.put('/admin_messages/:id/toggle_hibernate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.rootUser;

    if (!isAdmin) {
      return res.status(403).json({ message: 'Access denied. Only admins can update messages.' });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    message.isHibernate = false; // Set isHibernate to false
    await message.save();

    res.status(200).json({ message: 'Message is now active.', updatedMessage: message });
  } catch (error) {
    console.error('Error toggling isHibernate:', error);
    res.status(500).json({ message: 'Failed to update message.' });
  }
});


module.exports = router;
