// frontend/src/components/Consultations/ConsultationList.js
/*import React, { useEffect, useState } from 'react';
import consultationService from '../../services/consultationService';

const ConsultationList = () => {
  const [consultations, setConsultations] = useState([]);

  useEffect(() => {
    const fetchConsultations = async () => {
      const data = await consultationService.getConsultations();
      setConsultations(data);
    };
    fetchConsultations();
  }, []);

  return (
    <div>
      <h1>Consultation List</h1>
      <ul>
        {consultations.map(consultation => (
          <li key={consultation.id}>{consultation.patientId} - {consultation.diagnosis}</li>
        ))}
      </ul>
    </div>
  );
};

export default ConsultationList;
*/