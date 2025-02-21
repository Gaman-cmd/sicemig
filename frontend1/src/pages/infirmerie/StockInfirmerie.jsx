//StockInfirmerie.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const StockInfirmerie = () => {
  const [stock, setStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editStock, setEditStock] = useState(null);

  // Charger les stocks depuis le backend
  const fetchStock = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/stock_infirmerie/");
      setStock(response.data);
    } catch (err) {
      setError("Erreur lors du chargement du stock.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleUpdateStock = async (id, nouvelleQuantite) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/api/stock_infirmerie/modifier/${id}/`, {
        quantite_disponible: nouvelleQuantite,
      });
      alert("Stock mis à jour avec succès !");
      fetchStock();
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      alert("Erreur lors de la mise à jour du stock.");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Stock Infirmerie</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border text-left">Produit</th>
              <th className="p-3 border text-left">Quantité Disponible</th>
              <th className="p-3 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) => (
              <tr key={item.id}>
                <td className="p-3 border">{item.produit_nom}</td>
                <td className="p-3 border">
                  {editStock === item.id ? (
                    <input
                      type="number"
                      className="border p-1 rounded w-20"
                      defaultValue={item.quantite_disponible}
                      onBlur={(e) => handleUpdateStock(item.id, e.target.value)}
                    />
                  ) : (
                    item.quantite_disponible
                  )}
                </td>
                <td className="p-3 border">
                  <button
                    onClick={() => setEditStock(editStock === item.id ? null : item.id)}
                    className="text-blue-600"
                  >
                    {editStock === item.id ? "Enregistrer" : "Modifier"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StockInfirmerie;
