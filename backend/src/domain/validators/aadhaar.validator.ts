const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export function normalizeAadhaar(value: string): string {
  return value.replace(/\s+/g, '');
}

export function formatAadhaar(value: string): string {
  const digits = normalizeAadhaar(value).slice(0, 12);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function maskAadhaar(value: string): string {
  const digits = normalizeAadhaar(value);
  if (digits.length !== 12) return value;
  return `XXXX XXXX ${digits.slice(8)}`;
}

export function validateAadhaarChecksum(aadhaar: string): boolean {
  const normalized = normalizeAadhaar(aadhaar);

  if (!/^\d{12}$/.test(normalized)) {
    return false;
  }

  if (/^(\d)\1{11}$/.test(normalized)) {
    return false;
  }

  if (normalized[0] === '0' || normalized[0] === '1') {
    return false;
  }

  let checksum = 0;
  const digits = normalized.split('').map(Number).reverse();

  for (let i = 0; i < digits.length; i++) {
    checksum = VERHOEFF_D[checksum][VERHOEFF_P[i % 8][digits[i]]];
  }

  return checksum === 0;
}

export function getAadhaarValidationError(aadhaar: string): string | null {
  const normalized = normalizeAadhaar(aadhaar);

  if (!normalized) {
    return null;
  }

  if (!/^\d+$/.test(normalized)) {
    return 'Aadhaar must contain only digits';
  }

  if (normalized.length !== 12) {
    return 'Aadhaar must be exactly 12 digits';
  }

  if (/^(\d)\1{11}$/.test(normalized)) {
    return 'Invalid Aadhaar number';
  }

  if (normalized[0] === '0' || normalized[0] === '1') {
    return 'Aadhaar number cannot start with 0 or 1';
  }

  if (!validateAadhaarChecksum(normalized)) {
    return 'Invalid Aadhaar number. Checksum verification failed';
  }

  return null;
}

export function isValidAadhaar(aadhaar: string): boolean {
  return getAadhaarValidationError(aadhaar) === null;
}
