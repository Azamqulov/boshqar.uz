import {
  UserStatus,
  BusinessType,
  BusinessStatus,
  BusinessUserStatus,
  BranchStatus,
  EmployeeStatus,
  ProductStatus,
  InventoryTransactionType,
  InventoryReason,
  StockTransferStatus,
  OrderType,
  OrderStatus,
  OrderItemStatus,
  PaymentMethodType,
  PaymentStatus,
  RefundStatus,
  RevenueSource,
  ExpenseCategory,
  TableStatus,
  KitchenOrderStatus,
  ServiceStatus,
  AppointmentStatus,
  NotificationType,
  NotificationChannel,
  SubscriptionStatus,
} from './enums';

export interface User {
  id: string;
  fullName: string;
  email?: string | null;
  phone: string;
  avatarUrl?: string | null;
  status: UserStatus;
  lastLoginAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  businessType: BusinessType;
  logoUrl?: string | null;
  currency: string;
  timezone: string;
  planId: string;
  status: BusinessStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isMain: boolean;
  status: BranchStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Role {
  id: string;
  businessId?: string | null;
  name: string;
  isSystem: boolean;
  permissions?: Permission[];
  createdAt: Date | string;
}

export interface Permission {
  id: string;
  code: string;
  module: string;
  description?: string | null;
}

export interface Employee {
  id: string;
  businessId: string;
  branchId: string;
  userId?: string | null;
  fullName: string;
  phone: string;
  position: string;
  salary?: number | null;
  hireDate?: Date | string | null;
  status: EmployeeStatus;
}

export interface Category {
  id: string;
  businessId: string;
  parentId?: string | null;
  name: string;
  sortOrder: number;
  children?: Category[];
}

export interface Unit {
  id: string;
  businessId?: string | null;
  name: string;
  shortName: string;
  allowDecimal: boolean;
}

export interface Product {
  id: string;
  businessId: string;
  branchId?: string | null;
  name: string;
  sku: string;
  barcode?: string | null;
  categoryId?: string | null;
  category?: Category | null;
  brand?: string | null;
  unitId: string;
  unit?: Unit | null;
  purchasePrice: number;
  salePrice: number;
  taxRate: number;
  minStock: number;
  imageUrl?: string | null;
  description?: string | null;
  status: ProductStatus;
  currentStock?: number;
}

export interface Inventory {
  id: string;
  branchId: string;
  productId: string;
  product?: Product;
  quantity: number;
  reservedQty: number;
  availableQty: number;
  updatedAt: Date | string;
}

export interface Customer {
  id: string;
  businessId: string;
  fullName: string;
  phone?: string | null;
  birthDate?: Date | string | null;
  notes?: string | null;
  totalPurchases: number;
  totalSpent: number;
  debt: number;
  lastPurchaseAt?: Date | string | null;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  companyName?: string | null;
  phone?: string | null;
  address?: string | null;
  balance: number;
  notes?: string | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  product?: Product | null;
  serviceId?: string | null;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  total: number;
  status?: OrderItemStatus;
}

export interface Order {
  id: string;
  businessId: string;
  branchId: string;
  orderNumber: string;
  orderType: OrderType;
  customerId?: string | null;
  customer?: Customer | null;
  cashierId?: string | null;
  cashier?: Employee | null;
  waiterId?: string | null;
  tableId?: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  status: OrderStatus;
  items: OrderItem[];
  payments?: Payment[];
  createdAt: Date | string;
  completedAt?: Date | string | null;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentMethodId: string;
  paymentMethod?: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transactionRef?: string | null;
  createdAt: Date | string;
}

export interface PaymentMethod {
  id: string;
  businessId?: string | null;
  name: string;
  type: PaymentMethodType;
  isActive: boolean;
}

export interface Table {
  id: string;
  branchId: string;
  name: string;
  capacity: number;
  status: TableStatus;
  currentOrder?: Order | null;
}

export interface KitchenOrder {
  id: string;
  orderItemId: string;
  orderItem: OrderItem;
  tableNumber?: string;
  status: KitchenOrderStatus;
  startedAt?: Date | string | null;
  readyAt?: Date | string | null;
  createdAt: Date | string;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  price: number;
  durationMinutes: number;
  status: ServiceStatus;
}

export interface Appointment {
  id: string;
  businessId: string;
  branchId: string;
  customerId: string;
  customer?: Customer;
  serviceId: string;
  service?: Service;
  employeeId: string;
  employee?: Employee;
  scheduledAt: Date | string;
  status: AppointmentStatus;
  orderId?: string | null;
}

export interface DashboardSummary {
  todaySales: number;
  todayExpenses: number;
  todayProfit: number;
  todayOrdersCount: number;
  newCustomersCount: number;
  totalInventoryValue: number;
  lowStockItemsCount: number;
  totalCustomerDebt: number;
  totalSupplierDebt: number;
}
