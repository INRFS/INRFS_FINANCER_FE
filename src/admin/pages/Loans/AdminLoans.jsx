import React, { useState } from 'react';
import { Banknote } from 'lucide-react';
import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatCurrency } from '../../../common/utils/formatters';
import { mockLoans } from '../../../financer/data/mockFinancerData';
import './AdminLoans.css';

export default function AdminLoans() {
  const [search, setSearch] = useState('');

  return (
    <div className="admin-loans-page animate-fade-in">
      <div className="admin-loans-header">
        <div>
          <h1 className="admin-loans-title">Platform Loan Books</h1>
          <p className="admin-loans-subtitle">Audit total loan principal, yields and system default exposure.</p>
        </div>
      </div>

      <div className="admin-loans-toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search loan ID or customer..." />
      </div>

      <div className="admin-loans-table-card">
        <div className="admin-loans-table-wrapper">
          <table className="admin-loans-table">
            <thead>
              <tr>
                <th>LOAN ID</th>
                <th>CUSTOMER</th>
                <th>FINANCER INSTITUTION</th>
                <th>PRINCIPAL</th>
                <th>INTEREST</th>
                <th>OUTSTANDING</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mockLoans.map((l) => (
                <tr key={l.id}>
                  <td><strong className="admin-loans-id">{l.id}</strong></td>
                  <td>{l.customer}</td>
                  <td><span className="admin-loans-financer">Patel Finance Services</span></td>
                  <td>{formatCurrency(l.principal)}</td>
                  <td>{l.interestRate}</td>
                  <td><strong className="admin-loans-amt">{formatCurrency(l.outstanding)}</strong></td>
                  <td><StatusBadge status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
