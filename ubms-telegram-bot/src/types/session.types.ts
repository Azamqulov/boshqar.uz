export interface TelegramNotificationSettings {
  notifyOnOrder?: boolean;
  notifyDailySummary?: boolean;
  notifyOnLowStock?: boolean;
  notifyOnShiftClose?: boolean;
}

export interface UserSession {
  token?: string;
  businessId?: string;
  businessName?: string;
  userFullName?: string;
  phone?: string;
  state?: 'idle' | 'awaiting_phone' | 'awaiting_password';
  tempPhone?: string;
  settings?: TelegramNotificationSettings;
}

export interface BusinessSummaryResponse {
  todaySalesTotal: number;
  todayOrdersCount: number;
  todayExpensesTotal: number;
  todayNetProfit: number;
  newCustomersCount: number;
  lowStockItemsCount: number;
}
