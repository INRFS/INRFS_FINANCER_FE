import { describe, expect, it } from 'vitest';

import { buildBillingReportRows } from './billingReportUtils';

const invoices = [
  { id: '29d7af3c-b157-48c2-94de-f8de58b3a99d', invoiceNumber: 'INV-260817-B1606B67', financerId: 'FIN-1', periodStart: '2026-08-01', periodEnd: '2026-08-31', interestActivity: 20000, chargePercentage: 1, chargeAmount: 200, collectedAmount: 200, status: 'Paid', dueDate: '2026-09-10' },
  { id: 'INV-2', financerId: 'FIN-2', periodStart: '2026-08-01', periodEnd: '2026-08-31', interestActivity: 10000, chargePercentage: 1, chargeAmount: 100, collectedAmount: 0, status: 'Pending', dueDate: '2026-09-10' },
];
const financers = [{ id: 'FIN-1', displayName: 'Alpha Finance' }, { id: 'FIN-2', displayName: 'Beta Finance' }];

describe('admin billing reports', () => {
  it('maps platform-fee invoices without customer or loan fields', () => {
    const rows = buildBillingReportRows(invoices, financers, 'platform-fees');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ financer: 'Alpha Finance', interestCollected: 20000, feeRate: '1%', feeGenerated: 200, amountCollected: 200, outstanding: 0 });
    expect(rows[0]).not.toHaveProperty('customerId');
    expect(rows[0]).not.toHaveProperty('loanNumber');
  });

  it('includes only invoices with actual collections in Fee Collections', () => {
    expect(buildBillingReportRows(invoices, financers, 'fee-collections').map((row) => row.invoiceId)).toEqual(['INV-260817-B1606B67']);
  });

  it('searches mapped financer billing fields locally', () => {
    expect(buildBillingReportRows(invoices, financers, 'platform-fees', 'beta')).toHaveLength(1);
    expect(buildBillingReportRows(invoices, financers, 'platform-fees', 'missing')).toHaveLength(0);
  });
});
