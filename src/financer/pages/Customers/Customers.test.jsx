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
});
