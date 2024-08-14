const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');

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

  socket.on('join', ({ userId }) => {
    users[userId] = socket.id;
    console.log(`User ${userId} connected`);
  });

  socket.on('sendMessage', async ({ senderId, receiverId, message }) => {
    const receiverSocket = users[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit('receiveMessage', { senderId, message });
    }

    // Save the message to the database
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
  });

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
