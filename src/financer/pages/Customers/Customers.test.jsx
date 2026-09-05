import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Customers from './Customers';
import { platformApi } from '../../../common/services/platformApi';
import { MemoryRouter } from 'react-router-dom';

describe('Customers Page Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCustomers = [
    {
      id: 'cust-1',
      fullName: 'Ramesh Kumar',
      customerNumber: 'CUS-2026-001',
      phone: '9876543210',
      email: 'ramesh@example.com',
      status: 'Active',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      addressLine1: 'Flat 101',
      dateOfBirth: '1990-01-01',
    },
    {
      id: 'cust-2',
      fullName: 'Asha Rao',
      customerNumber: 'CUS-2026-002',
      phone: '9123456780',
      email: 'asha@example.com',
      status: 'Inactive',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      addressLine1: 'Building 2',
      dateOfBirth: '1992-05-15',
    },
  ];

  it('renders customer list fetched from APIs', async () => {
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    expect(await screen.findByText('Ramesh Kumar')).toBeInTheDocument();
    expect(screen.getByText('Asha Rao')).toBeInTheDocument();
  });

  it('filters customer list based on search input', async () => {
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    expect(await screen.findByText('Ramesh Kumar')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search by customer name/i);
    fireEvent.change(searchInput, { target: { value: 'Ramesh' } });

    expect(await screen.findByText('Ramesh Kumar')).toBeInTheDocument();
    expect(screen.queryByText('Asha Rao')).not.toBeInTheDocument();
  });

  it('opens and closes the Add Customer modal', async () => {
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const addBtns = screen.getAllByRole('button', { name: /add customer/i });
    fireEvent.click(addBtns[0]);

    expect(screen.getByRole('heading', { name: /add new customer/i })).toBeInTheDocument();
    expect(screen.getAllByText(/personal info/i).length).toBeGreaterThan(0);

    const closeBtn = document.querySelector('.fin-customer-modal-close');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /add new customer/i })).not.toBeInTheDocument();
    });
  });

  it('validates mandatory fields and blocks wizard progression on empty submission', async () => {
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const addBtns = screen.getAllByRole('button', { name: /add customer/i });
    fireEvent.click(addBtns[0]);

    // Click Continue without filling anything
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.submit(continueBtn.closest('form'));

    // Expect validation errors to appear and remain on Step 1
    await waitFor(() => {
      expect(screen.getAllByText(/Full name is required/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
    });
  });

  it('validates duplicate mobile number and blocks duplicate registration', async () => {
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const addBtns = screen.getAllByRole('button', { name: /add customer/i });
    fireEvent.click(addBtns[0]);

    const nameInput = screen.getByPlaceholderText('Ramesh Kumar');
    fireEvent.change(nameInput, { target: { value: 'Sunil Kumar' } });

    // Enter existing customer's mobile
    const mobileInput = screen.getByPlaceholderText('+91 98001 11111');
    fireEvent.change(mobileInput, { target: { value: '9876543210' } });

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(screen.getAllByText('Mobile number already exists.').length).toBeGreaterThan(0);
      expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
    });
  });

  it('requires the four KYC documents before customer creation', async () => {
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

    const createSpy = vi.spyOn(platformApi.customers, 'create').mockResolvedValue({
      id: 'c-new',
      fullName: 'Vikram Singh',
      phone: '9988776655',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411001',
      dateOfBirth: '1995-03-10',
      status: 'Active',
    });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const addBtns = screen.getAllByRole('button', { name: /add customer/i });
    fireEvent.click(addBtns[0]);

    // Step 1: Fill Personal Info
    fireEvent.change(screen.getByPlaceholderText('Ramesh Kumar'), { target: { value: 'Vikram Singh' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98001 11111'), { target: { value: '9988776655' } });
    const genderSelect = screen.getByLabelText(/Gender/i);
    fireEvent.change(genderSelect, { target: { value: 'Male' } });
    const dobInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dobInputs[0], { target: { value: '1995-03-10' } });

    // Continue to Step 2
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2: Address
    expect(await screen.findByText(/Step 2 of 4/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('MG Road'), { target: { value: 'FC Road' } });
    fireEvent.change(screen.getByPlaceholderText('Mumbai'), { target: { value: 'Pune' } });
    fireEvent.change(screen.getByPlaceholderText('Maharashtra'), { target: { value: 'Maharashtra' } });
    fireEvent.change(screen.getByPlaceholderText('400001'), { target: { value: '411001' } });

    // Continue to Step 3
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: KYC (Optional)
    expect(await screen.findByText(/Step 3 of 4/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4: Documents (Optional)
    expect(await screen.findByText(/Step 4 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save customer/i })).toBeInTheDocument();

    // Click Save Customer without uploading documents
    fireEvent.click(screen.getByRole('button', { name: /save customer/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Aadhaar document is required/i).length).toBeGreaterThan(0);
      expect(createSpy).not.toHaveBeenCalled();
    });
  });

  it('accepts a valid street name starting with numbers', async () => {
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    const addBtns = screen.getAllByRole('button', { name: /add customer/i });
    fireEvent.click(addBtns[0]);

    // Step 1
    fireEvent.change(screen.getByPlaceholderText('Ramesh Kumar'), { target: { value: 'Vikram Singh' } });
    fireEvent.change(screen.getByPlaceholderText('+91 98001 11111'), { target: { value: '9988776655' } });
    fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'Male' } });
    const dobInputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(dobInputs[0], { target: { value: '1995-03-10' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 2
    expect(await screen.findByText(/Step 2 of 4/i)).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('MG Road'), { target: { value: '12 Main Street' } });
    fireEvent.change(screen.getByPlaceholderText('Mumbai'), { target: { value: 'Pune' } });
    fireEvent.change(screen.getByPlaceholderText('Maharashtra'), { target: { value: 'Maharashtra' } });
    fireEvent.change(screen.getByPlaceholderText('400001'), { target: { value: '411001' } });

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Step 3 of 4/i)).toBeInTheDocument();
      expect(screen.queryByText('Street name must start with an alphabet.')).not.toBeInTheDocument();
    });
  });

  it('renders Customer Collection Concern checkbox when adding a loan from Customer screen', async () => {
    vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: mockCustomers });
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({
      items: [{ id: 'prod-1', name: 'Standard Product', annualInterestRate: 18, isActive: true, minimumPrincipal: 1000, maximumPrincipal: 1000000 }],
    });
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });
    const createLoanSpy = vi.spyOn(platformApi.loans, 'create').mockResolvedValue({ id: 'l-new', loanNumber: 'LN-NEW-1' });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    expect(await screen.findByText('Ramesh Kumar')).toBeInTheDocument();

    // Open view customer modal
    const viewBtns = screen.getAllByTitle(/view ramesh kumar/i);
    fireEvent.click(viewBtns[0]);

    // Click Add Loan button in CustomerDetailsModal
    const addLoanBtn = await screen.findByRole('button', { name: /add loan/i });
    fireEvent.click(addLoanBtn);

    // Verify Add Loan modal is open
    expect(await screen.findByRole('heading', { name: /add loan/i })).toBeInTheDocument();

    // Verify form opens completely blank
    const principalInput = screen.getByPlaceholderText('Enter principal amount');
    expect(principalInput).toHaveValue(null);

    const rateInput = screen.getByLabelText(/monthly interest rate/i);
    expect(rateInput).toHaveValue(null);

    const unitSelect = screen.getByLabelText(/loan period unit/i);
    expect(unitSelect).toHaveValue('');

    const durationInput = screen.getByLabelText(/number of/i);
    expect(durationInput).toHaveValue(null);

    const freqSelect = screen.getByLabelText(/interest collection/i);
    expect(freqSelect).toHaveValue('');

    const startDateInput = screen.getByLabelText(/start date/i);
    expect(startDateInput).toHaveValue('');

    // Check Customer Collection Concern checkbox is present and can be toggled
    const concernCheckbox = screen.getByRole('checkbox', { name: /customer collection concern/i });
    expect(concernCheckbox).toBeInTheDocument();
    expect(concernCheckbox).not.toBeChecked();

    fireEvent.click(concernCheckbox);
    expect(concernCheckbox).toBeChecked();

    // Fill required fields
    fireEvent.change(principalInput, { target: { value: '50000' } });
    fireEvent.change(rateInput, { target: { value: '18' } });
    fireEvent.change(unitSelect, { target: { value: 'Days' } });
    fireEvent.change(durationInput, { target: { value: '13' } });
    fireEvent.change(freqSelect, { target: { value: 'Daily' } });
    fireEvent.change(startDateInput, { target: { value: '2026-01-01' } });

    // Submit loan
    const addLoanModalButtons = screen.getAllByRole('button', { name: /add loan/i });
    const submitBtn = addLoanModalButtons.find((btn) => btn.getAttribute('type') === 'submit');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createLoanSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          customerId: 'cust-1',
          principal: 50000,
          interestRate: 18,
          durationUnit: 'Days',
          durationValue: 13,
          startDate: '2026-01-01',
          collectionConcern: true,
        })
      );
    });
  });

  it('displays error alert when API call fails', async () => {
    vi.spyOn(platformApi.customers, 'all').mockRejectedValue(new Error('Network error loading customers'));
    vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

    render(
      <MemoryRouter>
        <Customers />
      </MemoryRouter>
    );

    expect(await screen.findByRole('alert')).toHaveTextContent('Network error loading customers');
  });

  describe('Customer statistics cards', () => {
    it('dynamically computes New This Month, Total Customers, Active Customers, and Overdue Customers from backend records', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      // Created this month (Aug 1, Aug 10, Aug 24)
      const thisMonthCustomer1 = {
        id: 'c-1',
        fullName: 'Customer One',
        status: 'Active',
        createdAt: new Date(currentYear, currentMonth, 1, 0, 0, 0).toISOString(),
      };
      const thisMonthCustomer2 = {
        id: 'c-2',
        fullName: 'Customer Two',
        status: 'Overdue',
        createdAt: new Date(currentYear, currentMonth, 10, 14, 0, 0).toISOString(),
      };
      const thisMonthCustomer3 = {
        id: 'c-3',
        fullName: 'Customer Three',
        status: 'Active',
        createdAt: new Date(currentYear, currentMonth, 24, 18, 30, 0).toISOString(),
      };
      // Created last month (should NOT count for New This Month)
      const lastMonthCustomer = {
        id: 'c-4',
        fullName: 'Customer Four',
        status: 'Active',
        createdAt: new Date(currentYear, currentMonth - 1, 28).toISOString(),
      };
      // Created next month boundary (should NOT count for New This Month)
      const nextMonthCustomer = {
        id: 'c-5',
        fullName: 'Customer Five',
        status: 'Inactive',
        createdAt: new Date(currentYear, currentMonth + 1, 1, 0, 0, 0).toISOString(),
      };

      const testCustomers = [
        thisMonthCustomer1,
        thisMonthCustomer2,
        thisMonthCustomer3,
        lastMonthCustomer,
        nextMonthCustomer,
      ];

      vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: testCustomers });
      vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

      render(
        <MemoryRouter>
          <Customers />
        </MemoryRouter>
      );

      expect(await screen.findByText('Customer One')).toBeInTheDocument();

      // Find stat cards by checking their labels and sibling value elements
      const statCards = document.querySelectorAll('.fin-customer-stat-card');
      const getStatValue = (label) => {
        for (const card of statCards) {
          if (card.textContent.includes(label)) {
            return card.querySelector('strong')?.textContent;
          }
        }
        return null;
      };

      // Total Customers: 5
      expect(getStatValue('Total Customers')).toBe('5');
      // Active Customers: 3 (c-1, c-3, c-4)
      expect(getStatValue('Active Customers')).toBe('3');
      // New This Month: 3 (c-1, c-2, c-3)
      expect(getStatValue('New This Month')).toBe('3');
      // Customers With Overdue: 1 (c-2)
      expect(getStatValue('Customers With Overdue')).toBe('1');
    });

    it('returns 0 for New This Month when no customers were created in current month', async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      const oldCustomers = [
        {
          id: 'c-old-1',
          fullName: 'Old Customer 1',
          status: 'Active',
          createdAt: new Date(currentYear, currentMonth - 2, 15).toISOString(),
        },
        {
          id: 'c-old-2',
          fullName: 'Old Customer 2',
          status: 'Active',
          createdAt: new Date(currentYear, currentMonth - 1, 20).toISOString(),
        },
      ];

      vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: oldCustomers });
      vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

      render(
        <MemoryRouter>
          <Customers />
        </MemoryRouter>
      );

      expect(await screen.findByText('Old Customer 1')).toBeInTheDocument();

      const statCards = document.querySelectorAll('.fin-customer-stat-card');
      let newThisMonthVal = null;
      for (const card of statCards) {
        if (card.textContent.includes('New This Month')) {
          newThisMonthVal = card.querySelector('strong')?.textContent;
        }
      }

      expect(newThisMonthVal).toBe('0');
    });
  });

  describe('Customer Wizard Step 4 - Document Upload & Camera Capture', () => {
    it('renders both Upload from Device and Capture with Camera for all document types', async () => {
      vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });

      render(
        <MemoryRouter>
          <Customers />
        </MemoryRouter>
      );

      await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

      // Open Add Customer Wizard
      const addBtns = screen.getAllByRole('button', { name: /add customer/i });
      fireEvent.click(addBtns[0]);

      // Fill Step 1
      fireEvent.change(screen.getByPlaceholderText('Ramesh Kumar'), { target: { value: 'Anita Desai' } });
      fireEvent.change(screen.getByPlaceholderText('+91 98001 11111'), { target: { value: '9876543210' } });
      fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'Female' } });
      const dobInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dobInputs[0], { target: { value: '1995-05-15' } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Fill Step 2
      expect(await screen.findByText(/Step 2 of 4/i)).toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText('MG Road'), { target: { value: 'Connaught Place' } });
      fireEvent.change(screen.getByPlaceholderText('Mumbai'), { target: { value: 'Delhi' } });
      fireEvent.change(screen.getByPlaceholderText('Maharashtra'), { target: { value: 'Delhi' } });
      fireEvent.change(screen.getByPlaceholderText('400001'), { target: { value: '110001' } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Step 3
      expect(await screen.findByText(/Step 3 of 4/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Step 4: Documents
      expect(await screen.findByText(/Step 4 of 4/i)).toBeInTheDocument();

      // Verify buttons for Aadhaar Card
      expect(screen.getByLabelText(/upload aadhaar card from device/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/capture aadhaar card with camera/i)).toBeInTheDocument();

      // Verify buttons for PAN Card
      expect(screen.getByLabelText(/upload pan card from device/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/capture pan card with camera/i)).toBeInTheDocument();

      // Open camera modal for Aadhaar
      fireEvent.click(screen.getByLabelText(/capture aadhaar card with camera/i));
      expect(await screen.findByRole('heading', { name: /capture aadhaar card/i })).toBeInTheDocument();

      // Cancel camera
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByRole('heading', { name: /capture aadhaar card/i })).not.toBeInTheDocument();
    });

    it('uploads documents using platformApi.documents.upload on submit', async () => {
      vi.spyOn(platformApi.customers, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.loans, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.payments, 'all').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.loans, 'products').mockResolvedValue({ items: [] });
      vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: [] });
      const createSpy = vi.spyOn(platformApi.customers, 'create').mockResolvedValue({
        id: 'cust-new-123',
        fullName: 'Kiran Patel',
        phone: '9812345678',
        city: 'Surat',
        state: 'Gujarat',
        postalCode: '395001',
      });
      const uploadSpy = vi.spyOn(platformApi.documents, 'upload').mockResolvedValue({ id: 'doc-1' });

      render(
        <MemoryRouter>
          <Customers />
        </MemoryRouter>
      );

      await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

      // Open Add Customer Wizard
      const addBtns = screen.getAllByRole('button', { name: /add customer/i });
      fireEvent.click(addBtns[0]);

      // Fill Step 1
      fireEvent.change(screen.getByPlaceholderText('Ramesh Kumar'), { target: { value: 'Kiran Patel' } });
      fireEvent.change(screen.getByPlaceholderText('+91 98001 11111'), { target: { value: '9812345678' } });
      fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'Male' } });
      const dobInputs = document.querySelectorAll('input[type="date"]');
      fireEvent.change(dobInputs[0], { target: { value: '1992-08-20' } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Fill Step 2
      expect(await screen.findByText(/Step 2 of 4/i)).toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText('MG Road'), { target: { value: 'Ring Road' } });
      fireEvent.change(screen.getByPlaceholderText('Mumbai'), { target: { value: 'Surat' } });
      fireEvent.change(screen.getByPlaceholderText('Maharashtra'), { target: { value: 'Gujarat' } });
      fireEvent.change(screen.getByPlaceholderText('400001'), { target: { value: '395001' } });
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Step 3
      expect(await screen.findByText(/Step 3 of 4/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Step 4
      expect(await screen.findByText(/Step 4 of 4/i)).toBeInTheDocument();

      // Attach an Aadhaar file via file input
      const testFile = new File(['sample content'], 'aadhaar_front.jpg', { type: 'image/jpeg' });
      const aadhaarInput = document.getElementById('upload-aadhaar');
      fireEvent.change(aadhaarInput, { target: { files: [testFile] } });
      fireEvent.change(document.getElementById('upload-pan'), { target: { files: [testFile] } });
      fireEvent.change(document.getElementById('upload-address-proof'), { target: { files: [testFile] } });
      fireEvent.change(document.getElementById('upload-photograph'), { target: { files: [testFile] } });

      // Verify file is shown
      expect((await screen.findAllByText('aadhaar_front.jpg')).length).toBe(4);

      // Save customer
      fireEvent.click(screen.getByRole('button', { name: /save customer/i }));

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: 'Kiran Patel',
          })
        );
        expect(uploadSpy).toHaveBeenCalledWith(testFile, 'Aadhaar', 'cust-new-123');
      });
    });
  });
});
