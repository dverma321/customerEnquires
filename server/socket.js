const socketIo = require('socket.io');
const MessageModel = require('./model/CustomerMessage');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: ''https://customerenquiries.netlify.app',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 204
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', ({ userId }) => {
      console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    });      

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIo };
