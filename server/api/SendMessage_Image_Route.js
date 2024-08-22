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


