export interface DemoProduct {
  id: string;
  name: string;
  code: string;
  price: number;
  stock: string;
  category: string;
  image?: string;
}

export interface DemoCustomer {
  id: string;
  name: string;
  phone: string;
  debt: number;
}

export interface DemoTable {
  id: string;
  name: string;
  capacity: number;
  occupied: boolean;
  orderNumber: string;
  orderTotal: number;
  waiter: string;
}

export const INITIAL_DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: '1',
    name: 'Nestle Sut 1L 3.2%',
    code: 'PRD-NES-32',
    price: 12000,
    stock: '45 dona',
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    name: 'Tandir Non (Issiq)',
    code: 'PRD-NON-01',
    price: 4000,
    stock: '80 dona',
    category: 'bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    name: 'Banan Ekvador (Shirin)',
    code: 'PRD-BAN-01',
    price: 25000,
    stock: '12.5 kg',
    category: 'top',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    name: 'Toshkent Choy Qora 100g',
    code: 'PRD-CHOY-95',
    price: 8500,
    stock: '60 dona',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '5',
    name: 'President Sariyog 200g',
    code: 'PRD-SAR-200',
    price: 32000,
    stock: '24 dona',
    category: 'dairy',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '6',
    name: 'Coca-Cola 1.5L',
    code: 'PRD-CC-15',
    price: 14000,
    stock: '150 dona',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '7',
    name: 'Coca-Cola Classic 1.5L',
    code: 'PRD-CCC-15',
    price: 14000,
    stock: '115 dona',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: '8',
    name: 'Colgate Triple Action',
    code: 'PRD-COL-01',
    price: 18000,
    stock: '30 dona',
    category: 'top',
    image: 'https://images.unsplash.com/photo-1559591937-e1032a138bcf?w=400&auto=format&fit=crop&q=80',
  },
];

export const INITIAL_DEMO_CUSTOMERS: DemoCustomer[] = [
  { id: '1', name: 'Olim aka (Doimiy xaridor)', phone: '+998 90 123-45-67', debt: 340000 },
  { id: '2', name: 'Jamshid (Qo\'shni mahalla)', phone: '+998 93 987-65-43', debt: 150000 },
  { id: '3', name: 'Sarvar Qurilish Mollari', phone: '+998 97 555-44-33', debt: 1190000 },
];

export const INITIAL_DEMO_TABLES: DemoTable[] = [
  {
    id: '1',
    name: '1-Stol (Zal)',
    capacity: 4,
    occupied: true,
    orderNumber: '#ORD-104',
    orderTotal: 140000,
    waiter: 'Davronbek (Ofitsiant)',
  },
  {
    id: '2',
    name: '2-Stol (Zal)',
    capacity: 4,
    occupied: false,
    orderNumber: '',
    orderTotal: 0,
    waiter: '',
  },
  {
    id: '3',
    name: '3-Stol (Terassa)',
    capacity: 6,
    occupied: true,
    orderNumber: '#ORD-108',
    orderTotal: 265000,
    waiter: 'Sardor (Ofitsiant)',
  },
  {
    id: '4',
    name: 'VIP Xona',
    capacity: 10,
    occupied: false,
    orderNumber: '',
    orderTotal: 0,
    waiter: '',
  },
];
