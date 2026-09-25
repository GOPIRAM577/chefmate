import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecipeCard from '../RecipeCard';

describe('RecipeCard', () => {
  const mockRecipe = {
    title: 'Test Recipe',
    prepTime: '20 mins',
    usedIngredients: ['Chicken'],
    missingIngredients: ['Garlic'],
    instructions: ['Cook chicken']
  };

  it('renders used vs missing ingredients correctly', () => {
    render(<RecipeCard recipe={mockRecipe} />);
    
    // Check title and prep time
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('20 mins')).toBeInTheDocument();
    
    // Check ingredients
    expect(screen.getByText('Chicken')).toBeInTheDocument();
    expect(screen.getByText('Garlic')).toBeInTheDocument();
    expect(screen.getByText('(Missing)')).toBeInTheDocument();
    
    // Check instructions
    expect(screen.getByText('Cook chicken')).toBeInTheDocument();
  });

  it('renders fallback ingredients if missing schema', () => {
    const oldRecipe = {
      title: 'Old Recipe',
      ingredients: ['Salt', 'Pepper'],
      instructions: ['Mix']
    };
    render(<RecipeCard recipe={oldRecipe} />);
    expect(screen.getByText('Salt')).toBeInTheDocument();
    expect(screen.getByText('Pepper')).toBeInTheDocument();
  });
});
