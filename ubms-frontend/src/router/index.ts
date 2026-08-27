import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const DefaultLayout = () => import('../layouts/DefaultLayout.vue');
const AuthLayout = () => import('../layouts/AuthLayout.vue');

const LoginView = () => import('../views/auth/LoginView.vue');
const RegisterView = () => import('../views/auth/RegisterView.vue');
const OnboardingWizard = () => import('../views/onboarding/OnboardingWizard.vue');

const DashboardView = () => import('../views/dashboard/DashboardView.vue');
const POSView = () => import('../views/pos/POSView.vue');
const ProductsView = () => import('../views/products/ProductsView.vue');
const CategoriesView = () => import('../views/products/CategoriesView.vue');
const AiProductImportView = () => import('../views/products/AiProductImportView.vue');
const InventoryView = () => import('../views/inventory/InventoryView.vue');
const WaiterView = () => import('../views/restaurant/WaiterView.vue');
const KDSView = () => import('../views/restaurant/KDSView.vue');
const AppointmentsView = () => import('../views/appointments/AppointmentsView.vue');
const CustomersView = () => import('../views/customers/CustomersView.vue');
const SuppliersView = () => import('../views/suppliers/SuppliersView.vue');
const FinanceView = () => import('../views/finance/FinanceView.vue');
const SettingsView = () => import('../views/settings/SettingsView.vue');
const BillingView = () => import('../views/billing/BillingView.vue');
const GuideView = () => import('../views/guide/GuideView.vue');
const AboutView = () => import('../views/about/AboutView.vue');
const SuperAdminView = () => import('../views/superadmin/SuperAdminView.vue');
const LandingView = () => import('../views/landing/LandingView.vue');
const LegalView = () => import('../views/legal/LegalView.vue');
const NotFoundView = () => import('../views/errors/NotFoundView.vue');

const TelegramBotView = () => import('../views/landing/pages/TelegramBotView.vue');
const SectorsView = () => import('../views/landing/pages/SectorsView.vue');
const AnalysisView = () => import('../views/landing/pages/AnalysisView.vue');
const PricingView = () => import('../views/landing/pages/PricingView.vue');
const HelpAndReviewsView = () => import('../views/landing/pages/HelpAndReviewsView.vue');
const ContactView = () => import('../views/landing/pages/ContactView.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: LandingView,
  },
  {
    path: '/landing',
    component: LandingView,
  },
  { path: '/telegram-bot', component: TelegramBotView },
  { path: '/sohalar', component: SectorsView },
  { path: '/tahlil', component: AnalysisView },
  { path: '/kalkulyator', redirect: '/tahlil' },
  { path: '/taqqoslash', redirect: '/tahlil' },
  { path: '/tariflar', component: PricingView },
  { path: '/yordam', component: HelpAndReviewsView },
  { path: '/sharhlar', redirect: '/yordam' },
  { path: '/faq', redirect: '/yordam' },
  { path: '/aloqa', component: ContactView },
  {
    path: '/legal',
    component: LegalView,
  },
  {
    path: '/privacy',
    component: LegalView,
  },
  {
    path: '/cookies',
    component: LegalView,
  },
  {
    path: '/security',
    component: LegalView,
  },
  {
    path: '/terms',
    component: LegalView,
  },
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      { path: 'login', component: LoginView },
      { path: 'register', component: RegisterView },
    ],
  },
  {
    path: '/onboarding',
    component: OnboardingWizard,
    meta: { requiresAuth: true },
  },
  {
    path: '/404',
    component: NotFoundView,
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: DashboardView },
      { path: 'pos', component: POSView },
      { path: 'products', component: ProductsView },
      { path: 'products/ai-import', component: AiProductImportView },
      { path: 'categories', component: CategoriesView },
      { path: 'products/categories', component: CategoriesView },
      { path: 'inventory', component: InventoryView },
      { path: 'restaurant/tables', component: WaiterView },
      { path: 'tables', redirect: '/restaurant/tables' },
      { path: 'restaurant/waiter', component: WaiterView },
      { path: 'restaurant/kds', component: KDSView },
      { path: 'kds', redirect: '/restaurant/kds' },
      { path: 'appointments', component: AppointmentsView },
      { path: 'appointments/services', component: AppointmentsView },
      { path: 'customers', component: CustomersView },
      { path: 'suppliers', component: SuppliersView },
      { path: 'finance', component: FinanceView },
      { path: 'guide', component: GuideView },
      { path: 'help', redirect: '/guide' },
      { path: 'about', redirect: '/guide' },
      { path: 'billing', component: BillingView },
      { path: 'settings', component: SettingsView },
      { path: 'superadmin', component: SuperAdminView },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

export function getWorkerDefaultRoute(allowedModules: string[] = []): string {
  if (!allowedModules || allowedModules.length === 0 || allowedModules.includes('all') || allowedModules.includes('dashboard')) {
    return '/dashboard';
  }
  if (allowedModules.includes('tables')) return '/restaurant/tables';
  if (allowedModules.includes('pos')) return '/pos';
  if (allowedModules.includes('kds')) return '/restaurant/kds';
  if (allowedModules.includes('products')) return '/products';
  if (allowedModules.includes('inventory')) return '/inventory';
  if (allowedModules.includes('customers')) return '/customers';
  if (allowedModules.includes('suppliers')) return '/suppliers';
  if (allowedModules.includes('finance')) return '/finance';
  if (allowedModules.includes('appointments')) return '/appointments';
  return '/pos';
}

