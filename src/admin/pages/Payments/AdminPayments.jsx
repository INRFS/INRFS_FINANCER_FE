import React, { useState } from 'react';
import {  RefreshCw } from 'lucide-react';
import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatCurrency } from '../../../common/utils/formatters';
import { mockPaymentsList } from '../../../financer/data/mockFinancerData';
import './AdminPayments.css';

export default function AdminPayments() {
  const [search, setSearch] = useState('');

  return (
    <div className="admin-payments-page animate-fade-in">
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
              {mockPaymentsList.map((p) => (
                <tr key={p.id}>
                  <td><strong className="admin-payments-id">{p.id}</strong></td>
                  <td><span className="admin-payments-financer">Patel Finance Services</span></td>
                  <td>{p.customer}</td>
                  <td>{p.loanId}</td>
                  <td><strong className="admin-payments-amt">{formatCurrency(p.amount)}</strong></td>
                  <td>{p.date}</td>
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
