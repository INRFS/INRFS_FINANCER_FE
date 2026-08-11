import { auditLogs } from '../data/mockAdminData';
export const auditService = {
  getAll: async () => Promise.resolve(auditLogs),
};
