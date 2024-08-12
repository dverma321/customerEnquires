const express = require('express')
const bcrypt = require('bcrypt')
const path = require('path');  // Add this line to import the 'path' module
const jwt = require('jsonwebtoken'); // Import jsonwebtoken
const moment = require('moment'); // for Date Format
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
// const tf = require('@tensorflow/tfjs-node');
// const cocoSsd = require('@tensorflow-models/coco-ssd');
const sharp = require('sharp');

const authenticate = require('../middleware/authentication');

const router = express.Router()

// router.use(cors(
//     {
//         origin:"https://findyourperfectmatch.netlify.app",
//         methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
//         credentials: true, // set the cookie true
//         optionsSuccessStatus: 204     // Respond with a 204 status code for preflight requests
//     }
// ));

//getting User 

const User = require('../model/User')


// email handler

const nodemailer = require('nodemailer')

// unique string

const { v4: uuidv4 } = require('uuid')

// .env variable

require('dotenv').config()

// signup route 

router.post('/signup', async (req, res, next) => {
  try {
    // Extract user data from request body
    const { name, email, password, confirmPassword } = req.body.user;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ status: "400", message: 'Please fill all the fields' });
    }

    if (password !== confirmPassword) {
      return res.json({ status: "403", message: 'Passwords do not match' });
    }

    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(402).json({ status: '402', message: 'Email already exists' });
    }

    // Set isAdmin to true for specific emails
    const adminEmails = ['divyanshuverma36@gmail.com', 'divyanshu8verma@gmail.com', 'vermaenterprises@gmail.com'];
    const isAdmin = adminEmails.includes(email);

    // Hash the password before saving it
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user object with a timestamp
    const timestamp = new Date();

    // Create a new user object
    const newUser = new User({
      name,
      email,
      password: hashedPassword,  // Use the hashed password here
      confirmPassword: hashedPassword,  // Hash confirmPassword as well for storage (or remove it from schema)
      createdAt: timestamp,
      isAdmin
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Login after successful signup
    if (savedUser) {
      const token = await savedUser.generateAuthToken();  // Generate the token
      console.log("Retrieve Token from database: ", token);

      // Store the token in the cookie
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + 25892000000),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
        credentials: 'include'
      });

      // Send success response
      res.status(200).json({ status: "200", message: 'User registered successfully', token, userId: savedUser._id });

    } else {
      res.status(500).json({ status: "500", message: 'Email not registered' });
    }

  } catch (error) {
    // Log and send error response
    console.error('Error during registration:', error);
    res.status(500).json({ status: 'FAILED', message: 'Internal server error' });
  }
});

// login route

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "FAILED",
      message: "Email and password are required."
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: "FAILED",
        message: " Email is not registered."
      });
    }

  
      // Compare the provided password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(403).json({
          status: "FAILED",
          message: "Invalid credentials."
        });
      }

    // Generating Token after login

    const token = await user.generateAuthToken();
    console.log("Retrieve Token from database: ", token);

    // storing token in the cookie

    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 25892000000),
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      credentials: 'include'
    });


    res.status(200).json({
      status: "SUCCESS",
      message: "Login successful.",
      token,
      userId: user._id
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      status: "FAILED",
      message: "An error occurred during login."
    });
  }
});

// Logout route

router.get('/logout', (req, res) => {
  // Simply clear the token on the client side
  res.clearCookie('jwtoken', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    credentials: 'include'
  })
  req.rootUser = null;
  console.log("user logout successfully...");

  res.json({
    status: "SUCCESS",
    message: "Logout Successful"
  });
});


// getData route


router.get("/getData", authenticate, async (req, res) => {
  try {
    console.log("/getData route has been called");

    // Accessing rootUser from the request object
    const rootUser = req.rootUser;

    res.send(rootUser);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Something went wrong while fetching data');
  }
});

// all users route

router.get('/users', async (req, res) => {
  try {
    const users = await User.find(); // Query all users from the User collection

    res.json(users); // Send the users data as a JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Something went wrong while fetching users' });
  }
});


// fetching usersImage.js

const { truncate } = require('fs');

// upload-image working

router.post('/upload-image', authenticate, async (req, res) => {
  try {
    const { base64 } = req.body;
    const userId = req.rootUser._id; // get the authenticated id from the jwtoken if user is login

    // Find the user by ID and update their image
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "User not found"
      });
    }

    // Update the user's image in the database
    user.image = base64;
    await user.save();

    res.json({
      status: "OK",
      message: "Image saved successfully"
    });


  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "FAILED",
      message: "Failed to save image"
    });
  }
});


