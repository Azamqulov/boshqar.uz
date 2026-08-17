/**
 * Format raw currency numbers to target business currency (UZS, USD, RUB, EUR, KZT)
 */
export function formatCurrency(amount: number | string = 0, currency: string = 'UZS'): string {
  const num = Number(amount || 0);
  const cur = (currency || 'UZS').toUpperCase();

  if (cur === 'USD') {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: num % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
  }
  if (cur === 'RUB') {
    return `${num.toLocaleString('ru-RU')} ₽`;
  }
  if (cur === 'EUR') {
    return `€${num.toLocaleString('de-DE', { minimumFractionDigits: num % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
  }
  if (cur === 'KZT') {
    return `${num.toLocaleString('ru-RU')} ₸`;
  }
  return `${num.toLocaleString('uz-UZ')} so'm`;
}

export const formatSum = formatCurrency;

/**
 * Format raw phone input to clean readable Uzbek format: +998 (77) 040-46-24
 */
export function formatUzbekPhoneDisplay(input: string = ''): string {
  const digits = input.replace(/\D/g, '');
  const raw9 = digits.length >= 9 ? digits.slice(-9) : digits;
  if (raw9.length === 9) {
    return `+998 (${raw9.slice(0, 2)}) ${raw9.slice(2, 5)}-${raw9.slice(5, 7)}-${raw9.slice(7, 9)}`;
  }
  return input;
}

/**
 * Normalize phone to E.164 +998XXXXXXXXX format for backend
 */
export function normalizeUzbekPhone(input: string = ''): string {
  const digits = input.replace(/\D/g, '');
  const raw9 = digits.length >= 9 ? digits.slice(-9) : digits;
  return `+998${raw9}`;
}
