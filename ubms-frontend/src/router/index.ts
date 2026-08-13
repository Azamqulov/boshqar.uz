import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const DefaultLayout = () => import('../layouts/DefaultLayout.vue');
const AuthLayout = () => import('../layouts/AuthLayout.vue');

const LoginView = () => import('../views/auth/LoginView.vue');
const RegisterView = () => import('../views/auth/RegisterView.vue');
const OnboardingWizard = () => import('../views/onboarding/OnboardingWizard.vue');

const DashboardView = () => import('../views/dashboard/DashboardView.vue');
const POSView = () => import('../views/pos/POSView.vue');
const ProductsView = () => import('../views/products/ProductsView.vue');
const InventoryView = () => import('../views/inventory/InventoryView.vue');
const WaiterView = () => import('../views/restaurant/WaiterView.vue');
const KDSView = () => import('../views/restaurant/KDSView.vue');
const AppointmentsView = () => import('../views/appointments/AppointmentsView.vue');
const CustomersView = () => import('../views/customers/CustomersView.vue');
const FinanceView = () => import('../views/finance/FinanceView.vue');
const SettingsView = () => import('../views/settings/SettingsView.vue');
const SuperAdminView = () => import('../views/superadmin/SuperAdminView.vue');

const routes: RouteRecordRaw[] = [
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
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: DashboardView },
      { path: 'pos', component: POSView },
      { path: 'products', component: ProductsView },
      { path: 'inventory', component: InventoryView },
      { path: 'restaurant/tables', component: WaiterView },
      { path: 'restaurant/waiter', component: WaiterView },
      { path: 'restaurant/kds', component: KDSView },
      { path: 'appointments', component: AppointmentsView },
      { path: 'appointments/services', component: AppointmentsView },
      { path: 'customers', component: CustomersView },
      { path: 'suppliers', component: CustomersView },
      { path: 'finance', component: FinanceView },
      { path: 'settings', component: SettingsView },
      { path: 'superadmin', component: SuperAdminView },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
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
  } else if (to.path === '/' || (to.path === '/dashboard' && activeBiz)) {
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
