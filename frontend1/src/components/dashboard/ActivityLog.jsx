import React from 'react';
import { Activity } from 'lucide-react';

const ActivityLog = ({ activities }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Activity className="h-5 w-5 mr-2 text-blue-500" />
        Activités récentes
      </h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <div className="flex-grow">
              <p className="text-sm text-gray-800">{activity.description}</p>
              <p className="text-xs text-gray-500">{activity.user} - {activity.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;