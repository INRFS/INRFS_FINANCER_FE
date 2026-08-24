import { render, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import Dashboard from './Dashboard';
import { platformApi } from '../../../common/services/platformApi';

vi.mock('../../../auth/authState', () => ({
  useAuth: () => ({
    user: { firstName: 'Demo', lastName: 'Financer', role: 'Financer' },
  }),
}));

describe('Financer Dashboard', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders all 5 metric cards including Total Interest Collected from API data', async () => {
    vi.spyOn(platformApi.dashboard, 'financer').mockResolvedValue({
      totalCustomers: 12,
      activeLoans: 8,
      totalPrincipal: 625000,
      principalOutstanding: 325000,
      totalInterestCollected: 16700,
      loanStatusData: [],
      monthlyCollections: [],
      upcomingPayments: [],
    });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue([]);

    const { findByText, getByText } = render(<Dashboard />);

    expect(await findByText('₹16,700')).toBeInTheDocument();
    expect(getByText('TOTAL CUSTOMERS')).toBeInTheDocument();
    expect(getByText('12')).toBeInTheDocument();

    expect(getByText('ACTIVE LOANS')).toBeInTheDocument();
    expect(getByText('8')).toBeInTheDocument();

    expect(getByText('TOTAL GIVEN')).toBeInTheDocument();
    expect(getByText('₹6,25,000')).toBeInTheDocument();

    expect(getByText('PRINCIPAL OUTSTANDING')).toBeInTheDocument();
    expect(getByText('₹3,25,000')).toBeInTheDocument();

    expect(getByText('TOTAL INTEREST COLLECTED')).toBeInTheDocument();
    expect(getByText('Interest received')).toBeInTheDocument();
  });

  it('calculates totalInterestCollected from payment records when backend only returns collections summary', async () => {
    vi.spyOn(platformApi.dashboard, 'financer').mockResolvedValue({
      totalCustomers: 6,
      activeLoans: 6,
      totalPrincipal: 625000,
      principalOutstanding: 325000,
      collections: 306847.8,
      loanStatusData: [],
      monthlyCollections: [],
      upcomingPayments: [],
    });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue({
      items: [
        { id: '1', principalAmount: 10000, interestAmount: 2000, amount: 12000, status: 'Completed' },
        { id: '2', principalAmount: 5000, interestAmount: 1500, amount: 6500, status: 'Completed' },
        { id: '3', principalAmount: 20000, interestAmount: 0, amount: 20000, status: 'Completed' },
      ],
      totalCount: 3,
      totalPages: 1,
    });

    const { findByText, getByText } = render(<Dashboard />);

    // 2000 + 1500 = 3500 (principal 10000+5000+20000 is excluded)
    expect(await findByText('₹3,500')).toBeInTheDocument();
    expect(getByText('TOTAL INTEREST COLLECTED')).toBeInTheDocument();
  });

  it('renders ₹0 when totalInterestCollected is zero or null and no payments exist', async () => {
    vi.spyOn(platformApi.dashboard, 'financer').mockResolvedValue({
      totalCustomers: 5,
      activeLoans: 3,
      totalPrincipal: 50000,
      principalOutstanding: 25000,
      totalInterestCollected: 0,
      loanStatusData: [],
      monthlyCollections: [],
      upcomingPayments: [],
    });
    vi.spyOn(platformApi.payments, 'all').mockResolvedValue([]);

    const { findByText, getByText } = render(<Dashboard />);

    expect(await findByText('₹50,000')).toBeInTheDocument();
    expect(getByText('TOTAL INTEREST COLLECTED')).toBeInTheDocument();
    expect(getByText('₹0')).toBeInTheDocument();
  });
});
