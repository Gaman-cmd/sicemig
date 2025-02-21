import { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

const DashboardLayout = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Menu latéral */}
      <motion.aside
        initial={{ width: 0 }}
        animate={{ width: isOpen ? 250 : 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 text-white fixed h-full top-0 left-0 shadow-lg"
      >
        <nav className="p-4 space-y-4">
          <button onClick={() => setIsOpen(false)} className="text-right">✖</button>
          <a href="/admin-dashboard" className="block p-2 hover:bg-gray-700">Admin</a>
          <a href="/infirmier-dashboard" className="block p-2 hover:bg-gray-700">Infirmier</a>
          <a href="/magasinier-dashboard" className="block p-2 hover:bg-gray-700">Magasinier</a>
        </nav>
      </motion.aside>

      {/* Contenu principal */}
      <motion.main
        animate={{ marginLeft: isOpen ? 250 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6"
      >
        <header className="flex items-center justify-between bg-white shadow p-4">
          <button onClick={() => setIsOpen(!isOpen)}>
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold">{title}</h1>
        </header>

        <div className="p-4">{children}</div>
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
