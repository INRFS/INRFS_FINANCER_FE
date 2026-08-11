// ============================================================
// INRFS ADMIN PORTAL — COMPREHENSIVE MOCK DATA
// ============================================================

// ---------- Admin Dashboard KPIs ----------
export const adminDashboardKpis = [
  { label: 'TOTAL FINANCERS', value: '125', change: '↑ 7 this month', changeType: 'positive', color: '#071D43', bg: 'rgba(7,29,67,0.08)' },
  { label: 'ACTIVE FINANCERS', value: '110', change: '88% active rate', changeType: 'neutral', color: '#7BD000', bg: 'rgba(123,208,0,0.1)' },
  { label: 'TOTAL CUSTOMERS', value: '12,450', change: '↑ 550 this month', changeType: 'positive', color: '#10AFE9', bg: 'rgba(16,175,233,0.1)' },
  { label: 'ACTIVE LOANS', value: '8,320', change: 'Across all financers', changeType: 'neutral', color: '#7D1FE8', bg: 'rgba(125,31,232,0.1)' },
  { label: 'TOTAL LOAN VALUE', value: '₹18.5 Cr', change: 'Platform portfolio', changeType: 'neutral', color: '#EC008C', bg: 'rgba(236,0,140,0.1)' },
  { label: 'SMS SENT', value: '85,420', change: 'This month', changeType: 'neutral', color: '#FF790B', bg: 'rgba(255,121,11,0.1)' },
  { label: 'ACTIVE SUBSCRIPTIONS', value: '105', change: '84% of financers', changeType: 'neutral', color: '#FFB800', bg: 'rgba(255,184,0,0.1)' },
  { label: 'MONTHLY REVENUE', value: '₹2,45,000', change: '↑ 12% vs last month', changeType: 'positive', color: '#7BD000', bg: 'rgba(123,208,0,0.1)' },
];

// ---------- Financer Growth Chart ----------
export const financerGrowthData = [
  { month: 'Mar', count: 95 },
  { month: 'Apr', count: 102 },
  { month: 'May', count: 108 },
  { month: 'Jun', count: 114 },
  { month: 'Jul', count: 119 },
  { month: 'Aug', count: 125 },
];

// ---------- Platform Growth Chart ----------
export const platformGrowthData = [
  { month: 'Mar', customers: 8200, loans: 5400 },
  { month: 'Apr', customers: 9100, loans: 6100 },
  { month: 'May', customers: 9800, loans: 6700 },
  { month: 'Jun', customers: 10600, loans: 7200 },
  { month: 'Jul', customers: 11500, loans: 7800 },
  { month: 'Aug', customers: 12450, loans: 8320 },
];

// ---------- Revenue Chart ----------
export const revenueData = [
  { month: 'Mar', revenue: 185000 },
  { month: 'Apr', revenue: 198000 },
  { month: 'May', revenue: 210000 },
  { month: 'Jun', revenue: 225000 },
  { month: 'Jul', revenue: 235000 },
  { month: 'Aug', revenue: 245000 },
];

