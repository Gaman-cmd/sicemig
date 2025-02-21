//Sidebar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, ChevronLeft } from 'lucide-react';

const Sidebar = ({ 
  isOpen, 
  setIsOpen, 
  links, 
  currentPath, 
  onLinkClick, 
  onLogout 
}) => {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: isOpen ? 260 : 0 }}
      exit={{ width: 0 }}
      transition={{ type: "tween", duration: 0.3 }}
      className="fixed top-0 left-0 h-full bg-white shadow-lg z-50 overflow-hidden"
    >
      <div className="p-6 h-full flex flex-col">
        {/* Titre + Bouton Fermer */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-800">Medical System</h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.id}>
                <button 
                  onClick={() => {
                    onLinkClick(link.id);  // 🔥 Change le contenu
                    setIsOpen(false);      // 🔥 Ferme le menu après clic
                  }}
                  className={`w-full text-left flex items-center space-x-3 p-3 rounded-lg transition
                    ${currentPath === link.id 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-100'}
                  `}
                >
                  <link.icon size={20} />
                  <span className="text-sm font-medium">{link.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bouton Déconnexion */}
        <div className="mt-auto border-t pt-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
