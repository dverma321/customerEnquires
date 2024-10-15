const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service (e.g., Gmail, Outlook, etc.)
    auth: {
        user: process.env.Auth_mail, // Your email address from .env
        pass: process.env.Email_pass, // Your email password (or app password if 2FA is enabled)
    },
});

// Function to send an email
const sendEmail = async (from, to, subject, text, html) => {
    console.log(`Sending email from ${from} to ${to}`); // Log the email details
    
    const mailOptions = {
        from,
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response); // Log the response from the email service
        return info; // Optionally return the info for further use if needed
    } catch (error) {
        console.error('Error sending email: ', error); // Log any errors that occur
        throw new Error('Failed to send email'); // Throw an error to be handled upstream
    }
};

module.exports = { sendEmail };
