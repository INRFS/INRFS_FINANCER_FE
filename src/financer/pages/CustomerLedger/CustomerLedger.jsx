import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import Button from '../../../common/components/Button';
import { formatCurrency } from '../../../common/utils/formatters';
import './CustomerLedger.css';

const customerLedgerData = [
  {
    id: 'CUS001',
    name: 'Ramesh Kumar',
    phone: '+91 98001 11111',
    loanCount: 2,
    initials: 'R',
    totalDisbursed: 23000,
    totalReceived: 2000,
    outstanding: 21000,
    entries: [
      { date: '10-Aug-2026', description: 'Loan Disbursed', debit: 10000, credit: 0, balance: 10000, status: 'Given' },
      { date: '10-Aug-2026', description: 'Interest Due', debit: 1000, credit: 0, balance: 11000, status: 'Due' },
      { date: '12-Aug-2026', description: 'Interest Received', debit: 0, credit: 1000, balance: 10000, status: 'Received' },
      { date: '10-Sep-2026', description: 'Interest Due', debit: 1000, credit: 0, balance: 11000, status: 'Due' },
    ],
  },
  {
    id: 'CUS002',
    name: 'Priya Sharma',
    phone: '+91 98765 22222',
    loanCount: 1,
    initials: 'P',
    totalDisbursed: 15000,
    totalReceived: 5000,
    outstanding: 10000,
    entries: [
      { date: '05-Aug-2026', description: 'Loan Disbursed', debit: 15000, credit: 0, balance: 15000, status: 'Given' },
      { date: '12-Aug-2026', description: 'Payment Received', debit: 0, credit: 5000, balance: 10000, status: 'Received' },
      { date: '05-Sep-2026', description: 'Interest Due', debit: 1000, credit: 0, balance: 11000, status: 'Due' },
    ],
  },
  {
    id: 'CUS003',
    name: 'Vikram Singh',
    phone: '+91 98765 33333',
    loanCount: 3,
    initials: 'V',
    totalDisbursed: 45000,
    totalReceived: 15000,
    outstanding: 30000,
    entries: [
      { date: '01-Aug-2026', description: 'Loan Disbursed', debit: 20000, credit: 0, balance: 20000, status: 'Given' },
      { date: '03-Aug-2026', description: 'Loan Disbursed', debit: 15000, credit: 0, balance: 35000, status: 'Given' },
      { date: '08-Aug-2026', description: 'Payment Received', debit: 0, credit: 10000, balance: 25000, status: 'Received' },
      { date: '10-Aug-2026', description: 'Loan Disbursed', debit: 10000, credit: 0, balance: 35000, status: 'Given' },
      { date: '10-Sep-2026', description: 'Interest Due', debit: 1500, credit: 0, balance: 36500, status: 'Due' },
    ],
  },
  {
    id: 'CUS004',
    name: 'Anita Desai',
    phone: '+91 98765 44444',
    loanCount: 1,
    initials: 'A',
    totalDisbursed: 12000,
    totalReceived: 4000,
    outstanding: 8000,
    entries: [
      { date: '02-Aug-2026', description: 'Loan Disbursed', debit: 12000, credit: 0, balance: 12000, status: 'Given' },
      { date: '10-Aug-2026', description: 'Payment Received', debit: 0, credit: 4000, balance: 8000, status: 'Received' },
      { date: '02-Sep-2026', description: 'Interest Due', debit: 800, credit: 0, balance: 8800, status: 'Due' },
    ],
  },
  {
    id: 'CUS005',
    name: 'Mohammed Ali',
    phone: '+91 98765 55555',
    loanCount: 2,
    initials: 'M',
    totalDisbursed: 30000,
    totalReceived: 12000,
    outstanding: 18000,
    entries: [
      { date: '04-Aug-2026', description: 'Loan Disbursed', debit: 20000, credit: 0, balance: 20000, status: 'Given' },
      { date: '09-Aug-2026', description: 'Loan Disbursed', debit: 10000, credit: 0, balance: 30000, status: 'Given' },
      { date: '15-Aug-2026', description: 'Payment Received', debit: 0, credit: 12000, balance: 18000, status: 'Received' },
      { date: '04-Sep-2026', description: 'Interest Due', debit: 1200, credit: 0, balance: 19200, status: 'Due' },
    ],
  },
  {
    id: 'CUS006',
    name: 'Sunita Rao',
    phone: '+91 98765 66666',
    loanCount: 0,
    initials: 'S',
    totalDisbursed: 0,
    totalReceived: 0,
    outstanding: 0,
    entries: [],
  },
];

