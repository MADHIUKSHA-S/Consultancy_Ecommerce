import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from './ProductItem.jsx';
import Title from './Title';

const RelatedProducts = ({ category, productId }) => {
  const { products } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const filtered = products
        .filter(item => item.category === category && item._id !== productId); // remove current product
  
      setRelated(filtered.slice(0, 5)); // limit to 5
    }
  }, [products, category, productId]);
  

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1={'RELATED'} text2={'PRODUCTS'} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {related.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.images}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
