import { describe, expect, it, vi, beforeEach } from 'vitest';
import { platformApi, pageItems } from './platformApi';
import { api } from './apiClient';

describe('platformApi full test suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('pageItems helper', () => {
    it('extracts array from payload.items', () => {
      expect(pageItems({ items: [1, 2, 3] })).toEqual([1, 2, 3]);
    });

    it('returns array directly when payload is already an array', () => {
      expect(pageItems([10, 20])).toEqual([10, 20]);
    });

    it('returns empty array for null or undefined or object without items', () => {
      expect(pageItems(null)).toEqual([]);
      expect(pageItems(undefined)).toEqual([]);
      expect(pageItems({})).toEqual([]);
    });
  });

  describe('pagination `all` helper', () => {
    it('returns array immediately if first response is an array', async () => {
      vi.spyOn(api, 'get').mockResolvedValueOnce(['item1', 'item2']);
      const result = await platformApi.customers.all({ search: 'test' });
      expect(result).toEqual(['item1', 'item2']);
    });

    it('paginates through multiple pages and concatenates items', async () => {
      vi.spyOn(api, 'get')
        .mockResolvedValueOnce({
          items: [{ id: 1 }, { id: 2 }],
          totalPages: 3,
          totalCount: 5,
        })
        .mockResolvedValueOnce({
          items: [{ id: 3 }, { id: 4 }],
          totalPages: 3,
        })
        .mockResolvedValueOnce({
          items: [{ id: 5 }],
          totalPages: 3,
        });

      const result = await platformApi.loans.all();
      expect(result.items).toHaveLength(5);
      expect(result.items.map((x) => x.id)).toEqual([1, 2, 3, 4, 5]);
      expect(result.totalCount).toBe(5);
      expect(api.get).toHaveBeenCalledTimes(3);
    });

    it('handles single page response cleanly', async () => {
      vi.spyOn(api, 'get').mockResolvedValueOnce({
        items: [{ id: 100 }],
        totalPages: 1,
        totalCount: 1,
      });

      const result = await platformApi.payments.all();
      expect(result.items).toEqual([{ id: 100 }]);
      expect(api.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('dashboard APIs', () => {
    it('calls financer and admin dashboard endpoints', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({ totalCustomers: 10 });

      await platformApi.dashboard.financer({ period: 'month' });
      expect(api.get).toHaveBeenCalledWith('/dashboard/financer?period=month');

      await platformApi.dashboard.admin();
      expect(api.get).toHaveBeenCalledWith('/dashboard/admin');
    });
  });

  describe('profile APIs', () => {
    it('calls profile get and update', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({ email: 'user@inrfs.com' });
      vi.spyOn(api, 'put').mockResolvedValue({ updated: true });

      const profile = await platformApi.profile.get();
      expect(profile).toEqual({ email: 'user@inrfs.com' });
      expect(api.get).toHaveBeenCalledWith('/profile');

      await platformApi.profile.update({ firstName: 'Admin' });
      expect(api.put).toHaveBeenCalledWith('/profile', { firstName: 'Admin' });
    });
  });

  describe('customers APIs', () => {
    it('calls customer CRUD and auxiliary endpoints', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({});
      vi.spyOn(api, 'post').mockResolvedValue({});
      vi.spyOn(api, 'put').mockResolvedValue({});
      vi.spyOn(api, 'delete').mockResolvedValue({});

      await platformApi.customers.list({ search: 'John', status: 'Active', empty: '' });
      expect(api.get).toHaveBeenCalledWith('/customers?search=John&status=Active');

      await platformApi.customers.get('c_1');
      expect(api.get).toHaveBeenCalledWith('/customers/c_1');

      await platformApi.customers.create({ name: 'John Doe' });
      expect(api.post).toHaveBeenCalledWith('/customers', { name: 'John Doe' });

      await platformApi.customers.update('c_1', { phone: '9876543210' });
      expect(api.put).toHaveBeenCalledWith('/customers/c_1', { phone: '9876543210' });

      await platformApi.customers.remove('c_1');
      expect(api.delete).toHaveBeenCalledWith('/customers/c_1');

      await platformApi.customers.addNote('c_1', { text: 'Note' });
      expect(api.post).toHaveBeenCalledWith('/customers/c_1/notes', { text: 'Note' });

      await platformApi.customers.ledger('c_1', { startDate: '2026-01-01' });
      expect(api.get).toHaveBeenCalledWith('/customers/c_1/ledger?startDate=2026-01-01');
    });
  });

  describe('documents APIs', () => {
    it('handles customer and financer document listing, download, upload, remove, and verify', async () => {
      vi.spyOn(api, 'get').mockResolvedValue([]);
      vi.spyOn(api, 'post').mockResolvedValue({});
      vi.spyOn(api, 'delete').mockResolvedValue({});
      vi.spyOn(api, 'download').mockResolvedValue(new Blob());

      await platformApi.documents.listForCustomer('cust 1');
      expect(api.get).toHaveBeenCalledWith('/documents?customerId=cust%201');

      await platformApi.documents.listForFinancer('fin 1');
      expect(api.get).toHaveBeenCalledWith('/documents?financerId=fin%201');

      await platformApi.documents.download('doc_1');
      expect(api.download).toHaveBeenCalledWith('/documents/doc_1/content');

      const mockFile = new File(['test'], 'doc.pdf');
      await platformApi.documents.upload(mockFile, 'Identity', 'c_1', 'app_1', 'f_1');
      expect(api.post).toHaveBeenCalledWith('/documents', expect.any(FormData));

      await platformApi.documents.remove('doc_1');
      expect(api.delete).toHaveBeenCalledWith('/documents/doc_1');

      await platformApi.documents.verify('doc_1', { verified: true });
      expect(api.post).toHaveBeenCalledWith('/documents/doc_1/verify', { verified: true });
    });
  });

  describe('kyc APIs', () => {
    it('handles submit, list, and decision', async () => {
      vi.spyOn(api, 'get').mockResolvedValue([]);
      vi.spyOn(api, 'post').mockResolvedValue({});

      await platformApi.kyc.submit({ aadhar: '123' });
      expect(api.post).toHaveBeenCalledWith('/kyc', { aadhar: '123' });

      await platformApi.kyc.list({ status: 'Pending' });
      expect(api.get).toHaveBeenCalledWith('/kyc?status=Pending');

      await platformApi.kyc.decide('k_1', { decision: 'Approved' });
      expect(api.post).toHaveBeenCalledWith('/kyc/k_1/decision', { decision: 'Approved' });
    });
  });

  describe('loans APIs', () => {
    it('handles loan CRUD, applications, products, and state transitions', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({});
      vi.spyOn(api, 'post').mockResolvedValue({});

      await platformApi.loans.list({ customerId: 'c1' });
      expect(api.get).toHaveBeenCalledWith('/loans?customerId=c1');

      await platformApi.loans.create({ amount: 10000 });
      expect(api.post).toHaveBeenCalledWith('/loans', { amount: 10000 });

      await platformApi.loans.get('l_1');
      expect(api.get).toHaveBeenCalledWith('/loans/l_1');

      await platformApi.loans.schedule('l_1');
      expect(api.get).toHaveBeenCalledWith('/loans/l_1/schedule');

      await platformApi.loans.products(true);
      expect(api.get).toHaveBeenCalledWith('/loan-products?includeInactive=true');

      await platformApi.loans.products();
      expect(api.get).toHaveBeenCalledWith('/loan-products?includeInactive=false');

      await platformApi.loans.applications({ status: 'Draft' });
      expect(api.get).toHaveBeenCalledWith('/loan-applications?status=Draft');

      await platformApi.loans.createApplication({ customerId: 'c1' });
      expect(api.post).toHaveBeenCalledWith('/loan-applications', { customerId: 'c1' });

      await platformApi.loans.transition('app_1', 'approve', { notes: 'Approved' });
      expect(api.post).toHaveBeenCalledWith('/loan-applications/app_1/approve', { notes: 'Approved' });
    });
  });

  describe('payments APIs', () => {
    it('handles payment recording, reversal, quotes, schedules, and reconciliation', async () => {
      vi.spyOn(api, 'get').mockResolvedValue({});
      vi.spyOn(api, 'post').mockResolvedValue({});

      await platformApi.payments.list({ loanId: 'l1' });
      expect(api.get).toHaveBeenCalledWith('/payments?loanId=l1');

      await platformApi.payments.get('p_1');
      expect(api.get).toHaveBeenCalledWith('/payments/p_1');

      await platformApi.payments.settlementQuote('l_1', '2026-08-24');
      expect(api.get).toHaveBeenCalledWith('/payments/settlement-quote/l_1?date=2026-08-24');

      await platformApi.payments.record({ amount: 500 });
      expect(api.post).toHaveBeenCalledWith('/payments', { amount: 500 });

      await platformApi.payments.reverse('p_1', { reason: 'Chargeback' });
      expect(api.post).toHaveBeenCalledWith('/payments/p_1/reverse', { reason: 'Chargeback' });

      await platformApi.payments.schedules({ status: 'Due' });
      expect(api.get).toHaveBeenCalledWith('/payment-schedules?status=Due');

      await platformApi.payments.reschedule('sch_1', { newDate: '2026-09-01' });
      expect(api.post).toHaveBeenCalledWith('/payment-schedules/sch_1/reschedule', { newDate: '2026-09-01' });

      await platformApi.payments.transactions({ page: 1 });
      expect(api.get).toHaveBeenCalledWith('/transactions?page=1');

      await platformApi.payments.reconcile('tx_1', { matched: true });
      expect(api.post).toHaveBeenCalledWith('/transactions/tx_1/reconcile', { matched: true });
    });
  });

  describe('collections APIs', () => {
    it('handles collection listing, overdue list, actions, and reminders', async () => {
      vi.spyOn(api, 'get').mockResolvedValue([]);
      vi.spyOn(api, 'post').mockResolvedValue({});

      await platformApi.collections.list({ priority: 'High' });
      expect(api.get).toHaveBeenCalledWith('/collections?priority=High');

      await platformApi.collections.overdue({ days: 30 });
      expect(api.get).toHaveBeenCalledWith('/overdue-loans?days=30');

      await platformApi.collections.action('l_1', { actionType: 'Call' });
      expect(api.post).toHaveBeenCalledWith('/collections/l_1/actions', { actionType: 'Call' });

      await platformApi.collections.remind('l_1', { channel: 'SMS' });
      expect(api.post).toHaveBeenCalledWith('/collections/l_1/reminders', { channel: 'SMS' });
    });
  });

  describe('notifications, support, reports, and settings APIs', () => {
    it('handles notifications methods', async () => {
      vi.spyOn(api, 'get').mockResolvedValue([]);
      vi.spyOn(api, 'post').mockResolvedValue({});

      await platformApi.notifications.list({ unread: true });
      expect(api.get).toHaveBeenCalledWith('/notifications?unread=true');

      await platformApi.notifications.create({ message: 'Hi' });
      expect(api.post).toHaveBeenCalledWith('/notifications', { message: 'Hi' });

      await platformApi.notifications.read('n_1');
      expect(api.post).toHaveBeenCalledWith('/notifications/n_1/read', {});

      await platformApi.notifications.readAll();
      expect(api.post).toHaveBeenCalledWith('/notifications/read-all', {});
    });

    it('handles support tickets methods', async () => {
      vi.spyOn(api, 'get').mockResolvedValue([]);
      vi.spyOn(api, 'post').mockResolvedValue({});

      await platformApi.support.list({ status: 'Open' });
      expect(api.get).toHaveBeenCalledWith('/support-tickets?status=Open');

      await platformApi.support.get('t_1');
      expect(api.get).toHaveBeenCalledWith('/support-tickets/t_1');

      await platformApi.support.create({ title: 'Bug' });
      expect(api.post).toHaveBeenCalledWith('/support-tickets', { title: 'Bug' });

      await platformApi.support.message('t_1', { text: 'Reply' });
      expect(api.post).toHaveBeenCalledWith('/support-tickets/t_1/messages', { text: 'Reply' });

      await platformApi.support.status('t_1', { status: 'Closed' });
      expect(api.post).toHaveBeenCalledWith('/support-tickets/t_1/status', { status: 'Closed' });

      await platformApi.support.assign('t_1', { agentId: 'ag_1' });
      expect(api.post).toHaveBeenCalledWith('/support-tickets/t_1/assign', { agentId: 'ag_1' });
    });

    it('handles reports get with encoding', async () => {
      vi.spyOn(api, 'get').mockResolvedValue([]);
      await platformApi.reports.get('monthly collections/summary', { year: 2026 });
      expect(api.get).toHaveBeenCalledWith('/reports/monthly%20collections%2Fsummary?year=2026');
    });

    it('handles settings list and save', async () => {
      vi.spyOn(api, 'get').mockResolvedValue([]);
      vi.spyOn(api, 'put').mockResolvedValue({});

      await platformApi.settings.list('financer');
      expect(api.get).toHaveBeenCalledWith('/settings?scope=financer');

      await platformApi.settings.save('financer', 'theme/color', { value: 'dark' });
      expect(api.put).toHaveBeenCalledWith('/settings/financer/theme%2Fcolor', { value: 'dark' });
    });
  });

  describe('admin APIs', () => {
    it('handles financers, users, roles, billing, invoices, subscriptions, and logs', async () => {
      vi.spyOn(api, 'get').mockResolvedValue([]);
      vi.spyOn(api, 'post').mockResolvedValue({});
      vi.spyOn(api, 'put').mockResolvedValue({});
      vi.spyOn(api, 'delete').mockResolvedValue({});

      await platformApi.admin.financers({ active: true });
      expect(api.get).toHaveBeenCalledWith('/financers?active=true');

      await platformApi.admin.createFinancer({ name: 'Financer Co' });
      expect(api.post).toHaveBeenCalledWith('/financers', { name: 'Financer Co' });

      await platformApi.admin.changeFinancerStatus('f1', { status: 'Suspended' });
      expect(api.post).toHaveBeenCalledWith('/financers/f1/status', { status: 'Suspended' });

      await platformApi.admin.decideFinancerKyc('f1', { approved: true });
      expect(api.post).toHaveBeenCalledWith('/financers/f1/kyc', { approved: true });

      await platformApi.admin.financerUsage('f1');
      expect(api.get).toHaveBeenCalledWith('/financers/f1/usage');

      await platformApi.admin.billingUsage({ month: '2026-08' });
      expect(api.get).toHaveBeenCalledWith('/financers/billing-usage?month=2026-08');

      await platformApi.admin.users();
      expect(api.get).toHaveBeenCalledWith('/users');

      await platformApi.admin.admins();
      expect(api.get).toHaveBeenCalledWith('/admins');

      await platformApi.admin.createUser({ email: 'new@inrfs.com' });
      expect(api.post).toHaveBeenCalledWith('/users', { email: 'new@inrfs.com' });

      await platformApi.admin.setUserRoles('u1', ['Role_Admin']);
      expect(api.put).toHaveBeenCalledWith('/users/u1/roles', ['Role_Admin']);

      await platformApi.admin.deactivateUser('u1');
      expect(api.delete).toHaveBeenCalledWith('/users/u1');

      await platformApi.admin.userSessions('u1');
      expect(api.get).toHaveBeenCalledWith('/users/u1/sessions');

      await platformApi.admin.revokeSession('u1', 's1');
      expect(api.delete).toHaveBeenCalledWith('/users/u1/sessions/s1');

      await platformApi.admin.roles();
      expect(api.get).toHaveBeenCalledWith('/roles');

      await platformApi.admin.billing({ period: 'Q3' });
      expect(api.get).toHaveBeenCalledWith('/monthly-billing?period=Q3');

      await platformApi.admin.invoices({ unpaid: true });
      expect(api.get).toHaveBeenCalledWith('/service-charges/invoices?unpaid=true');

      await platformApi.admin.generateInvoice({ financerId: 'f1' });
      expect(api.post).toHaveBeenCalledWith('/service-charges/invoices/generate', { financerId: 'f1' });

      await platformApi.admin.collectInvoice('inv_1', { amount: 1000 });
      expect(api.post).toHaveBeenCalledWith('/service-charges/invoices/inv_1/collect', { amount: 1000 });

      await platformApi.admin.creditInvoice('inv_1', { credit: 100 });
      expect(api.post).toHaveBeenCalledWith('/service-charges/invoices/inv_1/credit-note', { credit: 100 });

      await platformApi.admin.subscriptions();
      expect(api.get).toHaveBeenCalledWith('/subscriptions');

      await platformApi.admin.assignSubscription({ planId: 'p1' });
      expect(api.post).toHaveBeenCalledWith('/subscriptions/assign', { planId: 'p1' });

      await platformApi.admin.smsUsage({ month: 'Aug' });
      expect(api.get).toHaveBeenCalledWith('/sms-management/usage?month=Aug');

      await platformApi.admin.auditLogs({ entity: 'User' });
      expect(api.get).toHaveBeenCalledWith('/audit-logs?entity=User');
    });
  });
});
