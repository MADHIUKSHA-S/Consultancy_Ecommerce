import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

const ProductItem = ({ id, image = [], name, price }) => {
  const { currency, products } = useContext(ShopContext); // Get products from context
  const [mainImage, setMainImage] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (image?.length > 0) {
      setMainImage(image[0]); // Use passed image directly first
    } else if (products?.length > 0) {
      const foundProduct = products.find((item) => item._id === id);
      if (foundProduct?.image?.length > 0) {
        setMainImage(foundProduct.image[0]);
      } else {
        setMainImage("https://placehold.co/500x500?text=No+Image");
      }
    } else {
      setMainImage("https://placehold.co/500x500?text=No+Image");
    }
  }, [id, image, products]);

  return (
    <Link
      to={`/product/${id}`}
      className="block group relative rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      aria-label={`View ${name}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Sale tag - optional */}
      {Math.random() > 0.7 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
            SALE
          </span>
        </div>
      )}

      {/* Main Image Section with hover effect */}
      <div className="relative bg-gray-50 w-full aspect-[1/1] flex items-center justify-center overflow-hidden">
        <img
          src={mainImage}
          alt={name || "Product image"}
          className={`w-full h-full object-contain rounded transition-all duration-500 ${
            isHovering ? "scale-110" : "scale-100"
          }`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/300x300?text=No+Image";
          }}
        />

        {/* Hover overlay with quick view text */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-300 ${
            isHovering ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="bg-white text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm">
            View Details
          </div>
        </div>
      </div>

      {/* Product Info - enhanced design */}
      <div className="p-4 bg-white">
        <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-1 mb-1">
          {name || "Untitled Product"}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <p className="text-sm sm:text-base font-semibold text-gray-800">
            {currency}
            {price?.toFixed(2) || "N/A"}
          </p>

          {/* Stock indicator */}
          <span className="inline-flex items-center text-xs text-green-600 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5"></span>
            In Stock
          </span>
        </div>

      
      </div>
    </Link>
  );
};

export default ProductItem;
