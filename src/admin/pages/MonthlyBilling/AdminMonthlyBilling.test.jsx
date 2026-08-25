import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminMonthlyBilling from './AdminMonthlyBilling';
import { platformApi } from '../../../common/services/platformApi';
import { MemoryRouter } from 'react-router-dom';

describe('AdminMonthlyBilling Page and BillingStatementModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockFinancers = [
    { id: 'financer-1', displayName: 'Apex Finance', financerNumber: 'FIN-260823-APEX001', status: 'Active' },
  ];

  const mockInvoices = [
    {
      id: 'inv-item-1',
      financerId: 'financer-1',
      invoiceNumber: 'INV-2026-08-001',
      periodStart: '2026-07-26',
      periodEnd: '2026-08-25',
      dueDate: '2026-09-10',
      interestActivity: 10000,
      chargePercentage: 1,
      chargeAmount: 100,
      collectedAmount: 0,
      status: 'Due',
    },
    {
      id: 'inv-item-2',
      financerId: 'financer-1',
      invoiceNumber: 'INV-2026-08-002',
      periodStart: '2026-07-26',
      periodEnd: '2026-08-25',
      dueDate: '2026-09-10',
      interestActivity: 5000,
      chargePercentage: 1,
      chargeAmount: 50,
      collectedAmount: 10,
      status: 'Due',
    },
  ];

  it('renders simplified BillingStatementModal with Statement Details, Invoice Line Items, and compact Record Payment action', async () => {
    vi.spyOn(platformApi.admin, 'allFinancers').mockResolvedValue({ items: mockFinancers });
    vi.spyOn(platformApi.admin, 'allBilling').mockResolvedValue({ items: mockInvoices });
    vi.spyOn(platformApi.admin, 'generateInvoice').mockResolvedValue({ id: 'gen-1' });
    const collectSpy = vi.spyOn(platformApi.admin, 'collectInvoice').mockResolvedValue({ success: true });

    render(
      <MemoryRouter>
        <AdminMonthlyBilling />
      </MemoryRouter>
    );

    // Wait for data to load
    const financerNames = await screen.findAllByText('Apex Finance');
    expect(financerNames.length).toBeGreaterThanOrEqual(1);

    // Click on View Details / View Statement to open BillingStatementModal
    const viewButtons = screen.getAllByRole('button', { name: /view statement/i });
    fireEvent.click(viewButtons[0]);

    // 1. Verify Header
    const modal = document.querySelector('.inrfs-monthly-billing-modal');
    expect(modal).toBeInTheDocument();
    const modalScope = within(modal);
    expect(modalScope.getByRole('heading', { name: /^monthly statement$/i })).toBeInTheDocument();

    // 2. Verify Billing details
    expect(modalScope.getByText('FINANCER')).toBeInTheDocument();
    expect(modalScope.getByText('Apex Finance')).toBeInTheDocument();
    expect(modalScope.getByText('Applicable Interest')).toBeInTheDocument();
    expect(modalScope.getByText('INRFS Service Charge')).toBeInTheDocument();
    expect(modalScope.getByText('Total Service Charge')).toBeInTheDocument();

    // 3. Verify Invoice line items
    expect(modalScope.getByText('Invoice line items')).toBeInTheDocument();
    expect(modalScope.getByText('INV-2026-08-001')).toBeInTheDocument();
    expect(modalScope.getByText('INV-2026-08-002')).toBeInTheDocument();
    expect(modalScope.getByText('2 records')).toBeInTheDocument();

    // 4. Verify removed elements are NOT present in modal
    expect(modalScope.queryByRole('button', { name: /download invoice/i })).not.toBeInTheDocument();
    expect(modalScope.queryByRole('button', { name: /download payment receipt/i })).not.toBeInTheDocument();
    expect(modalScope.queryByLabelText(/credit-note amount/i)).not.toBeInTheDocument();
    expect(modalScope.queryByLabelText(/adjustment reason/i)).not.toBeInTheDocument();
    expect(modalScope.queryByRole('button', { name: /issue credit note/i })).not.toBeInTheDocument();
    expect(modalScope.queryByRole('button', { name: /^close$/i })).not.toBeInTheDocument();

    // 5. Verify payment reference input and Record Payment button
    const referenceInput = modalScope.getByLabelText(/payment reference/i);
    expect(referenceInput).toBeInTheDocument();
    expect(referenceInput).toBeRequired();

    const recordPaymentBtn = modalScope.getByRole('button', { name: /record payment ₹140/i });
    expect(recordPaymentBtn).toBeInTheDocument();

    // Enter payment reference and submit
    fireEvent.change(referenceInput, { target: { value: 'REF-TEST-001' } });
    fireEvent.click(recordPaymentBtn);

    await waitFor(() => {
      expect(collectSpy).toHaveBeenCalledWith('inv-item-1', { amount: 100, reference: 'REF-TEST-001' });
      expect(collectSpy).toHaveBeenCalledWith('inv-item-2', { amount: 40, reference: 'REF-TEST-001' });
    });
  });
});
