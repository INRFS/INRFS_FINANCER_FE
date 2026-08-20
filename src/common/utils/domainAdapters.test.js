import { describe, expect, it } from 'vitest';
import { calculateNextDueDate, calculatePeriodicInterest, customerFromApi, customerToApi, loanFromApi, normalizeDateOnly, paymentFromApi } from './domainAdapters';

describe('domain adapters', () => {
  it('normalizes customer contracts without losing the stable API id', () => {
    const result = customerFromApi({ id: 'customer-id', customerNumber: 'CUS-1', fullName: 'Asha Rao', phone: '9999999999', dateOfBirth: '1990-01-01', addressLine1: '1 Main Road', postalCode: '380001' });
    expect(result).toMatchObject({ id: 'customer-id', name: 'Asha Rao', mobile: '9999999999', pinCode: '380001' });
  });

  it('converts displayed Indian dates to the API DateOnly format', () => {
    expect(normalizeDateOnly('23-09-2000')).toBe('2000-09-23');
    expect(normalizeDateOnly('15-Mar-1985')).toBe('1985-03-15');
  });

  it('creates the exact customer request contract', () => {
    expect(customerToApi({ name: ' Asha Rao ', dob: '1990-01-01', gender: 'Female', mobile: ' 9999999999 ', email: ' asha@example.com ', houseNumber: '1', street: 'Main Road', area: 'West', city: ' Ahmedabad ', state: ' Gujarat ', pinCode: '380001', aadhaar: '', pan: '' })).toEqual({ fullName: 'Asha Rao', dateOfBirth: '1990-01-01', gender: 'Female', phone: '9999999999', email: 'asha@example.com', addressLine1: '1, Main Road', addressLine2: 'West', city: 'Ahmedabad', state: 'Gujarat', postalCode: '380001', aadhaar: null, pan: null });
  });

  it('calculates the displayed loan outstanding from all balance buckets', () => {
    expect(loanFromApi({ id: 'loan-id', customerId: 'customer-id', principal: 10000, principalOutstanding: 8000, interestOutstanding: 500, feesOutstanding: 100, annualInterestRate: 12, repaymentFrequency: 'Monthly', disbursementDate: '2026-08-14' }, { fullName: 'Asha Rao' })).toMatchObject({ customer: 'Asha Rao', outstanding: 8600, principal: 10000, nextDue: '2026-09-14' });
  });

  it('normalizes completed payments for UI status filtering', () => {
    expect(paymentFromApi({ status: 'Completed', paymentNumber: 'PAY-1', receivedAt: '2026-01-01T00:00:00Z' })).toMatchObject({ paymentId: 'PAY-1', status: 'completed' });
  });

  it('calculates periodic interest from the annual product rate', () => {
    expect(calculatePeriodicInterest(12000, 12, 'Monthly')).toBe(120);
    expect(calculatePeriodicInterest(12000, 12, 'Quarterly')).toBe(360);
  });

  it('calculates due dates and clamps month ends', () => {
    expect(calculateNextDueDate('2026-08-14', 'Monthly')).toBe('2026-09-14');
    expect(calculateNextDueDate('2026-01-31', 'Monthly')).toBe('2026-02-28');
    expect(calculateNextDueDate('2026-08-14', 'Weekly')).toBe('2026-08-21');
  });
});
