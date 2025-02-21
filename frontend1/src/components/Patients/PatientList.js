// frontend/src/components/Patients/PatientList.js
/*import React, { useEffect, useState } from 'react';
import patientService from '../../services/patientService';

const PatientList = () => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const data = await patientService.getPatients();
      setPatients(data);
    };
    fetchPatients();
  }, []);

  return (
    <div>
      <h1>Patient List</h1>
      <ul>
        {patients.map(patient => (
          <li key={patient.id}>{patient.name} - {patient.age}</li>
        ))}
      </ul>
    </div>
  );
};

export default PatientList;  */
