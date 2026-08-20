import { platformApi, pageItems } from '../../common/services/platformApi';

export const financerService = {
  getAll: async (params) => pageItems(await platformApi.admin.financers(params)),
  getById: async (id) => (await platformApi.admin.financers({ pageSize: 200 })).items?.find((item) => item.id === id),
  suspend: (id) => platformApi.admin.changeFinancerStatus(id, { status: 'Suspended', reason: 'Suspended by administrator' }),
  activate: (id) => platformApi.admin.changeFinancerStatus(id, { status: 'Active', reason: 'Activated by administrator' }),
};
