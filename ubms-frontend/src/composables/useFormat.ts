import { useAuthStore } from '../stores/auth.store';

export function useFormat() {
  const authStore = useAuthStore();

  const formatCurrency = (amount: number | string | null | undefined): string => {
    const val = Number(amount || 0);
    const currency = authStore.activeBusiness?.currency || 'UZS';
    const formatted = val.toLocaleString('uz-UZ').replace(/,/g, ' ');
    return `${formatted} ${currency === 'UZS' ? "so'm" : currency}`;
  };

  const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '-';
    const date = new Date(dateInput);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    formatCurrency,
    formatDate,
  };
}
