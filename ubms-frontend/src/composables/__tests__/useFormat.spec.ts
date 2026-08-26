import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFormat } from '../useFormat';

describe('useFormat composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('formats currency correctly in UZS', () => {
    const { formatCurrency } = useFormat();
    expect(formatCurrency(15000)).toContain("15");
    expect(formatCurrency(0)).toContain("0");
    expect(formatCurrency(-5000)).toContain("5");
  });

  it('formats date and time accurately', () => {
    const { formatDate, formatDateTime } = useFormat();
    const d = new Date('2026-08-26T12:30:00Z');
    expect(formatDate(d)).toContain('2026');
    expect(formatDateTime(d)).toContain('2026');
    expect(formatDate(null)).toBe('-');
  });
});
