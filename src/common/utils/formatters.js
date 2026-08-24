/**
 * Formats a number as Indian Rupee (INR) currency.
 * @param {number} amount
 * @returns {string} e.g. "₹18,50,000"
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a date string or object into DD-MMM-YYYY format.
 * @param {string|Date} dateStr
 * @returns {string} e.g. "10-Sep-2026"
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

/**
 * Formats phone number into standard Indian format (+91 XXXXX XXXXX)
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const formatLoanNumber = (loanOrId) => {
  const record = typeof loanOrId === 'object' && loanOrId !== null ? loanOrId : {};
  const readable = record.loanNumber || record.loan_number || record.displayId;
  if (readable) return String(readable);
  const rawId = typeof loanOrId === 'string' ? loanOrId : record.loanId || record.id;
  if (!rawId) return '—';
  return `LN-${String(rawId).replace(/-/g, '').slice(0, 8).toUpperCase()}`;
};

export const formatCustomerNumber = (customerOrId) => {
  const record = typeof customerOrId === 'object' && customerOrId !== null ? customerOrId : {};
  const readable = record.customerNumber || record.customer_number || record.customerDisplayId;
  if (readable) return String(readable);
  const rawId = typeof customerOrId === 'string' ? customerOrId : record.customerId || record.id;
  if (!rawId) return '—';
  return `CUS-${String(rawId).replace(/-/g, '').slice(0, 8).toUpperCase()}`;
};

export const formatFinancerNumber = (financerOrId) => {
  const record = typeof financerOrId === 'object' && financerOrId !== null ? financerOrId : {};
  const readable = record.financerNumber || record.financer_number || record.financerDisplayId;
  if (readable) return String(readable);
  const rawId = typeof financerOrId === 'string' ? financerOrId : record.financerId || record.id;
  if (!rawId) return '—';
  return `FIN-${String(rawId).replace(/-/g, '').slice(0, 8).toUpperCase()}`;
};
