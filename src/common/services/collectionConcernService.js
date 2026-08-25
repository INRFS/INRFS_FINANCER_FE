import { api } from './apiClient';

const CONCERNS_STORAGE_KEY = 'inrfs_collection_concerns';
const NOTIFICATIONS_STORAGE_KEY = 'inrfs_collection_notifications';

function loadStored(key, defaultVal = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

class CollectionConcernService {
  getConcerns() {
    return loadStored(CONCERNS_STORAGE_KEY, []);
  }

  getNotifications() {
    return loadStored(NOTIFICATIONS_STORAGE_KEY, []);
  }

  async listConcerns(params = {}) {
    // Try fetching from backend API if available
    try {
      const response = await api.get('/collection-concerns');
      if (response && (Array.isArray(response) || response.items)) {
        const items = Array.isArray(response) ? response : response.items;
        saveStored(CONCERNS_STORAGE_KEY, items);
        return { items, totalCount: items.length, page: 1, pageSize: items.length, totalPages: 1 };
      }
    } catch {
      // Fallback to local store
    }

    let items = this.getConcerns();
    if (params.status && params.status !== 'All') {
      const target = params.status.toUpperCase();
      items = items.filter((c) => (c.status || '').toUpperCase() === target);
    }
    if (params.search) {
      const term = params.search.toLowerCase();
      items = items.filter((c) =>
        `${c.customerName || ''} ${c.customerNumber || ''} ${c.loanNumber || ''} ${c.financerName || ''}`
          .toLowerCase()
          .includes(term)
      );
    }
    // Sort newest first
    items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return {
      items,
      totalCount: items.length,
      page: 1,
      pageSize: items.length,
      totalPages: 1,
    };
  }

  async getConcern(id) {
    try {
      const remote = await api.get(`/collection-concerns/${id}`);
      if (remote) return remote;
    } catch {
      // fallback
    }
    const concerns = this.getConcerns();
    return concerns.find((c) => c.id === id) || null;
  }

  async createConcern(data) {
    const concerns = this.getConcerns();
    const notifications = this.getNotifications();

    // Prevent duplicate concern creation for the same loan
    const existing = concerns.find(
      (c) =>
        (data.loanId && c.loanId === data.loanId) ||
        (data.loanNumber && c.loanNumber === data.loanNumber && data.customerId === c.customerId)
    );

    if (existing) {
      return existing;
    }

    const concernId = `concern_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const newConcern = {
      id: concernId,
      customerId: data.customerId || '',
      customerName: data.customerName || 'Customer',
      customerNumber: data.customerNumber || '',
      customerPhone: data.customerPhone || '',
      customerEmail: data.customerEmail || '',
      loanId: data.loanId || `loan_${Date.now()}`,
      loanNumber: data.loanNumber || `LN-${Date.now().toString().slice(-6)}`,
      principal: Number(data.principal || 0),
      annualInterestRate: Number(data.annualInterestRate || data.interestRate || 0),
      durationValue: data.durationValue || 1,
      durationUnit: data.durationUnit || 'Months',
      interestFrequency: data.interestFrequency || 'Monthly',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      financerId: data.financerId || '',
      financerName: data.financerName || 'Financer',
      status: 'PENDING',
      concernType: 'Customer Collection Concern',
      reason: data.reason || 'Financer flagged potentially difficult repayment collection at loan creation',
      createdAt,
      updatedAt: createdAt,
      adminNotes: '',
      handledByAdminId: null,
      handledByAdminName: null,
      actionDate: null,
    };

    concerns.unshift(newConcern);
    saveStored(CONCERNS_STORAGE_KEY, concerns);

    const notificationId = `notif_${concernId}`;
    const newNotification = {
      id: notificationId,
      title: 'Customer Collection Concern',
      message:
        'A financer has flagged a customer as potentially difficult for repayment collection. Please review the customer and loan details and take the necessary action.',
      type: 'CustomerCollectionConcern',
      channel: 'InApp',
      readAt: null,
      createdAt,
      entityType: 'CustomerCollectionConcern',
      entityId: concernId,
      concernId,
      customerId: newConcern.customerId,
      customerName: newConcern.customerName,
      customerNumber: newConcern.customerNumber,
      loanId: newConcern.loanId,
      loanNumber: newConcern.loanNumber,
      principal: newConcern.principal,
      financerName: newConcern.financerName,
      concernStatus: 'PENDING',
    };

    notifications.unshift(newNotification);
    saveStored(NOTIFICATIONS_STORAGE_KEY, notifications);

    // Try sending to remote API safely without breaking if backend route isn't registered
    try {
      await api.post('/collection-concerns', newConcern).catch(() => {});
      await api.post('/notifications', newNotification).catch(() => {});
    } catch {
      // safe fallback
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inrfs-notification-updated', { detail: { concern: newConcern, notification: newNotification } }));
    }

    return newConcern;
  }

  async updateConcern(id, updates) {
    const concerns = this.getConcerns();
    const index = concerns.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const actionDate = new Date().toISOString();
    const updated = {
      ...concerns[index],
      status: updates.status || concerns[index].status,
      adminNotes: updates.adminNotes !== undefined ? updates.adminNotes : concerns[index].adminNotes,
      handledByAdminId: updates.handledByAdminId || concerns[index].handledByAdminId,
      handledByAdminName: updates.handledByAdminName || concerns[index].handledByAdminName,
      actionDate: updates.status && updates.status !== 'PENDING' ? actionDate : concerns[index].actionDate,
      updatedAt: actionDate,
    };

    concerns[index] = updated;
    saveStored(CONCERNS_STORAGE_KEY, concerns);

    // Update corresponding notification metadata
    const notifications = this.getNotifications();
    const notifIndex = notifications.findIndex((n) => n.concernId === id || n.entityId === id);
    if (notifIndex !== -1) {
      notifications[notifIndex] = {
        ...notifications[notifIndex],
        concernStatus: updated.status,
      };
      saveStored(NOTIFICATIONS_STORAGE_KEY, notifications);
    }

    try {
      await api.put(`/collection-concerns/${id}`, updated).catch(() => {});
    } catch {
      // safe fallback
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inrfs-notification-updated', { detail: { concern: updated } }));
    }

    return updated;
  }

  async markNotificationRead(id) {
    const notifications = this.getNotifications();
    const target = notifications.find((n) => n.id === id);
    if (target) {
      target.readAt = new Date().toISOString();
      saveStored(NOTIFICATIONS_STORAGE_KEY, notifications);
    }

    try {
      await api.post(`/notifications/${id}/read`, {}).catch(() => {});
    } catch {
      // safe fallback
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inrfs-notification-updated', { detail: { notificationId: id, readAt: target?.readAt } }));
    }
  }

  async markAllNotificationsRead() {
    const notifications = this.getNotifications();
    const now = new Date().toISOString();
    notifications.forEach((n) => {
      if (!n.readAt) n.readAt = now;
    });
    saveStored(NOTIFICATIONS_STORAGE_KEY, notifications);

    try {
      await api.post('/notifications/read-all', {}).catch(() => {});
    } catch {
      // safe fallback
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inrfs-notification-updated', { detail: { allRead: true } }));
    }
  }

  getMergedNotifications(backendNotifications = []) {
    const localNotifs = this.getNotifications();
    const backendItems = Array.isArray(backendNotifications) ? backendNotifications : backendNotifications?.items || [];
    
    // Deduplicate by ID
    const map = new Map();
    localNotifs.forEach((n) => map.set(n.id, n));
    backendItems.forEach((n) => {
      // If already in map, preserve read status if local is read
      const existing = map.get(n.id);
      if (existing) {
        map.set(n.id, { ...n, readAt: existing.readAt || n.readAt });
      } else {
        map.set(n.id, n);
      }
    });

    const combined = Array.from(map.values());
    combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return combined;
  }
}

export const collectionConcernService = new CollectionConcernService();
