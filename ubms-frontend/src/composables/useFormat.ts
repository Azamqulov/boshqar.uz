import { useCurrencyStore } from '../stores/currency.store';
import { useAuthStore } from '../stores/auth.store';

export function useFormat() {
  const currencyStore = useCurrencyStore();
  const authStore = useAuthStore();

  const formatCurrency = (amount: number | string | null | undefined, currencyOverride?: string, isAlreadyInCurrency = false): string => {
    const val = Number(amount || 0);
    const curr = currencyOverride || authStore.activeBusiness?.currency || 'UZS';
    return currencyStore.format(val, curr, isAlreadyInCurrency);
  };

  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateTime = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const formatTime = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '-';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '-';
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return {
    formatCurrency,
    formatDate,
    formatDateTime,
    formatTime,
  };
}
