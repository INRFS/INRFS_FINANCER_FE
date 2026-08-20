import { describe, expect, it } from 'vitest';

import { outstandingFor } from './platformFeeCollectionUtils';

describe('platform fee collection calculations', () => {
  it('calculates full and partial outstanding balances', () => {
    expect(outstandingFor({ chargeAmount: 1000, collectedAmount: 0 })).toBe(1000);
    expect(outstandingFor({ chargeAmount: 1000, collectedAmount: 400 })).toBe(600);
  });

  it('never exposes a negative outstanding balance', () => {
    expect(outstandingFor({ chargeAmount: 1000, collectedAmount: 1200 })).toBe(0);
    expect(outstandingFor({})).toBe(0);
  });
});
