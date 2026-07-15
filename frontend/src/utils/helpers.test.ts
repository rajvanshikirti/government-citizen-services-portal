import { describe, it, expect } from 'vitest';

describe('App utilities', () => {
  it('should format currency correctly', async () => {
    const { formatCurrency } = await import('./helpers');
    expect(formatCurrency(500)).toContain('500');
  });

  it('should return correct status colors', async () => {
    const { statusColors } = await import('./helpers');
    expect(statusColors.APPROVED).toBeDefined();
    expect(statusColors.REJECTED).toBeDefined();
  });
});
