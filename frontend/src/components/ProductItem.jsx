import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const ProductItem = ({ id, image = [], name, price }) => {
  const { currency, products } = useContext(ShopContext); // Get products from context
  const [mainImage, setMainImage] = useState('');

  // Log the props to verify the data being passed
  console.log('ProductItem Props:', { id, image, name, price });

  useEffect(() => {
    // Check if the product is available in the context
    if (products && products.length > 0) {
      const foundProduct = products.find((item) => item._id === id); // Find the product by id from context
      if (foundProduct) {
        setMainImage(foundProduct.image[0] || 'https://placehold.co/500x500?text=No+Image');
      }
    } else if (image.length > 0) {
      setMainImage(image[0]); // If no product in context, use the passed image prop
    } else {
      setMainImage('https://placehold.co/500x500?text=No+Image'); // Default fallback image
    }
  }, [id, image, products]); // Update if id or image or products change

  return (
    <Link
      to={`/product/${id}`}
      className="block group rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
      aria-label={`View ${name}`}
    >
      {/* Main Image Section */}
      <div className="relative bg-gray-100 w-full aspect-[1/1] flex items-center justify-center">
        <img
          src={mainImage}
          alt={name || 'Product image'}
          className="w-full h-full object-contain rounded"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/300x300?text=No+Image'; // Fallback on error
          }}
        />
      </div>

      {/* Product Info */}
      <div className="p-3">
        <h3 className="font-medium text-gray-900 truncate">
          {name || 'Untitled Product'}
        </h3>
        <p className="text-sm text-gray-600">
          {currency}{price?.toFixed(2) || 'N/A'}  {/* Format the price and ensure fallback */}
        </p>
      </div>
    </Link>
  );
};

export default ProductItem;
