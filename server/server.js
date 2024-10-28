const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { initSocket } = require('./socket'); // Import initSocket

require('./config/db');

const app = express();
const server = http.createServer(app);

initSocket(server); // Initialize socket.io

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
const order_validation = require("./api/Order_validation.js");
const customer_order_details = require("./api/CustomerOrderDetails.js");

app.use('/user', userRouter);
app.use('/customer_message', message_route);
app.use('/admincontrol', admincontrol_route);
app.use('/resolved', resolved_route);
app.use('/upload-image', image_upload_route);
app.use('/order', order_validation);
app.use('/customer_request', customer_order_details);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
