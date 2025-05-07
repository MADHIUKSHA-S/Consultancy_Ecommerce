import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import { motion } from "framer-motion";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (products && products.length > 0) {
      const foundProduct = products.find((item) => item._id === productId);
      if (foundProduct) {
        setProductData(foundProduct);
        setImage(foundProduct.image[0]);
        // Simulate loading for smooth transition
        setTimeout(() => setIsLoading(false), 300);
      }
    }
  }, [products, productId]);

  const handleAddToCart = () => {
    addToCart(productData._id, quantity);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <a href="/" className="hover:text-blue-600">
              Home
            </a>
          </li>
          <li>
            <span className="mx-1">/</span>
            <a href="/collection" className="hover:text-blue-600">
              Collection
            </a>
          </li>
          <li>
            <span className="mx-1">/</span>
            <a
              href={`/collection?category=${productData?.category}`}
              className="hover:text-blue-600"
            >
              {productData?.category}
            </a>
          </li>
          <li>
            <span className="mx-1">/</span>
            <span className="text-gray-900 font-medium">
              {productData?.name}
            </span>
          </li>
        </ol>
      </nav>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : productData ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-sm rounded-lg overflow-hidden"
        >
          <div className="p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-8">
            {/* Left Section: Images */}
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              {/* Thumbnails */}
              <div className="flex sm:flex-col order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto sm:w-24 gap-3 sm:max-h-[500px]">
                {productData.image.map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      onClick={() => setImage(item)}
                      src={item}
                      className={`w-20 h-20 object-cover cursor-pointer rounded-md ${
                        image === item
                          ? "ring-2 ring-blue-600 ring-offset-2"
                          : "ring-1 ring-gray-200"
                      }`}
                      alt={`${productData.name} - View ${index + 1}`}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Main Image */}
              <div className="order-1 sm:order-2 sm:flex-1 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                <motion.img
                  key={image} // Add key to trigger animation when image changes
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={image}
                  className="w-full h-auto max-h-[500px] object-contain p-4"
                  alt={productData.name}
                />
              </div>
            </div>

            {/* Right Section: Product Details */}
            <div className="flex-1 flex flex-col">
              <div className="pb-6 mb-6 border-b border-gray-100">
                {/* Category Tag */}
                <div className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-md mb-3">
                  {productData.category}
                </div>

                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                  {productData.name}
                </h1>

                <div className="flex items-center mb-3">
                  {/* Star Rating */}
                  <div className="flex text-amber-400 mr-2">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <svg
                      className="w-4 h-4 fill-current text-gray-300"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500">
                    4.0 (16 reviews)
                  </span>
                </div>

                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-baseline">
                  <span className="text-lg font-normal mr-1">{currency}</span>
                  {productData.price}
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {productData.description}
                </p>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center">
                    <label className="mr-3 text-sm font-medium text-gray-700">
                      Quantity
                    </label>
                    <div className="flex border border-gray-300 rounded-md">
                      <button
                        onClick={decreaseQuantity}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 focus:outline-none"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        className="w-12 text-center border-x border-gray-300 py-1 focus:outline-none"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                      />
                      <button
                        onClick={increaseQuantity}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 focus:outline-none"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-md font-medium flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    ADD TO CART
                  </motion.button>
                </div>
              </div>

              {/* Product Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Product Information
                </h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p>100% Original product</p>
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p>Cash on delivery available</p>
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p>Easy return & exchange within 7 days</p>
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p>Free shipping on orders above ₹500</p>
                  </div>
                </div>
              </div>

              {/* Additional Information (Optional) */}
              <div className="space-y-4">
                <div className="border-b border-gray-200">
                  <button className="flex justify-between w-full py-3 text-sm font-medium text-left text-gray-900 focus:outline-none">
                    <span>Specifications</span>
                    <svg
                      className="h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="border-b border-gray-200">
                  <button className="flex justify-between w-full py-3 text-sm font-medium text-left text-gray-900 focus:outline-none">
                    <span>Shipping Information</span>
                    <svg
                      className="h-5 w-5 text-gray-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium text-gray-900">
            Product not found
          </h2>
          <p className="mt-2 text-gray-500">
            The product you're looking for doesn't exist or has been removed.
          </p>
        </div>
      )}

      {/* Related Products Section */}
      {productData && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <RelatedProducts category={productData.category} />
        </div>
      )}
    </div>
  );
};

export default Product;
