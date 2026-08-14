import React, { useMemo, useState, useCallback } from "react";
import {
  IndianRupee,
  Calendar,
  Clock,
  RefreshCw,
  Search,
  X,
  Check,
  CalendarClock,
  Eye,
  WalletCards,
  CircleDollarSign,
  AlertCircle,
  Save,
  RotateCcw,
} from "lucide-react";
import "./Payments.css";

/* ============================================================
   STATUS
============================================================ */

const STATUS = {
  SUCCESS: "success",
  PARTIAL: "partial",
  PENDING: "pending",
  OVERDUE: "overdue",
  RESCHEDULED: "rescheduled",
};

const STATUS_LABEL = {
  [STATUS.SUCCESS]: "Success",
  [STATUS.PARTIAL]: "Partially Paid",
  [STATUS.PENDING]: "Pending",
  [STATUS.OVERDUE]: "Overdue",
  [STATUS.RESCHEDULED]: "Rescheduled",
};

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: STATUS.SUCCESS, label: "Success" },
  { key: STATUS.PARTIAL, label: "Partially Paid" },
  { key: STATUS.PENDING, label: "Pending" },
  { key: STATUS.OVERDUE, label: "Overdue" },
  { key: STATUS.RESCHEDULED, label: "Rescheduled" },
];

/* ============================================================
   HELPERS
============================================================ */

function toISODate(value) {
  if (!value) return null;

  const d = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(d.getTime())) return null;

  return d.toISOString().slice(0, 10);
}

function getTodayISO() {
  return toISODate(new Date());
}

