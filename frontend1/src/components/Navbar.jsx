// Navbar.jsx
import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

const Navbar = ({ title, onMenuClick, onNotificationClick, onUserClick }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-40">
      <div className="flex items-center space-x-4">
        <button onClick={onMenuClick} className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={onNotificationClick} 
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition relative"
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
        </button>
        <button 
          onClick={onUserClick}
          className="text-gray-600 hover:bg-gray-100 p-2 rounded-full transition"
        >
          <User size={20} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;