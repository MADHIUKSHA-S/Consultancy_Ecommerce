import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App'; // Your backend base URL
import { toast } from 'react-toastify';

const Orders = ({ token, adminAuth }) => {
  const [orders, setOrders] = useState([]);
  console.log(localStorage.getItem("token"))
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token"); // Fetch token from localStorage
      if (!token) {
        throw new Error("No token found");
      }
  
      const response = await axios.get(`${backendUrl}/api/order/all-orders`, {
        headers: {
          Authorization: `Bearer ${token}`, // Attach token as 'Bearer <token>'
        },
      });
  
      setOrders(response.data.orders || []); // Assuming response contains the orders
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders.");
    }
  };
  
  
  

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/order/update-status`,
        { orderId, status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.data.success) {
        toast.success('Order status updated');
        fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
 
  console.log("orders:", orders);
orders.forEach(order => console.log("order.userId:", order?.userId));

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        All Orders
      </h2>

      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="p-4 border rounded shadow">
              <h3 className="font-semibold text-lg">Order ID: {order._id}</h3>
              <p>Status: <span className="font-medium">{order.status}</span></p>
              <p>Total Amount: <span className="font-medium">${order.amount}</span></p>
              <h3>Order ID: {order._id}</h3>

<p><strong>Status:</strong> {order.status}</p>
<p><strong>Placed on:</strong> {new Date(order.createdAt).toLocaleString()}</p>

<h4>Shipping Address</h4>
<p>{order.address?.firstName} {order.address?.lastName}</p>
<p>{order.address?.email}</p>
<p>{order.address?.phone}</p>
<p>
  {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.zipcode}, {order.address?.country}
</p>



              <div className="mt-2">
                <h4 className="font-medium">Items:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="ml-4">
                    <p>📦 Product: {item.productId?.name || 'N/A'}</p>
                    <p>🔢 Quantity: {item.quantity}</p>
                  </div>
                ))}
              </div>

              {/* Admin Status Update Buttons */}
              {adminAuth && (
                <div className="mt-3 space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
                  >
                    Mark as Shipped
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                  >
                    Mark as Delivered
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
