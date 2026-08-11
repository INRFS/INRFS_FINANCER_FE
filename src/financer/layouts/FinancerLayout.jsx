import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import FinancerSidebar from '../components/FinancerSidebar';
import FinancerHeader from '../components/FinancerHeader';
import Modal from '../../common/components/Modal';
import Button from '../../common/components/Button';
import './FinancerLayout.css';

export default function FinancerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ customer: '', loanId: '', amount: '', mode: 'UPI' });

  const handleRecordPaymentSubmit = (e) => {
    e.preventDefault();
    alert(`Payment of ₹${paymentForm.amount} recorded successfully!`);
    setIsRecordModalOpen(false);
    setPaymentForm({ customer: '', loanId: '', amount: '', mode: 'UPI' });
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
          <div className="fin-layout-form-group">
            <label>Select Customer</label>
            <select
              value={paymentForm.customer}
              onChange={(e) => setPaymentForm({ ...paymentForm, customer: e.target.value })}
              required
            >
              <option value="">-- Choose Customer --</option>
              <option value="Ramesh Kumar">Ramesh Kumar (LN000125)</option>
              <option value="Priya Sharma">Priya Sharma (LN000127)</option>
              <option value="Vikram Singh">Vikram Singh (LN000128)</option>
              <option value="Mohammed Ali">Mohammed Ali (LN000131)</option>
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
            <Button type="submit" variant="cyan">
              Save Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
