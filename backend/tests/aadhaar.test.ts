import { describe, it, expect } from '@jest/globals';
import {
  isValidAadhaar,
  getAadhaarValidationError,
  normalizeAadhaar,
  maskAadhaar,
} from '../src/domain/validators/aadhaar.validator';

describe('Aadhaar Validator', () => {
  it('should accept a valid Aadhaar number', () => {
    expect(isValidAadhaar('234567890124')).toBe(true);
  });

  it('should reject invalid checksum', () => {
    expect(isValidAadhaar('234567890123')).toBe(false);
    expect(getAadhaarValidationError('234567890123')).toContain('Checksum');
  });

  it('should reject numbers starting with 0 or 1', () => {
    expect(isValidAadhaar('123456789013')).toBe(false);
    expect(getAadhaarValidationError('023456789013')).toContain('cannot start');
  });

  it('should reject repeated digits', () => {
    expect(isValidAadhaar('999999999999')).toBe(false);
  });

  it('should normalize spaces', () => {
    expect(normalizeAadhaar('2345 6789 0124')).toBe('234567890124');
    expect(isValidAadhaar('2345 6789 0124')).toBe(true);
  });

  it('should mask Aadhaar for display', () => {
    expect(maskAadhaar('234567890124')).toBe('XXXX XXXX 0124');
  });
});
