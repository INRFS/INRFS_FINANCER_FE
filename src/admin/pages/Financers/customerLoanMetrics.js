const inactiveStatuses = new Set(['closed', 'writtenoff', 'cancelled', 'rejected']);

export function applyCustomerLoanMetrics(customers, loans) {
  const metrics = new Map();
  for (const loan of loans) {
    const customerId = String(loan.customerId || '').toLowerCase();
    if (!customerId) continue;
    const current = metrics.get(customerId) || { activeLoans: 0, outstanding: 0 };
    const status = String(loan.status || '').replaceAll(' ', '').toLowerCase();
    if (!inactiveStatuses.has(status)) {
      current.activeLoans += 1;
      current.outstanding = Math.round((current.outstanding + Math.max(0, Number(loan.outstanding) || 0)) * 100) / 100;
    }
    metrics.set(customerId, current);
  }
  return customers.map((customer) => ({
    ...customer,
    ...(metrics.get(String(customer.id || '').toLowerCase()) || { activeLoans: 0, outstanding: 0 }),
  }));
}
