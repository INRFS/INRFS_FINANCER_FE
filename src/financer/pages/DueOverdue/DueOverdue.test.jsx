import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DueOverdue from './DueOverdue';
import { platformApi } from '../../../common/services/platformApi';

describe('DueOverdue Page Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockCollections = [
    {
      id: 'col-1',
      loanNumber: 'LN-DUE-01',
      customer: 'Priya Sharma',
      customerPhone: '9876543210',
      due: 2500,
      daysPastDue: 0,
      dueDate: '2026-08-25',
      status: 'Due',
    },
    {
      id: 'col-2',
      loanNumber: 'LN-OVD-02',
      customer: 'Amit Patel',
      customerPhone: '9123456789',
      due: 5000,
      daysPastDue: 15,
      dueDate: '2026-08-01',
      status: 'Overdue',
    },
  ];

  it('renders collections from API and displays due items on default tab', async () => {
    vi.spyOn(platformApi.collections, 'list').mockResolvedValue({ items: mockCollections });

    render(<DueOverdue />);

    expect(await screen.findByText('LN-DUE-01')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
  });

  it('switches to overdue tab and displays overdue items', async () => {
    vi.spyOn(platformApi.collections, 'list').mockResolvedValue({ items: mockCollections });

    render(<DueOverdue />);

    expect(await screen.findByText('LN-DUE-01')).toBeInTheDocument();

    const overdueTab = screen.getByRole('button', { name: /overdue/i });
    fireEvent.click(overdueTab);

    await waitFor(() => {
      expect(screen.getByText('LN-OVD-02')).toBeInTheDocument();
      expect(screen.getByText('Amit Patel')).toBeInTheDocument();
    });
  });

  it('sends payment reminder when clicking Send Reminder button', async () => {
    vi.spyOn(platformApi.collections, 'list').mockResolvedValue({ items: mockCollections });
    vi.spyOn(platformApi.collections, 'remind').mockResolvedValue({ success: true });

    render(<DueOverdue />);

    expect(await screen.findByText('LN-DUE-01')).toBeInTheDocument();

    const remindBtns = screen.getAllByRole('button', { name: /send reminder/i });
    fireEvent.click(remindBtns[0]);

    await waitFor(() => {
      expect(platformApi.collections.remind).toHaveBeenCalledWith('col-1', expect.objectContaining({
        type: 'PaymentReminder',
      }));
    });
  });

  it('displays error alert on failure', async () => {
    vi.spyOn(platformApi.collections, 'list').mockRejectedValue(new Error('Failed to fetch collections'));

    render(<DueOverdue />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to fetch collections');
  });
});