function formatCurrency(value) {
  const n = Number(value) || 0;

  return `₹${n.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatDueDateLabel(isoDate) {
  if (!isoDate) return "—";

  const d = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(d.getTime())) return isoDate;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((d - today) / dayMs);

  const dateStr = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (diffDays === 0) return `Today — ${dateStr}`;
  if (diffDays === -1) return `Yesterday — ${dateStr}`;
  if (diffDays === 1) return `Tomorrow — ${dateStr}`;

  return dateStr;
}

function formatShortDate(isoDate) {
  if (!isoDate) return "—";

  const d = new Date(`${isoDate}T00:00:00`);

  if (Number.isNaN(d.getTime())) return isoDate;

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isSameMonth(isoDate, ref) {
  if (!isoDate) return false;

  const d = new Date(`${isoDate}T00:00:00`);

  return (
    d.getFullYear() === ref.getFullYear() &&
    d.getMonth() === ref.getMonth()
  );
}

function calculateStatus({ paidAmount, totalAmount, dueDate }) {
  const paid = Number(paidAmount || 0);
  const total = Number(totalAmount || 0);

  if (total <= 0) return STATUS.PENDING;

  if (paid >= total) return STATUS.SUCCESS;

  if (paid > 0) return STATUS.PARTIAL;

  if (dueDate && dueDate < getTodayISO()) {
    return STATUS.OVERDUE;
  }

  return STATUS.PENDING;
}

/* ============================================================
   NORMALIZATION
   Supports camelCase / snake_case backend payloads.
============================================================ */

function normalizePayment(raw) {
  const customer =
    typeof raw.customer === "object" && raw.customer !== null
      ? raw.customer
      : {
          name: raw.customer,
          id: raw.customerId ?? raw.customer_id,
        };

  const dueDate =
    toISODate(
      raw.dueDate ??
        raw.due_date ??
        raw.interestDueDate ??
        raw.interest_due_date
    ) ?? null;

  const paymentDate =
    toISODate(
      raw.paymentDate ??
        raw.payment_date ??
        raw.paidOn ??
        raw.paid_on
    ) ?? null;

  const totalAmount = Number(
    raw.totalAmount ??
      raw.total_amount ??
      raw.interestDue ??
      raw.interest_due ??
      raw.amount ??
      0
  );

  const rawPaidAmount =
    raw.paidAmount ??
    raw.paid_amount ??
    raw.amountPaid ??
    raw.amount_paid ??
    raw.collectedAmount ??
    raw.collected_amount;

  const explicitStatus = String(
    raw.status ?? raw.paymentStatus ?? raw.payment_status ?? ""
  ).toLowerCase();

  let paidAmount;

  if (rawPaidAmount !== undefined && rawPaidAmount !== null) {
    paidAmount = Number(rawPaidAmount) || 0;
  } else if (explicitStatus === STATUS.SUCCESS) {
    paidAmount = totalAmount;
  } else {
    paidAmount = 0;
  }

  const normalizedStatus =
    Object.values(STATUS).includes(explicitStatus)
      ? explicitStatus
      : calculateStatus({
          paidAmount,
          totalAmount,
          dueDate,
        });

  return {
    id:
      raw.id ??
      raw.paymentId ??
      `${raw.loanId ?? raw.loan_id}-${dueDate ?? "no-date"}`,

    loanId: raw.loanId ?? raw.loan_id ?? "—",

    customerId:
      raw.customerId ??
      raw.customer_id ??
      customer?.id ??
      "—",

    customerName:
      raw.customerName ??
      raw.customer_name ??
      raw.customer ??
      customer?.name ??
      "Unknown customer",

    interestDue: totalAmount,

    amount: totalAmount,

    paidAmount: Math.min(
      Math.max(paidAmount, 0),
      Math.max(totalAmount, 0)
    ),

    outstanding: Math.max(totalAmount - paidAmount, 0),

    dueDate,
    paymentDate,

    method:
      raw.method ??
      raw.paymentMethod ??
      raw.payment_method ??
      null,

    status: normalizedStatus,

    paymentHistory:
      raw.paymentHistory ??
      raw.payment_history ??
      raw.payments ??
      [],

    rescheduleHistory:
      raw.rescheduleHistory ??
      raw.reschedule_history ??
      [],

    notes: raw.notes ?? "",
  };
}

/* ============================================================
   DEMO DATA
============================================================ */

function buildSeedData() {
  const today = new Date();

  const iso = (offset) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);

    return d.toISOString().slice(0, 10);
  };

  return [
    {
      id: "PMT-1001",
      loanId: "LN000125",
      customerId: "CUS001",
      customer: "Ramesh Kumar",
      interestDue: 1000,
      amount: 1000,
      paidAmount: 1000,
      dueDate: iso(0),
      status: STATUS.SUCCESS,
      paymentDate: iso(0),
      method: "PhonePe",
    },
    {
      id: "PMT-1002",
      loanId: "LN000126",
      customerId: "CUS002",
      customer: "Sunita Devi",
      interestDue: 750,
      amount: 750,
      paidAmount: 0,
      dueDate: iso(1),
      status: STATUS.PENDING,
      method: null,
    },
    {
      id: "PMT-1003",
      loanId: "LN000127",
      customerId: "CUS003",
      customer: "Anil Sharma",
      interestDue: 700,
      amount: 700,
      paidAmount: 0,
      dueDate: iso(-1),
      status: STATUS.OVERDUE,
      method: null,
    },
    {
      id: "PMT-1004",
      loanId: "LN000128",
      customerId: "CUS004",
      customer: "Priya Singh",
      interestDue: 550,
      amount: 550,
      paidAmount: 550,
      dueDate: iso(2),
      status: STATUS.SUCCESS,
      paymentDate: iso(2),
      method: "Cash",
    },
    {
      id: "PMT-1005",
      loanId: "LN000129",
      customerId: "CUS005",
      customer: "Vikram Rao",
      interestDue: 1200,
      amount: 1200,
      paidAmount: 0,
      dueDate: iso(3),
      status: STATUS.RESCHEDULED,
      method: null,
      rescheduleHistory: [
        {
          from: iso(-2),
          to: iso(3),
          reason: "Customer travelling",
          date: iso(-2),
        },
      ],
    },
  ];
}

/* ============================================================
   MAIN PAYMENTS PAGE
============================================================ */

export default function Payments({ initialData }) {
  const [payments, setPayments] = useState(() =>
    (initialData ?? buildSeedData()).map(normalizePayment)
  );

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewPayment, setViewPayment] = useState(null);
  const [managePayment, setManagePayment] = useState(null);

  /* ----------------------------------------------------------
     SUMMARY
  ---------------------------------------------------------- */

  const summary = useMemo(() => {
    const now = new Date();

    let totalDue = 0;
    let totalCollected = 0;
    let thisMonth = 0;
    let pendingCollection = 0;
    let overdueCollection = 0;
    let outstanding = 0;

    payments.forEach((p) => {
      totalDue += p.amount;
      totalCollected += p.paidAmount;
      outstanding += p.outstanding;

      if (p.paymentDate && isSameMonth(p.paymentDate, now)) {
        thisMonth += p.paidAmount;
      }

      if (
        p.status === STATUS.PENDING ||
        p.status === STATUS.RESCHEDULED
      ) {
        pendingCollection += p.outstanding;
      }

      if (p.status === STATUS.OVERDUE) {
        overdueCollection += p.outstanding;
      }
    });

    return {
      totalDue,
      totalCollected,
      thisMonth,
      pendingCollection,
      overdueCollection,
      outstanding,
    };
  }, [payments]);

  /* ----------------------------------------------------------
     COUNTS
  ---------------------------------------------------------- */

  const statusCounts = useMemo(() => {
    const counts = {
      all: payments.length,
    };

    Object.values(STATUS).forEach((status) => {
      counts[status] = payments.filter(
        (p) => p.status === status
      ).length;
    });

    return counts;
  }, [payments]);

  /* ----------------------------------------------------------
     FILTER
  ---------------------------------------------------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return payments.filter((p) => {
      if (
        statusFilter !== "all" &&
        p.status !== statusFilter
      ) {
        return false;
      }

      if (
        dateFilter &&
        p.dueDate !== dateFilter
      ) {
        return false;
      }

      if (q) {
        const haystack = `
          ${p.loanId}
          ${p.customerName}
          ${p.customerId}
          ${p.id}
        `.toLowerCase();

        if (!haystack.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [
    payments,
    search,
    dateFilter,
    statusFilter,
  ]);

  /* ----------------------------------------------------------
     GROUP BY DUE DATE
  ---------------------------------------------------------- */

  const groups = useMemo(() => {
    const map = new Map();

    filtered.forEach((payment) => {
      const key = payment.dueDate ?? "no-date";

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(payment);
    });

    return Array.from(map.entries())
      .sort((a, b) => {
        if (a[0] === "no-date") return 1;
        if (b[0] === "no-date") return -1;

        return a[0].localeCompare(b[0]);
      })
      .map(([date, records]) => {
        const totalDue = records.reduce(
          (sum, p) => sum + p.amount,
          0
        );

        const totalPaid = records.reduce(
          (sum, p) => sum + p.paidAmount,
          0
        );

        const totalOutstanding = records.reduce(
          (sum, p) => sum + p.outstanding,
          0
        );

        return {
          date,
          records,
          totalDue,
          totalPaid,
          totalOutstanding,
          paid: records.filter(
            (p) => p.status === STATUS.SUCCESS
          ).length,
          partial: records.filter(
            (p) => p.status === STATUS.PARTIAL
          ).length,
          pending: records.filter(
            (p) => p.status === STATUS.PENDING
          ).length,
          overdue: records.filter(
            (p) => p.status === STATUS.OVERDUE
          ).length,
          rescheduled: records.filter(
            (p) => p.status === STATUS.RESCHEDULED
          ).length,
        };
      });
  }, [filtered]);

  /* ----------------------------------------------------------
     SAVE / MANAGE PAYMENT
  ---------------------------------------------------------- */

  const handleSavePayment = useCallback(
    (updatedPayment) => {
      setPayments((current) =>
        current.map((payment) =>
          payment.id === updatedPayment.id
            ? normalizePayment(updatedPayment)
            : payment
        )
      );

      setManagePayment(null);
    },
    []
  );

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */

  return (
    <div className="pmt-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="pmt-header">
        <div>
          <h1 className="pmt-title">
            Payments &amp; Interest Schedule
          </h1>

          <p className="pmt-subtitle">
            Monitor collections, interest dues and
            payment transactions by due date.
          </p>
        </div>

        <div className="pmt-header-count">
          {filtered.length} records
        </div>
      </header>

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <section
        className="pmt-cards"
        aria-label="Payment summary"
      >
        <SummaryCard
          icon={<IndianRupee size={18} />}
          label="Total Due"
          value={formatCurrency(summary.totalDue)}
          tone="blue"
          description="Interest obligations"
        />

        <SummaryCard
          icon={<CircleDollarSign size={18} />}
          label="Total Collected"
          value={formatCurrency(summary.totalCollected)}
          tone="green"
          description="Amount received"
        />

        <SummaryCard
          icon={<Clock size={18} />}
          label="Pending Collection"
          value={formatCurrency(summary.pendingCollection)}
          tone="amber"
          description="Balance to collect"
        />

        <SummaryCard
          icon={<RefreshCw size={18} />}
          label="Overdue Collection"
          value={formatCurrency(summary.overdueCollection)}
          tone="red"
          description="Past due balance"
        />
      </section>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <section className="pmt-filters">
        <div className="pmt-search">
          <Search
            size={16}
            className="pmt-search-icon"
          />

          <input
            type="text"
            placeholder="Search loan ID or customer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="pmt-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="pmt-date-filter">
          <Calendar
            size={16}
            className="pmt-search-icon"
          />

          <input
            type="date"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
          />

          {dateFilter && (
            <button
              type="button"
              className="pmt-clear-search"
              onClick={() => setDateFilter("")}
              aria-label="Clear date"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </section>

      {/* ======================================================
          STATUS FILTERS
      ====================================================== */}

      <nav
        className="pmt-status-filters"
        aria-label="Filter by status"
      >
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            className={`pmt-status-chip${
              statusFilter === filter.key
                ? " is-active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter(filter.key)
            }
          >
            {filter.label}

            <span className="pmt-status-count">
              {statusCounts[filter.key] ?? 0}
            </span>
          </button>
        ))}
      </nav>

      {/* ======================================================
          PAYMENT ACTIVITY
      ====================================================== */}

      <section className="pmt-activity">

        <div className="pmt-activity-header">
          <div>
            <h2>Payment Activity</h2>

            <p>
              Interest obligations and payment
              transactions grouped by due date.
            </p>
          </div>

          <div className="pmt-activity-count">
            {filtered.length} records
          </div>
        </div>

        {groups.length === 0 && (
          <div className="pmt-empty">
            No payment records match the current
            filters.
          </div>
        )}

        {groups.map((group) => (
          <DateGroup
            key={group.date}
            group={group}
            onView={(payment) =>
              setViewPayment(payment)
            }
            onManage={(payment) =>
              setManagePayment(payment)
            }
          />
        ))}
      </section>

      {/* ======================================================
          VIEW PAYMENT
      ====================================================== */}

      {viewPayment && (
        <PaymentDetailsDrawer
          payment={viewPayment}
          onClose={() =>
            setViewPayment(null)
          }
          onManage={() => {
            const selected = viewPayment;

            setViewPayment(null);
            setManagePayment(selected);
          }}
        />
      )}

      {/* ======================================================
          MANAGE PAYMENT
      ====================================================== */}

      {managePayment && (
        <PaymentManagementModal
          payment={managePayment}
          onClose={() =>
            setManagePayment(null)
          }
          onSave={handleSavePayment}
        />
      )}
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  icon,
  label,
  value,
  tone,
  description,
}) {
  return (
    <article
      className={`pmt-card pmt-card--${tone}`}
    >
      <div className="pmt-card-icon">
        {icon}
      </div>

      <div className="pmt-card-body">
        <span className="pmt-card-label">
          {label}
        </span>

        <span className="pmt-card-value">
          {value}
        </span>

        {description && (
          <small className="pmt-card-description">
            {description}
          </small>
        )}
      </div>
    </article>
  );
}

