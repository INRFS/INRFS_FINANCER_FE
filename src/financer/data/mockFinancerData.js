export const mockFinancerProfile = {
  name: 'Suresh Patel',
  businessName: 'Patel Finance Services',
  mobile: '+91 98765 43210',
  email: 'suresh@patelfinance.in',
  city: 'Ahmedabad',
  state: 'Gujarat',
  plan: 'Premium Plan',
  avatarLetter: 'S',
};

export const mockDashboardStats = {
  totalCustomers: 250,
  totalCustomersGrowth: '↑ 12 this month',
  activeLoans: 180,
  activeLoansGrowth: '8 new this week',
  totalGiven: 1850000,
  principalOutstanding: 1240000,
  interestDueToday: 35000,
  interestReceived: 28500,
  interestReceivedGrowth: '↑ vs last month',
  pendingInterest: 42000,
  overdueAmount: 18500,
  overdueAccountsCount: 2,
};

export const mockLoanStatusData = [
  { name: 'Active', value: 156, color: '#7BD000' },
  { name: 'Overdue', value: 8, color: '#FF4A4F' },
  { name: 'Paid', value: 12, color: '#10AFE9' },
  { name: 'Rescheduled', value: 4, color: '#FF790B' },
];

export const mockMonthlyCollectionsData = [
  { month: 'Apr', expected: 32000, collected: 30500 },
  { month: 'May', expected: 35000, collected: 34000 },
  { month: 'Jun', expected: 38000, collected: 36200 },
  { month: 'Jul', expected: 40000, collected: 39500 },
  { month: 'Aug', expected: 42000, collected: 41000 },
  { month: 'Sep', expected: 45000, collected: 28500 },
];

export const mockUpcomingPayments = [
  { id: 'PAY-001', customer: 'Ramesh Kumar', loanId: 'LN000125', amount: 1000, dueDate: '10-Sep-2026', status: 'Due' },
  { id: 'PAY-002', customer: 'Priya Sharma', loanId: 'LN000127', amount: 680, dueDate: '05-Sep-2026', status: 'Due' },
  { id: 'PAY-003', customer: 'Vikram Singh', loanId: 'LN000128', amount: 400, dueDate: 'Today', status: 'Due' },
  { id: 'PAY-004', customer: 'Mohammed Ali', loanId: 'LN000131', amount: 900, dueDate: '20-Sep-2026', status: 'Upcoming' },
  { id: 'PAY-005', customer: 'Mohammed Ali', loanId: 'LN000132', amount: 450, dueDate: '25-Sep-2026', status: 'Upcoming' },
];

export const mockCustomers = [
  { id: 'CUST-101', name: 'Ramesh Kumar', mobile: '+91 98234 11223', activeLoans: 2, outstanding: 45000, nextDue: '10-Sep-2026', status: 'Active', city: 'Ahmedabad' },
  { id: 'CUST-102', name: 'Priya Sharma', mobile: '+91 98112 33445', activeLoans: 1, outstanding: 28000, nextDue: '05-Sep-2026', status: 'Active', city: 'Vadodara' },
  { id: 'CUST-103', name: 'Vikram Singh', mobile: '+91 97445 66778', activeLoans: 1, outstanding: 15000, nextDue: 'Today', status: 'Due', city: 'Surat' },
  { id: 'CUST-104', name: 'Mohammed Ali', mobile: '+91 96554 88990', activeLoans: 2, outstanding: 60000, nextDue: '20-Sep-2026', status: 'Active', city: 'Ahmedabad' },
  { id: 'CUST-105', name: 'Rajesh Patel', mobile: '+91 99123 44556', activeLoans: 1, outstanding: 12500, nextDue: '01-Sep-2026', status: 'Overdue', city: 'Rajkot' },
  { id: 'CUST-106', name: 'Sunita Verma', mobile: '+91 98888 22110', activeLoans: 1, outstanding: 35000, nextDue: '15-Sep-2026', status: 'Active', city: 'Gandhinagar' },
  { id: 'CUST-107', name: 'Amit Shah', mobile: '+91 97123 99887', activeLoans: 0, outstanding: 0, nextDue: '-', status: 'Closed', city: 'Ahmedabad' },
];

export const mockLoans = [
  { id: 'LN000125', customer: 'Ramesh Kumar', principal: 50000, interestRate: '2% Monthly', outstanding: 35000, nextDue: '10-Sep-2026', type: 'Daily Collection', status: 'Active' },
  { id: 'LN000126', customer: 'Ramesh Kumar', principal: 20000, interestRate: '1.5% Monthly', outstanding: 10000, nextDue: '12-Sep-2026', type: 'Monthly Interest', status: 'Active' },
  { id: 'LN000127', customer: 'Priya Sharma', principal: 40000, interestRate: '2% Monthly', outstanding: 28000, nextDue: '05-Sep-2026', type: 'Weekly Collection', status: 'Active' },
  { id: 'LN000128', customer: 'Vikram Singh', principal: 25000, interestRate: '2.5% Monthly', outstanding: 15000, nextDue: 'Today', type: 'Daily Collection', status: 'Due' },
  { id: 'LN000129', customer: 'Rajesh Patel', principal: 18000, interestRate: '3% Monthly', outstanding: 12500, nextDue: '01-Sep-2026', type: 'Daily Collection', status: 'Overdue' },
  { id: 'LN000130', customer: 'Amit Shah', principal: 30000, interestRate: '2% Monthly', outstanding: 0, nextDue: '-', type: 'Monthly Interest', status: 'Closed' },
  { id: 'LN000131', customer: 'Mohammed Ali', principal: 50000, interestRate: '2% Monthly', outstanding: 40000, nextDue: '20-Sep-2026', type: 'Weekly Collection', status: 'Active' },
  { id: 'LN000132', customer: 'Mohammed Ali', principal: 25000, interestRate: '2% Monthly', outstanding: 20000, nextDue: '25-Sep-2026', type: 'Daily Collection', status: 'Active' },
];

