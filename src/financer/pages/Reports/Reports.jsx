import React, { useMemo, useState } from 'react';
import {
  Users,
  FileText,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  BarChart3,
  Download,
  Eye,
  X,
  CalendarDays,
  Printer,
  Search,
} from 'lucide-react';

import './Reports.css';

/* =========================================================
   REPORT DATA
========================================================= */

const reportData = [
  {
    id: 'customer',
    title: 'Customer Report',
    description: 'Complete list with status, loans, and outstanding',
    metric: '250 customers',
    icon: Users,
    iconClass: 'customer',
  },
  {
    id: 'loan',
    title: 'Loan Report',
    description: 'All loans with details, status and interest rates',
    metric: '180 active loans',
    icon: FileText,
    iconClass: 'loan',
  },
  {
    id: 'interest',
    title: 'Interest Report',
    description: 'Monthly interest schedule and collection summary',
    metric: 'Aug 2026',
    icon: TrendingUp,
    iconClass: 'interest',
  },
  {
    id: 'payment',
    title: 'Payment Report',
    description: 'All received payments with transaction details',
    metric: '4 transactions',
    icon: CreditCard,
    iconClass: 'payment',
  },
  {
    id: 'overdue',
    title: 'Overdue Report',
    description: 'Overdue accounts requiring immediate attention',
    metric: '2 accounts',
    icon: AlertTriangle,
    iconClass: 'overdue',
  },
  {
    id: 'collection',
    title: 'Collection Report',
    description: 'Monthly collection performance and trends',
    metric: 'Last 6 months',
    icon: BarChart3,
    iconClass: 'collection',
  },
  {
    id: 'statement',
    title: 'Customer Statement',
    description: 'Individual ledger statement for a customer',
    metric: 'Per customer',
    icon: FileText,
    iconClass: 'statement',
  },
];

/* =========================================================
   CUSTOMER DATA
========================================================= */

const customers = [
  {
    id: 'CUS001',
    name: 'Ramesh Kumar',
    phone: '+91 98001 11111',
    loans: 2,
    disbursed: 23000,
    received: 2000,
    outstanding: 21000,
    status: 'Active',
  },
  {
    id: 'CUS002',
    name: 'Priya Sharma',
    phone: '+91 98765 22222',
    loans: 1,
    disbursed: 15000,
    received: 5000,
    outstanding: 10000,
    status: 'Active',
  },
  {
    id: 'CUS003',
    name: 'Vikram Singh',
    phone: '+91 98765 33333',
    loans: 3,
    disbursed: 45000,
    received: 15000,
    outstanding: 30000,
    status: 'Active',
  },
  {
    id: 'CUS004',
    name: 'Anita Desai',
    phone: '+91 98765 44444',
    loans: 1,
    disbursed: 12000,
    received: 4000,
    outstanding: 8000,
    status: 'Active',
  },
  {
    id: 'CUS005',
    name: 'Mohammed Ali',
    phone: '+91 98765 55555',
    loans: 2,
    disbursed: 30000,
    received: 12000,
    outstanding: 18000,
    status: 'Active',
  },
  {
    id: 'CUS006',
    name: 'Sunita Rao',
    phone: '+91 98765 66666',
    loans: 0,
    disbursed: 0,
    received: 0,
    outstanding: 0,
    status: 'No Loan',
  },
];

/* =========================================================
   LOAN DATA
========================================================= */

const loans = [
  {
    id: 'LN000125',
    customer: 'Ramesh Kumar',
    type: 'Daily Collection',
    principal: 50000,
    interest: '2% Monthly',
    outstanding: 35000,
    due: '10-Sep-2026',
    status: 'Active',
  },
  {
    id: 'LN000127',
    customer: 'Priya Sharma',
    type: 'Monthly Collection',
    principal: 15000,
    interest: '1.5% Monthly',
    outstanding: 10000,
    due: '05-Sep-2026',
    status: 'Active',
  },
  {
    id: 'LN000128',
    customer: 'Vikram Singh',
    type: 'Weekly Collection',
    principal: 20000,
    interest: '3.5% Weekly',
    outstanding: 14000,
    due: '15-Aug-2026',
    status: 'Active',
  },
  {
    id: 'LN000131',
    customer: 'Mohammed Ali',
    type: 'Monthly Collection',
    principal: 30000,
    interest: '2% Monthly',
    outstanding: 18000,
    due: '04-Sep-2026',
    status: 'Active',
  },
];

