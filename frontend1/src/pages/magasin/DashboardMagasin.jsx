//DashboardMagasin.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

// 🔥 Importation des pages
import Accueil from "../magasin/Accueil";
import Produits from "../magasin/Produits";
import Commandes from "../magasin/Commandes";
import BonsDeSortie from "../magasin/BonsDeSortie";
import Rapports from "../magasin/Rapports";
import Parametres from "../magasin/Parametres";

import {
  Package,
  FileText,
  ShoppingCart,
  ClipboardList,
  Settings,
  LogOut,
  Home,
  Bell,
  User
} from "lucide-react";

const DashboardMagasin = () => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("accueil");

  const links = [
    { name: "Accueil", id: "accueil", icon: Home },
    { name: "Produits", id: "produits", icon: Package },
    { name: "Commandes", id: "commandes", icon: ShoppingCart },
    { name: "Bons de sortie", id: "bons-de-sortie", icon: ClipboardList },
    //{ name: "Rapports", id: "rapports", icon: FileText },
    //{ name: "Paramètres", id: "parametres", icon: Settings }
  ];

  const renderContent = () => {
    switch (currentPage) {
      case "accueil": return <Accueil />;
      case "produits": return <Produits />;
      case "commandes": return <Commandes />;
      case "bons-de-sortie": return <BonsDeSortie />;
     // case "rapports": return <Rapports />;
     // case "parametres": return <Parametres />;
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
            Magasin
          </h2>
          <Package size={24} className="text-blue-600" />
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
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-600">
              <Bell size={24} />
            </button>
            <button className="text-gray-600 hover:text-blue-600">
              <User size={24} />
            </button>
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

export default DashboardMagasin;