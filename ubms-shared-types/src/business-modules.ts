import { BusinessType } from './enums';

export interface BusinessModuleConfig {
  type: BusinessType;
  label: string;
  description: string;
  defaultModules: string[];
  features: {
    hasTables: boolean;
    hasKDS: boolean;
    hasAppointments: boolean;
    hasServices: boolean;
    hasInventory: boolean;
    hasSuppliers: boolean;
    hasExpiryTracking: boolean;
  };
}

export const BUSINESS_TYPE_MODULES: Record<BusinessType, BusinessModuleConfig> = {
  [BusinessType.SHOP]: {
    type: BusinessType.SHOP,
    label: "Do'kon",
    description: "Chakana va ulgurji savdo do'konlari uchun to'liq kassa va ombor tizimi",
    defaultModules: ['pos', 'products', 'inventory', 'customers', 'suppliers', 'finance', 'reports'],
    features: {
      hasTables: false,
      hasKDS: false,
      hasAppointments: false,
      hasServices: false,
      hasInventory: true,
      hasSuppliers: true,
      hasExpiryTracking: false,
    },
  },
  [BusinessType.RESTAURANT]: {
    type: BusinessType.RESTAURANT,
    label: 'Restoran',
    description: "Stollar xaritasi, ofitsiantlar va oshxona KDS ekrani bilan to'liq restoran tizimi",
    defaultModules: ['pos', 'products', 'inventory', 'customers', 'finance', 'reports', 'tables', 'kitchen', 'reservations'],
    features: {
      hasTables: true,
      hasKDS: true,
      hasAppointments: false,
      hasServices: false,
      hasInventory: true,
      hasSuppliers: true,
      hasExpiryTracking: false,
    },
  },
  [BusinessType.CAFE]: {
    type: BusinessType.CAFE,
    label: 'Kafe / Fastfood',
    description: "Tezkor buyurtma (Quick Order) va olib ketish (Takeaway) imkoniyati bilan kafe tizimi",
    defaultModules: ['pos', 'products', 'inventory', 'customers', 'finance', 'reports', 'tables', 'kitchen'],
    features: {
      hasTables: true,
      hasKDS: true,
      hasAppointments: false,
      hasServices: false,
      hasInventory: true,
      hasSuppliers: true,
      hasExpiryTracking: false,
    },
  },
  [BusinessType.BARBERSHOP]: {
    type: BusinessType.BARBERSHOP,
    label: 'Sartaroshxona / Go\'zallik saloni',
    description: "Ustalarning ish jadvali, xizmatlar katalogi va onlayn/oflayn bandlovlar tizimi",
    defaultModules: ['pos', 'services', 'appointments', 'employees', 'customers', 'finance', 'reports'],
    features: {
      hasTables: false,
      hasKDS: false,
      hasAppointments: true,
      hasServices: true,
      hasInventory: true,
      hasSuppliers: false,
      hasExpiryTracking: false,
    },
  },
  [BusinessType.PHARMACY]: {
    type: BusinessType.PHARMACY,
    label: 'Dorixona',
    description: "Yaroqlilik muddati va partiya (batch) nazorati bilan dorixona savdo tizimi",
    defaultModules: ['pos', 'products', 'inventory', 'customers', 'suppliers', 'finance', 'reports'],
    features: {
      hasTables: false,
      hasKDS: false,
      hasAppointments: false,
      hasServices: false,
      hasInventory: true,
      hasSuppliers: true,
      hasExpiryTracking: true,
    },
  },
  [BusinessType.CONFECTIONERY]: {
    type: BusinessType.CONFECTIONERY,
    label: 'Konditer / Shirinliklar',
    description: "Mahsulotlar partiyasi va tez buziladigan tovarlar hisobi bilan kassa tizimi",
    defaultModules: ['pos', 'products', 'inventory', 'customers', 'suppliers', 'finance', 'reports'],
    features: {
      hasTables: false,
      hasKDS: false,
      hasAppointments: false,
      hasServices: false,
      hasInventory: true,
      hasSuppliers: true,
      hasExpiryTracking: true,
    },
  },
  [BusinessType.SERVICE]: {
    type: BusinessType.SERVICE,
    label: 'Xizmat ko\'rsatish (Avtoservis, Kimyoviy tozalash va h.k.)',
    description: "Har xil xizmat ko'rsatish sohalari uchun universal qabul va to'lov tizimi",
    defaultModules: ['pos', 'services', 'appointments', 'employees', 'customers', 'finance', 'reports'],
    features: {
      hasTables: false,
      hasKDS: false,
      hasAppointments: true,
      hasServices: true,
      hasInventory: true,
      hasSuppliers: true,
      hasExpiryTracking: false,
    },
  },
  [BusinessType.OTHER]: {
    type: BusinessType.OTHER,
    label: 'Boshqa biznes turi',
    description: "Moslashuvchan universal boshqaruv tizimi",
    defaultModules: ['pos', 'products', 'inventory', 'customers', 'finance', 'reports'],
    features: {
      hasTables: false,
      hasKDS: false,
      hasAppointments: false,
      hasServices: false,
      hasInventory: true,
      hasSuppliers: true,
      hasExpiryTracking: false,
    },
  },
};
