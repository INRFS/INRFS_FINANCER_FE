import { describe, expect, it } from 'vitest';
import { buildReportRows } from './reportRows';

describe('buildReportRows', () => {
  it('removes database UUID columns and resolves business IDs', () => {
    const [row] = buildReportRows([{
      id: 'payment-uuid',
      customerId: 'customer-uuid',
      loanId: 'loan-uuid',
      loanProductId: 'loan-product-uuid',
      financerId: 'financer-uuid',
      amount: 100,
    }], {
      customers: [{ id: 'customer-uuid', customerNumber: 'CUS-260823-ABC123' }],
      loans: [{ id: 'loan-uuid', loanNumber: 'LN-260823-DEF456' }],
      financer: { id: 'financer-uuid', financerNumber: 'FIN-260823-789ABC' },
    });

    expect(row).toEqual({
      amount: 100,
      customerNumber: 'CUS-260823-ABC123',
      loanNumber: 'LN-260823-DEF456',
      financerNumber: 'FIN-260823-789ABC',
    });
  });

  it('keeps business IDs already returned by a report', () => {
    const [row] = buildReportRows([{
      id: 'customer-uuid',
      financerId: 'financer-uuid',
      customerNumber: 'CUS-REAL',
      financerNumber: 'FIN-REAL',
      fullName: 'Kim',
    }]);

    expect(row).toEqual({ customerNumber: 'CUS-REAL', financerNumber: 'FIN-REAL', fullName: 'Kim' });
  });
});
