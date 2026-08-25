import { describe, expect, it } from 'vitest';
import {
  calculateNextDueDate,
  calculatePeriodicInterest,
  countNewCustomersThisMonth,
  customerFromApi,
  customerToApi,
  isCreatedThisMonth,
  loanFromApi,
  normalizeDateOnly,
  paymentFromApi,
} from './domainAdapters';

describe('domain adapters', () => {
  it('normalizes customer contracts without losing the stable API id and preserves createdAt', () => {
    const result = customerFromApi({
      id: 'customer-id',
      customerNumber: 'CUS-1',
      fullName: 'Asha Rao',
      phone: '9999999999',
      dateOfBirth: '1990-01-01',
      addressLine1: '1 Main Road',
      postalCode: '380001',
      createdAt: '2026-08-15T10:00:00Z',
    });
    expect(result).toMatchObject({
      id: 'customer-id',
      name: 'Asha Rao',
      mobile: '9999999999',
      pinCode: '380001',
      createdAt: '2026-08-15T10:00:00Z',
    });
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

  describe('isCreatedThisMonth & countNewCustomersThisMonth', () => {
    const referenceDate = new Date(2026, 7, 25, 12, 0, 0); // August 25, 2026

    it('counts customer created during current calendar month (Aug 1, Aug 10, Aug 24)', () => {
      expect(isCreatedThisMonth(new Date(2026, 7, 1, 0, 0, 0), referenceDate)).toBe(true);
      expect(isCreatedThisMonth(new Date(2026, 7, 10, 14, 30, 0), referenceDate)).toBe(true);
      expect(isCreatedThisMonth(new Date(2026, 7, 24, 23, 59, 59), referenceDate)).toBe(true);
      expect(isCreatedThisMonth(new Date(2026, 7, 31, 23, 59, 59), referenceDate)).toBe(true);
    });

    it('does not count customer created in previous month (July 31)', () => {
      expect(isCreatedThisMonth(new Date(2026, 6, 31, 23, 59, 59), referenceDate)).toBe(false);
      expect(isCreatedThisMonth(new Date(2026, 6, 1, 0, 0, 0), referenceDate)).toBe(false);
    });

    it('does not count customer created at start of next month (Sept 1 00:00:00)', () => {
      expect(isCreatedThisMonth(new Date(2026, 8, 1, 0, 0, 0), referenceDate)).toBe(false);
      expect(isCreatedThisMonth(new Date(2026, 8, 15, 10, 0, 0), referenceDate)).toBe(false);
    });

    it('handles null, undefined, and invalid date formats gracefully', () => {
      expect(isCreatedThisMonth(null, referenceDate)).toBe(false);
      expect(isCreatedThisMonth(undefined, referenceDate)).toBe(false);
      expect(isCreatedThisMonth('', referenceDate)).toBe(false);
      expect(isCreatedThisMonth('invalid-date', referenceDate)).toBe(false);
    });

    it('automatically adjusts when the reference month changes', () => {
      const septReference = new Date(2026, 8, 10); // September 10, 2026
      expect(isCreatedThisMonth(new Date(2026, 7, 25), septReference)).toBe(false);
      expect(isCreatedThisMonth(new Date(2026, 8, 1, 0, 0, 0), septReference)).toBe(true);
      expect(isCreatedThisMonth(new Date(2026, 8, 5), septReference)).toBe(true);
    });

    it('correctly aggregates list of customers with countNewCustomersThisMonth', () => {
      const customers = [
        { id: '1', createdAt: new Date(2026, 7, 1).toISOString() },
        { id: '2', createdAt: new Date(2026, 7, 10).toISOString() },
        { id: '3', createdAt: new Date(2026, 7, 24).toISOString() },
        { id: '4', createdAt: new Date(2026, 6, 31).toISOString() }, // Last month
        { id: '5', createdAt: new Date(2026, 8, 1).toISOString() },  // Next month
        { id: '6', createdAt: null },
      ];

      expect(countNewCustomersThisMonth(customers, referenceDate)).toBe(3);
      expect(countNewCustomersThisMonth([], referenceDate)).toBe(0);
      expect(countNewCustomersThisMonth(null, referenceDate)).toBe(0);
    });
  });
});
