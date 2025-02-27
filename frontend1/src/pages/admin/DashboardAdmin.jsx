//DashboardAdmin.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

// 🔥 Importation des pages
//import Dashboard from "./Dashboard";
import ManageProducts from "./ManageProducts";
import ManageUsers from "./ManageUsers";
//import SuiviActivites from "./SuiviActivites";
//import Alertes from "./Alertes";
//import Rapports from "./Rapports";
//import Parametres from "./Parametres";

// Composants du dashboard
import StockChart from "../../components/dashboard/StockChart";
import ConsultationChart from "../../components/dashboard/ConsultationChart";
import AlertCard from "../../components/dashboard/AlertCard";
import ActivityLog from "../../components/dashboard/ActivityLog";
import StatCard from "../../components/dashboard/StatCard";

import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  LogOut,
  Bell,
  User,
  AlertTriangle,
  FileText,
  PackageSearch,
  TrendingUp,
  Calendar,
  Box
} from "lucide-react";

const DashboardAdmin = () => {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [showAlertPopup, setShowAlertPopup] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const alertRef = useRef(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      utilisateurs: 0,
      produits: 0,
      alertes: 0,
      consultations: 0
    },
    alertes: [],
    activites: [],
    stockData: [],
    consultationData: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlertes = async () => {
    try {
      const response = await fetch('/api/admin/alertes');
      const data = await response.json();
      setAlerts(data);
      setAlertCount(data.length);
    } catch (err) {
      console.error("Erreur lors du chargement des alertes.");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/dashboard-data');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setDashboardData(data);
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError, 'Response text:', text);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000); // Rafraîchir toutes les 5 minutes
    return () => clearInterval(interval);
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
    { name: "Tableau de bord", id: "dashboard", icon: LayoutDashboard },
    { name: "Gestion utilisateurs", id: "utilisateurs", icon: Users },
    { name: "Suivi des activités", id: "activites", icon: Activity },
    { name: "Gestion des stocks", id: "products", icon: PackageSearch },
    { name: "Alertes", id: "alertes", icon: AlertTriangle },
    { name: "Rapports", id: "rapports", icon: FileText },
    { name: "Paramètres", id: "parametres", icon: Settings }
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (currentPage) {
      case "dashboard": 
        return (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
              <p className="text-gray-600 mt-2">
                Bienvenue, {user?.name}. Voici un aperçu de votre système.
              </p>
            </div>

            {/* Grille des statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Utilisateurs"
                value={dashboardData.stats.utilisateurs}
                icon={Users}
                trend={+5}
              />
              <StatCard 
                title="Produits"
                value={dashboardData.stats.produits}
                icon={Box}
                trend={-2}
              />
              <StatCard 
                title="Alertes"
                value={dashboardData.stats.alertes}
                icon={AlertTriangle}
                trend={+3}
                status="warning"
              />
              <StatCard 
                title="Consultations"
                value={dashboardData.stats.consultations}
                icon={Calendar}
                trend={+10}
                status="success"
              />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Evolution des stocks</h2>
                <StockChart data={dashboardData.stockData} />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Consultations</h2>
                <ConsultationChart data={dashboardData.consultationData} />
              </div>
            </div>

            {/* Alertes et Activités */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AlertCard alerts={dashboardData.alertes} />
              <ActivityLog activities={dashboardData.activites} />
            </div>
          </div>
        );
      case "utilisateurs": return <ManageUsers />;
      //case "activites": return <SuiviActivites />;
      case "products": return <ManageProducts />;
      //case "alertes": return <Alertes />;
      //case "rapports": return <Rapports />;
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
            Admin
          </h2>
          <LayoutDashboard size={24} className="text-blue-600" />
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
            {links.find(link => link.id === currentPage)?.name || 'Tableau de bord'}
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
                    <div className="text-gray-600">Aucune alerte.</div>
                  ) : (
                    <ul className="list-disc pl-5">
                      {alerts.map((alerte, index) => (
                        <li key={alerte.id || index} className="mb-2">
                          <span className="font-bold">{alerte.titre || alerte.type} :</span>{" "}
                          {alerte.message} ({alerte.date || alerte.created_at})
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

export default DashboardAdmin;