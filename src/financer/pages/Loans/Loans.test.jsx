import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Loans from './Loans';
import { platformApi } from '../../../common/services/platformApi';
import { MemoryRouter } from 'react-router-dom';

describe('Loans Page Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCustomers = [
    { id: 'c-1', fullName: 'John Doe', phone: '9876543210' },
  ];

  const mockLoans = [
    {
      id: 'l-1',
      loanNumber: 'LN-2026-001',
      customerId: 'c-1',
      principal: 100000,
      interestRate: 2,
      status: 'Active',
      startDate: '2026-01-01',
      durationValue: 12,
      durationUnit: 'Months',
    },
    {
      id: 'l-2',
      loanNumber: 'LN-2026-002',
      customerId: 'c-1',
      principal: 50000,
      interestRate: 1.5,
      status: 'Closed',
      startDate: '2025-01-01',
      durationValue: 6,
      durationUnit: 'Months',
    },
  ];

  it('renders loan list with formatted principal and numbers', async () => {
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: mockLoans });
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Loans />
      </MemoryRouter>
    );

    expect(await screen.findByText('LN-2026-001')).toBeInTheDocument();
    expect(screen.getByText('LN-2026-002')).toBeInTheDocument();
  });

  it('filters loans by search query', async () => {
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: mockLoans });
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Loans />
      </MemoryRouter>
    );

    expect(await screen.findByText('LN-2026-001')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search loan ID or customer/i);
    fireEvent.change(searchInput, { target: { value: 'LN-2026-001' } });

    await waitFor(() => {
      expect(screen.getByText('LN-2026-001')).toBeInTheDocument();
      expect(screen.queryByText('LN-2026-002')).not.toBeInTheDocument();
    });
  });

  it('opens and closes the Create Loan modal', async () => {
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Loans />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const createBtns = screen.getAllByRole('button', { name: /new loan account/i });
    fireEvent.click(createBtns[0]);

    expect(screen.getByRole('heading', { name: /create new loan/i })).toBeInTheDocument();
    expect(screen.getByText(/interest collection/i)).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /create new loan/i })).not.toBeInTheDocument();
    });
  });

  it('renders Customer Collection Concern checkbox unchecked by default and sends flag on submit', async () => {
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [{ id: 'prod-1', name: 'Standard', isActive: true }] });
    const createSpy = vi.spyOn(platformApi.loans, 'create').mockResolvedValue({ id: 'l-new', loanNumber: 'LN-NEW-001' });

    render(
      <MemoryRouter>
        <Loans />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const createBtns = screen.getAllByRole('button', { name: /new loan account/i });
    fireEvent.click(createBtns[0]);

    const concernCheckbox = screen.getByRole('checkbox', { name: /customer collection concern/i });
    expect(concernCheckbox).toBeInTheDocument();
    expect(concernCheckbox).not.toBeChecked();
    expect(screen.getByText(/flag this customer if you expect difficulty collecting repayments/i)).toBeInTheDocument();

    // Select customer
    const selectCustomer = screen.getByDisplayValue('Select customer');
    fireEvent.change(selectCustomer, { target: { value: 'c-1' } });

    // Check the concern checkbox
    fireEvent.click(concernCheckbox);
    expect(concernCheckbox).toBeChecked();

    // Submit loan
    const submitBtn = screen.getByRole('button', { name: /create loan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'c-1',
          collectionConcern: true,
        })
      );
    });
  });

  it('displays error alert when API fetch fails', async () => {
    vi.spyOn(platformApi.loans, 'all').mockRejectedValue(new Error('Failed to load loans'));
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Loans />
      </MemoryRouter>
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to load loans');
  });
});
