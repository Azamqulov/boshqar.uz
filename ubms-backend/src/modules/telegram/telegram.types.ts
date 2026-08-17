export interface TelegramAccount {
  chatId: string;
  userId?: string;
  role?: string;
  roleLabel?: string;
  username?: string;
  firstName?: string;
  phone?: string;
  connectedAt: string;
}

export interface TelegramSettings {
  isConnected: boolean;
  chatId?: string;
  username?: string;
  connectedAt?: string;
  accounts?: TelegramAccount[];
  accountsCount?: number;
  notifyOnOrder: boolean;
  notifyOnLowStock: boolean;
  notifyDailySummary: boolean;
  dailySummaryTime?: string;
  notifyOnShiftClose: boolean;
  allowDebtsInBot?: boolean;
  allowExpenseInBot?: boolean;
  allowProductSearch?: boolean;
  allowCashierControl?: boolean;
  currency?: string;
}

export interface TelegramOrderItem {
  product?: { name: string };
  service?: { name: string };
  name?: string;
  quantity: number | any;
  unitPrice: number | any;
  total?: number | any;
}

export interface TelegramOrderNotification {
  id?: string;
  orderNumber?: string;
  total?: number | string | any;
  items?: TelegramOrderItem[] | any[];
  cashier?: { fullName?: string; name?: string; phone?: string } | null;
  customer?: { fullName?: string; name?: string; phone?: string } | null;
  payments?: { amount: number | string | any; paymentMethod?: { name?: string; type?: string } }[];
  table?: { name?: string } | null;
}

export interface TelegramLowStockProduct {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  minStock?: number | any;
  unit?: { shortName?: string } | null;
}

export interface TelegramShiftCloseData {
  id?: string;
  openedAt?: Date | string;
  closedAt?: Date | string | null;
  startingCash?: number | string | any;
  expectedCash?: number | string | any;
  actualCash?: number | string | any;
  difference?: number | string | any;
  cashSales?: number | string | any;
  cardSales?: number | string | any;
  otherSales?: number | string | any;
  totalSales?: number | string | any;
  cashExpenses?: number | string | any;
  user?: { fullName?: string; phone?: string } | null;
  branch?: { id?: string; name?: string } | null;
  notes?: string | null;
  ordersCount?: number;
}

export interface TelegramDailyDispatchDetail {
  businessId: string;
  businessName: string;
  chatId?: string;
  scheduleTime?: string;
  recipients?: number;
  status?: string;
  success?: boolean;
  error?: string;
}

export interface TelegramDailyDispatchResult {
  dispatched: number;
  details: TelegramDailyDispatchDetail[];
}

export function formatTelegramMoney(amount: number | string = 0, currency: string = 'UZS'): string {
  const num = Number(amount || 0);
  const cur = (currency || 'UZS').toUpperCase();
  if (cur === 'USD') {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: num % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
  }
  if (cur === 'RUB') {
    return `${num.toLocaleString('ru-RU')} ₽`;
  }
  if (cur === 'EUR') {
    return `€${num.toLocaleString('de-DE', { minimumFractionDigits: num % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
  }
  if (cur === 'KZT') {
    return `${num.toLocaleString('ru-RU')} ₸`;
  }
  return `${num.toLocaleString('uz-UZ')} so'm`;
}
