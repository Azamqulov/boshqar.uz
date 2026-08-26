import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCustomerStore } from '../customer.store';

describe('useCustomerStore Pinia Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('initializes with empty customers array', () => {
    const store = useCustomerStore();
    expect(store.customers).toEqual([]);
    expect(store.suppliers).toEqual([]);
    expect(store.isLoading).toBe(false);
  });

  it('resets store properly', () => {
    const store = useCustomerStore();
    store.customers = [{ id: 'cust-1', name: 'Ali' }] as any;
    store.resetStore();
    expect(store.customers).toEqual([]);
  });
});
