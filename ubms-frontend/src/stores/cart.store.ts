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
  allowDecimal?: boolean;
  isManualPrice?: boolean;
}

export type DiscountType = 'percent' | 'fixed';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    customerId: null as string | null,
    customerName: null as string | null,
    tableId: null as string | null,
    tableName: null as string | null,
    discountType: 'percent' as DiscountType,
    discountValue: 0, // foizda (masalan, 10) yoki summada (masalan, 15000)
    taxRate: 0, // %
    orderType: 'pos' as 'pos' | 'restaurant' | 'service',
    orderServiceType: 'dine_in' as 'dine_in' | 'takeaway' | 'delivery',
    enableServiceFee: false,
    serviceFeePercent: 10,
  }),

  getters: {
    itemCount: (state) => state.items.length,
    totalQuantity: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    
    // Asl jami summa (chegirmasiz)
    rawSubtotal: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),

    // Qator chegirmalari hisobga olingan oraliq summa
    subtotal: (state) =>
      state.items.reduce((sum, item) => sum + (item.price * item.quantity - (item.discount || 0)), 0),

    // Butun buyurtmaga qo'llangan umumiy chegirma summasi
    generalDiscount(state): number {
      const sub = this.subtotal;
      if (sub <= 0 || state.discountValue <= 0) return 0;
      if (state.discountType === 'percent') {
        const pct = Math.min(100, Math.max(0, state.discountValue));
        return Math.round((sub * pct) / 100);
      }
      // Fixed sum
      return Math.min(sub, Math.max(0, state.discountValue));
    },

    // Umumiy chegirma foizi (agar summada berilgan bo'lsa ham hisoblab ko'rsatish uchun)
    calculatedDiscountPercent(state): number {
      const sub = this.subtotal;
      if (sub <= 0) return 0;
      if (state.discountType === 'percent') {
        return Math.min(100, Math.max(0, state.discountValue));
      }
      return Math.round((this.generalDiscount / sub) * 100);
    },

    // Jami chegirmalar (qatorlar + umumiy chegirma)
    discountTotal(state): number {
      const lineDiscounts = state.items.reduce((sum, item) => sum + (item.discount || 0), 0);
      return lineDiscounts + this.generalDiscount;
    },

    taxAmount(state): number {
      const discountedSubtotal = Math.max(0, this.subtotal - this.generalDiscount);
      return (discountedSubtotal * state.taxRate) / 100;
    },

    // Restoran / Kafe Xizmat haqi (FAQAT GINA Dine-in / Stolda tanlanganda va enableServiceFee === true bo'lsa!)
    // Olib ketish (takeaway / С собой) da Har doim 0 UZS bo'ladi.
    serviceFeeAmount(state): number {
      if (state.orderServiceType !== 'dine_in') return 0;
      if (!state.enableServiceFee || state.serviceFeePercent <= 0) return 0;
      const discountedSubtotal = Math.max(0, this.subtotal - this.generalDiscount);
      return Math.round((discountedSubtotal * state.serviceFeePercent) / 100);
    },

    grandTotal(): number {
      const discounted = Math.max(0, this.subtotal - this.generalDiscount);
      return Math.round(discounted + this.taxAmount + this.serviceFeeAmount);
    },
  },

  actions: {
    addItem(productOrService: any, isService = false, initialQty?: number) {
      const id = productOrService.id;
      const existing = this.items.find((item) => item.id === id);

      const unitName = productOrService.unit?.shortName || productOrService.unit || 'dona';
      const isDecimal = productOrService.unit?.allowDecimal === true || 
        ['kg', 'l', 'g', 'm', 'ml', 'kv.m'].includes(String(unitName).toLowerCase());

      const qtyToAdd = initialQty !== undefined && initialQty > 0 
        ? initialQty 
        : (isDecimal ? 1 : 1);

      if (existing) {
        existing.quantity = Math.round((existing.quantity + qtyToAdd) * 1000) / 1000;
      } else {
        this.items.push({
          id,
          productId: isService ? undefined : id,
          serviceId: isService ? id : undefined,
          name: productOrService.name,
          sku: productOrService.sku,
          barcode: productOrService.barcode,
          price: Number(productOrService.salePrice || productOrService.price || 0),
          quantity: qtyToAdd,
          discount: 0,
          availableStock: productOrService.availableQty ?? productOrService.stockQty,
          unit: unitName,
          allowDecimal: isDecimal,
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
    setDiscount(type: DiscountType, value: number) {
      this.discountType = type;
      this.discountValue = Math.max(0, value);
    },
    setDiscountPercent(percent: number) {
      this.discountType = 'percent';
      this.discountValue = Math.min(100, Math.max(0, percent));
    },
    setDiscountFixed(amount: number) {
      this.discountType = 'fixed';
      this.discountValue = Math.max(0, amount);
    },
    clearDiscount() {
      this.discountType = 'percent';
      this.discountValue = 0;
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
      this.discountType = 'percent';
      this.discountValue = 0;
    },
  },
});
