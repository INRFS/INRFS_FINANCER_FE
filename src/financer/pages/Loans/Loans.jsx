import React, { useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
  Edit3,
  X,
  Clock3,
  CalendarDays,
  List,
  Check,
} from 'lucide-react';

import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import { formatCurrency } from '../../../common/utils/formatters';
import { mockLoans } from '../../data/mockFinancerData';

import './Loans.css';


/* =========================================================
   CUSTOMERS
   ========================================================= */

const customers = [
  'Ramesh Kumar',
  'Suresh Kumar',
  'Rajesh Kumar',
  'Priya Sharma',
  'Anil Kumar',
  'Lakshmi Devi',
];


/* =========================================================
   PAYMENT METHODS
   ========================================================= */

const paymentMethods = [
  'PhonePe',
  'Google Pay',
  'UPI',
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Other',
];


/* =========================================================
   LOANS PAGE
   ========================================================= */

export default function Loans() {

  const [loans, setLoans] = useState(mockLoans);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const [selectedLoan, setSelectedLoan] = useState(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


  /* =======================================================
     TODAY DATE
     ======================================================= */

  const getTodayDate = () => {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      today.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };


  /* =======================================================
     NEW LOAN FORM
     ======================================================= */

  const [newLoanForm, setNewLoanForm] = useState({
    customer: '',
    amount: '10000',
    dateGiven: getTodayDate(),
    paymentMethod: 'PhonePe',
    interestFrequency: 'Monthly',
    interestRate: '10',
  });


  /* =======================================================
     FILTER LOANS
     ======================================================= */

  const filteredLoans = useMemo(() => {

    return loans.filter((loan) => {

      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        loan.id
          .toLowerCase()
          .includes(searchValue) ||

        loan.customer
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === 'All' ||
        loan.status === statusFilter;

      const matchesType =
        typeFilter === 'All' ||
        loan.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });

  }, [
    loans,
    search,
    statusFilter,
    typeFilter,
  ]);


  /* =======================================================
     INTEREST CALCULATIONS
     ======================================================= */

  const amount =
    Number(newLoanForm.amount) || 0;

  const enteredRate =
    Number(newLoanForm.interestRate) || 0;

  /*
    The entered rate belongs to the selected frequency.

    We convert everything through an annual simple-interest basis:

      Daily   = 365 periods / year
      Weekly  = 52 periods / year
      Monthly = 12 periods / year

    Example:
      ₹10,000 at 10% Monthly

      Monthly = 10.00%
      Weekly  = 10% × 12 / 52 = 2.31%
      Daily   = 10% × 12 / 365 = 0.33%

    This keeps the interest amount equivalent regardless of
    which frequency the user selects.
  */

  const periodsPerYear = {
    Daily: 365,
    Weekly: 52,
    Monthly: 12,
  };

  const selectedPeriodsPerYear =
    periodsPerYear[
      newLoanForm.interestFrequency
    ] || 12;

  const annualRate =
    enteredRate * selectedPeriodsPerYear;

  const dailyRate =
    annualRate / periodsPerYear.Daily;

  const weeklyRate =
    annualRate / periodsPerYear.Weekly;

  const monthlyRate =
    annualRate / periodsPerYear.Monthly;

  const dailyAmount =
    amount * (dailyRate / 100);

  const weeklyAmount =
    amount * (weeklyRate / 100);

  const monthlyAmount =
    amount * (monthlyRate / 100);

  const getFrequencyRate = (frequency) => {
    const periods =
      periodsPerYear[frequency] || 12;

    return annualRate / periods;
  };

  const formatRate = (rate) => {
    if (!Number.isFinite(rate)) {
      return '0';
    }

    return rate % 1 === 0
      ? String(rate)
      : rate.toFixed(2);
  };


  /* =======================================================
     DATE FORMAT
     ======================================================= */

  const formatDateForLoan = (date) => {

    if (!date) {
      return '';
    }

    const parsedDate =
      new Date(`${date}T00:00:00`);

    return parsedDate.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };


  /* =======================================================
     NEXT DUE DATE
     ======================================================= */

  const getNextDueDate = (
    date,
    frequency
  ) => {

    const nextDate =
      new Date(`${date}T00:00:00`);


    if (frequency === 'Daily') {

      nextDate.setDate(
        nextDate.getDate() + 1
      );

    } else if (frequency === 'Weekly') {

      nextDate.setDate(
        nextDate.getDate() + 7
      );

    } else {

      nextDate.setMonth(
        nextDate.getMonth() + 1
      );
    }


    return nextDate.toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };


  /* =======================================================
     RESET FORM
     ======================================================= */

  const resetLoanForm = () => {

    setNewLoanForm({
      customer: '',
      amount: '10000',
      dateGiven: getTodayDate(),
      paymentMethod: 'PhonePe',
      interestFrequency: 'Monthly',
      interestRate: '10',
    });
  };


  /* =======================================================
     OPEN CREATE MODAL
     ======================================================= */

  const openCreateModal = () => {

    resetLoanForm();

    setIsCreateModalOpen(true);
  };


  /* =======================================================
     CLOSE CREATE MODAL
     ======================================================= */

  const closeCreateModal = () => {

    setIsCreateModalOpen(false);

    resetLoanForm();
  };


  /* =======================================================
     CREATE LOAN
     ======================================================= */

  const handleCreateSubmit = (e) => {

    e.preventDefault();

    const principal =
      Number(newLoanForm.amount);


    if (!newLoanForm.customer) {

      alert(
        'Please select a customer.'
      );

      return;
    }


    if (!principal || principal <= 0) {

      alert(
        'Please enter a valid loan amount.'
      );

      return;
    }


    if (!newLoanForm.dateGiven) {

      alert(
        'Please select the date given.'
      );

      return;
    }


    const selectedRate =
      getFrequencyRate(
        newLoanForm.interestFrequency
      );


    let loanType =
      'Monthly Interest';


    if (
      newLoanForm.interestFrequency ===
      'Daily'
    ) {

      loanType =
        'Daily Collection';
    }


    if (
      newLoanForm.interestFrequency ===
      'Weekly'
    ) {

      loanType =
        'Weekly Collection';
    }


    const created = {

      id: `LN${String(
        Math.floor(
          100000 +
          Math.random() * 899999
        )
      )}`,

      customer:
        newLoanForm.customer,

      principal,

      interestRate: `${
        selectedRate % 1 === 0
          ? selectedRate
          : selectedRate.toFixed(2)
      }% ${newLoanForm.interestFrequency}`,

      outstanding: principal,

      nextDue:
        getNextDueDate(
          newLoanForm.dateGiven,
          newLoanForm.interestFrequency
        ),

      type: loanType,

      status: 'Active',

      paymentMethod:
        newLoanForm.paymentMethod,

      interestFrequency:
        newLoanForm.interestFrequency,

      dateGiven:
        formatDateForLoan(
          newLoanForm.dateGiven
        ),
    };


    setLoans((previousLoans) => [
      created,
      ...previousLoans,
    ]);


    closeCreateModal();
  };


  /* =======================================================
     PAGE
     ======================================================= */

  return (

    <div className="fin-loans-page animate-fade-in">


      {/* =================================================
          HEADER
         ================================================= */}

      <div className="fin-loans-header">

        <div>

          <h1 className="fin-loans-title">
            Loans
          </h1>

          <p className="fin-loans-subtitle">
            Manage and track all loan accounts.
          </p>

        </div>


        <Button
          variant="cyan"
          icon={Plus}
          onClick={openCreateModal}
        >
          New Loan Account
        </Button>

      </div>


      {/* =================================================
          STAT CARDS
         ================================================= */}

      <div className="fin-loans-stats-grid">


        <div className="fin-loans-stat-card">

          <div className="fin-loans-stat-icon fin-loan-navy">
            <Banknote size={18} />
          </div>

          <div>

            <span className="fin-loans-stat-label">
              Total Loans
            </span>

            <h3 className="fin-loans-stat-val">
              {loans.length}
            </h3>

          </div>

        </div>


        <div className="fin-loans-stat-card">

          <div className="fin-loans-stat-icon fin-loan-green">
            <CheckCircle2 size={18} />
          </div>

          <div>

            <span className="fin-loans-stat-label">
              Active Loans
            </span>

            <h3 className="fin-loans-stat-val">

              {
                loans.filter(
                  (loan) =>
                    loan.status === 'Active'
                ).length
              }

            </h3>

          </div>

        </div>


        <div className="fin-loans-stat-card">

          <div className="fin-loans-stat-icon fin-loan-blue">
            <Clock size={18} />
          </div>

          <div>

            <span className="fin-loans-stat-label">
              Closed Loans
            </span>

            <h3 className="fin-loans-stat-val">

              {
                loans.filter(
                  (loan) =>
                    loan.status === 'Closed'
                ).length
              }

            </h3>

          </div>

        </div>


        <div className="fin-loans-stat-card">

          <div className="fin-loans-stat-icon fin-loan-red">
            <AlertTriangle size={18} />
          </div>

          <div>

            <span className="fin-loans-stat-label">
              Overdue Loans
            </span>

            <h3 className="fin-loans-stat-val fin-val-red">

              {
                loans.filter(
                  (loan) =>
                    loan.status === 'Overdue'
                ).length
              }

            </h3>

          </div>

        </div>

      </div>


      {/* =================================================
          FILTERS
         ================================================= */}

      <div className="fin-loans-toolbar">

        <div className="fin-loans-search">

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search loan ID or customer..."
          />

        </div>


        <div className="fin-loans-filter-group">

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="fin-loans-select"
          >

            <option value="All">
              All Statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Due">
              Due
            </option>

            <option value="Overdue">
              Overdue
            </option>

            <option value="Closed">
              Closed
            </option>

          </select>


          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(
                e.target.value
              )
            }
            className="fin-loans-select"
          >

            <option value="All">
              All Collection Types
            </option>

            <option value="Daily Collection">
              Daily Collection
            </option>

            <option value="Weekly Collection">
              Weekly Collection
            </option>

            <option value="Monthly Interest">
              Monthly Interest
            </option>

          </select>

        </div>

      </div>


      {/* =================================================
          TABLE
         ================================================= */}

      <div className="fin-loans-table-card">

        <div className="fin-loans-table-wrapper">

          <table className="fin-loans-table">

            <thead>

              <tr>

                <th>LOAN ID</th>

                <th>CUSTOMER</th>

                <th>TYPE</th>

                <th>PRINCIPAL</th>

                <th>INTEREST RATE</th>

                <th>OUTSTANDING</th>

                <th>NEXT DUE</th>

                <th>STATUS</th>

                <th className="loan-action-column">
                  ACTION
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredLoans.map((loan) => (

                <tr key={loan.id}>

                  <td>

                    <strong className="fin-loans-id-cell">
                      {loan.id}
                    </strong>

                  </td>


                  <td>

                    <span className="fin-loans-customer-cell">
                      {loan.customer}
                    </span>

                  </td>


                  <td>

                    <span className="fin-loans-type-badge">
                      {loan.type}
                    </span>

                  </td>


                  <td>
                    {formatCurrency(
                      loan.principal
                    )}
                  </td>


                  <td>
                    {loan.interestRate}
                  </td>


                  <td>

                    <strong className="fin-loans-amt">
                      {formatCurrency(
                        loan.outstanding
                      )}
                    </strong>

                  </td>


                  <td>
                    {loan.nextDue}
                  </td>


                  <td>

                    <StatusBadge
                      status={loan.status}
                    />

                  </td>


                  <td className="loan-action-column">

                    <div className="fin-loans-actions">

                      <button
                        type="button"
                        className="fin-loans-action-btn"
                        title="View Details"
                        onClick={() =>
                          setSelectedLoan(loan)
                        }
                      >
                        <Eye size={15} />
                      </button>


                      {/* <button
                        type="button"
                        className="fin-loans-action-btn"
                        title="Edit Loan"
                      >
                        <Edit3 size={15} />
                      </button> */}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          LOAN DETAILS MODAL
         ================================================= */}

      {selectedLoan && (

        <Modal
          isOpen={true}
          onClose={() =>
            setSelectedLoan(null)
          }
          title={`Loan Details — ${selectedLoan.id}`}
        >

          <div className="fin-loans-details-view">

            <div className="fin-loans-detail-row">
              <span>Customer:</span>

              <strong>
                {selectedLoan.customer}
              </strong>
            </div>


            <div className="fin-loans-detail-row">
              <span>Principal Amount:</span>

              <strong>
                {formatCurrency(
                  selectedLoan.principal
                )}
              </strong>
            </div>


            <div className="fin-loans-detail-row">
              <span>Outstanding Balance:</span>

              <strong>
                {formatCurrency(
                  selectedLoan.outstanding
                )}
              </strong>
            </div>


            <div className="fin-loans-detail-row">
              <span>Interest Scheme:</span>

              <strong>
                {selectedLoan.interestRate}
              </strong>
            </div>


            <div className="fin-loans-detail-row">
              <span>Collection Type:</span>

              <strong>
                {selectedLoan.type}
              </strong>
            </div>


            {selectedLoan.paymentMethod && (

              <div className="fin-loans-detail-row">

                <span>
                  Payment Method:
                </span>

                <strong>
                  {selectedLoan.paymentMethod}
                </strong>

              </div>

            )}


            {selectedLoan.dateGiven && (

              <div className="fin-loans-detail-row">

                <span>
                  Date Given:
                </span>

                <strong>
                  {selectedLoan.dateGiven}
                </strong>

              </div>

            )}


            <div className="fin-loans-detail-row">

              <span>
                Status:
              </span>

              <StatusBadge
                status={selectedLoan.status}
              />

            </div>


            <div className="fin-loans-modal-footer">

              <Button
                variant="secondary"
                onClick={() =>
                  setSelectedLoan(null)
                }
              >
                Close
              </Button>

            </div>

          </div>

        </Modal>

      )}


      {/* =================================================
          CREATE NEW LOAN
          CUSTOM CLEAN POPUP
         ================================================= */}

      {isCreateModalOpen && (

        <div
          className="fin-create-loan-overlay"
          onMouseDown={(e) => {

            if (
              e.target === e.currentTarget
            ) {
              closeCreateModal();
            }

          }}
        >

          <div className="fin-create-loan-modal">


            {/* =================================================
                MODAL HEADER
               ================================================= */}

            <div className="fin-create-loan-header">

              <div>

                <h2>
                  Create New Loan
                </h2>

                <p>
                  Add a new loan account
                </p>

              </div>


              <button
                type="button"
                className="fin-create-loan-close"
                onClick={closeCreateModal}
                aria-label="Close"
              >

                <X size={20} />

              </button>

            </div>


            {/* =================================================
                FORM
               ================================================= */}

            <form
              onSubmit={handleCreateSubmit}
              className="fin-create-loan-form"
            >


              {/* =================================================
                  CUSTOMER
                 ================================================= */}

              <div className="fin-create-loan-field">

                <label>
                  Select Customer
                  <span>*</span>
                </label>

                <select
                  value={newLoanForm.customer}
                  onChange={(e) =>
                    setNewLoanForm({
                      ...newLoanForm,
                      customer:
                        e.target.value,
                    })
                  }
                  required
                >

                  <option value="">
                    Select customer
                  </option>

                  {customers.map(
                    (customer) => (

                      <option
                        key={customer}
                        value={customer}
                      >
                        {customer}
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* =================================================
                  AMOUNT + DATE
                 ================================================= */}

              <div className="fin-create-loan-two-column">


                <div className="fin-create-loan-field">

                  <label>
                    Amount Given (₹)
                    <span>*</span>
                  </label>

                  <div className="fin-input-with-icon">

                    <span>
                      ₹
                    </span>

                    <input
                      type="number"
                      min="1"
                      placeholder="10,000"
                      value={
                        newLoanForm.amount
                      }
                      onChange={(e) =>
                        setNewLoanForm({
                          ...newLoanForm,
                          amount:
                            e.target.value,
                        })
                      }
                      required
                    />

                  </div>

                </div>


                <div className="fin-create-loan-field">

                  <label>
                    Date Given
                    <span>*</span>
                  </label>

                  <input
                    type="date"
                    value={
                      newLoanForm.dateGiven
                    }
                    onChange={(e) =>
                      setNewLoanForm({
                        ...newLoanForm,
                        dateGiven:
                          e.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>


              {/* =================================================
                  PAYMENT METHOD
                 ================================================= */}

              <div className="fin-create-loan-field">

                <label>
                  Payment Method
                  <span>*</span>
                </label>


                <div className="fin-payment-method-grid">

                  {paymentMethods.map(
                    (method) => (

                      <button
                        key={method}
                        type="button"
                        className={`
                          fin-payment-method-btn
                          ${
                            newLoanForm.paymentMethod ===
                            method
                              ? 'active'
                              : ''
                          }
                        `}
                        onClick={() =>
                          setNewLoanForm({
                            ...newLoanForm,
                            paymentMethod:
                              method,
                          })
                        }
                      >

                        {method}

                      </button>

                    )
                  )}

                </div>

              </div>


              {/* =================================================
                  INTEREST FREQUENCY
                 ================================================= */}

              <div className="fin-create-loan-field">

                <label>
                  Interest Frequency
                  <span>*</span>
                </label>


                <div className="fin-interest-frequency-grid">


                  {/* DAILY */}

                  <button
                    type="button"
                    className={`
                      fin-interest-frequency-card
                      ${
                        newLoanForm.interestFrequency ===
                        'Daily'
                          ? 'active'
                          : ''
                      }
                    `}
                    onClick={() =>
                      setNewLoanForm({
                        ...newLoanForm,
                        interestFrequency:
                          'Daily',
                      })
                    }
                  >

                    <Clock3 size={18} />

                    <span>
                      Daily
                    </span>

                  </button>


                  {/* WEEKLY */}

                  <button
                    type="button"
                    className={`
                      fin-interest-frequency-card
                      ${
                        newLoanForm.interestFrequency ===
                        'Weekly'
                          ? 'active'
                          : ''
                      }
                    `}
                    onClick={() =>
                      setNewLoanForm({
                        ...newLoanForm,
                        interestFrequency:
                          'Weekly',
                      })
                    }
                  >

                    <CalendarDays size={18} />

                    <span>
                      Weekly
                    </span>

                  </button>


                  {/* MONTHLY */}

                  <button
                    type="button"
                    className={`
                      fin-interest-frequency-card
                      ${
                        newLoanForm.interestFrequency ===
                        'Monthly'
                          ? 'active'
                          : ''
                      }
                    `}
                    onClick={() =>
                      setNewLoanForm({
                        ...newLoanForm,
                        interestFrequency:
                          'Monthly',
                      })
                    }
                  >

                    <List size={18} />

                    <span>
                      Monthly
                    </span>

                  </button>

                </div>

              </div>


              {/* =================================================
                  INTEREST RATE
                 ================================================= */}

              <div className="fin-create-loan-field">

                <label>
                  Interest Rate (%)
                </label>

                <div className="fin-interest-rate-input">

                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={
                      newLoanForm.interestRate
                    }
                    onChange={(e) =>
                      setNewLoanForm({
                        ...newLoanForm,
                        interestRate:
                          e.target.value,
                      })
                    }
                  />

                  <span>
                    %
                  </span>

                </div>

              </div>


              {/* =================================================
                  CALCULATION PREVIEW
                 ================================================= */}

              <div className="fin-interest-preview-grid">


                <div
                  className={`
                    fin-interest-preview-card
                    ${
                      newLoanForm.interestFrequency ===
                      'Daily'
                        ? 'selected'
                        : ''
                    }
                  `}
                >

                  <span>
                    Daily @ {
                      dailyRate % 1 === 0
                        ? dailyRate
                        : dailyRate.toFixed(2)
                    }%
                  </span>

                  <strong>
                    {formatCurrency(
                      dailyAmount
                    )}
                    <small>
                      interest / Day
                    </small>
                  </strong>

                </div>


                <div
                  className={`
                    fin-interest-preview-card
                    ${
                      newLoanForm.interestFrequency ===
                      'Weekly'
                        ? 'selected'
                        : ''
                    }
                  `}
                >

                  <span>
                    Weekly @ {
                      weeklyRate % 1 === 0
                        ? weeklyRate
                        : weeklyRate.toFixed(2)
                    }%
                  </span>

                  <strong>
                    {formatCurrency(
                      weeklyAmount
                    )}
                    <small>
                      interest / Week
                    </small>
                  </strong>

                </div>


                <div
                  className={`
                    fin-interest-preview-card
                    ${
                      newLoanForm.interestFrequency ===
                      'Monthly'
                        ? 'selected'
                        : ''
                    }
                  `}
                >

                  <span>
                    Monthly @ {
                      monthlyRate % 1 === 0
                        ? monthlyRate
                        : monthlyRate.toFixed(2)
                    }%
                  </span>

                  <strong>
                    {formatCurrency(
                      monthlyAmount
                    )}
                    <small>
                      interest / Month
                    </small>
                  </strong>

                </div>

              </div>

              {/* <p className="fin-interest-conversion-note">
                Enter the rate for the selected frequency.
                The Daily, Weekly and Monthly rates above are
                automatically converted to equivalent rates.
              </p> */}


              {/* =================================================
                  ACTIONS
                 ================================================= */}

              <div className="fin-create-loan-actions">

                <button
                  type="button"
                  className="fin-create-loan-cancel"
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="fin-create-loan-submit"
                >

                  <Check size={17} />

                  Create Loan

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}