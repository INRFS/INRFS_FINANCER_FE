import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  IndianRupee,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import './Payments.css';

/*
  Payments.jsx
  ------------------------------------------------------------
  Complete Payments & Interest Schedule implementation.

  Flow:
    Payments
      -> Record Payment
      -> Reschedule Loan Date
      -> dedicated Reschedule form

  Status rules:
    Success  = payment.status === 'Success'
    Overdue  = not successful + due date < today
    Pending  = not successful + due date >= today

  Replace INITIAL_LOANS with your API/store data when wiring this
  into your existing application.
*/

const INITIAL_LOANS = [
  {
    loanId: 'LN000128',
    customerId: 'CUS004',
    customer: 'Vikram Singh',
    mobile: '+91 98765 11111',
    principal: 25000,
    outstanding: 20000,
    interestDue: 2000,
    dueDate: '2026-08-05',
    frequency: 'Monthly',
    rate: 10,
    payments: [
      {
        id: 'PAY128-1',
        amount: 2000,
        type: 'Interest',
        date: '2026-08-05',
        method: 'Google Pay',
        reference: 'GP-12801',
        notes: '',
        status: 'Success',
      },
    ],
    rescheduleHistory: [],
  },
  {
    loanId: 'LN000126',
    customerId: 'CUS001',
    customer: 'Ramesh Kumar',
    mobile: '+91 98001 11111',
    principal: 11000,
    outstanding: 11000,
    interestDue: 550,
    dueDate: '2026-08-08',
    frequency: 'Weekly',
    rate: 5,
    payments: [
      {
        id: 'PAY126-1',
        amount: 550,
        type: 'Interest',
        date: '2026-08-08',
        method: 'Cash',
        reference: '',
        notes: '',
        status: 'Success',
      },
    ],
    rescheduleHistory: [],
  },
  {
    loanId: 'LN000125',
    customerId: 'CUS001',
    customer: 'Ramesh Kumar',
    mobile: '+91 98001 11111',
    principal: 10000,
    outstanding: 10000,
    interestDue: 1000,
    dueDate: '2026-08-12',
    frequency: 'Monthly',
    rate: 10,
    payments: [
      {
        id: 'PAY125-1',
        amount: 1000,
        type: 'Interest',
        date: '2026-08-12',
        method: 'PhonePe',
        reference: 'PP-12501',
        notes: '',
        status: 'Success',
      },
    ],
    rescheduleHistory: [],
  },
  {
    loanId: 'LN000129',
    customerId: 'CUS009',
    customer: 'Rajesh Patel',
    mobile: '+91 99001 22222',
    principal: 12000,
    outstanding: 12000,
    interestDue: 540,
    dueDate: '2026-08-10',
    frequency: 'Monthly',
    rate: 4.5,
    payments: [],
    rescheduleHistory: [],
  },
  {
    loanId: 'LN000130',
    customerId: 'CUS010',
    customer: 'Anita Shah',
    mobile: '+91 99111 33333',
    principal: 18000,
    outstanding: 18000,
    interestDue: 900,
    dueDate: '2026-08-22',
    frequency: 'Monthly',
    rate: 5,
    payments: [],
    rescheduleHistory: [],
  },
];

const PAYMENT_TYPES = ['Interest', 'Principal', 'Principal + Interest'];
const PAYMENT_METHODS = ['Cash', 'PhonePe', 'Google Pay', 'UPI', 'Bank Transfer', 'Cheque'];

const EMPTY_PAYMENT = {
  date: todayISO(),
  amount: '',
  type: 'Interest',
  method: 'PhonePe',
  reference: '',
  notes: '',
};

const EMPTY_RESCHEDULE = {
  date: todayISO(),
  newDueDate: '',
  reason: '',
};

