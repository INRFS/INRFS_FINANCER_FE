import { api } from './apiClient';
import { collectionConcernService } from './collectionConcernService';

const queryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const value = query.toString();
  return value ? `?${value}` : '';
};

const list = (path, params) => api.get(`${path}${queryString(params)}`);
const all = async (path, params = {}) => {
  const first = await list(path, { ...params, page: 1, pageSize: 100 });
  if (Array.isArray(first)) return first;
  const items = [...(first?.items || [])];
  for (let page = 2; page <= Math.min(first?.totalPages || 1, 100); page += 1) {
    const next = await list(path, { ...params, page, pageSize: 100 });
    items.push(...(next?.items || []));
  }
  return { ...first, items, page: 1, pageSize: items.length, totalCount: items.length, totalPages: 1 };
};

export const platformApi = {
  dashboard: {
    financer: (params) => list('/dashboard/financer', params),
    admin: (params) => list('/dashboard/admin', params),
  },
  profile: {
    get: () => api.get('/profile'),
    update: (data) => api.put('/profile', data),
  },
  customers: {
    list: (params) => list('/customers', params),
    all: (params) => all('/customers', params),
    get: (id) => api.get(`/customers/${id}`),
    create: (data) => api.post('/customers', data),
    update: (id, data) => api.put(`/customers/${id}`, data),
    remove: (id) => api.delete(`/customers/${id}`),
    addNote: (id, data) => api.post(`/customers/${id}/notes`, data),
    ledger: (id, params) => list(`/customers/${id}/ledger`, params),
  },
  documents: {
    listForCustomer: (customerId) => api.get(`/documents?customerId=${encodeURIComponent(customerId)}`),
    listForFinancer: (financerId) => api.get(`/documents?financerId=${encodeURIComponent(financerId)}`),
    download: (id) => api.download(`/documents/${id}/content`),
    upload: (file, category, customerId, applicationId, financerId) => {
      const data = new FormData(); data.append('file', file); data.append('category', category);
      if (customerId) data.append('customerId', customerId); if (applicationId) data.append('applicationId', applicationId);
      if (financerId) data.append('financerId', financerId);
      return api.post('/documents', data);
    },
    remove: (id) => api.delete(`/documents/${id}`),
    verify: (id, data) => api.post(`/documents/${id}/verify`, data),
  },
  kyc: {
    submit: (data) => api.post('/kyc', data),
    list: (params) => list('/kyc', params),
    decide: (id, data) => api.post(`/kyc/${id}/decision`, data),
  },
  loans: {
    list: (params) => list('/loans', params),
    all: (params) => all('/loans', params),
    create: async (data) => {
      const payload = { ...data };
      if (Object.prototype.hasOwnProperty.call(payload, 'collectionConcern')) {
        payload.adminCollectionMonitoring = Boolean(payload.collectionConcern);
      }
      if (payload.annualInterestRate != null && payload.annualInterestRate > 100) {
        payload.annualInterestRate = Math.min(Number(payload.interestRate || payload.annualInterestRate), 100);
      }
      const result = await api.post('/loans', payload);
      if (data?.collectionConcern) {
        try {
          await collectionConcernService.createConcern({
            ...data,
            loanId: result?.id || data.loanId,
            loanNumber: result?.loanNumber || data.loanNumber,
            customerId: result?.customerId || data.customerId,
            financerId: result?.financerId || data.financerId,
            financerName: result?.financerName || data.financerName,
          });
        } catch {
          // safe
        }
      }
      return result;
    },
    get: (id) => api.get(`/loans/${id}`),
    schedule: (id) => api.get(`/loans/${id}/schedule`),
    products: (includeInactive = false) => list('/loan-products', { includeInactive }),
    applications: (params) => list('/loan-applications', params),
    createApplication: (data) => api.post('/loan-applications', data),
    transition: (id, action, data = {}) => api.post(`/loan-applications/${id}/${action}`, data),
  },
  collectionConcerns: {
    list: (params) => collectionConcernService.listConcerns(params),
    all: (params) => collectionConcernService.listConcerns(params),
    get: (id) => collectionConcernService.getConcern(id),
    create: (data) => collectionConcernService.createConcern(data),
    update: (id, data) => collectionConcernService.updateConcern(id, data),
  },
  payments: {
    list: (params) => list('/payments', params),
    all: (params) => all('/payments', params),
    get: (id) => api.get(`/payments/${id}`),
    settlementQuote: (loanId, date) => list(`/payments/settlement-quote/${loanId}`, { date }),
    record: (data) => api.post('/payments', data),
    reverse: (id, data) => api.post(`/payments/${id}/reverse`, data),
    schedules: (params) => list('/payment-schedules', params),
    allSchedules: (params) => all('/payment-schedules', params),
    reschedule: (id, data) => api.post(`/payment-schedules/${id}/reschedule`, data),
    transactions: (params) => list('/transactions', params),
    reconcile: (id, data) => api.post(`/transactions/${id}/reconcile`, data),
  },
  collections: {
    list: (params) => list('/collections', params),
    overdue: (params) => list('/overdue-loans', params),
    action: (loanId, data) => api.post(`/collections/${loanId}/actions`, data),
    remind: (loanId, data) => api.post(`/collections/${loanId}/reminders`, data),
  },
  notifications: {
    list: async (params) => {
      try {
        const backend = await list('/notifications', params);
        return collectionConcernService.getMergedNotifications(backend);
      } catch {
        return collectionConcernService.getMergedNotifications([]);
      }
    },
    create: (data) => api.post('/notifications', data),
    read: async (id) => {
      await collectionConcernService.markNotificationRead(id);
      return api.post(`/notifications/${id}/read`, {}).catch(() => ({}));
    },
    readAll: async () => {
      await collectionConcernService.markAllNotificationsRead();
      return api.post('/notifications/read-all', {}).catch(() => ({}));
    },
  },
  support: {
    list: (params) => list('/support-tickets', params),
    get: (id) => api.get(`/support-tickets/${id}`),
    create: (data) => api.post('/support-tickets', data),
    message: (id, data) => api.post(`/support-tickets/${id}/messages`, data),
    status: (id, data) => api.post(`/support-tickets/${id}/status`, data),
    assign: (id, data) => api.post(`/support-tickets/${id}/assign`, data),
  },
  reports: {
    get: (name, params) => list(`/reports/${encodeURIComponent(name)}`, params),
  },
  settings: {
    list: (scope) => list('/settings', { scope }),
    save: (scope, key, data) => api.put(`/settings/${encodeURIComponent(scope)}/${encodeURIComponent(key)}`, data),
  },
  admin: {
    financers: (params) => list('/financers', params),
    allFinancers: (params) => all('/financers', params),
    createFinancer: (data) => api.post('/financers', data),
    changeFinancerStatus: (id, data) => api.post(`/financers/${id}/status`, data),
    decideFinancerKyc: (id, data) => api.post(`/financers/${id}/kyc`, data),
    financerUsage: (id) => api.get(`/financers/${id}/usage`),
    billingUsage: (params) => list('/financers/billing-usage', params),
    users: (params) => list('/users', params),
    admins: (params) => list('/admins', params),
    createUser: (data) => api.post('/users', data),
    setUserRoles: (id, roleIds) => api.put(`/users/${id}/roles`, roleIds),
    deactivateUser: (id) => api.delete(`/users/${id}`),
    userSessions: (id) => api.get(`/users/${id}/sessions`),
    revokeSession: (id, sessionId) => api.delete(`/users/${id}/sessions/${sessionId}`),
    roles: () => api.get('/roles'),
    billing: (params) => list('/monthly-billing', params),
    allBilling: (params) => all('/monthly-billing', params),
    invoices: (params) => list('/service-charges/invoices', params),
    allInvoices: (params) => all('/service-charges/invoices', params),
    generateInvoice: (data) => api.post('/service-charges/invoices/generate', data),
    collectInvoice: (id, data) => api.post(`/service-charges/invoices/${id}/collect`, data),
    creditInvoice: (id, data) => api.post(`/service-charges/invoices/${id}/credit-note`, data),
    subscriptions: () => api.get('/subscriptions'),
    assignSubscription: (data) => api.post('/subscriptions/assign', data),
    smsUsage: (params) => list('/sms-management/usage', params),
    auditLogs: (params) => list('/audit-logs', params),
  },
};

export const pageItems = (payload) => payload?.items ?? (Array.isArray(payload) ? payload : []);
