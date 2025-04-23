import express from 'express';
import { addToCart, getCart, updateCart } from '../controllers/cartController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/add', authMiddleware, addToCart);
router.post('/update', authMiddleware, updateCart);
router.get('/get', authMiddleware, getCart); // <-- this line is the fix

export default router;
