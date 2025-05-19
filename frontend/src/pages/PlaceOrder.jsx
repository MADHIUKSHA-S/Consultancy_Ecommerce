import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";

// Icons
import {
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaShippingFast,
  FaLock,
  FaCreditCard,
  FaMoneyBillWave,
  FaArrowLeft,
  FaTag,
} from "react-icons/fa";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const {
    backendUrl,
    token,
    cartItems,
    setCartItems,
    products,
    getCartAmount,
    fetchUserCart,
  } = useContext(ShopContext);
  const location = useLocation();
  const { cartData = [], selectedItems = {} } = location.state || {};
  const [userId, setUserId] = useState(null);
  const [method, setMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  // Get items to display in order summary
  const itemsToDisplay = cartData.filter((item) => selectedItems[item._id] > 0);

  // Calculate totals with discount
  const subtotal = cartData.reduce((acc, item) => {
    const quantity = selectedItems[item._id] || 0;
    return acc + item.price * quantity;
  }, 0);

  // Count total items
  const totalItemCount = Object.values(selectedItems).reduce(
    (sum, qty) => sum + (qty > 0 ? 1 : 0),
    0
  );

  // Calculate discount based on item count
  let discount = 0;
  let discountPercentage = "0%";
  if (totalItemCount >= 3 && totalItemCount < 5) {
    // 10% discount for 3-4 items
    discount = subtotal * 0.1;
    discountPercentage = "10%";
  } else if (totalItemCount >= 5 && totalItemCount < 7) {
    // 15% discount for 5-6 items
    discount = subtotal * 0.15;
    discountPercentage = "15%";
  } else if (totalItemCount >= 7) {
    // 20% discount for 7+ items
    discount = subtotal * 0.2;
    discountPercentage = "20%";
  }

  const discountedSubtotal = subtotal - discount;
  const shipping = 10;
  const totalAmount = discountedSubtotal + shipping;

  useEffect(() => {
    const localToken = localStorage.getItem("token");
    if (localToken) {
      try {
        const decoded = jwtDecode(localToken);
        setUserId(decoded.id);

        // If user is logged in, try to fetch their saved address info
        const fetchUserData = async () => {
          try {
            const response = await axios.get(`${backendUrl}/api/user/profile`, {
              headers: { Authorization: `Bearer ${localToken}` },
            });

            if (response.data.user) {
              const {
                firstName,
                lastName,
                email,
                address = {},
              } = response.data.user;
              setFormData((prev) => ({
                ...prev,
                firstName: firstName || "",
                lastName: lastName || "",
                email: email || "",
                street: address.street || "",
                city: address.city || "",
                state: address.state || "",
                zipcode: address.zipcode || "",
                country: address.country || "",
                phone: address.phone || "",
              }));
            }
          } catch (error) {
            console.log("Could not fetch user data", error);
          }
        };

        fetchUserData();
      } catch (error) {
        toast.error("Invalid token, please login again.");
        navigate("/login");
      }
    } else {
      toast.error("You must be logged in to place an order.");
      navigate("/login");
    }
  }, [navigate, backendUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);

    if (Object.keys(cartItems).length === 0) {
      toast.error("Your cart is empty.");
      setIsSubmitting(false);
      return;
    }

    const orderItems = Object.keys(cartItems)
      .map((id) => {
        const product = products.find((p) => p._id === id);
        if (product && cartItems[id] > 0) {
          return { productId: product._id, quantity: cartItems[id] };
        }
        return null;
      })
      .filter(Boolean);

    if (orderItems.length === 0) {
      toast.error("No valid products in cart.");
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      userId,
      address: {
        name: `${formData.firstName} ${formData.lastName}`,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zipcode,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
      },
      items: orderItems,
      amount: totalAmount,
      paymentMethod: method,
    };

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        orderData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success && method === "razorpay") {
        const { razorpayOrderId, amount } = response.data.order;

        const options = {
          key: razorkey,
          amount: amount * 100,
          currency: "INR",
          order_id: razorpayOrderId,
          handler: async function (paymentResult) {
            const paymentData = {
              orderId: response.data.order._id,
              paymentDetails: {
                razorpay_payment_id: paymentResult.razorpay_payment_id,
                razorpay_order_id: paymentResult.razorpay_order_id,
                razorpay_signature: paymentResult.razorpay_signature,
              },
            };

            await axios.post(
              `${backendUrl}/api/order/payment-success`,
              paymentData,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            toast.success("Order placed successfully!");
            fetchUserCart();
            navigate("/orders");
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
            color: "#1a1a1a",
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else if (response.data?.success && method === "cod") {
        toast.success("Order placed successfully!");
        fetchUserCart();
        navigate("/orders");
      } else {
        toast.error(response.data.message || "Order placement failed.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Order Error:", error);
      toast.error(error.response?.data?.message || "Error placing order.");
      setIsSubmitting(false);
    }
  };

  const renderOrderSummary = () => (
    <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Order Summary
      </h2>

      {itemsToDisplay.length > 0 ? (
        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-6">
          {itemsToDisplay.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-3 pb-3 border-b border-gray-200"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                {item.images && item.images[0] && (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-grow">
                <p className="text-gray-800 font-medium">{item.name}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600 text-sm">
                    {selectedItems[item._id]} × ₹{item.price.toFixed(2)}
                  </span>
                  <span className="font-medium">
                    ₹{(item.price * selectedItems[item._id]).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mb-6">No items in cart</p>
      )}

      <div className="space-y-2 text-gray-700">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center">
              <FaTag className="mr-1" /> Discount ({discountPercentage})
            </span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{shipping.toFixed(2)}</span>
        </div>

        <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200 text-gray-900">
          <span>Total</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>

        {discount > 0 && (
          <div className="mt-2 py-2 px-3 bg-green-50 border border-green-100 rounded-md text-xs text-green-700">
            You saved ₹{discount.toFixed(2)} with our multi-item discount!
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Checkout Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center max-w-xl mx-auto">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                step >= 1 ? "bg-black" : "bg-gray-300"
              }`}
            >
              1
            </div>
            <span
              className={`text-sm mt-2 ${
                step >= 1 ? "text-black" : "text-gray-500"
              }`}
            >
              Shipping
            </span>
          </div>
          <div
            className={`flex-1 h-1 mx-3 ${
              step >= 2 ? "bg-black" : "bg-gray-300"
            }`}
          ></div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                step >= 2 ? "bg-black" : "bg-gray-300"
              }`}
            >
              2
            </div>
            <span
              className={`text-sm mt-2 ${
                step >= 2 ? "text-black" : "text-gray-500"
              }`}
            >
              Payment
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Form */}
        <div className="flex-grow">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Step 1: Delivery Information */}
            {step === 1 && (
              <form onSubmit={handlePlaceOrder}>
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                    <FaMapMarkerAlt className="text-gray-500" /> Shipping
                    Information
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="text-xs text-gray-500 block mb-1">
                          First Name *
                        </label>
                        <div className="relative">
                          <input
                            required
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                            type="text"
                            placeholder="John"
                          />
                          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      <div className="relative">
                        <label className="text-xs text-gray-500 block mb-1">
                          Last Name *
                        </label>
                        <div className="relative">
                          <input
                            required
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                            type="text"
                            placeholder="Doe"
                          />
                          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="text-xs text-gray-500 block mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <input
                          required
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                          type="email"
                          placeholder="john.doe@example.com"
                        />
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="text-xs text-gray-500 block mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <input
                          required
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                          type="tel"
                          placeholder="Enter your phone number"
                        />
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <hr className="my-6" />

                  <div className="space-y-4">
                    <div className="relative">
                      <label className="text-xs text-gray-500 block mb-1">
                        Street Address *
                      </label>
                      <div className="relative">
                        <input
                          required
                          name="street"
                          value={formData.street}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                          type="text"
                          placeholder="123 Main Street"
                        />
                        <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          City *
                        </label>
                        <input
                          required
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                          type="text"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          State/Province *
                        </label>
                        <input
                          required
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                          type="text"
                          placeholder="State"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          ZIP/Postal Code *
                        </label>
                        <input
                          required
                          name="zipcode"
                          value={formData.zipcode}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                          type="text"
                          placeholder="Postal code"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">
                          Country *
                        </label>
                        <input
                          required
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-colors"
                          type="text"
                          placeholder="Country"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => navigate("/cart")}
                    className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm"
                  >
                    <FaArrowLeft size={12} /> Back to cart
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    Continue to Payment <FaShippingFast />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <form onSubmit={handlePlaceOrder}>
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                    <FaCreditCard className="text-gray-500" /> Payment Method
                  </h2>
                </div>

                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div
                      onClick={() => setMethod("razorpay")}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        method === "razorpay"
                          ? "border-black bg-black/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          method === "razorpay"
                            ? "border-black"
                            : "border-gray-300"
                        }`}
                      >
                        {method === "razorpay" && (
                          <div className="w-3 h-3 rounded-full bg-black"></div>
                        )}
                      </div>
                      <div className="flex items-center justify-between flex-grow">
                        <div className="flex items-center gap-3">
                          <img
                            className="h-8"
                            src={assets.razorpay_logo}
                            alt="Razorpay"
                          />
                          <span className="font-medium">
                            Credit/Debit Card, UPI, Netbanking
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center">
                          <FaLock className="mr-1" /> Secure
                        </span>
                      </div>
                    </div>

                    <div
                      onClick={() => setMethod("cod")}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        method === "cod"
                          ? "border-black bg-black/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          method === "cod" ? "border-black" : "border-gray-300"
                        }`}
                      >
                        {method === "cod" && (
                          <div className="w-3 h-3 rounded-full bg-black"></div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <FaMoneyBillWave className="text-green-600 mr-3 text-lg" />
                        <span className="font-medium">Cash on Delivery</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 mt-6">
                    <p className="flex items-center">
                      <FaLock className="mr-2" /> Your payment information is
                      securely processed
                    </p>
                  </div>

                  <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="font-semibold mb-2">Delivery Information</h3>
                    <p className="text-sm text-gray-600">
                      {formData.firstName} {formData.lastName}
                      <br />
                      {formData.street}, {formData.city}
                      <br />
                      {formData.state}, {formData.zipcode}, {formData.country}
                      <br />
                      {formData.phone}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 flex items-center"
                    >
                      <FaArrowLeft className="mr-1" size={10} /> Edit
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm"
                  >
                    <FaArrowLeft size={12} /> Back to shipping
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-lg flex items-center gap-2 ${
                      isSubmitting
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800 transition-colors"
                    }`}
                  >
                    {isSubmitting ? "Processing..." : "Complete Order"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:w-[380px]">{renderOrderSummary()}</div>
      </div>
    </div>
  );
};

export default PlaceOrder;
