const INTERNAL_COLUMNS = new Set([
  'id', 'createdBy', 'updatedBy', 'customerId', 'financerId', 'loanId', 'loanProductId',
]);

const byId = (items) => new Map(items.map((item) => [String(item.id), item]));

export const buildReportRows = (rows, references = {}) => {
  const customers = byId(references.customers || []);
  const loans = byId(references.loans || []);
  const financer = references.financer || {};

  return rows.map((source) => {
    const row = Object.fromEntries(
      Object.entries(source).filter(([key]) => !INTERNAL_COLUMNS.has(key)),
    );
    const customer = customers.get(String(source.customerId || source.id));
    const loan = loans.get(String(source.loanId || source.id));

    if (source.customerId && !row.customerNumber) {
      row.customerNumber = source.customerNumber || customer?.customerNumber;
    }
    if (source.loanId && !row.loanNumber) {
      row.loanNumber = source.loanNumber || loan?.loanNumber;
    }
    if (source.financerId && !row.financerNumber) {
      row.financerNumber = source.financerNumber || financer.financerNumber;
    }

    return row;
  });
};

export const reportRowKey = (source, index) => source.id || source.paymentNumber
  || source.loanNumber || source.customerNumber || `report-row-${index}`;
