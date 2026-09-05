/* ============================================================
   INRFS – Shared Form Validation Utilities
   All validators return a string error message or '' for valid.
   ============================================================ */

/* ----------------------------------------------------------
   INTERNAL HELPERS
   ---------------------------------------------------------- */

const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

const trimmed = (value) => String(value ?? '').trim();

/* ----------------------------------------------------------
   VERHOEFF ALGORITHM — official Aadhaar checksum
   ---------------------------------------------------------- */

const _VERHOEFF_D = [
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

const _VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

/**
 * Returns true if the numeric string passes the Verhoeff checksum.
 * Uses the official UIDAI Verhoeff algorithm.
 */
function _verhoeffCheck(numStr) {
  let c = 0;
  const reversed = numStr.split('').reverse();
  for (let i = 0; i < reversed.length; i++) {
    c = _VERHOEFF_D[c][_VERHOEFF_P[i % 8][Number(reversed[i])]];
  }
  return c === 0;
}

/* ----------------------------------------------------------
   MOBILE NUMBER
   ---------------------------------------------------------- */

export const normalizeIndianMobile = (value) => {
  const digits = digitsOnly(value);
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
};

/**
 * Returns true if value is a valid Indian mobile number (10 digits, starts 6-9).
 */
export const isValidIndianMobile = (value) =>
  /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));

/**
 * Validates mobile number and returns error string or ''.
 */
export const validateMobileNumber = (value, label = 'Mobile number') => {
  const raw = trimmed(value);
  if (!raw) return `${label} is required.`;
  if (!isValidIndianMobile(raw)) {
    return 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
  }
  return '';
};

/* ----------------------------------------------------------
   EMAIL
   ---------------------------------------------------------- */

/**
 * Returns true if value is a syntactically valid email address.
 */
export const isValidEmail = (value) => {
  const v = trimmed(value);
  if (!v) return false;
  return (
    v.length <= 320 &&
    /^[^\s@"(),:;<>[\]\\]+@[^\s@"(),:;<>[\]\\]+\.[a-zA-Z]{2,}$/.test(v)
  );
};

export const validateEmail = (value, options = {}) => {
  const { required = false, label = 'Email address' } = options;
  const v = trimmed(value);
  if (!v) return required ? `${label} is required.` : '';
  if (!isValidEmail(v)) {
    return 'Enter a valid email address (e.g. name@example.com).';
  }
  return '';
};

/* ----------------------------------------------------------
   PINCODE
   ---------------------------------------------------------- */

/**
 * Returns true if value is a valid Indian 6-digit PIN code (first digit 1–9).
 */
export const isValidIndianPin = (value) =>
  /^[1-9]\d{5}$/.test(trimmed(value));

export const validatePinCode = (value, label = 'PIN code') => {
  const v = trimmed(value);
  if (!v) return `${label} is required.`;
  if (!isValidIndianPin(v)) {
    return `${label} must be exactly 6 digits and cannot start with 0 (e.g. 400001).`;
  }
  return '';
};

/* ----------------------------------------------------------
   AADHAAR
   ---------------------------------------------------------- */

/**
 * Returns true if value is a valid Aadhaar number.
 * - Exactly 12 digits (spaces are normalized out)
 * - First digit must be 2–9
 * - Must pass Verhoeff checksum
 *
 * When `required` is false (default) an empty value returns true.
 */
export const isValidAadhaar = (value, required = false) => {
  const raw = trimmed(value);
  if (!raw) return !required;
  const digits = digitsOnly(raw);
  if (digits.length !== 12) return false;
  if (!/^[2-9]/.test(digits)) return false;
  return _verhoeffCheck(digits);
};

export const validateAadhaar = (value, required = false) => {
  const raw = trimmed(value);
  if (!raw) return required ? 'Aadhaar number is required.' : '';
  if (!isValidAadhaar(raw, true)) {
    return 'Aadhaar number must be exactly 12 digits, start with 2–9, and pass the checksum check.';
  }
  return '';
};

/* ----------------------------------------------------------
   PAN
   ---------------------------------------------------------- */

/**
 * Returns true if value matches the official Indian PAN structure.
 * Format: AAAAA9999A  (5 alpha, 4 digits, 1 alpha) — always uppercase.
 *
 * When `required` is false (default) an empty value returns true.
 */
export const isValidPan = (value, required = false) => {
  const raw = trimmed(value);
  if (!raw) return !required;
  return /^[A-Z]{5}\d{4}[A-Z]$/.test(raw.toUpperCase());
};

export const validatePan = (value, required = false) => {
  const raw = trimmed(value);
  if (!raw) return required ? 'PAN number is required.' : '';
  if (!isValidPan(raw, true)) {
    return 'PAN must follow the format ABCDE1234F (5 letters, 4 digits, 1 letter).';
  }
  return '';
};

