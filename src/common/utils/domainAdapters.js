export const customerFromApi = (item) => ({
  ...item,
  id: item.id,
  customerNumber: item.customerNumber,
  name: item.fullName,
  mobile: item.phone,
  dob: item.dateOfBirth,
  houseNumber: item.addressLine1,
  street: item.addressLine2 || '',
  area: '',
  pinCode: item.postalCode,
  aadhaar: item.aadhaarMasked || '',
  pan: item.panMasked || '',
  activeLoans: item.activeLoans ?? 0,
  outstanding: item.outstanding ?? 0,
  nextDue: item.nextDue ?? '-',
  loans: item.loans ?? [],
  payments: item.payments ?? [],
  notes: item.notes ?? [],
  smsHistory: item.smsHistory ?? [],
});

export const normalizeDateOnly = (value) => {
  const input = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const numeric = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (numeric) return `${numeric[3]}-${numeric[2].padStart(2, '0')}-${numeric[1].padStart(2, '0')}`;
  const named = input.match(/^(\d{1,2})[- ]([A-Za-z]{3,9})[- ](\d{4})$/);
  if (named) {
    const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
      .indexOf(named[2].slice(0, 3).toLowerCase()) + 1;
    if (month > 0) return `${named[3]}-${String(month).padStart(2, '0')}-${named[1].padStart(2, '0')}`;
  }
  throw new Error('Enter the date of birth in a valid date format.');
};

export const calculatePeriodicInterest = (principal, annualRate, frequency = 'Monthly') => {
  const amount = Number(principal);
  const rate = Number(annualRate);
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || amount <= 0 || rate < 0) return '';
  const periods = { Weekly: 52, Monthly: 12, Quarterly: 4 }[frequency] || 12;
  return Math.round(((amount * rate) / 100 / periods) * 100) / 100;
};

export const calculateNextDueDate = (startDate, frequency = 'Monthly') => {
  const match = String(startDate || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (frequency === 'Weekly') {
    const date = new Date(Date.UTC(year, month - 1, day + 7));
    return date.toISOString().slice(0, 10);
  }
  const monthsToAdd = frequency === 'Quarterly' ? 3 : 1;
  const targetMonth = month - 1 + monthsToAdd;
  const targetYear = year + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  return `${targetYear}-${String(normalizedMonth + 1).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
};

export const customerToApi = (form, includeStatus = false) => ({
  fullName: form.name.trim(),
  dateOfBirth: normalizeDateOnly(form.dob),
  gender: form.gender || null,
  phone: form.mobile.trim(),
  email: form.email.trim() || null,
  addressLine1: [form.houseNumber, form.street].filter(Boolean).join(', ') || form.area,
  addressLine2: form.area || null,
  city: form.city.trim(),
  state: form.state.trim(),
  postalCode: form.pinCode.trim(),
  ...(includeStatus ? { status: form.status || 'Active' } : { aadhaar: form.aadhaar.trim() || null, pan: form.pan.trim() || null }),
});

export const loanFromApi = (item, customer) => ({
  ...item,
  id: item.id,
  displayId: item.loanNumber,
  customer: customer?.fullName || customer?.name || item.customerName || item.customerId,
  principal: Number(item.principal || 0),
  rate: Number(item.interestRate ?? item.annualInterestRate ?? 0),
  interestRate: `${Number(item.interestRate ?? item.annualInterestRate ?? 0)}% ${String(item.interestRateBasis || 'PerAnnum').replace('Per', 'Per ')}`,
  interest: Number(item.interestOutstanding || 0),
  frequency: item.interestCollectionFrequency || item.repaymentFrequency || 'Monthly',
  duration: item.durationValue ? `${item.durationValue} ${item.durationUnit}` : `${item.tenureMonths} Months`,
  startDate: item.disbursementDate,
  outstanding: Number(item.principalOutstanding || 0) + Number(item.interestOutstanding || 0) + Number(item.feesOutstanding || 0),
  nextDue: item.nextDue || calculateNextDueDate(item.disbursementDate, item.repaymentFrequency || 'Monthly') || '-',
  type: item.repaymentFrequency || 'Term Loan',
  dateGiven: item.disbursementDate,
});

export const paymentFromApi = (item) => ({
  ...item,
  id: item.id,
  paymentId: item.paymentNumber,
  paymentDate: item.receivedAt,
  method: item.mode,
  status: String(item.status || 'Pending').toLowerCase(),
});
