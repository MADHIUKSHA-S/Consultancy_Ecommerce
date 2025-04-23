import React from 'react'
import Title from '../components/Title';
import { assets } from '../assets/assets';

const About = () => {
  return (
    <div className='max-w-7xl mx-auto px-4'>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'}/>
      </div>
      
      {/* Company Overview Section */}
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <div className='w-full md:w-1/2'>
          <img 
            className='w-full h-auto rounded-lg shadow-md' 
            src={assets.about_main} 
            alt="Perundurai Bearing Mill Stores" 
          />
          <div className='mt-4 grid grid-cols-3 gap-2'>
            <img 
              className='w-full h-24 object-cover rounded' 
              src={assets.about_1} 
              alt="Store interior"
            />
            <img 
              className='w-full h-24 object-cover rounded' 
              src={assets.about_2} 
              alt="Product display"
            />
            <img 
              className='w-full h-24 object-cover rounded' 
              src={assets.about_3} 
              alt="Customer service"
            />
          </div>
        </div>
        
        <div className='w-full md:w-1/2 flex flex-col justify-center gap-6 text-gray-600'>
          <h2 className='text-3xl font-bold text-gray-800'>Perundurai Bearing Mill Stores</h2>
          <p>Established in <strong>2010</strong>, Perundurai Bearing Mill Stores has been a trusted name in the industry, specializing in a wide range of bearings and mechanical products. Located in <strong>Perundurai, Erode, Tamil Nadu</strong>, we have built a strong reputation for quality and reliability.</p>
          
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='font-bold text-gray-800 mb-2'>Key Details:</h3>
            <ul className='list-disc pl-5 space-y-1'>
              <li><strong>Nature of Business:</strong> Retailer</li>
              <li><strong>Managing Partner:</strong> J Sivakumar</li>
              <li><strong>Total Number of Employees:</strong> Upto 10 people</li>
              <li><strong>Annual Turnover:</strong> Rs. 1.5 - 5 Crore</li>
              <li><strong>GST No:</strong> 33AALFP9926F1ZY</li>
            </ul>
          </div>
          
          <p>We take pride in our extensive product range that includes <strong>Ball Bearings, Roller Bearings, Bearing Accessories, and various mechanical components</strong>. Our commitment to quality and customer satisfaction has made us a preferred choice in the region.</p>
        </div>
      </div>
      
      {/* Why Choose Us Section */}
      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'}/>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-20'>
        <div className='border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
          <h3 className='font-bold text-lg text-gray-800 mb-3'>Quality Assurance</h3>
          <p className='text-gray-600'>We source our products from reputed manufacturers and ensure strict quality checks before delivery to our customers.</p>
        </div>
        <div className='border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
          <h3 className='font-bold text-lg text-gray-800 mb-3'>Extensive Inventory</h3>
          <p className='text-gray-600'>With a wide range of bearings and mechanical parts, we cater to diverse industrial requirements.</p>
        </div>
        <div className='border p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow'>
          <h3 className='font-bold text-lg text-gray-800 mb-3'>Industry Experience</h3>
          <p className='text-gray-600'>With nearly a decade in business, we bring valuable expertise and reliable solutions to our customers.</p>
        </div>
      </div>
    </div>
  )
}

export default About;