/* ----------------------------------------------------------
   NAME VALIDATION
   ---------------------------------------------------------- */

/**
 * Returns true if the value is a plausible person name.
 */
export const isValidName = (value) => {
  const v = trimmed(value);
  if (!v || v.length < 2 || v.length > 100) return false;
  if (!/[A-Za-z\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0C80-\u0CFF]/.test(v)) return false;
  if (/^[\s\-']|[\s\-']$/.test(v)) return false;
  if (/[^A-Za-z\s\-'\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0C80-\u0CFF]/.test(v)) return false;
  return true;
};

/**
 * Returns an error string for a name field, or '' if valid.
 */
export const validateName = (value, label = 'Full name') => {
  const v = trimmed(value);
  if (!v) return `${label} is required.`;
  if (v.length < 2) return `${label} must be at least 2 characters.`;
  if (v.length > 100) return `${label} must not exceed 100 characters.`;
  if (!/[A-Za-z\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0C80-\u0CFF]/.test(v))
    return `${label} must contain at least one letter. Numbers and symbols alone are not valid.`;
  if (/^[\s\-']|[\s\-']$/.test(v))
    return `${label} must not start or end with a space, hyphen, or apostrophe.`;
  if (/[^A-Za-z\s\-'\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0C80-\u0CFF]/.test(v))
    return `${label} contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed.`;
  return '';
};

/* ----------------------------------------------------------
   STREET NAME VALIDATION
   Numeric prefixes are valid in names such as "12th Street".
   ---------------------------------------------------------- */

export const validateStreetName = (value, options = {}) => {
  const { required = false, label = 'Street name' } = options;
  const v = trimmed(value);
  if (!v) return required ? `${label} is required.` : '';
  if (!/[A-Za-z\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0C80-\u0CFF]/.test(v))
    return `${label} must contain at least one letter.`;
  return '';
};

/* ----------------------------------------------------------
   GENDER VALIDATION
   ---------------------------------------------------------- */

export const VALID_GENDERS = ['Male', 'Female', 'Other'];

export const validateGender = (value) => {
  const v = trimmed(value);
  if (!v) return 'Please select gender.';
  if (!VALID_GENDERS.includes(v)) return 'Please select a valid gender.';
  return '';
};

/* ----------------------------------------------------------
   AMOUNT / NUMERIC
   ---------------------------------------------------------- */

export const validateAmount = (value, options = {}) => {
  const { label = 'Amount', min = 0, max = 1e12, allowZero = false, required = true } = options;
  const raw = String(value ?? '').trim();
  if (!raw) return required ? `${label} is required.` : '';
  const num = Number(raw);
  if (!Number.isFinite(num)) return `${label} must be a valid number.`;
  if (!allowZero && num === 0) return `${label} must be greater than zero.`;
  if (num < min) return `${label} must be at least ${min}.`;
  if (num > max) return `${label} must not exceed ${max.toLocaleString('en-IN')}.`;
  if (/\.\d{3,}/.test(raw)) return `${label} must not have more than 2 decimal places.`;
  if (num < 0) return `${label} cannot be negative.`;
  return '';
};

/* ----------------------------------------------------------
   DATE & DATE OF BIRTH
   ---------------------------------------------------------- */

export const validateDate = (value, options = {}) => {
  const { label = 'Date', allowFuture = true, allowPast = true, required = false, minDate, maxDate } = options;
  const v = trimmed(value);
  if (!v) return required ? `${label} is required.` : '';
  const match = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return `${label} must be a valid date.`;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText), month = Number(monthText), day = Number(dayText);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) return `${label} is not a valid calendar date.`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (!allowFuture && parsed > today) return `${label} cannot be in the future.`;
  if (!allowPast && parsed < today) return `${label} cannot be in the past.`;
  if (minDate && v < minDate) return `${label} must be on or after ${minDate}.`;
  if (maxDate && v > maxDate) return `${label} must be on or before ${maxDate}.`;
  return '';
};

export const isValidAdultDate = (value, now = new Date()) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) return false;
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date >= todayMidnight) return false;
  const cutoff = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  return date <= cutoff;
};

export const validateDateOfBirth = (value) => {
  const v = trimmed(value);
  if (!v) return 'Date of birth is required.';
  const dateErr = validateDate(v, { label: 'Date of birth', allowFuture: false, required: true });
  if (dateErr) return dateErr;
  if (!isValidAdultDate(v)) {
    return 'Customer must be at least 18 years old.';
  }
  return '';
};

/* ----------------------------------------------------------
   FILE UPLOAD
   ---------------------------------------------------------- */

