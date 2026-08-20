import { describe, expect, it } from 'vitest';
import { applyCustomerLoanMetrics } from './customerLoanMetrics';

describe('applyCustomerLoanMetrics', () => {
  it('aggregates loan counts and outstanding balances by customer', () => {
    const result = applyCustomerLoanMetrics(
      [{ id: 'CUS-1', name: 'Kim' }, { id: 'CUS-2', name: 'Bala' }],
      [
        { customerId: 'cus-1', status: 'Active', outstanding: 1009.86 },
        { customerId: 'CUS-1', status: 'Overdue', outstanding: 500 },
        { customerId: 'CUS-1', status: 'Closed', outstanding: 0 },
        { customerId: 'CUS-2', status: 'Cancelled', outstanding: 100 },
      ]
    );
    expect(result[0]).toMatchObject({ activeLoans: 2, outstanding: 1509.86 });
    expect(result[1]).toMatchObject({ activeLoans: 0, outstanding: 0 });
  });
});
