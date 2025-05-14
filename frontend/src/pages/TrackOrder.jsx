import React, { useState, useEffect,useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import { ShopContext } from '../context/ShopContext';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { FiPackage, FiTruck, FiCheck } from 'react-icons/fi';
import { MdInventory } from 'react-icons/md';
import axios from 'axios';
const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { backendUrl } = useContext(ShopContext);

  const deliverySteps = [
    {
      title: 'Order Placed',
      icon: <MdInventory size={24} />,
      description: 'Your order is confirmed',
      timestamp: null
    }, {
      title: 'Processing',
      icon: <FiPackage size={24} />,
      description: 'We are preparing your order',
      timestamp: null
    },
    {
      title: 'Shipped',
      icon: <FiTruck size={24} />,
      description: 'Your package is on the way',
      timestamp: null
    },
    {
      title: 'Delivered',
      icon: <FiCheck size={24} />,
      description: 'Package delivered successfully',
      timestamp: null
    }
  ];

  
  useEffect(() => {
  const fetchOrderDetails = async () => {
  setLoading(true);
  try {
    const response = await axios.get(`${backendUrl}/api/order/${orderId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    setOrderDetails(response.data.order);

    console.log(response.data)
  } catch (error) {
    console.error("Failed to fetch order:", error?.response?.data || error.message);
    setOrderDetails(null);
  } finally {
    setLoading(false);
  }
};
if (orderId) {
  fetchOrderDetails();  
} else {
  setOrderDetails(null);  
}
}, [orderId, backendUrl]);


  const getCurrentStep = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 4;
      case 'shipped': return 3;
      case 'processing': return 2;
      case 'pending': return 1;
      default: return 1;
    }
  };

  const getExpectedDate = (status) => {
    const today = new Date();
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'Delivered';
      case 'shipped':
        today.setDate(today.getDate() + 2);
        return `Expected by ${today.toLocaleDateString()}`;
      case 'processing':
        today.setDate(today.getDate() + 4);
        return `Expected by ${today.toLocaleDateString()}`;
      default:
        today.setDate(today.getDate() + 5);
        return `Expected by ${today.toLocaleDateString()}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      <div className="flex-grow bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <Title text1="TRACK" text2="ORDER" />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : orderDetails ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-900 text-white p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-medium">Order #{orderId?.slice(-6).toUpperCase()}</h3>
                    <p className="text-gray-300 mt-1">
                      Placed on {new Date(orderDetails.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium text-green-400">
                      {getExpectedDate(orderDetails.status)}
                    </div>
                    {orderDetails.trackingNumber && (
                      <p className="text-sm text-gray-300">
                        Tracking #: {orderDetails.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tracking Timeline */}
              <div className="p-6">
                <div className="relative">
                  <div className="absolute left-0 w-full h-1 top-1/2 -translate-y-1/2 bg-gray-200">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ 
                        width: `${(getCurrentStep(orderDetails.status) / 4) * 100}%`
                      }}
                    />
                  </div>
                  
                  <div className="relative flex justify-between">
                    {deliverySteps.map((step, index) => (
                      <div 
                        key={index}
                        className={`flex flex-col items-center w-1/4 ${
                          index < getCurrentStep(orderDetails.status)
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}
                      >
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center
                          ${index < getCurrentStep(orderDetails.status)
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100'
                          }
                        `}>
                          {step.icon}
                        </div>
                        <p className="mt-2 font-medium text-sm">{step.title}</p>
                        <p className="text-xs text-center mt-1 max-w-[120px]">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 border-t border-gray-200">
                <h4 className="text-lg font-medium mb-4">Order Details</h4>
                <div className="space-y-4">
                  {orderDetails.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      {item.images?.[0] && (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-grow">
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.price?.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <div className="text-gray-600">Total Amount</div>
                  <div className="text-xl font-medium">₹{orderDetails.amount?.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Order not found</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TrackOrder;