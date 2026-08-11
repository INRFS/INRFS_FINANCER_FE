import { subscriptionPlans, financerSubscriptions } from '../data/mockAdminData';
export const subscriptionService = {
  getPlans: async () => Promise.resolve(subscriptionPlans),
  getFinancerSubscriptions: async () => Promise.resolve(financerSubscriptions),
};
