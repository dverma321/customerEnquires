const express = require('express');
const router = express.Router();
const CustomerOrderRequest = require('../model/CustomerOrderRequestForm.js');
const authenciate = require('../middleware/authentication.js');
const products = require('./productData.js');
const { getIo } = require('../socket'); // Import getIo

// Fixed URLs for WinRAR and Game Fixer
const winRarUrl = 'https://www.win-rar.com/fileadmin/winrar-versions/winrar/winrar-x64-701.exe';
const gameFixerUrl = 'https://www.mediafire.com/file/co9a8naozypyfpy/AIO.zip/file';

// requesting for download page

const { v4: uuidv4 } = require('uuid');

// Post route to submit an order request
router.post('/order_request', authenciate, async (req, res) => {
  const { orderType, customerName, city, state, productName, isApproved } = req.body;

  if (!orderType || !customerName || !city || !state || !productName) {
    return res.status(400).json({ message: 'Please enter all the required details.' });
  }

  const loginId = req.rootUser._id;

  try {
    let orderId = req.body.orderId;
    let orderDate = req.body.orderDate;

    // Generate a unique order ID and set the current date for new purchases
    if (orderType === 'new') {
      orderId = uuidv4();
      orderDate = new Date();
    }

    // Check if the order ID already exists
    const existingOrder = await CustomerOrderRequest.findOne({ orderId });
    if (existingOrder) {
      return res.status(409).json({ message: 'Request ID already exists. Please wait for approval.' });
    }

    // Create a new order request document
    const newOrder = new CustomerOrderRequest({
      orderId,
      customerName,
      city,
      state,
      productName,
      orderDate,
      orderType,
      isApproved,
      userId: loginId,
      status: 'Pending',
    });

    await newOrder.save();

    // Emit the new order request to all connected clients
    const io = getIo(); // Get your Socket.IO instance
    io.emit('orderRequestCreated', newOrder); // Emit event with the new order request

    res.status(201).json({ message: 'Order request submitted successfully.', order: newOrder });
  } catch (error) {
    console.error('Error submitting order request:', error);
    res.status(500).json({ message: 'Failed to submit order request. Please try again later.' });
  }
});


// Fetch all order requests
router.get('/allrequests', authenciate, async (req, res) => {
  const { isAdmin } = req.rootUser;

  if (!isAdmin) {
    return res.status(403).json({ message: 'Access denied. No data available for non-admin users.' });
  }

  try {
    const orderRequests = await CustomerOrderRequest.find(); // Fetch all documents

    res.json(orderRequests); // Send the retrieved documents as the response
  } catch (error) {
    console.error('Error fetching order requests:', error);
    res.status(500).json({ message: 'Failed to fetch order requests', error });
  }
});

// approve order request
router.put('/order_request/approve/:id', authenciate, async (req, res) => {
  const { isAdmin } = req.rootUser;

  if (!isAdmin) {
    return res.status(403).json({ message: 'Access denied. No data available for non-admin users.' });
  }

  try {
    const { id } = req.params;

    const updatedRequest = await CustomerOrderRequest.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true } // return the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    // Emit event when order is approved
    const io = getIo();
    io.emit('orderApproved', { orderRequest: updatedRequest });

    res.json({ message: 'Order request approved successfully', orderRequest: updatedRequest });
  } catch (error) {
    console.error('Error approving order request:', error);
    res.status(500).json({ message: 'Failed to approve order request', error });
  }
});


// reject order request

router.put('/order_request/reject/:id', authenciate, async (req, res) => {

  const { isAdmin } = req.rootUser;

  if (!isAdmin) {
    return res.status(403).json({ message: 'Access denied. No data available for non-admin users.' });
  }

  try {
    const { id } = req.params;

    const updatedRequest = await CustomerOrderRequest.findByIdAndUpdate(
      id,
      { isApproved: false, status: 'Rejected' },
      { new: true } // return the updated document
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    res.json({ message: 'Order request rejected successfully', orderRequest: updatedRequest });
  } catch (error) {
    console.error('Error rejecting order request:', error);
    res.status(500).json({ message: 'Failed to reject order request', error });
  }
});

// Fetch all approved orders for the logged-in user

router.get('/my_orders', authenciate, async (req, res) => {
  try {
    const userId = req.rootUser._id;

    // Fetch approved orders for the logged-in user
    const approvedOrders = await CustomerOrderRequest.find({ userId: userId, isApproved: true });

    if (approvedOrders.length === 0) {
      return res.status(404).json({ message: 'No approved orders found.' });
    }

    // Map product data with URLs, images, and version info
    const ordersWithUrls = approvedOrders.map(order => {
      const productData = products.find(product => product.productName === order.productName);
      return {
        ...order.toObject(),
        downloadUrl: productData ? productData.downloadUrl : 'URL not found',
        images: productData ? productData.images : [],
        version: productData ? productData.version : 'Unknown',
        winRarUrl,
        gameFixerUrl
      };
    });

    console.log("Approved Orders with URLs:", ordersWithUrls);
    res.json(ordersWithUrls);
  } catch (error) {
    console.error('Error fetching approved orders:', error);
    res.status(500).json({ message: 'Failed to fetch approved orders', error });
  }
});

// DELETE route to remove an order request by ID
router.delete('/order_request/delete/:id', authenciate, async (req, res) => {
  try {
    const { id } = req.params;

    const { isAdmin } = req.rootUser;

    if (!isAdmin) {
      return res.status(403).json({ message: 'Access denied. No data available for non-admin users.' });
    }

    // Find the order request by ID and delete it
    const deletedRequest = await CustomerOrderRequest.findByIdAndDelete(id);

    // Check if the request was found and deleted
    if (!deletedRequest) {
      return res.status(404).json({ message: 'Order request not found' });
    }

    // Respond with a success message
    res.status(200).json({ message: 'Order request deleted successfully' });
  } catch (error) {
    console.error('Error deleting order request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