const ALLOWED_DOCUMENT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const validateFile = (file, options = {}) => {
  const {
    required = false,
    maxBytes = MAX_DOCUMENT_SIZE_BYTES,
    allowedExtensions = ALLOWED_DOCUMENT_EXTENSIONS,
  } = options;

  if (!file) return required ? 'Please select a file.' : '';

  const name = (file.name || '').toLowerCase();
  const ext = name.slice(name.lastIndexOf('.'));
  if (!allowedExtensions.includes(ext)) {
    return `Only ${allowedExtensions.join(', ')} files are accepted.`;
  }

  if (file.size === 0) return 'The selected file appears to be empty.';

  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    return `File size must not exceed ${mb} MB.`;
  }

  if (file.type && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
    return 'Unsupported file type. Please upload a JPG, PNG, or PDF document.';
  }

  return '';
};

/* ----------------------------------------------------------
   REQUIRED (generic)
   ---------------------------------------------------------- */

export const validateRequired = (value, label = 'This field') => {
  if (!trimmed(value)) return `${label} is required.`;
  return '';
};

/* ----------------------------------------------------------
   DUPLICATE CUSTOMER CHECK
   ---------------------------------------------------------- */

/**
 * Checks if customer's mobile, email, aadhaar, or pan already exist among existing records.
 * @param {object} form
 * @param {Array} existingCustomers
 * @param {string|null} currentCustomerId (to exclude when editing)
 * @returns {{ mobileError: string, emailError: string, aadhaarError: string, panError: string, duplicateError: string }}
 */
export const checkCustomerDuplicates = (form = {}, existingCustomers = [], currentCustomerId = null) => {
  const results = {
    mobileError: '',
    emailError: '',
    aadhaarError: '',
    panError: '',
    duplicateError: '',
  };

  if (!Array.isArray(existingCustomers) || existingCustomers.length === 0) {
    return results;
  }

  const formMobile = normalizeIndianMobile(form.mobile);
  const formEmail = trimmed(form.email).toLowerCase();
  const formAadhaar = digitsOnly(form.aadhaar);
  const formPan = trimmed(form.pan).toUpperCase();

  for (const cust of existingCustomers) {
    if (currentCustomerId && (cust.id === currentCustomerId || cust._id === currentCustomerId)) {
      continue;
    }

    // Check Mobile
    if (formMobile && isValidIndianMobile(formMobile)) {
      const custMobile = normalizeIndianMobile(cust.mobile || cust.phone);
      if (custMobile === formMobile) {
        results.mobileError = 'Mobile number already exists.';
        if (!results.duplicateError) results.duplicateError = results.mobileError;
      }
    }

    // Check Email
    if (formEmail && isValidEmail(formEmail)) {
      const custEmail = trimmed(cust.email).toLowerCase();
      if (custEmail && custEmail === formEmail) {
        results.emailError = 'Email address already exists.';
        if (!results.duplicateError) results.duplicateError = results.emailError;
      }
    }

    // Check Aadhaar
    if (formAadhaar && formAadhaar.length === 12) {
      const custAadhaar = digitsOnly(cust.aadhaar || cust.aadhaarMasked);
      if (custAadhaar === formAadhaar) {
        results.aadhaarError = 'Aadhaar number already exists.';
        if (!results.duplicateError) results.duplicateError = results.aadhaarError;
      }
    }

    // Check PAN
    if (formPan && formPan.length === 10) {
      const custPan = trimmed(cust.pan || cust.panMasked).toUpperCase();
      if (custPan === formPan) {
        results.panError = 'PAN number already exists.';
        if (!results.duplicateError) results.duplicateError = results.panError;
      }
    }
  }

  return results;
};

/* ----------------------------------------------------------
   FIELD-LEVEL CUSTOMER VALIDATOR
   ---------------------------------------------------------- */

export const validateCustomerField = (field, value, form = {}, existingCustomers = [], currentCustomerId = null) => {
  switch (field) {
    case 'name':
      return validateName(value, 'Full name');

    case 'mobile': {
      const mobileErr = validateMobileNumber(value);
      if (mobileErr) return mobileErr;
      const dup = checkCustomerDuplicates({ ...form, mobile: value }, existingCustomers, currentCustomerId);
      return dup.mobileError || '';
    }

    case 'email': {
      const emailErr = validateEmail(value, { required: false });
      if (emailErr) return emailErr;
      if (trimmed(value)) {
        const dup = checkCustomerDuplicates({ ...form, email: value }, existingCustomers, currentCustomerId);
        return dup.emailError || '';
      }
      return '';
    }

    case 'dob':
      return validateDateOfBirth(value);

    case 'gender':
      return validateGender(value);

    case 'street':
      return validateStreetName(value, { required: false });

    case 'city':
      return validateRequired(value, 'City');

    case 'state':
      return validateRequired(value, 'State');

    case 'pinCode':
      return validatePinCode(value);

    case 'aadhaar': {
      const aadhaarErr = validateAadhaar(value, false);
      if (aadhaarErr) return aadhaarErr;
      if (trimmed(value)) {
        const dup = checkCustomerDuplicates({ ...form, aadhaar: value }, existingCustomers, currentCustomerId);
        return dup.aadhaarError || '';
      }
      return '';
    }

    case 'pan': {
      const panErr = validatePan(value, false);
      if (panErr) return panErr;
      if (trimmed(value)) {
        const dup = checkCustomerDuplicates({ ...form, pan: value }, existingCustomers, currentCustomerId);
        return dup.panError || '';
      }
      return '';
    }

    default:
      return '';
  }
};

