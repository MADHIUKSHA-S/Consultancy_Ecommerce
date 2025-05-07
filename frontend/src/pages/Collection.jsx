import React, { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem.jsx";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");

  // Price filter state
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [currentRange, setCurrentRange] = useState({ min: 0, max: 10000 });

  // Initialize price range based on products
  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map((product) => product.price);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));

      setPriceRange({ min: minPrice, max: maxPrice });
      setCurrentRange({ min: minPrice, max: maxPrice });
    }
  }, [products]);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    // Apply search filter
    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    // Apply price range filter
    productsCopy = productsCopy.filter(
      (item) => item.price >= currentRange.min && item.price <= currentRange.max
    );

    setFilterProducts(productsCopy);
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;
      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;
      default:
        applyFilter();
        break;
    }
  };

  // Handle minimum price change
  const handleMinChange = (e) => {
    const newMin = parseInt(e.target.value);
    // Ensure min doesn't exceed max
    setCurrentRange((prev) => ({
      ...prev,
      min: Math.min(newMin, prev.max - 1),
    }));
  };

  // Handle maximum price change
  const handleMaxChange = (e) => {
    const newMax = parseInt(e.target.value);
    // Ensure max doesn't go below min
    setCurrentRange((prev) => ({
      ...prev,
      max: Math.max(newMax, prev.min + 1),
    }));
  };

  useEffect(() => {
    applyFilter();
  }, [category, search, showSearch, products, currentRange]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with title and results count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <Title text1={"ALL"} text2={"COLLECTIONS"} />
        <p className="text-gray-600 text-sm mt-1 sm:mt-0">
          Showing {filterProducts.length} products
        </p>
      </div>

      {/* Mobile filter toggle */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-lg shadow-sm"
        >
          <span className="font-medium text-gray-800">Filters & Sorting</span>
          <svg
            className={`w-5 h-5 text-gray-500 transform transition-transform ${
              showFilter ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* Left Sidebar - Filters */}
        <div
          className={`${
            showFilter ? "block" : "hidden"
          } sm:block w-full sm:w-64 flex-shrink-0`}
        >
          {/* Sort dropdown - shown in sidebar on mobile */}
          <div className="sm:hidden mb-6 bg-white rounded-lg shadow-sm p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              onChange={(e) => setSortType(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="relevant">Relevant</option>
              <option value="low-high">Price: Low to High</option>
              <option value="high-low">Price: High to Low</option>
            </select>
          </div>

          {/* Filter Sections */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Categories</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={toggleCategory}
                    value={"Bearings"}
                    checked={category.includes("Bearings")}
                  />
                  <span className="ml-3 text-sm text-gray-700">Bearings</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={toggleCategory}
                    value={"Couplings"}
                    checked={category.includes("Couplings")}
                  />
                  <span className="ml-3 text-sm text-gray-700">Couplings</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={toggleCategory}
                    value={"Grease"}
                    checked={category.includes("Grease")}
                  />
                  <span className="ml-3 text-sm text-gray-700">Grease</span>
                </label>
              </div>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Price Range</h3>
            </div>
            <div className="p-4">
              <div className="flex justify-between text-sm text-gray-700 mb-4">
                <span>₹{currentRange.min}</span>
                <span>₹{currentRange.max}</span>
              </div>

              {/* Sliders */}
              <div className="relative mt-2 mb-8">
                {/* Track */}
                <div className="absolute h-1 w-full bg-gray-200 rounded-full"></div>

                {/* Selected range */}
                <div
                  className="absolute h-1 bg-blue-600 rounded-full"
                  style={{
                    left: `${
                      ((currentRange.min - priceRange.min) /
                        (priceRange.max - priceRange.min)) *
                      100
                    }%`,
                    right: `${
                      100 -
                      ((currentRange.max - priceRange.min) /
                        (priceRange.max - priceRange.min)) *
                        100
                    }%`,
                  }}
                ></div>

                {/* Min handle */}
                <div
                  className="absolute w-4 h-4 bg-white rounded-full border-2 border-blue-600 shadow transform -translate-x-1/2 top-[-6px] cursor-pointer"
                  style={{
                    left: `${
                      ((currentRange.min - priceRange.min) /
                        (priceRange.max - priceRange.min)) *
                      100
                    }%`,
                    zIndex: 30,
                  }}
                ></div>

                {/* Max handle */}
                <div
                  className="absolute w-4 h-4 bg-white rounded-full border-2 border-blue-600 shadow transform -translate-x-1/2 top-[-6px] cursor-pointer"
                  style={{
                    left: `${
                      ((currentRange.max - priceRange.min) /
                        (priceRange.max - priceRange.min)) *
                      100
                    }%`,
                    zIndex: 20,
                  }}
                ></div>

                {/* Min slider - higher z-index */}
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={currentRange.min}
                  onChange={handleMinChange}
                  className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer"
                  style={{
                    height: "20px",
                    WebkitAppearance: "none",
                    zIndex: 40,
                    opacity: 0,
                  }}
                />

                {/* Max slider - lower z-index */}
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={currentRange.max}
                  onChange={handleMaxChange}
                  className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer"
                  style={{
                    height: "20px",
                    WebkitAppearance: "none",
                    zIndex: 20,
                    opacity: 0,
                  }}
                />
              </div>

              {/* Input fields for precise control */}
              <div className="flex items-center">
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    value={currentRange.min}
                    onChange={handleMinChange}
                    className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    min={priceRange.min}
                    max={currentRange.max}
                  />
                </div>
                <span className="mx-2 text-gray-500">to</span>
                <div className="relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    value={currentRange.max}
                    onChange={handleMaxChange}
                    className="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    min={currentRange.min}
                    max={priceRange.max}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right content - Products */}
        <div className="flex-1">
          {/* Sorting and Active Filters - desktop */}
          <div className="hidden sm:flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            {/* Sort dropdown - desktop */}
            <div className="relative inline-block text-left">
              <select
                onChange={(e) => setSortType(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
              >
                <option value="relevant">Sort by: Relevant</option>
                <option value="low-high">Sort by: Low to High</option>
                <option value="high-low">Sort by: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active filters - pill badges */}
          {(category.length > 0 ||
            currentRange.min > priceRange.min ||
            currentRange.max < priceRange.max) && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm font-medium text-gray-700 mr-2 self-center">
                Active Filters:
              </span>
              {category.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                >
                  {cat}
                  <button
                    type="button"
                    onClick={() =>
                      setCategory((prev) => prev.filter((item) => item !== cat))
                    }
                    className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:bg-blue-500 focus:text-white focus:outline-none"
                  >
                    <span className="sr-only">Remove filter for {cat}</span>
                    <svg
                      className="h-2 w-2"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 8 8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M1 1l6 6m0-6L1 7"
                      />
                    </svg>
                  </button>
                </span>
              ))}

              {(currentRange.min > priceRange.min ||
                currentRange.max < priceRange.max) && (
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  ₹{currentRange.min} - ₹{currentRange.max}
                  <button
                    type="button"
                    onClick={() => setCurrentRange(priceRange)}
                    className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:bg-blue-500 focus:text-white focus:outline-none"
                  >
                    <span className="sr-only">Remove price filter</span>
                    <svg
                      className="h-2 w-2"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 8 8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeWidth="1.5"
                        d="M1 1l6 6m0-6L1 7"
                      />
                    </svg>
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {filterProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterProducts.map((item, index) => (
                <ProductItem
                  key={index}
                  name={item.name}
                  id={item._id}
                  price={item.price}
                  image={item.images}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center rounded-lg shadow-sm">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No products found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search criteria.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setCategory([]);
                    setCurrentRange(priceRange);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Reset all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Collection;
