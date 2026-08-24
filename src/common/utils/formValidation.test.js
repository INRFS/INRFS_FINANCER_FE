import { describe, expect, it } from 'vitest';
import { isValidAadhaar, isValidAdultDate, isValidIndianMobile, isValidIndianPin, isValidPan, validateCustomerForm } from './formValidation';

describe('form validation', () => {
  it('validates Indian contact and identity formats', () => {
    expect(isValidIndianMobile('+91 98765 43210')).toBe(true);
    expect(isValidIndianMobile('not-a-phone')).toBe(false);
    expect(isValidIndianPin('411001')).toBe(true);
    expect(isValidIndianPin('011001')).toBe(false);
    expect(isValidAadhaar('2345 6789 0123')).toBe(true);
    expect(isValidAadhaar('123456789012')).toBe(false);
    expect(isValidPan('abcde1234f')).toBe(true);
  });

  it('rejects invalid and underage dates', () => {
    const now = new Date(2026, 7, 24);
    expect(isValidAdultDate('2008-08-24', now)).toBe(true);
    expect(isValidAdultDate('2008-08-25', now)).toBe(false);
    expect(isValidAdultDate('2020-02-31', now)).toBe(false);
  });

  it('revalidates the complete customer payload before saving', () => {
    const valid = { name: 'Asha Rao', mobile: '9876543210', email: 'asha@example.com', dob: '1990-01-01', city: 'Pune', state: 'Maharashtra', pinCode: '411001', aadhaar: '234567890123', pan: 'ABCDE1234F' };
    expect(validateCustomerForm(valid)).toBe('');
    expect(validateCustomerForm({ ...valid, mobile: 'invalid' })).toMatch(/mobile/i);
    expect(validateCustomerForm({ ...valid, pinCode: '123' })).toMatch(/PIN/i);
    expect(validateCustomerForm({ ...valid, pan: 'bad' })).toMatch(/PAN/i);
  });
});
