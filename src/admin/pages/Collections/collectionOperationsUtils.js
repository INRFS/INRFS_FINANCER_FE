export const displayCaseStatus = (row) => {
  if (row.caseStatus === 'Collected' && Number(row.due || 0) > 0)
    return row.daysUntilDue > 0 ? 'Upcoming' : 'Open';
  return row.caseStatus || (row.daysPastDue > 0 ? 'Overdue' : row.daysUntilDue > 0 ? 'Upcoming' : 'Due Today');
};

export const actionableDue = (row) => Number(row.dueNow || 0) > 0
  ? Number(row.dueNow)
  : Number(row.nextDue ?? row.due ?? 0);

export const additionalWindowDue = (row) => Math.max(0, Number(row.due || 0) - actionableDue(row));

export const formatDueAmount = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(value || 0));