// ---------- Financers List ----------
export const financersList = [
  { id: 'FIN-1001', name: 'Patel Finance Services', owner: 'Suresh Patel', email: 'suresh@patelfinance.in', mobile: '+91 98765 43210', city: 'Ahmedabad', state: 'Gujarat', plan: 'Premium', customers: 250, activeLoans: 180, totalDisbursed: 18500000, outstanding: 12400000, status: 'Active', registeredDate: '15-Jan-2025', kycStatus: 'Verified' },
  { id: 'FIN-1002', name: 'Apex Capital Services', owner: 'Vikram Mehta', email: 'vikram@apexcapital.com', mobile: '+91 87654 32109', city: 'Mumbai', state: 'Maharashtra', plan: 'Premium', customers: 450, activeLoans: 380, totalDisbursed: 62000000, outstanding: 41000000, status: 'Active', registeredDate: '22-Feb-2025', kycStatus: 'Verified' },
  { id: 'FIN-1003', name: 'Shree Ram Microfinance', owner: 'Ramshankar Joshi', email: 'ram@shreeram.co.in', mobile: '+91 76543 21098', city: 'Jaipur', state: 'Rajasthan', plan: 'Standard', customers: 310, activeLoans: 245, totalDisbursed: 34000000, outstanding: 22000000, status: 'Active', registeredDate: '05-Mar-2025', kycStatus: 'Verified' },
  { id: 'FIN-1004', name: 'City FinCorp India', owner: 'Anil Agarwal', email: 'anil@cityfincorp.in', mobile: '+91 65432 10987', city: 'Surat', state: 'Gujarat', plan: 'Basic', customers: 95, activeLoans: 72, totalDisbursed: 11000000, outstanding: 8500000, status: 'Pending', registeredDate: '18-Jun-2026', kycStatus: 'Pending' },
  { id: 'FIN-1005', name: 'Metro Loan Agency', owner: 'Sunil Rao', email: 'sunil@metroloan.com', mobile: '+91 54321 09876', city: 'Bengaluru', state: 'Karnataka', plan: 'Standard', customers: 180, activeLoans: 0, totalDisbursed: 0, outstanding: 0, status: 'Suspended', registeredDate: '10-Apr-2025', kycStatus: 'Rejected' },
  { id: 'FIN-1006', name: 'Bharat Nidhi Finance', owner: 'Deepak Sharma', email: 'deepak@bharatnidhi.in', mobile: '+91 99887 76655', city: 'Delhi', state: 'Delhi', plan: 'Premium', customers: 520, activeLoans: 410, totalDisbursed: 78000000, outstanding: 52000000, status: 'Active', registeredDate: '01-Jan-2025', kycStatus: 'Verified' },
  { id: 'FIN-1007', name: 'Lakshmi Credit Co', owner: 'K. Venkatesh', email: 'venkatesh@lakshmicredit.com', mobile: '+91 88776 65544', city: 'Hyderabad', state: 'Telangana', plan: 'Standard', customers: 210, activeLoans: 165, totalDisbursed: 25000000, outstanding: 18000000, status: 'Active', registeredDate: '14-Feb-2025', kycStatus: 'Verified' },
  { id: 'FIN-1008', name: 'Ganesh Finance Ltd', owner: 'Mohan Pillai', email: 'mohan@ganeshfin.co.in', mobile: '+91 77665 54433', city: 'Chennai', state: 'Tamil Nadu', plan: 'Basic', customers: 85, activeLoans: 60, totalDisbursed: 9000000, outstanding: 6500000, status: 'Pending', registeredDate: '25-Jul-2026', kycStatus: 'Pending' },
];

// ---------- Subscription Plans ----------
export const subscriptionPlans = [
  {
    name: 'Basic',
    price: '₹999',
    period: '/month',
    features: ['Up to 100 customers', 'Up to 200 loans', '500 SMS/month', 'Basic reports', 'Email support'],
    financerLimit: 100,
    customerLimit: 100,
    smsLimit: 500,
    highlight: false,
  },
  {
    name: 'Standard',
    price: '₹2,499',
    period: '/month',
    features: ['Up to 500 customers', 'Up to 1000 loans', '2000 SMS/month', 'Advanced reports', 'Priority support', 'Customer ledger'],
    financerLimit: 500,
    customerLimit: 500,
    smsLimit: 2000,
    highlight: false,
  },
  {
    name: 'Premium',
    price: '₹4,999',
    period: '/month',
    features: ['Unlimited customers', 'Unlimited loans', '10000 SMS/month', 'All reports & analytics', 'Dedicated support', 'White-label options', 'API access'],
    financerLimit: -1,
    customerLimit: -1,
    smsLimit: 10000,
    highlight: true,
  },
];

// ---------- Financer Subscriptions Table ----------
export const financerSubscriptions = [
  { financer: 'Patel Finance Services', plan: 'Premium', startDate: '15-Jan-2025', renewalDate: '15-Jan-2027', status: 'Active', amount: '₹4,999' },
  { financer: 'Apex Capital Services', plan: 'Premium', startDate: '22-Feb-2025', renewalDate: '22-Feb-2027', status: 'Active', amount: '₹4,999' },
  { financer: 'Shree Ram Microfinance', plan: 'Standard', startDate: '05-Mar-2025', renewalDate: '05-Mar-2027', status: 'Active', amount: '₹2,499' },
  { financer: 'City FinCorp India', plan: 'Basic', startDate: '18-Jun-2026', renewalDate: '18-Jun-2027', status: 'Pending', amount: '₹999' },
  { financer: 'Bharat Nidhi Finance', plan: 'Premium', startDate: '01-Jan-2025', renewalDate: '01-Jan-2027', status: 'Active', amount: '₹4,999' },
  { financer: 'Lakshmi Credit Co', plan: 'Standard', startDate: '14-Feb-2025', renewalDate: '14-Feb-2027', status: 'Active', amount: '₹2,499' },
  { financer: 'Ganesh Finance Ltd', plan: 'Basic', startDate: '25-Jul-2026', renewalDate: '25-Jul-2027', status: 'Pending', amount: '₹999' },
];

