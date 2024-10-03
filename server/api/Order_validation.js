const express = require('express');
const router = express.Router();
const Order = require('../model/Order');

// checking order id is correct or not

router.get('/check-order/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    // Fetch the order including all fields
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(401).json({ valid: false, message: 'Invalid Order ID' });
    }

    return res.status(200).json({ valid: true, order });
  } catch (error) {
    console.error('Error checking order ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// entry for the new order

router.post('/order-entry', async (req, res) => {
  const { orderId, customerName, customerCity, customerState, orderDate, productName, price, platform, reimburse = false } = req.body;

  if (!orderId || !customerName || !customerState || !orderDate || !productName || !price || !platform) {
    return res.status(400).json({ error: 'All fields are required' });
  }

    try {

       // Check if orderId already exists
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res.status(401).json({ error: 'Order ID already exists' });
    }


    const newOrder = new Order({
      orderId,
      customerName,
      customerCity,
      customerState,
      orderDate,
      productName,
      price,
      platform,      
      reimburse
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order successfully added' });
  } catch (err) {
    console.error('Error adding order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// update the status

router.put('/update-order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status, reimburse } = req.body;

  if (!status || typeof reimburse !== 'boolean') {
      return res.status(400).json({ error: 'Status and reimbursement are required' });
  }

  try {
      const updatedOrder = await Order.findOneAndUpdate(
          { orderId },
          { status, reimburse },
          { new: true }
      );

      if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }

      res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (err) {
      console.error('Error updating order:', err);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// status for the order

router.get('/check-status/:status', async (req, res) => {
  const { status } = req.params;
  const { startDate, endDate } = req.query; // Get date range from query params

  try {
    let query = { status }; // Start with status filter

    if (startDate && endDate) {
      // Convert dates to ISO format for MongoDB queries
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1); // Include the end date in the filter

      query.orderDate = { $gte: start, $lt: end };
    }

    const orders = await Order.find(query); // Query the database
    res.json({ orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});



module.exports = router;
