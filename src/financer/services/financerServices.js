import {
  mockFinancerProfile,
  mockDashboardStats,
  mockLoanStatusData,
  mockMonthlyCollectionsData,
  mockUpcomingPayments,
  mockCustomers,
  mockLoans,
  mockPaymentsList,
  mockInterestSchedules,
  mockOverdueItems,
  mockLedgerEntries,
  mockNotifications,
  mockSupportTickets
} from '../data/mockFinancerData';

// Placeholder service layer to mimic asynchronous REST API interaction
export const financerService = {
  getProfile: async () => Promise.resolve(mockFinancerProfile),
  getDashboardStats: async () => Promise.resolve(mockDashboardStats),
  getLoanStatusDistribution: async () => Promise.resolve(mockLoanStatusData),
  getMonthlyCollections: async () => Promise.resolve(mockMonthlyCollectionsData),
  getUpcomingPayments: async () => Promise.resolve(mockUpcomingPayments),
  
  getCustomers: async () => Promise.resolve(mockCustomers),
  addCustomer: async (newCustomer) => {
    const item = { id: `CUST-${Date.now().toString().slice(-3)}`, ...newCustomer, status: 'Active', activeLoans: 0, outstanding: 0, nextDue: '-' };
    mockCustomers.unshift(item);
    return Promise.resolve(item);
  },

  getLoans: async () => Promise.resolve(mockLoans),
  createLoan: async (newLoan) => {
    const item = { id: `LN000${Math.floor(100 + Math.random() * 900)}`, ...newLoan, status: 'Active', outstanding: Number(newLoan.principal) };
    mockLoans.unshift(item);
    return Promise.resolve(item);
  },

  getPayments: async () => Promise.resolve(mockPaymentsList),
  recordPayment: async (paymentData) => {
    const item = { id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`, ...paymentData, status: 'Completed', date: new Date().toISOString().split('T')[0] };
    mockPaymentsList.unshift(item);
    return Promise.resolve(item);
  },

  getInterestSchedule: async () => Promise.resolve(mockInterestSchedules),
  getOverdueAccounts: async () => Promise.resolve(mockOverdueItems),
  getLedger: async (customerId) => Promise.resolve(mockLedgerEntries),
  getNotifications: async () => Promise.resolve(mockNotifications),
  getSupportTickets: async () => Promise.resolve(mockSupportTickets),
};
