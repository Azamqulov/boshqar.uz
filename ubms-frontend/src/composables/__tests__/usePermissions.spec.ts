import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePermissions } from '../usePermissions';
import { useAuthStore } from '../../stores/auth.store';

describe('usePermissions composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('owner has full access across all modules', () => {
    const authStore = useAuthStore();
    authStore.activeBusiness = {
      id: 'bus-1',
      name: 'Test Market',
      role: 'owner',
    } as any;

    const { isOwner, canView, canCreate, canDelete } = usePermissions();
    expect(isOwner.value).toBe(true);
    expect(canView('products')).toBe(true);
    expect(canCreate('products')).toBe(true);
    expect(canDelete('products')).toBe(true);
  });

  it('cashier has restricted delete access', () => {
    const authStore = useAuthStore();
    authStore.activeBusiness = {
      id: 'bus-1',
      name: 'Test Market',
      role: 'cashier',
      allowedModules: ['pos', 'products'],
      actionPermissions: {
        products: { view: true, create: true, edit: false, delete: false },
      },
    } as any;

    const { isOwner, canView, canDelete } = usePermissions();
    expect(isOwner.value).toBe(false);
    expect(canView('products')).toBe(true);
    expect(canDelete('products')).toBe(false);
  });
});
