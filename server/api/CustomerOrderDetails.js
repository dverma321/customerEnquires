const express = require('express');
const router = express.Router();
const CustomerOrderRequest = require('../model/CustomerOrderRequestForm.js');
const authenciate = require('../middleware/authentication.js');

// Fixed URL mappings for different products
const productUrls = {
  'nfs_2005': 'https://mega.nz/folder/0ytSEQCT#V9lYcyeSomM-cq5VqaKE0Q',
  'nfs_mostwanted_2012': 'https://www.mediafire.com/file/ch72gyyo1kston8/Need_for_Speed_-_Most_Wanted-2012.rar/file',
  'nfs_payback': 'https://mega.nz/folder/BYEkkRiC#Ns59_iTJxd6BhMpMfB0FvA',
  'photoshop_cs6': 'https://drive.google.com/drive/folders/1zbzSHbgkRZWyC4RdY032iInwZA-mbudV?usp=sharing',
  'photoshop_cs_2023': 'https://www.mediafire.com/folder/muntdb9p6q4bl/adobe_photoshop_2024',
  'photoshop_element_2025': 'www.snowandwhite.neocities.org',
  'ease_data_recovery': 'https://drive.google.com/drive/folders/19wE751B1LQk0srhLTgx2NTmYPLP0JsWo?usp=drive_link',
  'stellar_data_recovery': 'https://drive.google.com/drive/folders/1LQBhMfl0qU18wic0HOVa5KhN74lTt__z?usp=sharing',
};

// Fixed URLs for WinRAR and Game Fixer
const winRarUrl = 'https://example.com/winrar';
const gameFixerUrl = 'https://www.mediafire.com/file/co9a8naozypyfpy/AIO.zip/file';


// requesting for download page

router.post('/order_request', authenciate, async (req, res) => {
  const loginuserid = req.rootUser._id; // Extract the user ID from the authenticated user

  try {
    const { orderId, productName, customerName, city, state, orderDate, isApproved } = req.body;

    const existingOrderRequest = await CustomerOrderRequest.findOne({ orderId });

    if (existingOrderRequest) {
      return res.status(401).json({ message: 'Order ID already exists' });
    }

    const newOrderRequest = new CustomerOrderRequest({
      orderId,
      productName,
      customerName,
      city,
      state,
      orderDate,
      userId: loginuserid, // Change this to match your schema
      isApproved: isApproved || false,
    });

    // Save the document to the database
    await newOrderRequest.save();

    // Send a success response
    res.status(201).json({ message: 'Order request submitted successfully', order: newOrderRequest });
  } catch (error) {
    console.error('Error submitting order request:', error);
    res.status(500).json({ message: 'Failed to submit order request', error });
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
    const userId = req.rootUser._id; // Assuming user ID is stored in req.rootUser

    // Fetch approved orders for the logged-in user
    const approvedOrders = await CustomerOrderRequest.find({ userId: userId, isApproved: true });

    if (approvedOrders.length === 0) {
      return res.status(404).json({ message: 'No approved orders found.' });
    }

    // Map product URLs and add WinRAR and Game Fixer URLs
    const ordersWithUrls = approvedOrders.map(order => ({
      ...order.toObject(),
      downloadUrl: productUrls[order.productName] || 'URL not found',
      winRarUrl,
      gameFixerUrl
    }));

    console.log("Approved Orders with URLs:", ordersWithUrls);
    res.json(ordersWithUrls);
  } catch (error) {
    console.error('Error fetching approved orders:', error);
    res.status(500).json({ message: 'Failed to fetch approved orders', error });
  }
});




module.exports = router;
