import { defineStore } from 'pinia';

export interface CartItem {
  id: string; // product or service id
  productId?: string;
  serviceId?: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  quantity: number;
  discount: number;
  availableStock?: number;
  unit?: string;
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    customerId: null as string | null,
    customerName: null as string | null,
    tableId: null as string | null,
    tableName: null as string | null,
    generalDiscount: 0, // Summa
    taxRate: 0, // %
    orderType: 'pos' as 'pos' | 'restaurant' | 'service',
  }),
  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity - item.discount, 0),
    discountTotal: (state) => {
      const lineDiscounts = state.items.reduce((sum, item) => sum + item.discount, 0);
      return lineDiscounts + state.generalDiscount;
    },
    taxAmount: (state) => {
      const discountedSubtotal = Math.max(
        0,
        state.items.reduce((sum, item) => sum + item.price * item.quantity - item.discount, 0) -
          state.generalDiscount,
      );
      return (discountedSubtotal * state.taxRate) / 100;
    },
    grandTotal(): number {
      const discounted = Math.max(0, this.subtotal - this.generalDiscount);
      return Math.round(discounted + this.taxAmount);
    },
  },
  actions: {
    addItem(productOrService: any, isService = false) {
      const id = productOrService.id;
      const existing = this.items.find((item) => item.id === id);

      if (existing) {
        existing.quantity += 1;
      } else {
        this.items.push({
          id,
          productId: isService ? undefined : id,
          serviceId: isService ? id : undefined,
          name: productOrService.name,
          sku: productOrService.sku,
          barcode: productOrService.barcode,
          price: Number(productOrService.salePrice || productOrService.price || 0),
          quantity: 1,
          discount: 0,
          availableStock: productOrService.availableQty ?? productOrService.stockQty,
          unit: productOrService.unit?.shortName || productOrService.unit,
        });
      }
    },
    updateQuantity(id: string, qty: number) {
      const item = this.items.find((i) => i.id === id);
      if (item) {
        if (qty <= 0) {
          this.removeItem(id);
        } else {
          item.quantity = qty;
        }
      }
    },
    updateDiscount(id: string, discount: number) {
      const item = this.items.find((i) => i.id === id);
      if (item) {
        item.discount = Math.max(0, discount);
      }
    },
    removeItem(id: string) {
      this.items = this.items.filter((item) => item.id !== id);
    },
    setCustomer(id: string | null, name: string | null = null) {
      this.customerId = id;
      this.customerName = name;
    },
    setTable(id: string | null, name: string | null = null) {
      this.tableId = id;
      this.tableName = name;
    },
    clearCart() {
      this.items = [];
      this.customerId = null;
      this.customerName = null;
      this.tableId = null;
      this.tableName = null;
      this.generalDiscount = 0;
    },
  },
});
