import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import api from '../services/api';

const cachedBillingData = ref<any>(null);

const loadCachedBilling = () => {
  try {
    const saved = localStorage.getItem('ubms_cache_billing_status');
    if (saved) {
      cachedBillingData.value = JSON.parse(saved);
    }
  } catch (e) {}
};

loadCachedBilling();

if (typeof window !== 'undefined') {
  window.addEventListener('billing-updated', loadCachedBilling);
  window.addEventListener('storage', loadCachedBilling);
}

const getInitialHideLocked = (): boolean => {
  try {
    return localStorage.getItem('ubms_hide_locked_features') === 'true';
  } catch {
    return false;
  }
};

const hideLockedFeaturesState = ref<boolean>(getInitialHideLocked());

const setHideLockedFeatures = (val: boolean) => {
  hideLockedFeaturesState.value = val;
  try {
    localStorage.setItem('ubms_hide_locked_features', val ? 'true' : 'false');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hide-locked-features-changed', { detail: val }));
    }
  } catch {}
};

if (typeof window !== 'undefined') {
  window.addEventListener('hide-locked-features-changed', (e: any) => {
    hideLockedFeaturesState.value = !!e.detail;
  });
}

export function usePlanFeatures() {
  const authStore = useAuthStore();

  const fetchFeatures = async () => {
    try {
      const { data } = await api.get('/billing/status');
      if (data) {
        cachedBillingData.value = data;
        localStorage.setItem('ubms_cache_billing_status', JSON.stringify(data));
      }
    } catch (e) {}
  };

  const planFeatures = computed<Record<string, boolean>>(() => {
    const data = cachedBillingData.value;
    // 1. From active business plan features
    if (data?.business?.plan?.features && typeof data.business.plan.features === 'object') {
      return data.business.plan.features;
    }
    // 2. From matching plan in plans list
    if (data?.plans && Array.isArray(data.plans)) {
      const planName = data?.subscription?.planName || data?.business?.plan?.name || authStore.activeBusiness?.plan;
      if (planName) {
        const matched = data.plans.find(
          (p: any) => p.name?.toLowerCase() === planName.toLowerCase()
        );
        if (matched?.features && typeof matched.features === 'object') {
          return matched.features;
        }
      }
    }
    // Default fallback
    return {
      pos: true,
      inventory: true,
      finance: true,
      customer_loyalty: true,
      suppliers: true,
      telegram_bot: true,
      ai_assistant: true,
      ai_import: true,
      export_reports: true,
      vip_support: true,
      cloud_backup: true,
      barcode_studio: true,
    };
  });

  const isFeatureEnabled = (key: string): boolean => {
    const feats = planFeatures.value;
    if (!feats) return true;
    return feats[key] !== false;
  };

  const isFeatureDisabled = (key: string): boolean => {
    return !isFeatureEnabled(key);
  };

  const isFeatureVisible = (key: string): boolean => {
    const enabled = isFeatureEnabled(key);
    if (!enabled && hideLockedFeaturesState.value) {
      return false;
    }
    return true;
  };

  return {
    planFeatures,
    hideLockedFeatures: computed(() => hideLockedFeaturesState.value),
    setHideLockedFeatures,
    isFeatureEnabled,
    isFeatureDisabled,
    isFeatureVisible,
    fetchFeatures,
  };
}
