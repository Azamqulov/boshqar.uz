import { describe, it, expect } from 'vitest';
import { formatUzbekPhone, cleanUzbekPhone, extract9Digits } from '../usePhoneMask';

describe('usePhoneMask composable', () => {
  it('formats raw digits to +998 XX XXX XX XX format', () => {
    expect(formatUzbekPhone('901234567')).toBe('+998 90 123 45 67');
    expect(formatUzbekPhone('998901234567')).toBe('+998 90 123 45 67');
  });

  it('cleans formatted phone string to standard +998XXXXXXXXX format', () => {
    expect(cleanUzbekPhone('+998 90 123 45 67')).toBe('+998901234567');
    expect(cleanUzbekPhone('90 123 45 67')).toBe('+998901234567');
  });

  it('extracts 9 digits accurately', () => {
    expect(extract9Digits('+998 90 123 45 67')).toBe('901234567');
    expect(extract9Digits('998901234567')).toBe('901234567');
    expect(extract9Digits('')).toBe('');
  });
});
