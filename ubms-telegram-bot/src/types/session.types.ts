export interface TelegramNotificationSettings {
  notifyOnOrder?: boolean;
  notifyDailySummary?: boolean;
  notifyOnLowStock?: boolean;
  notifyOnShiftClose?: boolean;
  allowDebtsInBot?: boolean;
  allowExpenseInBot?: boolean;
  allowProductSearch?: boolean;
  allowCashierControl?: boolean;
  role?: string;
  roleLabel?: string;
}

export interface UserSession {
  token?: string;
  businessId?: string;
  businessName?: string;
  userFullName?: string;
  phone?: string;
  role?: 'owner' | 'admin' | 'manager' | 'cashier' | 'waiter' | 'stockman' | 'employee';
  roleLabel?: string;
  state?: 'idle' | 'awaiting_phone' | 'awaiting_password';
  tempPhone?: string;
  settings?: TelegramNotificationSettings;
  currency?: string;
}

export interface BusinessSummaryResponse {
  todaySalesTotal: number;
  todayOrdersCount: number;
  todayExpensesTotal: number;
  todayNetProfit: number;
  newCustomersCount: number;
  lowStockItemsCount: number;
  currency?: string;
  isEmployee?: boolean;
  role?: string;
  roleLabel?: string;
  employeeName?: string;
  hasActiveShift?: boolean;
  shiftOpenedAt?: string;
}
