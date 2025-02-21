import React, { useState } from 'react';
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { motion } from 'framer-motion';
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Activity,
  Settings
} from 'lucide-react';

const DashboardAdmin = () => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/admin/dashboard');

  const links = [
    { name: "Tableau de bord", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Gestion utilisateurs", path: "/admin/utilisateurs", icon: Users },
    { name: "Suivi des activités", path: "/admin/activites", icon: Activity },
    { name: "Paramètres", path: "/admin/parametres", icon: Settings },
    
  ];

  const handleLinkClick = (path) => {
    setCurrentPath(path);
    setIsSidebarOpen(false);
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
  };

  const handleUserClick = () => {
    console.log('User profile clicked');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        links={links}
        currentPath={currentPath}
        onLinkClick={handleLinkClick}
        onLogout={logout}
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
        />
        
        <main className="p-6 mt-16">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Tableau de bord</h1>
        </main>
      </motion.div>
    </div>
  );
};

export default DashboardAdmin; 