import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth.store';

describe('useAuthStore Pinia Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    sessionStorage.clear();
  });

  it('boshlang\'ich holatda foydalanuvchi tizimga kirmagan (unauthenticated) bo\'lishi kerak', () => {
    const store = useAuthStore();
    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.activeBusiness).toBeNull();
  });

  it('setAuthData chaqirilganda foydalanuvchi va biznes saqlanishi kerak', () => {
    const store = useAuthStore();
    const mockData = {
      user: { id: 'u-1', fullName: 'Alisher Navoiy', phone: '+998901234567' },
      accessToken: 'jwt-access-token-xyz',
      refreshToken: 'jwt-refresh-token-xyz',
      businesses: [
        { id: 'b-1', name: 'Alisher Do\'koni', businessType: 'shop', currency: 'UZS', role: 'Owner' },
      ],
      activeBusiness: { id: 'b-1', name: 'Alisher Do\'koni', businessType: 'shop', currency: 'UZS', role: 'Owner' },
    };

    store.setAuthData(mockData);

    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.fullName).toBe('Alisher Navoiy');
    expect(store.token).toBe('jwt-access-token-xyz');
    expect(store.activeBusiness?.name).toBe('Alisher Do\'koni');
    expect(localStorage.getItem('ubms_access_token')).toBe('jwt-access-token-xyz');
  });

  it('setActiveBusiness chaqirilganda aktiv biznes va local storage yangilanishi kerak', () => {
    const store = useAuthStore();
    const biz1 = { id: 'b-1', name: 'Do\'kon A', businessType: 'shop', currency: 'UZS', role: 'Owner' };
    const biz2 = { id: 'b-2', name: 'Kafe B', businessType: 'restaurant', currency: 'USD', role: 'Owner' };

    store.businesses = [biz1, biz2];
    store.setActiveBusiness(biz2);

    expect(store.activeBusiness?.id).toBe('b-2');
    expect(store.businessType).toBe('restaurant');
    expect(localStorage.getItem('ubms_active_business_id')).toBe('b-2');
  });

  it('startDemoWorkspace offline fallback rejimida demo foydalanuvchi yaratishi kerak', async () => {
    const store = useAuthStore();
    await store.startDemoWorkspace('Toshkent Market', '+998909990011', 'shop');

    expect(store.isAuthenticated).toBe(true);
    expect(store.user?.fullName).toBe('Toshkent Market');
    expect(store.activeBusiness?.name).toBe('Toshkent Market');
    expect(store.isDemo).toBe(true);
  });

  it('logout chaqirilganda barcha auth ma\'lumotlari va localStorage tozalanadi', () => {
    const store = useAuthStore();
    store.setAuthData({
      user: { id: 'u-1', fullName: 'Test User', phone: '+998900000000' },
      accessToken: 'token-123',
      businesses: [{ id: 'b-1', name: 'Test Biz', businessType: 'shop', currency: 'UZS', role: 'Owner' }],
    });

    expect(store.isAuthenticated).toBe(true);

    store.logout();

    expect(store.isAuthenticated).toBe(false);
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.activeBusiness).toBeNull();
    expect(localStorage.getItem('ubms_access_token')).toBeNull();
  });
});
