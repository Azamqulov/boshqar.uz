import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import { useAuthStore } from './auth.store';

export interface PosShiftData {
  id: string;
  businessId?: string;
  shiftNumber: number;
  openedAt: string;
  closedAt?: string | null;
  startingCash: number;
  cashSales: number;
  cardSales: number;
  otherSales: number;
  totalSales: number;
  cashExpenses: number;
  expectedCash: number;
  actualCash?: number | null;
  difference?: number | null;
  status: 'open' | 'closed';
  notes?: string | null;
  ordersCount: number;
  user?: {
    id?: string;
    fullName?: string;
    phone?: string;
  };
  branch?: {
    id?: string;
    name?: string;
  };
  liveSummary?: any;
}

export const useShiftStore = defineStore('shift', () => {
  const authStore = useAuthStore();
  const currentShift = ref<PosShiftData | null>(null);
  const shiftsHistory = ref<PosShiftData[]>([]);
  const loading = ref(false);

  const getBusinessId = () => authStore.activeBusiness?.id || 'default';
  const getShiftKey = () => `ubms_current_shift_${getBusinessId()}`;
  const getHistoryKey = () => `ubms_shifts_history_${getBusinessId()}`;

  // Initialize from LocalStorage (Scoped per Business)
  const loadLocalShift = () => {
    try {
      const activeBizId = authStore.activeBusiness?.id;
      const shiftKey = getShiftKey();
      const histKey = getHistoryKey();

      const stored = localStorage.getItem(shiftKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!activeBizId || !parsed.businessId || parsed.businessId === activeBizId) {
          currentShift.value = parsed;
        } else {
          currentShift.value = null;
        }
      } else {
        currentShift.value = null;
      }

      const storedHistory = localStorage.getItem(histKey);
      if (storedHistory) {
        const parsedHist = JSON.parse(storedHistory);
        shiftsHistory.value = parsedHist.filter((s: any) => !activeBizId || !s.businessId || s.businessId === activeBizId);
      } else {
        shiftsHistory.value = [];
      }
    } catch (e) {
      console.error('Failed to load local shift:', e);
    }
  };

  const saveLocalShift = () => {
    const shiftKey = getShiftKey();
    const histKey = getHistoryKey();
    if (currentShift.value) {
      localStorage.setItem(shiftKey, JSON.stringify(currentShift.value));
    } else {
      localStorage.removeItem(shiftKey);
    }
    localStorage.setItem(histKey, JSON.stringify(shiftsHistory.value));
  };

  // 1. Fetch Current Shift (Backend + Local fallback)
  const fetchCurrentShift = async () => {
    loadLocalShift();
    try {
      let data = null;
      try {
        const res = await api.get('/shifts/current');
        data = res.data;
      } catch {
        try {
          const res = await api.get('/orders/shifts/current');
          data = res.data;
        } catch {
          // Keep local
        }
      }

      if (data && data.status === 'open') {
        currentShift.value = data;
        saveLocalShift();
      } else if (currentShift.value && currentShift.value.status === 'open') {
        // Keep local open shift
      } else {
        currentShift.value = null;
        localStorage.removeItem('ubms_current_shift');
      }
    } catch {
      // Offline / Local mode
    }
    return currentShift.value;
  };

  // 2. Open Shift
  const openShift = async (startingCash: number, notes?: string) => {
    const floatAmount = Number(startingCash) || 0;
    const userName =
      authStore.user?.fullName ||
      (authStore.user as any)?.name ||
      authStore.user?.phone ||
      'Kassir';
    const userId = authStore.user?.id || 'cashier-1';

    const localNewShift: PosShiftData = {
      id: 'shift-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      businessId: authStore.activeBusiness?.id,
      shiftNumber: (shiftsHistory.value.length || 0) + 1,
      openedAt: new Date().toISOString(),
      closedAt: null,
      startingCash: floatAmount,
      cashSales: 0,
      cardSales: 0,
      otherSales: 0,
      totalSales: 0,
      cashExpenses: 0,
      expectedCash: floatAmount,
      actualCash: null,
      difference: null,
      status: 'open',
      notes: notes || null,
      ordersCount: 0,
      user: {
        id: userId,
        fullName: userName,
      },
      branch: {
        name: authStore.activeBusiness?.name || 'Asosiy filial',
      },
    };

    currentShift.value = localNewShift;
    saveLocalShift();

    // Try backend sync in background without blocking
    try {
      let backendShift = null;
      try {
        const res = await api.post('/shifts/open', { startingCash: floatAmount, notes });
        backendShift = res.data;
      } catch {
        try {
          const res = await api.post('/orders/shifts/open', { startingCash: floatAmount, notes });
          backendShift = res.data;
        } catch {
          // Ignored, local shift already active
        }
      }

      if (backendShift && backendShift.id) {
        currentShift.value = { ...localNewShift, ...backendShift };
        saveLocalShift();
      }
    } catch (e) {
      console.warn('Backend shift open not available, using local shift:', e);
    }

    return currentShift.value;
  };

  // 3. Record Sale during active shift
  const recordSale = (orderTotal: number, paymentType: string) => {
    if (!currentShift.value || currentShift.value.status !== 'open') return;

    const total = Number(orderTotal) || 0;
    currentShift.value.totalSales += total;
    currentShift.value.ordersCount += 1;

    if (paymentType === 'cash') {
      currentShift.value.cashSales += total;
    } else if (paymentType === 'card') {
      currentShift.value.cardSales += total;
    } else {
      currentShift.value.otherSales += total;
    }

    // Expected cash = starting cash + cash sales - cash expenses
    currentShift.value.expectedCash =
      currentShift.value.startingCash +
      currentShift.value.cashSales -
      currentShift.value.cashExpenses;

    saveLocalShift();
  };

  // 4. Close Shift
  const closeShift = async (actualCash: number, notes?: string) => {
    if (!currentShift.value) return null;

    const actual = Number(actualCash) || 0;
    const expected = Number(currentShift.value.expectedCash || 0);
    const diff = actual - expected;

    const closed: PosShiftData = {
      ...currentShift.value,
      status: 'closed',
      closedAt: new Date().toISOString(),
      actualCash: actual,
      difference: diff,
      notes: notes ? `${currentShift.value.notes ? currentShift.value.notes + '\n' : ''}Yopish: ${notes}` : currentShift.value.notes,
    };

    // Add to history list
    shiftsHistory.value.unshift(closed);
    currentShift.value = null;
    saveLocalShift();

    // Try backend sync in background
    try {
      try {
        await api.post(`/shifts/${closed.id}/close`, { actualCash: actual, notes });
      } catch {
        try {
          await api.post(`/orders/shifts/${closed.id}/close`, { actualCash: actual, notes });
        } catch {
          // Ignored
        }
      }
    } catch (e) {
      console.warn('Backend shift close sync warning:', e);
    }

    return closed;
  };

  // 5. Fetch Shifts History
  const fetchShifts = async () => {
    loadLocalShift();
    try {
      let data: any[] = [];
      try {
        const res = await api.get('/shifts');
        data = res.data;
      } catch {
        try {
          const res = await api.get('/orders/shifts');
          data = res.data;
        } catch {
          // Ignored
        }
      }

      if (Array.isArray(data) && data.length > 0) {
        // Merge with local history avoiding duplicates
        const ids = new Set(data.map((s) => s.id));
        const localsNotInBackend = shiftsHistory.value.filter((s) => !ids.has(s.id));
        shiftsHistory.value = [...data, ...localsNotInBackend];
        saveLocalShift();
      }
    } catch {
      // Use local history
    }
    return shiftsHistory.value;
  };

  return {
    currentShift,
    shiftsHistory,
    loading,
    fetchCurrentShift,
    openShift,
    recordSale,
    closeShift,
    fetchShifts,
  };
});
