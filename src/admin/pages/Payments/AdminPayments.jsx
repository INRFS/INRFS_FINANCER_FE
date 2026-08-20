import React, { useEffect, useState } from 'react';
import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatCurrency } from '../../../common/utils/formatters';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import './AdminPayments.css';

export default function AdminPayments() {
  const [search, setSearch] = useState('');
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    platformApi.payments.all().then((payload) => setPayments(pageItems(payload))).catch((reason) => setError(reason.message));
  }, []);
  const filtered = payments.filter((item) => !search.trim() || [item.paymentNumber, item.loanId, item.externalReference].some((value) => String(value || '').toLowerCase().includes(search.trim().toLowerCase())));

  return (
    <div className="admin-payments-page animate-fade-in">
      {error && <p role="alert">{error}</p>}
      <div className="admin-payments-header">
        <div>
          <h1 className="admin-payments-title">System-wide Transactions</h1>
          <p className="admin-payments-subtitle">Audit all payment receipts, bank transfers and UPI transactions.</p>
        </div>
      </div>

      <div className="admin-payments-toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search payment ID or customer..." />
      </div>

      <div className="admin-payments-table-card">
        <div className="admin-payments-table-wrapper">
          <table className="admin-payments-table">
            <thead>
              <tr>
                <th>PAYMENT ID</th>
                <th>FINANCER</th>
                <th>CUSTOMER</th>
                <th>LOAN ID</th>
                <th>AMOUNT</th>
                <th>DATE</th>
                <th>MODE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td><strong className="admin-payments-id">{p.paymentNumber}</strong></td>
                  <td><span className="admin-payments-financer">{p.financerId || '—'}</span></td>
                  <td>{p.customerName || '—'}</td>
                  <td>{p.loanId}</td>
                  <td><strong className="admin-payments-amt">{formatCurrency(p.amount)}</strong></td>
                  <td>{new Date(p.receivedAt).toLocaleString()}</td>
                  <td>{p.mode}</td>
                  <td><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
