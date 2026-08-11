import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  CalendarDays,
  Download,
  WalletCards,
  Clock3,
  AlertTriangle,
  ArrowUpDown,
  X,
  Check,
} from 'lucide-react';

import StatusBadge from '../../../common/components/StatusBadge';
import { formatCurrency } from '../../../common/utils/formatters';

import './Payments.css';


/* =========================================================
   MOCK DATA
   Replace these arrays with your API/mock data later.
   ========================================================= */

const initialPayments = [
  {
    paymentId: 'PAY-1001',
    loanId: 'LN000125',
    customer: 'Ramesh Kumar',
    date: '12-Aug-2026',
    amount: 1000,
    type: 'Interest',
    method: 'PhonePe',
    reference: 'PP2024081200123',
    status: 'Success',
  },
  {
    paymentId: 'PAY-1002',
    loanId: 'LN000126',
    customer: 'Ramesh Kumar',
    date: '08-Aug-2026',
    amount: 550,
    type: 'Interest',
    method: 'Cash',
    reference: '-',
    status: 'Success',
  },
  {
    paymentId: 'PAY-1003',
    loanId: 'LN000128',
    customer: 'Vikram Singh',
    date: '05-Aug-2026',
    amount: 2000,
    type: 'Interest',
    method: 'Google Pay',
    reference: 'GP20240805',
    status: 'Success',
  },
  {
    paymentId: 'PAY-1004',
    loanId: 'LN000131',
    customer: 'Mohammed Ali',
    date: '20-Aug-2026',
    amount: 900,
    type: 'Interest',
    method: 'PhonePe',
    reference: 'PP202408200456',
    status: 'Success',
  },
];


const initialSchedules = [
  {
    scheduleId: 'SCH-001',
    loanId: 'LN000125',
    customer: 'Ramesh Kumar',
    principal: 50000,
    interestRate: 2,
    interestAmount: 1000,
    dueDate: '10-Sep-2026',
    status: 'Due',
  },
  {
    scheduleId: 'SCH-002',
    loanId: 'LN000127',
    customer: 'Priya Sharma',
    principal: 40000,
    interestRate: 2,
    interestAmount: 800,
    dueDate: '05-Sep-2026',
    status: 'Due',
  },
  {
    scheduleId: 'SCH-003',
    loanId: 'LN000128',
    customer: 'Vikram Singh',
    principal: 25000,
    interestRate: 2.5,
    interestAmount: 625,
    dueDate: '10-Sep-2026',
    status: 'Due',
  },
  {
    scheduleId: 'SCH-004',
    loanId: 'LN000129',
    customer: 'Rajesh Patel',
    principal: 18000,
    interestRate: 3,
    interestAmount: 540,
    dueDate: '01-Sep-2026',
    status: 'Overdue',
  },
  {
    scheduleId: 'SCH-005',
    loanId: 'LN000131',
    customer: 'Mohammed Ali',
    principal: 50000,
    interestRate: 2,
    interestAmount: 1000,
    dueDate: '20-Sep-2026',
    status: 'Upcoming',
  },
  {
    scheduleId: 'SCH-006',
    loanId: 'LN000132',
    customer: 'Mohammed Ali',
    principal: 35000,
    interestRate: 2,
    interestAmount: 700,
    dueDate: '25-Sep-2026',
    status: 'Upcoming',
  },
];


/* =========================================================
   DATE HELPERS
   ========================================================= */

const MONTHS = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};


const parseDate = (value) => {
  if (!value) return null;

  const text = String(value).trim();

  const match = text.match(
    /^(\d{1,2})[-\s]([A-Za-z]{3})[-\s](\d{4})$/
  );

  if (!match) return null;

  const day = Number(match[1]);
  const month = MONTHS[match[2]];
  const year = Number(match[3]);

  if (month === undefined) return null;

  return new Date(year, month, day);
};


