import { describe, expect, it } from 'vitest';
import { formatInterestAmount, interestForDays, monthlyPeriodDays, rateForDays } from './loanInterest';

describe('loan interest preview', () => {
  it('uses the backend annual-rate day-count formula', () => {
    expect(interestForDays(1000, 360, 1)).toBe(9.86);
    expect(rateForDays(360, 1)).toBeCloseTo(360 / 365);
  });

  it('shows paise instead of rounding the preview to a whole rupee', () => {
    expect(formatInterestAmount(9.86)).toBe('₹9.86');
  });

  it('uses the actual first monthly period length', () => {
    expect(monthlyPeriodDays('2026-08-19')).toBe(31);
    expect(monthlyPeriodDays('2026-01-31')).toBe(28);
  });
});
