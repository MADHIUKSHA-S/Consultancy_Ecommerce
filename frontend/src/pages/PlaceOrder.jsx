import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
const razorkey=import.meta.env.VITE_RAZORPAY_KEY_ID;
const PlaceOrder = () => {
  const navigate = useNavigate();
  const { backendUrl, token, cartItems, setCartItems, products, getCartAmount ,fetchUserCart} = useContext(ShopContext);

  const [userId, setUserId] = useState(null);
  const [method, setMethod] = useState('cod');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  useEffect(() => {
    const localToken = localStorage.getItem('token');
    if (localToken) {
      try {
        const decoded = jwtDecode(localToken);
        setUserId(decoded.id);
      } catch (error) {
        toast.error('Invalid token, please login again.');
        navigate('/login');
      }
    } else {
      toast.error('You must be logged in to place an order.');
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Import Razorpay SDK

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
  
    if (Object.keys(cartItems).length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
  
    const orderItems = Object.keys(cartItems).map((id) => {
      const product = products.find((p) => p._id === id);
      if (product && cartItems[id] > 0) {
        return { productId: product._id, quantity: cartItems[id] };
      }
      return null;
    }).filter(Boolean);
  
    if (orderItems.length === 0) {
      toast.error('No valid products in cart.');
      return;
    }
  
    const orderData = {
      userId,
      address: formData,
      items: orderItems,
      amount: getCartAmount(),
      paymentMethod: method,
    };
  
    try {
      const response = await axios.post(`${backendUrl}/api/order/place`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data?.success && method === 'razorpay') {
        const { razorpayOrderId, amount } = response.data.order;
  
        const options = {
          key: razorkey, // Or directly use your Razorpay key
          amount: amount  * 100, // Amount in paise (already multiplied? verify this once)
          currency: 'INR',
          order_id: razorpayOrderId,
          handler: async function (paymentResult) {
            const paymentData = {
              orderId: response.data.order._id,   // very important to send backend order ID
              paymentDetails: {
                razorpay_payment_id: paymentResult.razorpay_payment_id,
                razorpay_order_id: paymentResult.razorpay_order_id,
                razorpay_signature: paymentResult.razorpay_signature,
              },
            };
  
            await axios.post(`${backendUrl}/api/order/payment-success`, paymentData, {
              headers: { Authorization: `Bearer ${token}` }
            });
  
            toast.success('Order placed successfully!');
            setCartItems(() => {
              const cleared = {};
              localStorage.setItem('cartItems', JSON.stringify(cleared));
              return cleared;
            });
             // Clear localStorageawait fetchUserCart();
            fetchUserCart(); // Fetch updated cart data
           
            navigate('/orders');
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          notes: {
            address: formData.street,
          },
          theme: {
            color: '#F37254',
          },
          method: {
            upi: true,  // ✅ This enables GPay & other UPI apps
            card: true,
            netbanking: true,
            wallet: true,
          }
        };
  
        const rzp = new window.Razorpay(options);
        rzp.open();
        
      } else if (response.data?.success && method === 'cod') {
        toast.success('Order placed successfully!');
        setCartItems(() => {
          const cleared = {};
          localStorage.setItem('cartItems', JSON.stringify(cleared));
          return cleared;
        });
         // Clear localStorage
fetchUserCart(); // Fetch updated cart data
        navigate('/orders');
      
      } else {
        toast.error(response.data.message || 'Order placement failed.');
      }
    } catch (error) {
      console.error('Order Error:', error);
      toast.error(error.response?.data?.message || 'Error placing order.');
    }
  };
    

  return (
    <form onSubmit={handlePlaceOrder} className="flex flex-col sm:flex-row gap-4 pt-8 min-h-[80vh]">
      {/* Delivery Info */}
      <div className="w-full sm:max-w-[500px] flex flex-col gap-4">
        <Title text1="DELIVERY" text2="INFORMATION" />

        <div className="flex gap-3">
          <input
            required
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="border border-gray-300 rounded py-2 px-4 w-full"
            type="text"
            placeholder="First name"
          />
          <input
            required
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="border border-gray-300 rounded py-2 px-4 w-full"
            type="text"
            placeholder="Last name"
          />
        </div>

        <input
          required
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="border border-gray-300 rounded py-2 px-4 w-full"
          type="email"
          placeholder="Email address"
        />

        <input
          required
          name="street"
          value={formData.street}
          onChange={handleChange}
          className="border border-gray-300 rounded py-2 px-4 w-full"
          type="text"
          placeholder="Street"
        />

        <div className="flex gap-3">
          <input
            required
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="border border-gray-300 rounded py-2 px-4 w-full"
            type="text"
            placeholder="City"
          />
          <input
            required
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="border border-gray-300 rounded py-2 px-4 w-full"
            type="text"
            placeholder="State"
          />
        </div>

        <div className="flex gap-3">
          <input
            required
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            className="border border-gray-300 rounded py-2 px-4 w-full"
            type="number"
            placeholder="Zipcode"
          />
          <input
            required
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="border border-gray-300 rounded py-2 px-4 w-full"
            type="text"
            placeholder="Country"
          />
        </div>

        <input
          required
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="border border-gray-300 rounded py-2 px-4 w-full"
          type="number"
          placeholder="Phone"
        />
      </div>

      {/* Order Summary and Payment */}
      <div className="flex flex-col gap-8 w-full sm:max-w-[400px]">
        <CartTotal />

        <Title text1="PAYMENT" text2="METHOD" />
        <div className="flex flex-col gap-3">
          <div
            onClick={() => setMethod('razorpay')}
            className={`flex items-center gap-3 border p-3 cursor-pointer ${method === 'razorpay' ? 'bg-green-100' : ''}`}
          >
            <div className={`w-4 h-4 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`} />
            <img className="h-5 mx-2" src={assets.razorpay_logo} alt="Razorpay" />
            <span>Razorpay</span>
          </div>

          <div
            onClick={() => setMethod('cod')}
            className={`flex items-center gap-3 border p-3 cursor-pointer ${method === 'cod' ? 'bg-green-100' : ''}`}
          >
            <div className={`w-4 h-4 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`} />
            <span>Cash on Delivery</span>
          </div>
        </div>

        <div className="text-end">
          <button
            type="submit"
            className="bg-black text-white px-12 py-3 rounded hover:bg-gray-800 transition"
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
