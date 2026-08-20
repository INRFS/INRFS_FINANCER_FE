import React, { useEffect, useState } from 'react';
import { Filter, Download } from 'lucide-react';
import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import Button from '../../../common/components/Button';
import { formatCurrency } from '../../../common/utils/formatters';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import './InterestSchedule.css';

export default function InterestSchedule() {
  const [schedule, setSchedule] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    platformApi.payments.allSchedules()
      .then((payload) => setSchedule(pageItems(payload).map((item) => ({ ...item, customer: item.customerName, principal: item.openingPrincipal, rate: '—', interestAmount: item.interestDue }))))
      .catch((reason) => setError(reason.message));
  }, []);

  const exportSchedule = () => {
    const headings = ['Loan', 'Customer', 'Principal', 'Interest', 'Due date', 'Status'];
    const rows = filtered.map((item) => [item.loanNumber, item.customer, item.principal, item.interestAmount, item.dueDate, item.status]);
    const csv = [headings, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `interest-schedule-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const filtered = schedule.filter(item => {
    const matchesSearch = item.customer.toLowerCase().includes(search.toLowerCase()) || item.loanId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fin-interest-page animate-fade-in">
      {error && <p role="alert">{error}</p>}
      <div className="fin-interest-header">
        <div>
          <h1 className="fin-interest-title">Interest Schedule</h1>
          <p className="fin-interest-subtitle">Automated monthly & periodic interest payment schedules across all loan accounts.</p>
        </div>
        <Button variant="outline" icon={Download} onClick={exportSchedule}>
          Export Schedule
        </Button>
      </div>

      <div className="fin-interest-toolbar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search loan ID or customer..."
        />

        <div className="fin-interest-filter">
          <Filter size={16} className="fin-interest-filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="fin-interest-select"
          >
            <option value="All">All Statuses</option>
            <option value="Due">Due</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Overdue">Overdue</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="fin-interest-table-card">
        <div className="fin-interest-table-wrapper">
          <table className="fin-interest-table">
            <thead>
              <tr>
                <th>LOAN ID</th>
                <th>CUSTOMER</th>
                <th>PRINCIPAL</th>
                <th>INTEREST RATE</th>
                <th>INTEREST AMOUNT</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr key={idx}>
                  <td><strong className="fin-interest-loan-id">{row.loanNumber}</strong></td>
                  <td><span className="fin-interest-cust-name">{row.customer}</span></td>
                  <td>{formatCurrency(row.principal)}</td>
                  <td><span className="fin-interest-rate-tag">{row.rate}</span></td>
                  <td><strong className="fin-interest-amt">{formatCurrency(row.interestAmount)}</strong></td>
                  <td>{row.dueDate}</td>
                  <td><StatusBadge status={row.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
