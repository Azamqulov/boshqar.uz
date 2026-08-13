export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  PENDING = 'pending',
}

export enum BusinessType {
  SHOP = 'shop',
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  BARBERSHOP = 'barbershop',
  PHARMACY = 'pharmacy',
  CONFECTIONERY = 'confectionery',
  SERVICE = 'service',
  OTHER = 'other',
}

export enum BusinessStatus {
  ACTIVE = 'active',
  TRIAL = 'trial',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

export enum BusinessUserStatus {
  ACTIVE = 'active',
  INVITED = 'invited',
  DISABLED = 'disabled',
}

export enum BranchStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  FIRED = 'fired',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum InventoryTransactionType {
  IN = 'in',
  OUT = 'out',
}

export enum InventoryReason {
  PURCHASE = 'purchase',
  SALE = 'sale',
  DAMAGE = 'damage',
  EXPIRED = 'expired',
  MANUAL = 'manual',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  REFUND = 'refund',
}

export enum StockTransferStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OrderType {
  POS = 'pos',
  RESTAURANT = 'restaurant',
  SERVICE = 'service',
}

export enum OrderStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled',
}

export enum PaymentMethodType {
  CASH = 'cash',
  CARD = 'card',
  CLICK = 'click',
  PAYME = 'payme',
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum RefundStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum RevenueSource {
  SALES = 'sales',
  SERVICES = 'services',
  OTHER = 'other',
}

export enum ExpenseCategory {
  PURCHASE = 'purchase',
  SALARY = 'salary',
  RENT = 'rent',
  UTILITIES = 'utilities',
  ADVERTISING = 'advertising',
  TRANSPORT = 'transport',
  OTHER = 'other',
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  CLEANING = 'cleaning',
}

export enum KitchenOrderStatus {
  NEW = 'new',
  COOKING = 'cooking',
  READY = 'ready',
  SERVED = 'served',
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AppointmentStatus {
  BOOKED = 'booked',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export enum NotificationType {
  LOW_STOCK = 'low_stock',
  PAYMENT = 'payment',
  NEW_ORDER = 'new_order',
  ORDER_READY = 'order_ready',
  APPOINTMENT = 'appointment',
  EXPENSE = 'expense',
  SYSTEM = 'system',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  SMS = 'sms',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELLED = 'cancelled',
  TRIALING = 'trialing',
}
