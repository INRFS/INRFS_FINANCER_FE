import { smsKpis, smsUsageByFinancer, smsUsageTable } from '../data/mockAdminData';
export const smsService = {
  getKpis: async () => Promise.resolve(smsKpis),
  getUsageByFinancer: async () => Promise.resolve(smsUsageByFinancer),
  getUsageTable: async () => Promise.resolve(smsUsageTable),
};
