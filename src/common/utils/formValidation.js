const digitsOnly = (value) => String(value || '').replace(/\D/g, '');

export const normalizeIndianMobile = (value) => {
  const digits = digitsOnly(value);
  return digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
};

export const isValidIndianMobile = (value) => /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));
export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
export const isValidIndianPin = (value) => /^[1-9]\d{5}$/.test(String(value || '').trim());
export const isValidAadhaar = (value) => !String(value || '').trim() || /^[2-9]\d{11}$/.test(digitsOnly(value));
export const isValidPan = (value) => !String(value || '').trim() || /^[A-Z]{5}\d{4}[A-Z]$/.test(String(value).trim().toUpperCase());

export const isValidAdultDate = (value, now = new Date()) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return false;
  const cutoff = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  return date <= cutoff;
};

export const validateCustomerForm = (form, { step, validateIdentity = true } = {}) => {
  const shouldCheck = (target) => step == null || step === target;

  if (shouldCheck(1)) {
    if (!String(form.name || '').trim()) return 'Full name is required.';
    if (!isValidIndianMobile(form.mobile)) return 'Enter a valid 10-digit Indian mobile number.';
    if (form.email && !isValidEmail(form.email)) return 'Enter a valid email address.';
    if (!isValidAdultDate(form.dob)) return 'Customer must have a valid date of birth and be at least 18 years old.';
  }
  if (shouldCheck(2)) {
    if (!String(form.city || '').trim()) return 'City is required.';
    if (!String(form.state || '').trim()) return 'State is required.';
    if (!isValidIndianPin(form.pinCode)) return 'Enter a valid 6-digit Indian PIN code.';
  }
  if (validateIdentity && shouldCheck(3)) {
    if (!isValidAadhaar(form.aadhaar)) return 'Aadhaar must contain 12 digits and cannot begin with 0 or 1.';
    if (!isValidPan(form.pan)) return 'PAN must use the format ABCDE1234F.';
  }
  return '';
};
