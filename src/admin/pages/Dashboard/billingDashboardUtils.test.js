import { describe, expect, it } from 'vitest';

import { invoiceFeeRate } from './billingDashboardUtils';

describe('admin billing dashboard mappings', () => {
  it('reads the platform fee rate from the service-charge invoice contract', () => {
    expect(invoiceFeeRate({ chargePercentage: 1 })).toBe(1);
    expect(invoiceFeeRate({ chargePercentage: 1.5 })).toBe(1.5);
  });

  it('uses zero only when the API rate is absent', () => {
    expect(invoiceFeeRate({})).toBe(0);
    expect(invoiceFeeRate(null)).toBe(0);
  });
});
