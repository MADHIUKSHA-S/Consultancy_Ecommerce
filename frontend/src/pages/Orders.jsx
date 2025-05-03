    import React, { useContext, useEffect, useState } from 'react';
    import { ShopContext } from '../context/ShopContext';
    import axios from 'axios';
    import Title from '../components/Title';
    import { toast as toast1} from 'react-toastify';
    import { toast as toast2} from 'react-hot-toast';
    import binIcon from '../assets/bin_icon.png';
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
      
          // Sort the orders by createdAt descending (latest first)
          const sortedOrders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
          const transformedData = sortedOrders.flatMap(order =>
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
      
          setOrderData(transformedData);
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
        toast2.custom((t) => (
          <div
          style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: '260px',
            border: '1px solid #f44336' // red outline
          }}
          >
            <span>Are you sure you want to cancel this order?</span>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  toast2.dismiss(t.id);
                  proceedCancelOrder(orderId);
                }}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Yes
              </button>
              <button
                onClick={() => toast2.dismiss(t.id)}
                style={{
                  backgroundColor: '#f0f0f0',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                No
              </button>
            </div>
          </div>
        ));
      };
      const proceedCancelOrder = async (orderId) => {
        try {
          const response = await axios.put(`${backendUrl}/api/order/cancel/${orderId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast1.success(response.data.message || 'Order cancelled successfully');
          loadOrderData(); // Refresh order list
        } catch (error) {
          console.error('Cancellation error:', error);
          toast1.error(error.response?.data?.message || 'Failed to cancel order');
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
      const handleDelete = async (orderId, productId) => {
        try {
          await axios.delete(`${backendUrl}/api/order/item/${orderId}/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          toast1.success('Item deleted successfully');
          loadOrderData(); // Refresh the list
        } catch (error) {
          console.error('Delete error:', error);
          toast1.error(error.response?.data?.message || 'Failed to delete item');
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
          <div className="text-2xl mb-8">
            <Title text1={"YOUR"} text2={"ORDERS"} />
          </div>
          
          <div style={{ marginTop: '20px' }}>
            {orderData.slice().reverse().map((item, index) => (
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
                  <button
  onClick={() => handleDelete(item.orderId, item._id)}
  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
>
  <img src={binIcon} alt="Delete" style={{ width: '20px', height: '20px' }} />
</button>
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
