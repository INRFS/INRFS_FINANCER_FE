import React, { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import FinancerSidebar from '../components/FinancerSidebar';
import FinancerHeader from '../components/FinancerHeader';
import Modal from '../../common/components/Modal';
import Button from '../../common/components/Button';
import { pageItems, platformApi } from '../../common/services/platformApi';
import './FinancerLayout.css';

export default function FinancerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ customer: '', loanId: '', amount: '', mode: 'UPI' });
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [paymentError, setPaymentError] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    if (!isRecordModalOpen) return;
    Promise.all([platformApi.customers.all(), platformApi.loans.all()])
      .then(([customerPayload, loanPayload]) => {
        setCustomers(pageItems(customerPayload));
        setLoans(pageItems(loanPayload));
      })
      .catch((error) => setPaymentError(error.message));
  }, [isRecordModalOpen]);

  const availableLoans = useMemo(() => loans.filter((loan) => !paymentForm.customer || loan.customerId === paymentForm.customer), [loans, paymentForm.customer]);

  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    setSavingPayment(true);
    setPaymentError('');
    try {
      const modeMap = { UPI: 'Upi', Cash: 'Cash', 'Bank Transfer': 'BankTransfer', Cheque: 'Cheque' };
      await platformApi.payments.record({ loanId: paymentForm.loanId, paymentScheduleId: null, amount: Number(paymentForm.amount), receivedAt: new Date().toISOString(), mode: modeMap[paymentForm.mode], externalReference: null, notes: 'Quick payment' });
      setIsRecordModalOpen(false);
      setPaymentForm({ customer: '', loanId: '', amount: '', mode: 'UPI' });
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setSavingPayment(false);
    }
  };

  return (
    <div className="fin-layout">
      <FinancerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="fin-layout-wrapper">
        <FinancerHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onQuickPayment={() => setIsRecordModalOpen(true)}
        />
        
        <main className="fin-layout-content">
          <Outlet />
        </main>
      </div>

      {/* Global Quick Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record New Payment"
      >
        <form onSubmit={handleRecordPaymentSubmit} className="fin-layout-payment-form">
          {paymentError && <p role="alert">{paymentError}</p>}
          <div className="fin-layout-form-group">
            <label>Select Customer</label>
            <select
              value={paymentForm.customer}
              onChange={(e) => setPaymentForm({ ...paymentForm, customer: e.target.value })}
              required
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName}</option>)}
            </select>
          </div>

          <div className="fin-layout-form-group">
            <label>Select Loan</label>
            <select value={paymentForm.loanId} onChange={(e) => setPaymentForm({ ...paymentForm, loanId: e.target.value })} required>
              <option value="">-- Choose Loan --</option>
              {availableLoans.map((loan) => <option key={loan.id} value={loan.id}>{loan.loanNumber || loan.id}</option>)}
            </select>
          </div>

          <div className="fin-layout-form-group">
            <label>Payment Amount (₹)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              required
            />
          </div>

          <div className="fin-layout-form-group">
            <label>Payment Mode</label>
            <select
              value={paymentForm.mode}
              onChange={(e) => setPaymentForm({ ...paymentForm, mode: e.target.value })}
            >
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="fin-layout-form-actions">
            <Button type="button" variant="secondary" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan" disabled={savingPayment}>
              {savingPayment ? 'Saving…' : 'Save Payment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
