const express = require('express');
const multer = require('multer');
const router = express.Router();
const Message = require('../model/CustomerMessage');
const cloudinary = require('cloudinary').v2;


// Cloudinary configuration

cloudinary.config({
    cloud_name: process.env.cloudinary_name,
    api_key: process.env.cloudinary_apikey,
    api_secret: process.env.cloudinary_secretkey
});

// For Posting Images  with Data

// Use memory storage for uploading files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 2MB limit

// routes/send_message_content_route.js

router.post('/send-message-optionalimage', upload.single('file'), async (req, res) => {
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


