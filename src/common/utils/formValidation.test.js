import { describe, expect, it } from 'vitest';
import {
  isValidAadhaar,
  isValidAdultDate,
  isValidIndianMobile,
  isValidIndianPin,
  isValidPan,
  isValidName,
  validateName,
  validateCustomerForm,
} from './formValidation';

describe('form validation', () => {
  /* ----------------------------------------------------------
     MOBILE
     ---------------------------------------------------------- */
  it('validates Indian mobile numbers', () => {
    expect(isValidIndianMobile('+91 98765 43210')).toBe(true);
    expect(isValidIndianMobile('9876543210')).toBe(true);
    expect(isValidIndianMobile('6000000000')).toBe(true);
    expect(isValidIndianMobile('not-a-phone')).toBe(false);
    expect(isValidIndianMobile('5999999999')).toBe(false); // starts with 5
    expect(isValidIndianMobile('12345')).toBe(false);
    expect(isValidIndianMobile('')).toBe(false);
  });

  /* ----------------------------------------------------------
     PINCODE
     ---------------------------------------------------------- */
  it('validates Indian PIN codes', () => {
    expect(isValidIndianPin('411001')).toBe(true);
    expect(isValidIndianPin('560001')).toBe(true);
    expect(isValidIndianPin('011001')).toBe(false); // starts with 0
    expect(isValidIndianPin('12345')).toBe(false);   // 5 digits
    expect(isValidIndianPin('1234567')).toBe(false); // 7 digits
    expect(isValidIndianPin('ABCDEF')).toBe(false);
  });

  /* ----------------------------------------------------------
     AADHAAR — Verhoeff checksum
     ---------------------------------------------------------- */
  it('validates Aadhaar with Verhoeff checksum', () => {
    // Known Aadhaar-passing Verhoeff numbers (from test vectors)
    // The digit string must produce checksum 0 after Verhoeff
    // We verify that the invalid ones are rejected
    expect(isValidAadhaar('123456789012')).toBe(false);  // starts with 1
    expect(isValidAadhaar('234567890121')).toBe(false);  // would need correct checksum
    // Optional (empty) passes
    expect(isValidAadhaar('')).toBe(true);               // optional field, empty ok
    expect(isValidAadhaar('', false)).toBe(true);        // explicitly optional
    expect(isValidAadhaar('', true)).toBe(false);        // explicitly required, empty fails
    // Wrong length
    expect(isValidAadhaar('23456789012')).toBe(false);   // 11 digits
    expect(isValidAadhaar('2345678901234')).toBe(false); // 13 digits
  });

  /* ----------------------------------------------------------
     PAN
     ---------------------------------------------------------- */
  it('validates PAN card numbers', () => {
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan('abcde1234f')).toBe(true);  // lowercase normalised
    expect(isValidPan('')).toBe(true);             // optional
    expect(isValidPan('', true)).toBe(false);      // required
    expect(isValidPan('ABCDE12345')).toBe(false);  // last char must be letter
    expect(isValidPan('12CDE1234F')).toBe(false);  // first chars must be letters
    expect(isValidPan('bad')).toBe(false);
  });

  /* ----------------------------------------------------------
     DATE OF BIRTH / AGE
     ---------------------------------------------------------- */
  it('rejects invalid and underage dates', () => {
    const now = new Date(2026, 7, 24); // 24 Aug 2026
    expect(isValidAdultDate('2008-08-24', now)).toBe(true);   // exactly 18
    expect(isValidAdultDate('2008-08-25', now)).toBe(false);  // 17 years 364 days
    expect(isValidAdultDate('2020-02-31', now)).toBe(false);  // impossible date
    expect(isValidAdultDate('2026-08-24', now)).toBe(false);  // today (not past)
    expect(isValidAdultDate('2027-01-01', now)).toBe(false);  // future
    expect(isValidAdultDate('', now)).toBe(false);
  });

  /* ----------------------------------------------------------
     NAME VALIDATION
     ---------------------------------------------------------- */
  it('validates person names', () => {
    // Valid names
    expect(isValidName('Ramesh Kumar')).toBe(true);
    expect(isValidName('Asha Rao')).toBe(true);
    expect(isValidName("O'Brien")).toBe(true);
    expect(isValidName('Mary-Jane')).toBe(true);
    expect(isValidName('Suresh')).toBe(true);

    // Invalid — numbers only
    expect(isValidName('12345')).toBe(false);
    expect(isValidName('987654')).toBe(false);
    expect(isValidName('123 John')).toBe(false); // contains digits

    // Invalid — special characters only
    expect(isValidName('@@@')).toBe(false);
    expect(isValidName('###')).toBe(false);

    // Invalid — empty / too short / whitespace
    expect(isValidName('')).toBe(false);
    expect(isValidName('  ')).toBe(false);
    expect(isValidName('A')).toBe(false);

    // Invalid — bad start/end
    expect(isValidName('-Ramesh')).toBe(false);
    expect(isValidName('Ramesh-')).toBe(false);
  });

  it('validateName returns correct error messages', () => {
    expect(validateName('', 'Full name')).toMatch(/required/i);
    expect(validateName('12345', 'Full name')).toMatch(/letter/i);
    expect(validateName('A', 'Full name')).toMatch(/at least 2/i);
    expect(validateName('Ramesh Kumar', 'Full name')).toBe('');
  });

  /* ----------------------------------------------------------
     CUSTOMER FORM — INTEGRATION
     ---------------------------------------------------------- */
  it('revalidates the complete customer payload before saving', () => {
    const valid = {
      name: 'Asha Rao',
      mobile: '9876543210',
      email: 'asha@example.com',
      dob: '1990-01-01',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411001',
      // Aadhaar and PAN are optional — leave empty for valid baseline
      aadhaar: '',
      pan: '',
    };
    expect(validateCustomerForm(valid)).toBe('');
    expect(validateCustomerForm({ ...valid, mobile: 'invalid' })).toMatch(/mobile/i);
    expect(validateCustomerForm({ ...valid, pinCode: '123' })).toMatch(/PIN/i);
    expect(validateCustomerForm({ ...valid, pan: 'bad' })).toMatch(/PAN/i);
    // Name validation
    expect(validateCustomerForm({ ...valid, name: '12345' })).toMatch(/letter/i);
    expect(validateCustomerForm({ ...valid, name: '' })).toMatch(/required/i);
    // City whitespace
    expect(validateCustomerForm({ ...valid, city: '   ' })).toMatch(/City/i);
  });
});
