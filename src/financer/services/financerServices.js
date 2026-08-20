import { platformApi } from '../../common/services/platformApi';

export const financerService = {
  getProfile: platformApi.profile.get,
  getDashboardStats: platformApi.dashboard.financer,
  getLoanStatusDistribution: async () => (await platformApi.dashboard.financer()).loanStatusData,
  getMonthlyCollections: async () => (await platformApi.dashboard.financer()).monthlyCollections,
  getUpcomingPayments: async () => (await platformApi.dashboard.financer()).upcomingPayments,
  getCustomers: platformApi.customers.list,
  addCustomer: platformApi.customers.create,
  getLoans: platformApi.loans.list,
  createLoan: platformApi.loans.createApplication,
  getPayments: platformApi.payments.list,
  recordPayment: platformApi.payments.record,
  getInterestSchedule: platformApi.payments.schedules,
  getOverdueAccounts: platformApi.collections.overdue,
  getLedger: platformApi.customers.ledger,
  getNotifications: platformApi.notifications.list,
  getSupportTickets: platformApi.support.list,
};
