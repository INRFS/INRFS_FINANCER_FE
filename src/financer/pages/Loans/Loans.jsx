import React, { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Eye,
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
import { platformApi, pageItems } from '../../../common/services/platformApi';
import { loanFromApi } from '../../../common/utils/domainAdapters';
import { formatInterestAmount, interestForDays, monthlyPeriodDays, rateForDays } from './loanInterest';

import './Loans.css';
import { useLocation } from 'react-router-dom';


/* =========================================================
   CUSTOMERS
   ========================================================= */

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

const addLoanDuration = (startDate, value, unit) => {
  if (!startDate || Number(value) <= 0) return '';
  const [year, month, day] = startDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (unit === 'Days') date.setDate(date.getDate() + Number(value));
  else if (unit === 'Weeks') date.setDate(date.getDate() + Number(value) * 7);
  else {
    const targetDay = date.getDate();
    date.setDate(1); date.setMonth(date.getMonth() + Number(value));
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(targetDay, lastDay));
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const dateDays = (from, to) => from && to ? Math.round((new Date(`${to}T00:00:00`) - new Date(`${from}T00:00:00`)) / 86400000) : 0;
const firstInterestDue = (form, maturity) => {
  const candidate = form.interestFrequency === 'Daily' ? addLoanDuration(form.dateGiven, 1, 'Days')
    : form.interestFrequency === 'Weekly' ? addLoanDuration(form.dateGiven, 1, 'Weeks')
      : form.interestFrequency === 'Monthly' ? addLoanDuration(form.dateGiven, 1, 'Months') : maturity;
  return candidate && maturity && candidate < maturity ? candidate : maturity;
};
const collectionInterestLabel = (frequency) => ({ Daily: 'Estimated Interest per Day', Weekly: 'Estimated Interest per Week', Monthly: 'Estimated First Monthly Interest', AtMaturity: 'Estimated Interest at Maturity' }[frequency] || 'Estimated Collection Interest');
const monthlyInterestForDays = (principal, monthlyRate, days) => Number(principal || 0) * Number(monthlyRate || 0) / 100 * 12 * days / 365;
const legacyNewLoanForm = false;

function DurationLoanModal({ customers, form, setForm, error, onClose, onSubmit }) {
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const maturity = addLoanDuration(form.dateGiven, form.durationValue, form.durationUnit);
  const dueDate = firstInterestDue(form, maturity);
  const periodInterest = monthlyInterestForDays(form.amount, form.interestRate, dateDays(form.dateGiven, dueDate));
  const totalInterest = monthlyInterestForDays(form.amount, form.interestRate, dateDays(form.dateGiven, maturity));

  return (
    <div className="fin-create-loan-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="fin-create-loan-modal">
        <div className="fin-create-loan-header"><div><h2>Create New Loan</h2><p>Add a new loan account</p></div><button type="button" className="fin-create-loan-close" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <form onSubmit={onSubmit} className="fin-create-loan-form">
          <div className="fin-create-loan-field"><label>Select Customer<span>*</span></label><select value={form.customer} onChange={(event) => update('customer', event.target.value)} required><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.fullName} ({customer.customerNumber})</option>)}</select></div>
          <div className="fin-create-loan-two-column">
            <div className="fin-create-loan-field"><label>Principal Amount (₹)<span>*</span></label><input type="number" min="1" value={form.amount} onChange={(event) => update('amount', event.target.value)} placeholder="10000" required /></div>
            <div className="fin-create-loan-field"><label>Monthly Interest Rate (%)<span>*</span></label><input type="number" min="0" step="0.01" value={form.interestRate} onChange={(event) => update('interestRate', event.target.value)} required /></div>
            <div className="fin-create-loan-field"><label>Loan Period Unit<span>*</span></label><select value={form.durationUnit} onChange={(event) => update('durationUnit', event.target.value)}><option>Days</option><option>Weeks</option><option>Months</option></select></div>
            <div className="fin-create-loan-field"><label>Number of {form.durationUnit}<span>*</span></label><input type="number" min="1" value={form.durationValue} onChange={(event) => update('durationValue', event.target.value)} required /></div>
            <div className="fin-create-loan-field"><label>Interest Collection<span>*</span></label><select value={form.interestFrequency} onChange={(event) => update('interestFrequency', event.target.value)}><option>Daily</option><option>Weekly</option><option>Monthly</option><option value="AtMaturity">At Maturity</option></select></div>
            <div className="fin-create-loan-field"><label>Start Date<span>*</span></label><input type="date" value={form.dateGiven} onChange={(event) => update('dateGiven', event.target.value)} required /></div>
            <div className="fin-create-loan-field"><label>Maturity Date</label><input type="date" value={maturity} readOnly /></div>
            <div className="fin-create-loan-field"><label>First Interest Due</label><input type="date" value={dueDate} readOnly /></div>
            <div className="fin-create-loan-field"><label>{collectionInterestLabel(form.interestFrequency)}</label><input value={formatCurrency(periodInterest)} readOnly /></div>
            <div className="fin-create-loan-field"><label>Estimated Total Interest</label><input value={formatCurrency(totalInterest)} readOnly /></div>
          </div>
          {error && <div role="alert">{error}</div>}
          <div className="fin-create-loan-actions"><button type="button" className="fin-create-loan-cancel" onClick={onClose}>Cancel</button><button type="submit" className="fin-create-loan-submit"><Plus size={17} />Create Loan</button></div>
        </form>
      </div>
    </div>
  );
}


