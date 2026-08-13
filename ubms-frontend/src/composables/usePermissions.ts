import { computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';

export type ActionType = 'view' | 'create' | 'edit' | 'delete';

export function usePermissions() {
  const authStore = useAuthStore();

  const isOwner = computed(() => {
    return authStore.activeBusiness?.role === 'Owner' || authStore.user?.isSuperAdmin || false;
  });

  const can = (moduleName: string, action: ActionType = 'view'): boolean => {
    if (isOwner.value) return true;

    const allowed = authStore.user?.allowedModules || authStore.activeBusiness?.allowedModules || ['all'];
    if (allowed.includes('all')) return true;
    if (!allowed.includes(moduleName)) return false;

    const actionPermissions = authStore.user?.actionPermissions || {};
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
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
}