/* ============================================================
   DATE GROUP
============================================================ */

function DateGroup({
  group,
  onView,
  onManage,
}) {
  const {
    date,
    records,
    totalDue,
    totalPaid,
    totalOutstanding,
    paid,
    partial,
    pending,
    overdue,
    rescheduled,
  } = group;

  const summaryParts = [
    `${records.length} payment${
      records.length === 1 ? "" : "s"
    }`,
    formatCurrency(totalDue),
  ];

  if (totalPaid > 0) {
    summaryParts.push(
      `${formatCurrency(totalPaid)} paid`
    );
  }

  if (totalOutstanding > 0) {
    summaryParts.push(
      `${formatCurrency(totalOutstanding)} outstanding`
    );
  }

  return (
    <div className="pmt-date-group">

      {/* DATE HEADER */}

      <div className="pmt-date-group-header">
        <div>
          <h3>
            {date === "no-date"
              ? "No due date"
              : formatDueDateLabel(date)}
          </h3>

          <span className="pmt-date-group-summary">
            {summaryParts.join(" • ")}
          </span>
        </div>

        <div className="pmt-date-group-statuses">
          {paid > 0 && (
            <span className="pmt-group-mini pmt-group-mini--success">
              {paid} paid
            </span>
          )}

          {partial > 0 && (
            <span className="pmt-group-mini pmt-group-mini--partial">
              {partial} partial
            </span>
          )}

          {pending > 0 && (
            <span className="pmt-group-mini pmt-group-mini--pending">
              {pending} pending
            </span>
          )}

          {overdue > 0 && (
            <span className="pmt-group-mini pmt-group-mini--overdue">
              {overdue} overdue
            </span>
          )}

          {rescheduled > 0 && (
            <span className="pmt-group-mini pmt-group-mini--rescheduled">
              {rescheduled} rescheduled
            </span>
          )}
        </div>
      </div>

      {/* TABLE */}

      <div className="pmt-table">

        <div className="pmt-table-head">
          <span>Customer</span>
          <span>Loan ID</span>
          <span>Due Date</span>
          <span>Interest</span>
          <span>Amount</span>
          <span>Method</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {records.map((payment) => (
          <PaymentRow
            key={payment.id}
            payment={payment}
            onView={onView}
            onManage={onManage}
          />
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   PAYMENT ROW
============================================================ */

function PaymentRow({
  payment,
  onView,
  onManage,
}) {
  const initials = (
    payment.customerName || "?"
  )
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const canManage = [
    STATUS.PENDING,
    STATUS.PARTIAL,
    STATUS.OVERDUE,
    STATUS.RESCHEDULED,
  ].includes(payment.status);

  return (
    <div
      className="pmt-table-row"
      data-label="Payment record"
    >

      {/* CUSTOMER */}

      <span
        className="pmt-cell pmt-cell-customer"
        data-th="Customer"
      >
        <span className="pmt-avatar">
          {initials}
        </span>

        <span className="pmt-customer-info">
          <span className="pmt-customer-name">
            {payment.customerName}
          </span>

          <span className="pmt-customer-id">
            {payment.customerId}
          </span>
        </span>
      </span>

      {/* LOAN */}

      <span
        className="pmt-cell pmt-loan-id"
        data-th="Loan ID"
      >
        {payment.loanId}
      </span>

      {/* DUE DATE */}

      <span
        className="pmt-cell pmt-due-date-cell"
        data-th="Due Date"
      >
        <Calendar size={14} />

        <span>
          {payment.dueDate
            ? formatShortDate(payment.dueDate)
            : "—"}
        </span>
      </span>

      {/* INTEREST */}

      <span
        className="pmt-cell"
        data-th="Interest"
      >
        <span className="pmt-amount">
          {formatCurrency(
            payment.interestDue
          )}
        </span>

        <span className="pmt-cell-caption">
          Interest
        </span>
      </span>

      {/* TOTAL / DUE */}

      <span
        className="pmt-cell"
        data-th="Amount"
      >
        <span className="pmt-amount">
          {formatCurrency(payment.amount)}
        </span>

        {payment.outstanding > 0 && (
          <span className="pmt-cell-caption pmt-cell-caption--balance">
            {formatCurrency(
              payment.outstanding
            )} balance
          </span>
        )}
      </span>

      {/* METHOD */}

      <span
        className="pmt-cell"
        data-th="Method"
      >
        {payment.method ? (
          <span className="pmt-method-pill">
            {payment.method}
          </span>
        ) : (
          <span className="pmt-method-pill pmt-method-pill--empty">
            —
          </span>
        )}
      </span>

      {/* STATUS */}

      <span
        className="pmt-cell"
        data-th="Status"
      >
        <StatusBadge
          status={payment.status}
        />

        {payment.status !== STATUS.SUCCESS &&
          payment.dueDate && (
            <span className="pmt-due-hint">
              Due{" "}
              {formatShortDate(
                payment.dueDate
              )}
            </span>
          )}
      </span>

      {/* ACTIONS */}

      <span
        className="pmt-cell pmt-cell-actions"
        data-th="Actions"
      >
        <button
          type="button"
          className="pmt-action pmt-action--view"
          onClick={() => onView(payment)}
        >
          <Eye size={14} />
          View
        </button>

        {canManage && (
          <button
            type="button"
            className="pmt-action pmt-action--primary"
            onClick={() =>
              onManage(payment)
            }
          >
            <WalletCards size={14} />
            Manage
          </button>
        )}
      </span>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  return (
    <span
      className={`pmt-badge pmt-badge--${status}`}
    >
      {STATUS_LABEL[status] ??
        "Pending"}
    </span>
  );
}

/* ============================================================
   VIEW PAYMENT DETAILS
============================================================ */

function PaymentDetailsDrawer({
  payment,
  onClose,
  onManage,
}) {
  const initials = (
    payment.customerName || "?"
  )
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const canManage = [
    STATUS.PENDING,
    STATUS.PARTIAL,
    STATUS.OVERDUE,
    STATUS.RESCHEDULED,
  ].includes(payment.status);

  return (
    <div
      className="pmt-details-modal-overlay"
      onClick={onClose}
    >
      <div
        className="pmt-details-modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="pmt-details-modal-header">
          <div>
            <span className="pmt-details-modal-eyebrow">
              PAYMENT DETAILS
            </span>

            <h2>Payment Details</h2>

            <p>
              {payment.id}
            </p>
          </div>

          <button
            type="button"
            className="pmt-details-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}

        <div className="pmt-details-modal-content">

          {/* PAYMENT SUMMARY */}

          <div className="pmt-payment-success-box">
            <div className="pmt-payment-success-icon">
              {payment.status ===
              STATUS.SUCCESS ? (
                <Check size={21} />
              ) : (
                <Clock size={21} />
              )}
            </div>

            <div className="pmt-payment-success-info">
              <strong>
                {STATUS_LABEL[
                  payment.status
                ]}
              </strong>

              <span>
                Due{" "}
                {payment.dueDate
                  ? formatShortDate(
                      payment.dueDate
                    )
                  : "—"}
              </span>
            </div>

            <div className="pmt-payment-success-amount">
              {formatCurrency(
                payment.amount
              )}
            </div>
          </div>

          {/* CUSTOMER */}

          <section className="pmt-modal-section">
            <div className="pmt-modal-section-title">
              Customer
            </div>

            <div className="pmt-modal-customer">
              <div className="pmt-modal-avatar">
                {initials}
              </div>

              <div className="pmt-modal-customer-info">
                <strong>
                  {payment.customerName}
                </strong>

                <span>
                  {payment.customerId}
                </span>
              </div>
            </div>
          </section>

          {/* PAYMENT DETAILS */}

          <section className="pmt-modal-section">
            <div className="pmt-modal-section-title">
              Payment Details
            </div>

            <div className="pmt-modal-detail-grid">

              <DetailItem
                label="Loan ID"
                value={payment.loanId}
              />

              <DetailItem
                label="Interest Due"
                value={formatCurrency(
                  payment.interestDue
                )}
              />

              <DetailItem
                label="Total Due"
                value={formatCurrency(
                  payment.amount
                )}
              />

              <DetailItem
                label="Amount Paid"
                value={formatCurrency(
                  payment.paidAmount
                )}
                highlight
              />

              <DetailItem
                label="Balance"
                value={formatCurrency(
                  payment.outstanding
                )}
              />

              <DetailItem
                label="Payment Method"
                value={
                  payment.method ||
                  "Not recorded"
                }
              />

              <DetailItem
                label="Due Date"
                value={
                  payment.dueDate
                    ? formatDueDateLabel(
                        payment.dueDate
                      )
                    : "—"
                }
              />

              <DetailItem
                label="Payment Date"
                value={
                  payment.paymentDate
                    ? formatDueDateLabel(
                        payment.paymentDate
                      )
                    : "Not paid"
                }
              />

            </div>
          </section>

          {/* STATUS */}

          <section className="pmt-modal-section">
            <div className="pmt-modal-section-title">
              Settlement Status
            </div>

            <div className="pmt-modal-status-row">
              <span>
                Current status
              </span>

              <StatusBadge
                status={payment.status}
              />
            </div>
          </section>

          {/* TIMELINE */}

          <section className="pmt-modal-section pmt-modal-timeline-section">
            <div className="pmt-modal-section-title">
              Payment Timeline
            </div>

            <div className="pmt-modal-timeline">

              <TimelineItem
                title="Payment Due"
                text={
                  payment.dueDate
                    ? formatDueDateLabel(
                        payment.dueDate
                      )
                    : "No due date"
                }
              />

              <TimelineItem
                title="Payment Recorded"
                text={
                  payment.paymentDate
                    ? `${formatDueDateLabel(
                        payment.paymentDate
                      )}${
                        payment.method
                          ? ` • ${payment.method}`
                          : ""
                      }`
                    : "Not recorded yet"
                }
              />

              <TimelineItem
                title="Current Balance"
                text={
                  payment.outstanding > 0
                    ? `${formatCurrency(
                        payment.outstanding
                      )} outstanding`
                    : "No outstanding balance"
                }
                complete={
                  payment.outstanding === 0
                }
              />

            </div>
          </section>

          {/* RESCHEDULE HISTORY */}

          {payment.rescheduleHistory
            ?.length > 0 && (
            <section className="pmt-modal-section">
              <div className="pmt-modal-section-title">
                Reschedule History
              </div>

              <div className="pmt-modal-history-list">
                {payment.rescheduleHistory.map(
                  (item, index) => (
                    <div
                      className="pmt-modal-history-item"
                      key={`${item.date}-${index}`}
                    >
                      <strong>
                        {formatShortDate(
                          item.from
                        )}{" "}
                        →{" "}
                        {formatShortDate(
                          item.to
                        )}
                      </strong>

                      {item.reason && (
                        <span>
                          {item.reason}
                        </span>
                      )}

                      {item.date && (
                        <small>
                          Updated{" "}
                          {formatShortDate(
                            item.date
                          )}
                        </small>
                      )}
                    </div>
                  )
                )}
              </div>
            </section>
          )}
        </div>

        {/* FOOTER */}

        <div className="pmt-details-modal-footer">
          <button
            type="button"
            className="pmt-details-modal-close-btn"
            onClick={onClose}
          >
            Close
          </button>

          {canManage && (
            <button
              type="button"
              className="pmt-details-modal-manage-btn"
              onClick={onManage}
            >
              <WalletCards size={15} />
              Manage Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({
  label,
  value,
  highlight = false,
}) {
  return (
    <div className="pmt-modal-detail">
      <span>{label}</span>

      <strong
        className={
          highlight
            ? "pmt-modal-highlight"
            : ""
        }
      >
        {value || "—"}
      </strong>
    </div>
  );
}

/* ============================================================
   TIMELINE ITEM
============================================================ */

function TimelineItem({
  title,
  text,
  complete = false,
}) {
  return (
    <div
      className={`pmt-modal-timeline-item${
        complete
          ? " pmt-modal-timeline-complete"
          : ""
      }`}
    >
      <div className="pmt-modal-timeline-marker">
        {complete ? (
          <Check size={11} />
        ) : (
          <span />
        )}
      </div>

      <div className="pmt-modal-timeline-content">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

/* ============================================================
   MANAGE PAYMENT MODAL
   Similar flow to Admin Monthly Billing:
   - total due
   - amount paid
   - balance
   - payment method
   - expected payment date
   - automatic status
   - reset / cancel / save
============================================================ */

const PAYMENT_METHODS = [
  "Cash",
  "UPI",
  "PhonePe",
  "Google Pay",
  "Bank Transfer",
];

function PaymentManagementModal({
  payment,
  onClose,
  onSave,
}) {
  const [amountPaid, setAmountPaid] = useState(
    String(payment.paidAmount ?? 0)
  );

  const [method, setMethod] = useState(
    payment.method ?? PAYMENT_METHODS[0]
  );

  const [dueDate, setDueDate] = useState(
    payment.dueDate ?? ""
  );

  const [reason, setReason] = useState("");

  if (!payment) return null;

  const totalAmount = Number(
    payment.amount || 0
  );

  const enteredAmount = Math.min(
    Math.max(Number(amountPaid || 0), 0),
    totalAmount
  );

  const outstandingAmount = Math.max(
    totalAmount - enteredAmount,
    0
  );

  const calculatedStatus = calculateStatus({
    paidAmount: enteredAmount,
    totalAmount,
    dueDate,
  });

  const isRescheduled =
    dueDate !== (payment.dueDate ?? "") &&
    enteredAmount < totalAmount &&
    Boolean(dueDate);

  const previewStatus = isRescheduled
    ? STATUS.RESCHEDULED
    : calculatedStatus;

  const handleAmountChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setAmountPaid("");
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
    setAmountPaid(
      String(totalAmount)
    );
  };

  const handleReset = () => {
    setAmountPaid(
      String(payment.paidAmount ?? 0)
    );

    setMethod(
      payment.method ??
        PAYMENT_METHODS[0]
    );

    setDueDate(
      payment.dueDate ?? ""
    );

    setReason("");
  };

  const handleSave = () => {
    const calculatedStatus = calculateStatus({
      paidAmount: enteredAmount,
      totalAmount,
      dueDate,
    });

    const nextStatus =
      dueDate !== (payment.dueDate ?? "") &&
      enteredAmount < totalAmount &&
      Boolean(dueDate)
        ? STATUS.RESCHEDULED
        : calculatedStatus;

    const today =
      getTodayISO();

    const dueDateChanged =
      dueDate !==
      (payment.dueDate ?? "");

    let nextRescheduleHistory = [
      ...(payment.rescheduleHistory ??
        []),
    ];

    if (
      dueDateChanged &&
      dueDate
    ) {
      nextRescheduleHistory.push({
        from: payment.dueDate,
        to: dueDate,
        reason:
          reason ||
          "Payment date updated",
        date: today,
      });
    }

    onSave({
      ...payment,

      paidAmount: enteredAmount,

      outstanding:
        outstandingAmount,

      amount: totalAmount,

      interestDue:
        payment.interestDue,

      dueDate:
        dueDate || null,

      paymentDate:
        enteredAmount > 0
          ? payment.paymentDate ||
            today
          : null,

      method:
        enteredAmount > 0
          ? method
          : null,

      status: nextStatus,

      rescheduleHistory:
        nextRescheduleHistory,
    });
  };

  const statusText =
    previewStatus === STATUS.SUCCESS
      ? "Full payment has been received. No outstanding balance remains."
      : previewStatus === STATUS.PARTIAL
      ? `${formatCurrency(
          outstandingAmount
        )} remains to be collected.`
      : previewStatus === STATUS.OVERDUE
      ? "The payment date has passed and there is still an outstanding balance."
      : previewStatus === STATUS.RESCHEDULED
      ? "Payment has been moved to the new expected date."
      : "No payment has been recorded yet.";

  return (
    <div
      className="pmt-manage-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="pmt-manage-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-manage-title"
      >

        {/* HEADER */}

        <div className="pmt-manage-modal-header">
          <div className="pmt-manage-modal-title">
            <div className="pmt-manage-modal-icon">
              <WalletCards size={19} />
            </div>

            <div>
              <span>
                PAYMENT MANAGEMENT
              </span>

              <h2 id="payment-manage-title">
                Manage Payment
              </h2>

              <p>
                {payment.id} •{" "}
                {payment.loanId}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="pmt-manage-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}

        <div className="pmt-manage-modal-body">

          {/* CUSTOMER */}

          <div className="pmt-manage-customer">
            <div className="pmt-avatar pmt-avatar--large">
              {(
                payment.customerName ||
                "?"
              )
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <span>
                CUSTOMER
              </span>

              <strong>
                {payment.customerName}
              </strong>

              <small>
                {payment.customerId} •{" "}
                {payment.loanId}
              </small>
            </div>

            <StatusBadge
              status={previewStatus}
            />
          </div>

          {/* SUMMARY */}

          <div className="pmt-manage-summary">
            <div>
              <span>Total Due</span>
              <strong>
                {formatCurrency(
                  totalAmount
                )}
              </strong>
            </div>

            <div className="is-collected">
              <span>Amount Paid</span>
              <strong>
                {formatCurrency(
                  enteredAmount
                )}
              </strong>
            </div>

            <div className="is-outstanding">
              <span>Balance</span>
              <strong>
                {formatCurrency(
                  outstandingAmount
                )}
              </strong>
            </div>
          </div>

          {/* PAYMENT DETAILS */}

          <section className="pmt-manage-section">
            <div className="pmt-manage-section-heading">
              <div>
                <h3>
                  Payment Details
                </h3>

                <p>
                  Enter the amount actually
                  received from the customer.
                </p>
              </div>

              <button
                type="button"
                className="pmt-manage-full-btn"
                onClick={
                  handleFullPayment
                }
              >
                Mark Full Payment
              </button>
            </div>

            {/* AMOUNT */}

            <div className="pmt-manage-field">
              <label htmlFor="payment-amount">
                Amount Paid
              </label>

              <div className="pmt-currency-input">
                <IndianRupee size={17} />

                <input
                  id="payment-amount"
                  type="number"
                  min="0"
                  max={totalAmount}
                  step="1"
                  value={amountPaid}
                  onChange={
                    handleAmountChange
                  }
                  placeholder="Enter amount paid"
                />
              </div>

              <small>
                Maximum payable amount:{" "}
                {formatCurrency(
                  totalAmount
                )}
              </small>
            </div>

            {/* METHOD */}

            {enteredAmount > 0 && (
              <div className="pmt-manage-field">
                <label>
                  Payment Method
                </label>

                <div className="pmt-method-grid">
                  {PAYMENT_METHODS.map(
                    (paymentMethod) => (
                      <button
                        key={paymentMethod}
                        type="button"
                        className={`pmt-method-option${
                          method ===
                          paymentMethod
                            ? " is-active"
                            : ""
                        }`}
                        onClick={() =>
                          setMethod(
                            paymentMethod
                          )
                        }
                      >
                        {paymentMethod}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </section>

          {/* RESCHEDULE */}

          <section className="pmt-manage-section">
            <div className="pmt-manage-section-heading">
              <div>
                <h3>
                  Reschedule Payment
                </h3>

                <p>
                  Set a new expected payment
                  date if the balance will be
                  collected later.
                </p>
              </div>

              <CalendarClock
                size={19}
              />
            </div>

            <div className="pmt-manage-field">
              <label htmlFor="payment-due-date">
                Expected Payment Date
              </label>

              <div className="pmt-date-input">
                <Calendar
                  size={17}
                />

                <input
                  id="payment-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value
                    )
                  }
                />
              </div>

              {dueDate && (
                <small>
                  Payment expected by{" "}
                  <strong>
                    {formatShortDate(
                      dueDate
                    )}
                  </strong>
                </small>
              )}
            </div>

            {dueDate !==
              (payment.dueDate ?? "") && (
              <div className="pmt-manage-field">
                <label htmlFor="reschedule-reason">
                  Reason
                </label>

                <textarea
                  id="reschedule-reason"
                  rows={2}
                  value={reason}
                  onChange={(event) =>
                    setReason(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Customer requested extra time"
                />
              </div>
            )}
          </section>

          {/* LIVE STATUS */}

          <div
            className={`pmt-manage-result pmt-manage-result--${previewStatus}`}
          >
            <div className="pmt-manage-result-icon">
              {previewStatus ===
              STATUS.SUCCESS ? (
                <Check size={18} />
              ) : previewStatus ===
                STATUS.OVERDUE ? (
                <AlertCircle
                  size={18}
                />
              ) : (
                <Clock size={18} />
              )}
            </div>

            <div>
              <span>
                Automatic Settlement Status
              </span>

              <strong>
                {STATUS_LABEL[
                  previewStatus
                ]}
              </strong>

              <small>
                {statusText}
              </small>
            </div>
          </div>
        </div>

        {/* FOOTER */}

        <div className="pmt-manage-modal-footer">
          <button
            type="button"
            className="pmt-manage-reset-btn"
            onClick={handleReset}
          >
            <RotateCcw size={15} />
            Reset
          </button>

          <div>
            <button
              type="button"
              className="pmt-manage-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="button"
              className="pmt-manage-save-btn"
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