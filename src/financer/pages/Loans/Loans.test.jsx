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

  it('opens Create Loan modal with empty defaults for all business and calculated fields', async () => {
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

    // Select Customer is blank
    const customerSelect = screen.getByRole('combobox', { name: /select customer/i });
    expect(customerSelect).toHaveValue('');

    // Principal Amount is empty
    const principalInput = screen.getByRole('spinbutton', { name: /principal amount/i });
    expect(principalInput).toHaveValue(null);

    // Monthly Interest Rate is empty
    const rateInput = screen.getByRole('spinbutton', { name: /monthly interest rate/i });
    expect(rateInput).toHaveValue(null);

    // Loan Period Unit is unselected
    const unitSelect = screen.getByRole('combobox', { name: /loan period unit/i });
    expect(unitSelect).toHaveValue('');

    // Number of Days is empty
    const durationInput = screen.getByRole('spinbutton', { name: /number of/i });
    expect(durationInput).toHaveValue(null);

    // Interest Collection is unselected
    const freqSelect = screen.getByRole('combobox', { name: /interest collection/i });
    expect(freqSelect).toHaveValue('');

    // Start Date is empty
    const startDateInput = screen.getByLabelText(/start date/i);
    expect(startDateInput).toHaveValue('');

    // Maturity Date is empty
    const maturityInput = screen.getByLabelText(/maturity date/i);
    expect(maturityInput).toHaveValue('');

    // First Interest Due is empty
    const dueDateInput = screen.getByLabelText(/first interest due/i);
    expect(dueDateInput).toHaveValue('');

    // Estimated Interest per Day / Collection Interest is empty
    const collectionInterestInput = screen.getByLabelText(/estimated collection interest/i);
    expect(collectionInterestInput).toHaveValue('');

    // Estimated Total Interest is empty
    const totalInterestInput = screen.getByLabelText(/estimated total interest/i);
    expect(totalInterestInput).toHaveValue('');

    // Customer Collection Concern is unchecked
    const concernCheckbox = screen.getByRole('checkbox', { name: /customer collection concern/i });
    expect(concernCheckbox).not.toBeChecked();
  });

  it('validates required fields on submit', async () => {
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [{ id: 'prod-1', isActive: true }] });
    const createSpy = vi.spyOn(platformApi.loans, 'create').mockResolvedValue({ id: 'l-new' });

    render(
      <MemoryRouter>
        <Loans />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const createBtns = screen.getAllByRole('button', { name: /new loan account/i });
    fireEvent.click(createBtns[0]);

    const form = document.querySelector('.fin-create-loan-form');

    // 1. Submit with empty customer
    fireEvent.submit(form);
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a customer.');
    expect(createSpy).not.toHaveBeenCalled();

    // Select customer
    const customerSelect = screen.getByRole('combobox', { name: /select customer/i });
    fireEvent.change(customerSelect, { target: { value: 'c-1' } });

    // 2. Submit with empty principal
    fireEvent.submit(form);
    expect(screen.getByRole('alert')).toHaveTextContent('Principal amount must be greater than 0.');

    // Enter valid principal
    const principalInput = screen.getByRole('spinbutton', { name: /principal amount/i });
    fireEvent.change(principalInput, { target: { value: '10000' } });

    // 3. Submit with empty rate
    fireEvent.submit(form);
    expect(screen.getByRole('alert')).toHaveTextContent('Interest rate must be greater than 0.');

    // Enter valid rate
    const rateInput = screen.getByRole('spinbutton', { name: /monthly interest rate/i });
    fireEvent.change(rateInput, { target: { value: '18' } });

    // 4. Submit with empty period unit
    fireEvent.submit(form);
    expect(screen.getByRole('alert')).toHaveTextContent('Please select a loan period unit.');

    // Select period unit
    const unitSelect = screen.getByRole('combobox', { name: /loan period unit/i });
    fireEvent.change(unitSelect, { target: { value: 'Days' } });

    // 5. Submit with empty duration value
    fireEvent.submit(form);
    expect(screen.getByRole('alert')).toHaveTextContent('Number of days must be a positive whole number.');

    // Enter duration value
    const durationInput = screen.getByRole('spinbutton', { name: /number of/i });
    fireEvent.change(durationInput, { target: { value: '13' } });

    // 6. Submit with empty interest collection
    fireEvent.submit(form);
    expect(screen.getByRole('alert')).toHaveTextContent('Please select an interest collection frequency.');

    // Select interest collection
    const freqSelect = screen.getByRole('combobox', { name: /interest collection/i });
    fireEvent.change(freqSelect, { target: { value: 'Daily' } });

    // 7. Submit with empty start date
    fireEvent.submit(form);
    expect(screen.getByRole('alert')).toHaveTextContent('Start date is required.');
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
    const selectCustomer = screen.getByRole('combobox', { name: /select customer/i });
    fireEvent.change(selectCustomer, { target: { value: 'c-1' } });

    // Fill form
    fireEvent.change(screen.getByRole('spinbutton', { name: /principal amount/i }), { target: { value: '10000' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /monthly interest rate/i }), { target: { value: '18' } });
    fireEvent.change(screen.getByRole('combobox', { name: /loan period unit/i }), { target: { value: 'Days' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /number of/i }), { target: { value: '13' } });
    fireEvent.change(screen.getByRole('combobox', { name: /interest collection/i }), { target: { value: 'Daily' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-01-01' } });

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
          principal: 10000,
          interestRate: 18,
          durationUnit: 'Days',
          durationValue: 13,
          startDate: '2026-01-01',
          collectionConcern: true,
        })
      );
    });
  });

  it('calculates monthly interest correctly as ₹1,800 for ₹10,000 principal at 18% monthly rate', async () => {
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

    // Fill Principal: 10000
    const principalInput = screen.getByRole('spinbutton', { name: /principal amount/i });
    fireEvent.change(principalInput, { target: { value: '10000' } });

    // Fill Monthly Interest Rate: 18%
    const rateInput = screen.getByRole('spinbutton', { name: /monthly interest rate/i });
    fireEvent.change(rateInput, { target: { value: '18' } });

    // Select Monthly frequency and 1 Month duration
    const unitSelect = screen.getByRole('combobox', { name: /loan period unit/i });
    fireEvent.change(unitSelect, { target: { value: 'Months' } });

    const countInput = screen.getByRole('spinbutton', { name: /number of/i });
    fireEvent.change(countInput, { target: { value: '1' } });

    const freqSelect = screen.getByRole('combobox', { name: /interest collection/i });
    fireEvent.change(freqSelect, { target: { value: 'Monthly' } });

    // Check that Estimated First Monthly Interest and Estimated Total Interest are both ₹1,800
    const values = screen.getAllByDisplayValue('₹1,800');
    expect(values.length).toBe(2); // One for collection interest, one for total interest
  });

  it('submits loan with monthly rate (e.g. 10%) without exceeding 0-100 annual interest rate constraint', async () => {
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({
      items: [{ id: 'prod-1', name: 'Standard Product', isActive: true, minimumTenureMonths: 1 }],
    });
    const createSpy = vi.spyOn(platformApi.loans, 'create').mockResolvedValue({ id: 'loan-new', loanNumber: 'LN-NEW-1' });

    render(
      <MemoryRouter>
        <Loans />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const createBtns = screen.getAllByRole('button', { name: /new loan account/i });
    fireEvent.click(createBtns[0]);

    // Select customer
    const customerSelect = screen.getByRole('combobox', { name: /select customer/i });
    fireEvent.change(customerSelect, { target: { value: 'c-1' } });

    // Fill Principal: 10000
    const principalInput = screen.getByRole('spinbutton', { name: /principal amount/i });
    fireEvent.change(principalInput, { target: { value: '10000' } });

    // Fill Monthly Interest Rate: 10%
    const rateInput = screen.getByRole('spinbutton', { name: /monthly interest rate/i });
    fireEvent.change(rateInput, { target: { value: '10' } });

    // Fill other required fields
    fireEvent.change(screen.getByRole('combobox', { name: /loan period unit/i }), { target: { value: 'Months' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /number of/i }), { target: { value: '12' } });
    fireEvent.change(screen.getByRole('combobox', { name: /interest collection/i }), { target: { value: 'Monthly' } });
    fireEvent.change(screen.getByLabelText(/start date/i), { target: { value: '2026-01-01' } });

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /create loan/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'c-1',
          principal: 10000,
          interestRate: 10,
          interestRateBasis: 'PerMonth',
          annualInterestRate: expect.any(Number),
        })
      );
      const callArg = createSpy.mock.calls[0][0];
      expect(callArg.annualInterestRate).toBeLessThanOrEqual(100);
      expect(callArg.annualInterestRate).toBeGreaterThanOrEqual(0);
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
