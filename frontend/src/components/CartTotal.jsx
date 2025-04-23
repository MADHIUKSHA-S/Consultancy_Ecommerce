import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
  const { cartItems, products, currency } = useContext(ShopContext);
  const [subtotal, setSubtotal] = useState(0);

  // Recompute subtotal whenever cartItems or products change
  useEffect(() => {
    let total = 0;
    for (const itemId in cartItems) {
      // Ensure the cart item is structured correctly (either number or object with quantity)
      let quantity = cartItems[itemId];
      if (typeof quantity === 'object') {
        quantity = quantity.quantity;
      }

      // Only add valid items with a quantity greater than 0
      if (quantity > 0) {
        const product = products.find(p => p._id === itemId);
        if (product) {
          total += (product.price || 0) * quantity;
        }
      }
    }
    setSubtotal(total);
  }, [cartItems, products]); // Run this effect whenever cartItems or products change

  // Fixed shipping cost
  const shipping = 10;
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
