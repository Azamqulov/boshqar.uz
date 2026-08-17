import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';
import { useAuthStore } from './auth.store';
import { usePosSettings } from '../composables/usePosSettings';

export interface CbuRateItem {
  id: number;
  code: string;
  ccy: string;
  ccyNm_UZ: string;
  ccyNm_RU: string;
  ccyNm_EN: string;
  nominal: string;
  rate: string;
  diff: string;
  date: string;
  rateNumber: number;
}

export type CurrencyCode = 'UZS' | 'USD' | 'RUB' | 'EUR';

export const useCurrencyStore = defineStore('currency', () => {
  const authStore = useAuthStore();
  const { posSettings, saveSettings } = usePosSettings();

  const rates = ref<Record<string, CbuRateItem>>({
    UZS: {
      id: 0,
      code: '860',
      ccy: 'UZS',
      ccyNm_UZ: "O'zbekiston so'mi",
      ccyNm_RU: 'Узбекский сум',
      ccyNm_EN: 'Uzbekistan Sum',
      nominal: '1',
      rate: '1',
      diff: '0',
      date: '',
      rateNumber: 1,
    },
    USD: {
      id: 68,
      code: '840',
      ccy: 'USD',
      ccyNm_UZ: 'AQSH dollari',
      ccyNm_RU: 'Доллар США',
      ccyNm_EN: 'US Dollar',
      nominal: '1',
      rate: '11937.89',
      diff: '0',
      date: '',
      rateNumber: 11937.89,
    },
    EUR: {
      id: 20,
      code: '978',
      ccy: 'EUR',
      ccyNm_UZ: 'EVRO',
      ccyNm_RU: 'Евро',
      ccyNm_EN: 'Euro',
      nominal: '1',
      rate: '13769.16',
      diff: '0',
      date: '',
      rateNumber: 13769.16,
    },
    RUB: {
      id: 56,
      code: '643',
      ccy: 'RUB',
      ccyNm_UZ: 'Rossiya rubli',
      ccyNm_RU: 'Российский рубль',
      ccyNm_EN: 'Russian Ruble',
      nominal: '1',
      rate: '141.76',
      diff: '0',
      date: '',
      rateNumber: 141.76,
    },
  });

  const lastUpdated = ref<string>('');
  const loading = ref<boolean>(false);

  const activeCurrency = computed<CurrencyCode>(() => {
    return (authStore.activeBusiness?.currency as CurrencyCode) || 'UZS';
  });

  // Exchange rate mode: 'auto' (Central Bank CBU) or 'custom' (Manually set by business)
  const rateMode = computed<'auto' | 'custom'>({
    get: () => posSettings.value.currencyRateMode || 'auto',
    set: (val) => {
      posSettings.value.currencyRateMode = val;
      saveSettings({ currencyRateMode: val });
    },
  });

  const customRates = computed({
    get: () => posSettings.value.customRates || { USD: 12900, RUB: 145, EUR: 14000 },
    set: (val) => {
      posSettings.value.customRates = val;
      saveSettings({ customRates: val });
    },
  });

  // CBU direct official rates
  const cbuUsdRate = computed<number>(() => rates.value['USD']?.rateNumber || 11937.89);
  const cbuRubRate = computed<number>(() => rates.value['RUB']?.rateNumber || 141.76);
  const cbuEurRate = computed<number>(() => rates.value['EUR']?.rateNumber || 13769.16);

  // Effective rates used for all system conversions & calculations
  const usdRate = computed<number>(() => {
    if (rateMode.value === 'custom' && Number(customRates.value.USD) > 0) {
      return Number(customRates.value.USD);
    }
    return cbuUsdRate.value;
  });

  const rubRate = computed<number>(() => {
    if (rateMode.value === 'custom' && Number(customRates.value.RUB) > 0) {
      return Number(customRates.value.RUB);
    }
    return cbuRubRate.value;
  });

  const eurRate = computed<number>(() => {
    if (rateMode.value === 'custom' && Number(customRates.value.EUR) > 0) {
      return Number(customRates.value.EUR);
    }
    return cbuEurRate.value;
  });

  async function fetchRates(force = false) {
    if (loading.value) return;
    if (!force && lastUpdated.value) return;

    loading.value = true;
    try {
      const { data } = await api.get('/currencies/rates');
      if (data?.allRates) {
        rates.value = { ...rates.value, ...data.allRates };
        lastUpdated.value = data.lastUpdated || new Date().toISOString();
      }
    } catch (err) {
      console.warn('Could not fetch latest CBU rates, using built-in rates:', err);
    } finally {
      loading.value = false;
    }
  }

  function setRateMode(mode: 'auto' | 'custom') {
    rateMode.value = mode;
  }

  function setCustomRate(currency: 'USD' | 'RUB' | 'EUR', rate: number) {
    const updated = { ...customRates.value, [currency]: rate };
    customRates.value = updated;
  }

  function getRate(currency: string): number {
    const c = currency.toUpperCase();
    if (c === 'UZS') return 1;
    if (c === 'USD') return usdRate.value;
    if (c === 'RUB') return rubRate.value;
    if (c === 'EUR') return eurRate.value;
    return rates.value[c]?.rateNumber || 1;
  }

  function convert(amount: number | string, from = 'UZS', to = 'UZS'): number {
    const num = Number(amount) || 0;
    const fromCcy = from.toUpperCase();
    const toCcy = to.toUpperCase();
    if (fromCcy === toCcy) return num;

    const fromRate = getRate(fromCcy);
    const toRate = getRate(toCcy);

    const uzsVal = num * fromRate;
    const converted = uzsVal / toRate;
    return Number(converted.toFixed(2));
  }

  function toUZS(amount: number | string, fromCurrency?: string): number {
    return convert(amount, fromCurrency || activeCurrency.value, 'UZS');
  }

  function fromUZS(amountInUZS: number | string, toCurrency?: string): number {
    return convert(amountInUZS, 'UZS', toCurrency || activeCurrency.value);
  }

  function getSymbol(currency?: string): string {
    const curr = (currency || activeCurrency.value || 'UZS').toUpperCase();
    switch (curr) {
      case 'USD':
        return '$';
      case 'RUB':
        return '₽';
      case 'EUR':
        return '€';
      case 'UZS':
      default:
        return "so'm";
    }
  }

  function format(amount: number | string | null | undefined, currency?: string, isAlreadyInCurrency = false): string {
    const rawVal = Number(amount || 0);
    const curr = (currency || activeCurrency.value || 'UZS').toUpperCase();

    // If amounts in DB are stored in base currency (UZS), convert them to target currency
    const val = (isAlreadyInCurrency || curr === 'UZS') ? rawVal : convert(rawVal, 'UZS', curr);

    const symbol = getSymbol(curr);

    // If currency is USD, EUR, or RUB, display with 2 decimal places
    let formatted: string;
    if (curr === 'USD' || curr === 'EUR' || curr === 'RUB') {
      formatted = val.toLocaleString('uz-UZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).replace(/,/g, ' ');
      
      if (curr === 'USD') return `$ ${formatted}`;
      if (curr === 'EUR') return `€ ${formatted}`;
      if (curr === 'RUB') return `${formatted} ₽`;
    } else {
      formatted = Math.round(val).toLocaleString('uz-UZ').replace(/,/g, ' ');
    }

    return `${formatted} ${symbol}`;
  }

  // Auto initialize rates
  fetchRates();

  return {
    rates,
    lastUpdated,
    loading,
    activeCurrency,
    rateMode,
    customRates,
    cbuUsdRate,
    cbuRubRate,
    cbuEurRate,
    usdRate,
    rubRate,
    eurRate,
    fetchRates,
    setRateMode,
    setCustomRate,
    getRate,
    convert,
    toUZS,
    fromUZS,
    getSymbol,
    format,
  };
});
