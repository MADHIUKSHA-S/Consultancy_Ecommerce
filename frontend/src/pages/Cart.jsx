import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';
import { toast as toast1} from 'react-toastify';
import { toast as toast2} from 'react-hot-toast';
//import { toast as toast2} from 'react-hot-toast';
const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, token } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const formatCartData = (cartItems) => {
    return Object.entries(cartItems)
      .map(([itemId, value]) => {
        const quantity = typeof value === 'object' ? value.quantity : value;
        const product = products.find((p) => p._id === itemId);
        if (!product || quantity <= 0) return null;
        return {
          ...product,
          quantity,
          totalPrice: (product.price || 0) * quantity,
        };
      })
      .filter(Boolean);
  };

  const fetchCartData = async () => {
    if (token) {
      await fetchCartDataFromBackend();
    } else {
      const savedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
      const formatted = formatCartData(savedCart);
      setCartData(formatted);
      const initialSelection = {};
      formatted.forEach((item) => (initialSelection[item._id] = true));
      setSelectedItems(initialSelection);
    }
  };

  const fetchCartDataFromBackend = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/cart/get`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const cartItemsFromBackend = data.cartData || {};
        const formatted = formatCartData(cartItemsFromBackend);
        localStorage.setItem('cartItems', JSON.stringify(cartItemsFromBackend));
        setCartData(formatted);
        const initialSelection = {};
        formatted.forEach((item) => (initialSelection[item._id] = true));
        setSelectedItems(initialSelection);
      }
    } catch (error) {
      console.error('Error fetching cart from backend:', error);
    }
  };

  useEffect(() => {
    if (products && products.length > 0) {
      fetchCartData();
    }
  }, [token, products]);

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
    const updatedCart = JSON.parse(localStorage.getItem('cartItems')) || {};
    updatedCart[itemId] = newQuantity;
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    const formatted = formatCartData(updatedCart);
    setCartData(formatted);
  };
  const removeItemFromCart = (itemId) => {
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
        <span>Are you sure you want to remove this item from your cart?</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={() => {
              toast2.dismiss(t.id);
              proceedRemoveItem(itemId);
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
  
  const proceedRemoveItem = (itemId) => {
    updateQuantity(itemId, 0);
    const updatedCart = JSON.parse(localStorage.getItem('cartItems')) || {};
    delete updatedCart[itemId];
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    const formatted = formatCartData(updatedCart);
    setCartData(formatted);
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      delete newSelected[itemId];
      return newSelected;
    });
  
    toast1.success('Item removed from cart');
  };
  

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  if (!cartData || cartData.length === 0) {
    return (
      <div className="border-t pt-14 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-2xl mb-3">
          <Title text1={"YOUR"} text2={"CART"} />
        </div>
        <div className="py-10 text-center">
          <p className="text-gray-500 mb-6">Your cart is empty</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-black text-white px-8 py-3 text-sm hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-14 min-h-[60vh]">
      <div className="text-2xl mb-8">
        <Title text1={"YOUR"} text2={"CART"} />
      </div>

      <div className="mb-10">
        {cartData.map((item) => (
          <div
            key={item._id}
            className="py-6 border-b text-gray-700 grid grid-cols-12 items-center gap-4"
          >
            <div className="col-span-5 sm:col-span-4 flex items-start gap-4">
              <input
                type="checkbox"
                checked={!!selectedItems[item._id]}
                onChange={() => handleCheckboxChange(item._id)}
                className="mt-1"
              />
              <div>
                <p className="text-sm sm:text-base font-medium">{item.name}</p>
                <p className="mt-1 text-sm sm:text-base">
                  {currency}{item.price.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="col-span-5 sm:col-span-6 flex items-center justify-end gap-4">
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-600">Qty:</span>
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-3 py-1 disabled:opacity-50"
                  >
                    -
                  </button>
                  <input
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value, 10);
                      if (!isNaN(newQuantity)) {
                        handleQuantityChange(item._id, newQuantity);
                      }
                    }}
                    className="w-12 text-center py-1 border-x focus:outline-none"
                    type="number"
                    min="1"
                  />
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    className="px-3 py-1"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="w-20 text-right font-medium">
                {currency}{item.totalPrice.toFixed(2)}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-2 text-right">
              <button
                onClick={() => removeItemFromCart(item._id)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              >
                <img
                  src={assets.bin_icon}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  alt="Remove"
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-20">
        <div className="w-full sm:w-1/2 lg:w-1/3">
          <CartTotal cartData={cartData} selectedItems={selectedItems} />
          <div className="w-full text-end mt-8">
            <button
              onClick={() => navigate("/place-order")}
              className="bg-black text-white text-sm px-8 py-3 hover:bg-gray-800 transition-colors"
              disabled={Object.values(selectedItems).filter(Boolean).length === 0}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
