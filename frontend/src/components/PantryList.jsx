import React, { useState } from 'react';
import ExpiryBadge from './ExpiryBadge';

const PantryList = ({ items, onDelete }) => {
  const [sortBy, setSortBy] = useState('expiry');

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'expiry') {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    } else {
      return new Date(b.addedDate || 0) - new Date(a.addedDate || 0);
    }
  });

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Pantry</h2>
        <select 
          className="bg-slate-800/50 text-slate-300 text-sm rounded-lg block p-2.5 border border-slate-700 focus:ring-blue-500 focus:border-blue-500 outline-none backdrop-blur-md transition-all"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="expiry">Sort by Expiry</option>
          <option value="added">Sort by Recently Added</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedItems.map((item) => (
          <div 
            key={item.itemId || item.name} 
            className="group relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:bg-slate-700/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-100">{item.name}</h3>
              <div className="flex items-center gap-3">
                <ExpiryBadge expiryDate={item.expiryDate} />
                <button 
                  onClick={() => onDelete && onDelete(item.itemId)} 
                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Delete item"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              Quantity: <span className="text-slate-200 font-medium">{item.quantity}</span>
            </div>
            {item.addedDate && (
              <div className="text-xs text-slate-500 mt-4">
                Added: {new Date(item.addedDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {items.length === 0 && (
        <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-slate-700/50 border-dashed">
          <p className="text-slate-400">Your pantry is empty. Add some items!</p>
        </div>
      )}
    </div>
  );
};

export default PantryList;
