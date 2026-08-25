export function calculateMonthlyInterest(principal, monthlyRate) {
  return (Number(principal) || 0) * (Number(monthlyRate) || 0) / 100;
}

export function calculateTotalInterest(principal, monthlyRate, durationUnit, durationValue) {
  const monthly = calculateMonthlyInterest(principal, monthlyRate);
  const count = Number(durationValue) || 0;
  if (durationUnit === 'Months') {
    return monthly * count;
  }
  if (durationUnit === 'Weeks') {
    return (monthly / 30) * 7 * count;
  }
  // Days
  return (monthly / 30) * count;
}

export function calculatePeriodInterest(principal, monthlyRate, frequency, totalInterest) {
  const monthly = calculateMonthlyInterest(principal, monthlyRate);
  const daily = monthly / 30;
  const weekly = daily * 7;

  let period = 0;
  if (frequency === 'Daily') {
    period = daily;
  } else if (frequency === 'Weekly') {
    period = weekly;
  } else if (frequency === 'Monthly') {
    period = monthly;
  } else {
    // AtMaturity
    period = totalInterest !== undefined ? totalInterest : monthly;
  }

  if (totalInterest > 0 && period > totalInterest) {
    return totalInterest;
  }
  return period;
}

export function interestForDays(principal, annualRate, days) {
  const amount = Number(principal) || 0;
  const rate = Number(annualRate) || 0;
  return Math.round((amount * rate / 100 * days / 365 + Number.EPSILON) * 100) / 100;
}

export function rateForDays(annualRate, days) {
  return (Number(annualRate) || 0) * days / 365;
}

export function monthlyPeriodDays(startDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || '')) return 30;
  const [year, month, day] = startDate.split('-').map(Number);
  const start = Date.UTC(year, month - 1, day);
  const nextMonth = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const end = Date.UTC(
    nextMonth.getUTCFullYear(),
    nextMonth.getUTCMonth(),
    Math.min(day, lastDay)
  );
  return Math.round((end - start) / 86_400_000);
}

export function formatInterestAmount(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

