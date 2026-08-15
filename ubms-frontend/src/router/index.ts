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
const InventoryView = () => import('../views/inventory/InventoryView.vue');
const WaiterView = () => import('../views/restaurant/WaiterView.vue');
const KDSView = () => import('../views/restaurant/KDSView.vue');
const AppointmentsView = () => import('../views/appointments/AppointmentsView.vue');
const CustomersView = () => import('../views/customers/CustomersView.vue');
const SuppliersView = () => import('../views/suppliers/SuppliersView.vue');
const FinanceView = () => import('../views/finance/FinanceView.vue');
const SettingsView = () => import('../views/settings/SettingsView.vue');
const GuideView = () => import('../views/guide/GuideView.vue');
const SuperAdminView = () => import('../views/superadmin/SuperAdminView.vue');
const LandingView = () => import('../views/landing/LandingView.vue');
const NotFoundView = () => import('../views/errors/NotFoundView.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: LandingView,
  },
  {
    path: '/about',
    component: LandingView,
  },
  {
    path: '/landing',
    component: LandingView,
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
      { path: 'categories', component: CategoriesView },
      { path: 'products/categories', component: CategoriesView },
      { path: 'inventory', component: InventoryView },
      { path: 'restaurant/tables', component: WaiterView },
      { path: 'restaurant/waiter', component: WaiterView },
      { path: 'restaurant/kds', component: KDSView },
      { path: 'appointments', component: AppointmentsView },
      { path: 'appointments/services', component: AppointmentsView },
      { path: 'customers', component: CustomersView },
      { path: 'suppliers', component: SuppliersView },
      { path: 'finance', component: FinanceView },
      { path: 'guide', component: GuideView },
      { path: 'help', redirect: '/guide' },
      { path: 'settings', component: SettingsView },
      { path: 'superadmin', component: SuperAdminView },
    ],
  },
  { path: '/:pathMatch(.*)*', component: NotFoundView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  // Check invalid section hash on landing page (e.g. #faqasdsadfgsdfg -> 404)
  const validLandingHashes = ['', '#about', '#features', '#pricing', '#faq', '#demo'];
  if (to.path === '/' && to.hash && !validLandingHashes.includes(to.hash)) {
    return next('/404');
  }

  const token = localStorage.getItem('ubms_access_token');
  const userStr = localStorage.getItem('ubms_user');
  const activeBizStr = localStorage.getItem('ubms_active_business');

  const user = userStr ? JSON.parse(userStr) : null;
  const activeBiz = activeBizStr ? JSON.parse(activeBizStr) : null;

  if (to.meta.requiresAuth && (!token || !user)) {
    next('/auth/login');
  } else if (to.path.startsWith('/auth') && token && user) {
    if (!activeBiz && !user.isSuperAdmin) {
      next('/onboarding');
    } else {
      const role = (activeBiz?.role || '').toLowerCase();
      const isWorker = !user.isSuperAdmin && role !== 'owner' && role !== 'admin';
      if (isWorker) {
        next('/pos');
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
      next('/pos');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