router.get('/get-image', authenticate, async (req, res) => {
  try {
    const userId = req.rootUser._id; // Get the user ID from the authenticated user

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user || !user.image) {
      return res.status(404).json({
        status: "FAILED",
        message: "User not found or no image found for the user"
      });
    }

    // Send the image data in the response
    res.status(200).json({
      status: "SUCCESS",
      message: "Image read successfully",
      data: user.image
    });
  } catch (err) {
    console.log("Error while reading image:", err);
    res.status(500).json({
      status: "FAILED",
      message: "Error while reading image"
    });
  }
});



// getting multer image testing

router.get('/multerImageData', authenticate, async (req, res) => {
  try {


    const userId = req.rootUser._id; // get the authenticated id from the jwtoken if user is login

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        status: "FAILED",
        message: "User not found"
      });
    }

    const imagePath = path.join(__dirname, '..', 'uploads', user.imageData); // Assuming 'uploads' directory

    // error handling if image is not found

    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).json({ error: 'Image not found' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// For posting/uploading image on cloudinary 

const cloudinary = require('cloudinary').v2;


// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.cloudinary_name,
  api_key: process.env.cloudinary_apikey,
  api_secret: process.env.cloudinary_secretkey
});

// Use memory storage for uploading files
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/cloudinaryUpload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert the Buffer to base64 string
    const base64Image = req.file.buffer.toString('base64');

    // Get the public ID of the previous image from the user's profile
    const user = await User.findById(req.rootUser._id);
    const previousImagePublicId = user.imageUrl ? `shaddi/${user.imageUrl.split('/').pop().split('.')[0]}` : null;
    console.log("Previous Image : ", previousImagePublicId);

    // Delete the previous image if it exists
    if (previousImagePublicId) {
      try {
        const deletionResult = await cloudinary.uploader.destroy(previousImagePublicId);
        console.log('Deletion result:', deletionResult);
      } catch (deletionError) {
        console.error('Error deleting previous image from Cloudinary:', deletionError);
        // Handle the deletion error as needed
      }
    }


    const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${base64Image}`, {
      folder: 'shaddi', // Specify the folder in Cloudinary
      use_filename: true, // Use the original filename
    });

    // Save the imageUrl to the User model
    const updatedUser = await User.findByIdAndUpdate(
      req.rootUser._id, // Assuming req.rootUser contains the authenticated user's ID
      { imageUrl: result.secure_url }, // Update imageUrl with the Cloudinary URL
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(201).json({ message: 'Image uploaded to Cloudinary and saved to database successfully', imageUrl: result.secure_url });
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// forgot password working

router.post('/forgot-password', (req, res)=> {

  const {email} = req.body;

  User.findOne({email})
  .then(user => {
    if(!user)
      {
        return res.send({Status: "User Email is not present"})
      }
    const token = jwt.sign({id:user._id}, "JWT_SECRET", {expiresIn: "1d"}) // payload , secret_key, optional

    // using nodemailer to send email

    var transporter = nodemailer.createTransport({ 
      service: 'gmail',
      auth: {
        user: process.env.Auth_mail,
        pass: process.env.Email_pass
      }
    });
    
    var mailOptions = {
      from: process.env.Auth_mail,
      to: email,
      subject: 'Reset your password',
      text: `http://localhost:5173/reset-password/${user._id}/${token}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        return res.send({Status:"Success"})
      }
    });

  })
  .catch((err) => {
    console.log('Error while using forgetting password...', err)
  })
} )

// reset password working

router.post('/reset-password/:id/:token', (req, res) => {

  const {password} = req.body;
  const {id, token} = req.params; // getting it from url

  jwt.verify(token, "JWT_SECRET", (err, decoded) => {

    if(err)
      {
        return res.json({Status:'Error with token'})
      }
    else{
      bcrypt.hash(password, 10)
      .then(hash => {
        User.findByIdAndUpdate({_id:id}, {password:hash})
        .then(u => {
          res.send({Status:"Success"})

        })
        .catch(err => {
          res.send({Status:'Error'})
        })
      })
      .catch(err => {
        console.log("Internal Server Error while resetting the password")
      })
    }

  } )

  
})




module.exports = router
