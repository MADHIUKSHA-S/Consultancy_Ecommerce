import React, { useEffect, useState } from "react";
import { FaTag } from "react-icons/fa";

const CartTotal = ({ cartData, selectedItems }) => {
  const [subtotal, setSubtotal] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [discount, setDiscount] = useState(0);
  const currency = "₹";

  useEffect(() => {
    if (Array.isArray(cartData) && selectedItems) {
      // Calculate selected items count and subtotal
      let itemCount = 0;
      const total = cartData
        .filter((item) => selectedItems[item._id])
        .reduce((sum, item) => {
          // Add quantity to total item count
          itemCount += 1;
          return sum + item.totalPrice;
        }, 0);

      setTotalItems(itemCount);
      setSubtotal(total);

      // Apply discount based on total item count
      let discountAmount = 0;
      if (itemCount >= 3 && itemCount < 5) {
        // 10% discount for 3-4 items
        discountAmount = total * 0.05;
      } else if (itemCount >= 5 && itemCount < 7) {
        // 15% discount for 5-6 items
        discountAmount = total * 0.07;
      } else if (itemCount >= 7) {
        // 20% discount for 7+ items
        discountAmount = total * 0.1;
      }

      setDiscount(discountAmount);
    }
  }, [cartData, selectedItems]);

  const shipping = subtotal > 0 ? 10 : 0;
  // Apply discount to the subtotal
  const discountedSubtotal = subtotal - discount;
  const total = discountedSubtotal + shipping;

  // Calculate discount percentage for display
  const getDiscountPercentage = () => {
    if (totalItems >= 7) return "10%";
    if (totalItems >= 5) return "7%";
    if (totalItems >= 3) return "5%";
    return "0%";
  };

  return (
    <div className="border rounded-lg p-6 shadow-sm bg-white text-gray-800">
      <h2 className="text-lg font-semibold mb-4">Cart Summary</h2>

      <div className="flex justify-between text-sm mb-2">
        <span>Subtotal</span>
        <span>
          {currency}
          {subtotal.toFixed(2)}
        </span>
      </div>

      {/* Only show discount if applicable */}
      {discount > 0 && (
        <div className="flex justify-between text-sm mb-2 text-green-600">
          <span className="flex items-center">
            <FaTag className="mr-1" /> Discount ({getDiscountPercentage()})
          </span>
          <span>
            -{currency}
            {discount.toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex justify-between text-sm mb-4">
        <span>Shipping</span>
        <span>
          {currency}
          {shipping.toFixed(2)}
        </span>
      </div>

      <hr className="mb-4" />

      <div className="flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>
          {currency}
          {total.toFixed(2)}
        </span>
      </div>

      {/* Show discount tier information */}
      {subtotal > 0 && (
        <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
          {discount > 0 ? (
            <div className="text-green-600 text-sm flex items-start">
              <FaTag className="mr-1 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium">
                  You saved {currency}
                  {discount.toFixed(2)}!
                </p>
                {totalItems < 5 && (
                  <p className="text-xs mt-1">
                    Add {5 - totalItems} more item
                    {5 - totalItems !== 1 ? "s" : ""} to get 7% off
                  </p>
                )}
                {totalItems >= 5 && totalItems < 7 && (
                  <p className="text-xs mt-1">
                    Add {7 - totalItems} more item
                    {7 - totalItems !== 1 ? "s" : ""} to get 10% off
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-xs">
              <p>
                Add {3 - totalItems} more item{3 - totalItems !== 1 ? "s" : ""}{" "}
                to get 5% discount
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartTotal;
