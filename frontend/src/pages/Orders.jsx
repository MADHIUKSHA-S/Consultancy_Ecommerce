import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";
import { toast as toast1 } from "react-toastify";
import { toast as toast2 } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
  FaCreditCard,
} from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { Link } from "react-router-dom";

const Orders = () => {
  const { backendUrl, token, currency, logout } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError("Please login to view orders");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${backendUrl}/api/order/userOrders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Group orders by orderId to maintain order structure
      const ordersMap = {};

      response.data
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((order) => {
          if (!ordersMap[order._id]) {
            ordersMap[order._id] = {
              orderId: order._id,
              date: order.createdAt,
              status: order.status,
              payment: order.amount,
              paymentMethod: order.paymentMethod || "Cash on delivery",
              address: order.address || {},
              items: [],
            };
          }

          order.items.forEach((item) => {
            const isPopulated =
              item.productId &&
              typeof item.productId === "object" &&
              "_id" in item.productId;
            const product = isPopulated ? item.productId : {};

            ordersMap[order._id].items.push({
              _id: isPopulated ? product._id : item.productId,
              name: product.name || item.name || "Product not available",
              price: product.price ?? item.price ?? 0,
              quantity: item.quantity || 1,
              size: item.size || "",
              images: product.images || [],
              itemTotal:
                (product.price ?? item.price ?? 0) * (item.quantity || 1),
            });
          });
        });

      setOrderData(Object.values(ordersMap));
      console.log("Grouped Orders:", Object.values(ordersMap));
    } catch (error) {
      console.error("Error loading orders:", error);
      if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        logout();
      } else {
        setError(error.response?.data?.message || "Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    toast2.custom((t) => (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-red-200 w-72">
        <div className="mb-3 font-medium">Cancel Order?</div>
        <p className="text-gray-600 text-sm mb-4">
          This action cannot be undone. Are you sure you want to cancel this
          order?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              toast2.dismiss(t.id);
              proceedCancelOrder(orderId);
            }}
            className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
          >
            Yes, Cancel
          </button>
          <button
            onClick={() => toast2.dismiss(t.id)}
            className="px-4 py-2 bg-gray-100 text-gray-800 text-sm rounded hover:bg-gray-200 transition-colors"
          >
            No, Keep
          </button>
        </div>
      </div>
    ));
  };

  const proceedCancelOrder = async (orderId) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/order/cancel/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast1.success(response.data.message || "Order cancelled successfully");
      loadOrderData(); // Refresh order list
    } catch (error) {
      console.error("Cancellation error:", error);
      toast1.error(error.response?.data?.message || "Failed to cancel order");
    }
  };

  const handleDelete = async (orderId, productId) => {
    try {
      await axios.delete(
        `${backendUrl}/api/order/item/${orderId}/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast1.success("Item removed from order");
      loadOrderData(); // Refresh the list
    } catch (error) {
      console.error("Delete error:", error);
      toast1.error(error.response?.data?.message || "Failed to remove item");
    }
  };

  useEffect(() => {
    if (token) loadOrderData();
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <FaCheckCircle className="text-green-500 text-lg" />;
      case "processing":
        return <FaBox className="text-yellow-500 text-lg" />;
      case "shipped":
        return <FaShippingFast className="text-blue-500 text-lg" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500 text-lg" />;
      default:
        return <FaBox className="text-yellow-500 text-lg" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Loading state with animation
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 mb-4 rounded-full bg-gray-200"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
          <div className="h-3 w-32 mt-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state with improved design
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 max-w-md">
          <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Unable to Load Orders
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadOrderData}
            className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state with improved design
  if (!orderData.length) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <div className="bg-gray-50 rounded-full h-24 w-24 flex items-center justify-center mx-auto mb-6">
            <FaBox className="text-4xl text-gray-300" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">
            No Orders Yet
          </h2>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet. Start shopping and discover our
            amazing products!
          </p>
          <Link
            to="/shop"
            className="px-6 py-3 bg-black text-white rounded-md inline-block hover:bg-gray-800 transition-colors"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-10">
        <Title text1="YOUR" text2="ORDERS" />
        <p className="text-gray-500 text-center mt-2">
          Track and manage all your purchases
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          <AnimatePresence>
            {orderData.map((order) => (
              <motion.div
                key={order.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="order-container"
              >
                {/* Order Header */}
                <div
                  className="p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() =>
                    setActiveOrderId(
                      activeOrderId === order.orderId ? null : order.orderId
                    )
                  }
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className="ml-2 font-medium text-gray-800">
                        Order #{order.orderId.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        {formatDate(order.date)}
                      </span>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between text-sm">
                    <div className="text-gray-600">
                      <span>
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        Total:{" "}
                        <span className="font-medium">
                          {currency}
                          {order.payment?.toFixed(2)}
                        </span>
                      </span>
                    </div>
                    <div
                      className={`text-sm ${
                        activeOrderId === order.orderId
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      {activeOrderId === order.orderId
                        ? "Hide Details"
                        : "View Details"}
                    </div>
                  </div>
                </div>

                {/* Order Details (expandable) */}
                <AnimatePresence>
                  {activeOrderId === order.orderId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 overflow-hidden"
                    >
                      <div className="p-5 border-t border-gray-100">
                        {/* Order info and shipping */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                          {/* Order Info */}
                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-3">
                              Order Information
                            </h3>
                            <ul className="space-y-2 text-sm">
                              <li className="flex justify-between">
                                <span className="text-gray-500">Order ID:</span>
                                <span className="font-medium">
                                  {order.orderId.slice(-8).toUpperCase()}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span>{formatDate(order.date)}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-500">Time:</span>
                                <span>{formatTime(order.date)}</span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span
                                  className={`font-medium ${
                                    order.status.toLowerCase() === "completed"
                                      ? "text-green-600"
                                      : order.status.toLowerCase() ===
                                        "cancelled"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </li>
                            </ul>
                          </div>

                          {/* Payment Info */}
                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <FaCreditCard className="mr-2 text-gray-400" />
                              Payment Details
                            </h3>
                            <ul className="space-y-2 text-sm">
                              <li className="flex justify-between">
                                <span className="text-gray-500">Method:</span>
                                <span className="font-medium">
                                  {order.paymentMethod}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-500">Subtotal:</span>
                                <span>
                                  {currency}
                                  {(order.payment * 0.9).toFixed(2)}
                                </span>
                              </li>
                              <li className="flex justify-between">
                                <span className="text-gray-500">Tax:</span>
                                <span>
                                  {currency}
                                  {(order.payment * 0.1).toFixed(2)}
                                </span>
                              </li>
                              <li className="flex justify-between pt-2 border-t border-gray-100">
                                <span className="text-gray-700 font-medium">
                                  Total:
                                </span>
                                <span className="font-semibold">
                                  {currency}
                                  {order.payment?.toFixed(2)}
                                </span>
                              </li>
                            </ul>
                          </div>

                          {/* Shipping Address */}
                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                              <MdLocationOn className="mr-2 text-gray-400" />
                              Shipping Address
                            </h3>
                            {order.address ? (
                              <div className="text-sm">
                                <p className="font-medium mb-1">
                                  {order.address.name || "N/A"}
                                </p>
                                <p className="text-gray-600 mb-1">
                                  {[order.address.street, order.address.city]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                                <p className="text-gray-600 mb-1">
                                  {[order.address.state, order.address.zip]
                                    .filter(Boolean)
                                    .join(" ")}
                                </p>
                                <p className="text-gray-600 mt-2">
                                  {order.address.phone || "No phone provided"}
                                </p>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">
                                Address information not available
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="mt-4">
                          <h3 className="font-semibold text-gray-800 mb-3">
                            Order Items
                          </h3>
                          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                              {order.items.map((item, idx) => (
                                <div
                                  key={`${item._id}-${idx}`}
                                  className="p-4 flex items-start gap-4"
                                >
                                  {/* Product image */}
                                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {item.images && item.images.length > 0 ? (
                                      <img
                                        src={item.images[0]}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <span className="text-gray-400 text-xs">
                                          No Image
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Product details */}
                                  <div className="flex-grow">
                                    <h4 className="font-medium text-gray-800">
                                      {item.name}
                                    </h4>
                                    <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-gray-600">
                                      <span>Qty: {item.quantity}</span>
                                      {item.size && (
                                        <span>Size: {item.size}</span>
                                      )}
                                      <span>
                                        Price: {currency}
                                        {item.price?.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Item price & actions */}
                                  <div className="flex flex-col items-end gap-2">
                                    <span className="font-medium">
                                      {currency}
                                      {item.itemTotal?.toFixed(2)}
                                    </span>
                                    {order.status.toLowerCase() ===
                                      "pending" && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(order.orderId, item._id);
                                        }}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                      >
                                        <FaTrashAlt size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex justify-end">
                          {order.status.toLowerCase() === "pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelOrder(order.orderId);
                              }}
                              className="px-4 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors flex items-center"
                            >
                              <FaTimesCircle className="mr-2" /> Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Orders;
