const toAmount = (value) => Number(value || 0);

export const outstandingFor = (invoice) =>
  Math.max(0, toAmount(invoice.chargeAmount) - toAmount(invoice.collectedAmount));
