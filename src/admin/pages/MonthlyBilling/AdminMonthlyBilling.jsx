import React, { useMemo, useState } from 'react';
import {
  CalendarDays,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  ReceiptIndianRupee,
  WalletCards,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Search,
  Eye,
  CircleDollarSign,
  X,
  FileText,
  Save,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

import './AdminMonthlyBilling.css';
import { monthlyBillingData } from '../../data/mockAdminData';

/* =========================================================
   HELPERS
========================================================= */

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const formatMonth = (value) => {
  if (!value) return '—';

  const [year, month] = value.split('-');

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
};

const formatShortMonth = (value) => {
  if (!value) return '—';

  const [year, month] = value.split('-');

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

const normalizeBillingMonth = (value) => {
  if (!value) return '';

  if (/^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  const parsedDate = new Date(`${value} 1`);

  if (!Number.isNaN(parsedDate.getTime())) {
    return `${parsedDate.getFullYear()}-${String(
      parsedDate.getMonth() + 1
    ).padStart(2, '0')}`;
  }

  return value;
};

const formatDate = (value) => {
  if (!value) return 'Not scheduled';

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/* =========================================================
   AUTOMATIC STATUS CALCULATION

   Business rule:

   0 paid + due date passed
      -> Overdue

   0 paid
      -> Pending

   Partial payment
      -> Partially Paid

   Full payment
      -> Paid
========================================================= */

const calculateSettlementStatus = ({
  paidAmount,
  totalAmount,
  dueDate,
}) => {
  const paid = Number(paidAmount || 0);
  const total = Number(totalAmount || 0);

  if (total <= 0) {
    return 'Pending';
  }

  if (paid >= total) {
    return 'Paid';
  }

  if (dueDate && dueDate < getToday()) {
    return 'Overdue';
  }

  if (paid > 0) {
    return 'Partially Paid';
  }

  return 'Pending';
};

/* =========================================================
   DATA NORMALIZATION
========================================================= */

const initialBillingData = Array.isArray(monthlyBillingData)
  ? monthlyBillingData.map((item, index) => {
      const serviceChargeAmount = Number(
        item.serviceChargeAmount ??
          item.serviceCharge ??
          0
      );

      const collectedAmount = Number(
        item.collectedAmount ??
          item.amountCollected ??
          0
      );

      const outstandingAmount = Math.max(
        serviceChargeAmount - collectedAmount,
        0
      );

      const dueDate = item.dueDate || null;

      return {
        ...item,

        billingMonth: normalizeBillingMonth(
          item.billingMonth
        ),

        serviceChargeAmount,

        collectedAmount,

        outstandingAmount,

        applicableInterest: Number(
          item.applicableInterest ?? 0
        ),

        serviceChargePercentage: Number(
          item.serviceChargePercentage ?? 0
        ),

        invoiceNumber:
          item.invoiceNumber ||
          `INV-${item.financerId || 'FIN'}-${String(
            index + 1
          ).padStart(4, '0')}`,

        dueDate,

        settlementStatus: calculateSettlementStatus({
          paidAmount: collectedAmount,
          totalAmount: serviceChargeAmount,
          dueDate,
        }),
      };
    })
  : [];

/* =========================================================
   STATUS CONFIG
========================================================= */

const getSettlementConfig = (status) => {
  switch (status) {
    case 'Paid':
      return {
        className: 'is-paid',
        icon: CheckCircle2,
      };

    case 'Partially Paid':
      return {
        className: 'is-partial',
        icon: Clock3,
      };

    case 'Overdue':
      return {
        className: 'is-overdue',
        icon: AlertCircle,
      };

    case 'Pending':
    default:
      return {
        className: 'is-pending',
        icon: Clock3,
      };
  }
};

/* =========================================================
   SUMMARY CARD
========================================================= */

function BillingSummaryCard({
  icon: Icon,
  title,
  value,
  description,
  variant,
}) {
  return (
    <article
      className={`inrfs-monthly-billing-summary-card ${variant}`}
    >
      <div className="inrfs-monthly-billing-summary-icon">
        <Icon size={19} />
      </div>

      <div className="inrfs-monthly-billing-summary-content">
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{description}</small>
      </div>
    </article>
  );
}

/* =========================================================
   PAYMENT MANAGEMENT MODAL
========================================================= */

function PaymentManagementModal({
  billing,
  onClose,
  onSave,
}) {
  const [amountPaid, setAmountPaid] = useState(
    String(billing?.collectedAmount ?? 0)
  );

  const [dueDate, setDueDate] = useState(
    billing?.dueDate || ''
  );

  if (!billing) {
    return null;
  }

  const totalAmount = Number(
    billing.serviceChargeAmount || 0
  );

  const enteredAmount = Math.min(
    Math.max(Number(amountPaid || 0), 0),
    totalAmount
  );

  const outstandingAmount = Math.max(
    totalAmount - enteredAmount,
    0
  );

  const previewStatus = calculateSettlementStatus({
    paidAmount: enteredAmount,
    totalAmount,
    dueDate,
  });

  const statusConfig =
    getSettlementConfig(previewStatus);

  const StatusIcon = statusConfig.icon;

  const handleAmountChange = (event) => {
    const value = event.target.value;

    if (value === '') {
      setAmountPaid('');
      return;
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return;
    }

    setAmountPaid(
      String(
        Math.min(
          Math.max(numericValue, 0),
          totalAmount
        )
      )
    );
  };

  const handleFullPayment = () => {
    setAmountPaid(String(totalAmount));
  };

  const handleReset = () => {
    setAmountPaid(
      String(billing.collectedAmount ?? 0)
    );

    setDueDate(billing.dueDate || '');
  };

  const handleSave = () => {
    onSave({
      ...billing,
      collectedAmount: enteredAmount,
      outstandingAmount,
      dueDate: dueDate || null,
      settlementStatus: calculateSettlementStatus({
        paidAmount: enteredAmount,
        totalAmount,
        dueDate,
      }),
    });
  };

  return (
    <div
      className="inrfs-monthly-billing-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="inrfs-monthly-billing-payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        {/* HEADER */}

        <div className="inrfs-monthly-billing-modal-header">
          <div className="inrfs-monthly-billing-modal-title">
            <div className="inrfs-monthly-billing-modal-icon">
              <CircleDollarSign size={20} />
            </div>

            <div>
              <h2 id="payment-modal-title">
                Manage Payment
              </h2>

              <p>
                {billing.invoiceNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inrfs-monthly-billing-modal-close"
            onClick={onClose}
            aria-label="Close payment management"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="inrfs-monthly-billing-payment-body">

          {/* FINANCER INFO */}

          <div className="inrfs-monthly-billing-payment-financer">
            <div className="inrfs-monthly-billing-financer-avatar large">
              <WalletCards size={19} />
            </div>

            <div>
              <span>FINANCER</span>

              <strong>
                {billing.financerName}
              </strong>

              <small>
                {billing.financerId} ·{' '}
                {formatMonth(billing.billingMonth)}
              </small>
            </div>

            <span
              className={`inrfs-monthly-billing-status ${statusConfig.className}`}
            >
              <StatusIcon size={13} />
              {previewStatus}
            </span>
          </div>

          {/* AMOUNT SUMMARY */}

          <div className="inrfs-monthly-billing-payment-summary">

            <div>
              <span>Total Due</span>

              <strong>
                {formatCurrency(totalAmount)}
              </strong>
            </div>

            <div className="is-collected">
              <span>Amount Paid</span>

              <strong>
                {formatCurrency(enteredAmount)}
              </strong>
            </div>

            <div className="is-outstanding">
              <span>Balance</span>

              <strong>
                {formatCurrency(outstandingAmount)}
              </strong>
            </div>

          </div>

          {/* PAYMENT INPUT */}

          <div className="inrfs-monthly-billing-payment-section">

            <div className="inrfs-monthly-billing-section-heading">
              <div>
                <h3>Payment Details</h3>

                <p>
                  Enter the amount received from the
                  financer.
                </p>
              </div>

              <button
                type="button"
                className="inrfs-monthly-billing-full-payment-btn"
                onClick={handleFullPayment}
              >
                Mark Full Payment
              </button>
            </div>

            <div className="inrfs-monthly-billing-payment-field">
              <label htmlFor="amountPaid">
                Amount Paid
              </label>

              <div className="inrfs-monthly-billing-currency-input">
                <IndianRupee size={17} />

                <input
                  id="amountPaid"
                  type="number"
                  min="0"
                  max={totalAmount}
                  step="0.01"
                  value={amountPaid}
                  onChange={handleAmountChange}
                  placeholder="Enter amount paid"
                />
              </div>

              <small>
                Maximum payable amount:{' '}
                {formatCurrency(totalAmount)}
              </small>
            </div>

          </div>

          {/* RESCHEDULE */}

          <div className="inrfs-monthly-billing-reschedule-section">

            <div className="inrfs-monthly-billing-section-heading">
              <div>
                <h3>
                  Reschedule Payment
                </h3>

                <p>
                  If the outstanding amount will be
                  paid later, set a new expected date.
                </p>
              </div>

              <CalendarClock size={19} />
            </div>

            <div className="inrfs-monthly-billing-payment-field">
              <label htmlFor="dueDate">
                Expected Payment Date
              </label>

              <div className="inrfs-monthly-billing-date-input">
                <CalendarDays size={17} />

                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(event.target.value)
                  }
                />
              </div>

              {dueDate && (
                <small>
                  Payment expected by{' '}
                  <strong>
                    {formatDate(dueDate)}
                  </strong>
                </small>
              )}
            </div>

          </div>

          {/* LIVE STATUS */}

          <div
            className={`inrfs-monthly-billing-payment-result ${statusConfig.className}`}
          >
            <div className="inrfs-monthly-billing-payment-result-icon">
              <StatusIcon size={18} />
            </div>

            <div>
              <span>
                Automatic Settlement Status
              </span>

              <strong>
                {previewStatus}
              </strong>

              <small>
                {previewStatus === 'Paid'
                  ? 'Full payment has been received. No outstanding balance remains.'
                  : previewStatus === 'Partially Paid'
                  ? `${formatCurrency(
                      outstandingAmount
                    )} remains to be collected.`
                  : previewStatus === 'Overdue'
                  ? 'The payment date has passed and there is still an outstanding balance.'
                  : 'No payment has been recorded yet.'}
              </small>
            </div>
          </div>

        </div>

        {/* FOOTER */}

        <div className="inrfs-monthly-billing-modal-footer">

          <button
            type="button"
            className="inrfs-monthly-billing-secondary-btn"
            onClick={handleReset}
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <div className="inrfs-monthly-billing-footer-right">

            <button
              type="button"
              className="inrfs-monthly-billing-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="button"
              className="inrfs-monthly-billing-save-btn"
              onClick={handleSave}
            >
              <Save size={15} />
              Save Payment
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
/* =========================================================
   BILLING PERIOD PICKER
========================================================= */

const BILLING_MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

function BillingPeriodPicker({
  value,
  onChange,
  availableMonths,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedYear =
    value && value !== 'All'
      ? Number(value.split('-')[0])
      : new Date().getFullYear();

  const selectedMonth =
    value && value !== 'All'
      ? value.split('-')[1]
      : null;

  const [pickerYear, setPickerYear] =
    useState(selectedYear);

  const availableYearSet = useMemo(() => {
    const years = new Set();

    availableMonths.forEach((month) => {
      if (!month || month === 'All') return;

      const [year] = month.split('-');

      if (year) {
        years.add(Number(year));
      }
    });

    years.add(new Date().getFullYear());

    return years;
  }, [availableMonths]);

  const handleOpen = () => {
    setPickerYear(selectedYear);
    setIsOpen((current) => !current);
  };

  const handleMonthSelect = (month) => {
    const billingPeriod =
      `${pickerYear}-${month}`;

    onChange(billingPeriod);
    setIsOpen(false);
  };

  const handleAllPeriods = () => {
    onChange('All');
    setIsOpen(false);
  };

  const hasMonthData = (month) => {
    return availableMonths.includes(
      `${pickerYear}-${month}`
    );
  };

  const displayValue =
    value === 'All'
      ? 'All Billing Periods'
      : formatMonth(value);

  return (
    <div className="inrfs-billing-period-picker">

      {/* =================================================
          TRIGGER
      ================================================== */}

      <button
        type="button"
        className={`inrfs-billing-period-trigger ${
          isOpen ? 'is-open' : ''
        }`}
        onClick={handleOpen}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <CalendarDays size={17} />

        <span>
          {displayValue}
        </span>

        <ChevronDown
          size={16}
          className={`inrfs-billing-period-chevron ${
            isOpen ? 'is-rotated' : ''
          }`}
        />
      </button>


      {/* =================================================
          PICKER
      ================================================== */}

      {isOpen && (
        <>
          <button
            type="button"
            className="inrfs-billing-period-backdrop"
            aria-label="Close billing period picker"
            onClick={() => setIsOpen(false)}
          />

          <div className="inrfs-billing-period-menu">

            {/* YEAR HEADER */}

            <div className="inrfs-billing-period-year-header">

              <button
                type="button"
                className="inrfs-billing-period-year-btn"
                onClick={() =>
                  setPickerYear(
                    (year) => year - 1
                  )
                }
                aria-label="Previous year"
              >
                <ChevronLeft size={17} />
              </button>

              <div className="inrfs-billing-period-year">

                <span>Billing Year</span>

                <strong>
                  {pickerYear}
                </strong>

              </div>

              <button
                type="button"
                className="inrfs-billing-period-year-btn"
                onClick={() =>
                  setPickerYear(
                    (year) => year + 1
                  )
                }
                aria-label="Next year"
              >
                <ChevronRight size={17} />
              </button>

            </div>


            {/* MONTHS */}

            <div className="inrfs-billing-period-month-grid">

              {BILLING_MONTHS.map((month) => {

                const isSelected =
                  selectedMonth ===
                    month.value &&
                  selectedYear ===
                    pickerYear;

                const hasData =
                  hasMonthData(
                    month.value
                  );

                return (
                  <button
                    key={month.value}
                    type="button"
                    className={`
                      inrfs-billing-period-month
                      ${isSelected ? 'is-selected' : ''}
                      ${!hasData ? 'is-empty' : ''}
                    `}
                    onClick={() =>
                      handleMonthSelect(
                        month.value
                      )
                    }
                  >
                    <span>
                      {month.label}
                    </span>

                    {hasData && (
                      <i />
                    )}
                  </button>
                );
              })}

            </div>


            {/* ALL */}

            <div className="inrfs-billing-period-footer">

              <button
                type="button"
                className={
                  value === 'All'
                    ? 'is-active'
                    : ''
                }
                onClick={handleAllPeriods}
              >
                All Billing Periods
              </button>

            </div>

          </div>
        </>
      )}

    </div>
  );
}
/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AdminMonthlyBilling() {
  const [billingData, setBillingData] =
    useState(initialBillingData);

  const [selectedMonth, setSelectedMonth] =
    useState(() =>
      initialBillingData.length > 0
        ? initialBillingData
            .map((item) => item.billingMonth)
            .sort()
            .reverse()[0] || '2026-08'
        : '2026-08'
    );

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [selectedBilling, setSelectedBilling] =
    useState(null);

  /* =======================================================
     MONTH OPTIONS
  ======================================================= */

const monthOptions = useMemo(() => {
  const months = [
    ...new Set(
      billingData.map(
        (item) => item.billingMonth
      )
    ),
  ];

  return months.sort().reverse();
}, [billingData]);

  /* =======================================================
     FILTERED DATA
  ======================================================= */

  const filteredBilling = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return billingData.filter((item) => {
      const matchesMonth =
        selectedMonth === 'All' ||
        item.billingMonth === selectedMonth;

      const matchesStatus =
        statusFilter === 'All' ||
        item.settlementStatus === statusFilter;

      const matchesSearch =
        !searchValue ||
        item.financerName
          ?.toLowerCase()
          .includes(searchValue) ||
        item.financerId
          ?.toLowerCase()
          .includes(searchValue) ||
        item.invoiceNumber
          ?.toLowerCase()
          .includes(searchValue);

      return (
        matchesMonth &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    billingData,
    selectedMonth,
    statusFilter,
    search,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const totalServiceCharges =
      filteredBilling.reduce(
        (total, item) =>
          total +
          Number(
            item.serviceChargeAmount || 0
          ),
        0
      );

    const totalCollected =
      filteredBilling.reduce(
        (total, item) =>
          total +
          Number(
            item.collectedAmount || 0
          ),
        0
      );

    const totalOutstanding =
      filteredBilling.reduce(
        (total, item) =>
          total +
          Number(
            item.outstandingAmount || 0
          ),
        0
      );

    const totalInterest =
      filteredBilling.reduce(
        (total, item) =>
          total +
          Number(
            item.applicableInterest || 0
          ),
        0
      );

    const paidCount =
      filteredBilling.filter(
        (item) =>
          item.settlementStatus === 'Paid'
      ).length;

    const pendingCount =
      filteredBilling.filter(
        (item) =>
          item.settlementStatus === 'Pending'
      ).length;

    const partialCount =
      filteredBilling.filter(
        (item) =>
          item.settlementStatus ===
          'Partially Paid'
      ).length;

    const overdueCount =
      filteredBilling.filter(
        (item) =>
          item.settlementStatus === 'Overdue'
      ).length;

    return {
      totalServiceCharges,
      totalCollected,
      totalOutstanding,
      totalInterest,
      paidCount,
      pendingCount,
      partialCount,
      overdueCount,
    };
  }, [filteredBilling]);

  /* =======================================================
     SAVE PAYMENT
  ======================================================= */

  const handleSavePayment = (updatedBilling) => {
    setBillingData((current) =>
      current.map((item) =>
        item.invoiceNumber ===
        updatedBilling.invoiceNumber
          ? updatedBilling
          : item
      )
    );

    setSelectedBilling(null);
  };

  return (
    <main className="inrfs-monthly-billing-page">

      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <header className="inrfs-monthly-billing-header">

        <div className="inrfs-monthly-billing-header-copy">

          <div className="inrfs-monthly-billing-title-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <h1>Monthly Billing</h1>

            <p>
              Manage financer-wise monthly payments,
              balances and settlement status.
            </p>
          </div>

        </div>

<div className="inrfs-monthly-billing-header-month">
  <span className="inrfs-monthly-billing-period-label">
    Billing period
  </span>

  <BillingPeriodPicker
    value={selectedMonth}
    onChange={setSelectedMonth}
    availableMonths={monthOptions}
  />
</div>

      </header>

      {/* =================================================
          SUMMARY
      ================================================== */}

      <section className="inrfs-monthly-billing-summary">

        <BillingSummaryCard
          icon={ReceiptIndianRupee}
          title="SERVICE CHARGES"
          value={formatCurrency(
            summary.totalServiceCharges
          )}
          description="Total billed"
          variant="is-purple"
        />

        <BillingSummaryCard
          icon={CircleDollarSign}
          title="COLLECTED"
          value={formatCurrency(
            summary.totalCollected
          )}
          description="Amount received"
          variant="is-green"
        />

        <BillingSummaryCard
          icon={Clock3}
          title="OUTSTANDING"
          value={formatCurrency(
            summary.totalOutstanding
          )}
          description="Balance to collect"
          variant="is-orange"
        />

        <BillingSummaryCard
          icon={IndianRupee}
          title="APPLICABLE INTEREST"
          value={formatCurrency(
            summary.totalInterest
          )}
          description="Interest base"
          variant="is-blue"
        />

      </section>

      {/* =================================================
          SETTLEMENT OVERVIEW
      ================================================== */}

      <section className="inrfs-monthly-billing-overview">

        <div className="inrfs-monthly-billing-overview-heading">

          <div>
            <h2>Settlement Overview</h2>

            <p>
              Quick view of the current payment
              position.
            </p>
          </div>

          <div className="inrfs-monthly-billing-flow-hint">
            <span>Record payment</span>
            <ArrowRight size={14} />
            <span>Status updates automatically</span>
          </div>

        </div>

        <div className="inrfs-monthly-billing-overview-items">

          <div className="inrfs-monthly-billing-overview-item is-paid">
            <CheckCircle2 size={18} />

            <div>
              <span>Paid</span>
              <strong>
                {summary.paidCount}
              </strong>
            </div>
          </div>

          <div className="inrfs-monthly-billing-overview-item is-partial">
            <Clock3 size={18} />

            <div>
              <span>Partially Paid</span>
              <strong>
                {summary.partialCount}
              </strong>
            </div>
          </div>

          <div className="inrfs-monthly-billing-overview-item is-pending">
            <Clock3 size={18} />

            <div>
              <span>Pending</span>
              <strong>
                {summary.pendingCount}
              </strong>
            </div>
          </div>

          <div className="inrfs-monthly-billing-overview-item is-overdue">
            <AlertCircle size={18} />

            <div>
              <span>Overdue</span>
              <strong>
                {summary.overdueCount}
              </strong>
            </div>
          </div>

        </div>

      </section>

      {/* =================================================
          BILLING CARD
      ================================================== */}

      <section className="inrfs-monthly-billing-card">

        <div className="inrfs-monthly-billing-card-header">

          <div>
            <h2>Financer Monthly Payments</h2>

            <p>
              Record payments and manage outstanding
              balances for each financer.
            </p>
          </div>

          <span className="inrfs-monthly-billing-count">
            {filteredBilling.length} records
          </span>

        </div>

        {/* =================================================
            FILTER BAR
        ================================================== */}

<div className="inrfs-monthly-billing-filter-row">

  <div className="inrfs-monthly-billing-search">
    <Search size={18} />

    <input
      type="text"
      placeholder="Search financer or invoice..."
      value={search}
      onChange={(event) =>
        setSearch(event.target.value)
      }
    />

    {search && (
      <button
        type="button"
        onClick={() => setSearch('')}
        aria-label="Clear search"
      >
        <X size={14} />
      </button>
    )}
  </div>

  <div className="inrfs-monthly-billing-status-group">

    <span className="inrfs-monthly-billing-status-label">
      Status
    </span>

    <div className="inrfs-monthly-billing-status-pills">

      {[
        'All',
        'Paid',
        'Partially Paid',
        'Pending',
        'Overdue',
      ].map((status) => (
        <button
          key={status}
          type="button"
          className={
            statusFilter === status
              ? 'is-active'
              : ''
          }
          onClick={() =>
            setStatusFilter(status)
          }
        >
          {status}
        </button>
      ))}

    </div>

  </div>

</div>

        {/* =================================================
            DESKTOP TABLE
        ================================================== */}

        <div className="inrfs-monthly-billing-table-wrap">

          <table className="inrfs-monthly-billing-table">

            <thead>
              <tr>
                <th>FINANCER</th>
                <th>BILLING MONTH</th>
                <th>INTEREST</th>
                <th>SERVICE CHARGE</th>
                <th>INRFS CHARGE</th>
                <th>PAID</th>
                <th>BALANCE</th>
                <th>SETTLEMENT</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {filteredBilling.length > 0 ? (
                filteredBilling.map((billing) => {

                  const statusConfig =
                    getSettlementConfig(
                      billing.settlementStatus
                    );

                  const StatusIcon =
                    statusConfig.icon;

                  return (
                    <tr
                      key={billing.invoiceNumber}
                    >

                      {/* FINANCER */}

                      <td>
                        <div className="inrfs-monthly-billing-financer-cell">

                          <div className="inrfs-monthly-billing-financer-avatar">
                            <WalletCards size={17} />
                          </div>

                          <div>
                            <strong>
                              {billing.financerName}
                            </strong>

                            <span>
                              {billing.financerId}
                            </span>

                            <small>
                              {billing.invoiceNumber}
                            </small>
                          </div>

                        </div>
                      </td>

                      {/* MONTH */}

                      <td>
                        <div className="inrfs-monthly-billing-month-cell">

                          <CalendarDays size={15} />

                          <span>
                            {formatShortMonth(
                              billing.billingMonth
                            )}
                          </span>

                        </div>
                      </td>

                      {/* INTEREST */}

                      <td>
                        <strong className="inrfs-monthly-billing-interest-value">
                          {formatCurrency(
                            billing.applicableInterest
                          )}
                        </strong>
                      </td>

                      {/* SERVICE % */}

                      <td>
                        <span className="inrfs-monthly-billing-percentage">
                          {billing.serviceChargePercentage}%
                        </span>
                      </td>

                      {/* INRFS CHARGE */}

                      <td>
                        <strong className="inrfs-monthly-billing-charge-value">
                          {formatCurrency(
                            billing.serviceChargeAmount
                          )}
                        </strong>
                      </td>

                      {/* PAID */}

                      <td>
                        <strong className="inrfs-monthly-billing-collected-value">
                          {formatCurrency(
                            billing.collectedAmount
                          )}
                        </strong>
                      </td>

                      {/* BALANCE */}

                      <td>
                        <strong
                          className={
                            billing.outstandingAmount > 0
                              ? 'inrfs-monthly-billing-outstanding-value'
                              : 'inrfs-monthly-billing-zero-value'
                          }
                        >
                          {formatCurrency(
                            billing.outstandingAmount
                          )}
                        </strong>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`inrfs-monthly-billing-status ${statusConfig.className}`}
                        >
                          <StatusIcon size={13} />

                          {billing.settlementStatus}
                        </span>

                        {billing.dueDate && (
                          <small className="inrfs-monthly-billing-due-date">
                            Due {formatDate(
                              billing.dueDate
                            )}
                          </small>
                        )}
                      </td>

                      {/* ACTION */}

                      <td>
                        <button
                          type="button"
                          className="inrfs-monthly-billing-manage-btn"
                          onClick={() =>
                            setSelectedBilling(
                              billing
                            )
                          }
                        >
                          <Eye size={15} />
                          Manage Payment
                        </button>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="inrfs-monthly-billing-empty"
                  >
                    <FileText size={32} />

                    <strong>
                      No billing records found
                    </strong>

                    <span>
                      Try changing the month,
                      status or search filter.
                    </span>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            MOBILE CARDS
        ================================================== */}

        <div className="inrfs-monthly-billing-mobile-list">

          {filteredBilling.length > 0 ? (
            filteredBilling.map((billing) => {

              const statusConfig =
                getSettlementConfig(
                  billing.settlementStatus
                );

              const StatusIcon =
                statusConfig.icon;

              return (
                <article
                  key={billing.invoiceNumber}
                  className="inrfs-monthly-billing-mobile-card"
                >

                  <div className="inrfs-monthly-billing-mobile-top">

                    <div className="inrfs-monthly-billing-financer-cell">

                      <div className="inrfs-monthly-billing-financer-avatar">
                        <WalletCards size={17} />
                      </div>

                      <div>
                        <strong>
                          {billing.financerName}
                        </strong>

                        <span>
                          {billing.financerId}
                        </span>

                        <small>
                          {billing.invoiceNumber}
                        </small>
                      </div>

                    </div>

                    <span
                      className={`inrfs-monthly-billing-status ${statusConfig.className}`}
                    >
                      <StatusIcon size={13} />
                      {billing.settlementStatus}
                    </span>

                  </div>

                  <div className="inrfs-monthly-billing-mobile-period">

                    <div>
                      <CalendarDays size={14} />

                      <span>
                        {formatMonth(
                          billing.billingMonth
                        )}
                      </span>
                    </div>

                    {billing.dueDate && (
                      <span>
                        Due{' '}
                        {formatDate(
                          billing.dueDate
                        )}
                      </span>
                    )}

                  </div>

                  <div className="inrfs-monthly-billing-mobile-grid">

                    <div>
                      <span>Total Due</span>
                      <strong>
                        {formatCurrency(
                          billing.serviceChargeAmount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Paid</span>
                      <strong className="is-collected">
                        {formatCurrency(
                          billing.collectedAmount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Balance</span>
                      <strong
                        className={
                          billing.outstandingAmount > 0
                            ? 'is-outstanding'
                            : 'is-zero'
                        }
                      >
                        {formatCurrency(
                          billing.outstandingAmount
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Service Charge</span>
                      <strong>
                        {billing.serviceChargePercentage}%
                      </strong>
                    </div>

                  </div>

                  {billing.outstandingAmount > 0 && (
                    <div className="inrfs-monthly-billing-mobile-payment-note">
                      <Clock3 size={14} />

                      <span>
                        {formatCurrency(
                          billing.outstandingAmount
                        )}{' '}
                        remaining to collect
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="inrfs-monthly-billing-mobile-manage-btn"
                    onClick={() =>
                      setSelectedBilling(
                        billing
                      )
                    }
                  >
                    <Eye size={15} />
                    Manage Payment
                  </button>

                </article>
              );
            })
          ) : (
            <div className="inrfs-monthly-billing-mobile-empty">

              <FileText size={30} />

              <strong>
                No billing records found
              </strong>

              <span>
                Try changing your filters.
              </span>

            </div>
          )}

        </div>

      </section>

      {/* =================================================
          BILLING NOTE
      ================================================== */}

      <div className="inrfs-monthly-billing-note">

        <ReceiptIndianRupee size={17} />

        <div>
          <strong>
            Payment status is calculated automatically
          </strong>

          <span>
            Record the amount actually received.
            The system calculates the remaining
            balance and settlement status automatically.
            You can also reschedule an outstanding
            payment to a new expected date.
          </span>
        </div>

      </div>

      {/* =================================================
          PAYMENT MODAL
      ================================================== */}

      <PaymentManagementModal
        billing={selectedBilling}
        onClose={() =>
          setSelectedBilling(null)
        }
        onSave={handleSavePayment}
      />

    </main>
  );
}