// ---------- SMS Management ----------
export const smsKpis = [
  { label: 'TOTAL SMS SENT', value: '85,420', color: '#071D43', bg: 'rgba(7,29,67,0.08)' },
  { label: 'DELIVERED', value: '82,150', color: '#7BD000', bg: 'rgba(123,208,0,0.1)' },
  { label: 'FAILED', value: '1,820', color: '#FF4A4F', bg: 'rgba(255,74,79,0.1)' },
  { label: 'PENDING', value: '1,450', color: '#FFB800', bg: 'rgba(255,184,0,0.1)' },
  { label: 'SMS COST', value: '₹25,626', color: '#7D1FE8', bg: 'rgba(125,31,232,0.1)' },
];

export const smsUsageByFinancer = [
  { financer: 'Bharat Nidhi', used: 12400 },
  { financer: 'Apex Capital', used: 10800 },
  { financer: 'Patel Finance', used: 8500 },
  { financer: 'Shree Ram', used: 6200 },
  { financer: 'Lakshmi Credit', used: 5100 },
  { financer: 'City FinCorp', used: 2400 },
];

export const smsUsageTable = [
  { financer: 'Patel Finance Services', plan: 'Premium', smsUsed: 8500, smsLimit: 10000, delivered: 8200, failed: 180, status: 'Normal' },
  { financer: 'Apex Capital Services', plan: 'Premium', smsUsed: 10800, smsLimit: 10000, delivered: 10500, failed: 200, status: 'Exceeded' },
  { financer: 'Shree Ram Microfinance', plan: 'Standard', smsUsed: 1800, smsLimit: 2000, delivered: 1750, failed: 30, status: 'Warning' },
  { financer: 'Bharat Nidhi Finance', plan: 'Premium', smsUsed: 12400, smsLimit: 10000, delivered: 12100, failed: 180, status: 'Exceeded' },
  { financer: 'Lakshmi Credit Co', plan: 'Standard', smsUsed: 1200, smsLimit: 2000, delivered: 1180, failed: 12, status: 'Normal' },
  { financer: 'City FinCorp India', plan: 'Basic', smsUsed: 420, smsLimit: 500, delivered: 410, failed: 8, status: 'Warning' },
  { financer: 'Ganesh Finance Ltd', plan: 'Basic', smsUsed: 180, smsLimit: 500, delivered: 175, failed: 3, status: 'Normal' },
];

// ---------- Support Tickets ----------
export const supportTickets = [
  { id: 'TCK-2001', financer: 'Patel Finance Services', financerId: 'FIN-1001', subject: 'Unable to generate monthly report', category: 'Technical', priority: 'High', status: 'Open', created: '09-Aug-2026', assignedTo: 'Rahul K.', messages: [{ from: 'Suresh Patel', date: '09-Aug-2026 14:20', text: 'I am unable to generate the monthly collection report from the Reports page. It shows a loading spinner that never completes.' }] },
  { id: 'TCK-2002', financer: 'Apex Capital Services', financerId: 'FIN-1002', subject: 'Request plan upgrade from Standard to Premium', category: 'Billing', priority: 'Medium', status: 'In Progress', created: '08-Aug-2026', assignedTo: 'Priya S.', messages: [{ from: 'Vikram Mehta', date: '08-Aug-2026 10:15', text: 'We would like to upgrade our plan from Standard to Premium. Please guide us on the process and any prorated charges.' }, { from: 'Priya S. (Admin)', date: '08-Aug-2026 16:30', text: 'Hi Vikram, I have initiated the plan upgrade process. The prorated amount for the remaining period is ₹1,250. Please confirm to proceed.' }] },
  { id: 'TCK-2003', financer: 'Shree Ram Microfinance', financerId: 'FIN-1003', subject: 'SMS delivery failure for overdue reminders', category: 'SMS', priority: 'High', status: 'Open', created: '07-Aug-2026', assignedTo: 'Unassigned', messages: [{ from: 'Ramshankar Joshi', date: '07-Aug-2026 09:40', text: 'Our overdue payment SMS reminders are not being delivered since yesterday. We have verified our SMS balance is sufficient.' }] },
  { id: 'TCK-2004', financer: 'Bharat Nidhi Finance', financerId: 'FIN-1006', subject: 'Add new staff member with limited access', category: 'Account', priority: 'Low', status: 'Resolved', created: '05-Aug-2026', assignedTo: 'Rahul K.', messages: [{ from: 'Deepak Sharma', date: '05-Aug-2026 11:00', text: 'I need to add a new loan officer with access only to the Loans and Payments sections.' }, { from: 'Rahul K. (Admin)', date: '05-Aug-2026 15:45', text: 'Hi Deepak, role-based access has been configured. The new user can now log in with the credentials sent to their email.' }] },
  { id: 'TCK-2005', financer: 'Lakshmi Credit Co', financerId: 'FIN-1007', subject: 'Interest calculation discrepancy', category: 'Technical', priority: 'Critical', status: 'In Progress', created: '10-Aug-2026', assignedTo: 'Priya S.', messages: [{ from: 'K. Venkatesh', date: '10-Aug-2026 08:30', text: 'The interest calculation for loan LN-4521 seems incorrect. The expected monthly interest at 2% on ₹50,000 should be ₹1,000 but the system shows ₹1,050.' }] },
];

