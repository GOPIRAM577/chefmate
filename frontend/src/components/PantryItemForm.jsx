import React, { useState } from 'react';

const PantryItemForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    expiryDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity) return;
    
    const payload = { ...formData };
    if (!payload.expiryDate) {
      delete payload.expiryDate;
    }
    
    // Pass to parent or API
    onAdd(payload);
    
    // Reset
    setFormData({ name: '', quantity: '', expiryDate: '' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-6">Add New Item</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Item Name</label>
          <input 
            type="text" 
            placeholder="e.g., Organic Milk"
            required
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">Quantity</label>
            <input 
              type="text" 
              placeholder="e.g., 1 Gallon"
              required
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">Expiry <span className="hidden sm:inline">(Optional)</span></label>
            <input 
              type="date" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit"
          className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95 mt-2"
        >
          Add Item
        </button>
      </form>
    </div>
  );
};

export default PantryItemForm;
