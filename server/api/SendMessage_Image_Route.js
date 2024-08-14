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
const upload = multer({ storage: storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB limit


router.post('/send-message-optionalimage', upload.single('file'), async (req, res) => {
    try {
        const { name, email, orderId, platform, content } = req.body;

        // Step 1: Initialize a new message object

        const newMessage = new Message({
            name,
            email,
            orderId,
            platform,
            content,
            receiverEmail: 'divyanshuverma36@gmail.com', // Set the fixed receiver email
        });


        // Step 2: If a file is uploaded, process and upload it to Cloudinary
        if (req.file) {
            // Convert the Buffer to base64 string
            const base64Image = req.file.buffer.toString('base64');

            const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${base64Image}`, {
                folder: "customer_enquiry", // Specify the folder in Cloudinary
                use_filename: true, // Use the original filename
            });

            // Attach the Cloudinary image URL to the message object
            newMessage.imageUrl = result.secure_url;
        }

        // Step 3: Save the message to the database
        const savedMessage = await newMessage.save();

        // Step 4: Return the response with the saved message data
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


