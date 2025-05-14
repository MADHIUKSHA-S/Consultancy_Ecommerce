import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { FiPackage, FiTruck, FiCheck, FiDownload, FiCalendar, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { MdPending } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const Orders = ({ token, adminAuth }) => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  console.log(localStorage.getItem("token"));

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }
  
      const response = await axios.get(`${backendUrl}/api/order/all-orders`, { headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }
    }
  };

  const downloadOrdersPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("Orders Report", 14, 10);
      
      const tableData = orders.map((order, index) => [
        index + 1,
        order._id.substring(0, 8) + "...",
        order.status,
        `Rs.${order.amount}`,
        new Date(order.createdAt).toLocaleDateString(),
        order.address?.email || "N/A",
        order.items?.map(item => item.productId?.name).join(", ") || "N/A"
      ]);
  
      autoTable(doc, {
        head: [["#", "Order ID", "Status", "Amount", "Date", "Email", "Products"]],
        body: tableData,
        startY: 20,
        headStyles: {
          fillColor: [41, 128, 185]
        }
      });
  
      doc.save("orders-report.pdf");
    } catch (error) {
      console.error("PDF error:", error);
      toast.error("Failed to generate PDF");
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

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
 
  console.log("orders:", orders);
  orders.forEach(order => console.log("order.userId:", order?.userId));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Orders Dashboard</h2>
          {orders.length > 0 && (
            <button
              onClick={downloadOrdersPDF}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border shadow-sm transition-all"
            >
              <FiDownload className="w-5 h-5" />
              Export to PDF
            </button>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <FiPackage className="w-16 h-16 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600">No orders found.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                {/* Order Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono font-medium">{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FiCalendar className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-4 border-b">
                  <h3 className="font-medium mb-3">Customer Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FiMail className="w-4 h-4 text-gray-400" />
                      {order.address?.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <FiPhone className="w-4 h-4 text-gray-400" />
                      {order.address?.phone}
                    </div>
                    <div className="flex items-start gap-2">
                      <FiMapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <span>
                        {order.address?.street}, {order.address?.city}<br />
                        {order.address?.state}, {order.address?.zipcode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 border-b">
                  <h3 className="font-medium mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <FiPackage className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">{item.productId?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="text-lg font-semibold">Rs.{order.amount}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/update-order/${order._id}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <FiTruck className="w-4 h-4" />
                    Update Order
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
