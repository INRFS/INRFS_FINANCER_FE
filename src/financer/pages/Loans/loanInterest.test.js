import { describe, expect, it } from 'vitest';
import {
  calculateMonthlyInterest,
  calculatePeriodInterest,
  calculateTotalInterest,
  formatInterestAmount,
  interestForDays,
  monthlyPeriodDays,
  rateForDays
} from './loanInterest';

describe('loan interest preview', () => {
  it('calculates monthly interest accurately for 10,000 at 18%', () => {
    // Principal = ₹10,000, Monthly Rate = 18% -> Monthly Interest = ₹1,800
    expect(calculateMonthlyInterest(10000, 18)).toBe(1800);
  });

  it('calculates total interest based on duration unit and count', () => {
    // 1 Month
    expect(calculateTotalInterest(10000, 18, 'Months', 1)).toBe(1800);
    // 3 Months
    expect(calculateTotalInterest(10000, 18, 'Months', 3)).toBe(5400);
    // 4 Weeks
    expect(calculateTotalInterest(10000, 18, 'Weeks', 4)).toBe(1680);
    // 15 Days
    expect(calculateTotalInterest(10000, 18, 'Days', 15)).toBe(900);
  });

  it('keeps a calendar-month loan on the monthly-rate basis', () => {
    const total = calculateTotalInterest(10000, 10, 'Months', 1);
    expect(total).toBe(1000);
    expect(calculatePeriodInterest(10000, 10, 'Monthly', total)).toBe(1000);
  });

  it('calculates collection period interest based on frequency', () => {
    const total = calculateTotalInterest(10000, 18, 'Months', 1);
    expect(calculatePeriodInterest(10000, 18, 'Monthly', total)).toBe(1800);
    expect(calculatePeriodInterest(10000, 18, 'Daily', total)).toBe(60);
    expect(calculatePeriodInterest(10000, 18, 'Weekly', total)).toBe(420);
    expect(calculatePeriodInterest(10000, 18, 'AtMaturity', total)).toBe(1800);
  });

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
