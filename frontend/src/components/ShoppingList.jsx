import React, { useState } from 'react';

const ShoppingList = ({ savedRecipes }) => {
  const [dismissedItems, setDismissedItems] = useState(new Set());

  // Aggregate all missing ingredients from saved recipes
  const missingItems = new Set();
  savedRecipes.forEach(recipe => {
    if (recipe.missingIngredients) {
      recipe.missingIngredients.forEach(ing => {
        missingItems.add(ing.toLowerCase());
      });
    }
  });

  const uniqueMissingItems = Array.from(missingItems).filter(item => !dismissedItems.has(item));

  if (uniqueMissingItems.length === 0) return null;

  const handleDismiss = (item) => {
    const newSet = new Set(dismissedItems);
    newSet.add(item);
    setDismissedItems(newSet);
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        </div>
        <h2 className="text-xl font-bold text-white">Smart Shopping List</h2>
      </div>
      
      <p className="text-sm text-slate-400 mb-4">Automatically generated from your saved recipes.</p>

      <ul className="space-y-2">
        {uniqueMissingItems.map((item, idx) => (
          <li key={idx} className="group flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-orange-500/30 transition-colors">
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-900"
              />
              <span className="text-slate-200 capitalize">{item}</span>
            </div>
            <button 
              onClick={() => handleDismiss(item)}
              className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
              title="Remove from list"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShoppingList;
