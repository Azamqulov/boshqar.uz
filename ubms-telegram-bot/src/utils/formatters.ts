/**
 * Format raw currency numbers to Uzbek so'm format
 */
export function formatSum(amount: number | string = 0): string {
  return Number(amount || 0).toLocaleString('uz-UZ') + " so'm";
}

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
