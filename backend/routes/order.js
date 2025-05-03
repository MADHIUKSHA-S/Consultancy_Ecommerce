import express from 'express';
import Order from '../models/orderModel.js';
import authMiddleware from '../middleware/authMiddleware.js';
import adminAuth from '../middleware/adminAuth.js';
const router = express.Router();
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// Razorpay instance initialization
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log('Razorpay Keys:', process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET);

// POST /api/order/payment-success — Handle Razorpay payment success
router.post('/payment-success', async (req, res) => {
  try {
    const { orderId, paymentDetails } = req.body;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${paymentDetails.razorpay_order_id}|${paymentDetails.razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature === paymentDetails.razorpay_signature) {
      order.status = 'Paid';
      await order.save();

      return res.status(200).json({ success: true, message: 'Payment verified and order updated.' });
    }

    return res.status(400).json({ success: false, message: 'Payment verification failed' });
  } catch (error) {
    console.error('Payment success error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
  }
});

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
router.post('/place', authMiddleware, async (req, res) => {
  try {
    const { items, amount, address, paymentMethod } = req.body;
    const userId = req.user.id;
console.log(amount);
    const order = new Order({
      userId,
      items,
      amount,
      address,
      paymentMethod,
      status: 'Pending',
    });

    await order.save();

    if (paymentMethod === 'razorpay') {
      try {
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: amount * 100, // in paise
          currency: 'INR',
          receipt: `order_${order._id}`,
          payment_capture: 1,
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(200).json({
          success: true,
          message: 'Order placed successfully!',
          order: {
            _id: order._id,
            amount:amount,
            razorpayOrderId: razorpayOrder.id,
          },
        });
      } catch (razorpayError) {
        console.error('Razorpay order creation error:', razorpayError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create Razorpay order',
          error: razorpayError.message,
        });
      }
    }

    res.status(200).json({ success: true, message: 'Order placed successfully!' });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order', error: error.message });
  }
});


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
// adjust path as needed

// DELETE /api/order/item/:orderId/:productId
router.delete('/item/:orderId/:productId', authMiddleware, async (req, res) => {
  const { orderId, productId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Filter out the item
    order.items = order.items.filter(item => item.productId.toString() !== productId);
    
    // If all items are deleted, you can optionally delete the whole order
    if (order.items.length === 0) {
      await Order.findByIdAndDelete(orderId);
      return res.json({ message: 'Item deleted. Order was empty and removed.' });
    }

    await order.save();
    res.json({ message: 'Order item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Failed to delete item' });
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
