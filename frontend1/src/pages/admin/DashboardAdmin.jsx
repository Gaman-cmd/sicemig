import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { motion } from 'framer-motion';
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings,
  PackageSearch,
  AlertTriangle,
  FileText,
  TrendingUp,
  Calendar,
  Box
} from 'lucide-react';
// Ajout des imports manquants
import StockChart from "../../components/dashboard/StockChart";
import ConsultationChart from "../../components/dashboard/ConsultationChart";
import AlertCard from "../../components/dashboard/AlertCard";
import ActivityLog from "../../components/dashboard/ActivityLog";
import StatCard from "../../components/dashboard/StatCard";

const DashboardAdmin = () => {
  const { logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/admin/dashboard');
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

  const links = [
    { name: "Tableau de bord", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Gestion utilisateurs", path: "/admin/utilisateurs", icon: Users },
    { name: "Suivi des activités", path: "/admin/activites", icon: Activity },
    { name: "Gestion des stocks", path: "/admin/stocks", icon: PackageSearch },
    { name: "Alertes", path: "/admin/alertes", icon: AlertTriangle },
    { name: "Rapports", path: "/admin/rapports", icon: FileText },
    { name: "Paramètres", path: "/admin/parametres", icon: Settings },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Remplacer avec vos véritables appels API
        const response = await fetch('/api/admin/dashboard-data');
        const data = await response.json();
        setDashboardData(data);
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

  const handleLinkClick = (path) => {
    setCurrentPath(path);
    setIsSidebarOpen(false);
  };

  const handleNotificationClick = () => {
    // Implémenter la logique des notifications
  };

  const handleUserClick = () => {
    // Implémenter la logique du profil utilisateur
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        links={links}
        currentPath={currentPath}
        onLinkClick={handleLinkClick}
        onLogout={logout}
        user={user}
      />
      
      <motion.div 
        className="flex-grow transition-all duration-300"
        style={{ 
          marginLeft: isSidebarOpen ? 260 : 0,
          width: isSidebarOpen ? 'calc(100% - 260px)' : '100%'
        }}
      >
        <Navbar 
          title="Tableau de bord Admin" 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onNotificationClick={handleNotificationClick}
          onUserClick={handleUserClick}
          user={user}
          notifications={dashboardData.alertes}
        />
        
        <main className="p-6 mt-16">
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
        </main>
      </motion.div>
    </div>
  );
};

export default DashboardAdmin;