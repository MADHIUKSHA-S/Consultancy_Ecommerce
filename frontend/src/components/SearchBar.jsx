import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import { useLocation } from "react-router-dom";

const SearchBar = () => {
  const { search, setSearch, showSearch } = useContext(ShopContext);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes("collection") && showSearch) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [location, showSearch]);

  return showSearch && visible ? (
    <div className="border-t border-b bg-gray-50 text-center py-4">
      <div className="inline-flex items-center justify-between border border-gray-400 px-4 py-2 rounded-full relative w-72 sm:w-96 bg-white">
        {/* Search Icon (always visible) */}
        <img
          className="w-4 absolute left-4 pointer-events-none"
          src={assets.search_icon}
          alt="Search"
        />
        {/* Input */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-6 bg-transparent outline-none text-sm"
          type="text"
          placeholder="Search"
        />
        {/* Clear icon (only visible when there's text) */}
        {search && (
          <img
            className="w-3 absolute right-4 cursor-pointer"
            src={assets.cross_icon}
            alt="Clear"
            onClick={() => setSearch("")}
          />
        )}
      </div>
    </div>
  ) : null;
};

export default SearchBar;
