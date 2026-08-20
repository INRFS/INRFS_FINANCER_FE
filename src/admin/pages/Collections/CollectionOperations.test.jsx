import { describe, expect, it } from 'vitest';
import { actionableDue, additionalWindowDue, displayCaseStatus, formatDueAmount } from './collectionOperationsUtils';

describe('displayCaseStatus', () => {
  it('does not label a case collected while upcoming dues remain', () => {
    expect(displayCaseStatus({ caseStatus: 'Collected', due: 89, daysUntilDue: 2 })).toBe('Upcoming');
  });

  it('preserves a genuinely collected case', () => {
    expect(displayCaseStatus({ caseStatus: 'Collected', due: 0, daysUntilDue: 0 })).toBe('Collected');
  });

  it('preserves promise-to-pay workflow state', () => {
    expect(displayCaseStatus({ caseStatus: 'PromiseToPay', due: 100, daysUntilDue: 0 })).toBe('PromiseToPay');
  });
});

describe('collection due amounts', () => {
  it('shows the next installment instead of the whole reminder window', () => {
    const row = { dueNow: 0, nextDue: 9.86, due: 88.74 };
    expect(actionableDue(row)).toBe(9.86);
    expect(additionalWindowDue(row)).toBeCloseTo(78.88);
  });

  it('shows all currently due installments when they exist', () => {
    expect(actionableDue({ dueNow: 19.72, nextDue: 9.86, due: 108.46 })).toBe(19.72);
  });

  it('keeps paise visible', () => {
    expect(formatDueAmount(9.86)).toContain('9.86');
  });
});
