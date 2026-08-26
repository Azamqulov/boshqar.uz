import { ref } from 'vue';
import api from '../services/api';

export interface PosSettings {
  allowDineIn: boolean;
  allowTakeaway: boolean;
  allowDelivery: boolean;
  allowDebt: boolean;
  allowDiscounts: boolean;
  quickBarcode: boolean;
  autoShowReceipt: boolean;
  allowZeroStockSale: boolean;
  enableHotkeys: boolean;
  // Qarz limiti: 0 = cheksiz, >0 = maksimal qarz summa
  maxDebtLimit: number;
  // Receipt & Printer Settings
  enableReceiptPrinting: boolean;
  autoPrintReceipt: boolean;
  receiptWidth: '58mm' | '80mm';
  receiptHeaderTitle: string;
  receiptAddress: string;
  receiptPhone: string;
  receiptFooterMessage: string;
  showQrCode: boolean;
  showCashierName: boolean;
  showItemCount: boolean;
  // Currency exchange rate mode and custom overrides
  currencyRateMode: 'auto' | 'custom';
  showCurrencyTicker: boolean;
  customRates: {
    USD: number;
    RUB: number;
    EUR: number;
  };
  // Service Fee (Restoran / Kafe Xizmat haqi %)
  enableServiceFee: boolean;
  serviceFeePercent: number;
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
  enableHotkeys: true,
  maxDebtLimit: 0, // 0 = cheksiz
  // Service Fee default
  enableServiceFee: true,
  serviceFeePercent: 10,
  // Receipt & Printer defaults

  enableReceiptPrinting: true,
  autoPrintReceipt: false,
  receiptWidth: '58mm',
  receiptHeaderTitle: 'Boshqar.uz',
  receiptAddress: '',
  receiptPhone: '',
  receiptFooterMessage: 'Xaridingiz uchun rahmat! Yana kutib qolamiz!',
  showQrCode: true,
  showCashierName: true,
  showItemCount: true,
  // Currency defaults
  currencyRateMode: 'auto',
  showCurrencyTicker: true,
  customRates: {
    USD: 12900,
    RUB: 145,
    EUR: 14000,
  },
};

const STORAGE_KEY = 'ubms_pos_feature_settings';

const getBusinessId = (): string => {
  try {
    const rawBiz = localStorage.getItem('ubms_active_business');
    if (rawBiz) {
      const parsed = JSON.parse(rawBiz);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return localStorage.getItem('ubms_active_business_id') || '';
};

const getStorageKey = (): string => {
  const bizId = getBusinessId();
  return bizId ? `ubms_pos_settings_${bizId}` : STORAGE_KEY;
};

const loadSavedSettings = (): PosSettings => {
  try {
    const key = getStorageKey();
    const raw = localStorage.getItem(key) || localStorage.getItem(STORAGE_KEY);
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
let isFetching = false;

export const usePosSettings = () => {
  const fetchSettingsFromApi = async () => {
    const bizId = getBusinessId();
    if (!bizId || isFetching) return;
    try {
      isFetching = true;
      const res = await api.get(`/businesses/${bizId}/settings`);
      if (res.data && Object.keys(res.data).length > 0) {
        posSettings.value = { ...defaultPosSettings, ...res.data };
        const key = getStorageKey();
        localStorage.setItem(key, JSON.stringify(posSettings.value));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posSettings.value));
      }
    } catch (err) {
      console.warn('Could not fetch remote pos settings, using local:', err);
    } finally {
      isFetching = false;
    }
  };

  const reloadSettings = () => {
    posSettings.value = loadSavedSettings();
    fetchSettingsFromApi();
  };

  const saveSettings = async (newSettings?: Partial<PosSettings>) => {
    if (newSettings) {
      posSettings.value = { ...posSettings.value, ...newSettings };
    }
    const key = getStorageKey();
    const json = JSON.stringify(posSettings.value);
    localStorage.setItem(key, json);
    localStorage.setItem(STORAGE_KEY, json);

    // Persist to database
    const bizId = getBusinessId();
    if (bizId) {
      try {
        await api.put(`/businesses/${bizId}/settings`, { posSettings: posSettings.value });
      } catch (err) {
        console.error('Failed to persist POS settings to database:', err);
      }
    }
  };

  const resetToDefaults = async () => {
    posSettings.value = { ...defaultPosSettings };
    const key = getStorageKey();
    const json = JSON.stringify(defaultPosSettings);
    localStorage.setItem(key, json);
    localStorage.setItem(STORAGE_KEY, json);

    const bizId = getBusinessId();
    if (bizId) {
      try {
        await api.put(`/businesses/${bizId}/settings`, { posSettings: defaultPosSettings });
      } catch (err) {}
    }
  };

  // Initial background fetch
  fetchSettingsFromApi();

  return {
    posSettings,
    saveSettings,
    updatePosSettings: saveSettings,
    resetToDefaults,
    reloadSettings,
    fetchSettingsFromApi,
  };
};

