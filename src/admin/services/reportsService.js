import { platformApi } from '../../common/services/platformApi';

export const reportsService = {
  get: platformApi.reports.get,
  getLoans: (params) => platformApi.reports.get('loans', params),
  getCustomers: (params) => platformApi.reports.get('customers', params),
  getPayments: (params) => platformApi.reports.get('payments', params),
  getCollections: (params) => platformApi.reports.get('collections', params),
};
