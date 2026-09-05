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
  validateStreetName,
  validateGender,
  validateDateOfBirth,
  validateMobileNumber,
  validatePinCode,
  validateAadhaar,
  validatePan,
  checkCustomerDuplicates,
  validateCustomerField,
  validateCustomerStep,
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

    expect(validateMobileNumber('')).toBe('Mobile number is required.');
    expect(validateMobileNumber('12345')).toMatch(/valid 10-digit Indian mobile number/i);
    expect(validateMobileNumber('9876543210')).toBe('');
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

    expect(validatePinCode('')).toBe('PIN code is required.');
    expect(validatePinCode('011001')).toMatch(/PIN code must be exactly 6 digits/i);
    expect(validatePinCode('411001')).toBe('');
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

    expect(validateAadhaar('')).toBe('');
    expect(validateAadhaar('123456789012')).toMatch(/checksum check/i);
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

    expect(validatePan('')).toBe('');
    expect(validatePan('bad')).toMatch(/format ABCDE1234F/i);
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

    expect(validateDateOfBirth('')).toBe('Date of birth is required.');
    expect(validateDateOfBirth('2020-02-31')).toMatch(/not a valid calendar date/i);
    expect(validateDateOfBirth('2030-01-01')).toMatch(/cannot be in the future/i);
    expect(validateDateOfBirth('2020-01-01')).toMatch(/at least 18 years old/i);
    expect(validateDateOfBirth('1990-05-15')).toBe('');
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
     STREET NAME VALIDATION
     ---------------------------------------------------------- */
  it('accepts valid street names with alphabetic or numeric prefixes', () => {
    expect(validateStreetName('MG Road')).toBe('');
    expect(validateStreetName('Main Street')).toBe('');
    expect(validateStreetName('12 Main Street')).toBe('');
    expect(validateStreetName('1st Cross')).toBe('');
    expect(validateStreetName('123')).toMatch(/at least one letter/i);
    expect(validateStreetName('', { required: false })).toBe('');
    expect(validateStreetName('', { required: true })).toBe('Street name is required.');
  });

  /* ----------------------------------------------------------
     GENDER VALIDATION
     ---------------------------------------------------------- */
  it('validates gender selection', () => {
    expect(validateGender('Male')).toBe('');
    expect(validateGender('Female')).toBe('');
    expect(validateGender('Other')).toBe('');
    expect(validateGender('')).toBe('Please select gender.');
    expect(validateGender('Select')).toBe('Please select a valid gender.');
    expect(validateGender('Unknown')).toBe('Please select a valid gender.');
  });

  /* ----------------------------------------------------------
     DUPLICATE CHECKING
     ---------------------------------------------------------- */
  it('detects duplicate customer records', () => {
    const existing = [
      { id: 'c1', mobile: '9876543210', email: 'asha@example.com', aadhaar: '234567890123', pan: 'ABCDE1234F' },
      { id: 'c2', mobile: '9123456780', email: 'ramesh@example.com', aadhaar: '', pan: 'XYZAB5678C' },
    ];

    // Mobile duplicate
    const dupMobile = checkCustomerDuplicates({ mobile: '9876543210' }, existing);
    expect(dupMobile.mobileError).toBe('Mobile number already exists.');

    // Email duplicate
    const dupEmail = checkCustomerDuplicates({ email: 'asha@example.com' }, existing);
    expect(dupEmail.emailError).toBe('Email address already exists.');

    // Aadhaar duplicate
    const dupAadhaar = checkCustomerDuplicates({ aadhaar: '234567890123' }, existing);
    expect(dupAadhaar.aadhaarError).toBe('Aadhaar number already exists.');

    // PAN duplicate
    const dupPan = checkCustomerDuplicates({ pan: 'ABCDE1234F' }, existing);
    expect(dupPan.panError).toBe('PAN number already exists.');

    // Editing same customer ignores self
    const editSelf = checkCustomerDuplicates({ mobile: '9876543210', email: 'asha@example.com' }, existing, 'c1');
    expect(editSelf.mobileError).toBe('');
    expect(editSelf.emailError).toBe('');
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
    const validFile = { name: 'kyc.pdf', size: 100, type: 'application/pdf' };
    const valid = {
      name: 'Asha Rao',
      mobile: '9876543210',
      email: 'asha@example.com',
      dob: '1990-01-01',
      gender: 'Female',
      street: 'Main Road',
      city: 'Pune',
      state: 'Maharashtra',
      pinCode: '411001',
      aadhaar: '',
      pan: '',
      aadhaarDocument: validFile,
      panDocument: validFile,
      addressProof: validFile,
      photograph: { name: 'photo.jpg', size: 100, type: 'image/jpeg' },
    };
    expect(validateCustomerForm(valid)).toBe('');
    expect(validateCustomerForm(valid, { step: 1 })).toBe('');
    expect(validateCustomerForm(valid, { step: 2 })).toBe('');
    expect(validateCustomerForm(valid, { step: 3 })).toBe('');
    expect(validateCustomerForm(valid, { step: 4 })).toBe('');

    // Step 1 failures
    expect(validateCustomerForm({ ...valid, name: '' }, { step: 1 })).toMatch(/Full name is required/i);
    expect(validateCustomerForm({ ...valid, mobile: 'invalid' }, { step: 1 })).toMatch(/mobile/i);
    expect(validateCustomerForm({ ...valid, email: 'bad-email' }, { step: 1 })).toMatch(/email/i);
    expect(validateCustomerForm({ ...valid, dob: '2026-01-01' }, { step: 1 })).toMatch(/Date of birth|18 years old/i);
    expect(validateCustomerForm({ ...valid, gender: '' }, { step: 1 })).toMatch(/Please select gender/i);

    // Step 2 failures
    expect(validateCustomerForm({ ...valid, street: '12 MG Road' }, { step: 2 })).toBe('');
    expect(validateCustomerForm({ ...valid, city: '' }, { step: 2 })).toMatch(/City/i);
    expect(validateCustomerForm({ ...valid, state: '' }, { step: 2 })).toMatch(/State/i);
    expect(validateCustomerForm({ ...valid, pinCode: '123' }, { step: 2 })).toMatch(/PIN/i);

    // Step 3 failures
    expect(validateCustomerForm({ ...valid, aadhaar: '123456789012' }, { step: 3 })).toMatch(/Aadhaar/i);
    expect(validateCustomerForm({ ...valid, pan: 'bad' }, { step: 3 })).toMatch(/PAN/i);

    // Step 4 required KYC documents
    const step4Check = validateCustomerStep(4, { aadhaarDocument: null, panDocument: null });
    expect(step4Check.isValid).toBe(false);
    expect(step4Check.errors.aadhaarDocument).toMatch(/required/i);

    // validateCustomerField unit tests
    expect(validateCustomerField('name', '')).toMatch(/Full name is required/i);
    expect(validateCustomerField('mobile', '12345')).toMatch(/valid 10-digit Indian mobile/i);
    expect(validateCustomerField('gender', '')).toBe('Please select gender.');
    expect(validateCustomerField('street', '12 MG Road')).toBe('');
    expect(validateCustomerField('city', '')).toBe('City is required.');
    expect(validateCustomerField('state', '')).toBe('State is required.');
    expect(validateCustomerField('pinCode', '123')).toMatch(/PIN code must be exactly 6 digits/i);
  });
});

