// Produits.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Package, 
  Search, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  XCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Produits = () => {
  const [produits, setProduits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("TOUS");
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProduit, setNewProduit] = useState({ nom: "", numero_lot: "", quantite_en_stock: 0, unite: "plaquette", quantite_par_carton: 1, date_peremption: "" });

  useEffect(() => {
    loadProduits();
  }, []);

  const loadProduits = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/produits/");
      setProduits(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    }
  };

  const handleSave = async () => {
    if (!newProduit.nom.trim()) {
      alert("Le nom du produit est obligatoire !");
      return;
    }

    if (newProduit.quantite_en_stock < 0) {
      alert("La quantité ne peut pas être négative !");
      return;
    }

    if (!newProduit.date_peremption) {
      alert("Veuillez entrer une date de péremption !");
      return;
    }

    try {
      if (selectedProduit) {
        await axios.put(`http://127.0.0.1:8000/api/produits/${selectedProduit.id}/`, newProduit);
      } else {
        await axios.post("http://127.0.0.1:8000/api/produits/", newProduit);
      }

      setShowModal(false);
      setNewProduit({ nom: "", numero_lot: "", quantite_en_stock: 0, unite: "plaquette", quantite_par_carton: 1, date_peremption: "" });
      setSelectedProduit(null);
      loadProduits();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error.response?.data || error);
      alert("Erreur lors de l'ajout du produit !");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/produits/${id}/`);
      loadProduits();
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const getStatutStock = (produit) => {
    const aujourdHui = new Date();
    const datePeremption = new Date(produit.date_peremption);
    const differenceJours = Math.floor((datePeremption - aujourdHui) / (1000 * 60 * 60 * 24));

    if (produit.quantite_en_stock > 20) {
      return { 
        label: "Stock suffisant", 
        icon: <CheckCircle className="text-green-500" size={20} />,
        colorClass: "bg-green-50 text-green-800"
      };
    }
    if (differenceJours < 30) {
      return { 
        label: "Près à expirer", 
        icon: <AlertTriangle className="text-yellow-500" size={20} />,
        colorClass: "bg-yellow-50 text-yellow-800"
      };
    }
    return { 
      label: "Rupture de stock", 
      icon: <XCircle className="text-red-500" size={20} />,
      colorClass: "bg-red-50 text-red-800"
    };
  };

  const filteredProduits = produits.filter((produit) => {
    const statut = getStatutStock(produit).label;
    if (selectedFilter === "TOUS") return true;
    return statut === selectedFilter;
  });

  return (
    
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Package className="text-white" size={32} />
            <h1 className="text-2xl font-bold text-white">Gestion des Produits Pharmaceutiques</h1>
          </div>
          <button 
            onClick={() => { setShowModal(true); setSelectedProduit(null); }} 
            className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
          >
            <PlusCircle className="mr-2" size={18} /> Nouveau produit
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 bg-gray-100 border-b">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="TOUS">Tous les produits</option>
              <option value="Rupture de stock">❌ Rupture de stock</option>
              <option value="Près à expirer">⏳ Proches de la péremption</option>
              <option value="Stock suffisant">✅ Stock suffisant</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {["Nom", "Numéro de lot", "Quantité en stock", "Unité", "Date de péremption", "Statut"].map((header) => (
                  <th key={header} className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProduits
                .filter((p) => p.nom.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((produit) => {
                  const statut = getStatutStock(produit);
                  return (
                    <tr 
                      key={produit.id} 
                      className="hover:bg-gray-50 transition border-b"
                      onClick={() => { setSelectedProduit(produit); setNewProduit(produit); setShowModal(true); }}
                    >
                      <td className="p-4">{produit.nom}</td>
                      <td className="p-4">{produit.numero_lot}</td>
                      <td className="p-4">{produit.quantite_en_stock}</td>
                      <td className="p-4">{produit.unite}</td>
                     {/* { <td className="p-4">{produit.quantite_par_carton}</td>  */}
                      <td className="p-4">{produit.date_peremption}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statut.colorClass} inline-flex items-center space-x-1`}>
                          {statut.icon}
                          <span>{statut.label}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-96 p-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {selectedProduit ? "Détails du produit" : "Ajouter un produit"}
                </h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nom du produit"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newProduit.nom}
                    onChange={(e) => setNewProduit({ ...newProduit, nom: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Numéro de lot"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newProduit.numero_lot}
                    onChange={(e) => setNewProduit({ ...newProduit, numero_lot: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Quantité en stock"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newProduit.quantite_en_stock}
                    onChange={(e) => setNewProduit({ ...newProduit, quantite_en_stock: e.target.value })}
                  />
                  <select
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newProduit.unite}
                    onChange={(e) => setNewProduit({ ...newProduit, unite: e.target.value })}
                  >
                    <option value="carton">Carton</option>
                    <option value="plaquette">Plaquette</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Quantité par carton"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newProduit.quantite_par_carton}
                    onChange={(e) => setNewProduit({ ...newProduit, quantite_par_carton: e.target.value })}
                  />
                  <input
                    type="date"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={newProduit.date_peremption}
                    onChange={(e) => setNewProduit({ ...newProduit, date_peremption: e.target.value })}
                  />

                  {selectedProduit ? (
                    <div>
                      <button 
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        onClick={handleSave}
                      >
                        Modifier
                      </button>
                      <button 
                        className="w-full mt-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        onClick={() => handleDelete(selectedProduit.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      onClick={handleSave}
                    >
                      Ajouter
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    
  );
};

export default Produits;