export const mockPaymentsList = [
  { id: 'PAY-1001', customer: 'Ramesh Kumar', loanId: 'LN000125', amount: 1000, date: '08-Sep-2026', mode: 'UPI', status: 'Completed' },
  { id: 'PAY-1002', customer: 'Priya Sharma', loanId: 'LN000127', amount: 680, date: '04-Sep-2026', mode: 'Cash', status: 'Completed' },
  { id: 'PAY-1003', customer: 'Mohammed Ali', loanId: 'LN000131', amount: 900, date: '01-Sep-2026', mode: 'Bank Transfer', status: 'Completed' },
  { id: 'PAY-1004', customer: 'Sunita Verma', loanId: 'LN000133', amount: 1200, date: '30-Aug-2026', mode: 'UPI', status: 'Completed' },
  { id: 'PAY-1005', customer: 'Rajesh Patel', loanId: 'LN000129', amount: 500, date: '25-Aug-2026', mode: 'Cash', status: 'Completed' },
];

export const mockInterestSchedules = [
  { loanId: 'LN000125', customer: 'Ramesh Kumar', principal: 50000, rate: '2.0%', interestAmount: 1000, dueDate: '10-Sep-2026', status: 'Due' },
  { loanId: 'LN000127', customer: 'Priya Sharma', principal: 40000, rate: '2.0%', interestAmount: 800, dueDate: '05-Sep-2026', status: 'Due' },
  { loanId: 'LN000128', customer: 'Vikram Singh', principal: 25000, rate: '2.5%', interestAmount: 625, dueDate: '10-Sep-2026', status: 'Due' },
  { loanId: 'LN000129', customer: 'Rajesh Patel', principal: 18000, rate: '3.0%', interestAmount: 540, dueDate: '01-Sep-2026', status: 'Overdue' },
  { loanId: 'LN000131', customer: 'Mohammed Ali', principal: 50000, rate: '2.0%', interestAmount: 1000, dueDate: '20-Sep-2026', status: 'Upcoming' },
  { loanId: 'LN000132', customer: 'Mohammed Ali', principal: 25000, rate: '2.0%', interestAmount: 500, dueDate: '25-Sep-2026', status: 'Upcoming' },
];

export const mockOverdueItems = [
  { customer: 'Rajesh Patel', loanId: 'LN000129', dueAmount: 12500, dueDate: '01-Aug-2026', daysOverdue: 10, status: 'Overdue' },
  { customer: 'Vikram Singh', loanId: 'LN000128', dueAmount: 6000, dueDate: '05-Aug-2026', daysOverdue: 5, status: 'Overdue' },
];

export const mockLedgerEntries = [
  { date: '01-Aug-2026', description: 'Loan Disbursed - LN000125', debit: 50000, credit: 0, balance: 50000 },
  { date: '10-Aug-2026', description: 'Interest Applied (August)', debit: 1000, credit: 0, balance: 51000 },
  { date: '12-Aug-2026', description: 'Payment Received via UPI', debit: 0, credit: 1000, balance: 50000 },
  { date: '25-Aug-2026', description: 'Principal Repayment Cash', debit: 0, credit: 15000, balance: 35000 },
  { date: '01-Sep-2026', description: 'Interest Applied (September)', debit: 1000, credit: 0, balance: 36000 },
  { date: '08-Sep-2026', description: 'Payment Received via UPI', debit: 0, credit: 1000, balance: 35000 },
];

export const mockNotifications = [
  { id: 1, title: 'Payment Overdue Alert', message: 'Rajesh Patel (LN000129) payment is 10 days overdue.', time: '2 hours ago', category: 'Overdue', unread: true },
  { id: 2, title: 'Payment Received', message: 'Received ₹1,000 from Ramesh Kumar via UPI.', time: 'Yesterday', category: 'Payments', unread: true },
  { id: 3, title: 'New Loan Disbursed', message: 'Loan LN000132 approved and disbursed to Mohammed Ali.', time: '3 days ago', category: 'Loans', unread: false },
  { id: 4, title: 'System Maintenance', message: 'Scheduled maintenance on Sunday 2:00 AM IST.', time: '1 week ago', category: 'System', unread: false },
];

export const mockSupportTickets = [
  { id: 'TCK-801', subject: 'SMS OTP delay on customer login', category: 'Technical', date: '05-Sep-2026', status: 'Pending' },
  { id: 'TCK-788', subject: 'Query regarding GST calculation in interest report', category: 'Billing', date: '20-Aug-2026', status: 'Resolved' },
];
