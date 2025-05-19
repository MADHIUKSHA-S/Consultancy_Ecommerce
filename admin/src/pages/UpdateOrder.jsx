import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheck, FiX } from 'react-icons/fi';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const UpdateOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState();
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    { value: 'Pending', icon: <FiPackage />, color: 'bg-yellow-500' },
    { value: 'Processing', icon: <FiPackage />, color: 'bg-blue-500' },
    { value: 'Shipped', icon: <FiTruck />, color: 'bg-purple-500' },
    { value: 'Delivered', icon: <FiCheck />, color: 'bg-green-500' },
    { value: 'Cancelled', icon: <FiX />, color: 'bg-red-500' }
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setOrder(response.data.order);
      console.log("datas",response.data.order.address.firstName);
    } catch (error) {
      toast.error('Failed to fetch order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };


  const handleUpdateStatus = async (newStatus) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/order/update-status`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      if (response.data.success) {
        toast.success('Order status updated successfully');
        fetchOrderDetails();
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header section */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Update Order Status</h1>
          <button
            onClick={() => navigate('/orders')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg"
          >
            Back to Orders
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Order Summary */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono">{order?._id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p>{new Date(order?.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="font-medium text-blue-600">{order?.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">₹{order?.amount}</p>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium mb-4">Customer Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p>{`${order?.address?.firstName} ${order?.address?.lastName}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{order?.address?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{order?.address?.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p>{`${order?.address?.street}, ${order?.address?.city}`}</p>
                <p>{`${order?.address?.state}, ${order?.address?.zipcode}`}</p>
                <p>{order?.address?.country}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-medium mb-4">Order Items</h2>
            <div className="space-y-4">
              {order?.items.map((item) => (
                <div key={item._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.productId.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Quantity: {item.quantity} × ₹{item.productId.price}
                    </p>
                  </div>
                  <p className="font-medium">₹{item.quantity * item.productId.price}</p>
                </div>
              ))}
              <div className="flex justify-between items-center p-4 font-medium">
                <span>Total Amount</span>
                <span>₹{order?.amount}</span>
              </div>
            </div>
          </div>

          {/* Status Update Section */}
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Update Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleUpdateStatus(status.value)}
                  disabled={order?.status === status.value}
                  className={`
                    p-4 rounded-lg flex flex-col items-center gap-2
                    ${order?.status === status.value 
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed' 
                      : 'bg-white border-2 hover:border-gray-300 cursor-pointer'}
                  `}
                >
                  <div className={`p-2 rounded-full ${status.color} text-white`}>
                    {status.icon}
                  </div>
                  <span>{status.value}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrder;