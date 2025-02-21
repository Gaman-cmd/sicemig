import React, { useState, useEffect } from "react";
import axios from "axios";

const Consultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState(null);
  const [patients, setPatients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [newPrescription, setNewPrescription] = useState({ produit: "", quantite: 1 });

  const fetchConsultations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/consultations/");
      const consultationsWithPatientNames = await Promise.all(
        response.data.map(async (consultation) => {
          const patient = await axios.get(`http://127.0.0.1:8000/api/patients/${consultation.patient}/`);
          return { ...consultation, patientNom: `${patient.data.nom} ${patient.data.prenom}` };
        })
      );
      setConsultations(consultationsWithPatientNames);
    } catch (err) {
      setError("Erreur lors du chargement des consultations.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/patients/");
      setPatients(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des patients:", err);
    }
  };

  const fetchProduits = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/produits/");
      setProduits(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des produits:", err);
    }
  };

  useEffect(() => {
    fetchConsultations();
    fetchPatients();
    fetchProduits();
  }, []);

  const handleAddOrUpdateConsultation = async () => {
    if (!currentConsultation.patient || !currentConsultation.diagnostic || !currentConsultation.maladie) {
      alert("Les champs patient, diagnostic et maladie sont obligatoires !");
      return;
    }

    try {
      if (currentConsultation.id) {
        await axios.patch(
          `http://127.0.0.1:8000/api/consultations/${currentConsultation.id}/`,
          {
            ...currentConsultation,
            prescriptions,
          }
        );
        alert("Consultation modifiée avec succès !");
      } else {
        await axios.post("http://127.0.0.1:8000/api/consultations/", {
          ...currentConsultation,
          prescriptions,
        });
        alert("Consultation ajoutée avec succès !");
      }
      setModalVisible(false);
      setCurrentConsultation(null);
      setPrescriptions([]);
      fetchConsultations();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde :", err);
      alert("Erreur lors de la sauvegarde de la consultation.");
    }
  };

  const handleDeleteConsultation = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette consultation ?")) {
      return;
    }
    try {
      await axios.delete(`http://127.0.0.1:8000/api/consultations/${id}/`);
      alert("Consultation supprimée avec succès !");
      fetchConsultations();
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);
      alert("Erreur lors de la suppression de la consultation.");
    }
  };

  const handleAddPrescription = () => {
    if (!newPrescription.produit || !newPrescription.quantite || newPrescription.quantite <= 0) {
      alert("Les champs produit et quantité sont obligatoires et la quantité doit être supérieure à 0!");
      return;
    }

    const selectedProduct = produits.find(p => p.id === parseInt(newPrescription.produit, 10));

    setPrescriptions((prev) => [
      ...prev,
      { produit: newPrescription.produit, produit_nom: selectedProduct.nom, quantite_prescrite: newPrescription.quantite },
    ]);
    setNewPrescription({ produit: "", quantite: 1 });
  };

  const handleConsultationClick = async (consultation) => {
    setCurrentConsultation(consultation);
    const updatedPrescriptions = await Promise.all(
      consultation.prescriptions.map(async (prescription) => {
        const produit = produits.find((p) => p.id === prescription.produit) || {};
        return {
          ...prescription,
          produit_nom: produit.nom || "Produit inconnu",
        };
      })
    );
    setPrescriptions(updatedPrescriptions);
    setEditMode(false);
    setModalVisible(true);
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updatedPrescriptions = [...prescriptions];
    updatedPrescriptions[index][field] = value;
    setPrescriptions(updatedPrescriptions);
  };

  const filteredConsultations = consultations.filter(
    (consultation) =>
      consultation.patientNom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Liste des Consultations</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}

      <div className="mb-4 flex justify-between">
        <input
          type="text"
          placeholder="Rechercher une consultation..."
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={() => {
            setCurrentConsultation({
              patient: "",
              diagnostic: "",
              maladie: "",
              prescriptions: [],
            });
            setEditMode(true);
            setModalVisible(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md ml-4"
        >
          + Nouvelle Consultation
        </button>
      </div>

      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border text-left">Patient</th>
              <th className="p-3 border text-left">Maladie</th>
              <th className="p-3 border text-left">Date</th>
              <th className="p-3 border text-left">Diagnostic</th>
            </tr>
          </thead>
          <tbody>
            {filteredConsultations.map((consultation) => (
              <tr key={consultation.id} onClick={() => handleConsultationClick(consultation)} className="cursor-pointer">
                <td className="p-3 border">{consultation.patientNom}</td>
                <td className="p-3 border">{consultation.maladie}</td>
                <td className="p-3 border">{new Date(consultation.date_consultation).toLocaleString()}</td>
                <td className="p-3 border">{consultation.diagnostic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalVisible && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
            {editMode ? (
              <>
                <h3 className="text-xl font-bold mb-4">
                  {currentConsultation?.id ? "Modifier la Consultation" : "Nouvelle Consultation"}
                </h3>

                <select
                  className="mb-4 p-2 border rounded w-full"
                  value={currentConsultation?.patient || ""}
                  onChange={(e) => setCurrentConsultation({ ...currentConsultation, patient: e.target.value })}
                >
                  <option value="">Sélectionner un patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.nom} {patient.prenom}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Maladie"
                  className="mb-4 p-2 border rounded w-full"
                  value={currentConsultation?.maladie || ""}
                  onChange={(e) => setCurrentConsultation({ ...currentConsultation, maladie: e.target.value })}
                />

                <textarea
                  placeholder="Diagnostic"
                  className="mb-4 p-2 border rounded w-full"
                  value={currentConsultation?.diagnostic || ""}
                  onChange={(e) => setCurrentConsultation({ ...currentConsultation, diagnostic: e.target.value })}
                />
                <div className="mb-4">
                  <h4 className="font-bold mb-2">Prescriptions</h4>
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <select
                        className="p-2 border rounded w-1/2 mr-2"
                        value={prescription.produit}
                        onChange={(e) => handlePrescriptionChange(index, 'produit', e.target.value)}
                      >
                        <option value="">Sélectionner un produit</option>
                        {produits.map((produit) => (
                          <option key={produit.id} value={produit.id}>
                            {produit.nom}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantité"
                        className="p-2 border rounded w-1/4 mr-2"
                        value={prescription.quantite_prescrite}
                        onChange={(e) => handlePrescriptionChange(index, 'quantite_prescrite', parseInt(e.target.value, 10) || 1)}
                        min="1"
                      />
                    </div>
                  ))}
                  <div className="flex">
                    <select
                      className="p-2 border rounded w-1/2 mr-2"
                      value={newPrescription.produit}
                      onChange={(e) => setNewPrescription({ ...newPrescription, produit: e.target.value })}
                    >
                      <option value="">Sélectionner un produit</option>
                      {produits.map((produit) => (
                        <option key={produit.id} value={produit.id}>
                          {produit.nom}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Quantité"
                      className="p-2 border rounded w-1/4 mr-2"
                      value={newPrescription.quantite}
                      onChange={(e) => setNewPrescription({ ...newPrescription, quantite: parseInt(e.target.value, 10) || 1 })}
                      min="1"
                    />
                    <button onClick={handleAddPrescription} className="bg-green-600 text-white px-2 py-1 rounded">
                      Ajouter
                    </button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={handleAddOrUpdateConsultation}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => {
                      setModalVisible(false);
                      setCurrentConsultation(null);
                      setPrescriptions([]);
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Annuler
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold mb-4">
                  Consultation Détails
                </h3>

                <div className="mb-4">
                  <strong>Patient : </strong>{currentConsultation?.patientNom}
                </div>
                <div className="mb-4">
                  <strong>Maladie : </strong>{currentConsultation?.maladie}
                </div>
                <div className="mb-4">
                  <strong>Date : </strong>{new Date(currentConsultation?.date_consultation).toLocaleString()}
                </div>
                <div className="mb-4">
                  <strong>Diagnostic : </strong>{currentConsultation?.diagnostic}
                </div>
                <div className="mb-4">
                  <h4 className="font-bold mb-2">Prescriptions</h4>
                  {prescriptions.map((prescription, index) => (
                    <div key={index} className="flex justify-between items-center mb-2">
                      <span>{prescription.produit_nom}</span>
                      <span>{prescription.quantite_prescrite}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      setEditMode(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteConsultation(currentConsultation.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={() => {
                      setModalVisible(false);
                      setCurrentConsultation(null);
                      setPrescriptions([]);
                    }}
                    className="bg-gray-400 text-white px-4 py-2 rounded"
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Consultations;