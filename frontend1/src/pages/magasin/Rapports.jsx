import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Rapports() {
  const [rapports, setRapports] = useState([]); // Liste des rapports
  const [searchTerm, setSearchTerm] = useState(""); // Rechercher un rapport
  const [selectedRapport, setSelectedRapport] = useState(null); // Rapport sélectionné
  const [showModal, setShowModal] = useState(false); // Afficher la modale
  const [newRapport, setNewRapport] = useState({
    type_rapport: "",
    contenu: "",
    utilisateur: "",
  }); // Données du nouveau rapport

  // Charger les rapports depuis le backend
  const loadRapports = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/rapports/");
      setRapports(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des rapports :", error);
    }
  };

  useEffect(() => {
    loadRapports();
  }, []);

  // Gérer l'ajout d'un nouveau rapport
  const handleAddRapport = async () => {
    if (!newRapport.type_rapport || !newRapport.contenu || !newRapport.utilisateur) {
      alert("Tous les champs sont obligatoires !");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/rapports/", newRapport);
      alert("Rapport ajouté avec succès !");
      setNewRapport({ type_rapport: "", contenu: "", utilisateur: "" });
      setShowModal(false);
      loadRapports(); // Recharger les rapports
    } catch (error) {
      console.error("Erreur lors de l'ajout du rapport :", error.response.data);
      alert("Erreur lors de l'ajout du rapport !");
    }
  };

  // Filtrer les rapports par type ou contenu
  const filteredRapports = rapports.filter(
    (rapport) =>
      rapport.type_rapport.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rapport.contenu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-700">📄 Gestion des Rapports</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          + Nouveau Rapport
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un rapport..."
          className="border p-2 rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table des rapports */}
      <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 text-gray-700">
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Utilisateur</th>
            <th className="p-3 text-left">Date de création</th>
          </tr>
        </thead>
        <tbody>
          {filteredRapports.length > 0 ? (
            filteredRapports.map((rapport) => (
              <tr
                key={rapport.id}
                className="border-b cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedRapport(rapport)}
              >
                <td className="p-3">{rapport.type_rapport}</td>
                <td className="p-3">{rapport.utilisateur}</td>
                <td className="p-3">
                  {new Date(rapport.date_creation).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center p-3 text-gray-500">
                Aucun rapport trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modale pour ajouter un rapport */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Ajouter un Nouveau Rapport</h3>
            <div className="space-y-4">
              {/* Type de rapport */}
              <div>
                <label className="block text-sm font-medium">Type de Rapport</label>
                <select
                  className="w-full p-2 border rounded"
                  value={newRapport.type_rapport}
                  onChange={(e) =>
                    setNewRapport({ ...newRapport, type_rapport: e.target.value })
                  }
                >
                  <option value="">-- Sélectionner --</option>
                  <option value="stock">Rapport de Stock</option>
                  <option value="consultation">Rapport de Consultation</option>
                  <option value="bon_sortie">Rapport de Bon de Sortie</option>
                </select>
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium">Contenu</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows="3"
                  value={newRapport.contenu}
                  onChange={(e) =>
                    setNewRapport({ ...newRapport, contenu: e.target.value })
                  }
                  placeholder="Détails ou description du rapport"
                ></textarea>
              </div>

              {/* Utilisateur */}
              <div>
                <label className="block text-sm font-medium">Utilisateur</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={newRapport.utilisateur}
                  onChange={(e) =>
                    setNewRapport({ ...newRapport, utilisateur: e.target.value })
                  }
                  placeholder="ID de l'utilisateur"
                />
              </div>

              {/* Boutons */}
              <div className="flex justify-between mt-4">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={handleAddRapport}
                >
                  Ajouter
                </button>
                <button
                  className="text-red-600"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale des détails d'un rapport */}
      {selectedRapport && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">Détails du Rapport</h3>
            <p>
              <strong>Type :</strong> {selectedRapport.type_rapport}
            </p>
            <p>
              <strong>Utilisateur :</strong> {selectedRapport.utilisateur}
            </p>
            <p>
              <strong>Date :</strong>{" "}
              {new Date(selectedRapport.date_creation).toLocaleDateString()}
            </p>
            <p>
              <strong>Contenu :</strong> {selectedRapport.contenu}
            </p>
            <div className="mt-4 flex justify-between">
              <button
                className="text-blue-600"
                onClick={() => alert("Modifier le rapport (à implémenter)")}
              >
                Modifier
              </button>
              <button
                className="text-red-600"
                onClick={() => setSelectedRapport(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
