import React from 'react';

export const Card = ({ children, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-2xl p-4 ${className || ''}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return (
    <div className={`mb-4 ${className || ''}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }) => {
  return (
    <h3 className={`text-xl font-semibold text-gray-800 ${className || ''}`}>
      {children}
    </h3>
  );
};

export const CardContent = ({ children, className }) => {
  return (
    <div className={`text-gray-600 ${className || ''}`}>
      {children}
    </div>
  );
};
