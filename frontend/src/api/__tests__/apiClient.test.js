import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../apiClient';

// Mock global fetch
global.fetch = vi.fn();

describe('apiClient', () => {
  beforeEach(() => {
    global.fetch.mockClear();
  });

  it('fetches pantry items correctly', async () => {
    const mockResponse = { data: { items: [{ name: 'Apple' }] } };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await apiClient.getPantryItems();
    
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/pantry/items?sort=expiry'),
      expect.any(Object)
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('throws an error on failed request', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Internal Server Error' })
    });

    await expect(apiClient.getPantryItems()).rejects.toThrow('Internal Server Error');
  });

  it('sends correct payload for generateRecipes', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { recipes: [] } })
    });

    await apiClient.generateRecipes('dinner');
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/recipes/generate'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ mealType: 'dinner' })
      })
    );
  });
});
