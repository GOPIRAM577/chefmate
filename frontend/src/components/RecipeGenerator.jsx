import React, { useState } from 'react';

const RecipeGenerator = ({ onGenerate }) => {
  const [mealType, setMealType] = useState('any');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      onGenerate(mealType);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 bg-indigo-900/30 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-8 shadow-2xl text-center">
      <h2 className="text-2xl font-bold text-white mb-2">What's for dinner?</h2>
      <p className="text-indigo-200 mb-6">Let Claude AI create a custom recipe using what's currently in your pantry.</p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <select 
          className="bg-slate-800/80 text-white rounded-lg px-4 py-3 border border-indigo-500/50 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition-all w-full sm:w-auto"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="any">Any Meal</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack / Dessert</option>
        </select>

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${isGenerating ? 'bg-indigo-500/50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 active:scale-95 shadow-indigo-500/25'}`}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Thinking...
            </span>
          ) : (
            '✨ Generate Recipes'
          )}
        </button>
      </div>
    </div>
  );
};

export default RecipeGenerator;
