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
  X,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const StatusBadge = ({ status }) => {
  const styles = {
    "RECU": { 
      className: "bg-green-50 text-green-800",
      icon: <CheckCircle className="text-green-500" size={16} />
    },
    "EN_ATTENTE": { 
      className: "bg-yellow-50 text-yellow-800",
      icon: <AlertTriangle className="text-yellow-500" size={16} />
    }
  };

  const style = styles[status] || { 
    className: "bg-gray-50 text-gray-800",
    icon: null 
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${style.className}`}>
      {style.icon}
      {status}
    </span>
  );
};

const Commandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [produits, setProduits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState("TOUS");

  const [newCommande, setNewCommande] = useState({
    fournisseur: "",
    produits: [],
    status: "EN_ATTENTE"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [commandesRes, produitsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/commandes/"),
        axios.get("http://127.0.0.1:8000/api/produits/")
      ]);

      setCommandes(commandesRes.data);
      setProduits(produitsRes.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commandeId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      return;
    }
  
    try {
      await axios.delete(`http://127.0.0.1:8000/api/commandes/${commandeId}/`);
      loadData();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = error.response?.data?.message || "Erreur inattendue lors de la suppression.";
      alert(`Erreur lors de la suppression de la commande : ${errorMessage}`);
    }
  };

  const handleSave = async () => {
    if (!newCommande.fournisseur || newCommande.produits.length === 0) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }
  
    setSaving(true);
    try {
      if (editMode) {
        await axios.patch(`http://127.0.0.1:8000/api/commandes/${newCommande.id}/`, newCommande);
      } else {
        await axios.post("http://127.0.0.1:8000/api/commandes/", newCommande);
      }
      await loadData();
      setShowModal(false);
      setNewCommande({ fournisseur: "", produits: [], status: "EN_ATTENTE" });
      setEditMode(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error.response?.data || error);
      alert("Erreur lors de la sauvegarde de la commande");
    } finally {
      setSaving(false);
    }
  };

  const filteredCommandes = commandes.filter(commande => {
    const matchesSearch = commande.fournisseur.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "TOUS" || commande.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Package className="text-white" size={32} />
            <h1 className="text-2xl font-bold text-white">Gestion des Commandes</h1>
          </div>
          <button 
            onClick={() => {
              setEditMode(false);
              setNewCommande({ fournisseur: "", produits: [], status: "EN_ATTENTE" });
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
          >
            <PlusCircle className="mr-2" size={18} /> Nouvelle commande
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-6 bg-gray-100 border-b">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une commande..."
                className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="RECU">Reçu</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">
              <AlertTriangle className="mx-auto mb-4" size={48} />
              <p>{error}</p>
            </div>
          ) : filteredCommandes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="mx-auto mb-4" size={48} />
              <p>Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommandes.map(commande => (
                <div
                  key={commande.id}
                  onClick={() => {
                    setSelectedCommande(commande);
                    setShowDetailsModal(true);
                  }}
                  className="p-4 border rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">Commande #{commande.id}</h3>
                        <StatusBadge status={commande.status} />
                      </div>
                      <p className="text-gray-600">{commande.fournisseur}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {formatDate(commande.date_reception)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {commande.produits?.length || 0} produits
                        </p>
                      </div>
                      <ChevronRight 
                        className="text-gray-400 transition-transform group-hover:translate-x-1" 
                        size={20} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showDetailsModal && selectedCommande && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailsModal(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      Commande #{selectedCommande.id}
                    </h2>
                    <p className="text-gray-600 mb-1">Fournisseur: {selectedCommande.fournisseur}</p>
                    <p className="text-sm text-gray-500">Date de réception: {formatDate(selectedCommande.date_reception)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setNewCommande({
                          id: selectedCommande.id,
                          fournisseur: selectedCommande.fournisseur,
                          produits: selectedCommande.produits.map(p => ({
                            produit: p.id,
                            quantite: p.quantite
                          })),
                          status: selectedCommande.status
                        });
                        setEditMode(true);
                        setShowModal(true);
                        setShowDetailsModal(false);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedCommande.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {selectedCommande.produits.map((produitItem) => (
                        <tr key={produitItem.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {produitItem.produit?.nom || 'Produit inconnu'}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {produitItem.quantite}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

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
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                  {editMode ? "Modifier la commande" : "Nouvelle Commande"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fournisseur
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={newCommande.fournisseur}
                      onChange={(e) => setNewCommande({
                        ...newCommande,
                        fournisseur: e.target.value
                      })}
                      placeholder="Nom du fournisseur"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ajouter un produit
                    </label>
                    <select
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        const produitId = parseInt(e.target.value);
                        if (!produitId) return;
                        
                        const produitExiste = newCommande.produits.find((p) => p.produit === produitId);
                        if (!produitExiste) {
                          setNewCommande({
                            ...newCommande,
                            produits: [...newCommande.produits, { 
                              produit: produitId, 
                              quantite: 1,
                              recu: 0
                            }],
                          });
                        }
                      }}
                      value=""
                    >
                      <option value="">Sélectionner un produit</option>
                      {produits.map((produit) => (
                        <option key={produit.id} value={produit.id}>
                          {produit.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Produits sélectionnés</h3>
                    {newCommande.produits.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucun produit sélectionné</p>
                    ) : (
                      <div className="space-y-2">
                        {newCommande.produits.map((item, index) => {
                          const produitId = Number(item.produit);
                          const produitDetails = produits.find(p => p.id === produitId);
                          if (!produitDetails) {
                            console.warn(`Produit introuvable pour l'ID: ${produitId}`);
                          }
                          return (
                            <div key={`${produitId}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm font-medium">
                                {produitDetails?.nom || "Produit inconnu"}
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  className="w-20 p-2 border-2 border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  value={item.quantite}
                                  onChange={(e) => {
                                    const qte = parseInt(e.target.value, 10);
                                    if (isNaN(qte) || qte < 1) return;
                                    setNewCommande((prev) => ({
                                      ...prev,
                                      produits: prev.produits.map((p) =>
                                        p.produit === item.produit ? { ...p, quantite: qte } : p
                                      )
                                    }));
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    setNewCommande((prev) => ({
                                      ...prev,
                                      produits: prev.produits.filter((p) => p.produit !== item.produit)
                                    }));
                                  }}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving || !newCommande.fournisseur || newCommande.produits.length === 0}
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Enregistrement...
                      </span>
                    ) : (
                      editMode ? "Modifier la commande" : "Créer la commande"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Commandes;