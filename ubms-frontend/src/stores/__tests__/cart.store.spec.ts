import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCartStore } from '../cart.store';

describe('useCartStore Pinia Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('boshlangich holatda savat bosh bolishi kerak', () => {
    const store = useCartStore();
    expect(store.items).toEqual([]);
    expect(store.itemCount).toBe(0);
    expect(store.grandTotal).toBe(0);
    expect(store.customerId).toBeNull();
  });

  it('tovar qoshilganda tovar savatda paydo bolishi va subtotal hisoblanishi kerak', () => {
    const store = useCartStore();
    store.addItem({
      id: 'prod-101',
      name: 'Non',
      salePrice: 4000,
    });

    expect(store.items.length).toBe(1);
    expect(store.items[0].name).toBe('Non');
    expect(store.items[0].price).toBe(4000);
    expect(store.items[0].quantity).toBe(1);
    expect(store.rawSubtotal).toBe(4000);
    expect(store.grandTotal).toBe(4000);
  });

  it('bir xil tovar qayta qoshilganda miqdori kopayishi kerak', () => {
    const store = useCartStore();
    const product = { id: 'prod-101', name: 'Non', salePrice: 4000 };

    store.addItem(product);
    store.addItem(product);

    expect(store.items.length).toBe(1);
    expect(store.items[0].quantity).toBe(2);
    expect(store.rawSubtotal).toBe(8000);
    expect(store.grandTotal).toBe(8000);
  });

  it('foizli chegirma qollanilganda grandTotal togri hisoblanishi kerak', () => {
    const store = useCartStore();
    store.addItem({ id: 'prod-1', name: 'Futbolka', salePrice: 100000 });

    store.setDiscountPercent(15); // 15% discount

    expect(store.subtotal).toBe(100000);
    expect(store.generalDiscount).toBe(15000);
    expect(store.grandTotal).toBe(85000);
  });

  it('fiksallangan summa chegirmasi (fixed amount) togri hisoblanishi kerak', () => {
    const store = useCartStore();
    store.addItem({ id: 'prod-1', name: 'Kurtka', salePrice: 500000 });

    store.setDiscountFixed(50000); // 50,000 UZS chegirma

    expect(store.generalDiscount).toBe(50000);
    expect(store.grandTotal).toBe(450000);
  });

  it('tovar ochirilganda yoki miqdori 0 qilinganda savatdan ochib ketishi kerak', () => {
    const store = useCartStore();
    store.addItem({ id: 'prod-1', name: 'Shira', salePrice: 12000 });
    store.addItem({ id: 'prod-2', name: 'Sut', salePrice: 8000 });

    expect(store.items.length).toBe(2);

    store.updateQuantity('prod-1', 0);
    expect(store.items.length).toBe(1);
    expect(store.items[0].id).toBe('prod-2');

    store.removeItem('prod-2');
    expect(store.items.length).toBe(0);
  });

  it('clearCart chaqirilganda savat va barcha sozlamalar tozalanishi kerak', () => {
    const store = useCartStore();
    store.addItem({ id: 'prod-1', name: 'Choy', salePrice: 5000 });
    store.setCustomer('cust-99', 'Sobir Ali');
    store.setDiscountPercent(20);

    store.clearCart();

    expect(store.items).toEqual([]);
    expect(store.customerId).toBeNull();
    expect(store.discountValue).toBe(0);
    expect(store.grandTotal).toBe(0);
  });

  it("qator bo'yicha va kasrli miqdorlar bo'yicha chegirma va narx to'g'ri hisoblanishi kerak", () => {
    const store = useCartStore();
    store.addItem({ id: 'prod-kg', name: 'Olma', salePrice: 15000, unit: { shortName: 'kg', allowDecimal: true } }, false, 1.5);

    expect(store.items[0].quantity).toBe(1.5);
    expect(store.rawSubtotal).toBe(22500); // 1.5 * 15000

    store.updateDiscount('prod-kg', 2500); // 2500 so'm qator chegirmasi
    expect(store.subtotal).toBe(20000);
    expect(store.grandTotal).toBe(20000);
  });

  it("isManualPrice o'zgartirilganda item o'zining yangi narxini saqlashi kerak", () => {
    const store = useCartStore();
    store.addItem({ id: 'prod-manual', name: 'Maxsus Buyum', salePrice: 50000 });

    store.items[0].isManualPrice = true;
    store.items[0].price = 45000;

    expect(store.items[0].isManualPrice).toBe(true);
    expect(store.rawSubtotal).toBe(45000);
    expect(store.grandTotal).toBe(45000);
  });
});
