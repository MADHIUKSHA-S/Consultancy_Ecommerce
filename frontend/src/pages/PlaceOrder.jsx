import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { backendUrl, token, cartItems, setCartItems, products, getCartAmount } = useContext(ShopContext);
  const [method, setMethod] = useState('cod');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const localToken = localStorage.getItem("token");

    if (localToken) {
      try {
        const decoded = jwtDecode(localToken);
        setUserId(decoded.id);
        console.log("Decoded token:", decoded);
      } catch (err) {
        console.error("Token decoding failed:", err);
        toast.error("Invalid token, please login again.");
        navigate('/login');
      }
    } else {
      toast.error("You must be logged in to place an order.");
      navigate('/login');
    }
  }, [navigate]);

  // Form data for delivery information
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

  

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const onSubmitHandler = async (event) => {
    event.preventDefault();
  
    try {
      // Check if cartItems is empty
      if (Object.keys(cartItems).length === 0) {
        toast.error("Your cart is empty.");
        return;
      }
  
      let orderItems = [];
  
      // Create orderItems array from cartItems
      Object.keys(cartItems).forEach((itemId) => {
        if (cartItems[itemId] > 0) {
          const itemInfo = products.find(product => product._id === itemId);
          if (!itemInfo) {
            console.warn(`Product with ID ${itemId} not found in products list.`);
            return; // Skip invalid product
          }
  
          orderItems.push({
            productId: itemInfo._id,
            quantity: cartItems[itemId],
          });
        }
      });
  
      if (orderItems.length === 0) {
        toast.error("Cart items could not be validated.");
        return;
      }
  
     
  
      const orderData = {
        userId,  // Sending user email instead of userId
        address: formData, // Assuming 'address' needs to be formData here
        items: orderItems,
        amount: getCartAmount(),
        paymentMethod: method,
      };
  
      const response = await axios.post(`${backendUrl}/api/order/place`, orderData, {
        headers: { token },
      });
  
      // Check if response exists and is valid JSON
      if (response && response.data) {
        // Check if the data is a valid object (ensure it's not undefined or invalid JSON)
        if (typeof response.data === 'object' && response.data !== null) {
          if (response.data.success) {
            setCartItems({});
            navigate('/orders');
            toast.success('Order placed successfully!');
          } else {
            toast.error(response.data.message || "Failed to place the order.");
          }
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error('Empty or invalid response received');
      }
    } catch (error) {
      console.error("Order placement error:", error);
  
      // Handle different types of errors gracefully
      if (error.response && error.response.data) {
        // API returned an error response
        toast.error(error.response.data.message || "An error occurred while placing the order.");
      } else if (error.request) {
        // No response received from the server
        toast.error("Network error, please try again later.");
      } else if (error.message === 'Invalid response format') {
        // This handles cases where the response is not a valid JSON
        toast.error("Received invalid data from the server.");
      } else if (error.message === 'Empty or invalid response received') {
        // Handle empty or invalid response error
        toast.error("The response from the server is empty or invalid.");
      } else {
        // Other errors
        toast.error("An unexpected error occurred.");
      }
    }
  };
  
  
  
  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t">
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="text"
          placeholder="Street"
        />
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Zipcode"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone"
        />
      </div>
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1={'PAYMENT'} text2={'METHOD'} />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div onClick={() => setMethod('stripe')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div onClick={() => setMethod('razorpay')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
              <img className="h-5 mx-4" src={assets.razorpay_logo} alt="Razorpay" />
            </div>
            <div onClick={() => setMethod('cod')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button type="submit" className="bg-black text-white px-16 py-3 text-sm">
              PLACE ORDER
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
