import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Package, 
  Search, 
  Edit2, 
  Trash2,
  FileText,
  TrendingUp,
  MapPin,
  Calendar,
  PlusCircle,
  Printer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BonsDeSortie = () => {
  const [bonsDeSortie, setBonsDeSortie] = useState([]);
  const [produits, setProduits] = useState([]);
  const [selectedBon, setSelectedBon] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("tous");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [newBon, setNewBon] = useState({
    destination: "",
    produits: [{ produit: "", quantite: "" }]
  });

  const showDetails = (bon) => {
    setSelectedBon(bon);
    setShowDetailsModal(true);
    setEditMode(false);
  };

  const loadBonsDeSortie = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/bons_sortie/");
      setBonsDeSortie(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des bons de sortie :", error);
    }
  };

  const loadProduits = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/produits/");
      setProduits(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits :", error);
    }
  };

  const handleAddBon = async () => {
    try {
      const payload = {
        destination: newBon.destination,
        produits: newBon.produits
          .filter((p) => p.produit && p.quantite > 0)
          .map((p) => ({
            produit: p.produit,
            quantite: parseInt(p.quantite, 10),
          })),
      };

      await axios.post("http://127.0.0.1:8000/api/bons_sortie/", payload);
      setShowDetailsModal(false);
      setNewBon({
        destination: "",
        produits: [{ produit: "", quantite: "" }]
      });
      loadBonsDeSortie();
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error.response?.data || error);
      alert("Erreur lors de l'ajout du bon de sortie !");
    }
  };

  const handleEditBon = () => {
    setEditMode(true);
    setNewBon({
      destination: selectedBon.destination,
      produits: selectedBon.produits.map((p) => ({
        produit: p.produit_id,
        quantite: p.quantite,
      })),
    });
  };

  const addProductField = () => {
    setNewBon(prev => ({
      ...prev,
      produits: [...prev.produits, { produit: "", quantite: "" }]
    }));
  };

  const removeProductField = (index) => {
    setNewBon(prev => ({
      ...prev,
      produits: prev.produits.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateBon = async () => {
    try {
      const payload = {
        destination: newBon.destination,
        produits: newBon.produits
          .filter((p) => p.produit && p.quantite > 0)
          .map((p) => ({
            produit: p.produit,
            quantite: parseInt(p.quantite, 10),
          })),
      };

      await axios.put(
        `http://127.0.0.1:8000/api/bons_sortie/${selectedBon.id}/`,
        payload
      );
      setShowDetailsModal(false);
      setEditMode(false);
      loadBonsDeSortie();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error.response?.data || error);
      alert("Erreur lors de la modification du bon de sortie !");
    }
  };

  const handleDeleteBon = async () => {
    if (!selectedBon) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bon de sortie ?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/bons_sortie/${selectedBon.id}/`);
        setShowDetailsModal(false);
        setSelectedBon(null);
        loadBonsDeSortie();
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        alert("Erreur lors de la suppression du bon de sortie !");
      }
    }
  };

  const filteredBonsDeSortie = bonsDeSortie.filter(bon => {
    const matchesSearch = 
      bon.numero.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      bon.destination.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "tous") return true;

    const bonDate = new Date(bon.date_sortie);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    if (startDate && endDate) {
      return bonDate >= startDate && bonDate <= endDate;
    }

    return true;
  });

  useEffect(() => {
    loadBonsDeSortie();
    loadProduits();
  }, []);

  const handlePrint = () => {
    const printContent = document.getElementById("print-section").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header avec bouton d'ajout */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <FileText className="text-white" size={32} />
            <h1 className="text-2xl font-bold text-white">Gestion des Bons de Sortie</h1>
          </div>
          <button 
            onClick={() => { 
              setShowDetailsModal(true); 
              setSelectedBon(null); 
              setEditMode(false);
              setNewBon({
                destination: "",
                produits: [{ produit: "", quantite: "" }]
              });
            }} 
            className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
          >
            <PlusCircle className="mr-2" size={18} /> Nouveau bon
          </button>
        </div>

        {/* Search et Filtres */}
        <div className="p-6 bg-gray-100 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par numéro ou destination..."
                className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-4 mt-4 md:mt-0">
              <select
                className="p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="tous">Tous les bons</option>
                <option value="date">Filtrer par date</option>
              </select>

              {filterType === "date" && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro du Bon</th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de Sortie</th>
                <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
              </tr>
            </thead>
            <tbody>
              {bonsDeSortie
                .filter((bon) => 
                  bon.numero.toString().includes(searchTerm) ||
                  bon.destination.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((bon) => (
                  <tr key={bon.id} className="hover:bg-gray-50 transition border-b" onClick={() => showDetails(bon)}>
                    <td className="p-4">{bon.numero}</td>
                    <td className="p-4">{new Date(bon.date_sortie).toLocaleDateString()}</td>
                    <td className="p-4">{bon.destination}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showDetailsModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-[600px] p-8"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-6 text-center">
                  {selectedBon ? (editMode ? "Modifier le bon" : "Détails du bon") : "Nouveau bon de sortie"}
                </h2>

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Destination"
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={editMode || !selectedBon ? newBon.destination : selectedBon.destination}
                    onChange={(e) => setNewBon({ ...newBon, destination: e.target.value })}
                    disabled={!editMode && selectedBon}
                  />

                  {(editMode || !selectedBon) && (
                    <div className="space-y-4 max-h-48 overflow-y-auto">
                      {newBon.produits.map((produit, index) => (
                        <div key={index} className="flex space-x-2">
                          <select
                            className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={produit.produit}
                            onChange={(e) => {
                              const updatedProduits = [...newBon.produits];
                              updatedProduits[index] = { ...produit, produit: e.target.value };
                              setNewBon({ ...newBon, produits: updatedProduits });
                            }}
                          >
                            <option value="">Sélectionner un produit</option>
                            {produits.map((p) => (
                              <option key={p.id} value={p.id}>{p.nom}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Qté"
                            className="w-24 p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={produit.quantite}
                            onChange={(e) => {
                              const updatedProduits = [...newBon.produits];
                              updatedProduits[index] = { ...produit, quantite: e.target.value };
                              setNewBon({ ...newBon, produits: updatedProduits });
                            }}
                          />
                          <button
                            onClick={() => removeProductField(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        onClick={addProductField}
                        className="w-full px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition"
                      >
                        + Ajouter un produit
                      </button>
                    </div>
                  )}

                  {!editMode && selectedBon && (
                    <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <h3 className="font-semibold mb-2">Produits</h3>
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-center text-sm text-gray-600">Produit</th>
                            <th className="text-center text-sm text-gray-600">Quantité</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBon.produits.map((p, index) => (
                            <tr key={index}>
                              <td className="py-1 text-center">{p.produit_nom}</td>
                              <td className="text-center">{p.quantite}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 mt-6">
                    {selectedBon ? (
                      editMode ? (
                        <button
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                          onClick={handleUpdateBon}
                        >
                          Enregistrer
                        </button>
                      ) : (
                        <>
                          <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            onClick={handleEditBon}
                          >
                            Modifier
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            onClick={handleDeleteBon}
                          >
                            Supprimer
                          </button>
                          <button
                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                            onClick={handlePrint}
                          >
                            <Printer size={18} /> Imprimer
                          </button>
                        </>
                      )
                    ) : (
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        onClick={handleAddBon}
                      >
                        Ajouter
                      </button>
                    )}
                  </div>
                </div>

                {/* Print Section */}
                <div id="print-section" style={{ display: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                    <img src="C:/Users/UNRULY/Downloads/LOGO.jpg" alt="Logo" style={{ width: "50px", marginRight: "10px" }} />
                    <h1 style={{ fontWeight: "bold", textAlign: "center" }}>Bons de Sortie</h1>
                  </div>
                  <h2 style={{ textAlign: "center" }}>Produits</h2>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f2f2f2" }}>
                        <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Produit</th>
                        <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Quantité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBon?.produits.map((p, index) => (
                        <tr key={index}>
                          <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{p.produit_nom}</td>
                          <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{p.quantite}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BonsDeSortie;