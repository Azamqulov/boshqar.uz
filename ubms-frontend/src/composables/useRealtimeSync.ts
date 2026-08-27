import { watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useDataStore } from '../stores/data.store';
import socketService from '../services/socket.service';

export function useRealtimeSync() {
  const authStore = useAuthStore();
  const dataStore = useDataStore();

  const handleOrderCreated = (_order: any) => {
    // Invalidate and refresh dashboard, finance, and inventory in real time
    dataStore.invalidate('dashboard');
    dataStore.invalidate('finance');
    dataStore.invalidate('inventory');
    window.dispatchEvent(new CustomEvent('ubms:order-created', { detail: _order }));
  };

  const handleOrderCompleted = (_order: any) => {
    dataStore.invalidate('dashboard');
    dataStore.invalidate('finance');
    dataStore.invalidate('inventory');
    window.dispatchEvent(new CustomEvent('ubms:order-completed', { detail: _order }));
  };

  const handleProductUpdated = (_product: any) => {
    dataStore.invalidate('products');
    dataStore.invalidate('inventory');
    window.dispatchEvent(new CustomEvent('ubms:product-updated', { detail: _product }));
  };

  const handleInventoryUpdated = (_inventory: any) => {
    dataStore.invalidate('inventory');
    dataStore.invalidate('dashboard');
    window.dispatchEvent(new CustomEvent('ubms:inventory-updated', { detail: _inventory }));
  };

  const handleKitchenStatusChanged = (_kitchenOrder: any) => {
    window.dispatchEvent(new CustomEvent('ubms:kitchen-updated', { detail: _kitchenOrder }));
  };

  const handleTableUpdated = (_table: any) => {
    dataStore.invalidate('tables');
    window.dispatchEvent(new CustomEvent('ubms:table-updated', { detail: _table }));
  };

  const syncConnection = () => {
    if (authStore.isAuthenticated && authStore.token) {
      socketService.connect(
        authStore.token,
        authStore.activeBusiness?.id || null,
        authStore.activeBranchId || null
      );
    } else {
      socketService.disconnect();
    }
  };

  // Re-sync background data on window focus / network recovery
  const handleWindowFocus = () => {
    if (authStore.isAuthenticated) {
      dataStore.prefetchAll(false).catch(() => {});
    }
  };

  onMounted(() => {
    syncConnection();

    // Listen to real-time WebSocket events
    socketService.on('order.created', handleOrderCreated);
    socketService.on('order.completed', handleOrderCompleted);
    socketService.on('product.created', handleProductUpdated);
    socketService.on('product.updated', handleProductUpdated);
    socketService.on('product.deleted', handleProductUpdated);
    socketService.on('inventory.updated', handleInventoryUpdated);
    socketService.on('kitchen.status_changed', handleKitchenStatusChanged);
    socketService.on('table.updated', handleTableUpdated);

    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('online', handleWindowFocus);
  });

  onUnmounted(() => {
    socketService.off('order.created', handleOrderCreated);
    socketService.off('order.completed', handleOrderCompleted);
    socketService.off('product.created', handleProductUpdated);
    socketService.off('product.updated', handleProductUpdated);
    socketService.off('product.deleted', handleProductUpdated);
    socketService.off('inventory.updated', handleInventoryUpdated);
    socketService.off('kitchen.status_changed', handleKitchenStatusChanged);
    socketService.off('table.updated', handleTableUpdated);

    window.removeEventListener('focus', handleWindowFocus);
    window.removeEventListener('online', handleWindowFocus);
  });

  // Watch for auth changes, business switches, or token refresh
  watch(
    [() => authStore.token, () => authStore.activeBusiness?.id, () => authStore.activeBranchId],
    () => {
      syncConnection();
    }
  );

  return {
    socketService,
  };
}

export default useRealtimeSync;