/* =========================================================
   PAYMENT DATA
========================================================= */

const payments = [
  {
    date: '12-Aug-2026',
    customer: 'Ramesh Kumar',
    loanId: 'LN000125',
    method: 'PhonePe',
    amount: 1000,
    reference: 'PPX10258',
  },
  {
    date: '10-Aug-2026',
    customer: 'Priya Sharma',
    loanId: 'LN000127',
    method: 'UPI',
    amount: 4000,
    reference: 'UPI78421',
  },
  {
    date: '08-Aug-2026',
    customer: 'Vikram Singh',
    loanId: 'LN000128',
    method: 'Cash',
    amount: 10000,
    reference: 'CASH-008',
  },
  {
    date: '15-Aug-2026',
    customer: 'Mohammed Ali',
    loanId: 'LN000131',
    method: 'Bank Transfer',
    amount: 12000,
    reference: 'BT45982',
  },
];

/* =========================================================
   OVERDUE DATA
========================================================= */

const overdueAccounts = [
  {
    customer: 'Vikram Singh',
    loanId: 'LN000128',
    dueDate: '15-Jul-2026',
    overdueDays: 27,
    amount: 3500,
    status: 'Overdue',
  },
  {
    customer: 'Mohammed Ali',
    loanId: 'LN000131',
    dueDate: '04-Aug-2026',
    overdueDays: 7,
    amount: 1200,
    status: 'Overdue',
  },
];

/* =========================================================
   INTEREST DATA
========================================================= */

const interestRows = [
  {
    month: 'Aug 2026',
    customer: 'Ramesh Kumar',
    loanId: 'LN000125',
    principal: 50000,
    rate: '2%',
    interest: 1000,
    received: 1000,
    status: 'Received',
  },
  {
    month: 'Aug 2026',
    customer: 'Priya Sharma',
    loanId: 'LN000127',
    principal: 15000,
    rate: '1.5%',
    interest: 225,
    received: 225,
    status: 'Received',
  },
  {
    month: 'Aug 2026',
    customer: 'Vikram Singh',
    loanId: 'LN000128',
    principal: 20000,
    rate: '3.5%',
    interest: 700,
    received: 0,
    status: 'Due',
  },
];

/* =========================================================
   COLLECTION DATA
========================================================= */

const collectionData = [
  { month: 'Mar', collected: 180000 },
  { month: 'Apr', collected: 225000 },
  { month: 'May', collected: 210000 },
  { month: 'Jun', collected: 275000 },
  { month: 'Jul', collected: 310000 },
  { month: 'Aug', collected: 350000 },
];

/* =========================================================
   CUSTOMER STATEMENTS
========================================================= */

const statements = {
  'Ramesh Kumar': [
    {
      date: '10-Aug-2026',
      description: 'Loan Disbursed',
      debit: 10000,
      credit: 0,
      balance: 10000,
      status: 'Given',
    },
    {
      date: '10-Aug-2026',
      description: 'Interest Due',
      debit: 1000,
      credit: 0,
      balance: 11000,
      status: 'Due',
    },
    {
      date: '12-Aug-2026',
      description: 'Interest Received',
      debit: 0,
      credit: 1000,
      balance: 10000,
      status: 'Received',
    },
    {
      date: '10-Sep-2026',
      description: 'Interest Due',
      debit: 1000,
      credit: 0,
      balance: 11000,
      status: 'Due',
    },
  ],
};

/* =========================================================
   FORMAT CURRENCY
========================================================= */

const currency = (value) => {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
};

/* =========================================================
   REPORT VIEW MODAL
========================================================= */

