import React from 'react';
import Hero from '../components/Hero';
import LatestCollection from '../components/LatestCollection';
import BestSeller from '../components/BestSeller';
import OurPolicy from '../components/OurPolicy'
const Home = () => {
  return (
    <div style={{
      background: 'linear-gradient(to bottom, #f9f9f7 0%, #ffffff 100%)',
      minHeight: '100vh'
    }}>
      <Hero/>
      <LatestCollection/>
      <BestSeller/>
      <OurPolicy />
    </div>
  );
};

export default Home;