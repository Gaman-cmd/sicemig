import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import 'chart.js/auto';

const Dashboard = () => {
  const [consultations, setConsultations] = useState([]);
  const [alertes, setAlertes] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stock, setStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [consultationsResponse, alertesResponse, patientsResponse, stockResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/consultations/"),
        axios.get("http://127.0.0.1:8000/api/alertes/"),
        axios.get("http://127.0.0.1:8000/api/patients/"),
        axios.get("http://127.0.0.1:8000/api/stock_infirmerie/")
      ]);

      setConsultations(consultationsResponse.data);
      setAlertes(alertesResponse.data);
      setPatients(patientsResponse.data);
      setStock(stockResponse.data);
    } catch (err) {
      setError("Erreur lors du chargement des données.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const consultationsPerMonth = consultations.reduce((acc, consultation) => {
    const month = new Date(consultation.date_consultation).getMonth();
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const consultationsPerDiagnosis = consultations.reduce((acc, consultation) => {
    const diagnosis = consultation.diagnostic;
    acc[diagnosis] = (acc[diagnosis] || 0) + 1;
    return acc;
  }, {});

  const stockData = {
    labels: stock.map(item => item.produit_nom),
    datasets: [
      {
        label: 'Quantité Disponible',
        data: stock.map(item => item.quantite_disponible),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const consultationsData = {
    labels: Object.keys(consultationsPerMonth).map(month => new Date(0, month).toLocaleString('default', { month: 'short' })),
    datasets: [
      {
        label: 'Consultations par mois',
        data: Object.values(consultationsPerMonth),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const alertesData = {
    labels: ['Alertes'],
    datasets: [
      {
        label: 'Nombre d\'alertes',
        data: [alertes.length],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const consultationsDiagnosisData = {
    labels: Object.keys(consultationsPerDiagnosis),
    datasets: [
      {
        label: 'Consultations par diagnostic',
        data: Object.values(consultationsPerDiagnosis),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
      },
    ],
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Tableau de Bord</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">Stock Infirmerie</h3>
            <Bar data={stockData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">Consultations par Mois</h3>
            <Line data={consultationsData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">Alertes</h3>
            <Doughnut data={alertesData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">Consultations par Diagnostic</h3>
            <Pie data={consultationsDiagnosisData} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">Nombre de Patients</h3>
            <p className="text-4xl font-bold">{patients.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;