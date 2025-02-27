import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await API.get('/produits');
      setProducts(response.data);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <h1>Gestion des Produits Pharmaceutiques</h1>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Quantité en Stock</th>
            <th>Unité</th>
            <th>Date de Péremption</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.nom}</td>
              <td>{product.quantite_en_stock}</td>
              <td>{product.unite}</td>
              <td>{product.date_peremption}</td>
              <td>
                <button>Modifier</button>
                <button>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}