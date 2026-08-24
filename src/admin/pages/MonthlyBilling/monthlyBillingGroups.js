const amount = (value) => Number(value || 0);

const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const isoDate = (date) => date.toISOString().slice(0, 10);

export const getLatestClosedBillingCycle = (now = new Date()) => {
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const closeMonth = today.getUTCDate() >= 25
    ? today
    : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 25));
  const periodEnd = new Date(Date.UTC(closeMonth.getUTCFullYear(), closeMonth.getUTCMonth(), 25));
  const periodStart = new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() - 1, 26));
  const dueDate = new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 10));
  return { periodStart: isoDate(periodStart), periodEnd: isoDate(periodEnd), dueDate: isoDate(dueDate) };
};

export const getCurrentBillingCycle = (now = new Date()) => {
  const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const periodEnd = today.getUTCDate() >= 26
    ? new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 25))
    : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 25));
  const periodStart = new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() - 1, 26));
  const dueDate = new Date(Date.UTC(periodEnd.getUTCFullYear(), periodEnd.getUTCMonth() + 1, 10));
  return { periodStart: isoDate(periodStart), periodEnd: isoDate(periodEnd), dueDate: isoDate(dueDate) };
};

const deriveStatus = (collected, outstanding, dueDate, today) => {
  if (outstanding <= 0) return 'Paid';
  if (collected > 0) return 'Partially Paid';
  if (dueDate && dueDate < today) return 'Overdue';
  return 'Pending';
};

export const normalizeBillingInvoice = (item, financerDetails) => {
  const serviceChargeAmount = amount(item.chargeAmount);
  const collectedAmount = amount(item.collectedAmount);
  const financer = typeof financerDetails === 'object' && financerDetails !== null ? financerDetails : {};
  return {
    ...item,
    financerName: financer.displayName || financerDetails || 'Unknown financer',
    financerNumber: item.financerNumber || financer.financerNumber || '—',
    billingMonth: String(item.periodEnd || '').slice(0, 7),
    applicableInterest: amount(item.interestActivity),
    serviceChargePercentage: amount(item.chargePercentage),
    serviceChargeAmount,
    collectedAmount,
    outstandingAmount: Math.max(0, roundMoney(serviceChargeAmount - collectedAmount)),
    settlementStatus: item.status,
  };
};

export const groupMonthlyBilling = (invoices, today = new Date().toISOString().slice(0, 10)) => {
  const groups = new Map();

  invoices.forEach((invoice) => {
    const key = `${invoice.financerId}:${invoice.billingMonth}`;
    const existing = groups.get(key) || {
      id: key,
      groupKey: key,
      financerId: invoice.financerId,
      financerName: invoice.financerName,
      financerNumber: invoice.financerNumber,
      billingMonth: invoice.billingMonth,
      invoiceNumber: `STATEMENT-${invoice.billingMonth}-${String(invoice.financerNumber || 'UNKNOWN').replace(/[^a-z0-9]/gi, '').toUpperCase()}`,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      dueDate: invoice.dueDate,
      applicableInterest: 0,
      serviceChargeAmount: 0,
      collectedAmount: 0,
      outstandingAmount: 0,
      items: [],
    };

    existing.periodStart = !existing.periodStart || invoice.periodStart < existing.periodStart ? invoice.periodStart : existing.periodStart;
    existing.periodEnd = !existing.periodEnd || invoice.periodEnd > existing.periodEnd ? invoice.periodEnd : existing.periodEnd;
    existing.dueDate = !existing.dueDate || invoice.dueDate < existing.dueDate ? invoice.dueDate : existing.dueDate;
    existing.applicableInterest += invoice.applicableInterest;
    existing.serviceChargeAmount += invoice.serviceChargeAmount;
    existing.collectedAmount += invoice.collectedAmount;
    existing.outstandingAmount += invoice.outstandingAmount;
    existing.items.push(invoice);
    groups.set(key, existing);
  });

  return [...groups.values()].map((group) => {
    group.items.sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)) || String(a.createdAt).localeCompare(String(b.createdAt)));
    const rates = [...new Set(group.items.map((item) => item.serviceChargePercentage))];
    group.applicableInterest = roundMoney(group.applicableInterest);
    group.serviceChargeAmount = roundMoney(group.serviceChargeAmount);
    group.collectedAmount = roundMoney(group.collectedAmount);
    group.outstandingAmount = roundMoney(group.outstandingAmount);
    group.serviceChargePercentage = rates.length === 1 ? rates[0] : null;
    group.settlementStatus = deriveStatus(group.collectedAmount, group.outstandingAmount, group.dueDate, today);
    const latest = [...group.items].filter((item) => item.latestCollectionAt).sort((a, b) => String(b.latestCollectionAt).localeCompare(String(a.latestCollectionAt)))[0];
    if (latest) {
      group.latestCollectionAmount = latest.latestCollectionAmount;
      group.latestCollectionReference = latest.latestCollectionReference;
      group.latestCollectionAt = latest.latestCollectionAt;
    }
    return group;
  }).sort((a, b) => b.billingMonth.localeCompare(a.billingMonth) || a.financerName.localeCompare(b.financerName));
};
