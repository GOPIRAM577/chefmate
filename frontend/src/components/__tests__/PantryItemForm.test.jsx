import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PantryItemForm from '../PantryItemForm';

describe('PantryItemForm', () => {
  it('renders form inputs correctly', () => {
    render(<PantryItemForm onAdd={vi.fn()} />);
    
    expect(screen.getByText('Add New Item')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Organic Milk')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., 1 Gallon')).toBeInTheDocument();
  });

  it('does not fire submit if required fields are empty', () => {
    const handleAdd = vi.fn();
    render(<PantryItemForm onAdd={handleAdd} />);
    
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(submitButton);
    
    expect(handleAdd).not.toHaveBeenCalled();
  });

  it('calls onAdd with correct data on valid submit', () => {
    const handleAdd = vi.fn();
    render(<PantryItemForm onAdd={handleAdd} />);
    
    // Fill out form
    fireEvent.change(screen.getByPlaceholderText('e.g., Organic Milk'), { target: { value: 'Apples' } });
    fireEvent.change(screen.getByPlaceholderText('e.g., 1 Gallon'), { target: { value: '5' } });
    
    // Submit
    const submitButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(submitButton);
    
    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith({
      name: 'Apples',
      quantity: '5'
    });
  });
});
