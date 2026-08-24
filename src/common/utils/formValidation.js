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

const _VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

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

/* ----------------------------------------------------------
   EMAIL
   ---------------------------------------------------------- */

/**
 * Returns true if value is a syntactically valid email address.
 */
export const isValidEmail = (value) => {
  const v = trimmed(value);
  if (!v) return false;
  // RFC-compliant enough: local@domain.tld, no consecutive dots, reasonable length
  return (
    v.length <= 320 &&
    /^[^\s@"(),:;<>[\]\\]+@[^\s@"(),:;<>[\]\\]+\.[a-zA-Z]{2,}$/.test(v)
  );
};

/* ----------------------------------------------------------
   PINCODE
   ---------------------------------------------------------- */

/**
 * Returns true if value is a valid Indian 6-digit PIN code (first digit 1–9).
 */
export const isValidIndianPin = (value) =>
  /^[1-9]\d{5}$/.test(trimmed(value));

/* ----------------------------------------------------------
   AADHAAR
   ---------------------------------------------------------- */

/**
 * Returns true if value is a valid Aadhaar number.
 * - Exactly 12 digits (spaces are normalized out)
 * - First digit must be 2–9
 * - Must pass Verhoeff checksum
 *
 * When `required` is false (default) an empty value returns true
 * (field is optional).
 */
export const isValidAadhaar = (value, required = false) => {
  const raw = trimmed(value);
  if (!raw) return !required;
  const digits = digitsOnly(raw);
  if (digits.length !== 12) return false;
  if (!/^[2-9]/.test(digits)) return false;
  return _verhoeffCheck(digits);
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

/* ----------------------------------------------------------
   NAME VALIDATION
   ---------------------------------------------------------- */

/**
 * Returns true if the value is a plausible person name.
 *
 * Allows: letters (any script), spaces, hyphens, apostrophes.
 * Rejects:
 *   - Empty / whitespace-only
 *   - Entirely numeric (e.g. "12345")
 *   - Entirely special characters (e.g. "@@@", "###")
 *   - Values shorter than 2 characters after trimming
 *   - Values longer than 100 characters
 *   - Values starting/ending with a space, hyphen, or apostrophe
 */
export const isValidName = (value) => {
  const v = trimmed(value);
  if (!v || v.length < 2 || v.length > 100) return false;
  // Must contain at least one letter
  if (!/[A-Za-z\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0C80-\u0CFF]/.test(v)) return false;
  // Must not start or end with space, hyphen, or apostrophe
  if (/^[\s\-']|[\s\-']$/.test(v)) return false;
  // Allow only letters, spaces, hyphens, apostrophes (no digits, no other special chars)
  if (/[^A-Za-z\s\-'\u0900-\u097F\u0980-\u09FF\u0C00-\u0C7F\u0C80-\u0CFF]/.test(v)) return false;
  return true;
};

/**
 * Returns an error string for a name field, or '' if valid.
 * @param {string} value
 * @param {string} label  – e.g. "Full name", "Customer name"
 */
export const validateName = (value, label = 'Name') => {
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
   AMOUNT / NUMERIC
   ---------------------------------------------------------- */

/**
 * Returns an error string for a financial amount field, or '' if valid.
 * @param {*} value
 * @param {{ label?: string, min?: number, max?: number, allowZero?: boolean, required?: boolean }} options
 */
export const validateAmount = (value, options = {}) => {
  const { label = 'Amount', min = 0, max = 1e12, allowZero = false, required = true } = options;
  const raw = String(value ?? '').trim();
  if (!raw) return required ? `${label} is required.` : '';
  const num = Number(raw);
  if (!Number.isFinite(num)) return `${label} must be a valid number.`;
  if (!allowZero && num === 0) return `${label} must be greater than zero.`;
  if (num < min) return `${label} must be at least ${min}.`;
  if (num > max) return `${label} must not exceed ${max.toLocaleString('en-IN')}.`;
  // Prevent more than 2 decimal places for financial amounts
  if (/\.\d{3,}/.test(raw)) return `${label} must not have more than 2 decimal places.`;
  if (num < 0) return `${label} cannot be negative.`;
  return '';
};

/* ----------------------------------------------------------
   DATE
   ---------------------------------------------------------- */

/**
 * Returns an error string for a date field, or '' if valid.
 * @param {string} value – ISO date string YYYY-MM-DD
 * @param {{ label?: string, allowFuture?: boolean, allowPast?: boolean, required?: boolean, minDate?: string, maxDate?: string }} options
 */
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

/* ----------------------------------------------------------
   DATE OF BIRTH / AGE
   ---------------------------------------------------------- */

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
  // Must not be in the future
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (date >= todayMidnight) return false;
  // Must be at least 18 years old
  const cutoff = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  return date <= cutoff;
};

/* ----------------------------------------------------------
   FILE UPLOAD
   ---------------------------------------------------------- */

const ALLOWED_DOCUMENT_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];
const MAX_DOCUMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Returns an error string for a file upload, or '' if valid.
 * @param {File|null} file
 * @param {{ required?: boolean, maxBytes?: number, allowedExtensions?: string[] }} options
 */
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

  // Basic MIME check (guards against renamed files)
  if (file.type && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
    return 'Unsupported file type. Please upload a JPG, PNG, or PDF document.';
  }

  return '';
};

/* ----------------------------------------------------------
   REQUIRED (generic)
   ---------------------------------------------------------- */

/**
 * Returns an error string if value is empty/whitespace, or '' if valid.
 */
export const validateRequired = (value, label = 'This field') => {
  if (!trimmed(value)) return `${label} is required.`;
  return '';
};

/* ----------------------------------------------------------
   CUSTOMER FORM — MULTI-STEP WIZARD
   ---------------------------------------------------------- */

/**
 * Validates the customer creation/edit form.
 *
 * @param {object} form
 * @param {{ step?: number, validateIdentity?: boolean }} options
 * @returns {string} error message, or '' if valid
 */
export const validateCustomerForm = (form, { step, validateIdentity = true } = {}) => {
  const shouldCheck = (target) => step == null || step === target;

  if (shouldCheck(1)) {
    // Full name — must be a plausible person name (not numbers-only, etc.)
    const nameError = validateName(trimmed(form.name), 'Full name');
    if (nameError) return nameError;

    // Mobile — required + format
    if (!isValidIndianMobile(form.mobile))
      return 'Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';

    // Email — optional but must be valid if provided
    if (form.email && !isValidEmail(form.email))
      return 'Enter a valid email address (e.g. name@example.com).';

    // DOB — required, must be valid calendar date, must be ≥ 18 years old
    if (!isValidAdultDate(form.dob))
      return 'Date of birth is required. Customer must be at least 18 years old.';
  }

  if (shouldCheck(2)) {
    // City and state — required, must not be whitespace-only
    if (!trimmed(form.city)) return 'City is required.';
    if (!trimmed(form.state)) return 'State is required.';
    if (!isValidIndianPin(form.pinCode))
      return 'PIN code must be exactly 6 digits and cannot start with 0 (e.g. 400001).';
  }

  if (validateIdentity && shouldCheck(3)) {
    // Aadhaar — optional but must pass full Verhoeff check if provided
    if (form.aadhaar && !isValidAadhaar(form.aadhaar)) {
      return 'Aadhaar number must be exactly 12 digits, start with 2–9, and pass the checksum check.';
    }

    // PAN — optional but must match official format if provided
    if (form.pan && !isValidPan(form.pan)) {
      return 'PAN must follow the format ABCDE1234F (5 letters, 4 digits, 1 letter).';
    }
  }

  return '';
};
