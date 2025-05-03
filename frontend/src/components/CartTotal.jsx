import React, { useEffect, useState } from 'react';

const CartTotal = ({ cartData, selectedItems }) => {
  const [subtotal, setSubtotal] = useState(0);
  const currency = "₹"; // You can replace with context or prop

  useEffect(() => {
    const total = cartData
      .filter((item) => selectedItems[item._id])
      .reduce((sum, item) => sum + item.totalPrice, 0);
    setSubtotal(total);
  }, [cartData, selectedItems]);

  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <div className="border rounded-lg p-6 shadow-sm bg-white text-gray-800">
      <h2 className="text-lg font-semibold mb-4">Cart Summary</h2>
      <div className="flex justify-between text-sm mb-2">
        <span>Subtotal</span>
        <span>{currency}{subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm mb-4">
        <span>Shipping</span>
        <span>{currency}{shipping.toFixed(2)}</span>
      </div>
      <hr className="mb-4" />
      <div className="flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>{currency}{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CartTotal;
// This component calculates and displays the cart total, including subtotal, shipping, and total amount. It uses the cartData and selectedItems props to compute the values dynamically.