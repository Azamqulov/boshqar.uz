import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import api from '../services/api';

export interface MaintenanceState {
  isMaintenance: boolean;
  title: string;
  message: string;
  estimatedEndTime?: string;
  updatedAt?: string;
}

const maintenanceData = ref<MaintenanceState>({
  isMaintenance: false,
  title: 'Texnik profilaktika ishlari olib borilmoqda',
  message: 'Tizimni yangilash va optimallashtirish ishlari ketmoqda. Tez orada barcha xizmatlar to\'liq quvvatda ishga tushadi.',
  estimatedEndTime: '20 daqiqadan so\'ng',
});

const isChecking = ref(false);
let pollInterval: any = null;

export function useMaintenanceMode() {
  const authStore = useAuthStore();

  const checkMaintenance = async (silent = true) => {
    if (!silent) isChecking.value = true;
    try {
      const { data } = await api.get('/health/maintenance');
      if (data && typeof data.isMaintenance === 'boolean') {
        maintenanceData.value = data;
      }
    } catch (e) {
      // fallback
    } finally {
      if (!silent) isChecking.value = false;
    }
  };

  const setMaintenance = async (payload: Partial<MaintenanceState>) => {
    const { data } = await api.patch('/superadmin/maintenance', payload);
    if (data) {
      maintenanceData.value = data;
    }
    return data;
  };

  const isMaintenanceActive = computed(() => {
    return Boolean(maintenanceData.value.isMaintenance);
  });

  const shouldBlockUser = computed(() => {
    if (!isMaintenanceActive.value) return false;
    // SuperAdmin is exempt from maintenance block
    if (authStore.user?.isSuperAdmin) return false;
    return true;
  });

  const startPolling = () => {
    checkMaintenance(true);
    if (!pollInterval) {
      pollInterval = setInterval(() => {
        checkMaintenance(true);
      }, 15000);
    }
  };

  const stopPolling = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  return {
    maintenanceData,
    isChecking,
    isMaintenanceActive,
    shouldBlockUser,
    checkMaintenance,
    setMaintenance,
    startPolling,
    stopPolling,
  };
}
