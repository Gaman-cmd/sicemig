import axios from 'axios';

const API = axios.create({
  baseURL: "http://localhost:8000/api", // URL du backend Django
  headers: {
    "Content-Type": "application/json",
  },
});

// Ajouter automatiquement le token aux requêtes si l'utilisateur est connecté
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
