const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const MessageModel = require('./model/CustomerMessage.js');

require('./config/db');
// require('./model/InsertUsers.js'); // just use for inserting users manaually

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'https://customerenquiries.netlify.app',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
  }
});

const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://customerenquiries.netlify.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(cookieParser());

const userRouter = require('./api/User');

const message_route = require('./api/ContactUs.js');
const admincontrol_route = require('./api/Admin_fetch_allMessages.js');
const resolved_route = require("./api/Resolved_ticket_Route.js");
const image_upload_route = require("./api/SendMessage_Image_Route.js");


app.use('/user', userRouter);
app.use('/customer_message', message_route);
app.use('/admincontrol', admincontrol_route);
app.use('/resolved', resolved_route);
app.use('/upload-image', image_upload_route);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

let users = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  // Handle user joining
  socket.on('join', ({ userId }) => {
    users[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  });

  // Handle sending a message
  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    try {
      const newMessage = new MessageModel({
        sender: senderId,
        receiver: receiverId,
        content: message,
        createdAt: new Date(),
      });
      await newMessage.save();

      // Emit the message to all connected clients, including admin
      io.emit('receiveMessage', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('sendReply', async ({ messageId, message, sender }) => {
    console.log(`sendReply called for messageId: ${messageId}, message: ${message}, sender: ${sender}, socket ID: ${socket.id}`);
    
    try {
      const originalMessage = await MessageModel.findById(messageId);
      if (!originalMessage) {
        console.error('Message not found');
        return;
      }
  
      console.log('Original message found, adding reply');
      originalMessage.responses.push({
        message: message,
        sender: sender,
        sentAt: new Date(),
      });
  
      await originalMessage.save();
      console.log('Reply saved successfully');
  
      // Emit to the specific receiver socket if applicable
      io.emit('receiveReply', originalMessage);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  });



  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    Object.keys(users).forEach((userId) => {
      if (users[userId] === socket.id) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
      }
    });
  });
});


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