// ---------- Usage Analytics ----------
export const usageAnalyticsKpis = [
  { label: 'DAILY ACTIVE USERS', value: '342', change: '↑ 15% vs yesterday', changeType: 'positive', color: '#10AFE9', bg: 'rgba(16,175,233,0.1)' },
  { label: 'MONTHLY ACTIVE USERS', value: '1,850', change: '↑ 8% vs last month', changeType: 'positive', color: '#7D1FE8', bg: 'rgba(125,31,232,0.1)' },
  { label: 'API REQUESTS', value: '2.4M', change: 'This month', changeType: 'neutral', color: '#FF790B', bg: 'rgba(255,121,11,0.1)' },
  { label: 'PEAK USERS', value: '485', change: 'Today at 11:30 AM', changeType: 'neutral', color: '#EC008C', bg: 'rgba(236,0,140,0.1)' },
];

export const userGrowthData = [
  { month: 'Mar', users: 1200 },
  { month: 'Apr', users: 1350 },
  { month: 'May', users: 1480 },
  { month: 'Jun', users: 1600 },
  { month: 'Jul', users: 1720 },
  { month: 'Aug', users: 1850 },
];

export const loanActivityData = [
  { month: 'Mar', disbursed: 320, closed: 180 },
  { month: 'Apr', disbursed: 380, closed: 210 },
  { month: 'May', disbursed: 410, closed: 240 },
  { month: 'Jun', disbursed: 450, closed: 260 },
  { month: 'Jul', disbursed: 490, closed: 290 },
  { month: 'Aug', disbursed: 520, closed: 310 },
];

export const paymentActivityData = [
  { month: 'Mar', collected: 4500000, pending: 800000 },
  { month: 'Apr', collected: 5200000, pending: 750000 },
  { month: 'May', collected: 5800000, pending: 680000 },
  { month: 'Jun', collected: 6200000, pending: 720000 },
  { month: 'Jul', collected: 6800000, pending: 650000 },
  { month: 'Aug', collected: 7200000, pending: 600000 },
];

