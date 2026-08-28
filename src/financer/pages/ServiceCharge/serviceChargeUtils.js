export const roundMoney = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const indiaDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

export const withLiveInterestCollected = (billing, payments) => {
  if (!billing?.periodStart || !billing?.periodEnd || !Array.isArray(payments)) return billing;
  const interestCollected = roundMoney(payments
    .filter((payment) => {
      const status = typeof payment.status === 'string' ? payment.status.toLowerCase() : payment.status;
      if (![1, 'completed', 'paid', 'success'].includes(status)) return false;
      const received = indiaDateKey(payment.receivedAt);
      return received >= billing.periodStart && received <= billing.periodEnd;
    })
    .reduce((sum, payment) => sum + Number(payment.interestAmount || 0), 0));
  const amountPayable = billing.chargeRate === 'Mixed'
    ? billing.amountPayable
    : roundMoney(interestCollected * Number(billing.chargeRate || 0) / 100);
  const amountPaid = roundMoney(billing.amountPaid);
  const outstanding = roundMoney(Math.max(0, amountPayable - amountPaid));
  const status = amountPayable <= 0
    ? 'No Charge'
    : outstanding <= 0
      ? 'Paid'
      : amountPaid > 0
        ? 'Partially Paid'
        : 'Accruing';
  return { ...billing, interestCollected, amountPayable, outstanding, status };
};

export const formatMonthLabel = (periodEnd, periodStart) => {
  if (periodEnd) {
    const d = new Date(
      periodEnd.includes('T') ? periodEnd : `${periodEnd}T00:00:00`
    );
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      });
    }
  }
  if (periodStart) {
    const d = new Date(
      periodStart.includes('T') ? periodStart : `${periodStart}T00:00:00`
    );
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      });
    }
  }
  return '—';
};

export const groupServiceCharges = (
  invoices,
  today = new Date().toISOString().slice(0, 10)
) => {
  if (!Array.isArray(invoices)) {
    return [];
  }

  const groups = new Map();

  invoices.forEach((item) => {
    const monthLabel = formatMonthLabel(item.periodEnd, item.periodStart);
    const key =
      item.periodStart && item.periodEnd
        ? `${item.periodStart}_${item.periodEnd}`
        : item.billingMonth || monthLabel || item.periodEnd || item.periodStart || 'default';

    const existing = groups.get(key) || {
      id: key,
      groupKey: key,
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      dueDate: item.dueDate,
      month: monthLabel,
      interestCollected: 0,
      amountPayable: 0,
      amountPaid: 0,
      recordCount: 0,
      rates: [],
      items: [],
    };

    if (!existing.periodStart || (item.periodStart && item.periodStart < existing.periodStart)) {
      existing.periodStart = item.periodStart;
    }
    if (!existing.periodEnd || (item.periodEnd && item.periodEnd > existing.periodEnd)) {
      existing.periodEnd = item.periodEnd;
    }
    if (!existing.dueDate || (item.dueDate && item.dueDate < existing.dueDate)) {
      existing.dueDate = item.dueDate;
    }

    existing.interestCollected += Number(item.interestActivity || 0);
    existing.amountPayable += Number(item.chargeAmount || 0);
    existing.amountPaid += Number(item.collectedAmount || 0);
    existing.recordCount += 1;
    if (item.chargePercentage !== undefined && item.chargePercentage !== null) {
      existing.rates.push(Number(item.chargePercentage));
    }
    existing.items.push(item);

    groups.set(key, existing);
  });

  return [...groups.values()]
    .map((group) => {
      const interestCollected = roundMoney(group.interestCollected);
      const amountPayable = roundMoney(group.amountPayable);
      const amountPaid = roundMoney(group.amountPaid);
      const outstanding = roundMoney(Math.max(0, amountPayable - amountPaid));

      const uniqueRates = [
        ...new Set(group.rates.filter((r) => !Number.isNaN(r))),
      ];
      const chargeRate =
        uniqueRates.length === 1
          ? uniqueRates[0]
          : uniqueRates.length === 0
          ? 0
          : 'Mixed';

      let status = 'Pending';
      if (amountPayable <= 0) {
        status = 'No Charge';
      } else if (outstanding <= 0 && amountPaid > 0) {
        status = 'Paid';
      } else if (amountPaid > 0 && outstanding > 0) {
        status = 'Partially Paid';
      } else if (
        group.items.some((i) => i.status === 'Overdue') ||
        (group.dueDate && group.dueDate < today && outstanding > 0)
      ) {
        status = 'Overdue';
      } else {
        const itemStatuses = [
          ...new Set(group.items.map((i) => i.status).filter(Boolean)),
        ];
        if (itemStatuses.length === 1 && itemStatuses[0] !== 'Paid') {
          status = itemStatuses[0];
        }
      }

      return {
        ...group,
        interestCollected,
        amountPayable,
        amountPaid,
        outstanding,
        chargeRate,
        status,
      };
    })
    .sort((a, b) => {
      const dateA = new Date(
        a.periodEnd
          ? a.periodEnd.includes('T')
            ? a.periodEnd
            : `${a.periodEnd}T00:00:00`
          : a.periodStart || 0
      );
      const dateB = new Date(
        b.periodEnd
          ? b.periodEnd.includes('T')
            ? b.periodEnd
            : `${b.periodEnd}T00:00:00`
          : b.periodStart || 0
      );
      return dateB - dateA;
    });
};