const dateToKey = (value) => {
  const date = parseDate(value);

  if (!date) return '';

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function PaymentsInterestSchedule() {

  const [payments, setPayments] =
    useState(initialPayments);

  const [schedules] =
    useState(initialSchedules);


  /* =======================================================
     UI STATE
     ======================================================= */

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('all');

  const [typeFilter, setTypeFilter] =
    useState('all');

  const [dateFilter, setDateFilter] =
    useState('');

  const [sortOrder, setSortOrder] =
    useState('asc');


  const [showPaymentModal, setShowPaymentModal] =
    useState(false);


  const [selectedLoan, setSelectedLoan] =
    useState(schedules[0]);


  /* =======================================================
     PAYMENT FORM
     ======================================================= */

  const [paymentForm, setPaymentForm] =
    useState({
      paymentDate: '10-Aug-2026',
      amount: '',
      paymentType: 'Interest',
      paymentMethod: 'PhonePe',
      reference: '',
      notes: '',
    });


  /* =======================================================
     UNIFIED RECORDS
     
     Payments + schedules are combined into one table.
     ======================================================= */

  const combinedRecords = useMemo(() => {

    const paymentRecords =
      payments.map((payment) => ({
        id: payment.paymentId,
        recordType: 'payment',

        paymentId: payment.paymentId,

        loanId: payment.loanId,

        customer: payment.customer,

        principal: null,

        interestRate: null,

        interestAmount: null,

        date: payment.date,

        amount: payment.amount,

        type: payment.type,

        method: payment.method,

        reference: payment.reference,

        status: payment.status,
      }));


    const scheduleRecords =
      schedules.map((schedule) => ({
        id: schedule.scheduleId,

        recordType: 'schedule',

        paymentId: null,

        loanId: schedule.loanId,

        customer: schedule.customer,

        principal: schedule.principal,

        interestRate: schedule.interestRate,

        interestAmount: schedule.interestAmount,

        date: schedule.dueDate,

        amount: schedule.interestAmount,

        type: 'Interest Due',

        method: null,

        reference: null,

        status: schedule.status,
      }));


    return [
      ...paymentRecords,
      ...scheduleRecords,
    ];

  }, [payments, schedules]);


  /* =======================================================
     FILTER + SORT
     ======================================================= */

  const filteredRecords = useMemo(() => {

    const searchValue =
      search.trim().toLowerCase();


    const result =
      combinedRecords.filter((record) => {

        /* SEARCH */

        if (searchValue) {

          const matchesSearch =
            String(record.customer)
              .toLowerCase()
              .includes(searchValue) ||

            String(record.loanId)
              .toLowerCase()
              .includes(searchValue) ||

            String(record.paymentId || '')
              .toLowerCase()
              .includes(searchValue);


          if (!matchesSearch) {
            return false;
          }
        }


        /* STATUS */

        if (
          statusFilter !== 'all' &&
          record.status.toLowerCase() !==
            statusFilter.toLowerCase()
        ) {
          return false;
        }


        /* TYPE */

        if (
          typeFilter !== 'all' &&
          record.type.toLowerCase() !==
            typeFilter.toLowerCase()
        ) {
          return false;
        }


        /* DATE */

        if (dateFilter) {

          if (
            dateToKey(record.date) !==
            dateFilter
          ) {
            return false;
          }
        }


        return true;
      });


    result.sort((a, b) => {

      const dateA =
        parseDate(a.date)?.getTime() || 0;

      const dateB =
        parseDate(b.date)?.getTime() || 0;

      return sortOrder === 'asc'
        ? dateA - dateB
        : dateB - dateA;
    });


    return result;

  }, [
    combinedRecords,
    search,
    statusFilter,
    typeFilter,
    dateFilter,
    sortOrder,
  ]);


  /* =======================================================
     SUMMARY
     ======================================================= */

  const totalCollected =
    payments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );


  const thisMonth =
    payments
      .filter((payment) =>
        String(payment.date)
          .includes('Aug-2026')
      )
      .reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0
      );


  const pendingCollection =
    schedules
      .filter(
        (item) =>
          item.status === 'Due' ||
          item.status === 'Upcoming'
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.interestAmount || 0),
        0
      );


  const overdueCollection =
    schedules
      .filter(
        (item) =>
          item.status === 'Overdue'
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(item.interestAmount || 0),
        0
      );


  const averagePayment =
    payments.length
      ? Math.round(
          totalCollected /
          payments.length
        )
      : 0;


  /* =======================================================
     OPEN RECORD PAYMENT
     ======================================================= */

  const openPaymentModal = (
    loan = schedules[0]
  ) => {

    setSelectedLoan(loan);

    setPaymentForm({
      paymentDate: '10-Aug-2026',
      amount: '',
      paymentType: 'Interest',
      paymentMethod: 'PhonePe',
      reference: '',
      notes: '',
    });

    setShowPaymentModal(true);
  };


  /* =======================================================
     RECORD PAYMENT
     ======================================================= */

  const handleRecordPayment = (e) => {

    e.preventDefault();


    const amount =
      Number(paymentForm.amount);


    if (!amount || amount <= 0) {

      alert(
        'Please enter a valid payment amount.'
      );

      return;
    }


    const newPayment = {

      paymentId:
        `PAY-${1001 + payments.length}`,

      loanId:
        selectedLoan.loanId,

      customer:
        selectedLoan.customer,

      date:
        paymentForm.paymentDate,

      amount,

      type:
        paymentForm.paymentType,

      method:
        paymentForm.paymentMethod,

      reference:
        paymentForm.reference || '-',

      status:
        'Success',
    };


    setPayments((prev) => [
      ...prev,
      newPayment,
    ]);


    setShowPaymentModal(false);
  };


  /* =======================================================
     FORM HELPERS
     ======================================================= */

  const updatePaymentForm = (
    field,
    value
  ) => {

    setPaymentForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const outstanding =
    Math.max(
      Number(
        selectedLoan?.interestAmount || 0
      ) -
      Number(
        paymentForm.amount || 0
      ),
      0
    );


  /* =======================================================
     EXPORT
     ======================================================= */

  const handleExport = () => {

    const headers = [
      'Loan ID',
      'Customer',
      'Type',
      'Amount',
      'Date',
      'Status',
    ];


    const rows =
      filteredRecords.map((record) => [
        record.loanId,
        record.customer,
        record.type,
        record.amount,
        record.date,
        record.status,
      ]);


    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(
              /"/g,
              '""'
            )}"`
          )
          .join(',')
      ),
    ].join('\n');


    const blob =
      new Blob(
        [csv],
        {
          type:
            'text/csv;charset=utf-8;',
        }
      );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      'payments-interest-schedule.csv';

    link.click();

    URL.revokeObjectURL(url);
  };


  /* =======================================================
     RENDER
     ======================================================= */

  return (

    <div className="fin-payment-page">


      {/* =================================================
          SINGLE PAGE HEADER
         ================================================= */}

      <div className="fin-payment-header">

        <div>

          <h1>
            Payments &amp; Interest Schedule
          </h1>

          <p>
            Monitor collections, interest dues and
            payment transactions in one place.
          </p>

        </div>


        <div className="fin-payment-header-actions">

          <button
            type="button"
            className="fin-export-btn"
            onClick={handleExport}
          >
            <Download size={16} />
            Export
          </button>


          <button
            type="button"
            className="fin-record-payment-btn"
            onClick={() =>
              openPaymentModal()
            }
          >
            <Plus size={18} />
            Record Payment
          </button>

        </div>

      </div>


      {/* =================================================
          SUMMARY
         ================================================= */}

      <div className="fin-payment-summary-grid">


        <div className="fin-payment-summary-card green">

          <div className="fin-summary-icon">
            <WalletCards size={19} />
          </div>

          <div>

            <span>
              Total Collected
            </span>

            <strong>
              {formatCurrency(
                totalCollected
              )}
            </strong>

          </div>

        </div>


        <div className="fin-payment-summary-card blue">

          <div className="fin-summary-icon">
            <CalendarDays size={19} />
          </div>

          <div>

            <span>
              This Month
            </span>

            <strong>
              {formatCurrency(
                thisMonth
              )}
            </strong>

          </div>

        </div>


        <div className="fin-payment-summary-card amber">

          <div className="fin-summary-icon">
            <Clock3 size={19} />
          </div>

          <div>

            <span>
              Pending Collection
            </span>

            <strong>
              {formatCurrency(
                pendingCollection
              )}
            </strong>

          </div>

        </div>


        <div className="fin-payment-summary-card red">

          <div className="fin-summary-icon">
            <AlertTriangle size={19} />
          </div>

          <div>

            <span>
              Overdue Collection
            </span>

            <strong>
              {formatCurrency(
                overdueCollection
              )}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          FILTERS
         ================================================= */}

      <div className="fin-payment-filter-bar">


        <div className="fin-payment-search">

          <Search size={16} />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search loan ID or customer..."
          />

          {search && (

            <button
              type="button"
              onClick={() =>
                setSearch('')
              }
            >
              <X size={14} />
            </button>

          )}

        </div>


        <input
          type="date"
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(
              e.target.value
            )
          }
          className="fin-payment-date-filter"
        />


        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(
              e.target.value
            )
          }
          className="fin-payment-filter-select"
        >

          <option value="all">
            All Types
          </option>

          <option value="interest">
            Interest
          </option>

          <option value="interest due">
            Interest Due
          </option>

        </select>


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="fin-payment-filter-select"
        >

          <option value="all">
            All Statuses
          </option>

          <option value="success">
            Success
          </option>

          <option value="due">
            Due
          </option>

          <option value="upcoming">
            Upcoming
          </option>

          <option value="overdue">
            Overdue
          </option>

        </select>


        <button
          type="button"
          className="fin-payment-sort-btn"
          onClick={() =>
            setSortOrder(
              sortOrder === 'asc'
                ? 'desc'
                : 'asc'
            )
          }
        >
          <ArrowUpDown size={15} />

          {sortOrder === 'asc'
            ? 'Earliest'
            : 'Latest'}
        </button>

      </div>


      {/* =================================================
          SINGLE UNIFIED TABLE
         ================================================= */}

      <div className="fin-payment-table-card">

        <div className="fin-payment-table-top">

          <div>

            <h2>
              Payment Activity
            </h2>

            <span>
              Payments and upcoming interest
              obligations
            </span>

          </div>

          <div className="fin-record-count">
            {filteredRecords.length} Records
          </div>

        </div>


        <div className="fin-payment-table-wrapper">

          <table className="fin-payment-table">

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

              {filteredRecords.length === 0 ? (

                <tr>

                  <td
                    colSpan="9"
                    className="fin-payment-empty"
                  >

                    <CalendarDays size={26} />

                    <strong>
                      No records found
                    </strong>

                    <span>
                      Try changing the selected
                      filters.
                    </span>

                  </td>

                </tr>

              ) : (

                filteredRecords.map(
                  (record) => (

                    <tr key={record.id}>


                      {/* LOAN */}

                      <td data-label="Loan ID">

                        <span className="fin-loan-link">
                          {record.loanId}
                        </span>

                      </td>


                      {/* CUSTOMER */}

                      <td data-label="Customer">

                        <strong className="fin-customer-name">
                          {record.customer}
                        </strong>

                      </td>


                      {/* TYPE */}

                      <td data-label="Type">

                        <span
                          className={
                            record.recordType ===
                            'payment'
                              ? 'fin-type-payment'
                              : 'fin-type-due'
                          }
                        >
                          {record.type}
                        </span>

                      </td>


                      {/* AMOUNT */}

                      <td data-label="Amount">

                        <strong className="fin-amount">
                          {formatCurrency(
                            record.amount
                          )}
                        </strong>

                      </td>


                      {/* INTEREST */}

                      <td data-label="Interest">

                        {record.interestRate ? (

                          <div className="fin-interest-cell">

                            <span>
                              {record.interestRate}%
                            </span>

                            <strong>
                              {formatCurrency(
                                record.interestAmount
                              )}
                            </strong>

                          </div>

                        ) : (

                          <span className="fin-muted">
                            —
                          </span>

                        )}

                      </td>


                      {/* DATE */}

                      <td data-label="Date">

                        <span className="fin-date">
                          {record.date}
                        </span>

                      </td>


                      {/* METHOD */}

                      <td data-label="Method">

                        {record.method ? (

                          <span className="fin-method">
                            {record.method}
                          </span>

                        ) : (

                          <span className="fin-muted">
                            —
                          </span>

                        )}

                      </td>


                      {/* STATUS */}

                      <td data-label="Status">

                        <StatusBadge
                          status={
                            record.status
                          }
                        />

                      </td>


                      {/* ACTION */}

                      <td
                        data-label="Action"
                        className="fin-payment-action-cell"
                      >

                        {record.recordType ===
                        'schedule' ? (

                          <button
                            type="button"
                            className="fin-small-record-btn"
                            onClick={() => {

                              const loan =
                                schedules.find(
                                  (item) =>
                                    item.loanId ===
                                    record.loanId
                                );

                              openPaymentModal(
                                loan || schedules[0]
                              );
                            }}
                          >
                            <Plus size={13} />
                            Record
                          </button>

                        ) : (

                          <span className="fin-completed-mark">
                            <Check size={14} />
                          </span>

                        )}

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          RECORD PAYMENT MODAL
         ================================================= */}

      {showPaymentModal && (

        <div
          className="fin-payment-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
              e.currentTarget
            ) {
              setShowPaymentModal(false);
            }

          }}
        >

          <div className="fin-payment-modal">


            {/* HEADER */}

            <div className="fin-payment-modal-header">

              <div>

                <h2>
                  Record Payment
                </h2>

                <p>
                  {selectedLoan?.customer}
                  {' · '}
                  {selectedLoan?.loanId}
                </p>

              </div>


              <button
                type="button"
                className="fin-modal-close"
                onClick={() =>
                  setShowPaymentModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            {/* FORM */}

            <form
              className="fin-payment-form"
              onSubmit={
                handleRecordPayment
              }
            >


              {/* DATE + AMOUNT */}

              <div className="fin-form-two">

                <div className="fin-form-field">

                  <label>
                    Payment Date
                  </label>

                  <input
                    type="text"
                    value={
                      paymentForm.paymentDate
                    }
                    onChange={(e) =>
                      updatePaymentForm(
                        'paymentDate',
                        e.target.value
                      )
                    }
                  />

                </div>


                <div className="fin-form-field">

                  <label>
                    Amount Received (₹)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      paymentForm.amount
                    }
                    onChange={(e) =>
                      updatePaymentForm(
                        'amount',
                        e.target.value
                      )
                    }
                    placeholder="Enter amount"
                  />

                </div>

              </div>


              {/* PAYMENT TYPE */}

              <div className="fin-form-field">

                <label>
                  Payment Type
                </label>

                <div className="fin-option-grid three">

                  {[
                    'Interest',
                    'Principal',
                    'Principal + Interest',
                  ].map((type) => (

                    <button
                      key={type}
                      type="button"
                      className={
                        paymentForm.paymentType ===
                        type
                          ? 'selected'
                          : ''
                      }
                      onClick={() =>
                        updatePaymentForm(
                          'paymentType',
                          type
                        )
                      }
                    >
                      {type}
                    </button>

                  ))}

                </div>

              </div>


              {/* METHOD + REFERENCE */}

              <div className="fin-form-two">

                <div className="fin-form-field">

                  <label>
                    Payment Method
                  </label>

                  <select
                    value={
                      paymentForm.paymentMethod
                    }
                    onChange={(e) =>
                      updatePaymentForm(
                        'paymentMethod',
                        e.target.value
                      )
                    }
                  >

                    <option>
                      PhonePe
                    </option>

                    <option>
                      Google Pay
                    </option>

                    <option>
                      UPI
                    </option>

                    <option>
                      Bank Transfer
                    </option>

                    <option>
                      Cash
                    </option>

                    <option>
                      Cheque
                    </option>

                    <option>
                      Other
                    </option>

                  </select>

                </div>


                <div className="fin-form-field">

                  <label>
                    Transaction Reference
                  </label>

                  <input
                    type="text"
                    value={
                      paymentForm.reference
                    }
                    onChange={(e) =>
                      updatePaymentForm(
                        'reference',
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                  />

                </div>

              </div>


              {/* NOTES */}

              <div className="fin-form-field">

                <label>
                  Notes
                </label>

                <textarea
                  value={
                    paymentForm.notes
                  }
                  onChange={(e) =>
                    updatePaymentForm(
                      'notes',
                      e.target.value
                    )
                  }
                  placeholder="Optional notes..."
                  rows="2"
                />

              </div>


              {/* SUMMARY */}

              <div className="fin-payment-summary-box">

                <div>

                  <span>
                    Amount Due
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedLoan?.interestAmount ||
                      0
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Amount Received
                  </span>

                  <strong className="received">
                    {formatCurrency(
                      Number(
                        paymentForm.amount ||
                        0
                      )
                    )}
                  </strong>

                </div>


                <div className="outstanding">

                  <span>
                    Outstanding
                  </span>

                  <strong>
                    {formatCurrency(
                      outstanding
                    )}
                  </strong>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="fin-modal-actions">

                <button
                  type="button"
                  className="fin-modal-cancel"
                  onClick={() =>
                    setShowPaymentModal(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="fin-modal-submit"
                >

                  <Check size={15} />

                  Record Payment

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}