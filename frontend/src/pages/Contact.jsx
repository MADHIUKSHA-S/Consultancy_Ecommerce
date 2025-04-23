import React from 'react'
import Title from '../components/Title';

import { assets } from '../assets/assets';

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 border-t'>
        <Title text1={'CONTACT'} text2={'US'}/>
      </div>
      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p>SIVAKUMAR (MANAGING PARTNER)</p>
          <p className='font-gray-500'>We are located at:</p>
          <p className='text-gray-500'>122/3, SRI RAHUL COMPLEX, COVAI MAIN ROAD, OPP PV PALAYAM PIRIVU, Jj Nagar, Perundurai, Erode-638052, Tamil Nadu, India</p>
          <p className='text-gray-500'> Our store is open from 9:30 AM to 7:00 PM, Monday to Saturday.</p>
          <p className='text-gray-500'>We look forward to serving you!</p>
          <p className='font-gray-500'>For any inquiries, please contact us at:</p>
          <p className='text-gray-500'>Tel: 9942714802 / 9944962786 <br /> Email: pbms10ss@gmail.com</p>
          
        </div>
      </div>
     
    </div>
  )
}

export default Contact;
