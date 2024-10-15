const express = require('express');
const multer = require('multer');
const router = express.Router();
const Message = require('../model/CustomerMessage');
const cloudinary = require('cloudinary').v2;

const { getIo } = require('../socket'); // Import getIo
console.log("GetIO : ", getIo);


// Cloudinary configuration

cloudinary.config({
    cloud_name: process.env.cloudinary_name,
    api_key: process.env.cloudinary_apikey,
    api_secret: process.env.cloudinary_secretkey
});

// For Posting Images  with Data

// Use memory storage for uploading files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit


// new route first time sending message to admin with io emit

router.post('/send-message-optionalimage_withoutgmail', upload.single('file'), async (req, res) => {
    try {
        const { name, email, orderId, platform, content } = req.body;

        const newMessage = new Message({
            name,
            email,
            orderId,
            platform,
            content,
            receiverEmail: 'divyanshuverma36@gmail.com',
        });

        if (req.file) {
            const base64Image = req.file.buffer.toString('base64');
            const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${base64Image}`, {
                folder: "customer_enquiry",
                use_filename: true,
            });
            newMessage.imageUrl = result.secure_url;
        }

        const savedMessage = await newMessage.save();

        const io = getIo(); // Get the io instance
        console.log("Emitting newMessage event");
        io.emit('newMessage', savedMessage);

        res.status(201).json({
            message: 'Message created and image uploaded to Cloudinary successfully',
            messageData: savedMessage,
        });
    } catch (error) {
        console.error('Error creating message or uploading image to Cloudinary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// sending message with gmail message also

const { sendEmail } = require('./Mailer.js');

router.post('/send-message-optionalimage', upload.single('file'), async (req, res) => {
    console.log('Request received to send message'); // Log the request

    try {
        // Logging the request body to see incoming data
        console.log('Request Body:', req.body);

        const { name, email, orderId, platform, content } = req.body;

        const newMessage = new Message({
            name,
            email,
            orderId,
            platform,
            content,
            receiverEmail: 'divyanshuverma36@gmail.com', // Fixed receiver email
        });

        if (req.file) {
            const base64Image = req.file.buffer.toString('base64');
            const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${base64Image}`, {
                folder: "customer_enquiry",
                use_filename: true,
            });
            newMessage.imageUrl = result.secure_url;
        }

        const savedMessage = await newMessage.save();

        // Send email to the admin
        const subject = `New Message from ${name}`;
        const text = `You have received a new message from ${name}. \nContent: ${content}`;
        const html = `<p>You have received a new message from <strong>${name}</strong>.</p><p>Content: ${content}</p>`;

        // Send the email
        await sendEmail(process.env.Auth_mail, 'divyanshuverma36@gmail.com', subject, text, html);

        const io = getIo(); // Get the io instance
        console.log("Emitting newMessage event");
        io.emit('newMessage', savedMessage);

        res.status(201).json({
            message: 'Message created and image uploaded to Cloudinary successfully',
            messageData: savedMessage,
        });
    } catch (error) {
        console.error('Error creating message or uploading image to Cloudinary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;


