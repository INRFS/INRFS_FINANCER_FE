import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CollectionOperations from './CollectionOperations';
import { actionableDue, additionalWindowDue, displayCaseStatus, formatDueAmount } from './collectionOperationsUtils';
import { platformApi } from '../../../common/services/platformApi';

describe('displayCaseStatus', () => {
  it('does not label a case collected while upcoming dues remain', () => {
    expect(displayCaseStatus({ caseStatus: 'Collected', due: 89, daysUntilDue: 2 })).toBe('Upcoming');
  });

  it('preserves a genuinely collected case', () => {
    expect(displayCaseStatus({ caseStatus: 'Collected', due: 0, daysUntilDue: 0 })).toBe('Collected');
  });

  it('preserves promise-to-pay workflow state', () => {
    expect(displayCaseStatus({ caseStatus: 'PromiseToPay', due: 100, daysUntilDue: 0 })).toBe('PromiseToPay');
  });
});

describe('collection due amounts', () => {
  it('shows the next installment instead of the whole reminder window', () => {
    const row = { dueNow: 0, nextDue: 9.86, due: 88.74 };
    expect(actionableDue(row)).toBe(9.86);
    expect(additionalWindowDue(row)).toBeCloseTo(78.88);
  });

  it('shows all currently due installments when they exist', () => {
    expect(actionableDue({ dueNow: 19.72, nextDue: 9.86, due: 108.46 })).toBe(19.72);
  });

  it('keeps paise visible', () => {
    expect(formatDueAmount(9.86)).toContain('9.86');
  });
});

describe('CollectionOperations Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders collections table with flagged loan tickets and displays customer and loan details', async () => {
    vi.spyOn(platformApi.collections, 'list').mockResolvedValue({
      items: [
        {
          id: 'loan_101',
          loanNumber: 'LN-1001',
          customer: 'Bala Ramesh',
          customerId: 'cust_1',
          financer: 'Apex Capital',
          dueDate: '2026-09-01',
          due: 15000,
          dueNow: 15000,
          daysPastDue: 0,
          daysUntilDue: 0,
          caseStatus: 'Open',
        },
      ],
    });

    vi.spyOn(platformApi.admin, 'users').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.settings, 'list').mockResolvedValue({ items: [] });

    vi.spyOn(platformApi.collectionConcerns, 'list').mockResolvedValue({
      items: [
        {
          id: 'concern_101',
          loanId: 'loan_101',
          loanNumber: 'LN-1001',
          customerId: 'cust_1',
          customerName: 'Bala Ramesh',
          financerName: 'Apex Capital',
          status: 'PENDING',
          reason: 'Financer flagged potentially difficult repayment collection at loan creation',
          principal: 15000,
          createdAt: '2026-08-25T10:00:00Z',
        },
      ],
    });

    render(<CollectionOperations />);

    expect(await screen.findByText('Bala Ramesh')).toBeInTheDocument();
    expect(screen.getByText('LN-1001')).toBeInTheDocument();
    expect(screen.getByText('Flagged concern')).toBeInTheDocument();

    // Open manage modal
    fireEvent.click(screen.getByRole('button', { name: /manage/i }));
    expect(await screen.findByText(/Flagged Reason:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Financer flagged potentially difficult repayment collection at loan creation/i).length).toBeGreaterThan(0);
  });

  it('integrates stand-alone loan concerns when no standard collection schedule exists', async () => {
    vi.spyOn(platformApi.collections, 'list').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.admin, 'users').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.settings, 'list').mockResolvedValue({ items: [] });

    vi.spyOn(platformApi.collectionConcerns, 'list').mockResolvedValue({
      items: [
        {
          id: 'concern_202',
          loanId: 'loan_202',
          loanNumber: 'LN-2002',
          customerId: 'cust_2',
          customerName: 'Pooja Verma',
          financerName: 'Sunrise Finance',
          status: 'PENDING',
          reason: 'High risk repayment profile flagged during loan onboarding',
          principal: 25000,
          createdAt: '2026-08-25T11:00:00Z',
        },
      ],
    });

    render(<CollectionOperations />);

    expect(await screen.findByText('Pooja Verma')).toBeInTheDocument();
    expect(screen.getByText('LN-2002')).toBeInTheDocument();
    expect(screen.getByText('Flagged concern')).toBeInTheDocument();
  });
});

