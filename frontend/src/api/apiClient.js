const API_BASE_URL = 'https://fah7927jb0.execute-api.us-east-1.amazonaws.com';

export const apiClient = {
  async fetchWithHandling(url, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API Request failed');
      }
      
      // Our backend wraps responses in a data object
      return data.data || data;
    } catch (error) {
      console.error(`API Error on ${url}:`, error);
      throw error;
    }
  },

  // Pantry Endpoints
  async getPantryItems(sortBy = 'expiry') {
    return this.fetchWithHandling(`/pantry/items?sort=${sortBy}`);
  },

  async addPantryItem(item) {
    return this.fetchWithHandling('/pantry/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async deletePantryItem(itemId) {
    return this.fetchWithHandling(`/pantry/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  // AI Recipe Endpoints
  async generateRecipes(mealType) {
    return this.fetchWithHandling('/recipes/generate', {
      method: 'POST',
      body: JSON.stringify({ mealType }),
    });
  },

  async saveRecipe(recipe) {
    return this.fetchWithHandling('/recipes/save', {
      method: 'POST',
      body: JSON.stringify(recipe),
    });
  },

  async getSavedRecipes() {
    return this.fetchWithHandling('/recipes/history');
  },

  // Photo Analysis Endpoint
  async uploadPhoto(base64Image) {
    return this.fetchWithHandling('/pantry/photo', {
      method: 'POST',
      body: JSON.stringify({ image: base64Image }),
    });
  }
};
