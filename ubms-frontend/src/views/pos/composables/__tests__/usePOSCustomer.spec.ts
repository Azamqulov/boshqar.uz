import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePOSCustomer } from '../usePOSCustomer';
import { useDataStore } from '../../../../stores/data.store';

describe('usePOSCustomer Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('boshlangich holatda mijoz tanlanmagan bolishi kerak', () => {
    const { selectedCustomerId, selectedCustomer } = usePOSCustomer();
    expect(selectedCustomerId.value).toBe('');
    expect(selectedCustomer.value).toBeNull();
  });

  it('dataStore dagi mijozlar select options va badge sifatida togri formatlanishi kerak', () => {
    const dataStore = useDataStore();
    dataStore.customers = [
      { id: 'c-1', fullName: 'Anvar Narzullayev', phone: '+998901112233', debt: 0 },
      { id: 'c-2', fullName: 'Jasur Bek', phone: '+998909998877', debt: 55000 },
    ];

    const { customerSelectOptions } = usePOSCustomer();

    expect(customerSelectOptions.value.length).toBe(3);
    expect(customerSelectOptions.value[0].label).toContain('Mijoz tanlanmagan');
    expect(customerSelectOptions.value[1].label).toBe('Anvar Narzullayev (+998901112233)');
    expect((customerSelectOptions.value[2] as any).badge).toBeDefined();
  });

  it('selectedCustomerId ozgarganda selectedCustomer obyekti hisoblanishi kerak', () => {
    const dataStore = useDataStore();
    dataStore.customers = [
      { id: 'c-1', fullName: 'Nodira Qosimova', phone: '+998935554433' },
    ];

    const { selectedCustomerId, selectedCustomer } = usePOSCustomer();
    selectedCustomerId.value = 'c-1';

    expect(selectedCustomer.value).not.toBeNull();
    expect(selectedCustomer.value?.fullName).toBe('Nodira Qosimova');
  });
});
