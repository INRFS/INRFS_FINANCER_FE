import React, { useState } from 'react';
import { Users, Search, Building2 } from 'lucide-react';
import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatCurrency } from '../../../common/utils/formatters';
import { mockCustomers } from '../../../financer/data/mockFinancerData';
import './AdminCustomers.css';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');

  return (
    <div className="admin-customers-page animate-fade-in">
      <div className="admin-customers-header">
        <div>
          <h1 className="admin-customers-title">Cross-Platform Customers</h1>
          <p className="admin-customers-subtitle">Central registry of 18,450 borrowing accounts across all registered financer institutions.</p>
        </div>
      </div>

      <div className="admin-customers-toolbar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search borrower name or phone..." />
      </div>

      <div className="admin-customers-table-card">
        <div className="admin-customers-table-wrapper">
          <table className="admin-customers-table">
            <thead>
              <tr>
                <th>CUSTOMER ID</th>
                <th>NAME</th>
                <th>MOBILE</th>
                <th>ASSOCIATED FINANCER</th>
                <th>CITY</th>
                <th>ACTIVE LOANS</th>
                <th>OUTSTANDING</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((c) => (
                <tr key={c.id}>
                  <td><strong className="admin-cust-id">{c.id}</strong></td>
                  <td><strong className="admin-cust-name">{c.name}</strong></td>
                  <td>{c.mobile}</td>
                  <td><span className="admin-cust-financer">Patel Finance Services</span></td>
                  <td>{c.city}</td>
                  <td><strong>{c.activeLoans}</strong></td>
                  <td>{formatCurrency(c.outstanding)}</td>
                  <td><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
