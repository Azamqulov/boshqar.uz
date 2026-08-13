import { ref } from 'vue';

export interface PosSettings {
  allowDineIn: boolean;
  allowTakeaway: boolean;
  allowDelivery: boolean;
  allowDebt: boolean;
  allowDiscounts: boolean;
  quickBarcode: boolean;
  autoShowReceipt: boolean;
  allowZeroStockSale: boolean;
}

export const defaultPosSettings: PosSettings = {
  allowDineIn: true,
  allowTakeaway: true,
  allowDelivery: true,
  allowDebt: true,
  allowDiscounts: true,
  quickBarcode: true,
  autoShowReceipt: true,
  allowZeroStockSale: true,
};

const STORAGE_KEY = 'ubms_pos_feature_settings';

const loadSavedSettings = (): PosSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...defaultPosSettings, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to parse pos settings:', e);
  }
  return { ...defaultPosSettings };
};

// Global reactive state shared across components
const posSettings = ref<PosSettings>(loadSavedSettings());

export const usePosSettings = () => {
  const saveSettings = (newSettings?: Partial<PosSettings>) => {
    if (newSettings) {
      posSettings.value = { ...posSettings.value, ...newSettings };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posSettings.value));
  };

  const resetToDefaults = () => {
    posSettings.value = { ...defaultPosSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPosSettings));
  };

  return {
    posSettings,
    saveSettings,
    resetToDefaults,
  };
};