function ReportViewModal({
  report,
  onClose,
}) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [statementCustomer, setStatementCustomer] =
    useState('Ramesh Kumar');

  const filteredCustomers = useMemo(() => {
    const value = customerSearch.toLowerCase().trim();

    if (!value) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(value) ||
        customer.id.toLowerCase().includes(value)
    );
  }, [customerSearch]);

  const handlePrintPDF = () => {
    window.print();
  };

  if (!report) return null;

  return (
    <div className="fin-report-modal-overlay">

      <div className="fin-report-modal">

        {/* =================================================
            MODAL HEADER
        ================================================= */}

        <div className="fin-report-modal-header">

          <div>
            <span className="fin-report-modal-kicker">
              FINANCIAL REPORT
            </span>

            <h2>{report.title}</h2>

            <p>
              {report.description}
            </p>
          </div>

          <div className="fin-report-modal-actions">

            <button
              type="button"
              className="fin-report-print-btn"
              onClick={handlePrintPDF}
            >
              <Printer size={16} />
              Print / Save PDF
            </button>

            <button
              type="button"
              className="fin-report-close"
              onClick={onClose}
              aria-label="Close report"
            >
              <X size={20} />
            </button>

          </div>

        </div>

        {/* =================================================
            CUSTOMER REPORT
        ================================================= */}

        {report.id === 'customer' && (

          <div className="fin-report-modal-body">

            <div className="fin-report-mini-summary">

              <div>
                <span>Total Customers</span>
                <strong>250</strong>
              </div>

              <div>
                <span>Active Customers</span>
                <strong>238</strong>
              </div>

              <div>
                <span>Total Outstanding</span>
                <strong>₹21,50,000</strong>
              </div>

            </div>

            <div className="fin-report-table-card">

              <div className="fin-report-table-title">
                Customer Portfolio
              </div>

              <div className="fin-report-table-wrapper">

                <table className="fin-report-table">

                  <thead>
                    <tr>
                      <th>CUSTOMER ID</th>
                      <th>CUSTOMER</th>
                      <th>PHONE</th>
                      <th>LOANS</th>
                      <th>DISBURSED</th>
                      <th>OUTSTANDING</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {customers.map((customer) => (

                      <tr key={customer.id}>

                        <td>{customer.id}</td>

                        <td>
                          <strong>{customer.name}</strong>
                        </td>

                        <td>{customer.phone}</td>

                        <td>{customer.loans}</td>

                        <td>
                          {currency(customer.disbursed)}
                        </td>

                        <td>
                          <strong>
                            {currency(customer.outstanding)}
                          </strong>
                        </td>

                        <td>
                          <span className="fin-report-badge success">
                            {customer.status}
                          </span>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            LOAN REPORT
        ================================================= */}

        {report.id === 'loan' && (

          <div className="fin-report-modal-body">

            <div className="fin-report-mini-summary">

              <div>
                <span>Total Loans</span>
                <strong>180</strong>
              </div>

              <div>
                <span>Total Principal</span>
                <strong>₹42,50,000</strong>
              </div>

              <div>
                <span>Total Outstanding</span>
                <strong>₹28,40,000</strong>
              </div>

            </div>

            <div className="fin-report-table-card">

              <div className="fin-report-table-title">
                Loan Portfolio
              </div>

              <div className="fin-report-table-wrapper">

                <table className="fin-report-table">

                  <thead>
                    <tr>
                      <th>LOAN ID</th>
                      <th>CUSTOMER</th>
                      <th>TYPE</th>
                      <th>PRINCIPAL</th>
                      <th>INTEREST</th>
                      <th>OUTSTANDING</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {loans.map((loan) => (

                      <tr key={loan.id}>

                        <td>{loan.id}</td>

                        <td>
                          <strong>{loan.customer}</strong>
                        </td>

                        <td>{loan.type}</td>

                        <td>{currency(loan.principal)}</td>

                        <td>{loan.interest}</td>

                        <td>
                          <strong>
                            {currency(loan.outstanding)}
                          </strong>
                        </td>

                        <td>
                          <span className="fin-report-badge success">
                            {loan.status}
                          </span>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            PAYMENT REPORT
        ================================================= */}

        {report.id === 'payment' && (

          <div className="fin-report-modal-body">

            <div className="fin-report-mini-summary">

              <div>
                <span>Transactions</span>
                <strong>4</strong>
              </div>

              <div>
                <span>Total Received</span>
                <strong>₹27,000</strong>
              </div>

              <div>
                <span>Average Payment</span>
                <strong>₹6,750</strong>
              </div>

            </div>

            <div className="fin-report-table-card">

              <div className="fin-report-table-title">
                Payment Transactions
              </div>

              <div className="fin-report-table-wrapper">

                <table className="fin-report-table">

                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>CUSTOMER</th>
                      <th>LOAN ID</th>
                      <th>METHOD</th>
                      <th>REFERENCE</th>
                      <th>AMOUNT</th>
                    </tr>
                  </thead>

                  <tbody>

                    {payments.map((payment, index) => (

                      <tr key={index}>

                        <td>{payment.date}</td>

                        <td>
                          <strong>{payment.customer}</strong>
                        </td>

                        <td>{payment.loanId}</td>

                        <td>{payment.method}</td>

                        <td>{payment.reference}</td>

                        <td>
                          <strong className="fin-report-credit">
                            {currency(payment.amount)}
                          </strong>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            OVERDUE REPORT
        ================================================= */}

        {report.id === 'overdue' && (

          <div className="fin-report-modal-body">

            <div className="fin-report-mini-summary overdue-summary">

              <div>
                <span>Overdue Accounts</span>
                <strong>2</strong>
              </div>

              <div>
                <span>Total Overdue</span>
                <strong>₹4,700</strong>
              </div>

              <div>
                <span>Highest Delay</span>
                <strong>27 Days</strong>
              </div>

            </div>

            <div className="fin-report-table-card">

              <div className="fin-report-table-title">
                Accounts Requiring Attention
              </div>

              <div className="fin-report-table-wrapper">

                <table className="fin-report-table">

                  <thead>
                    <tr>
                      <th>CUSTOMER</th>
                      <th>LOAN ID</th>
                      <th>DUE DATE</th>
                      <th>OVERDUE DAYS</th>
                      <th>AMOUNT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {overdueAccounts.map((account, index) => (

                      <tr key={index}>

                        <td>
                          <strong>{account.customer}</strong>
                        </td>

                        <td>{account.loanId}</td>

                        <td>{account.dueDate}</td>

                        <td>
                          <span className="fin-report-danger-text">
                            {account.overdueDays} days
                          </span>
                        </td>

                        <td>
                          <strong>
                            {currency(account.amount)}
                          </strong>
                        </td>

                        <td>
                          <span className="fin-report-badge danger">
                            {account.status}
                          </span>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            INTEREST REPORT
        ================================================= */}

        {report.id === 'interest' && (

          <div className="fin-report-modal-body">

            <div className="fin-report-mini-summary">

              <div>
                <span>Interest Applied</span>
                <strong>₹1,925</strong>
              </div>

              <div>
                <span>Interest Received</span>
                <strong>₹1,225</strong>
              </div>

              <div>
                <span>Interest Due</span>
                <strong>₹700</strong>
              </div>

            </div>

            <div className="fin-report-table-card">

              <div className="fin-report-table-title">
                Interest Schedule — Aug 2026
              </div>

              <div className="fin-report-table-wrapper">

                <table className="fin-report-table">

                  <thead>
                    <tr>
                      <th>MONTH</th>
                      <th>CUSTOMER</th>
                      <th>LOAN ID</th>
                      <th>PRINCIPAL</th>
                      <th>RATE</th>
                      <th>INTEREST</th>
                      <th>RECEIVED</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {interestRows.map((row, index) => (

                      <tr key={index}>

                        <td>{row.month}</td>

                        <td>
                          <strong>{row.customer}</strong>
                        </td>

                        <td>{row.loanId}</td>

                        <td>{currency(row.principal)}</td>

                        <td>{row.rate}</td>

                        <td>{currency(row.interest)}</td>

                        <td>
                          {currency(row.received)}
                        </td>

                        <td>

                          <span
                            className={`fin-report-badge ${
                              row.status === 'Received'
                                ? 'success'
                                : 'warning'
                            }`}
                          >
                            {row.status}
                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            COLLECTION REPORT
        ================================================= */}

        {report.id === 'collection' && (

          <div className="fin-report-modal-body">

            <div className="fin-report-mini-summary">

              <div>
                <span>6 Month Collection</span>
                <strong>₹15.50L</strong>
              </div>

              <div>
                <span>Current Month</span>
                <strong>₹3.50L</strong>
              </div>

              <div>
                <span>Efficiency</span>
                <strong className="green-text">
                  94.8%
                </strong>
              </div>

            </div>

            <div className="fin-report-chart-card">

              <div className="fin-report-chart-title">
                Monthly Collection Performance
              </div>

              <div className="fin-report-bars">

                {collectionData.map((item) => {

                  const max =
                    Math.max(
                      ...collectionData.map(
                        (value) => value.collected
                      )
                    );

                  const height =
                    (item.collected / max) * 100;

                  return (
                    <div
                      className="fin-report-bar-column"
                      key={item.month}
                    >

                      <div className="fin-report-bar-value">
                        ₹{Math.round(item.collected / 1000)}K
                      </div>

                      <div className="fin-report-bar-track">

                        <div
                          className="fin-report-bar-fill"
                          style={{
                            height: `${height}%`,
                          }}
                        />

                      </div>

                      <span>{item.month}</span>

                    </div>
                  );
                })}

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            CUSTOMER STATEMENT
        ================================================= */}

        {report.id === 'statement' && (

          <div className="fin-report-modal-body">

            <div className="fin-statement-selector">

              <label>
                Select Customer
              </label>

              <div className="fin-statement-controls">

                <div className="fin-statement-search">

                  <Search size={16} />

                  <input
                    value={customerSearch}
                    onChange={(e) =>
                      setCustomerSearch(e.target.value)
                    }
                    placeholder="Search customer..."
                  />

                </div>

                <select
                  value={statementCustomer}
                  onChange={(e) =>
                    setStatementCustomer(e.target.value)
                  }
                >

                  {filteredCustomers.map(
                    (customer) => (
                      <option
                        key={customer.id}
                        value={customer.name}
                      >
                        {customer.name}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            <div className="fin-statement-header">

              <div>
                <h3>{statementCustomer}</h3>

                <p>
                  Customer financial ledger statement
                </p>
              </div>

              <div>
                <span>
                  Outstanding
                </span>

                <strong>
                  {currency(
                    customers.find(
                      (customer) =>
                        customer.name === statementCustomer
                    )?.outstanding || 0
                  )}
                </strong>
              </div>

            </div>

            <div className="fin-report-table-card">

              <div className="fin-report-table-title">
                Statement Transactions
              </div>

              <div className="fin-report-table-wrapper">

                <table className="fin-report-table">

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

                    {(statements[statementCustomer] ||
                      [
                        {
                          date: '—',
                          description:
                            'No statement transactions',
                          debit: 0,
                          credit: 0,
                          balance: 0,
                          status: '—',
                        },
                      ]).map(
                      (row, index) => (

                        <tr key={index}>

                          <td>{row.date}</td>

                          <td>
                            <strong>
                              {row.description}
                            </strong>
                          </td>

                          <td>
                            {row.debit
                              ? currency(row.debit)
                              : '—'}
                          </td>

                          <td className="fin-report-credit">
                            {row.credit
                              ? currency(row.credit)
                              : '—'}
                          </td>

                          <td>
                            <strong>
                              {currency(row.balance)}
                            </strong>
                          </td>

                          <td>
                            {row.status !== '—' ? (
                              <span
                                className={`fin-report-badge ${
                                  row.status === 'Due'
                                    ? 'warning'
                                    : 'success'
                                }`}
                              >
                                {row.status}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

/* =========================================================
   MAIN REPORTS PAGE
========================================================= */

export default function Reports() {

  const [selectedReport, setSelectedReport] =
    useState(null);

  const handleView = (report) => {
    setSelectedReport(report);
  };

  const handleExport = (report) => {

    setSelectedReport(report);

    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <div className="fin-reports-page animate-fade-in">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="fin-reports-header">

        <div>

          <h1 className="fin-reports-title">
            Reports
          </h1>

          <p className="fin-reports-subtitle">
            Download and view business reports
          </p>

        </div>

      </div>

      {/* ===================================================
          REPORT GRID
      =================================================== */}

      <div className="fin-report-card-grid">

        {reportData.map((report) => {

          const Icon = report.icon;

          return (

            <div
              className="fin-report-card"
              key={report.id}
            >

              <div
                className={`fin-report-icon ${report.iconClass}`}
              >
                <Icon size={23} />
              </div>

              <div className="fin-report-card-content">

                <h3>
                  {report.title}
                </h3>

                <p>
                  {report.description}
                </p>

              </div>

              <div className="fin-report-card-bottom">

                <span
                  className={`fin-report-metric ${report.iconClass}`}
                >
                  {report.metric}
                </span>

                <div className="fin-report-card-actions">

                  <button
                    type="button"
                    className="fin-report-view-btn"
                    onClick={() =>
                      handleView(report)
                    }
                  >
                    <Eye size={14} />
                    View
                  </button>

                  <button
                    type="button"
                    className="fin-report-export-btn"
                    onClick={() =>
                      handleExport(report)
                    }
                  >
                    <Download size={14} />
                    Export PDF
                  </button>

                </div>

              </div>

            </div>

          );
        })}

      </div>

      {/* ===================================================
          VIEW MODAL
      =================================================== */}

      {selectedReport && (

        <ReportViewModal
          report={selectedReport}
          onClose={() =>
            setSelectedReport(null)
          }
        />

      )}

    </div>
  );
}