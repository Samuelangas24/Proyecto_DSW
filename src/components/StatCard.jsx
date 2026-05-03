import React from 'react';

const StatCard = ({ title, value, color, icon }) => {
  return (
    <div className={`p-6 rounded-lg shadow-md text-white ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
};

export default StatCard;