router.beforeEach((to, _from, next) => {
  const validLandingHashes = [
    '#features',
    '#demo',
    '#pricing',
    '#faq',
    '#sectors',
    '#calculator',
    '#compare',
    '#testimonials',
  ];
  if (to.path === '/' && to.hash && !validLandingHashes.includes(to.hash)) {
    return next();
  }

  const token = localStorage.getItem('ubms_access_token');
  const userStr = localStorage.getItem('ubms_user');
  const activeBizStr = localStorage.getItem('ubms_active_business');

  let user: any = null;
  let activeBiz: any = null;
  try {
    user = userStr && userStr !== 'undefined' ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Failed to parse user from localStorage:', e);
    localStorage.removeItem('ubms_user');
  }

  try {
    activeBiz = activeBizStr && activeBizStr !== 'undefined' ? JSON.parse(activeBizStr) : null;
  } catch (e) {
    console.error('Failed to parse active business from localStorage:', e);
    localStorage.removeItem('ubms_active_business');
  }

  const role = (activeBiz?.role || '').toLowerCase();
  const isWorker = !user?.isSuperAdmin && role !== 'owner' && role !== 'admin';

  const isDemo =
    user?.phone === '+998900000000' ||
    user?.id === 'demo-user-id' ||
    user?.email === 'demo@boshqar.uz' ||
    (token?.startsWith('demo-session') ?? false);

  const isSubscriptionExpired =
    !user?.isSuperAdmin &&
    !isWorker &&
    activeBiz?.plan !== 'Free' &&
    Boolean(activeBiz?.isSubscriptionExpired || activeBiz?.subscription?.isExpired);

  const allowedWhenExpired = [
    '/billing',
    '/settings',
    '/guide',
    '/help',
    '/about',
    '/legal',
    '/privacy',
    '/terms',
    '/cookies',
    '/security',
  ];

  if (to.meta.requiresAuth && (!token || !user)) {
    next('/auth/login');
  } else if (to.meta.requiresAuth && isSubscriptionExpired && !allowedWhenExpired.some((p) => to.path === p || to.path.startsWith(p + '/'))) {
    next('/billing');
  } else if (to.path.startsWith('/auth') && token && user) {
    if (isDemo) {
      localStorage.removeItem('ubms-access_token');
      localStorage.removeItem('ubms-refresh_token');
      localStorage.removeItem('ubms_user');
      localStorage.removeItem('ubms_businesses');
      localStorage.removeItem('ubms_active_business');
      next();
    } else if (!activeBiz && !user.isSuperAdmin) {
      next('/onboarding');
    } else if (isSubscriptionExpired) {
      next('/billing');
    } else {
      const role = (activeBiz?.role || '').toLowerCase();
      const isWorker = !user.isSuperAdmin && role !== 'owner' && role !== 'admin';
      if (isWorker) {
        next(getWorkerDefaultRoute(activeBiz?.allowedModules));
      } else {
        next('/dashboard');
      }
    }
  } else if (to.meta.requiresAuth && !activeBiz && !user?.isSuperAdmin && to.path !== '/onboarding') {
    next('/onboarding');
  } else if (to.path === '/dashboard' && activeBiz) {
    const role = (activeBiz?.role || '').toLowerCase();
    const isWorker = !user?.isSuperAdmin && role !== 'owner' && role !== 'admin';
    const allowed = activeBiz?.allowedModules || [];
    if (isWorker && !allowed.includes('dashboard') && !allowed.includes('all')) {
      next(getWorkerDefaultRoute(allowed));
    } else {
      next();
    }
  } else if (to.path === '/pos' && activeBiz) {
    const role = (activeBiz?.role || '').toLowerCase();
    const isWorker = !user?.isSuperAdmin && role !== 'owner' && role !== 'admin';
    const allowed = activeBiz?.allowedModules || [];
    if (isWorker && !allowed.includes('pos') && !allowed.includes('orders') && !allowed.includes('all')) {
      next(getWorkerDefaultRoute(allowed));
    } else {
      next();
    }
  } else {
    next();
  }
});

router.afterEach((to) => {
  const titles: Record<string, string> = {
    '/': 'Boshqar.uz — O\'zbekistondagi №1 Savdo, Restoran va Do\'kon Boshqaruv Tizimi (POS Kassa)',
    '/landing': 'Boshqar.uz — Savdo va Biznes Boshqaruv Platformasi',
    '/guide': 'Boshqar.uz Qo\'llanma — POS Kassa va Tizimdan Foydalanish',
    '/security': 'Xavfsizlik Siyosati — Boshqar.uz',
    '/privacy': 'Maxfiylik Siyosati — Boshqar.uz',
    '/cookies': 'Cookie Siyosati — Boshqar.uz',
    '/terms': 'Foydalanish Shartlari — Boshqar.uz',
    '/auth/login': 'Tizimga Kirish — Boshqar.uz',
    '/auth/register': '14 Kun Bepul Ro\'yxatdan O\'tish — Boshqar.uz',
    '/dashboard': 'Boshqaruv Paneli — Boshqar.uz',
    '/pos': 'Tezkor Kassa (POS) — Boshqar.uz',
    '/products': 'Mahsulotlar va Sklad — Boshqar.uz',
    '/finance': 'Moliya va Hisobotlar — Boshqar.uz',
    '/billing': 'Tariflar va Obuna — Boshqar.uz',
  };

  document.title = titles[to.path] || 'Boshqar.uz — Universal Biznes Boshqaruv Tizimi';
});

export default router;
