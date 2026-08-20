const amount = (value) => Number(value || 0);

export const buildBillingReportRows = (invoices, financers, report, search = '') => {
  const names = new Map(financers.map((financer) => [financer.id, financer.displayName]));
  const term = search.trim().toLowerCase();

  return invoices
    .filter((invoice) => report !== 'fee-collections' || amount(invoice.collectedAmount) > 0)
    .map((invoice) => ({
      invoiceId: invoice.invoiceNumber || invoice.id,
      financer: names.get(invoice.financerId) || invoice.financerId,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      interestCollected: amount(invoice.interestActivity),
      feeRate: `${amount(invoice.chargePercentage)}%`,
      feeGenerated: amount(invoice.chargeAmount),
      amountCollected: amount(invoice.collectedAmount),
      outstanding: Math.max(0, amount(invoice.chargeAmount) - amount(invoice.collectedAmount)),
      status: invoice.status,
      dueDate: invoice.dueDate,
    }))
    .filter((row) => !term || Object.values(row).some((value) => String(value ?? '').toLowerCase().includes(term)));
};
