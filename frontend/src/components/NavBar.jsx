import React, { useContext, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { Link, NavLink, useLocation } from 'react-router-dom';

const NavBar = () => {
  const [visible, setVisible] = useState(false);
  const {
    token,
    userName,
    logout,
    loadingToken,
    navigate,
    cartItems,
    setShowSearch
  } = useContext(ShopContext);

  const location = useLocation();

  // 🧠 Compute cart count reactively
  const cartCount = Object.values(cartItems || {}).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="flex items-center justify-between py-5 font-medium">
      {/* Logo */}
      <Link to="/">
        <img src={assets.logo} className="w-36" alt="Logo" />
      </Link>

      {/* Navigation Links */}
      <ul className="hidden sm:flex gap-5 text-sm text-gray-700">
        {["/", "/collection", "/about", "/contact"].map((path, i) => {
          const labels = ["HOME", "COLLECTION", "ABOUT", "CONTACT"];
          return (
            <li key={path}>
              <NavLink to={path} className="flex flex-col items-center gap-1">
                <p>{labels[i]}</p>
                <hr className="w-2/4 border-none h-1.5 bg-gray-700 group-hover:block hidden" />
              </NavLink>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center gap-6">
        {/* Search Icon */}
        {location.pathname === '/collection' && (
          <img
            onClick={() => setShowSearch(true)}
            src={assets.search_icon}
            className="w-5 cursor-pointer"
            alt="Search"
          />
        )}

        {/* Profile Icon */}
        {!loadingToken && (
          <div className="group relative">
            <img
              onClick={() => token ? null : navigate('/login')}
              className="w-5 cursor-pointer"
              src={assets.profile_icon}
              alt="Profile"
            />
            {token && (
              <div className="hidden group-hover:block absolute right-0 pt-4 bg-white shadow-md rounded">
                <div className="flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded">
                  <p className="font-medium">{userName || 'My Profile'}</p>
                  <p onClick={() => navigate('/orders')} className="cursor-pointer hover:text-black">Orders</p>
                  <p onClick={logout} className="cursor-pointer hover:text-black">Logout</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🛒 Cart Icon with Live Count */}
        <Link to="/cart" className="relative">
          <img src={assets.cart_icon} className="w-5 min-w-5" alt="Cart" />
          {cartCount > 0 && (
            <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
              {cartCount}
            </p>
          )}
        </Link>

        {/* Hamburger Menu for Mobile */}
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-5 cursor-pointer sm:hidden"
          alt="Menu"
        />
      </div>

      {/* Side Drawer for Mobile Navigation */}
      <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full' : 'w-0'}`}>
        <div className="flex flex-col text-gray-600">
          <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-3">
            <img src={assets.dropdown_icon} className="h-4 rotate-180" alt="Back" />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to="/">HOME</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to="/collection">COLLECTION</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to="/about">ABOUT</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to="/contact">CONTACT</NavLink>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
