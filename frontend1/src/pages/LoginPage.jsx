import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LucidePill } from "lucide-react"; // Icône de pilule

export default function LoginPage() {
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const { login, error, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(role, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        {/* Icône Pills */}
        <div className="flex justify-center mb-4">
          <LucidePill size={40} className="text-blue-500" />
        </div>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
          Gestion des Produits de l'EMIG
        </h2>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Enter your role"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
