import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import AdminNotifications from './AdminNotifications';
import { platformApi } from '../../../common/services/platformApi';
import { collectionConcernService } from '../../../common/services/collectionConcernService';

describe('AdminNotifications Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockConcerns = [
    {
      id: 'concern-1',
      customerId: 'cust-1',
      customerName: 'Rahul Sharma',
      customerNumber: 'CUST-1001',
      loanId: 'loan-1',
      loanNumber: 'LN-2026-001',
      principal: 20000,
      annualInterestRate: 2,
      durationValue: 12,
      durationUnit: 'Months',
      startDate: '2026-08-25',
      financerName: 'Vikas Finance',
      status: 'PENDING',
      reason: 'Financer flagged potentially difficult repayment collection',
      createdAt: '2026-08-25T10:00:00.000Z',
      adminNotes: '',
    },
    {
      id: 'concern-2',
      customerId: 'cust-2',
      customerName: 'Pooja Verma',
      customerNumber: 'CUST-1002',
      loanId: 'loan-2',
      loanNumber: 'LN-2026-002',
      principal: 50000,
      annualInterestRate: 1.5,
      durationValue: 6,
      durationUnit: 'Months',
      startDate: '2026-08-20',
      financerName: 'Star Credits',
      status: 'RESOLVED',
      reason: 'Financer flagged potentially difficult repayment collection',
      createdAt: '2026-08-20T10:00:00.000Z',
      adminNotes: 'Resolved after verification',
      handledByAdminName: 'Admin Officer',
    },
  ];

  it('renders Collection Concerns tab with metrics and concern cards', async () => {
    vi.spyOn(platformApi.collectionConcerns, 'list').mockResolvedValue({ items: mockConcerns });
    vi.spyOn(platformApi.notifications, 'list').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.admin, 'allFinancers').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <AdminNotifications />
      </MemoryRouter>
    );

    expect(await screen.findByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Pooja Verma')).toBeInTheDocument();
    expect(screen.getByText('LN-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Vikas Finance')).toBeInTheDocument();

    // Check status badges
    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Resolved').length).toBeGreaterThan(0);
  });

  it('filters concerns by status chip and search keyword', async () => {
    vi.spyOn(platformApi.collectionConcerns, 'list').mockResolvedValue({ items: mockConcerns });
    vi.spyOn(platformApi.notifications, 'list').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.admin, 'allFinancers').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <AdminNotifications />
      </MemoryRouter>
    );

    expect(await screen.findByText('Rahul Sharma')).toBeInTheDocument();

    // Filter by Pending
    const pendingChip = screen.getByRole('button', { name: /pending \(1\)/i });
    fireEvent.click(pendingChip);

    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.queryByText('Pooja Verma')).not.toBeInTheDocument();

    // Search filter
    const searchInput = screen.getByPlaceholderText(/search by customer/i);
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

    expect(screen.queryByText('Rahul Sharma')).not.toBeInTheDocument();
    expect(screen.getByText(/no customer collection concerns found/i)).toBeInTheDocument();
  });

  it('opens View Details modal and allows admin to update notes and mark as Action Taken', async () => {
    vi.spyOn(platformApi.collectionConcerns, 'list').mockResolvedValue({ items: mockConcerns });
    vi.spyOn(platformApi.notifications, 'list').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.admin, 'allFinancers').mockResolvedValue({ items: [] });
    const updateSpy = vi.spyOn(platformApi.collectionConcerns, 'update').mockResolvedValue({
      ...mockConcerns[0],
      status: 'ACTION_TAKEN',
      adminNotes: 'Contacted financer and scheduled in-person visit.',
      handledByAdminName: 'Super Admin',
    });

    render(
      <MemoryRouter>
        <AdminNotifications />
      </MemoryRouter>
    );

    expect(await screen.findByText('Rahul Sharma')).toBeInTheDocument();

    const viewDetailsBtns = screen.getAllByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsBtns[0]);

    // Modal opens
    expect(screen.getByRole('heading', { name: /customer collection concern details/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /take administrative action/i })).toBeInTheDocument();

    // Enter notes
    const notesInput = screen.getByPlaceholderText(/e\.g\. contacted financer/i);
    fireEvent.change(notesInput, { target: { value: 'Contacted financer and scheduled in-person visit.' } });

    // Click Mark as Action Taken
    const actionTakenBtn = screen.getByRole('button', { name: /mark as action taken/i });
    fireEvent.click(actionTakenBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        'concern-1',
        expect.objectContaining({
          status: 'ACTION_TAKEN',
          adminNotes: 'Contacted financer and scheduled in-person visit.',
        })
      );
    });
  });

  it('allows admin to resolve a concern via Mark as Resolved button', async () => {
    vi.spyOn(platformApi.collectionConcerns, 'list').mockResolvedValue({ items: mockConcerns });
    vi.spyOn(platformApi.notifications, 'list').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.admin, 'allFinancers').mockResolvedValue({ items: [] });
    const updateSpy = vi.spyOn(platformApi.collectionConcerns, 'update').mockResolvedValue({
      ...mockConcerns[0],
      status: 'RESOLVED',
      adminNotes: 'Repayment received on time.',
      handledByAdminName: 'Super Admin',
    });

    render(
      <MemoryRouter>
        <AdminNotifications />
      </MemoryRouter>
    );

    expect(await screen.findByText('Rahul Sharma')).toBeInTheDocument();

    const viewDetailsBtns = screen.getAllByRole('button', { name: /view details/i });
    fireEvent.click(viewDetailsBtns[0]);

    const resolveBtn = screen.getByRole('button', { name: /mark as resolved/i });
    fireEvent.click(resolveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        'concern-1',
        expect.objectContaining({
          status: 'RESOLVED',
        })
      );
    });
  });
});
