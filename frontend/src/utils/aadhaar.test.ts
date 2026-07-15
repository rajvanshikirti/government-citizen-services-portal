import { describe, it, expect } from 'vitest';
import { isValidAadhaar, formatAadhaar } from './aadhaar';

describe('Aadhaar utils', () => {
  it('validates correct Aadhaar checksum', () => {
    expect(isValidAadhaar('234567890124')).toBe(true);
  });

  it('rejects invalid Aadhaar', () => {
    expect(isValidAadhaar('234567890123')).toBe(false);
  });

  it('formats Aadhaar with spaces', () => {
    expect(formatAadhaar('234567890124')).toBe('2345 6789 0124');
  });
});
