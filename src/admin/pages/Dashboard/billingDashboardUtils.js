export const invoiceFeeRate = (invoice) =>
  Number(invoice?.chargePercentage ?? 0);
