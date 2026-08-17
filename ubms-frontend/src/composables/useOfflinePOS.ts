import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useToast } from './useToast';

export interface OfflineOrder {
  id: string;
  offlineId: string;
  orderNumber: string;
  createdAt: string;
  completedAt: string;
  status: 'completed';
  orderType: string;
  tableNumber?: string | null;
  customer?: any;
  items: Array<{
    id: string;
    productId?: string;
    serviceId?: string;
    name?: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    total: number;
  }>;
  total: number;
  discountAmount: number;
  payments: Array<{
    id: string;
    amount: number;
    paymentMethod: {
      name: string;
      type: string;
    };
  }>;
  cashierName?: string;
  isOfflineSyncPending: boolean;
}

const STORAGE_KEY_QUEUE = 'boshqar_offline_orders_queue';
const STORAGE_KEY_PRODUCTS = 'boshqar_offline_products_cache';
const STORAGE_KEY_CATEGORIES = 'boshqar_offline_categories_cache';

// Global reactive state
const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
const offlineQueue = ref<OfflineOrder[]>([]);
const isSyncing = ref(false);

const loadQueueFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUEUE);
    if (raw) {
      offlineQueue.value = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load offline queue from localStorage', err);
    offlineQueue.value = [];
  }
};

const saveQueueToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(offlineQueue.value));
  } catch (err) {
    console.error('Failed to save offline queue to localStorage', err);
  }
};

// Initialize once
if (typeof window !== 'undefined') {
  loadQueueFromStorage();
}

export function useOfflinePOS() {
  const toast = useToast();

  const pendingCount = computed(() => offlineQueue.value.length);
  const hasPendingOrders = computed(() => offlineQueue.value.length > 0);

  // Cache catalog for offline usage
  const cacheCatalog = (products: any[], categories: any[]) => {
    try {
      if (products && products.length > 0) {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      }
      if (categories && categories.length > 0) {
        localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
      }
    } catch (err) {
      console.warn('Could not cache products for offline use (storage full)', err);
    }
  };

  const getCachedCatalog = () => {
    try {
      const rawProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      const rawCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      return {
        products: rawProducts ? JSON.parse(rawProducts) : [],
        categories: rawCategories ? JSON.parse(rawCategories) : [],
      };
    } catch (err) {
      return { products: [], categories: [] };
    }
  };

  // Enqueue an order created while offline
  const enqueueOfflineOrder = (payload: {
    orderType: string;
    customerId?: string;
    customer?: any;
    tableNumber?: string | null;
    items: Array<{
      productId?: string;
      serviceId?: string;
      name?: string;
      quantity: number;
      unitPrice: number;
      discountAmount?: number;
    }>;
    discountAmount?: number;
    payments: Array<{
      paymentMethodId: string;
      amount: number;
      paymentMethodName?: string;
      paymentMethodType?: string;
    }>;
    cashierName?: string;
  }): OfflineOrder => {
    const timestamp = new Date().toISOString();
    const shortRandom = Math.floor(1000 + Math.random() * 9000);
    const offlineId = `OFF-${Date.now().toString().slice(-6)}-${shortRandom}`;

    const total = payload.items.reduce((sum, i) => {
      const itemSub = i.quantity * i.unitPrice - (i.discountAmount || 0);
      return sum + Math.max(0, itemSub);
    }, 0) - (payload.discountAmount || 0);

    const offlineOrder: OfflineOrder = {
      id: offlineId,
      offlineId,
      orderNumber: `#${offlineId}`,
      createdAt: timestamp,
      completedAt: timestamp,
      status: 'completed',
      orderType: payload.orderType,
      tableNumber: payload.tableNumber,
      customer: payload.customer,
      items: payload.items.map((i, idx) => ({
        id: `off-item-${idx}-${Date.now()}`,
        productId: i.productId,
        serviceId: i.serviceId,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discountAmount: i.discountAmount || 0,
        total: i.quantity * i.unitPrice - (i.discountAmount || 0),
      })),
      total: Math.max(0, total),
      discountAmount: payload.discountAmount || 0,
      payments: payload.payments.map((p, idx) => ({
        id: `off-pay-${idx}-${Date.now()}`,
        amount: p.amount,
        paymentMethod: {
          name: p.paymentMethodName || 'Naqd pul (Offline)',
          type: p.paymentMethodType || 'cash',
        },
      })),
      cashierName: payload.cashierName || 'Kassir',
      isOfflineSyncPending: true,
    };

    offlineQueue.value.push(offlineOrder);
    saveQueueToStorage();

    return offlineOrder;
  };

  // Sync offline orders to backend API
  const syncOfflineOrders = async (apiInstance: any) => {
    if (isSyncing.value || offlineQueue.value.length === 0 || !navigator.onLine) {
      return;
    }

    isSyncing.value = true;
    const initialCount = offlineQueue.value.length;
    let syncedCount = 0;
    const remainingQueue: OfflineOrder[] = [];

    for (const order of offlineQueue.value) {
      try {
        await apiInstance.post('/orders', {
          orderType: order.orderType,
          customerId: order.customer?.id,
          tableNumber: order.tableNumber,
          tableName: order.tableNumber,
          items: order.items.map((i) => ({
            productId: i.productId,
            serviceId: i.serviceId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discountAmount: i.discountAmount,
          })),
          discountAmount: order.discountAmount,
          payments: order.payments.map((p) => ({
            amount: p.amount,
          })),
        });
        syncedCount++;
      } catch (err: any) {
        console.error(`Failed to sync offline order ${order.offlineId}`, err);
        // Keep in queue to retry later
        remainingQueue.push(order);
      }
    }

    offlineQueue.value = remainingQueue;
    saveQueueToStorage();
    isSyncing.value = false;

    if (syncedCount > 0) {
      toast.success(
        `${syncedCount} ta offline savdo serverga muvaffaqiyatli sinxronizatsiya qilindi!`,
        'Offline Sinxronizatsiya'
      );
    }

    if (remainingQueue.length > 0) {
      toast.warning(
        `${remainingQueue.length} ta savdoni sinxronlashda xatolik yuz berdi. Keyingi urinishda qayta yuboriladi.`,
        'Sinxronizatsiya'
      );
    }
  };

  // Setup online/offline listeners
  const setupListeners = (apiInstance?: any) => {
    const handleOnline = () => {
      isOnline.value = true;
      toast.info('Internet aloqasi tiklandi!', 'Tarmoq');
      if (apiInstance && offlineQueue.value.length > 0) {
        syncOfflineOrders(apiInstance);
      }
    };

    const handleOffline = () => {
      isOnline.value = false;
      toast.warning(
        'Internet aloqasi uzildi! Kassa avtomatik Offline rejimga o\'tkazildi. Savdolar xavfsiz davom etaveradi.',
        'Offline Rejim'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  return {
    isOnline,
    isSyncing,
    offlineQueue,
    pendingCount,
    hasPendingOrders,
    cacheCatalog,
    getCachedCatalog,
    enqueueOfflineOrder,
    syncOfflineOrders,
    setupListeners,
  };
}
