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




// For Getting Images

router.get('/cloudinaryImageData', async (req, res) => {
    try {
        const userId = req.rootUser._id; // Get the authenticated user's ID
        const user = await Message.findOne({ _id: userId });

        if (!user) {
            return res.status(404).json({
                status: 'FAILED',
                message: 'User not found',
            });
        }

        // Assuming user.imageUrl contains the Cloudinary URL of the image
        const imageUrl = user.imageUrl; // Replace with the actual field that stores the Cloudinary URL in your user document

        if (!imageUrl) {
            return res.status(404).json({ error: 'Image URL not found in user data' });
        }

        // Send the Cloudinary image URL as a response
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// For Posting Images  

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


