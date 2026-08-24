import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';

export type ActionType = 'view' | 'create' | 'edit' | 'delete';

export function usePermissions() {
  const authStore = useAuthStore();

  const isOwner = computed(() => {
    const role = (authStore.activeBusiness?.role || '').toLowerCase();
    const allowedModules = (authStore.activeBusiness as any)?.allowedModules || (authStore.user as any)?.allowedModules || [];
    return (
      role === 'owner' ||
      role === 'superadmin' ||
      role === 'admin' ||
      authStore.user?.isSuperAdmin === true ||
      allowedModules.includes('all')
    );
  });

  const canManualPrice = computed(() => {
    if (isOwner.value) return true;
    const user = authStore.user as any;
    const biz = authStore.activeBusiness as any;
    const perms = user?.permissions || biz?.permissions || [];
    if (Array.isArray(perms) && (perms.includes('*') || perms.includes('ALL') || perms.includes('orders.manualPrice'))) {
      return true;
    }
    return false;
  });

  const can = (moduleName: string, action: ActionType = 'view'): boolean => {
    // 1. Owner & SuperAdmin & Admin have FULL permissions across all modules
    if (isOwner.value) return true;

    // 2. Module check for staff
    const allowed = (authStore.user as any)?.allowedModules || (authStore.activeBusiness as any)?.allowedModules || [];
    if (allowed.includes('all')) return true;
    if (!allowed.includes(moduleName)) return false;

    // 3. Action permissions for staff
    const actionPermissions = (authStore.user as any)?.actionPermissions || (authStore.activeBusiness as any)?.actionPermissions || {};
    const modPerms = actionPermissions[moduleName];

    if (!modPerms) {
      // By default: delete requires explicit permission for non-owner staff
      if (action === 'delete') return false;
      return true;
    }

    if (action === 'view') return modPerms.view !== false;
    if (action === 'create') return modPerms.create !== false;
    if (action === 'edit') return modPerms.edit !== false;
    if (action === 'delete') return modPerms.delete === true;

    return true;
  };

  const canView = (moduleName: string) => can(moduleName, 'view');
  const canCreate = (moduleName: string) => can(moduleName, 'create');
  const canEdit = (moduleName: string) => can(moduleName, 'edit');
  const canDelete = (moduleName: string) => can(moduleName, 'delete');

  return {
    isOwner,
    canManualPrice,
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
}
