import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <div className="bg-[#f8f9fa] border-t border-gray-200 pt-12 px-6 sm:px-16">
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 text-sm text-gray-700'>

        {/* Left Section */}
        <div>
          <img src={assets.logo} className='mb-5 w-32' alt="Company Logo" />
          <p className='w-full md:w-2/3 leading-relaxed text-gray-600'>
            <span className='font-semibold'>PERUNDURAI BEARING AND MILL STORES (PBMS)</span> has rapidly established itself as a strong, reliable and trustworthy industrial supply company located at Coimbatore and Perundurai since 2010.
          </p>
        </div>

        {/* Our Company Section */}
        <div>
          <p className="text-xl font-semibold mb-5 text-black">Our Company</p>
          <ul className="flex flex-col gap-3 text-gray-600">
            <li>
              <Link to="/about" className="hover:text-black hover:underline transition-all duration-200">About Us</Link>
            </li>
            <li>
              <Link to="/collection" className="hover:text-black hover:underline transition-all duration-200">Our Products</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-black hover:underline transition-all duration-200">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Get in Touch Section */}
        <div>
          <p className="text-xl font-semibold mb-5 text-black">Get in Touch</p>
          <ul className="flex flex-col gap-2 text-gray-600 max-w-[300px]">
            <li className="font-medium">SIVAKUMAR (MANAGING PARTNER)</li>
            <li className="flex flex-col text-sm">
              <span className="font-semibold">Contact.no:</span>
              <span>9942714802 / 9944962786</span>
            </li>
            <li className="flex flex-col text-sm">
              <span className="font-semibold">Email:</span>
              <span className="break-all">pbms10ss@gmail.com</span>
            </li>
            <li className="text-sm">
              <span className="font-semibold">Address:</span>
              <br />
              122/3, SRI RAHUL COMPLEX, COVAI MAIN ROAD, OPP PV PALAYAM PIRIVU, Jj Nagar,
              Perundurai, Erode-638052, Tamil Nadu, India
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Note */}
      <div className="text-center text-gray-500 text-xs mt-12 pb-6">
        © {new Date().getFullYear()} PBMS. All rights reserved.
      </div>
    </div>
  );
};

export default Footer;
