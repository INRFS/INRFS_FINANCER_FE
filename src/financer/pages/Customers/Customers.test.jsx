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
});
