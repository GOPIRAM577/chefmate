import React, { useState } from 'react';

const RecipeCard = ({ recipe, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  if (!recipe) return null;

  const handleSave = () => {
    if (onSave && !isSaved) {
      onSave(recipe);
      setIsSaved(true);
    }
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl text-left relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 pr-8">
          {recipe.title}
        </h3>
        {recipe.prepTime && (
          <span className="text-xs font-medium bg-slate-700 text-slate-300 px-2 py-1 rounded-md shrink-0">
            {recipe.prepTime}
          </span>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Ingredients</h4>
        <ul className="space-y-1.5 text-sm">
          {recipe.usedIngredients?.map((ing, i) => (
            <li key={`used-${i}`} className="flex items-center text-slate-300">
              <svg className="w-4 h-4 mr-2 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              {ing}
            </li>
          ))}
          {recipe.missingIngredients?.map((ing, i) => (
            <li key={`missing-${i}`} className="flex items-center text-slate-400">
              <svg className="w-4 h-4 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span className="line-through opacity-70 mr-2">{ing}</span> <span className="text-xs text-orange-400 font-medium">(Missing)</span>
            </li>
          ))}
          {/* Fallback for older schemas */}
          {recipe.ingredients?.map((ing, i) => (
            <li key={`old-${i}`} className="flex items-center text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mr-2"></span>
              {ing}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">Instructions</h4>
        <ol className="list-decimal list-inside text-slate-400 space-y-2 text-sm">
          {recipe.instructions?.map((inst, i) => (
            <li key={i} className="pl-2 leading-relaxed">{inst}</li>
          ))}
        </ol>
      </div>

      <button 
        onClick={handleSave}
        disabled={isSaved}
        className={`w-full py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          isSaved 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
            : 'bg-slate-700/50 hover:bg-slate-600/50 text-white border border-slate-600/50 hover:border-slate-500/50'
        }`}
      >
        {isSaved ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            Saved to History
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            Save Recipe
          </>
        )}
      </button>
    </div>
  );
};

export default RecipeCard;
