import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePOSHeldOrders } from '../usePOSHeldOrders';
import { useCartStore } from '../../../../stores/cart.store';

describe('usePOSHeldOrders Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('boshlangich holatda heldOrders bosh bolishi kerak', () => {
    const { heldOrders, isHeldOrdersOpen } = usePOSHeldOrders();
    expect(heldOrders.value).toEqual([]);
    expect(isHeldOrdersOpen.value).toBe(false);
  });

  it('savat bosh bolsa buyurtmani kutishga olmasligi kerak', () => {
    const { holdCurrentCart, heldOrders } = usePOSHeldOrders();
    holdCurrentCart('pos', '', '');
    expect(heldOrders.value.length).toBe(0);
  });

  it('savatda tovar bolsa buyurtmani kutish rejimiga olishi va localStorage ga saqlashi kerak', () => {
    const cartStore = useCartStore();
    cartStore.addItem({ id: 'prod-1', name: 'Olma', salePrice: 10000 }, false, 2);

    const { holdCurrentCart, heldOrders } = usePOSHeldOrders();
    holdCurrentCart('pos', 'Stol #1', 'cust-1');

    expect(heldOrders.value.length).toBe(1);
    expect(heldOrders.value[0].orderType).toBe('pos');
    expect(heldOrders.value[0].tableNumber).toBe('Stol #1');
    expect(heldOrders.value[0].customerId).toBe('cust-1');
    expect(cartStore.items.length).toBe(0);

    const stored = JSON.parse(localStorage.getItem('pos_held_orders') || '[]');
    expect(stored.length).toBe(1);
  });

  it('heldOrder qayta savatga tiklanganda (recall) savat tolishi va heldOrders kamayishi kerak', () => {
    const cartStore = useCartStore();
    const { holdCurrentCart, recallHeldOrder, heldOrders } = usePOSHeldOrders();

    cartStore.addItem({ id: 'prod-1', name: 'Non', salePrice: 4000 }, false, 3);
    holdCurrentCart('pos', 'Stol #2', 'cust-2');

    expect(heldOrders.value.length).toBe(1);

    const targetOrder = heldOrders.value[0];
    const selectedTable = { value: '' };
    const selectedCustomer = { value: '' };
    const orderType = { value: '' };

    recallHeldOrder(targetOrder, selectedTable, selectedCustomer, orderType);

    expect(cartStore.items.length).toBe(1);
    expect(cartStore.items[0].name).toBe('Non');
    expect(selectedTable.value).toBe('Stol #2');
    expect(selectedCustomer.value).toBe('cust-2');
    expect(orderType.value).toBe('pos');
    expect(heldOrders.value.length).toBe(0);
  });

  it('heldOrder ochirilganda heldOrders massividan olib tashlanishi kerak', () => {
    const cartStore = useCartStore();
    const { holdCurrentCart, deleteHeldOrder, heldOrders } = usePOSHeldOrders();

    cartStore.addItem({ id: 'prod-1', name: 'Suv', salePrice: 3000 }, false, 1);
    holdCurrentCart('pos', '', '');

    expect(heldOrders.value.length).toBe(1);

    deleteHeldOrder(0);
    expect(heldOrders.value.length).toBe(0);
  });
});
