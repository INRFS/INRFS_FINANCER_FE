import { mockAdminStats, mockFinancersList, mockAdminPlatformGrowth } from '../data/mockAdminData';

export const adminService = {
  getAdminStats: async () => Promise.resolve(mockAdminStats),
  getFinancers: async () => Promise.resolve(mockFinancersList),
  getPlatformGrowth: async () => Promise.resolve(mockAdminPlatformGrowth),
  approveFinancer: async (financerId) => {
    const item = mockFinancersList.find(f => f.id === financerId);
    if (item) {
      item.status = 'Active';
      item.kycStatus = 'Verified';
    }
    return Promise.resolve(item);
  }
};
