import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const AlertCard = ({ alerts }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
        Alertes récentes
      </h2>
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg flex items-center justify-between ${
              alert.priority === 'high' ? 'bg-red-50' : 'bg-yellow-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                alert.priority === 'high' ? 'bg-red-100' : 'bg-yellow-100'
              }`}>
                <AlertTriangle className={`h-4 w-4 ${
                  alert.priority === 'high' ? 'text-red-500' : 'text-yellow-500'
                }`} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{alert.title}</h3>
                <p className="text-sm text-gray-600">{alert.message}</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">{alert.timeAgo}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertCard;