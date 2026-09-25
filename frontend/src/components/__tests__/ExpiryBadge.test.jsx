import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import ExpiryBadge from '../ExpiryBadge';

describe('ExpiryBadge', () => {
  beforeAll(() => {
    // Mock system time to a fixed date for reliable testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-03T12:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders nothing if no expiry date provided', () => {
    const { container } = render(<ExpiryBadge expiryDate={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows green "Good" badge for dates far in the future', () => {
    render(<ExpiryBadge expiryDate="2026-07-10T00:00:00Z" />);
    const badge = screen.getByText(/Good/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-emerald-300');
  });

  it('shows orange "Expiring Soon" badge for dates within 2 days', () => {
    render(<ExpiryBadge expiryDate="2026-07-04T00:00:00Z" />);
    const badge = screen.getByText(/Expiring Soon/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-orange-300');
  });

  it('shows red "Expired" badge for past dates', () => {
    render(<ExpiryBadge expiryDate="2026-07-01T00:00:00Z" />);
    const badge = screen.getByText(/Expired/i);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-red-300');
  });
});