function todayISO() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toISODate(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(`${toISODate(value)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function getPaymentStatus(payment, loan) {
  if (payment.status === 'Success') return 'Success';

  const dueDate = toISODate(payment.dueDate || loan?.dueDate);
  if (dueDate && dueDate < todayISO()) return 'Overdue';

  return 'Pending';
}

function getLoanStatus(loan) {
  const latestSuccessful = loan.payments?.some(
    (payment) => payment.status === 'Success'
  );

  if (loan.outstanding <= 0) return 'Success';
  if (loan.dueDate < todayISO() && !latestSuccessful) return 'Overdue';

  return 'Pending';
}

function getActivityRecords(loans) {
  const records = [];

  loans.forEach((loan) => {
    (loan.payments || []).forEach((payment) => {
      records.push({
        ...payment,
        loanId: loan.loanId,
        customerId: loan.customerId,
        customer: loan.customer,
        interest: payment.type === 'Interest' ? payment.amount : 0,
        dueDate: payment.dueDate || loan.dueDate,
        derivedStatus: getPaymentStatus(payment, loan),
      });
    });

    /*
      If there is no successful payment for the current due obligation,
      expose one pending/overdue activity row so the user can collect it.
    */
    const hasOpenPayment = (loan.payments || []).some(
      (payment) =>
        payment.status !== 'Success' &&
        toISODate(payment.dueDate || loan.dueDate) === toISODate(loan.dueDate)
    );

    const alreadyHasDuePayment = (loan.payments || []).some(
      (payment) =>
        toISODate(payment.dueDate || loan.dueDate) === toISODate(loan.dueDate)
    );

    if (!hasOpenPayment && !alreadyHasDuePayment && loan.outstanding > 0) {
      records.push({
        id: `DUE-${loan.loanId}`,
        loanId: loan.loanId,
        customerId: loan.customerId,
        customer: loan.customer,
        amount: loan.interestDue,
        type: 'Interest',
        date: loan.dueDate,
        method: '-',
        reference: '',
        notes: '',
        status: 'Pending',
        dueDate: loan.dueDate,
        interest: loan.interestDue,
        derivedStatus: getLoanStatus(loan),
        isDueRecord: true,
      });
    }
  });

  return records.sort((a, b) => {
    const aDate = toISODate(a.date || a.dueDate);
    const bDate = toISODate(b.date || b.dueDate);
    return bDate.localeCompare(aDate);
  });
}

export default function Payments() {
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortOldest, setSortOldest] = useState(true);

  const [paymentModal, setPaymentModal] = useState({
    open: false,
    loanId: null,
    recordId: null,
  });

  const [rescheduleModal, setRescheduleModal] = useState({
    open: false,
    loanId: null,
  });

  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT);
  const [rescheduleForm, setRescheduleForm] = useState(EMPTY_RESCHEDULE);

  const [message, setMessage] = useState(null);

  const activity = useMemo(() => getActivityRecords(loans), [loans]);

  const filteredActivity = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = activity.filter((record) => {
      const matchesSearch =
        !query ||
        record.loanId.toLowerCase().includes(query) ||
        record.customer.toLowerCase().includes(query);

      const matchesDate =
        !dateFilter || toISODate(record.date || record.dueDate) === dateFilter;

      const matchesType =
        typeFilter === 'All Types' || record.type === typeFilter;

      const matchesStatus =
        statusFilter === 'All Statuses' ||
        record.derivedStatus === statusFilter;

      return matchesSearch && matchesDate && matchesType && matchesStatus;
    });

    return result.sort((a, b) => {
      const aDate = toISODate(a.date || a.dueDate);
      const bDate = toISODate(b.date || b.dueDate);
      return sortOldest
        ? aDate.localeCompare(bDate)
        : bDate.localeCompare(aDate);
    });
  }, [
    activity,
    search,
    dateFilter,
    typeFilter,
    statusFilter,
    sortOldest,
  ]);

  const stats = useMemo(() => {
    const records = activity;

    const successful = records.filter(
      (record) => record.derivedStatus === 'Success'
    );

    const pending = records.filter(
      (record) => record.derivedStatus === 'Pending'
    );

    const overdue = records.filter(
      (record) => record.derivedStatus === 'Overdue'
    );

    const currentMonth = todayISO().slice(0, 7);

    return {
      totalCollected: successful.reduce(
        (sum, record) => sum + Number(record.amount || 0),
        0
      ),
      thisMonth: successful
        .filter((record) => toISODate(record.date).slice(0, 7) === currentMonth)
        .reduce((sum, record) => sum + Number(record.amount || 0), 0),
      pending: pending.reduce(
        (sum, record) => sum + Number(record.amount || 0),
        0
      ),
      overdue: overdue.reduce(
        (sum, record) => sum + Number(record.amount || 0),
        0
      ),
    };
  }, [activity]);

  const selectedPaymentLoan = loans.find(
    (loan) => loan.loanId === paymentModal.loanId
  );

  const selectedRescheduleLoan = loans.find(
    (loan) => loan.loanId === rescheduleModal.loanId
  );

  function showMessage(type, text) {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 2800);
  }

  function openPaymentModal(loanId, recordId = null) {
    const loan = loans.find((item) => item.loanId === loanId);
    if (!loan) return;

    const record = activity.find(
      (item) => item.loanId === loanId && item.id === recordId
    );

    setPaymentForm({
      ...EMPTY_PAYMENT,
      date: todayISO(),
      amount: record?.amount ? String(record.amount) : '',
      type: record?.type || 'Interest',
    });

    setPaymentModal({
      open: true,
      loanId,
      recordId,
    });
  }

  function closePaymentModal() {
    setPaymentModal({ open: false, loanId: null, recordId: null });
    setPaymentForm(EMPTY_PAYMENT);
  }

  function openRescheduleModal(loanId) {
    const loan = loans.find((item) => item.loanId === loanId);
    if (!loan) return;

    setRescheduleForm({
      ...EMPTY_RESCHEDULE,
      date: todayISO(),
      newDueDate: loan.dueDate,
      reason: '',
    });

    setRescheduleModal({
      open: true,
      loanId,
    });
  }

  function closeRescheduleModal() {
    setRescheduleModal({ open: false, loanId: null });
    setRescheduleForm(EMPTY_RESCHEDULE);
  }

  function updatePayment(field, value) {
    setPaymentForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateReschedule(field, value) {
    setRescheduleForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function recordPayment(event) {
    event.preventDefault();

    if (!selectedPaymentLoan) return;

    const amount = Number(paymentForm.amount);

    if (!paymentForm.date || !paymentForm.type || !paymentForm.method) {
      showMessage('error', 'Please complete all required payment fields.');
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      showMessage('error', 'Amount received must be greater than ₹0.');
      return;
    }

    setLoans((previousLoans) =>
      previousLoans.map((loan) => {
        if (loan.loanId !== selectedPaymentLoan.loanId) return loan;

        const newPayment = {
          id: `PAY-${Date.now()}`,
          amount,
          type: paymentForm.type,
          date: paymentForm.date,
          method: paymentForm.method,
          reference: paymentForm.reference.trim(),
          notes: paymentForm.notes.trim(),
          status: 'Success',
          dueDate: loan.dueDate,
        };

        const principalPaid =
          paymentForm.type === 'Principal'
            ? amount
            : paymentForm.type === 'Principal + Interest'
              ? Math.min(amount, loan.outstanding)
              : 0;

        return {
          ...loan,
          outstanding: Math.max(0, loan.outstanding - principalPaid),
          payments: [...(loan.payments || []), newPayment],
        };
      })
    );

    closePaymentModal();
    showMessage('success', 'Payment recorded successfully. Status moved to Success.');
  }

  function rescheduleLoan(event) {
    event.preventDefault();

    if (!selectedRescheduleLoan) return;

    if (!rescheduleForm.newDueDate) {
      showMessage('error', 'Please select a new due date.');
      return;
    }

    if (!rescheduleForm.reason.trim()) {
      showMessage('error', 'Please enter the reason for rescheduling.');
      return;
    }

    if (rescheduleForm.newDueDate <= todayISO()) {
      showMessage('error', 'New due date must be a future date.');
      return;
    }

    if (rescheduleForm.newDueDate === selectedRescheduleLoan.dueDate) {
      showMessage('error', 'New due date must be different from the current due date.');
      return;
    }

    setLoans((previousLoans) =>
      previousLoans.map((loan) => {
        if (loan.loanId !== selectedRescheduleLoan.loanId) return loan;

        return {
          ...loan,
          dueDate: rescheduleForm.newDueDate,
          rescheduleHistory: [
            ...(loan.rescheduleHistory || []),
            {
              id: `RES-${Date.now()}`,
              date: rescheduleForm.date,
              fromDate: loan.dueDate,
              toDate: rescheduleForm.newDueDate,
              reason: rescheduleForm.reason.trim(),
            },
          ],
          payments: (loan.payments || []).map((payment) => ({
            ...payment,
            dueDate:
              payment.status === 'Success'
                ? payment.dueDate
                : payment.dueDate === loan.dueDate
                  ? rescheduleForm.newDueDate
                  : payment.dueDate,
          })),
        };
      })
    );

    closeRescheduleModal();
    showMessage('success', 'Loan due date rescheduled successfully.');
  }

  function exportPayments() {
    const rows = [
      [
        'Loan ID',
        'Customer',
        'Type',
        'Amount',
        'Date',
        'Method',
        'Status',
      ],
      ...filteredActivity.map((record) => [
        record.loanId,
        record.customer,
        record.type,
        record.amount,
        formatDate(record.date || record.dueDate),
        record.method,
        record.derivedStatus,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `payments-${todayISO()}.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="payments-page">
      {message && (
        <div className={`payments-toast payments-toast-${message.type}`}>
          {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="payments-header">
        <div>
          <h1>Payments &amp; Interest Schedule</h1>
          <p>Monitor collections, interest dues and payment transactions in one place.</p>
        </div>

        <div className="payments-header-actions">
          <button
            type="button"
            className="payments-btn payments-btn-secondary"
            onClick={exportPayments}
          >
            <Download size={18} />
            Export
          </button>

          <button
            type="button"
            className="payments-btn payments-btn-primary"
            onClick={() => openPaymentModal(INITIAL_LOANS[0]?.loanId)}
          >
            <Plus size={20} />
            Record Payment
          </button>
        </div>
      </div>

      <section className="payments-stats-grid">
        <StatCard
          icon={<IndianRupee size={22} />}
          tone="green"
          label="Total Collected"
          value={formatCurrency(stats.totalCollected)}
        />
        <StatCard
          icon={<CalendarDays size={22} />}
          tone="blue"
          label="This Month"
          value={formatCurrency(stats.thisMonth)}
        />
        <StatCard
          icon={<Clock3 size={22} />}
          tone="yellow"
          label="Pending Collection"
          value={formatCurrency(stats.pending)}
        />
        <StatCard
          icon={<RefreshCw size={22} />}
          tone="red"
          label="Overdue Collection"
          value={formatCurrency(stats.overdue)}
        />
      </section>

      <section className="payments-filter-bar">
        <div className="payments-search">
          <Search size={19} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search loan ID or customer..."
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="payments-date-filter">
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
          />
        </div>

        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          options={['All Types', ...PAYMENT_TYPES]}
        />

        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={['All Statuses', 'Success', 'Pending', 'Overdue']}
        />

        <button
          type="button"
          className={`payments-sort-btn ${sortOldest ? 'is-active' : ''}`}
          onClick={() => setSortOldest((value) => !value)}
        >
          <SlidersHorizontal size={18} />
          {sortOldest ? 'Earliest' : 'Latest'}
        </button>
      </section>

      <section className="payments-activity-card">
        <div className="payments-activity-header">
          <div>
            <h2>Payment Activity</h2>
            <p>Payments and upcoming interest obligations</p>
          </div>

          <span className="payments-record-count">
            {filteredActivity.length} Records
          </span>
        </div>

        <div className="payments-table-wrap">
          <table className="payments-table">
            <thead>
              <tr>
                <th>LOAN ID</th>
                <th>CUSTOMER</th>
                <th>TYPE</th>
                <th>AMOUNT</th>
                <th>INTEREST</th>
                <th>DATE</th>
                <th>METHOD</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredActivity.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                filteredActivity.map((record) => (
                  <PaymentRow
                    key={record.id}
                    record={record}
                    onRecord={() => openPaymentModal(record.loanId, record.id)}
                    onReschedule={() => openRescheduleModal(record.loanId)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {paymentModal.open && selectedPaymentLoan && (
        <ModalShell onClose={closePaymentModal}>
          <form className="payments-modal-form" onSubmit={recordPayment}>
            <ModalHeader
              title="Record Payment"
              subtitle={`${selectedPaymentLoan.customer} · ${selectedPaymentLoan.loanId}`}
              onClose={closePaymentModal}
            />

            <div className="payments-form-body">
              <div className="payments-form-grid">
                <Field label="Payment Date" required>
                  <input
                    type="date"
                    value={paymentForm.date}
                    onChange={(event) => updatePayment('date', event.target.value)}
                    required
                  />
                </Field>

                <Field label="Amount Received (₹)" required>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={paymentForm.amount}
                    onChange={(event) => updatePayment('amount', event.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </Field>
              </div>

              <Field label="Payment Type" required>
                <div className="payments-segmented">
                  {PAYMENT_TYPES.map((type) => (
                    <button
                      type="button"
                      key={type}
                      className={paymentForm.type === type ? 'is-selected' : ''}
                      onClick={() => updatePayment('type', type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="payments-form-grid">
                <Field label="Payment Method" required>
                  <div className="payments-select-wrap">
                    <select
                      value={paymentForm.method}
                      onChange={(event) =>
                        updatePayment('method', event.target.value)
                      }
                      required
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method}>{method}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} />
                  </div>
                </Field>

                <Field label="Transaction Reference">
                  <input
                    value={paymentForm.reference}
                    onChange={(event) =>
                      updatePayment('reference', event.target.value)
                    }
                    placeholder="Optional"
                  />
                </Field>
              </div>

              <Field label="Notes">
                <textarea
                  value={paymentForm.notes}
                  onChange={(event) => updatePayment('notes', event.target.value)}
                  placeholder="Optional notes..."
                  rows="3"
                />
              </Field>

              <button
                type="button"
                className="payments-reschedule-action"
                onClick={() => {
                  closePaymentModal();
                  openRescheduleModal(selectedPaymentLoan.loanId);
                }}
              >
                <span className="payments-reschedule-icon">
                  <CalendarDays size={19} />
                </span>
                <span className="payments-reschedule-copy">
                  <strong>Reschedule Loan Date</strong>
                  <small>Change the due date for this loan</small>
                </span>
                <ChevronRight size={20} />
              </button>

              <PaymentSummary
                loan={selectedPaymentLoan}
                amount={Number(paymentForm.amount || 0)}
              />
            </div>

            <ModalFooter
              onCancel={closePaymentModal}
              submitLabel="Record Payment"
            />
          </form>
        </ModalShell>
      )}

      {rescheduleModal.open && selectedRescheduleLoan && (
        <ModalShell onClose={closeRescheduleModal}>
          <form className="payments-modal-form" onSubmit={rescheduleLoan}>
            <ModalHeader
              title="Reschedule Loan Date"
              subtitle={`${selectedRescheduleLoan.customer} · ${selectedRescheduleLoan.loanId}`}
              onClose={closeRescheduleModal}
            />

            <div className="payments-form-body">
              <div className="payments-current-date-card">
                <div className="payments-current-date-icon">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <span>Current Due Date</span>
                  <strong>{formatDate(selectedRescheduleLoan.dueDate)}</strong>
                </div>
              </div>

              <div className="payments-form-grid">
                <Field label="New Due Date" required>
                  <input
                    type="date"
                    min={todayISO()}
                    value={rescheduleForm.newDueDate}
                    onChange={(event) =>
                      updateReschedule('newDueDate', event.target.value)
                    }
                    required
                  />
                </Field>

                <Field label="Reschedule Date">
                  <input
                    type="date"
                    value={rescheduleForm.date}
                    onChange={(event) =>
                      updateReschedule('date', event.target.value)
                    }
                  />
                </Field>
              </div>

              <Field label="Reason" required>
                <textarea
                  value={rescheduleForm.reason}
                  onChange={(event) =>
                    updateReschedule('reason', event.target.value)
                  }
                  placeholder="Customer requested extension..."
                  rows="4"
                  required
                />
              </Field>

              <div className="payments-info-box">
                <FileText size={17} />
                <span>
                  Only this loan&apos;s due date will be changed. Existing
                  payment records will remain unchanged.
                </span>
              </div>
            </div>

            <div className="payments-modal-footer">
              <button
                type="button"
                className="payments-btn payments-btn-secondary payments-back-btn"
                onClick={() => {
                  closeRescheduleModal();
                  openPaymentModal(selectedRescheduleLoan.loanId);
                }}
              >
                <ChevronLeft size={18} />
                Back
              </button>

              <button
                type="submit"
                className="payments-btn payments-btn-primary"
              >
                <Check size={18} />
                Reschedule Loan
              </button>
            </div>
          </form>
        </ModalShell>
      )}
    </div>
  );
}

function StatCard({ icon, tone, label, value }) {
  return (
    <article className="payments-stat-card">
      <div className={`payments-stat-icon payments-stat-icon-${tone}`}>
        {icon}
      </div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <div className="payments-filter-select">
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      <ChevronDown size={17} />
    </div>
  );
}

function PaymentRow({ record, onRecord, onReschedule }) {
  const status = record.derivedStatus;

  return (
    <tr>
      <td>
        <button type="button" className="payments-loan-link" onClick={onRecord}>
          {record.loanId}
        </button>
      </td>

      <td>
        <strong className="payments-customer-name">{record.customer}</strong>
      </td>

      <td>
        <span className="payments-type-text">{record.type}</span>
      </td>

      <td>
        <strong className="payments-amount">
          {formatCurrency(record.amount)}
        </strong>
      </td>

      <td>
        {record.interest ? formatCurrency(record.interest) : '—'}
      </td>

      <td>{formatDate(record.date || record.dueDate)}</td>

      <td>
        <span className="payments-method-pill">{record.method || '—'}</span>
      </td>

      <td>
        <StatusBadge status={status} />
      </td>

      <td>
        <div className="payments-row-actions">
          {status !== 'Success' ? (
            <button
              type="button"
              className="payments-action-btn payments-action-record"
              onClick={onRecord}
            >
              Record
            </button>
          ) : (
            <button
              type="button"
              className="payments-action-btn"
              onClick={onRecord}
            >
              View
            </button>
          )}

          <button
            type="button"
            className="payments-action-btn payments-action-calendar"
            onClick={onReschedule}
            aria-label={`Reschedule ${record.loanId}`}
            title="Reschedule loan date"
          >
            <CalendarDays size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`payments-status payments-status-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

function PaymentSummary({ loan, amount }) {
  const amountDue = Number(loan.interestDue || 0);
  const received = Math.min(amountDue, Number(amount || 0));
  const outstanding = Math.max(0, amountDue - received);

  return (
    <div className="payments-summary">
      <div>
        <span>Amount Due</span>
        <strong>{formatCurrency(amountDue)}</strong>
      </div>
      <div>
        <span>Amount Received</span>
        <strong className="payments-summary-green">
          {formatCurrency(received)}
        </strong>
      </div>
      <div className="payments-summary-divider" />
      <div>
        <span>Outstanding</span>
        <strong className="payments-summary-orange">
          {formatCurrency(outstanding)}
        </strong>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="payments-field">
      <span>
        {label}
        {required && <em>*</em>}
      </span>
      {children}
    </label>
  );
}

function ModalShell({ children, onClose }) {
  return (
    <div className="payments-modal-overlay" role="presentation">
      <div
        className="payments-modal"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }) {
  return (
    <div className="payments-modal-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>

      <button
        type="button"
        className="payments-modal-close"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={25} />
      </button>
    </div>
  );
}

function ModalFooter({ onCancel, submitLabel }) {
  return (
    <div className="payments-modal-footer">
      <button
        type="button"
        className="payments-btn payments-btn-secondary"
        onClick={onCancel}
      >
        Cancel
      </button>

      <button type="submit" className="payments-btn payments-btn-primary">
        <Check size={18} />
        {submitLabel}
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="payments-empty">
      <div>
        <Search size={22} />
      </div>
      <strong>No payment records found</strong>
      <span>Try changing the search or filters.</span>
    </div>
  );
}