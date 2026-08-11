import { financersList } from '../data/mockAdminData';
export const financerService = {
  getAll: async () => Promise.resolve(financersList),
  getById: async (id) => Promise.resolve(financersList.find(f => f.id === id)),
  suspend: async (id) => { const f = financersList.find(x => x.id === id); if (f) f.status = 'Suspended'; return Promise.resolve(f); },
  activate: async (id) => { const f = financersList.find(x => x.id === id); if (f) f.status = 'Active'; return Promise.resolve(f); },
};
