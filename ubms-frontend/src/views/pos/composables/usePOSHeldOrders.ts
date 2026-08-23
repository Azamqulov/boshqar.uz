import { ref } from 'vue';
import { useCartStore } from '../../../stores/cart.store';
import { useToast } from '../../../composables/useToast';

export function usePOSHeldOrders() {
  const cartStore = useCartStore();
  const toast = useToast();

  const isHeldOrdersOpen = ref(false);
  const heldOrders = ref<any[]>(JSON.parse(localStorage.getItem('pos_held_orders') || '[]'));

  const saveHeldOrdersToStorage = () => {
    localStorage.setItem('pos_held_orders', JSON.stringify(heldOrders.value));
  };

  const holdCurrentCart = (orderType: string, currentTableDisplayName: string, selectedCustomerId: string) => {
    if (cartStore.items.length === 0) return;
    heldOrders.value.push({
      id: 'held-' + Date.now(),
      items: [...cartStore.items],
      orderType,
      tableNumber: currentTableDisplayName,
      customerId: selectedCustomerId,
      grandTotal: cartStore.grandTotal,
      savedAt: new Date().toISOString(),
    });
    saveHeldOrdersToStorage();
    cartStore.clearCart();
    toast.success('Buyurtma kutish rejimiga olindi', 'Kutish');
  };

  const recallHeldOrder = (order: any, selectedTableNumber: any, selectedCustomerId: any, orderType: any) => {
    cartStore.clearCart();
    order.items.forEach((item: any) => {
      cartStore.addItem(item, item.quantity);
    });
    if (order.tableNumber) {
      selectedTableNumber.value = order.tableNumber;
    }
    if (order.customerId) {
      selectedCustomerId.value = order.customerId;
    }
    if (order.orderType) {
      orderType.value = order.orderType;
    }
    heldOrders.value = heldOrders.value.filter((o) => o.id !== order.id);
    saveHeldOrdersToStorage();
    isHeldOrdersOpen.value = false;
    toast.success('Buyurtma savatga qaytarildi', 'Kutish');
  };

  const deleteHeldOrder = (idx: number) => {
    heldOrders.value.splice(idx, 1);
    saveHeldOrdersToStorage();
    toast.info('Kutishdagi buyurtma o\'chirildi');
  };

  return {
    isHeldOrdersOpen,
    heldOrders,
    holdCurrentCart,
    recallHeldOrder,
    deleteHeldOrder,
  };
}
