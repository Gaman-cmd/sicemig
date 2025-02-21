import React, { useState, useEffect } from "react";
import axios from "axios";

const AlertesStock = ({ onAlertesUpdated }) => {
  const [alertes, setAlertes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAlertes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/alertes/");
      setAlertes(response.data);
      if (onAlertesUpdated) onAlertesUpdated();
    } catch (err) {
      setError("Erreur lors du chargement des alertes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertes();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🔔 Alertes de Stock</h2>

      {error && <div className="text-red-600">{error}</div>}
      {isLoading ? (
        <div>Chargement...</div>
      ) : alertes.length === 0 ? (
        <div className="text-gray-600">Aucune alerte de stock.</div>
      ) : (
        <ul className="list-disc pl-5">
          {alertes.map((alerte) => (
            <li key={alerte.id} className="mb-2">
              <span className="font-bold">{alerte.produit_nom} :</span>{" "}
              {alerte.message} ({alerte.date_alerte})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlertesStock;