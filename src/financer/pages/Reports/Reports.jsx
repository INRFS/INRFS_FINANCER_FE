import React, { useMemo, useState } from 'react';
import {
  Search,
  Download,
  FileDown,
  RotateCcw,
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  UserRound,
  CalendarDays,
  Filter,
} from 'lucide-react';

import './Reports.css';

/* =========================================================
   REPORT DATA
   Replace these arrays with your API data later.
========================================================= */

const customers = [
  { id: 'CUS001', name: 'Ramesh Kumar', phone: '+91 98001 11111', loans: 2, disbursed: 23000, received: 2000, outstanding: 21000, status: 'Active' },
  { id: 'CUS002', name: 'Priya Sharma', phone: '+91 98765 22222', loans: 1, disbursed: 15000, received: 5000, outstanding: 10000, status: 'Active' },
  { id: 'CUS003', name: 'Vikram Singh', phone: '+91 98765 33333', loans: 3, disbursed: 45000, received: 15000, outstanding: 30000, status: 'Active' },
  { id: 'CUS004', name: 'Anita Desai', phone: '+91 98765 44444', loans: 1, disbursed: 12000, received: 4000, outstanding: 8000, status: 'Active' },
  { id: 'CUS005', name: 'Mohammed Ali', phone: '+91 98765 55555', loans: 2, disbursed: 30000, received: 12000, outstanding: 18000, status: 'Active' },
  { id: 'CUS006', name: 'Sunita Rao', phone: '+91 98765 66666', loans: 0, disbursed: 0, received: 0, outstanding: 0, status: 'No Loan' },
];

const loans = [
  { id: 'LN000125', customer: 'Ramesh Kumar', type: 'Daily Collection', principal: 50000, interest: '2% Monthly', outstanding: 35000, due: '2026-09-10', status: 'Active' },
  { id: 'LN000127', customer: 'Priya Sharma', type: 'Monthly Collection', principal: 15000, interest: '1.5% Monthly', outstanding: 10000, due: '2026-09-05', status: 'Active' },
  { id: 'LN000128', customer: 'Vikram Singh', type: 'Weekly Collection', principal: 20000, interest: '3.5% Weekly', outstanding: 14000, due: '2026-08-15', status: 'Active' },
  { id: 'LN000131', customer: 'Mohammed Ali', type: 'Monthly Collection', principal: 30000, interest: '2% Monthly', outstanding: 18000, due: '2026-09-04', status: 'Active' },
];

const payments = [
  { id: 'PAY001', date: '2026-08-12', customer: 'Ramesh Kumar', loanId: 'LN000125', method: 'PhonePe', amount: 1000, reference: 'PPX10258', status: 'Success' },
  { id: 'PAY002', date: '2026-08-10', customer: 'Priya Sharma', loanId: 'LN000127', method: 'UPI', amount: 4000, reference: 'UPI78421', status: 'Success' },
  { id: 'PAY003', date: '2026-08-08', customer: 'Vikram Singh', loanId: 'LN000128', method: 'Cash', amount: 10000, reference: 'CASH-008', status: 'Success' },
  { id: 'PAY004', date: '2026-08-15', customer: 'Mohammed Ali', loanId: 'LN000131', method: 'Bank Transfer', amount: 12000, reference: 'BT45982', status: 'Success' },
];

const interestRows = [
  { month: '2026-08', customer: 'Ramesh Kumar', loanId: 'LN000125', principal: 50000, rate: '2%', interest: 1000, received: 1000, status: 'Received' },
  { month: '2026-08', customer: 'Priya Sharma', loanId: 'LN000127', principal: 15000, rate: '1.5%', interest: 225, received: 225, status: 'Received' },
  { month: '2026-08', customer: 'Vikram Singh', loanId: 'LN000128', principal: 20000, rate: '3.5%', interest: 700, received: 0, status: 'Due' },
];

const overdueAccounts = [
  { customer: 'Vikram Singh', loanId: 'LN000128', dueDate: '2026-07-15', overdueDays: 27, amount: 3500, status: 'Overdue' },
  { customer: 'Mohammed Ali', loanId: 'LN000131', dueDate: '2026-08-04', overdueDays: 7, amount: 1200, status: 'Overdue' },
];

const statements = {
  'Ramesh Kumar': [
    { date: '2026-08-10', description: 'Loan Disbursed', debit: 10000, credit: 0, balance: 10000, status: 'Given' },
    { date: '2026-08-10', description: 'Interest Due', debit: 1000, credit: 0, balance: 11000, status: 'Due' },
    { date: '2026-08-12', description: 'Interest Received', debit: 0, credit: 1000, balance: 10000, status: 'Received' },
    { date: '2026-09-10', description: 'Interest Due', debit: 1000, credit: 0, balance: 11000, status: 'Due' },
  ],
};

const reportTabs = [
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'loans', label: 'Loans', icon: FileText },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'interest', label: 'Interest', icon: TrendingUp },
  { id: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { id: 'statement', label: 'Customer Statement', icon: UserRound },
];

const monthOptions = [
  ['01', 'January'], ['02', 'February'], ['03', 'March'],
  ['04', 'April'], ['05', 'May'], ['06', 'June'],
  ['07', 'July'], ['08', 'August'], ['09', 'September'],
  ['10', 'October'], ['11', 'November'], ['12', 'December'],
];

const yearOptions = ['2025', '2026', '2027'];

const currency = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

const formatDate = (value) => {
  if (!value) return '—';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
};

const formatMonth = (value) => {
  if (!value) return '—';
  const [year, month] = value.split('-');
  const found = monthOptions.find(([number]) => number === month);
  return found ? `${found[1].slice(0, 3)} ${year}` : value;
};

/* Returns the date available for each report type. */
const getReportDate = (item, tab) => {
  if (tab === 'loans') return item.due || '';
  if (tab === 'payments') return item.date || '';
  if (tab === 'interest') return item.month ? `${item.month}-01` : '';
  if (tab === 'overdue') return item.dueDate || '';
  if (tab === 'statement') return item.date || '';
  return '';
};

