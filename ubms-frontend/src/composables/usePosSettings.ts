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
  enableHotkeys: boolean;
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
};

const STORAGE_KEY = 'ubms_pos_feature_settings';

const getStorageKey = (): string => {
  const bizId = localStorage.getItem('ubms_active_business_id');
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

export const usePosSettings = () => {
  const reloadSettings = () => {
    posSettings.value = loadSavedSettings();
  };

  const saveSettings = (newSettings?: Partial<PosSettings>) => {
    if (newSettings) {
      posSettings.value = { ...posSettings.value, ...newSettings };
    }
    const key = getStorageKey();
    const json = JSON.stringify(posSettings.value);
    localStorage.setItem(key, json);
    localStorage.setItem(STORAGE_KEY, json);
  };

  const resetToDefaults = () => {
    posSettings.value = { ...defaultPosSettings };
    const key = getStorageKey();
    const json = JSON.stringify(defaultPosSettings);
    localStorage.setItem(key, json);
    localStorage.setItem(STORAGE_KEY, json);
  };

  return {
    posSettings,
    saveSettings,
    resetToDefaults,
    reloadSettings,
  };
};
