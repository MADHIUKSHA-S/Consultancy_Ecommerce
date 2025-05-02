import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Make sure it matches the exported model name
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Make sure it matches the exported model name
        required: true
      },
      quantity: { type: Number, required: true }
    }
  ],
  
  amount: {
    type: Number,
    required: true,
  },
  address: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'] 
    },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipcode: { type: String, required: true },
    country: { type: String, required: true },
    phone: {
      type: String,
      required: true,
      match: [/^\+?\d{10,15}$/, 'Please enter a valid phone number.']
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'Shipped', 'Delivered', 'cancelled', 'Paid'], // Add whatever statuses you plan
    default: 'Pending',
  }
,  
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
