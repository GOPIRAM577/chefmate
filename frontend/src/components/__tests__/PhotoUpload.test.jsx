import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PhotoUpload from '../PhotoUpload';

describe('PhotoUpload', () => {
  it('renders correctly', () => {
    render(<PhotoUpload onUpload={() => {}} />);
    expect(screen.getByText('Auto-Scan Fridge')).toBeInTheDocument();
  });

  it('submit button is disabled initially', () => {
    render(<PhotoUpload onUpload={() => {}} />);
    const analyzeButton = screen.getByRole('button', { name: /Analyze Photo/i });
    expect(analyzeButton).toBeDisabled();
  });
});
