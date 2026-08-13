export function extract9Digits(value?: string): string {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    digits = digits.substring(3);
  }
  return digits.substring(0, 9);
}

export function formatUzbekPhone(value?: string): string {
  if (!value) return '';
  const digits = extract9Digits(value);
  if (digits.length === 0) return '';
  
  let formatted = '+998';
  if (digits.length > 0) formatted += ' ' + digits.substring(0, 2);
  if (digits.length > 2) formatted += ' ' + digits.substring(2, 5);
  if (digits.length > 5) formatted += ' ' + digits.substring(5, 7);
  if (digits.length > 7) formatted += ' ' + digits.substring(7, 9);
  return formatted;
}

export function cleanUzbekPhone(value?: string): string {
  if (!value) return '';
  const digits = extract9Digits(value);
  return digits.length > 0 ? `+998${digits}` : '';
}
