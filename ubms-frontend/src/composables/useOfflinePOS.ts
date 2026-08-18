import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../services/api';
import { useToast } from './useToast';

const QUEUE_STORAGE_KEY = 'ubms_offline_orders_queue';
const CATALOG_STORAGE_KEY = 'ubms_offline_cached_catalog';

export interface OfflineOrderPayload {
  localId?: string;
  timestamp?: number;
  orderType?: string;
  customerId?: string;
  customer?: any;
  tableNumber?: string;
  tableName?: string;
  items: Array<{
    productId?: string;
    id?: string;
    serviceId?: string;
    name?: string;
    quantity: number;
    unitPrice?: number;
    price?: number;
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
  notes?: string;
}

export interface CachedCatalog {
  products: any[];
  categories: any[];
}

const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true);
const offlineQueue = ref<OfflineOrderPayload[]>([]);
const isSyncing = ref(false);

export function useOfflinePOS() {
  const toast = useToast();

  const loadQueue = () => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        offlineQueue.value = JSON.parse(stored);
      }
    } catch (e) {
      offlineQueue.value = [];
    }
  };

  const saveQueue = () => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(offlineQueue.value));
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
  };

  const cacheCatalog = (products: any[], categories: any[] = []) => {
    try {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify({ products, categories }));
    } catch (e) {
      console.error('Failed to cache catalog:', e);
    }
  };

  const getCachedCatalog = (): CachedCatalog => {
    try {
      const stored = localStorage.getItem(CATALOG_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return { products: parsed, categories: [] };
        }
        return {
          products: Array.isArray(parsed.products) ? parsed.products : [],
          categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        };
      }
    } catch (e) {
      // ignore
    }
    return { products: [], categories: [] };
  };

  const enqueueOfflineOrder = (order: OfflineOrderPayload) => {
    const payload: OfflineOrderPayload = {
      ...order,
      localId: 'offline-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
    };

    loadQueue();
    offlineQueue.value.push(payload);
    saveQueue();

    // Create a mock order response for immediate POS receipt printing
    return {
      id: payload.localId,
      orderNumber: 'OFF-' + Math.floor(1000 + Math.random() * 9000),
      status: 'completed',
      orderType: payload.orderType || 'pos',
      items: payload.items,
      total: payload.payments.reduce((acc, p) => acc + (p.amount || 0), 0),
      discountAmount: payload.discountAmount || 0,
      payments: payload.payments,
      createdAt: new Date().toISOString(),
      isOffline: true,
    };
  };

  const syncOfflineOrders = async (customApi?: any) => {
    loadQueue();
    if (!isOnline.value || isSyncing.value || offlineQueue.value.length === 0) {
      return;
    }

    const client = customApi || api;
    isSyncing.value = true;
    let successCount = 0;
    const remainingQueue: OfflineOrderPayload[] = [];

    for (const order of offlineQueue.value) {
      try {
        await client.post('/orders', {
          orderType: order.orderType || 'pos',
          customerId: order.customerId,
          tableNumber: order.tableNumber,
          items: order.items.map((i) => ({
            productId: i.productId || i.id,
            serviceId: i.serviceId,
            quantity: i.quantity,
            unitPrice: i.unitPrice || i.price,
            discountAmount: i.discountAmount || 0,
          })),
          discountAmount: order.discountAmount || 0,
          payments: order.payments.map((p) => ({
            paymentMethodId: p.paymentMethodId,
            amount: p.amount,
          })),
          notes: (order.notes ? order.notes + ' ' : '') + `[Oflayn Chek: ${order.timestamp ? new Date(order.timestamp).toLocaleTimeString('uz-UZ') : ''}]`,
        });
        successCount++;
      } catch (err) {
        console.error('Failed to sync offline order:', order.localId, err);
        remainingQueue.push(order);
      }
    }

    offlineQueue.value = remainingQueue;
    saveQueue();
    isSyncing.value = false;

    if (successCount > 0) {
      toast.success(`✅ ${successCount} ta oflayn chek bazaga muvaffaqiyatli yuklandi!`);
      window.dispatchEvent(new CustomEvent('ubms:offline-orders-synced', { detail: { count: successCount } }));
    }

    if (remainingQueue.length > 0) {
      toast.warning(`⚠️ ${remainingQueue.length} ta chekni yuklashda xatolik bo'ldi, qayta uriniladi.`);
    }
  };

  const handleOnline = (customApi?: any) => {
    isOnline.value = true;
    toast.info('🌐 Internet aloqasi tiklandi! Oflayn ma\'lumotlar sinxronizatsiya qilinmoqda...');
    syncOfflineOrders(customApi);
  };

  const handleOffline = () => {
    isOnline.value = false;
    toast.warning('📴 Internet uzildi. Kassa avtomatik oflayn rejimga o\'tdi (Savdo qilaverishingiz mumkin).');
  };

  const setupListeners = (customApi?: any) => {
    loadQueue();
    const onOnline = () => handleOnline(customApi);
    const onOffline = () => handleOffline();

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    if (navigator.onLine && offlineQueue.value.length > 0) {
      syncOfflineOrders(customApi);
    }

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  };

  const pendingCount = computed(() => {
    loadQueue();
    return offlineQueue.value.length;
  });

  return {
    isOnline,
    isSyncing,
    offlineQueue,
    pendingCount,
    loadQueue,
    cacheCatalog,
    getCachedCatalog,
    enqueueOfflineOrder,
    syncOfflineOrders,
    handleOnline,
    handleOffline,
    setupListeners,
  };
}

export const useOfflinePos = useOfflinePOS;
