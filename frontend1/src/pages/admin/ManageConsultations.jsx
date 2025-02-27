import React, { useState, useEffect } from 'react';
import API from '../../services/api';

export default function ManageConsultations() {
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    const fetchConsultations = async () => {
      const response = await API.get('/consultations');
      setConsultations(response.data);
    };
    fetchConsultations();
  }, []);

  return (
    <div>
      <h1>Gestion des Consultations</h1>
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Docteur</th>
            <th>Maladie</th>
            <th>Date de Consultation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {consultations.map(consultation => (
            <tr key={consultation.id}>
              <td>{consultation.patient.nom}</td>
              <td>{consultation.docteur.username}</td>
              <td>{consultation.maladie}</td>
              <td>{consultation.date_consultation}</td>
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