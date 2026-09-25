import { useState, useEffect } from 'react'
import PantryList from './components/PantryList'
import PantryItemForm from './components/PantryItemForm'
import PhotoUpload from './components/PhotoUpload'
import RecipeGenerator from './components/RecipeGenerator'
import RecipeCard from './components/RecipeCard'
import ShoppingList from './components/ShoppingList'
import { apiClient } from './api/apiClient'
import './App.css'

function App() {
  const [items, setItems] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pantryRes, historyRes] = await Promise.all([
          apiClient.getPantryItems(),
          apiClient.getSavedRecipes()
        ]);
        setItems(pantryRes.items || []);
        setSavedRecipes(historyRes.history || []);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddItem = async (newItem) => {
    try {
      const savedItem = await apiClient.addPantryItem(newItem);
      setItems([...items, savedItem]);
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Failed to add item. Check console.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await apiClient.deletePantryItem(itemId);
      setItems(items.filter(i => i.itemId !== itemId));
    } catch (error) {
      console.error("Failed to delete item:", error);
      alert("Failed to delete item. Check console.");
    }
  };

  const handlePhotoUpload = async (file) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result.split(',')[1];
        try {
          const response = await apiClient.uploadPhoto(base64String);
          
          const candidates = response.candidates || [];
          if (candidates.length === 0) {
            alert("No food items were detected in the photo.");
            return;
          }

          // Create an array of promises for adding items
          const addPromises = candidates.map(candidate => {
            return apiClient.addPantryItem({
              name: candidate,
              category: "Other",
              quantity: 1,
              unit: "unit"
            });
          });

          const results = await Promise.allSettled(addPromises);
          
          // Re-fetch pantry items to get the updated list
          const pantryRes = await apiClient.getPantryItems();
          setItems(pantryRes.items || []);
          
          const successful = results.filter(r => r.status === 'fulfilled').length;
          alert(`Successfully detected and added ${successful} items from your photo!`);
        } catch (error) {
          console.error("Photo analysis failed:", error);
          alert("Failed to analyze photo. See console for details.");
        }
      };
      reader.onerror = (error) => {
        console.error("Failed to read file:", error);
        alert("Failed to read file.");
      };
    } catch (error) {
      console.error("Error during photo upload process:", error);
    }
  };

  const handleGenerateRecipes = async (mealType) => {
    try {
      const result = await apiClient.generateRecipes(mealType);
      setRecipes(result.recipes || []);
    } catch (error) {
      console.error("Failed to generate recipes:", error);
      if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
        alert("Rate limit exceeded. Please try again later.");
      } else if (error.message.includes("INVALID_PAYMENT_INSTRUMENT")) {
        alert("AWS Account Missing Credit Card: Bedrock requires a valid payment instrument on file to invoke Claude models. Please check your AWS Billing dashboard.");
      } else {
        alert("Failed to generate recipes. See console.");
      }
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      const saved = await apiClient.saveRecipe(recipe);
      setSavedRecipes([...savedRecipes, saved]);
    } catch (error) {
      console.error("Failed to save recipe:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 tracking-tight">
            PantryChef
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Your Serverless AI Kitchen Assistant</p>
        </header>

        <main className="flex flex-col gap-12">
          
          {/* AI Recipe Section */}
          <section>
            <RecipeGenerator onGenerate={handleGenerateRecipes} />
            
            {recipes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-5xl mx-auto">
                {recipes.map((rec, i) => (
                  <RecipeCard key={i} recipe={rec} onSave={handleSaveRecipe} />
                ))}
              </div>
            )}
          </section>

          <hr className="border-slate-700/50 my-4" />

          {/* Bottom Split Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PantryItemForm onAdd={handleAddItem} />
                <PhotoUpload onUpload={handlePhotoUpload} />
              </div>
              <PantryList items={items} onDelete={handleDeleteItem} />
            </div>
            
            <div className="lg:col-span-1">
              {savedRecipes.length > 0 ? (
                <ShoppingList savedRecipes={savedRecipes} />
              ) : (
                <div className="bg-slate-800/20 rounded-2xl border border-slate-700/50 border-dashed p-6 text-center">
                  <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  <p className="text-slate-400 text-sm">Save recipes to automatically build your shopping list.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default App