// ---------- Audit Logs ----------
export const auditLogs = [
  { id: 'AUD-001', timestamp: '10-Aug-2026 14:32', user: 'Super Admin', role: 'Super Admin', action: 'Login', resource: 'Admin Portal', ip: '192.168.1.101', status: 'Success', details: 'Successful login from Chrome/Windows' },
  { id: 'AUD-002', timestamp: '10-Aug-2026 14:15', user: 'Priya S.', role: 'Support', action: 'Ticket Updated', resource: 'TCK-2005', ip: '192.168.1.105', status: 'Success', details: 'Ticket status changed to In Progress' },
  { id: 'AUD-003', timestamp: '10-Aug-2026 13:45', user: 'Rahul K.', role: 'Admin', action: 'Financer Created', resource: 'FIN-1008', ip: '192.168.1.102', status: 'Success', details: 'New financer Ganesh Finance Ltd registered' },
  { id: 'AUD-004', timestamp: '10-Aug-2026 12:30', user: 'Super Admin', role: 'Super Admin', action: 'Settings Updated', resource: 'System Settings', ip: '192.168.1.101', status: 'Success', details: 'SMS daily limit updated to 50000' },
  { id: 'AUD-005', timestamp: '10-Aug-2026 11:20', user: 'Finance Ops', role: 'Finance Operations', action: 'Report Exported', resource: 'Revenue Report', ip: '192.168.1.108', status: 'Success', details: 'Monthly revenue report exported as PDF' },
  { id: 'AUD-006', timestamp: '09-Aug-2026 16:45', user: 'Super Admin', role: 'Super Admin', action: 'Financer Suspended', resource: 'FIN-1005', ip: '192.168.1.101', status: 'Success', details: 'Metro Loan Agency suspended due to KYC rejection' },
  { id: 'AUD-007', timestamp: '09-Aug-2026 15:30', user: 'Rahul K.', role: 'Admin', action: 'Plan Changed', resource: 'FIN-1003', ip: '192.168.1.102', status: 'Success', details: 'Plan changed from Basic to Standard' },
  { id: 'AUD-008', timestamp: '09-Aug-2026 14:10', user: 'Unknown', role: 'Unknown', action: 'Login', resource: 'Admin Portal', ip: '203.94.12.55', status: 'Failed', details: 'Failed login attempt - invalid credentials' },
  { id: 'AUD-009', timestamp: '09-Aug-2026 10:00', user: 'Priya S.', role: 'Support', action: 'Ticket Updated', resource: 'TCK-2002', ip: '192.168.1.105', status: 'Success', details: 'Reply sent to Apex Capital regarding plan upgrade' },
  { id: 'AUD-010', timestamp: '08-Aug-2026 17:30', user: 'Super Admin', role: 'Super Admin', action: 'Settings Updated', resource: 'Security Settings', ip: '192.168.1.101', status: 'Success', details: 'Session timeout changed to 30 minutes' },
];

// ---------- Reports List ----------
export const reportsList = [
  { id: 'rpt-1', title: 'Financer Report', description: 'Complete analysis of registered financers, KYC status, and activity metrics.', lastGenerated: '10-Aug-2026', icon: 'Building2' },
  { id: 'rpt-2', title: 'Customer Report', description: 'Cross-platform customer demographics, acquisition trends, and retention data.', lastGenerated: '09-Aug-2026', icon: 'Users' },
  { id: 'rpt-3', title: 'Loan Report', description: 'Loan disbursement, outstanding balance, default rates, and recovery metrics.', lastGenerated: '10-Aug-2026', icon: 'Banknote' },
  { id: 'rpt-4', title: 'Revenue Report', description: 'Monthly subscription revenue, platform fees, and payment processing income.', lastGenerated: '08-Aug-2026', icon: 'TrendingUp' },
  { id: 'rpt-5', title: 'Subscription Report', description: 'Plan distribution, renewal rates, churn analysis, and upgrade trends.', lastGenerated: '07-Aug-2026', icon: 'CreditCard' },
  { id: 'rpt-6', title: 'SMS Usage Report', description: 'SMS delivery statistics, failure rates, cost analysis by financer.', lastGenerated: '10-Aug-2026', icon: 'MessageSquare' },
  { id: 'rpt-7', title: 'Support Ticket Report', description: 'Ticket volume, resolution times, category distribution, and SLA compliance.', lastGenerated: '09-Aug-2026', icon: 'HelpCircle' },
  { id: 'rpt-8', title: 'Audit Activity Report', description: 'Administrative actions, login activity, security events, and compliance log.', lastGenerated: '10-Aug-2026', icon: 'Shield' },
];

// ============================================================
// BACKWARD-COMPATIBLE ALIASES
// ============================================================
// These aliases support existing Admin Portal components that
// still use the older mock* naming convention.

// ---------- Admin Dashboard ----------
export const mockAdminStats = {
  totalFinancers: 125,
  totalCustomers: 12450,
  totalLoans: 8320,
  totalDisbursed: 185000000,
  platformRevenue: 245000,
  pendingApprovals: 24,
  overdueLoans: 186,
  activeUsers: 342,
};

// ---------- Financers ----------
export const mockFinancersList = financersList;

// ---------- Platform Growth ----------
export const mockAdminPlatformGrowth = revenueData;