const isDateInFilter = (value, filterType, fromDate, toDate, filterMonth, filterYear) => {
  if (!value || !filterType) return true;

  if (filterType === 'date') {
    if (!fromDate && !toDate) return true;
    if (fromDate && value < fromDate) return false;
    if (toDate && value > toDate) return false;
    return true;
  }

  if (filterType === 'month') {
    if (!filterMonth && !filterYear) return true;

    const valueMonth = value.slice(5, 7);
    const valueYear = value.slice(0, 4);

    if (filterMonth && valueMonth !== filterMonth) return false;
    if (filterYear && valueYear !== filterYear) return false;

    return true;
  }

  if (filterType === 'year') {
    return !filterYear || value.slice(0, 4) === filterYear;
  }

  return true;
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('customers');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  /* Date / Month / Year filter */
  const [filterType, setFilterType] = useState('date');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const [statementCustomer, setStatementCustomer] = useState('Ramesh Kumar');

  const resetFilters = () => {
    setSearch('');
    setStatus('All');
    setFilterType('date');
    setFromDate('');
    setToDate('');
    setFilterMonth('');
    setFilterYear('');
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearch('');
    setStatus('All');
  };

  const filteredData = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    let source = [];

    if (activeTab === 'customers') source = customers;
    if (activeTab === 'loans') source = loans;
    if (activeTab === 'payments') source = payments;
    if (activeTab === 'interest') source = interestRows;
    if (activeTab === 'overdue') source = overdueAccounts;
    if (activeTab === 'statement') source = statements[statementCustomer] || [];

    return source.filter((item) => {
      let matchesSearch = true;
      let matchesStatus = true;
      let matchesDate = true;

      if (searchValue) {
        if (activeTab === 'customers') {
          matchesSearch =
            item.name.toLowerCase().includes(searchValue) ||
            item.id.toLowerCase().includes(searchValue) ||
            item.phone.toLowerCase().includes(searchValue);
        } else if (activeTab === 'loans') {
          matchesSearch =
            item.customer.toLowerCase().includes(searchValue) ||
            item.id.toLowerCase().includes(searchValue) ||
            item.type.toLowerCase().includes(searchValue);
        } else if (activeTab === 'payments') {
          matchesSearch =
            item.customer.toLowerCase().includes(searchValue) ||
            item.loanId.toLowerCase().includes(searchValue) ||
            item.reference.toLowerCase().includes(searchValue) ||
            item.method.toLowerCase().includes(searchValue);
        } else if (activeTab === 'interest') {
          matchesSearch =
            item.customer.toLowerCase().includes(searchValue) ||
            item.loanId.toLowerCase().includes(searchValue);
        } else if (activeTab === 'overdue') {
          matchesSearch =
            item.customer.toLowerCase().includes(searchValue) ||
            item.loanId.toLowerCase().includes(searchValue);
        } else {
          matchesSearch =
            item.description.toLowerCase().includes(searchValue);
        }
      }

      if (activeTab !== 'overdue' && activeTab !== 'statement') {
        matchesStatus =
          status === 'All' || item.status === status;
      }

      const reportDate = getReportDate(item, activeTab);

      /* Customer report has no date field in the supplied data. */
      matchesDate =
        activeTab === 'customers'
          ? true
          : isDateInFilter(
              reportDate,
              filterType,
              fromDate,
              toDate,
              filterMonth,
              filterYear
            );

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [
    activeTab,
    search,
    status,
    filterType,
    fromDate,
    toDate,
    filterMonth,
    filterYear,
    statementCustomer,
  ]);

  const summary = useMemo(() => {
    if (activeTab === 'customers') {
      return [
        { label: 'Total Customers', value: customers.length },
        {
          label: 'Active Customers',
          value: customers.filter((x) => x.status === 'Active').length,
        },
        {
          label: 'Total Outstanding',
          value: currency(
            customers.reduce((sum, item) => sum + item.outstanding, 0)
          ),
        },
      ];
    }

    if (activeTab === 'loans') {
      return [
        { label: 'Total Loans', value: filteredData.length },
        {
          label: 'Total Principal',
          value: currency(
            filteredData.reduce((sum, item) => sum + item.principal, 0)
          ),
        },
        {
          label: 'Total Outstanding',
          value: currency(
            filteredData.reduce((sum, item) => sum + item.outstanding, 0)
          ),
        },
      ];
    }

    if (activeTab === 'payments') {
      const total = filteredData.reduce((sum, item) => sum + item.amount, 0);

      return [
        { label: 'Transactions', value: filteredData.length },
        { label: 'Total Received', value: currency(total) },
        {
          label: 'Average Payment',
          value: currency(filteredData.length ? total / filteredData.length : 0),
        },
      ];
    }

    if (activeTab === 'interest') {
      return [
        {
          label: 'Interest Applied',
          value: currency(
            filteredData.reduce((sum, item) => sum + item.interest, 0)
          ),
        },
        {
          label: 'Interest Received',
          value: currency(
            filteredData.reduce((sum, item) => sum + item.received, 0)
          ),
        },
        {
          label: 'Interest Due',
          value: currency(
            filteredData.reduce(
              (sum, item) => sum + (item.interest - item.received),
              0
            )
          ),
        },
      ];
    }

    if (activeTab === 'overdue') {
      return [
        { label: 'Overdue Accounts', value: filteredData.length },
        {
          label: 'Total Overdue',
          value: currency(
            filteredData.reduce((sum, item) => sum + item.amount, 0)
          ),
        },
        {
          label: 'Highest Delay',
          value: filteredData.length
            ? `${Math.max(...filteredData.map((item) => item.overdueDays))} days`
            : '0 days',
        },
      ];
    }

    const customer = customers.find((item) => item.name === statementCustomer);

    return [
      { label: 'Customer', value: statementCustomer },
      {
        label: 'Outstanding',
        value: currency(customer?.outstanding || 0),
      },
      { label: 'Transactions', value: filteredData.length },
    ];
  }, [activeTab, filteredData, statementCustomer]);

  const currentReport = reportTabs.find((item) => item.id === activeTab);

  const getExportRows = () => {
    if (activeTab === 'customers') {
      return filteredData.map((item) => ({
        'Customer ID': item.id,
        Customer: item.name,
        Phone: item.phone,
        Loans: item.loans,
        Disbursed: item.disbursed,
        Received: item.received,
        Outstanding: item.outstanding,
        Status: item.status,
      }));
    }

    if (activeTab === 'loans') {
      return filteredData.map((item) => ({
        'Loan ID': item.id,
        Customer: item.customer,
        Type: item.type,
        Principal: item.principal,
        Interest: item.interest,
        Outstanding: item.outstanding,
        'Due Date': formatDate(item.due),
        Status: item.status,
      }));
    }

    if (activeTab === 'payments') {
      return filteredData.map((item) => ({
        'Payment ID': item.id,
        Date: formatDate(item.date),
        Customer: item.customer,
        'Loan ID': item.loanId,
        Method: item.method,
        Reference: item.reference,
        Amount: item.amount,
        Status: item.status,
      }));
    }

    if (activeTab === 'interest') {
      return filteredData.map((item) => ({
        Month: formatMonth(item.month),
        Customer: item.customer,
        'Loan ID': item.loanId,
        Principal: item.principal,
        Rate: item.rate,
        Interest: item.interest,
        Received: item.received,
        Status: item.status,
      }));
    }

    if (activeTab === 'overdue') {
      return filteredData.map((item) => ({
        Customer: item.customer,
        'Loan ID': item.loanId,
        'Due Date': formatDate(item.dueDate),
        'Overdue Days': item.overdueDays,
        Amount: item.amount,
        Status: item.status,
      }));
    }

    return filteredData.map((item) => ({
      Date: formatDate(item.date),
      Description: item.description,
      Debit: item.debit,
      Credit: item.credit,
      Balance: item.balance,
      Status: item.status,
    }));
  };

  /* Excel-compatible .xls export without an extra package. */
  const exportExcel = () => {
    const rows = getExportRows();

    if (!rows.length) return;

    const headers = Object.keys(rows[0]);

    const tableRows = rows
      .map(
        (row) =>
          `<tr>${headers
            .map((header) => `<td>${String(row[header] ?? '').replace(/</g, '&lt;')}</td>`)
            .join('')}</tr>`
      )
      .join('');

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; }
            th { background: #eef3f8; font-weight: bold; }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: 'application/vnd.ms-excel;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${activeTab}-report.xls`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const savePDF = () => {
    window.print();
  };

  const statusOptions = {
    customers: ['All', 'Active', 'No Loan'],
    loans: ['All', 'Active'],
    payments: ['All', 'Success'],
    interest: ['All', 'Received', 'Due'],
    overdue: ['All', 'Overdue'],
    statement: ['All'],
  };

  return (
    <div className="fin-reports-page">
      {/* HEADER */}
      <div className="fin-reports-header">
        <div>
          <div className="fin-reports-title-row">
            <div className="fin-reports-title-icon">
              <FileText size={20} />
            </div>
            <h1>Reports</h1>
          </div>

          <p>View, filter and export financial reports</p>
        </div>
      </div>

      {/* TABS */}
      <div className="fin-report-tabs-wrapper">
        <div className="fin-report-tabs">
          {reportTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={`fin-report-tab ${active ? 'active' : ''}`}
                onClick={() => changeTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER + EXPORT TOOLBAR */}
      <div className="fin-report-toolbar">
        <div className="fin-report-filters">
          {/* SEARCH */}
          <div className="fin-report-search">
            <Search size={17} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === 'customers'
                  ? 'Search customer, ID or phone...'
                  : activeTab === 'loans'
                  ? 'Search customer or loan ID...'
                  : activeTab === 'payments'
                  ? 'Search customer, loan or reference...'
                  : 'Search report...'
              }
              aria-label="Search report"
            />
          </div>

          {/* STATUS */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            {statusOptions[activeTab].map((option) => (
              <option key={option} value={option}>
                {option === 'All' ? 'All Status' : option}
              </option>
            ))}
          </select>

          {/* DATE TYPE */}
          <div className="fin-date-filter">
            <Filter size={15} />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setFromDate('');
                setToDate('');
                setFilterMonth('');
                setFilterYear('');
              }}
              aria-label="Filter by date, month or year"
            >
              <option value="date">Date</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>

          {/* DATE FILTER */}
          {filterType === 'date' && (
            <>
              <label className="fin-date-input">
                <span>From</span>
                <CalendarDays size={14} />
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  aria-label="From date"
                />
              </label>

              <label className="fin-date-input">
                <span>To</span>
                <CalendarDays size={14} />
                <input
                  type="date"
                  value={toDate}
                  min={fromDate || undefined}
                  onChange={(e) => setToDate(e.target.value)}
                  aria-label="To date"
                />
              </label>
            </>
          )}

          {/* MONTH FILTER */}
          {filterType === 'month' && (
            <>
              <select
                className="fin-period-select"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                aria-label="Select month"
              >
                <option value="">All Months</option>
                {monthOptions.map(([number, label]) => (
                  <option key={number} value={number}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                className="fin-period-select"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                aria-label="Select year"
              >
                <option value="">All Years</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* YEAR FILTER */}
          {filterType === 'year' && (
            <select
              className="fin-period-select"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              aria-label="Select year"
            >
              <option value="">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}

          {/* CUSTOMER STATEMENT */}
          {activeTab === 'statement' && (
            <select
              className="fin-customer-select"
              value={statementCustomer}
              onChange={(e) => setStatementCustomer(e.target.value)}
              aria-label="Select customer"
            >
              {customers.map((customer) => (
                <option key={customer.id} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className="fin-report-reset-btn"
            onClick={resetFilters}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        <div className="fin-report-export-actions">
          <button
            type="button"
            className="fin-report-excel-btn"
            onClick={exportExcel}
          >
            <Download size={16} />
            Export Excel
          </button>

          <button
            type="button"
            className="fin-report-pdf-btn"
            onClick={savePDF}
          >
            <FileDown size={16} />
            Save as PDF
          </button>
        </div>
      </div>

      {/* REPORT HEADING */}
      <div className="fin-report-section-heading">
        <div>
          <h2>{currentReport?.label} Report</h2>
          <p>
            Showing {filteredData.length}{' '}
            {filteredData.length === 1 ? 'record' : 'records'}
          </p>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="fin-report-summary-grid">
        {summary.map((item, index) => (
          <div className="fin-report-summary-card" key={item.label}>
            <span>{item.label}</span>
            <strong
              className={
                activeTab === 'overdue' && index === 1
                  ? 'danger-value'
                  : ''
              }
            >
              {item.value}
            </strong>
          </div>
        ))}
      </div>

      {/* DATA */}
      <div className="fin-report-data-card">
        <div className="fin-report-data-header">
          <div>
            <h3>{currentReport?.label} Data</h3>
            <span>Filtered using the selected report criteria</span>
          </div>

          <div className="fin-report-record-count">
            {filteredData.length} records
          </div>
        </div>

        <div className="fin-report-table-wrapper">
          {/* CUSTOMERS */}
          {activeTab === 'customers' && (
            <table>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Loans</th>
                  <th>Disbursed</th>
                  <th>Received</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td><span className="fin-report-id">{item.id}</span></td>
                    <td>
                      <div className="fin-report-person">
                        <div className="fin-report-avatar">
                          {item.name.charAt(0)}
                        </div>
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>{item.phone}</td>
                    <td>{item.loans}</td>
                    <td>{currency(item.disbursed)}</td>
                    <td>{currency(item.received)}</td>
                    <td><strong>{currency(item.outstanding)}</strong></td>
                    <td>
                      <span className={`fin-status-badge ${item.status === 'Active' ? 'success' : 'neutral'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* LOANS */}
          {activeTab === 'loans' && (
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Customer</th>
                  <th>Collection Type</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Outstanding</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td><span className="fin-report-id">{item.id}</span></td>
                    <td><strong>{item.customer}</strong></td>
                    <td>{item.type}</td>
                    <td>{currency(item.principal)}</td>
                    <td>{item.interest}</td>
                    <td><strong>{currency(item.outstanding)}</strong></td>
                    <td>{formatDate(item.due)}</td>
                    <td><span className="fin-status-badge success">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* PAYMENTS */}
          {activeTab === 'payments' && (
            <table>
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Loan ID</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id}>
                    <td><span className="fin-report-id">{item.id}</span></td>
                    <td>{formatDate(item.date)}</td>
                    <td><strong>{item.customer}</strong></td>
                    <td>{item.loanId}</td>
                    <td>{item.method}</td>
                    <td>{item.reference}</td>
                    <td><strong className="fin-credit-value">{currency(item.amount)}</strong></td>
                    <td><span className="fin-status-badge success">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* INTEREST */}
          {activeTab === 'interest' && (
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Customer</th>
                  <th>Loan ID</th>
                  <th>Principal</th>
                  <th>Rate</th>
                  <th>Interest</th>
                  <th>Received</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.loanId}>
                    <td>{formatMonth(item.month)}</td>
                    <td><strong>{item.customer}</strong></td>
                    <td>{item.loanId}</td>
                    <td>{currency(item.principal)}</td>
                    <td>{item.rate}</td>
                    <td><strong>{currency(item.interest)}</strong></td>
                    <td>{currency(item.received)}</td>
                    <td>
                      <span className={`fin-status-badge ${item.status === 'Received' ? 'success' : 'warning'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* OVERDUE */}
          {activeTab === 'overdue' && (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Loan ID</th>
                  <th>Due Date</th>
                  <th>Overdue Days</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.loanId}>
                    <td><strong>{item.customer}</strong></td>
                    <td>{item.loanId}</td>
                    <td>{formatDate(item.dueDate)}</td>
                    <td><span className="fin-overdue-days">{item.overdueDays} days</span></td>
                    <td><strong>{currency(item.amount)}</strong></td>
                    <td><span className="fin-status-badge danger">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* CUSTOMER STATEMENT */}
          {activeTab === 'statement' && (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Debit</th>
                  <th>Credit</th>
                  <th>Balance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={`${item.date}-${index}`}>
                    <td>{formatDate(item.date)}</td>
                    <td><strong>{item.description}</strong></td>
                    <td>{item.debit ? currency(item.debit) : '—'}</td>
                    <td className="fin-credit-value">
                      {item.credit ? currency(item.credit) : '—'}
                    </td>
                    <td><strong>{currency(item.balance)}</strong></td>
                    <td>
                      <span className={`fin-status-badge ${item.status === 'Due' ? 'warning' : 'success'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* EMPTY */}
        {filteredData.length === 0 && (
          <div className="fin-report-empty">
            <div className="fin-report-empty-icon">
              <Search size={22} />
            </div>
            <h3>No records found</h3>
            <p>Try changing your search, status or date filter.</p>
            <button type="button" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        )}

        <div className="fin-report-data-footer">
          <span>
            Showing <strong>{filteredData.length}</strong> records
          </span>
          <span>Report: {currentReport?.label}</span>
        </div>
      </div>
    </div>
  );
}