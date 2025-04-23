import express from 'express';
import Order from '../models/orderModel.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminAuth from '../middleware/adminAuth.js';
const router = express.Router();

// GET /api/order/userOrders

// GET /api/order/userOrders
router.get('/userOrders', authMiddleware, async (req, res) => {
  try {
    console.log('Authenticated User ID:', req.user.id); // Debug
    
    const orders = await Order.find({ userId: req.user.id })
      .populate({
        path: 'items.productId',
        select: 'name price images description' // Only include necessary fields
      })
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ 
        success: false,
        message: "No orders found"
      });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
});
// GET /api/order/all-orders — Admin route to get all user orders
router.get("/all-orders", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find({})
    .populate({
      path: 'userId',
      select: 'email createdAt' // To show user info
    })
    .populate({
      path: 'items.productId',
      select: 'name price images'
    })
    .sort({ createdAt: -1 });
  
  res.json({ success: true, orders });
  
  } catch (error) {
    console.error("Admin Order fetch error:", error);
    res.status(500).json({ message: "Failed to fetch admin orders" });
  }
});


// POST /api/order/place — Place a new order
// In orderRoutes.js
router.post('/place', async (req, res) => {
  try {
    console.log("Order Request Body:", req.body); // This will log the full request body
    
    const { userId, items, amount, address, paymentMethod } = req.body;
    console.log("Received items:", items); // Log the 'items' part specifically

    // Check if productId exists
    items.forEach(item => {
      console.log('Product ID:', item.productId); // Check each productId
    });

    const order = new Order({
      userId,
      items,
      amount,
      address,
      paymentMethod,
      status: 'Pending',
    });

    await order.save();
    res.status(200).json({ success: true, message: 'Order placed successfully!' });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
  }
});
// router.get('/user-orders', async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.user._id });
//     res.json({ success: true, orders });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Error fetching orders' });
//   }
// });

// Example Express route
router.put('/cancel/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/update-status', adminAuth, async (req, res) => {
  const { orderId, status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status; // Update status (Pending, Shipped, Delivered)
    await order.save();

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating order status' });
  }
});
export default router;
