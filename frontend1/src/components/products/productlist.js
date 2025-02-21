// frontend/src/components/Products/ProductList.js
/*import React, { useEffect, useState } from 'react';
import productService from '../../services/productService';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await productService.getProducts();
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Product List</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;   */