/* =========================================================
   LOANS PAGE
   ========================================================= */

export default function Loans() {
  const location = useLocation();
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const [loanPayload, customerPayload, productPayload] = await Promise.all([
        platformApi.loans.all(),
        platformApi.customers.all(),
        platformApi.loans.products(),
      ]);
      const customerItems = pageItems(customerPayload);
      const byId = new Map(customerItems.map((item) => [item.id, item]));
      setCustomers(customerItems);
      setProducts(pageItems(productPayload));
      setLoans(pageItems(loanPayload).map((item) => loanFromApi(item, byId.get(item.customerId))));
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const [search, setSearch] = useState(location.state?.search || '');
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
    durationUnit: 'Days',
    durationValue: '13',
    dateGiven: getTodayDate(),
    interestFrequency: 'Daily',
    interestRate: '18',
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

  const monthlyDays = monthlyPeriodDays(newLoanForm.dateGiven);


  const dailyRate =
    rateForDays(enteredRate, 1);

  const weeklyRate =
    rateForDays(enteredRate, 7);

  const monthlyRate =
    rateForDays(enteredRate, monthlyDays);


  const dailyAmount =
    interestForDays(amount, enteredRate, 1);

  const weeklyAmount =
    interestForDays(amount, enteredRate, 7);

  const monthlyAmount =
    interestForDays(amount, enteredRate, monthlyDays);


  const _getFrequencyRate = (frequency) => {

    switch (frequency) {

      case 'Daily':
        return dailyRate;

      case 'Weekly':
        return weeklyRate;

      case 'Monthly':
        return monthlyRate;

      default:
        return monthlyRate;
    }
  };


  /* =======================================================
     DATE FORMAT
     ======================================================= */

  const _formatDateForLoan = (date) => {

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

  const _getNextDueDate = (
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
      durationUnit: 'Days',
      durationValue: '13',
      dateGiven: getTodayDate(),
      interestFrequency: 'Daily',
      interestRate: '18',
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

  const handleCreateSubmit = async (e) => {

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

    if (Number(newLoanForm.durationValue) <= 0) return setPageError('Enter a valid number of periods.');


    const product = products.find((item) => item.isActive !== false) || products[0];
    if (!product) return setPageError('No active loan product is configured. Ask an administrator to create one first.');
    setPageError('');
    try {
      await platformApi.loans.create({
        customerId: newLoanForm.customer,
        loanProductId: product.id,
        principal,
        annualInterestRate: Number(newLoanForm.interestRate),
        interestRate: Number(newLoanForm.interestRate),
        interestRateBasis: 'PerMonth',
        interestCollectionFrequency: newLoanForm.interestFrequency,
        tenureMonths: Math.max(product.minimumTenureMonths || 1, 1),
        durationValue: Number(newLoanForm.durationValue),
        durationUnit: newLoanForm.durationUnit,
        startDate: newLoanForm.dateGiven,
      });
      closeCreateModal();
      await loadData();
    } catch (error) {
      setPageError(error.message);
    }
  };

  /* =======================================================
     PAGE
     ======================================================= */

  return (

    <div className="fin-loans-page animate-fade-in">
      {pageError && <div role="alert">{pageError} <button type="button" onClick={loadData}>Retry</button></div>}
      {loading && <p aria-live="polite">Loading loans...</p>}
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
        <DurationLoanModal customers={customers} form={newLoanForm} setForm={setNewLoanForm} error={pageError} onClose={closeCreateModal} onSubmit={handleCreateSubmit} />
      )}

      {legacyNewLoanForm && isCreateModalOpen && (

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
                        key={customer.id}
                        value={customer.id}
                      >
                        {customer.fullName} ({customer.customerNumber})
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* =================================================
                  AMOUNT + DATE
                 ================================================= */}

              <div className="fin-create-loan-two-column">
                <div className="fin-create-loan-field"><label>Loan Product<span>*</span></label><select value={newLoanForm.productId} onChange={(e) => setNewLoanForm({ ...newLoanForm, productId: e.target.value })} required><option value="">Select product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name} · {product.annualInterestRate}%</option>)}</select></div>
                <div className="fin-create-loan-field"><label>Tenure (months)<span>*</span></label><input type="number" min="1" value={newLoanForm.tenureMonths} onChange={(e) => setNewLoanForm({ ...newLoanForm, tenureMonths: e.target.value })} required /></div>
                <div className="fin-create-loan-field"><label>Purpose<span>*</span></label><input value={newLoanForm.purpose} onChange={(e) => setNewLoanForm({ ...newLoanForm, purpose: e.target.value })} required /></div>
                <div className="fin-create-loan-field"><label>Monthly Income<span>*</span></label><input type="number" min="0" value={newLoanForm.monthlyIncome} onChange={(e) => setNewLoanForm({ ...newLoanForm, monthlyIncome: e.target.value })} required /></div>
                <div className="fin-create-loan-field"><label>Monthly Obligations</label><input type="number" min="0" value={newLoanForm.monthlyObligations} onChange={(e) => setNewLoanForm({ ...newLoanForm, monthlyObligations: e.target.value })} /></div>


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
                    {formatInterestAmount(
                      dailyAmount
                    )}
                    <small>
                      /Day
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
                    {formatInterestAmount(
                      weeklyAmount
                    )}
                    <small>
                      /Week
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
                    {formatInterestAmount(
                      monthlyAmount
                    )}
                    <small>
                      /Month
                    </small>
                  </strong>

                </div>

              </div>


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
