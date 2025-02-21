//Patients.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, UserPlus, X, Loader2 } from "lucide-react";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/patients/");
      setPatients(response.data);
    } catch (err) {
      showNotification("Erreur lors du chargement des patients", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-500 transform translate-x-full
      ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.remove("translate-x-full");
    }, 100);
    
    setTimeout(() => {
      notification.classList.add("translate-x-full");
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  };

  const handleSavePatient = async () => {
    if (!currentPatient.nom || !currentPatient.prenom || !currentPatient.age || !currentPatient.section) {
      showNotification("Tous les champs sont obligatoires", "error");
      return;
    }

    try {
      if (currentPatient.id) {
        await axios.patch(`http://127.0.0.1:8000/api/patients/${currentPatient.id}/`, currentPatient);
        showNotification("Patient modifié avec succès");
      } else {
        const response = await axios.post("http://127.0.0.1:8000/api/patients/", currentPatient);
        setPatients((prev) => [...prev, response.data]);
        showNotification("Patient ajouté avec succès");
      }
      setShowModal(false);
      setCurrentPatient(null);
      fetchPatients();
    } catch (err) {
      showNotification("Erreur lors de la sauvegarde", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce patient ?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/patients/${id}/`);
      showNotification("Patient supprimé avec succès");
      fetchPatients();
      setShowModal(false);
    } catch (error) {
      showNotification("Erreur lors de la suppression", "error");
    }
  };

  const filteredPatients = patients.filter((patient) =>
    patient.nom.toLowerCase().includes(search.toLowerCase()) ||
    patient.prenom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestion des Patients</h2>
          <button
            onClick={() => {
              setCurrentPatient({
                nom: "",
                prenom: "",
                age: "",
                sexe: "Homme",
                section: "",
              });
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nouveau Patient
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Âge</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sexe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => {
                      setCurrentPatient(patient);
                      setShowModal(true);
                    }}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.nom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.prenom}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.sexe}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.section}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-bold mb-6">
                {currentPatient?.id ? "Modifier le Patient" : "Nouveau Patient"}
              </h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentPatient?.nom || ""}
                  onChange={(e) => setCurrentPatient({ ...currentPatient, nom: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Prénom"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentPatient?.prenom || ""}
                  onChange={(e) => setCurrentPatient({ ...currentPatient, prenom: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Âge"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentPatient?.age || ""}
                  onChange={(e) => setCurrentPatient({ ...currentPatient, age: e.target.value })}
                />
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentPatient?.sexe || "Homme"}
                  onChange={(e) => setCurrentPatient({ ...currentPatient, sexe: e.target.value })}
                >
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
                <input
                  type="text"
                  placeholder="Section"
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentPatient?.section || ""}
                  onChange={(e) => setCurrentPatient({ ...currentPatient, section: e.target.value })}
                />

                <div className="flex justify-end space-x-4 mt-6">
                  {currentPatient?.id && (
                    <button
                      onClick={() => handleDelete(currentPatient.id)}
                      className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                  <button
                    onClick={handleSavePatient}
                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Patients;