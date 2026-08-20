import { describe, expect, it } from 'vitest';
import { getCurrentBillingCycle, getLatestClosedBillingCycle, groupMonthlyBilling, normalizeBillingInvoice } from './monthlyBillingGroups';

const invoice = (overrides = {}) => normalizeBillingInvoice({
  id: 'invoice-1', financerId: 'financer-1', invoiceNumber: 'INV-1',
  periodStart: '2026-08-01', periodEnd: '2026-08-31', dueDate: '2026-09-10',
  interestActivity: 1000, chargePercentage: 1, chargeAmount: 10, collectedAmount: 0,
  status: 'Due', ...overrides,
}, 'Demo Finance');

describe('groupMonthlyBilling', () => {
  it('consolidates invoice and supplementary line items by financer and month', () => {
    const result = groupMonthlyBilling([
      invoice(),
      invoice({ id: 'invoice-2', invoiceNumber: 'INV-2', interestActivity: 500, chargeAmount: 5, collectedAmount: 2 }),
    ], '2026-08-19');
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ applicableInterest: 1500, serviceChargeAmount: 15, collectedAmount: 2, outstandingAmount: 13, settlementStatus: 'Partially Paid' });
    expect(result[0].items).toHaveLength(2);
  });

  it('marks an unpaid statement overdue only after its due date', () => {
    expect(groupMonthlyBilling([invoice({ dueDate: '2026-08-18' })], '2026-08-19')[0].settlementStatus).toBe('Overdue');
    expect(groupMonthlyBilling([invoice({ dueDate: '2026-08-19' })], '2026-08-19')[0].settlementStatus).toBe('Pending');
  });

  it('keeps different months as different statements', () => {
    const result = groupMonthlyBilling([invoice(), invoice({ id: 'july', periodStart: '2026-07-01', periodEnd: '2026-07-31' })]);
    expect(result).toHaveLength(2);
  });
});

describe('getLatestClosedBillingCycle', () => {
  it('uses the previous close before the 25th', () => {
    expect(getLatestClosedBillingCycle(new Date(2026, 7, 19))).toEqual({ periodStart: '2026-06-26', periodEnd: '2026-07-25', dueDate: '2026-08-10' });
  });

  it('closes the current cycle on the 25th', () => {
    expect(getLatestClosedBillingCycle(new Date(2026, 7, 25))).toEqual({ periodStart: '2026-07-26', periodEnd: '2026-08-25', dueDate: '2026-09-10' });
  });
});

describe('getCurrentBillingCycle', () => {
  it('includes a payment recorded before the 25th in the cycle ending this month', () => {
    expect(getCurrentBillingCycle(new Date(2026, 7, 19))).toEqual({ periodStart: '2026-07-26', periodEnd: '2026-08-25', dueDate: '2026-09-10' });
  });

  it('starts the next cycle on the 26th', () => {
    expect(getCurrentBillingCycle(new Date(2026, 7, 26))).toEqual({ periodStart: '2026-08-26', periodEnd: '2026-09-25', dueDate: '2026-10-10' });
  });
});
