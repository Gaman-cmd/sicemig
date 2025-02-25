import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ConsultationChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Consultations',
        data: data.map(d => d.count),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
};

export default ConsultationChart;