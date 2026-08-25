import { describe, expect, it } from 'vitest';
import {
  formatMonthLabel,
  groupServiceCharges,
} from './serviceChargeUtils';

describe('serviceChargeUtils', () => {
  it('formats month label from periodEnd (runs 26th to 25th of next month)', () => {
    expect(formatMonthLabel('2026-08-25', '2026-07-26')).toBe('August 2026');
    expect(formatMonthLabel('2026-07-25', '2026-06-26')).toBe('July 2026');
    expect(formatMonthLabel('2026-06-25', '2026-05-26')).toBe('June 2026');
    expect(formatMonthLabel(null, '2026-08-01')).toBe('August 2026');
    expect(formatMonthLabel(null, null)).toBe('—');
  });

  it('aggregates multiple records belonging to the same billing period', () => {
    const backendRecords = [
      {
        id: 'rec-1',
        periodStart: '2026-07-26',
        periodEnd: '2026-08-25',
        interestActivity: 1000,
        chargeAmount: 10,
        collectedAmount: 10,
        chargePercentage: 1,
        status: 'Paid',
      },
      {
        id: 'rec-2',
        periodStart: '2026-07-26',
        periodEnd: '2026-08-25',
        interestActivity: 350,
        chargeAmount: 3.5,
        collectedAmount: 3.5,
        chargePercentage: 1,
        status: 'Paid',
      },
    ];

    const result = groupServiceCharges(backendRecords);
    expect(result).toHaveLength(1);
    expect(result[0].month).toBe('August 2026');
    expect(result[0].interestCollected).toBe(1350);
    expect(result[0].amountPayable).toBe(13.5);
    expect(result[0].amountPaid).toBe(13.5);
    expect(result[0].outstanding).toBe(0);
    expect(result[0].recordCount).toBe(2);
    expect(result[0].chargeRate).toBe(1);
    expect(result[0].status).toBe('Paid');
  });

  it('handles mixed charge percentages gracefully', () => {
    const mixedRecords = [
      {
        id: 'rec-1',
        periodStart: '2026-07-26',
        periodEnd: '2026-08-25',
        interestActivity: 1000,
        chargeAmount: 10,
        collectedAmount: 0,
        chargePercentage: 1,
      },
      {
        id: 'rec-2',
        periodStart: '2026-07-26',
        periodEnd: '2026-08-25',
        interestActivity: 1000,
        chargeAmount: 15,
        collectedAmount: 0,
        chargePercentage: 1.5,
      },
    ];

    const result = groupServiceCharges(mixedRecords);
    expect(result).toHaveLength(1);
    expect(result[0].chargeRate).toBe('Mixed');
    expect(result[0].amountPayable).toBe(25);
  });

  it('sorts multiple billing periods in descending chronological order by periodEnd', () => {
    const disorderedRecords = [
      {
        id: 'july-rec',
        periodStart: '2026-06-26',
        periodEnd: '2026-07-25',
        interestActivity: 2000,
        chargeAmount: 20,
        collectedAmount: 20,
        chargePercentage: 1,
      },
      {
        id: 'june-rec',
        periodStart: '2026-05-26',
        periodEnd: '2026-06-25',
        interestActivity: 1500,
        chargeAmount: 15,
        collectedAmount: 15,
        chargePercentage: 1,
      },
      {
        id: 'august-rec',
        periodStart: '2026-07-26',
        periodEnd: '2026-08-25',
        interestActivity: 3000,
        chargeAmount: 30,
        collectedAmount: 10,
        chargePercentage: 1,
      },
    ];

    const result = groupServiceCharges(disorderedRecords);
    expect(result).toHaveLength(3);
    expect(result[0].month).toBe('August 2026');
    expect(result[1].month).toBe('July 2026');
    expect(result[2].month).toBe('June 2026');
  });
});
