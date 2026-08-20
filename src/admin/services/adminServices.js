import { platformApi, pageItems } from '../../common/services/platformApi';

export const adminService = {
  getAdminStats: platformApi.dashboard.admin,
  getFinancers: async (params) => pageItems(await platformApi.admin.financers(params)),
  getPlatformGrowth: () => platformApi.reports.get('portfolio'),
  approveFinancer: (id) => platformApi.admin.changeFinancerStatus(id, { status: 'Active', reason: 'Approved by administrator' }),
};
