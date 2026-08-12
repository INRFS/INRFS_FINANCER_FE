// ============================================================
// INRFS ADMIN PORTAL — COMPREHENSIVE MOCK DATA
// ============================================================

import {
  Users,
  CreditCard,
  ReceiptIndianRupee,
  WalletCards,
  MessageSquare,
  TrendingUp,
  Percent,
  Activity,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

// ============================================================
// ADMIN DASHBOARD KPIs
// ============================================================

export const adminFinancialSummary = {
  totalPrincipal: 185000000,
  interestActivity: 850000,
  monthlyServiceCharges: 8500,
  collectedCharges: 5050,
  pendingCharges: 2790,
  overdueCharges: 189,
};

// ============================================================
// FINANCER USAGE MONITORING
// ============================================================

export const financerUsageData = [
  {
    financerId: 'FIN-1001',
    financerName: 'Patel Finance Services',
    registrationDate: '15-Jan-2025',
    lastLogin: '10-Aug-2026 14:10',
    customerCount: 250,
    loanCount: 180,
    transactionCount: 1250,
    smsActivity: 8500,
    status: 'Active',
    serviceChargeStatus: 'Paid',
  },
  {
    financerId: 'FIN-1002',
    financerName: 'Apex Capital Services',
    registrationDate: '22-Feb-2025',
    lastLogin: '10-Aug-2026 13:45',
    customerCount: 450,
    loanCount: 380,
    transactionCount: 2180,
    smsActivity: 10800,
    status: 'Active',
    serviceChargeStatus: 'Pending',
  },
  {
    financerId: 'FIN-1003',
    financerName: 'Shree Ram Microfinance',
    registrationDate: '05-Mar-2025',
    lastLogin: '09-Aug-2026 18:20',
    customerCount: 310,
    loanCount: 245,
    transactionCount: 1640,
    smsActivity: 6200,
    status: 'Active',
    serviceChargeStatus: 'Paid',
  },
  {
    financerId: 'FIN-1004',
    financerName: 'City FinCorp India',
    registrationDate: '18-Jun-2026',
    lastLogin: '08-Aug-2026 11:30',
    customerCount: 95,
    loanCount: 72,
    transactionCount: 420,
    smsActivity: 2400,
    status: 'Inactive',
    serviceChargeStatus: 'Pending',
  },
  {
    financerId: 'FIN-1005',
    financerName: 'Metro Loan Agency',
    registrationDate: '10-Apr-2025',
    lastLogin: '02-Aug-2026 10:15',
    customerCount: 180,
    loanCount: 0,
    transactionCount: 0,
    smsActivity: 0,
    status: 'Suspended',
    serviceChargeStatus: 'Overdue',
  },
  {
    financerId: 'FIN-1006',
    financerName: 'Bharat Nidhi Finance',
    registrationDate: '01-Jan-2025',
    lastLogin: '10-Aug-2026 12:50',
    customerCount: 520,
    loanCount: 410,
    transactionCount: 2950,
    smsActivity: 12400,
    status: 'Active',
    serviceChargeStatus: 'Paid',
  },
  {
    financerId: 'FIN-1007',
    financerName: 'Lakshmi Credit Co',
    registrationDate: '14-Feb-2025',
    lastLogin: '10-Aug-2026 11:40',
    customerCount: 210,
    loanCount: 165,
    transactionCount: 1100,
    smsActivity: 5100,
    status: 'Active',
    serviceChargeStatus: 'Pending',
  },
  {
    financerId: 'FIN-1008',
    financerName: 'Ganesh Finance Ltd',
    registrationDate: '25-Jul-2026',
    lastLogin: '09-Aug-2026 16:20',
    customerCount: 85,
    loanCount: 60,
    transactionCount: 380,
    smsActivity: 1800,
    status: 'Inactive',
    serviceChargeStatus: 'Pending',
  },
];

// ============================================================
// SERVICE CHARGE CONFIGURATION
// ============================================================

export const serviceChargeConfiguration = {
  defaultPercentage: 1.0,
  status: 'Active',
  effectiveDate: '01-Aug-2026',
};

export const financerServiceCharges = [
  {
    financerId: 'FIN-1001',
    financerName: 'Patel Finance Services',
    serviceChargePercentage: 1.0,
    effectiveDate: '01-Aug-2026',
    status: 'Active',
  },
  {
    financerId: 'FIN-1002',
    financerName: 'Apex Capital Services',
    serviceChargePercentage: 1.5,
    effectiveDate: '01-Aug-2026',
    status: 'Active',
  },
  {
    financerId: 'FIN-1003',
    financerName: 'Shree Ram Microfinance',
    serviceChargePercentage: 1.0,
    effectiveDate: '01-Aug-2026',
    status: 'Active',
  },
  {
    financerId: 'FIN-1006',
    financerName: 'Bharat Nidhi Finance',
    serviceChargePercentage: 1.0,
    effectiveDate: '01-Aug-2026',
    status: 'Active',
  },
  {
    financerId: 'FIN-1007',
    financerName: 'Lakshmi Credit Co',
    serviceChargePercentage: 1.0,
    effectiveDate: '01-Aug-2026',
    status: 'Active',
  },
];

// ============================================================
// SMS MANAGEMENT
// ============================================================

export const adminSMSStats = {
  sentToday: 2841,
  sentThisMonth: 85420,
  delivered: 83210,
  failed: 2210,
  creditsRemaining: 14545,
  platformCreditLimit: 100000,
};

export const adminSMSFinancerUsage = [
  {
    financerId: 'FIN-001',
    financer: 'Patel Finance Services',
    allocated: 2000,
    used: 1240,
    remaining: 760,
    usage: 62,
  },
  {
    financerId: 'FIN-002',
    financer: 'Singh Credit Solutions',
    allocated: 2000,
    used: 890,
    remaining: 1110,
    usage: 45,
  },
  {
    financerId: 'FIN-003',
    financer: 'Jain Money Solutions',
    allocated: 2000,
    used: 620,
    remaining: 1380,
    usage: 31,
  },
  {
    financerId: 'FIN-004',
    financer: 'Khan Financial',
    allocated: 2000,
    used: 450,
    remaining: 1550,
    usage: 23,
  },
  {
    financerId: 'FIN-005',
    financer: 'Sharma Money Lenders',
    allocated: 2000,
    used: 320,
    remaining: 1680,
    usage: 16,
  },
  {
    financerId: 'FIN-006',
    financer: 'Reddy Finance Corp',
    allocated: 500,
    used: 85,
    remaining: 415,
    usage: 17,
  },
  {
    financerId: 'FIN-007',
    financer: 'Verma Capital',
    allocated: 500,
    used: 40,
    remaining: 460,
    usage: 8,
  },
];

export const adminSMSActivity = [
  {
    activityId: 'SMS-2026-001',
    financer: 'Patel Finance Services',
    customer: 'Rajesh Kumar',
    mobile: '98XXXXXX21',
    messageType: 'Payment Reminder',
    dateTime: '11 Aug 2026, 10:42 AM',
    status: 'Delivered',
    reference: 'SMS-REF-78241',
    message:
      'Your upcoming loan payment is due. Please make the payment before the due date.',
  },
  {
    activityId: 'SMS-2026-002',
    financer: 'Singh Credit Solutions',
    customer: 'Priya Sharma',
    mobile: '97XXXXXX54',
    messageType: 'Payment Confirmation',
    dateTime: '11 Aug 2026, 10:18 AM',
    status: 'Delivered',
    reference: 'SMS-REF-78240',
    message:
      'Your loan payment has been successfully received. Thank you.',
  },
  {
    activityId: 'SMS-2026-003',
    financer: 'Jain Money Solutions',
    customer: 'Suresh Reddy',
    mobile: '99XXXXXX12',
    messageType: 'Overdue Reminder',
    dateTime: '11 Aug 2026, 09:54 AM',
    status: 'Failed',
    reference: 'SMS-REF-78239',
    message:
      'Your loan payment is overdue. Please contact your financer to regularise the account.',
  },
  {
    activityId: 'SMS-2026-004',
    financer: 'Khan Financial',
    customer: 'Anil Kumar',
    mobile: '96XXXXXX43',
    messageType: 'Payment Reminder',
    dateTime: '11 Aug 2026, 09:31 AM',
    status: 'Delivered',
    reference: 'SMS-REF-78238',
    message:
      'This is a reminder regarding your upcoming loan instalment.',
  },
  {
    activityId: 'SMS-2026-005',
    financer: 'Sharma Money Lenders',
    customer: 'Lakshmi Devi',
    mobile: '95XXXXXX67',
    messageType: 'Payment Confirmation',
    dateTime: '11 Aug 2026, 09:08 AM',
    status: 'Delivered',
    reference: 'SMS-REF-78237',
    message:
      'Your payment has been recorded successfully.',
  },
  {
    activityId: 'SMS-2026-006',
    financer: 'Reddy Finance Corp',
    customer: 'Venkatesh Rao',
    mobile: '94XXXXXX82',
    messageType: 'Overdue Reminder',
    dateTime: '11 Aug 2026, 08:46 AM',
    status: 'Pending',
    reference: 'SMS-REF-78236',
    message:
      'Your loan payment is currently overdue. Please make the required payment.',
  },
  {
    activityId: 'SMS-2026-007',
    financer: 'Verma Capital',
    customer: 'Meena Kumari',
    mobile: '93XXXXXX19',
    messageType: 'Payment Reminder',
    dateTime: '11 Aug 2026, 08:21 AM',
    status: 'Delivered',
    reference: 'SMS-REF-78235',
    message:
      'Your scheduled loan instalment is approaching its due date.',
  },
];

// ============================================================
// ADMIN REPORTS
// ============================================================

export const adminReports = [
  {
    id: 'financer-growth',
    title: 'Financer Growth Report',
    description: 'Registered and active financers',
    category: 'Financer',
    period: 'Monthly',
    periods: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    icon: Users,
    iconClass: 'inrfs-reports-card-icon--cyan',
    data: [
      { month: 'Mar', registered: 98, active: 89 },
      { month: 'Apr', registered: 105, active: 94 },
      { month: 'May', registered: 110, active: 98 },
      { month: 'Jun', registered: 112, active: 101 },
      { month: 'Jul', registered: 118, active: 106 },
      { month: 'Aug', registered: 125, active: 110 },
    ],
  },

  {
    id: 'customer-growth',
    title: 'Customer Growth Report',
    description: 'Customer acquisition and activity',
    category: 'Customer',
    period: 'Monthly',
    periods: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    icon: Users,
    iconClass: 'inrfs-reports-card-icon--purple',
    data: [
      { month: 'Mar', customers: 8500 },
      { month: 'Apr', customers: 9200 },
      { month: 'May', customers: 10100 },
      { month: 'Jun', customers: 10900 },
      { month: 'Jul', customers: 11700 },
      { month: 'Aug', customers: 12450 },
    ],
  },

  {
    id: 'loan-value',
    title: 'Loan Portfolio Report',
    description: 'Loan portfolio and disbursement value',
    category: 'Loan',
    period: 'Monthly',
    periods: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    icon: CreditCard,
    iconClass: 'inrfs-reports-card-icon--green',
    data: [
      { month: 'Mar', value: 125000000 },
      { month: 'Apr', value: 138000000 },
      { month: 'May', value: 149000000 },
      { month: 'Jun', value: 161000000 },
      { month: 'Jul', value: 174000000 },
      { month: 'Aug', value: 185000000 },
    ],
  },

  {
    id: 'collection-performance',
    title: 'Collection Performance',
    description: 'Collected and outstanding loan amounts',
    category: 'Collection',
    period: 'Monthly',
    periods: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    icon: ReceiptIndianRupee,
    iconClass: 'inrfs-reports-card-icon--green',
    data: [
      { month: 'Mar', collected: 28500000, outstanding: 12400000 },
      { month: 'Apr', collected: 31200000, outstanding: 11800000 },
      { month: 'May', collected: 33700000, outstanding: 10900000 },
      { month: 'Jun', collected: 35900000, outstanding: 9800000 },
      { month: 'Jul', collected: 39400000, outstanding: 9100000 },
      { month: 'Aug', collected: 42800000, outstanding: 8400000 },
    ],
  },

  {
    id: 'billing-service-charge',
    title: 'Billing & Service Charge Report',
    description: 'Monthly billing and INRFS service charges',
    category: 'Billing',
    period: 'Monthly',
    periods: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    icon: WalletCards,
    iconClass: 'inrfs-reports-card-icon--orange',
    data: [
      { month: 'Mar', amount: 1850000, serviceCharge: 185000 },
      { month: 'Apr', amount: 1940000, serviceCharge: 194000 },
      { month: 'May', amount: 2080000, serviceCharge: 208000 },
      { month: 'Jun', amount: 2190000, serviceCharge: 219000 },
      { month: 'Jul', amount: 2350000, serviceCharge: 235000 },
      { month: 'Aug', amount: 2480000, serviceCharge: 248000 },
    ],
  },

  {
    id: 'sms-usage',
    title: 'SMS Usage Report',
    description: 'Monthly SMS usage and delivery',
    category: 'SMS',
    period: 'Monthly',
    periods: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    icon: MessageSquare,
    iconClass: 'inrfs-reports-card-icon--pink',
    data: [
      { month: 'Mar', sent: 58000 },
      { month: 'Apr', sent: 63000 },
      { month: 'May', sent: 69000 },
      { month: 'Jun', sent: 74000 },
      { month: 'Jul', sent: 79000 },
      { month: 'Aug', sent: 85420 },
    ],
  },

  {
    id: 'subscription-revenue',
    title: 'Subscription Revenue',
    description: 'Monthly recurring subscription revenue',
    category: 'Platform',
    period: 'Monthly',
    periods: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    icon: TrendingUp,
    iconClass: 'inrfs-reports-card-icon--orange',
    data: [
      { month: 'Mar', revenue: 180000 },
      { month: 'Apr', revenue: 190000 },
      { month: 'May', revenue: 205000 },
      { month: 'Jun', revenue: 215000 },
      { month: 'Jul', revenue: 230000 },
      { month: 'Aug', revenue: 245000 },
    ],
  },

  {
    id: 'interest-activity',
    title: 'Interest Activity',
    description: 'Interest generated across loans',
    category: 'Loan',
    period: 'Monthly',
    periods: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    icon: Percent,
    iconClass: 'inrfs-reports-card-icon--yellow',
    data: [
      { month: 'Mar', interest: 420000 },
      { month: 'Apr', interest: 470000 },
      { month: 'May', interest: 520000 },
      { month: 'Jun', interest: 560000 },
      { month: 'Jul', interest: 610000 },
      { month: 'Aug', interest: 680000 },
    ],
  },

  {
    id: 'active-inactive',
    title: 'Active vs Inactive',
    description: 'Financer activity status',
    category: 'Financer',
    period: 'Current',
    periods: ['Aug'],
    icon: Activity,
    iconClass: 'inrfs-reports-card-icon--gray',
    data: [
      { type: 'Active', count: 110 },
      { type: 'Inactive', count: 15 },
    ],
  },

  {
    id: 'platform-health',
    title: 'Platform Health',
    description: 'System health and compliance overview',
    category: 'Platform',
    period: 'Current',
    periods: ['Aug'],
    icon: ShieldCheck,
    iconClass: 'inrfs-reports-card-icon--red',
    data: [
      { metric: 'System Uptime', value: '99.9%' },
      { metric: 'KYC Compliance', value: '96%' },
      { metric: 'Active Services', value: '100%' },
      { metric: 'Failed Jobs', value: '2' },
    ],
  },

  {
    id: 'platform-growth',
    title: 'Platform Growth Trend',
    description: 'Financers, customers and loan accounts',
    category: 'Platform',
    period: 'Monthly',
    periods: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    icon: BarChart3,
    iconClass: 'inrfs-reports-card-icon--blue',
    data: [
      { month: 'Mar', financers: 98, customers: 8500, loans: 4200 },
      { month: 'Apr', financers: 105, customers: 9200, loans: 4550 },
      { month: 'May', financers: 110, customers: 10100, loans: 4980 },
      { month: 'Jun', financers: 112, customers: 10900, loans: 5350 },
      { month: 'Jul', financers: 118, customers: 11700, loans: 5740 },
      { month: 'Aug', financers: 125, customers: 12450, loans: 6210 },
    ],
  },
];

// ============================================================
// COLLECTIONS
// ============================================================

export const collectionsData = [
  {
    id: 'COL-1001',
    financer: 'Patel Finance Services',
    customer: 'Ravi Kumar',
    loanId: 'LN-10021',
    collectionDate: '2026-08-01',
    amountCollected: 12500,
    paymentReference: 'PAY-874521',
    settlementStatus: 'Settled',
  },
  {
    id: 'COL-1002',
    financer: 'Singh Credit Solutions',
    customer: 'Priya Sharma',
    loanId: 'LN-10034',
    collectionDate: '2026-08-02',
    amountCollected: 18000,
    paymentReference: 'PAY-874522',
    settlementStatus: 'Settled',
  },
  {
    id: 'COL-1003',
    financer: 'Jain Money Solutions',
    customer: 'Arun Reddy',
    loanId: 'LN-10048',
    collectionDate: '2026-08-03',
    amountCollected: 9500,
    paymentReference: 'PAY-874523',
    settlementStatus: 'Pending',
  },
  {
    id: 'COL-1004',
    financer: 'Khan Financial',
    customer: 'Sneha Patel',
    loanId: 'LN-10056',
    collectionDate: '2026-08-04',
    amountCollected: 22000,
    paymentReference: 'PAY-874524',
    settlementStatus: 'Settled',
  },
  {
    id: 'COL-1005',
    financer: 'Sharma Money Lenders',
    customer: 'Vijay Singh',
    loanId: 'LN-10063',
    collectionDate: '2026-08-05',
    amountCollected: 7500,
    paymentReference: 'PAY-874525',
    settlementStatus: 'Pending',
  },
  {
    id: 'COL-1006',
    financer: 'Reddy Finance Corp',
    customer: 'Lakshmi Devi',
    loanId: 'LN-10071',
    collectionDate: '2026-08-06',
    amountCollected: 15000,
    paymentReference: 'PAY-874526',
    settlementStatus: 'Settled',
  },
  {
    id: 'COL-1007',
    financer: 'Verma Capital',
    customer: 'Kiran Rao',
    loanId: 'LN-10082',
    collectionDate: '2026-08-07',
    amountCollected: 11000,
    paymentReference: 'PAY-874527',
    settlementStatus: 'Overdue',
  },
];

// ============================================================
// MONTHLY BILLING
// ============================================================

export const monthlyBillingData = [
  {
    financerId: 'FIN-1001',
    financerName: 'Patel Finance Services',
    billingMonth: 'August 2026',
    customerLoanActivity: 430,
    applicableInterest: 850000,
    serviceChargePercentage: 1.0,
    serviceCharge: 8500,
    amountCollected: 5050,
    outstandingAmount: 3450,
    settlementStatus: 'Partially Paid',
  },
  {
    financerId: 'FIN-1002',
    financerName: 'Apex Capital Services',
    billingMonth: 'August 2026',
    customerLoanActivity: 830,
    applicableInterest: 1250000,
    serviceChargePercentage: 1.5,
    serviceCharge: 18750,
    amountCollected: 18750,
    outstandingAmount: 0,
    settlementStatus: 'Paid',
  },
  {
    financerId: 'FIN-1003',
    financerName: 'Shree Ram Microfinance',
    billingMonth: 'August 2026',
    customerLoanActivity: 555,
    applicableInterest: 720000,
    serviceChargePercentage: 1.0,
    serviceCharge: 7200,
    amountCollected: 7200,
    outstandingAmount: 0,
    settlementStatus: 'Paid',
  },
  {
    financerId: 'FIN-1006',
    financerName: 'Bharat Nidhi Finance',
    billingMonth: 'August 2026',
    customerLoanActivity: 930,
    applicableInterest: 1450000,
    serviceChargePercentage: 1.0,
    serviceCharge: 14500,
    amountCollected: 9000,
    outstandingAmount: 5500,
    settlementStatus: 'Partially Paid',
  },
  {
    financerId: 'FIN-1007',
    financerName: 'Lakshmi Credit Co',
    billingMonth: 'August 2026',
    customerLoanActivity: 375,
    applicableInterest: 560000,
    serviceChargePercentage: 1.0,
    serviceCharge: 5600,
    amountCollected: 0,
    outstandingAmount: 5600,
    settlementStatus: 'Pending',
  },
];

// ============================================================
// SERVICE CHARGE COLLECTIONS
// ============================================================

export const collectionData = [
  {
    id: 'COL-1001',
    financerId: 'FIN-1001',
    financerName: 'Patel Finance Services',
    billingMonth: 'August 2026',
    amountDue: 8500,
    amountReceived: 5050,
    outstandingAmount: 3450,
    paymentDate: '10-Aug-2026',
    paymentMethod: 'Bank Transfer',
    transactionReference: 'TXN-89001',
    status: 'Partially Paid',
    notes: 'Balance pending for settlement.',
  },
  {
    id: 'COL-1002',
    financerId: 'FIN-1002',
    financerName: 'Apex Capital Services',
    billingMonth: 'August 2026',
    amountDue: 18750,
    amountReceived: 18750,
    outstandingAmount: 0,
    paymentDate: '08-Aug-2026',
    paymentMethod: 'UPI',
    transactionReference: 'TXN-89002',
    status: 'Paid',
    notes: '',
  },
  {
    id: 'COL-1003',
    financerId: 'FIN-1003',
    financerName: 'Shree Ram Microfinance',
    billingMonth: 'August 2026',
    amountDue: 7200,
    amountReceived: 7200,
    outstandingAmount: 0,
    paymentDate: '07-Aug-2026',
    paymentMethod: 'Bank Transfer',
    transactionReference: 'TXN-89003',
    status: 'Paid',
    notes: '',
  },
  {
    id: 'COL-1004',
    financerId: 'FIN-1006',
    financerName: 'Bharat Nidhi Finance',
    billingMonth: 'August 2026',
    amountDue: 14500,
    amountReceived: 9000,
    outstandingAmount: 5500,
    paymentDate: '10-Aug-2026',
    paymentMethod: 'UPI',
    transactionReference: 'TXN-89004',
    status: 'Partially Paid',
    notes: 'Remaining amount to be collected.',
  },
  {
    id: 'COL-1005',
    financerId: 'FIN-1007',
    financerName: 'Lakshmi Credit Co',
    billingMonth: 'August 2026',
    amountDue: 5600,
    amountReceived: 0,
    outstandingAmount: 5600,
    paymentDate: null,
    paymentMethod: null,
    transactionReference: null,
    status: 'Pending',
    notes: 'Collection not yet received.',
  },
];

// ============================================================
// DASHBOARD CHART DATA
// ============================================================

export const financerGrowthData = [
  { month: 'Mar', count: 95 },
  { month: 'Apr', count: 102 },
  { month: 'May', count: 108 },
  { month: 'Jun', count: 114 },
  { month: 'Jul', count: 119 },
  { month: 'Aug', count: 125 },
];

export const platformGrowthData = [
  { month: 'Mar', customers: 8200, loans: 5400 },
  { month: 'Apr', customers: 9100, loans: 6100 },
  { month: 'May', customers: 9800, loans: 6700 },
  { month: 'Jun', customers: 10600, loans: 7200 },
  { month: 'Jul', customers: 11500, loans: 7800 },
  { month: 'Aug', customers: 12450, loans: 8320 },
];

export const revenueData = [
  { month: 'Mar', revenue: 185000 },
  { month: 'Apr', revenue: 198000 },
  { month: 'May', revenue: 210000 },
  { month: 'Jun', revenue: 225000 },
  { month: 'Jul', revenue: 235000 },
  { month: 'Aug', revenue: 245000 },
];

// ============================================================
// FINANCERS LIST
// ============================================================

export const financersList = [
  {
    id: 'FIN-1001',
    name: 'Patel Finance Services',
    owner: 'Suresh Patel',
    email: 'suresh@patelfinance.in',
    mobile: '+91 98765 43210',
    city: 'Ahmedabad',
    state: 'Gujarat',
    plan: 'Premium',
    customers: 250,
    activeLoans: 180,
    totalDisbursed: 18500000,
    outstanding: 12400000,
    status: 'Active',
    registeredDate: '15-Jan-2025',
    kycStatus: 'Verified',
  },
  {
    id: 'FIN-1002',
    name: 'Apex Capital Services',
    owner: 'Vikram Mehta',
    email: 'vikram@apexcapital.com',
    mobile: '+91 87654 32109',
    city: 'Mumbai',
    state: 'Maharashtra',
    plan: 'Premium',
    customers: 450,
    activeLoans: 380,
    totalDisbursed: 62000000,
    outstanding: 41000000,
    status: 'Active',
    registeredDate: '22-Feb-2025',
    kycStatus: 'Verified',
  },
  {
    id: 'FIN-1003',
    name: 'Shree Ram Microfinance',
    owner: 'Ramshankar Joshi',
    email: 'ram@shreeram.co.in',
    mobile: '+91 76543 21098',
    city: 'Jaipur',
    state: 'Rajasthan',
    plan: 'Standard',
    customers: 310,
    activeLoans: 245,
    totalDisbursed: 34000000,
    outstanding: 22000000,
    status: 'Active',
    registeredDate: '05-Mar-2025',
    kycStatus: 'Verified',
  },
  {
    id: 'FIN-1004',
    name: 'City FinCorp India',
    owner: 'Anil Agarwal',
    email: 'anil@cityfincorp.in',
    mobile: '+91 65432 10987',
    city: 'Surat',
    state: 'Gujarat',
    plan: 'Basic',
    customers: 95,
    activeLoans: 72,
    totalDisbursed: 11000000,
    outstanding: 8500000,
    status: 'Pending',
    registeredDate: '18-Jun-2026',
    kycStatus: 'Pending',
  },
  {
    id: 'FIN-1005',
    name: 'Metro Loan Agency',
    owner: 'Sunil Rao',
    email: 'sunil@metroloan.com',
    mobile: '+91 54321 09876',
    city: 'Bengaluru',
    state: 'Karnataka',
    plan: 'Standard',
    customers: 180,
    activeLoans: 0,
    totalDisbursed: 0,
    outstanding: 0,
    status: 'Suspended',
    registeredDate: '10-Apr-2025',
    kycStatus: 'Rejected',
  },
  {
    id: 'FIN-1006',
    name: 'Bharat Nidhi Finance',
    owner: 'Deepak Sharma',
    email: 'deepak@bharatnidhi.in',
    mobile: '+91 99887 76655',
    city: 'Delhi',
    state: 'Delhi',
    plan: 'Premium',
    customers: 520,
    activeLoans: 410,
    totalDisbursed: 78000000,
    outstanding: 52000000,
    status: 'Active',
    registeredDate: '01-Jan-2025',
    kycStatus: 'Verified',
  },
  {
    id: 'FIN-1007',
    name: 'Lakshmi Credit Co',
    owner: 'K. Venkatesh',
    email: 'venkatesh@lakshmicredit.com',
    mobile: '+91 88776 65544',
    city: 'Hyderabad',
    state: 'Telangana',
    plan: 'Standard',
    customers: 210,
    activeLoans: 165,
    totalDisbursed: 25000000,
    outstanding: 18000000,
    status: 'Active',
    registeredDate: '14-Feb-2025',
    kycStatus: 'Verified',
  },
  {
    id: 'FIN-1008',
    name: 'Ganesh Finance Ltd',
    owner: 'Mohan Pillai',
    email: 'mohan@ganeshfin.co.in',
    mobile: '+91 77665 54433',
    city: 'Chennai',
    state: 'Tamil Nadu',
    plan: 'Basic',
    customers: 85,
    activeLoans: 60,
    totalDisbursed: 9000000,
    outstanding: 6500000,
    status: 'Pending',
    registeredDate: '25-Jul-2026',
    kycStatus: 'Pending',
  },
];

// ============================================================
// SUBSCRIPTION PLANS
// ============================================================

export const subscriptionPlans = [
  {
    name: 'Basic',
    price: '₹999',
    period: '/month',
    features: [
      'Up to 100 customers',
      'Up to 200 loans',
      '500 SMS/month',
      'Basic reports',
      'Email support',
    ],
    financerLimit: 100,
    customerLimit: 100,
    smsLimit: 500,
    highlight: false,
  },
  {
    name: 'Standard',
    price: '₹2,499',
    period: '/month',
    features: [
      'Up to 500 customers',
      'Up to 1000 loans',
      '2000 SMS/month',
      'Advanced reports',
      'Priority support',
      'Customer ledger',
    ],
    financerLimit: 500,
    customerLimit: 500,
    smsLimit: 2000,
    highlight: false,
  },
  {
    name: 'Premium',
    price: '₹4,999',
    period: '/month',
    features: [
      'Unlimited customers',
      'Unlimited loans',
      '10000 SMS/month',
      'All reports & analytics',
      'Dedicated support',
      'White-label options',
      'API access',
    ],
    financerLimit: -1,
    customerLimit: -1,
    smsLimit: 10000,
    highlight: true,
  },
];

// ============================================================
// FINANCER SUBSCRIPTIONS
// ============================================================

export const financerSubscriptions = [
  {
    financer: 'Patel Finance Services',
    plan: 'Premium',
    startDate: '15-Jan-2025',
    renewalDate: '15-Jan-2027',
    status: 'Active',
    amount: '₹4,999',
  },
  {
    financer: 'Apex Capital Services',
    plan: 'Premium',
    startDate: '22-Feb-2025',
    renewalDate: '22-Feb-2027',
    status: 'Active',
    amount: '₹4,999',
  },
  {
    financer: 'Shree Ram Microfinance',
    plan: 'Standard',
    startDate: '05-Mar-2025',
    renewalDate: '05-Mar-2027',
    status: 'Active',
    amount: '₹2,499',
  },
  {
    financer: 'City FinCorp India',
    plan: 'Basic',
    startDate: '18-Jun-2026',
    renewalDate: '18-Jun-2027',
    status: 'Pending',
    amount: '₹999',
  },
  {
    financer: 'Bharat Nidhi Finance',
    plan: 'Premium',
    startDate: '01-Jan-2025',
    renewalDate: '01-Jan-2027',
    status: 'Active',
    amount: '₹4,999',
  },
  {
    financer: 'Lakshmi Credit Co',
    plan: 'Standard',
    startDate: '14-Feb-2025',
    renewalDate: '14-Feb-2027',
    status: 'Active',
    amount: '₹2,499',
  },
  {
    financer: 'Ganesh Finance Ltd',
    plan: 'Basic',
    startDate: '25-Jul-2026',
    renewalDate: '25-Jul-2027',
    status: 'Pending',
    amount: '₹999',
  },
];

// ============================================================
// SMS MANAGEMENT
// ============================================================

export const smsKpis = [
  {
    label: 'TOTAL SMS SENT',
    value: '85,420',
    color: '#071D43',
    bg: 'rgba(7,29,67,0.08)',
  },
  {
    label: 'DELIVERED',
    value: '82,150',
    color: '#7BD000',
    bg: 'rgba(123,208,0,0.1)',
  },
  {
    label: 'FAILED',
    value: '1,820',
    color: '#FF4A4F',
    bg: 'rgba(255,74,79,0.1)',
  },
  {
    label: 'PENDING',
    value: '1,450',
    color: '#FFB800',
    bg: 'rgba(255,184,0,0.1)',
  },
  {
    label: 'SMS COST',
    value: '₹25,626',
    color: '#7D1FE8',
    bg: 'rgba(125,31,232,0.1)',
  },
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
  {
    financer: 'Patel Finance Services',
    plan: 'Premium',
    smsUsed: 8500,
    smsLimit: 10000,
    delivered: 8200,
    failed: 180,
    status: 'Normal',
  },
  {
    financer: 'Apex Capital Services',
    plan: 'Premium',
    smsUsed: 10800,
    smsLimit: 10000,
    delivered: 10500,
    failed: 200,
    status: 'Exceeded',
  },
  {
    financer: 'Shree Ram Microfinance',
    plan: 'Standard',
    smsUsed: 1800,
    smsLimit: 2000,
    delivered: 1750,
    failed: 30,
    status: 'Warning',
  },
  {
    financer: 'Bharat Nidhi Finance',
    plan: 'Premium',
    smsUsed: 12400,
    smsLimit: 10000,
    delivered: 12100,
    failed: 180,
    status: 'Exceeded',
  },
  {
    financer: 'Lakshmi Credit Co',
    plan: 'Standard',
    smsUsed: 1200,
    smsLimit: 2000,
    delivered: 1180,
    failed: 12,
    status: 'Normal',
  },
  {
    financer: 'City FinCorp India',
    plan: 'Basic',
    smsUsed: 420,
    smsLimit: 500,
    delivered: 410,
    failed: 8,
    status: 'Warning',
  },
  {
    financer: 'Ganesh Finance Ltd',
    plan: 'Basic',
    smsUsed: 180,
    smsLimit: 500,
    delivered: 175,
    failed: 3,
    status: 'Normal',
  },
];

// ============================================================
// SUPPORT TICKETS
// ============================================================

export const supportTickets = [
  {
    id: 'TCK-2001',
    financer: 'Patel Finance Services',
    financerId: 'FIN-1001',
    subject: 'Unable to generate monthly report',
    category: 'Technical',
    priority: 'High',
    status: 'Open',
    created: '09-Aug-2026',
    assignedTo: 'Rahul K.',
    messages: [
      {
        from: 'Suresh Patel',
        date: '09-Aug-2026 14:20',
        text: 'I am unable to generate the monthly collection report from the Reports page. It shows a loading spinner that never completes.',
      },
    ],
  },
  {
    id: 'TCK-2002',
    financer: 'Apex Capital Services',
    financerId: 'FIN-1002',
    subject: 'Request plan upgrade from Standard to Premium',
    category: 'Billing',
    priority: 'Medium',
    status: 'In Progress',
    created: '08-Aug-2026',
    assignedTo: 'Priya S.',
    messages: [
      {
        from: 'Vikram Mehta',
        date: '08-Aug-2026 10:15',
        text: 'We would like to upgrade our plan from Standard to Premium. Please guide us on the process and any prorated charges.',
      },
      {
        from: 'Priya S. (Admin)',
        date: '08-Aug-2026 16:30',
        text: 'Hi Vikram, I have initiated the plan upgrade process. The prorated amount for the remaining period is ₹1,250. Please confirm to proceed.',
      },
    ],
  },
  {
    id: 'TCK-2003',
    financer: 'Shree Ram Microfinance',
    financerId: 'FIN-1003',
    subject: 'SMS delivery failure for overdue reminders',
    category: 'SMS',
    priority: 'High',
    status: 'Open',
    created: '07-Aug-2026',
    assignedTo: 'Unassigned',
    messages: [
      {
        from: 'Ramshankar Joshi',
        date: '07-Aug-2026 09:40',
        text: 'Our overdue payment SMS reminders are not being delivered since yesterday. We have verified our SMS balance is sufficient.',
      },
    ],
  },
  {
    id: 'TCK-2004',
    financer: 'Bharat Nidhi Finance',
    financerId: 'FIN-1006',
    subject: 'Add new staff member with limited access',
    category: 'Account',
    priority: 'Low',
    status: 'Resolved',
    created: '05-Aug-2026',
    assignedTo: 'Rahul K.',
    messages: [
      {
        from: 'Deepak Sharma',
        date: '05-Aug-2026 11:00',
        text: 'I need to add a new loan officer with access only to the Loans and Payments sections.',
      },
      {
        from: 'Rahul K. (Admin)',
        date: '05-Aug-2026 15:45',
        text: 'Hi Deepak, role-based access has been configured. The new user can now log in with the credentials sent to their email.',
      },
    ],
  },
  {
    id: 'TCK-2005',
    financer: 'Lakshmi Credit Co',
    financerId: 'FIN-1007',
    subject: 'Interest calculation discrepancy',
    category: 'Technical',
    priority: 'Critical',
    status: 'In Progress',
    created: '10-Aug-2026',
    assignedTo: 'Priya S.',
    messages: [
      {
        from: 'K. Venkatesh',
        date: '10-Aug-2026 08:30',
        text: 'The interest calculation for loan LN-4521 seems incorrect. The expected monthly interest at 2% on ₹50,000 should be ₹1,000 but the system shows ₹1,050.',
      },
    ],
  },
];

// ============================================================
// USAGE ANALYTICS
// ============================================================

export const usageAnalyticsKpis = [
  {
    label: 'DAILY ACTIVE USERS',
    value: '342',
    change: '↑ 15% vs yesterday',
    changeType: 'positive',
    color: '#10AFE9',
    bg: 'rgba(16,175,233,0.1)',
  },
  {
    label: 'MONTHLY ACTIVE USERS',
    value: '1,850',
    change: '↑ 8% vs last month',
    changeType: 'positive',
    color: '#7D1FE8',
    bg: 'rgba(125,31,232,0.1)',
  },
  {
    label: 'API REQUESTS',
    value: '2.4M',
    change: 'This month',
    changeType: 'neutral',
    color: '#FF790B',
    bg: 'rgba(255,121,11,0.1)',
  },
  {
    label: 'PEAK USERS',
    value: '485',
    change: 'Today at 11:30 AM',
    changeType: 'neutral',
    color: '#EC008C',
    bg: 'rgba(236,0,140,0.1)',
  },
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

// ============================================================
// AUDIT LOGS
// ============================================================

export const auditLogs = [
  {
    id: 'AUD-001',
    timestamp: '10-Aug-2026 14:32',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Login',
    resource: 'Admin Portal',
    ip: '192.168.1.101',
    status: 'Success',
    details: 'Successful login from Chrome/Windows',
  },
  {
    id: 'AUD-002',
    timestamp: '10-Aug-2026 14:15',
    user: 'Priya S.',
    role: 'Support',
    action: 'Ticket Updated',
    resource: 'TCK-2005',
    ip: '192.168.1.105',
    status: 'Success',
    details: 'Ticket status changed to In Progress',
  },
  {
    id: 'AUD-003',
    timestamp: '10-Aug-2026 13:45',
    user: 'Rahul K.',
    role: 'Admin',
    action: 'Financer Created',
    resource: 'FIN-1008',
    ip: '192.168.1.102',
    status: 'Success',
    details: 'New financer Ganesh Finance Ltd registered',
  },
  {
    id: 'AUD-004',
    timestamp: '10-Aug-2026 12:30',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Settings Updated',
    resource: 'System Settings',
    ip: '192.168.1.101',
    status: 'Success',
    details: 'SMS daily limit updated to 50000',
  },
  {
    id: 'AUD-005',
    timestamp: '10-Aug-2026 11:20',
    user: 'Finance Ops',
    role: 'Finance Operations',
    action: 'Report Exported',
    resource: 'Revenue Report',
    ip: '192.168.1.108',
    status: 'Success',
    details: 'Monthly revenue report exported as PDF',
  },
  {
    id: 'AUD-006',
    timestamp: '09-Aug-2026 16:45',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Financer Suspended',
    resource: 'FIN-1005',
    ip: '192.168.1.101',
    status: 'Success',
    details: 'Metro Loan Agency suspended due to KYC rejection',
  },
  {
    id: 'AUD-007',
    timestamp: '09-Aug-2026 15:30',
    user: 'Rahul K.',
    role: 'Admin',
    action: 'Plan Changed',
    resource: 'FIN-1003',
    ip: '192.168.1.102',
    status: 'Success',
    details: 'Plan changed from Basic to Standard',
  },
  {
    id: 'AUD-008',
    timestamp: '09-Aug-2026 14:10',
    user: 'Unknown',
    role: 'Unknown',
    action: 'Login',
    resource: 'Admin Portal',
    ip: '203.94.12.55',
    status: 'Failed',
    details: 'Failed login attempt - invalid credentials',
  },
  {
    id: 'AUD-009',
    timestamp: '09-Aug-2026 10:00',
    user: 'Priya S.',
    role: 'Support',
    action: 'Ticket Updated',
    resource: 'TCK-2002',
    ip: '192.168.1.105',
    status: 'Success',
    details: 'Reply sent to Apex Capital regarding plan upgrade',
  },
  {
    id: 'AUD-010',
    timestamp: '08-Aug-2026 17:30',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Settings Updated',
    resource: 'Security Settings',
    ip: '192.168.1.101',
    status: 'Success',
    details: 'Session timeout changed to 30 minutes',
  },
];

// ============================================================
// REPORTS LIST
// ============================================================

export const reportsList = [
  {
    id: 'rpt-1',
    title: 'Financer Report',
    description:
      'Complete analysis of registered financers, KYC status, and activity metrics.',
    lastGenerated: '10-Aug-2026',
    icon: 'Building2',
  },
  {
    id: 'rpt-2',
    title: 'Customer Report',
    description:
      'Cross-platform customer demographics, acquisition trends, and retention data.',
    lastGenerated: '09-Aug-2026',
    icon: 'Users',
  },
  {
    id: 'rpt-3',
    title: 'Loan Report',
    description:
      'Loan disbursement, outstanding balance, default rates, and recovery metrics.',
    lastGenerated: '10-Aug-2026',
    icon: 'Banknote',
  },
  {
    id: 'rpt-4',
    title: 'Revenue Report',
    description:
      'Monthly subscription revenue, platform fees, and payment processing income.',
    lastGenerated: '08-Aug-2026',
    icon: 'TrendingUp',
  },
  {
    id: 'rpt-5',
    title: 'Subscription Report',
    description:
      'Plan distribution, renewal rates, churn analysis, and upgrade trends.',
    lastGenerated: '07-Aug-2026',
    icon: 'CreditCard',
  },
  {
    id: 'rpt-6',
    title: 'SMS Usage Report',
    description:
      'SMS delivery statistics, failure rates, cost analysis by financer.',
    lastGenerated: '10-Aug-2026',
    icon: 'MessageSquare',
  },
  {
    id: 'rpt-7',
    title: 'Support Ticket Report',
    description:
      'Ticket volume, resolution times, category distribution, and SLA compliance.',
    lastGenerated: '09-Aug-2026',
    icon: 'HelpCircle',
  },
  {
    id: 'rpt-8',
    title: 'Audit Activity Report',
    description:
      'Administrative actions, login activity, security events, and compliance log.',
    lastGenerated: '10-Aug-2026',
    icon: 'Shield',
  },
];

// ============================================================
// BACKWARD-COMPATIBLE ALIASES
// ============================================================

export const mockAdminFinancialSummary = adminFinancialSummary;

export const mockFinancerUsageData = financerUsageData;

export const mockServiceChargeConfiguration =
  serviceChargeConfiguration;

export const mockFinancerServiceCharges =
  financerServiceCharges;

export const mockAdminSMSStats = adminSMSStats;

export const mockAdminSMSFinancerUsage =
  adminSMSFinancerUsage;

export const mockAdminSMSActivity =
  adminSMSActivity;

export const mockAdminReports = adminReports;

export const mockCollectionsData =
  collectionsData;

export const mockCollectionData =
  collectionData;

export const mockMonthlyBillingData =
  monthlyBillingData;

export const mockFinancerGrowthData =
  financerGrowthData;

export const mockPlatformGrowthData =
  platformGrowthData;

export const mockRevenueData =
  revenueData;

export const mockFinancerSubscriptions =
  financerSubscriptions;

export const mockSubscriptionPlans =
  subscriptionPlans;

export const mockSMSKpis = smsKpis;

export const mockSmsKpis = smsKpis;

export const mockSMSUsageByFinancer =
  smsUsageByFinancer;

export const mockSmsUsageByFinancer =
  smsUsageByFinancer;

export const mockSMSUsageTable =
  smsUsageTable;

export const mockSmsUsageTable =
  smsUsageTable;

export const mockSupportTickets =
  supportTickets;

export const mockUsageAnalyticsKpis =
  usageAnalyticsKpis;

export const mockUserGrowthData =
  userGrowthData;

export const mockLoanActivityData =
  loanActivityData;

export const mockPaymentActivityData =
  paymentActivityData;

export const mockAuditLogs =
  auditLogs;

export const mockReportsList =
  reportsList;

// ============================================================
// ADMIN DASHBOARD
// ============================================================

export const mockAdminStats = {
  totalFinancers: 125,
  activeFinancers: 110,
  inactiveFinancers: 15,

  totalCustomers: 12450,

  totalLoans: 12500,

  totalPrincipal: 185000000,
  totalDisbursed: 185000000,

  interestActivity: 850000,

  monthlyServiceCharges: 8500,
  collectedCharges: 5050,
  pendingCharges: 2790,
  overdueCharges: 189,

  pendingApprovals: 24,
  overdueLoans: 186,
  activeUsers: 342,

  platformRevenue: 245000,
};

// ============================================================
// FINANCERS
// ============================================================

export const mockFinancersList = [
  {
    id: 'FIN-1001',
    name: 'Patel Finance Services',
    owner: 'Suresh Patel',
    city: 'Ahmedabad',
    kycStatus: 'Verified',
    status: 'Active',

    totalCustomers: 250,
    activeLoans: 180,
    totalPrincipal: 18500000,
    totalInterest: 2850000,
    monthlyInterest: 285000,
    serviceChargePercentage: 1,
    serviceChargeStatus: 'Pending',

    customers: [
      {
        id: 'CUS-1001',
        name: 'Ramesh Kumar',
        phone: '9876543210',
        activeLoans: 2,
        outstanding: 85000,
        status: 'Active',
      },
      {
        id: 'CUS-1002',
        name: 'Meena Shah',
        phone: '9876543211',
        activeLoans: 1,
        outstanding: 42000,
        status: 'Active',
      },
      {
        id: 'CUS-1003',
        name: 'Arjun Patel',
        phone: '9876543212',
        activeLoans: 3,
        outstanding: 126000,
        status: 'Active',
      },
      {
        id: 'CUS-1004',
        name: 'Kavita Joshi',
        phone: '9876543213',
        activeLoans: 1,
        outstanding: 31000,
        status: 'Active',
      },
      {
        id: 'CUS-1005',
        name: 'Nitin Mehta',
        phone: '9876543214',
        activeLoans: 2,
        outstanding: 74000,
        status: 'Pending',
      },
    ],

    loans: [
      {
        id: 'LN-1001',
        customerName: 'Ramesh Kumar',
        principal: 50000,
        interest: 5000,
        outstanding: 42000,
        status: 'Active',
      },
      {
        id: 'LN-1002',
        customerName: 'Meena Shah',
        principal: 60000,
        interest: 6000,
        outstanding: 42000,
        status: 'Active',
      },
      {
        id: 'LN-1003',
        customerName: 'Arjun Patel',
        principal: 100000,
        interest: 10000,
        outstanding: 84000,
        status: 'Active',
      },
      {
        id: 'LN-1004',
        customerName: 'Kavita Joshi',
        principal: 40000,
        interest: 4000,
        outstanding: 31000,
        status: 'Active',
      },
      {
        id: 'LN-1005',
        customerName: 'Nitin Mehta',
        principal: 75000,
        interest: 7500,
        outstanding: 74000,
        status: 'Pending',
      },
    ],

    transactions: [
      {
        id: 'TXN-1001',
        date: '12 Aug 2026',
        type: 'Loan Disbursement',
        amount: 50000,
        reference: 'LN-1001',
        status: 'Completed',
      },
      {
        id: 'TXN-1002',
        date: '11 Aug 2026',
        type: 'Loan Repayment',
        amount: 12000,
        reference: 'LN-1002',
        status: 'Completed',
      },
      {
        id: 'TXN-1003',
        date: '10 Aug 2026',
        type: 'Interest Collection',
        amount: 5000,
        reference: 'LN-1003',
        status: 'Completed',
      },
    ],
  },

  {
    id: 'FIN-1002',
    name: 'Apex Capital Services',
    owner: 'Vikram Mehta',
    city: 'Mumbai',
    kycStatus: 'Verified',
    status: 'Active',

    totalCustomers: 450,
    activeLoans: 380,
    totalPrincipal: 62000000,
    totalInterest: 9200000,
    monthlyInterest: 920000,
    serviceChargePercentage: 1,
    serviceChargeStatus: 'Paid',

    customers: [
      {
        id: 'CUS-2001',
        name: 'Rahul Verma',
        phone: '9876500011',
        activeLoans: 2,
        outstanding: 145000,
        status: 'Active',
      },
      {
        id: 'CUS-2002',
        name: 'Priya Nair',
        phone: '9876500012',
        activeLoans: 1,
        outstanding: 85000,
        status: 'Active',
      },
      {
        id: 'CUS-2003',
        name: 'Amit Desai',
        phone: '9876500013',
        activeLoans: 3,
        outstanding: 210000,
        status: 'Active',
      },
      {
        id: 'CUS-2004',
        name: 'Sneha Rao',
        phone: '9876500014',
        activeLoans: 1,
        outstanding: 55000,
        status: 'Pending',
      },
      {
        id: 'CUS-2005',
        name: 'Karan Shah',
        phone: '9876500015',
        activeLoans: 2,
        outstanding: 125000,
        status: 'Active',
      },
    ],

    loans: [
      {
        id: 'LN-2001',
        customerName: 'Rahul Verma',
        principal: 150000,
        interest: 15000,
        outstanding: 145000,
        status: 'Active',
      },
      {
        id: 'LN-2002',
        customerName: 'Priya Nair',
        principal: 100000,
        interest: 10000,
        outstanding: 85000,
        status: 'Active',
      },
      {
        id: 'LN-2003',
        customerName: 'Amit Desai',
        principal: 250000,
        interest: 25000,
        outstanding: 210000,
        status: 'Active',
      },
      {
        id: 'LN-2004',
        customerName: 'Sneha Rao',
        principal: 60000,
        interest: 6000,
        outstanding: 55000,
        status: 'Pending',
      },
    ],

    transactions: [
      {
        id: 'TXN-2001',
        date: '12 Aug 2026',
        type: 'Loan Disbursement',
        amount: 150000,
        reference: 'LN-2001',
        status: 'Completed',
      },
      {
        id: 'TXN-2002',
        date: '11 Aug 2026',
        type: 'Loan Repayment',
        amount: 30000,
        reference: 'LN-2002',
        status: 'Completed',
      },
      {
        id: 'TXN-2003',
        date: '08 Aug 2026',
        type: 'Service Charge',
        amount: 9200,
        reference: 'SC-AUG-002',
        status: 'Completed',
      },
    ],
  },

  {
    id: 'FIN-1003',
    name: 'Shree Ram Microfinance',
    owner: 'Ramshankar Joshi',
    city: 'Jaipur',
    kycStatus: 'Verified',
    status: 'Active',

    totalCustomers: 310,
    activeLoans: 245,
    totalPrincipal: 34000000,
    totalInterest: 5100000,
    monthlyInterest: 510000,
    serviceChargePercentage: 1,
    serviceChargeStatus: 'Pending',

    customers: [
      {
        id: 'CUS-3001',
        name: 'Mohan Lal',
        phone: '9876300011',
        activeLoans: 2,
        outstanding: 72000,
        status: 'Active',
      },
      {
        id: 'CUS-3002',
        name: 'Sunita Devi',
        phone: '9876300012',
        activeLoans: 1,
        outstanding: 38000,
        status: 'Active',
      },
      {
        id: 'CUS-3003',
        name: 'Rajesh Kumar',
        phone: '9876300013',
        activeLoans: 2,
        outstanding: 91000,
        status: 'Active',
      },
      {
        id: 'CUS-3004',
        name: 'Pooja Sharma',
        phone: '9876300014',
        activeLoans: 1,
        outstanding: 45000,
        status: 'Pending',
      },
    ],

    loans: [
      {
        id: 'LN-3001',
        customerName: 'Mohan Lal',
        principal: 80000,
        interest: 8000,
        outstanding: 72000,
        status: 'Active',
      },
      {
        id: 'LN-3002',
        customerName: 'Sunita Devi',
        principal: 45000,
        interest: 4500,
        outstanding: 38000,
        status: 'Active',
      },
      {
        id: 'LN-3003',
        customerName: 'Rajesh Kumar',
        principal: 100000,
        interest: 10000,
        outstanding: 91000,
        status: 'Active',
      },
    ],

    transactions: [
      {
        id: 'TXN-3001',
        date: '12 Aug 2026',
        type: 'Loan Disbursement',
        amount: 80000,
        reference: 'LN-3001',
        status: 'Completed',
      },
      {
        id: 'TXN-3002',
        date: '09 Aug 2026',
        type: 'Loan Repayment',
        amount: 15000,
        reference: 'LN-3003',
        status: 'Completed',
      },
    ],
  },

  {
    id: 'FIN-1004',
    name: 'City FinCorp India',
    owner: 'Anil Agarwal',
    city: 'Surat',
    kycStatus: 'Pending',
    status: 'Pending',

    totalCustomers: 95,
    activeLoans: 72,
    totalPrincipal: 11000000,
    totalInterest: 1450000,
    monthlyInterest: 145000,
    serviceChargePercentage: 1,
    serviceChargeStatus: 'Pending',

    customers: [
      {
        id: 'CUS-4001',
        name: 'Vijay Patel',
        phone: '9876400011',
        activeLoans: 1,
        outstanding: 35000,
        status: 'Active',
      },
      {
        id: 'CUS-4002',
        name: 'Neha Shah',
        phone: '9876400012',
        activeLoans: 1,
        outstanding: 52000,
        status: 'Active',
      },
      {
        id: 'CUS-4003',
        name: 'Harish Desai',
        phone: '9876400013',
        activeLoans: 2,
        outstanding: 76000,
        status: 'Pending',
      },
    ],

    loans: [
      {
        id: 'LN-4001',
        customerName: 'Vijay Patel',
        principal: 40000,
        interest: 4000,
        outstanding: 35000,
        status: 'Active',
      },
      {
        id: 'LN-4002',
        customerName: 'Neha Shah',
        principal: 60000,
        interest: 6000,
        outstanding: 52000,
        status: 'Active',
      },
      {
        id: 'LN-4003',
        customerName: 'Harish Desai',
        principal: 90000,
        interest: 9000,
        outstanding: 76000,
        status: 'Pending',
      },
    ],

    transactions: [
      {
        id: 'TXN-4001',
        date: '10 Aug 2026',
        type: 'Loan Disbursement',
        amount: 40000,
        reference: 'LN-4001',
        status: 'Completed',
      },
      {
        id: 'TXN-4002',
        date: '08 Aug 2026',
        type: 'KYC Verification',
        amount: 0,
        reference: 'FIN-1004',
        status: 'Pending',
      },
    ],
  },

  {
    id: 'FIN-1005',
    name: 'Metro Loan Agency',
    owner: 'Sunil Rao',
    city: 'Bengaluru',
    kycStatus: 'Rejected',
    status: 'Suspended',

    totalCustomers: 180,
    activeLoans: 0,
    totalPrincipal: 0,
    totalInterest: 0,
    monthlyInterest: 0,
    serviceChargePercentage: 1,
    serviceChargeStatus: 'Pending',

    customers: [
      {
        id: 'CUS-5001',
        name: 'Manoj Kumar',
        phone: '9876505011',
        activeLoans: 0,
        outstanding: 0,
        status: 'Suspended',
      },
      {
        id: 'CUS-5002',
        name: 'Lakshmi Rao',
        phone: '9876505012',
        activeLoans: 0,
        outstanding: 0,
        status: 'Suspended',
      },
    ],

    loans: [],

    transactions: [
      {
        id: 'TXN-5001',
        date: '05 Aug 2026',
        type: 'Account Suspension',
        amount: 0,
        reference: 'FIN-1005',
        status: 'Rejected',
      },
    ],
  },

  {
    id: 'FIN-1006',
    name: 'Bharat Nidhi Finance',
    owner: 'Deepak Sharma',
    city: 'Delhi',
    kycStatus: 'Verified',
    status: 'Active',

    totalCustomers: 520,
    activeLoans: 410,
    totalPrincipal: 78000000,
    totalInterest: 11800000,
    monthlyInterest: 1180000,
    serviceChargePercentage: 1,
    serviceChargeStatus: 'Paid',

    customers: [
      {
        id: 'CUS-6001',
        name: 'Rajiv Singh',
        phone: '9876600011',
        activeLoans: 2,
        outstanding: 185000,
        status: 'Active',
      },
      {
        id: 'CUS-6002',
        name: 'Anita Gupta',
        phone: '9876600012',
        activeLoans: 1,
        outstanding: 92000,
        status: 'Active',
      },
      {
        id: 'CUS-6003',
        name: 'Vikas Yadav',
        phone: '9876600013',
        activeLoans: 3,
        outstanding: 240000,
        status: 'Active',
      },
      {
        id: 'CUS-6004',
        name: 'Nisha Kapoor',
        phone: '9876600014',
        activeLoans: 1,
        outstanding: 65000,
        status: 'Active',
      },
    ],

    loans: [
      {
        id: 'LN-6001',
        customerName: 'Rajiv Singh',
        principal: 200000,
        interest: 20000,
        outstanding: 185000,
        status: 'Active',
      },
      {
        id: 'LN-6002',
        customerName: 'Anita Gupta',
        principal: 100000,
        interest: 10000,
        outstanding: 92000,
        status: 'Active',
      },
      {
        id: 'LN-6003',
        customerName: 'Vikas Yadav',
        principal: 250000,
        interest: 25000,
        outstanding: 240000,
        status: 'Active',
      },
      {
        id: 'LN-6004',
        customerName: 'Nisha Kapoor',
        principal: 75000,
        interest: 7500,
        outstanding: 65000,
        status: 'Active',
      },
    ],

    transactions: [
      {
        id: 'TXN-6001',
        date: '12 Aug 2026',
        type: 'Loan Disbursement',
        amount: 200000,
        reference: 'LN-6001',
        status: 'Completed',
      },
      {
        id: 'TXN-6002',
        date: '11 Aug 2026',
        type: 'Loan Repayment',
        amount: 45000,
        reference: 'LN-6002',
        status: 'Completed',
      },
      {
        id: 'TXN-6003',
        date: '09 Aug 2026',
        type: 'Service Charge',
        amount: 11800,
        reference: 'SC-AUG-006',
        status: 'Completed',
      },
    ],
  },

  {
    id: 'FIN-1007',
    name: 'Lakshmi Credit Co.',
    owner: 'Lakshmi Narayan',
    city: 'Hyderabad',
    kycStatus: 'Verified',
    status: 'Active',

    totalCustomers: 365,
    activeLoans: 290,
    totalPrincipal: 42000000,
    totalInterest: 6300000,
    monthlyInterest: 630000,
    serviceChargePercentage: 1,
    serviceChargeStatus: 'Pending',

    customers: [
      {
        id: 'CUS-7001',
        name: 'Srinivas Reddy',
        phone: '9876700011',
        activeLoans: 2,
        outstanding: 110000,
        status: 'Active',
      },
      {
        id: 'CUS-7002',
        name: 'Kiran Kumar',
        phone: '9876700012',
        activeLoans: 1,
        outstanding: 58000,
        status: 'Active',
      },
      {
        id: 'CUS-7003',
        name: 'Padma Devi',
        phone: '9876700013',
        activeLoans: 2,
        outstanding: 97000,
        status: 'Active',
      },
    ],

    loans: [
      {
        id: 'LN-7001',
        customerName: 'Srinivas Reddy',
        principal: 120000,
        interest: 12000,
        outstanding: 110000,
        status: 'Active',
      },
      {
        id: 'LN-7002',
        customerName: 'Kiran Kumar',
        principal: 65000,
        interest: 6500,
        outstanding: 58000,
        status: 'Active',
      },
      {
        id: 'LN-7003',
        customerName: 'Padma Devi',
        principal: 110000,
        interest: 11000,
        outstanding: 97000,
        status: 'Active',
      },
    ],

    transactions: [
      {
        id: 'TXN-7001',
        date: '12 Aug 2026',
        type: 'Loan Disbursement',
        amount: 120000,
        reference: 'LN-7001',
        status: 'Completed',
      },
      {
        id: 'TXN-7002',
        date: '10 Aug 2026',
        type: 'Loan Repayment',
        amount: 22000,
        reference: 'LN-7002',
        status: 'Completed',
      },
    ],
  },

  {
    id: 'FIN-1008',
    name: 'Sapphire Finance Ltd.',
    owner: 'Rohit Malhotra',
    city: 'Pune',
    kycStatus: 'Verified',
    status: 'Active',

    totalCustomers: 275,
    activeLoans: 210,
    totalPrincipal: 29500000,
    totalInterest: 4300000,
    monthlyInterest: 430000,
    serviceChargePercentage: 1,
    serviceChargeStatus: 'Paid',

    customers: [
      {
        id: 'CUS-8001',
        name: 'Aakash Jain',
        phone: '9876800011',
        activeLoans: 2,
        outstanding: 96000,
        status: 'Active',
      },
      {
        id: 'CUS-8002',
        name: 'Divya Patil',
        phone: '9876800012',
        activeLoans: 1,
        outstanding: 48000,
        status: 'Active',
      },
      {
        id: 'CUS-8003',
        name: 'Rakesh More',
        phone: '9876800013',
        activeLoans: 2,
        outstanding: 135000,
        status: 'Active',
      },
    ],

    loans: [
      {
        id: 'LN-8001',
        customerName: 'Aakash Jain',
        principal: 100000,
        interest: 10000,
        outstanding: 96000,
        status: 'Active',
      },
      {
        id: 'LN-8002',
        customerName: 'Divya Patil',
        principal: 55000,
        interest: 5500,
        outstanding: 48000,
        status: 'Active',
      },
      {
        id: 'LN-8003',
        customerName: 'Rakesh More',
        principal: 150000,
        interest: 15000,
        outstanding: 135000,
        status: 'Active',
      },
    ],

    transactions: [
      {
        id: 'TXN-8001',
        date: '12 Aug 2026',
        type: 'Loan Disbursement',
        amount: 100000,
        reference: 'LN-8001',
        status: 'Completed',
      },
      {
        id: 'TXN-8002',
        date: '09 Aug 2026',
        type: 'Service Charge',
        amount: 4300,
        reference: 'SC-AUG-008',
        status: 'Completed',
      },
    ],
  },
];

// ============================================================
// PLATFORM GROWTH
// ============================================================

export const mockAdminPlatformGrowth =
  revenueData;