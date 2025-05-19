import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { assets } from "../assets/assets";
import CartTotal from "../components/CartTotal";
import { toast as toast1 } from "react-toastify";
import { toast as toast2 } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate, token } =
    useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const formatCartData = (cartItems) => {
    return Object.entries(cartItems)
      .map(([itemId, value]) => {
        const quantity = typeof value === "object" ? value.quantity : value;
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
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        const cartItemsFromBackend = data.cartData || {};
        const formatted = formatCartData(cartItemsFromBackend);
        localStorage.setItem("cartItems", JSON.stringify(cartItemsFromBackend));
        setCartData(formatted);
        const initialSelection = {};
        formatted.forEach((item) => (initialSelection[item._id] = true));
        setSelectedItems(initialSelection);
      }
    } catch (error) {
      console.error("Error fetching cart from backend:", error);
    }
  };

  useEffect(() => {
    if (products && products.length > 0) {
      fetchCartData();
    }
  }, [token, products]);

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
    const updatedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
    updatedCart[itemId] = newQuantity;
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    const formatted = formatCartData(updatedCart);
    setCartData(formatted);
  };

  const removeItemFromCart = (itemId) => {
    toast2.custom((t) => (
      <div
        style={{
          background: "white",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "260px",
          border: "1px solid #f44336", // red outline
        }}
      >
        <span>Are you sure you want to remove this item from your cart?</span>
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <button
            onClick={() => {
              toast2.dismiss(t.id);
              proceedRemoveItem(itemId);
            }}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Yes
          </button>
          <button
            onClick={() => toast2.dismiss(t.id)}
            style={{
              backgroundColor: "#f0f0f0",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
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
    const updatedCart = JSON.parse(localStorage.getItem("cartItems")) || {};
    delete updatedCart[itemId];
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    const formatted = formatCartData(updatedCart);
    setCartData(formatted);
    setSelectedItems((prev) => {
      const newSelected = { ...prev };
      delete newSelected[itemId];
      return newSelected;
    });

    toast1.success("Item removed from cart");
  };

  const handleCheckboxChange = (itemId) => {
    setSelectedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const selectAllItems = () => {
    const newSelection = {};
    cartData.forEach((item) => {
      newSelection[item._id] = true;
    });
    setSelectedItems(newSelection);
  };

  const deselectAllItems = () => {
    setSelectedItems({});
  };

  const areAllItemsSelected =
    cartData.length > 0 && cartData.every((item) => selectedItems[item._id]);

  if (!cartData || cartData.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Looks like you haven't added any products to your cart yet. Browse
            our collection to find what you need.
          </p>
          <button
            onClick={() => navigate("/collection")}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div className="mb-4 md:mb-0">
          <Title text1={"YOUR"} text2={"CART"} />
          <p className="text-gray-500 mt-1">
            {cartData.length} {cartData.length === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={areAllItemsSelected ? deselectAllItems : selectAllItems}
            className="text-sm font-medium text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            {areAllItemsSelected ? "Deselect All" : "Select All"}
          </button>
          <button
            onClick={() => navigate("/collection")}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Continue Shopping
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-grow">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            {/* Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 items-center bg-gray-50 p-4 text-sm font-medium text-gray-500">
              <div className="sm:col-span-7">Product</div>
              <div className="sm:col-span-2 text-center">Quantity</div>
              <div className="sm:col-span-2 text-right">Price</div>
              <div className="sm:col-span-1"></div>
            </div>

            {/* Items */}
            <AnimatePresence>
              {cartData.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100 first:border-t-0"
                >
                  <div className="p-4 sm:py-6 sm:px-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-12 sm:col-span-7">
                        <div className="flex items-center">
                          <div className="mr-4">
                            <input
                              type="checkbox"
                              checked={!!selectedItems[item._id]}
                              onChange={() => handleCheckboxChange(item._id)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex-shrink-0 h-24 w-24 bg-gray-50 rounded overflow-hidden border border-gray-200">
                            <img
                              src={
                                item.image?.[0] ||
                                "https://placehold.co/100x100?text=No+Image"
                              }
                              alt={item.name}
                              className="h-full w-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://placehold.co/100x100?text=No+Image";
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 sm:line-clamp-1">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {item.category || "Category"}
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-900 sm:hidden">
                              {currency}
                              {item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-7 sm:col-span-2 flex justify-start sm:justify-center">
                        <div className="flex items-center border rounded-md shadow-sm">
                          <button
                            onClick={() =>
                              handleQuantityChange(
                                item._id,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50"
                            disabled={item.quantity <= 1}
                          >
                            <svg
                              className="w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <input
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val > 0) {
                                handleQuantityChange(item._id, val);
                              }
                            }}
                            className="w-10 h-8 text-center border-x text-sm focus:outline-none focus:ring-0"
                            type="number"
                            min="1"
                          />
                          <button
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity + 1)
                            }
                            className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-50"
                          >
                            <svg
                              className="w-3 h-3"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-3 sm:col-span-2 flex items-center justify-end">
                        <p className="text-sm font-medium text-gray-900">
                          {currency}
                          {item.totalPrice.toFixed(2)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-2 sm:col-span-1 flex items-center justify-end">
                        <button
                          onClick={() => removeItemFromCart(item._id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg
                            className="w-5 h-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:w-96">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden sticky top-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Order Summary
              </h3>
              <CartTotal cartData={cartData} selectedItems={selectedItems} />

              <div className="mt-8">
                <button
                  onClick={() =>
                    navigate("/place-order", {
                      state: {
                        cartData: cartData,
                        selectedItems: selectedItems,
                      },
                    })
                  }
                  className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  disabled={
                    Object.values(selectedItems).filter(Boolean).length === 0
                  }
                >
                  {Object.values(selectedItems).filter(Boolean).length === 0
                    ? "Select items to checkout"
                    : "Proceed to Checkout"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Need help?{" "}
                  <a
                    href="/contact"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Contact customer support
                  </a>
                </p>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
