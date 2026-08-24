import { describe, expect, it } from 'vitest';
import {
  isValidAadhaar,
  isValidAdultDate,
  isValidIndianMobile,
  isValidIndianPin,
  isValidPan,
  isValidName,
  isValidEmail,
  validateName,
  validateAmount,
  validateDate,
  validateFile,
  validateRequired,
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
     EMAIL
     ---------------------------------------------------------- */
  it('validates email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('john.doe+alias@sub.domain.org')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('test@.com')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });

  /* ----------------------------------------------------------
     PINCODE
     ---------------------------------------------------------- */
  it('validates Indian PIN codes', () => {
    expect(isValidIndianPin('411001')).toBe(true);
    expect(isValidIndianPin('560001')).toBe(true);
    expect(isValidIndianPin('011001')).toBe(false); // starts with 0
    expect(isValidIndianPin('12345')).toBe(false); // 5 digits
    expect(isValidIndianPin('1234567')).toBe(false); // 7 digits
    expect(isValidIndianPin('ABCDEF')).toBe(false);
  });

  /* ----------------------------------------------------------
     AADHAAR — Verhoeff checksum
     ---------------------------------------------------------- */
  it('validates Aadhaar with Verhoeff checksum', () => {
    expect(isValidAadhaar('123456789012')).toBe(false); // starts with 1
    expect(isValidAadhaar('234567890121')).toBe(false); // bad checksum
    expect(isValidAadhaar('')).toBe(true); // optional field, empty ok
    expect(isValidAadhaar('', false)).toBe(true); // explicitly optional
    expect(isValidAadhaar('', true)).toBe(false); // explicitly required, empty fails
    expect(isValidAadhaar('23456789012')).toBe(false); // 11 digits
    expect(isValidAadhaar('2345678901234')).toBe(false); // 13 digits
  });

  /* ----------------------------------------------------------
     PAN
     ---------------------------------------------------------- */
  it('validates PAN card numbers', () => {
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan('abcde1234f')).toBe(true); // lowercase normalised
    expect(isValidPan('')).toBe(true); // optional
    expect(isValidPan('', true)).toBe(false); // required
    expect(isValidPan('ABCDE12345')).toBe(false); // last char must be letter
    expect(isValidPan('12CDE1234F')).toBe(false); // first chars must be letters
    expect(isValidPan('bad')).toBe(false);
  });

  /* ----------------------------------------------------------
     DATE OF BIRTH / AGE
     ---------------------------------------------------------- */
  it('rejects invalid and underage dates', () => {
    const now = new Date(2026, 7, 24); // 24 Aug 2026
    expect(isValidAdultDate('2008-08-24', now)).toBe(true); // exactly 18
    expect(isValidAdultDate('2008-08-25', now)).toBe(false); // 17 years 364 days
    expect(isValidAdultDate('2020-02-31', now)).toBe(false); // impossible date
    expect(isValidAdultDate('2026-08-24', now)).toBe(false); // today (not past)
    expect(isValidAdultDate('2027-01-01', now)).toBe(false); // future
    expect(isValidAdultDate('', now)).toBe(false);
  });

  /* ----------------------------------------------------------
     NAME VALIDATION
     ---------------------------------------------------------- */
  it('validates person names', () => {
    expect(isValidName('Ramesh Kumar')).toBe(true);
    expect(isValidName('Asha Rao')).toBe(true);
    expect(isValidName("O'Brien")).toBe(true);
    expect(isValidName('Mary-Jane')).toBe(true);
    expect(isValidName('Suresh')).toBe(true);

    expect(isValidName('12345')).toBe(false);
    expect(isValidName('987654')).toBe(false);
    expect(isValidName('123 John')).toBe(false);

    expect(isValidName('@@@')).toBe(false);
    expect(isValidName('###')).toBe(false);

    expect(isValidName('')).toBe(false);
    expect(isValidName('  ')).toBe(false);
    expect(isValidName('A')).toBe(false);

    expect(isValidName('-Ramesh')).toBe(false);
    expect(isValidName('Ramesh-')).toBe(false);
  });

  it('validateName returns correct error messages', () => {
    expect(validateName('', 'Full name')).toMatch(/required/i);
    expect(validateName('12345', 'Full name')).toMatch(/letter/i);
    expect(validateName('A', 'Full name')).toMatch(/at least 2/i);
    expect(validateName('Ramesh Kumar', 'Full name')).toBe('');
    expect(validateName('-Ramesh', 'Full name')).toMatch(/start or end/i);
    expect(validateName('Ramesh@123', 'Full name')).toMatch(/invalid characters/i);
  });

  /* ----------------------------------------------------------
     AMOUNT VALIDATION
     ---------------------------------------------------------- */
  it('validates amounts with bounds and decimal precision', () => {
    expect(validateAmount('500')).toBe('');
    expect(validateAmount(1000.5)).toBe('');
    expect(validateAmount('')).toMatch(/required/i);
    expect(validateAmount('', { required: false })).toBe('');
    expect(validateAmount('0', { allowZero: false })).toMatch(/greater than zero/i);
    expect(validateAmount('0', { allowZero: true })).toBe('');
    expect(validateAmount('abc')).toMatch(/valid number/i);
    expect(validateAmount('-50')).toMatch(/cannot be negative|at least/i);
    expect(validateAmount('10', { min: 100 })).toMatch(/at least 100/i);
    expect(validateAmount('500000', { max: 10000 })).toMatch(/not exceed/i);
    expect(validateAmount('10.999')).toMatch(/more than 2 decimal places/i);
  });

  /* ----------------------------------------------------------
     DATE VALIDATION
     ---------------------------------------------------------- */
  it('validates date formats and constraints', () => {
    expect(validateDate('2026-08-24')).toBe('');
    expect(validateDate('')).toBe('');
    expect(validateDate('', { required: true })).toMatch(/required/i);
    expect(validateDate('24-08-2026')).toMatch(/valid date/i);
    expect(validateDate('2026-02-31')).toMatch(/not a valid calendar date/i);
    expect(validateDate('2020-01-01', { allowPast: false })).toMatch(/cannot be in the past/i);
    expect(validateDate('2099-01-01', { allowFuture: false })).toMatch(/cannot be in the future/i);
    expect(validateDate('2026-08-01', { minDate: '2026-08-10' })).toMatch(/on or after/i);
    expect(validateDate('2026-08-25', { maxDate: '2026-08-20' })).toMatch(/on or before/i);
  });

  /* ----------------------------------------------------------
     FILE UPLOAD VALIDATION
     ---------------------------------------------------------- */
  it('validates file uploads by extension, size, and mime', () => {
    const validFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
    expect(validateFile(validFile)).toBe('');
    expect(validateFile(null, { required: false })).toBe('');
    expect(validateFile(null, { required: true })).toMatch(/select a file/i);

    const badExtFile = new File(['content'], 'script.exe', { type: 'application/octet-stream' });
    expect(validateFile(badExtFile)).toMatch(/Only/i);

    const emptyFile = new File([], 'empty.png', { type: 'image/png' });
    expect(validateFile(emptyFile)).toMatch(/empty/i);

    const largeFile = new File(['a'.repeat(200)], 'large.pdf', { type: 'application/pdf' });
    expect(validateFile(largeFile, { maxBytes: 100 })).toMatch(/File size must not exceed/i);

    const spoofedFile = new File(['content'], 'spoof.pdf', { type: 'text/html' });
    expect(validateFile(spoofedFile)).toMatch(/Unsupported file type/i);
  });

  /* ----------------------------------------------------------
     GENERIC REQUIRED VALIDATION
     ---------------------------------------------------------- */
  it('validates required fields', () => {
    expect(validateRequired('Value', 'City')).toBe('');
    expect(validateRequired('', 'City')).toBe('City is required.');
    expect(validateRequired('   ', 'City')).toBe('City is required.');
  });

  /* ----------------------------------------------------------
     CUSTOMER FORM — INTEGRATION & STEPS
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
      aadhaar: '',
      pan: '',
    };
    expect(validateCustomerForm(valid)).toBe('');
    expect(validateCustomerForm(valid, { step: 1 })).toBe('');
    expect(validateCustomerForm(valid, { step: 2 })).toBe('');
    expect(validateCustomerForm(valid, { step: 3 })).toBe('');

    expect(validateCustomerForm({ ...valid, mobile: 'invalid' }, { step: 1 })).toMatch(/mobile/i);
    expect(validateCustomerForm({ ...valid, email: 'bad-email' }, { step: 1 })).toMatch(/email/i);
    expect(validateCustomerForm({ ...valid, dob: '2026-01-01' }, { step: 1 })).toMatch(/Date of birth/i);

    expect(validateCustomerForm({ ...valid, city: '' }, { step: 2 })).toMatch(/City/i);
    expect(validateCustomerForm({ ...valid, state: '' }, { step: 2 })).toMatch(/State/i);
    expect(validateCustomerForm({ ...valid, pinCode: '123' }, { step: 2 })).toMatch(/PIN/i);

    expect(validateCustomerForm({ ...valid, aadhaar: '123456789012' }, { step: 3 })).toMatch(/Aadhaar/i);
    expect(validateCustomerForm({ ...valid, pan: 'bad' }, { step: 3 })).toMatch(/PAN/i);
  });
});