/* ----------------------------------------------------------
   CUSTOMER FORM — MULTI-STEP WIZARD
   ---------------------------------------------------------- */

/**
 * Validates specific step and returns all field errors and whether valid.
 */
export const validateCustomerStep = (step, form = {}, existingCustomers = [], currentCustomerId = null) => {
  const errors = {};

  if (step === 1) {
    const nameErr = validateCustomerField('name', form.name, form, existingCustomers, currentCustomerId);
    if (nameErr) errors.name = nameErr;

    const mobileErr = validateCustomerField('mobile', form.mobile, form, existingCustomers, currentCustomerId);
    if (mobileErr) errors.mobile = mobileErr;

    const emailErr = validateCustomerField('email', form.email, form, existingCustomers, currentCustomerId);
    if (emailErr) errors.email = emailErr;

    const dobErr = validateCustomerField('dob', form.dob, form, existingCustomers, currentCustomerId);
    if (dobErr) errors.dob = dobErr;

    const genderErr = validateCustomerField('gender', form.gender, form, existingCustomers, currentCustomerId);
    if (genderErr) errors.gender = genderErr;
  }

  if (step === 2) {
    const streetErr = validateCustomerField('street', form.street, form, existingCustomers, currentCustomerId);
    if (streetErr) errors.street = streetErr;

    const cityErr = validateCustomerField('city', form.city, form, existingCustomers, currentCustomerId);
    if (cityErr) errors.city = cityErr;

    const stateErr = validateCustomerField('state', form.state, form, existingCustomers, currentCustomerId);
    if (stateErr) errors.state = stateErr;

    const pinErr = validateCustomerField('pinCode', form.pinCode, form, existingCustomers, currentCustomerId);
    if (pinErr) errors.pinCode = pinErr;
  }

  if (step === 3) {
    const aadhaarErr = validateCustomerField('aadhaar', form.aadhaar, form, existingCustomers, currentCustomerId);
    if (aadhaarErr) errors.aadhaar = aadhaarErr;

    const panErr = validateCustomerField('pan', form.pan, form, existingCustomers, currentCustomerId);
    if (panErr) errors.pan = panErr;
  }

  if (step === 4) {
    const requiredFiles = [
      ['aadhaarDocument', 'Aadhaar document'],
      ['panDocument', 'PAN document'],
      ['addressProof', 'Address proof'],
      ['photograph', 'Photograph'],
    ];
    for (const [field, label] of requiredFiles) {
      if (!form[field]) errors[field] = `${label} is required.`;
    }
    // Other documents remain optional; validate every attached file.
    const fileFields = ['aadhaarDocument', 'panDocument', 'addressProof', 'photograph', 'otherDocuments'];
    for (const ff of fileFields) {
      if (form[ff]) {
        const fileErr = validateFile(form[ff]);
        if (fileErr) errors[ff] = fileErr;
      }
    }
  }

  const firstError = Object.values(errors).find(Boolean) || '';
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstError,
  };
};

/**
 * Validates the customer creation/edit form.
 *
 * @param {object} form
 * @param {{ step?: number, validateIdentity?: boolean, existingCustomers?: Array, currentCustomerId?: string }} options
 * @returns {string} error message, or '' if valid
 */
export const validateCustomerForm = (form, { step, validateIdentity = true, existingCustomers = [], currentCustomerId = null } = {}) => {
  const shouldCheck = (target) => step == null || step === target;

  if (shouldCheck(1)) {
    const step1 = validateCustomerStep(1, form, existingCustomers, currentCustomerId);
    if (!step1.isValid) return step1.firstError;
  }

  if (shouldCheck(2)) {
    const step2 = validateCustomerStep(2, form, existingCustomers, currentCustomerId);
    if (!step2.isValid) return step2.firstError;
  }

  if (validateIdentity && shouldCheck(3)) {
    const step3 = validateCustomerStep(3, form, existingCustomers, currentCustomerId);
    if (!step3.isValid) return step3.firstError;
  }

  if (shouldCheck(4)) {
    const step4 = validateCustomerStep(4, form, existingCustomers, currentCustomerId);
    if (!step4.isValid) return step4.firstError;
  }

  return '';
};
