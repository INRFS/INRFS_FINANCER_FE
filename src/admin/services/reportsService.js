import { reportsList, revenueData, platformGrowthData } from '../data/mockAdminData';
export const reportsService = {
  getAll: async () => Promise.resolve(reportsList),
  getRevenueData: async () => Promise.resolve(revenueData),
  getGrowthData: async () => Promise.resolve(platformGrowthData),
  exportReport: async (reportId) => Promise.resolve({ success: true, message: `Report ${reportId} exported successfully.` }),
};
