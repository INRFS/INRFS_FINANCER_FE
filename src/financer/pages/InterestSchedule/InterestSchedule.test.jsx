import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import InterestSchedule from './InterestSchedule';
import { platformApi } from '../../../common/services/platformApi';

describe('InterestSchedule Page Component', () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;

  beforeEach(() => {
    vi.restoreAllMocks();
    URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  const mockSchedules = [
    {
      id: 'sch-1',
      loanId: 'l-1',
      loanNumber: 'LN-SCH-01',
      customerName: 'Anil Gupta',
      openingPrincipal: 100000,
      interestDue: 2000,
      dueDate: '2026-09-01',
      status: 'Pending',
    },
    {
      id: 'sch-2',
      loanId: 'l-2',
      loanNumber: 'LN-SCH-02',
      customerName: 'Sunita Roy',
      openingPrincipal: 50000,
      interestDue: 1000,
      dueDate: '2026-09-05',
      status: 'Paid',
    },
  ];

  it('renders interest schedules loaded from API', async () => {
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: mockSchedules });

    render(<InterestSchedule />);

    expect(await screen.findByText('LN-SCH-01')).toBeInTheDocument();
    expect(screen.getByText('Anil Gupta')).toBeInTheDocument();
    expect(screen.getByText('Sunita Roy')).toBeInTheDocument();
  });

  it('filters schedules by search query', async () => {
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: mockSchedules });

    render(<InterestSchedule />);

    expect(await screen.findByText('LN-SCH-01')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search loan id or customer/i);
    fireEvent.change(searchInput, { target: { value: 'Anil' } });

    await waitFor(() => {
      expect(screen.queryByText('Sunita Roy')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Anil Gupta')).toBeInTheDocument();
  });

  it('handles CSV export click without error', async () => {
    vi.spyOn(platformApi.payments, 'allSchedules').mockResolvedValue({ items: mockSchedules });

    render(<InterestSchedule />);

    expect(await screen.findByText('LN-SCH-01')).toBeInTheDocument();

    const exportBtn = screen.getByRole('button', { name: /export schedule/i });
    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it('displays error message when schedule load fails', async () => {
    vi.spyOn(platformApi.payments, 'allSchedules').mockRejectedValue(new Error('Schedule API error'));

    render(<InterestSchedule />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Schedule API error');
  });
});