function LedgerStatus({ status }) {
  return (
    <span className={`fin-ledger-status fin-ledger-status-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

export default function CustomerLedger() {
  const [selectedCustomerId, setSelectedCustomerId] = useState('CUS001');
  const [search, setSearch] = useState('');

  const selectedCustomer = useMemo(
    () =>
      customerLedgerData.find((customer) => customer.id === selectedCustomerId) ||
      customerLedgerData[0],
    [selectedCustomerId]
  );

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return customerLedgerData;

    return customerLedgerData.filter(
      (customer) =>
        customer.name.toLowerCase().includes(value) ||
        customer.id.toLowerCase().includes(value) ||
        customer.phone.toLowerCase().includes(value)
    );
  }, [search]);

  const handleExport = () => {
    alert(
      `Downloading Financial Ledger Statement (PDF) for ${selectedCustomer.name}...`
    );
  };

  return (
    <div className="fin-ledger-page animate-fade-in">
      <div className="fin-ledger-page-header">
        <div>
          <h1 className="fin-ledger-title">Customer Ledger</h1>
          <p className="fin-ledger-subtitle">
            Full financial history for each customer
          </p>
        </div>
      </div>

      <div className="fin-ledger-layout">
        <aside className="fin-ledger-customer-panel">
          <div className="fin-ledger-customer-heading">SELECT CUSTOMER</div>

          <div className="fin-ledger-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="fin-ledger-customer-list">
            {filteredCustomers.length === 0 ? (
              <div className="fin-ledger-no-customers">No customers found</div>
            ) : (
              filteredCustomers.map((customer) => {
                const active = customer.id === selectedCustomerId;

                return (
                  <button
                    key={customer.id}
                    type="button"
                    className={`fin-ledger-customer-item ${active ? 'active' : ''}`}
                    onClick={() => setSelectedCustomerId(customer.id)}
                  >
                    <div className={`fin-ledger-avatar ${active ? 'active' : ''}`}>
                      {customer.initials}
                    </div>

                    <div className="fin-ledger-customer-info">
                      <span className="fin-ledger-customer-name">
                        {customer.name}
                      </span>
                      <span className="fin-ledger-customer-loans">
                        {customer.loanCount} {customer.loanCount === 1 ? 'loan' : 'loans'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="fin-ledger-content">
          <div className="fin-ledger-customer-header">
            <div>
              <h2>{selectedCustomer.name}</h2>
              <p>
                {selectedCustomer.id}
                <span> · </span>
                {selectedCustomer.phone}
              </p>
            </div>

            <Button variant="outline" icon={Download} onClick={handleExport}>
              Export Statement
            </Button>
          </div>

          <div className="fin-ledger-summary-grid">
            <div className="fin-ledger-summary-card disbursed">
              <span className="fin-ledger-summary-label">TOTAL DISBURSED</span>
              <strong>{formatCurrency(selectedCustomer.totalDisbursed)}</strong>
            </div>

            <div className="fin-ledger-summary-card received">
              <span className="fin-ledger-summary-label">TOTAL RECEIVED</span>
              <strong>{formatCurrency(selectedCustomer.totalReceived)}</strong>
            </div>

            <div className="fin-ledger-summary-card outstanding">
              <span className="fin-ledger-summary-label">OUTSTANDING</span>
              <strong>{formatCurrency(selectedCustomer.outstanding)}</strong>
            </div>
          </div>

          <div className="fin-ledger-table-card">
            <div className="fin-ledger-table-wrapper">
              <table className="fin-ledger-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>DESCRIPTION</th>
                    <th>DEBIT</th>
                    <th>CREDIT</th>
                    <th>BALANCE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedCustomer.entries.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="fin-ledger-empty">
                        No ledger transactions available
                      </td>
                    </tr>
                  ) : (
                    selectedCustomer.entries.map((row, index) => (
                      <tr key={`${row.date}-${index}`}>
                        <td data-label="DATE">
                          <span className="fin-ledger-date">{row.date}</span>
                        </td>

                        <td data-label="DESCRIPTION">
                          <strong className="fin-ledger-description">
                            {row.description}
                          </strong>
                        </td>

                        <td data-label="DEBIT">
                          {row.debit > 0 ? (
                            <span className="fin-ledger-debit">
                              {formatCurrency(row.debit)}
                            </span>
                          ) : (
                            <span className="fin-ledger-dash">—</span>
                          )}
                        </td>

                        <td data-label="CREDIT">
                          {row.credit > 0 ? (
                            <span className="fin-ledger-credit">
                              {formatCurrency(row.credit)}
                            </span>
                          ) : (
                            <span className="fin-ledger-dash">—</span>
                          )}
                        </td>

                        <td data-label="BALANCE">
                          <strong className="fin-ledger-balance">
                            {formatCurrency(row.balance)}
                          </strong>
                        </td>

                        <td data-label="STATUS">
                          <LedgerStatus status={row.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}