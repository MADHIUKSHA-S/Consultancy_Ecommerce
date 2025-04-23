import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

const Orders = () => {
  const { backendUrl, token, currency, logout } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Please login to view orders');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${backendUrl}/api/order/userOrders`, {
        headers: { Authorization: `Bearer ${token}` }

      });

      const transformedData = response.data.flatMap(order =>
        order.items.map(item => {
          const isPopulated = item.productId && typeof item.productId === 'object' && '_id' in item.productId;
          const product = isPopulated ? item.productId : {};

          return {
            _id: isPopulated ? product._id : item.productId,
            name: product.name || item.name || 'Product not available',
            price: product.price ?? item.price ?? 0,
            quantity: item.quantity || 1,
            size: item.size || '',
            images: product.images || [],
            status: order.status || 'processing',
            payment: order.amount || 0,
            paymentMethod: order.paymentMethod || 'Cash on delivery',
            date: order.createdAt || new Date().toISOString(),
            orderId: order._id,
            address: order.address || {}
          };
        })
      );

      setOrderData(transformedData.reverse());
      console.log("Final Transformed Orders:", transformedData);
    } catch (error) {
      console.error('Error loading orders:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        logout();
      } else {
        setError(error.response?.data?.message || 'Failed to load orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await axios.put(`${backendUrl}/api/order/cancel/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }

      });
      alert(response.data.message || 'Order cancelled successfully');
      loadOrderData(); // Refresh order list
    } catch (error) {
      console.error('Cancellation error:', error);
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  useEffect(() => {
    if (token) loadOrderData();
  }, [token]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return { background: '#d4edda', color: '#155724' };
      case 'cancelled': return { background: '#f8d7da', color: '#721c24' };
      default: return { background: '#fff3cd', color: '#856404' };
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '300px',
        fontSize: '18px'
      }}>
        Loading your orders...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#dc3545', marginBottom: '20px' }}>{error}</p>
        <button 
          onClick={loadOrderData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!orderData.length) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
        <a 
          href="/shop"
          style={{
            padding: '10px 20px',
            backgroundColor: '#000',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Start Shopping
        </a>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '30px',
        textAlign: 'center',
        textTransform: 'uppercase'
      }}>
        MY ORDERS
      </h1>
      
      <div style={{ marginTop: '20px' }}>
        {orderData.map((item, index) => (
          <div key={`${item.orderId}-${index}`} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            {/* Order Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '15px',
              paddingBottom: '10px',
              borderBottom: '1px solid #f0f0f0'
            }}>
              <span style={{ fontWeight: '500' }}>
                Order #{item.orderId?.slice(-6).toUpperCase()}
              </span>
              <span style={{ color: '#666' }}>
                {formatDate(item.date)}
              </span>
              <span style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.8em',
                ...getStatusColor(item.status)
              }}>
                {item.status.toUpperCase()}
              </span>
            </div>
            
            {/* Product Info */}
            <div style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '15px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '5px'
                }}>
                  {item.name}
                </h3>
                <p style={{ margin: '3px 0', fontSize: '14px' }}>
                  Quantity: {item.quantity}
                </p>
                <p style={{ margin: '3px 0', fontSize: '14px' }}>
                  Price: {currency}{item.price?.toFixed(2)}
                </p>
              </div>
            </div>
            
            {/* Order Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '10px',
              borderTop: '1px solid #f0f0f0'
            }}>
              <div>
                <p style={{ margin: '3px 0', fontSize: '14px' }}>
                  Total: {currency}{item.payment?.toFixed(2)}
                </p>
                <p style={{ margin: '3px 0', fontSize: '14px' }}>
                  Payment: {item.paymentMethod}
                </p>
              </div>

              {item.status.toLowerCase() === 'pending' && (
                <button 
                  onClick={() => cancelOrder(item.orderId)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
