/**
 * Automatically capitalizes the first letter of each word in a string.
 * Example: 'alisher qodirov' -> 'Alisher Qodirov'
 */
export function autoCapitalizeWords(val: string): string {
  if (!val) return '';
  return val.replace(/(?:^|\s|-)\S/g, (char) => char.toUpperCase());
}
