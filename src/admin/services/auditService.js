import { platformApi, pageItems } from '../../common/services/platformApi';

export const auditService = { getAll: async (params) => pageItems(await platformApi.admin.auditLogs(params)) };
