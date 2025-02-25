import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

// 🔥 Importation des pages
import Dashboard from "./Dashboard";
import Patients from "./Patients";
import Consultations from "./Consultations";
import StockInfirmerie from "./StockInfirmerie";
import AlertesStock from "./AlertesStock";
//import AlertPage from "./AlertPage";
//import Rapports from "./Rapports";
//import Parametres from "./Parametres";

import {
  Users,
  Stethoscope,
  Package,
  FileText,
  Settings,
  LogOut,
  Bell,
  User,
  AlertTriangle,
  BarChart
} from "lucide-react";

const DashboardInfirmerie = () => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const alertRef = useRef(null);

  const fetchAlertes = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/alertes/");
      setAlerts(response.data);
      setAlertCount(response.data.length);
    } catch (err) {
      console.error("Erreur lors du chargement des alertes.");
    }
  };

  useEffect(() => {
    fetchAlertes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alertRef.current && !alertRef.current.contains(event.target)) {
        setShowAlertPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [alertRef]);

  const links = [
    { name: "Tableau de bord", id: "dashboard", icon: BarChart },
    { name: "Patients", id: "patients", icon: Users },
    { name: "Consultations", id: "consultations", icon: Stethoscope },
    { name: "Stock Infirmerie", id: "stock", icon: Package },
    { name: "Alertes Stock", id: "alert", icon: AlertTriangle },
    { name: "Rapports", id: "rapports", icon: FileText },
    { name: "Paramètres", id: "parametres", icon: Settings }
  ];

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard": return <Dashboard />;
      case "patients": return <Patients />;
      case "consultations": return <Consultations />;
      case "stock": return <StockInfirmerie />;
      case "alert": return <AlertesStock onAlertesUpdated={fetchAlertes} />;
      //case "alert-page": return <AlertPage />;
      // case "rapports": return <Rapports />;
      //case "parametres": return <Parametres />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Sidebar with auto-open on hover */}
      <motion.div 
        initial={{ width: 80 }}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsSidebarOpen(true)}
        onHoverEnd={() => setIsSidebarOpen(false)}
        className="fixed left-0 top-0 bottom-0 bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className={`text-2xl font-bold text-blue-600 ${!isSidebarOpen ? 'hidden' : ''}`}>
            Infirmerie
          </h2>
          <Stethoscope size={24} className="text-blue-600" />
        </div>
        
        <nav className="p-4 flex-grow">
          {links.map(link => (
            <motion.div
              key={link.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                onClick={() => setCurrentPage(link.id)}
                className={`
                  w-full flex items-center p-3 rounded-lg mb-2 
                  ${currentPage === link.id 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'hover:bg-gray-100 text-gray-700'}
                  ${!isSidebarOpen ? 'justify-center' : ''}
                `}
              >
                <link.icon className={`${isSidebarOpen ? 'mr-3' : ''}`} size={20} />
                {isSidebarOpen && link.name}
              </button>
            </motion.div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              onClick={logout}
              className={`
                w-full flex items-center p-3 rounded-lg 
                hover:bg-red-100 text-gray-700
                ${!isSidebarOpen ? 'justify-center' : ''}
              `}
            >
              <LogOut className={`${isSidebarOpen ? 'mr-3' : ''}`} size={20} />
              {isSidebarOpen && "Déconnexion"}
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div 
        className="flex-grow transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? "260px" : "80px" }}
      >
        {/* Dashboard Header */}
        <div className="bg-white shadow-md p-4 sticky top-0 z-40 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {links.find(link => link.id === currentPage)?.name || 'Dashboard'}
          </h1>
          <div className="relative flex items-center space-x-4">
            <button 
              className="relative text-gray-600 hover:text-blue-600" 
              onClick={() => setShowAlertPopup(!showAlertPopup)}
            >
              <Bell size={24} />
              {alertCount > 0 && (
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 bg-red-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>
            <button className="text-gray-600 hover:text-blue-600">
              <User size={24} />
            </button>
            {showAlertPopup && (
              <div ref={alertRef} className="absolute mt-12 right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">Alertes</h3>
                  {alerts.length === 0 ? (
                    <div className="text-gray-600">Aucune alerte de stock.</div>
                  ) : (
                    <ul className="list-disc pl-5">
                      {alerts.map((alerte) => (
                        <li key={alerte.id} className="mb-2">
                          <span className="font-bold">{alerte.produit_nom} :</span>{" "}
                          {alerte.message} ({alerte.date_alerte})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="p-6">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardInfirmerie;