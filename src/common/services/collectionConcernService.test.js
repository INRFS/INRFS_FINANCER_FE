import { beforeEach, describe, expect, it, vi } from 'vitest';
import { collectionConcernService } from './collectionConcernService';

describe('CollectionConcernService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('creates a concern and admin notification when flag is true (status = PENDING)', async () => {
    const data = {
      customerId: 'c-101',
      customerName: 'Alice Johnson',
      customerNumber: 'CUST-001',
      loanId: 'l-501',
      loanNumber: 'LN-2026-501',
      principal: 25000,
      annualInterestRate: 2,
      durationValue: 6,
      durationUnit: 'Months',
      interestFrequency: 'Monthly',
      startDate: '2026-08-25',
      financerId: 'fin-01',
      financerName: 'Premier Finance',
    };

    const concern = await collectionConcernService.createConcern(data);

    expect(concern).toBeDefined();
    expect(concern.status).toBe('PENDING');
    expect(concern.customerName).toBe('Alice Johnson');
    expect(concern.loanNumber).toBe('LN-2026-501');
    expect(concern.principal).toBe(25000);

    const concernsList = await collectionConcernService.listConcerns();
    expect(concernsList.items).toHaveLength(1);
    expect(concernsList.items[0].id).toBe(concern.id);

    const notifs = collectionConcernService.getNotifications();
    expect(notifs).toHaveLength(1);
    expect(notifs[0].title).toBe('Customer Collection Concern');
    expect(notifs[0].readAt).toBeNull();
    expect(notifs[0].concernStatus).toBe('PENDING');
    expect(notifs[0].customerName).toBe('Alice Johnson');
  });

  it('prevents duplicate concern and notification creation for the same loan', async () => {
    const data = {
      customerId: 'c-101',
      customerName: 'Alice Johnson',
      loanId: 'l-501',
      loanNumber: 'LN-2026-501',
      principal: 25000,
      financerName: 'Premier Finance',
    };

    const concern1 = await collectionConcernService.createConcern(data);
    const concern2 = await collectionConcernService.createConcern(data);

    expect(concern1.id).toBe(concern2.id);

    const concernsList = await collectionConcernService.listConcerns();
    expect(concernsList.items).toHaveLength(1);

    const notifs = collectionConcernService.getNotifications();
    expect(notifs).toHaveLength(1);
  });

  it('marks notification as read without changing concern status (Read != Resolved)', async () => {
    const data = {
      customerId: 'c-102',
      customerName: 'Bob Smith',
      loanId: 'l-502',
      loanNumber: 'LN-2026-502',
      principal: 50000,
      financerName: 'Apex Capital',
    };

    const concern = await collectionConcernService.createConcern(data);
    const notifsBefore = collectionConcernService.getNotifications();
    const notifId = notifsBefore[0].id;

    await collectionConcernService.markNotificationRead(notifId);

    const notifsAfter = collectionConcernService.getNotifications();
    expect(notifsAfter[0].readAt).not.toBeNull();

    // Concern must remain PENDING
    const concernAfter = await collectionConcernService.getConcern(concern.id);
    expect(concernAfter.status).toBe('PENDING');
  });

  it('updates concern status and stores Admin notes and audit info', async () => {
    const data = {
      customerId: 'c-103',
      customerName: 'Charlie Brown',
      loanId: 'l-503',
      loanNumber: 'LN-2026-503',
      principal: 15000,
      financerName: 'Fast Loans',
    };

    const concern = await collectionConcernService.createConcern(data);

    const updated = await collectionConcernService.updateConcern(concern.id, {
      status: 'ACTION_TAKEN',
      adminNotes: 'Contacted financer and advised special collection visits.',
      handledByAdminId: 'admin-007',
      handledByAdminName: 'Super Admin',
    });

    expect(updated.status).toBe('ACTION_TAKEN');
    expect(updated.adminNotes).toBe('Contacted financer and advised special collection visits.');
    expect(updated.handledByAdminId).toBe('admin-007');
    expect(updated.handledByAdminName).toBe('Super Admin');
    expect(updated.actionDate).not.toBeNull();

    // Notification metadata should also reflect new concern status
    const notifs = collectionConcernService.getNotifications();
    expect(notifs[0].concernStatus).toBe('ACTION_TAKEN');
  });

  it('marks concern as RESOLVED when resolved by admin', async () => {
    const data = {
      customerId: 'c-104',
      customerName: 'Diana Prince',
      loanId: 'l-504',
      loanNumber: 'LN-2026-504',
      principal: 75000,
      financerName: 'Shield Finance',
    };

    const concern = await collectionConcernService.createConcern(data);

    const updated = await collectionConcernService.updateConcern(concern.id, {
      status: 'RESOLVED',
      adminNotes: 'Customer cleared initial installment. Risk lowered.',
      handledByAdminId: 'admin-001',
      handledByAdminName: 'Diana Admin',
    });

    expect(updated.status).toBe('RESOLVED');
    expect(updated.adminNotes).toBe('Customer cleared initial installment. Risk lowered.');
  });
});
