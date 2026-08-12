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
} from "lucide-react";
import "./Payments.css";

/* ============================================================
   NORMALIZATION LAYER
   The backend response shape can vary (loanId/loan_id, camel
   or snake case, nested customer objects, etc). Every record
   is passed through normalizePayment() so the rest of the UI
   only ever deals with one consistent shape.
   ============================================================ */

const STATUS = {
  SUCCESS: "success",
  PENDING: "pending",
  OVERDUE: "overdue",
  RESCHEDULED: "rescheduled",
};

const STATUS_LABEL = {
  [STATUS.SUCCESS]: "Success",
  [STATUS.PENDING]: "Pending",
  [STATUS.OVERDUE]: "Overdue",
  [STATUS.RESCHEDULED]: "Rescheduled",
};

function toISODate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function normalizePayment(raw) {
  const dueDate =
    toISODate(raw.dueDate ?? raw.due_date ?? raw.interestDueDate) ?? null;
  const paymentDate =
    toISODate(raw.paymentDate ?? raw.payment_date ?? raw.paidOn) ?? null;

  const customer =
    typeof raw.customer === "object" && raw.customer !== null
      ? raw.customer
      : { name: raw.customer, id: raw.customerId };

  const rawStatus = (raw.status ?? raw.paymentStatus ?? "pending")
    .toString()
    .toLowerCase();

  const status = Object.values(STATUS).includes(rawStatus)
    ? rawStatus
    : STATUS.PENDING;

  return {
    id: raw.id ?? raw.paymentId ?? `${raw.loanId}-${dueDate}`,
    loanId: raw.loanId ?? raw.loan_id,
    customerId: raw.customerId ?? raw.customer_id ?? customer?.id,
    customerName: raw.customer ?? customer?.name ?? "Unknown customer",
    interestDue: Number(raw.interestDue ?? raw.interest_due ?? raw.amount ?? 0),
    amount: Number(raw.amount ?? raw.interestDue ?? raw.interest_due ?? 0),
    outstanding: Number(raw.outstanding ?? 0),
    dueDate,
    paymentDate,
    method: raw.method ?? raw.paymentMethod ?? null,
    status,
    paymentHistory: raw.paymentHistory ?? raw.payments ?? [],
    rescheduleHistory: raw.rescheduleHistory ?? [],
  };
}

/* ============================================================
   DEMO SEED DATA
   Stands in for a real backend response. Dates are generated
   relative to "today" so the date grouping always demonstrates
   correctly regardless of when this file is run. Replace
   `initialData` prop with your live backend payload — nothing
   else in this file needs to change.
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
      dueDate: iso(1),
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
      dueDate: iso(3),
      status: STATUS.RESCHEDULED,
      method: null,
      rescheduleHistory: [
        { from: iso(-2), to: iso(3), reason: "Customer travelling", date: iso(-2) },
      ],
    },
  ];
}

/* ============================================================
   SMALL HELPERS
   ============================================================ */

function formatCurrency(value) {
  const n = Number(value) || 0;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatDueDateLabel(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
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

function isSameMonth(isoDate, ref) {
  if (!isoDate) return false;
  const d = new Date(isoDate + "T00:00:00");
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: STATUS.SUCCESS, label: "Success" },
  { key: STATUS.PENDING, label: "Pending" },
  { key: STATUS.OVERDUE, label: "Overdue" },
  { key: STATUS.RESCHEDULED, label: "Rescheduled" },
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function Payments({ initialData }) {
  const [payments, setPayments] = useState(() =>
    (initialData ?? buildSeedData()).map(normalizePayment)
  );
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
const [viewPayment, setViewPayment] = useState(null);
  const [recordModal, setRecordModal] = useState(null); // payment object
  const [rescheduleModal, setRescheduleModal] = useState(null); // payment object

  /* ------------------------- summary cards ------------------------- */

  const summary = useMemo(() => {
    const now = new Date();
    let totalCollected = 0;
    let thisMonth = 0;
    let pendingCollection = 0;
    let overdueCollection = 0;

    payments.forEach((p) => {
      if (p.status === STATUS.SUCCESS) {
        totalCollected += p.amount;
        if (isSameMonth(p.paymentDate, now)) thisMonth += p.amount;
      } else if (p.status === STATUS.PENDING) {
        pendingCollection += p.amount;
      } else if (p.status === STATUS.OVERDUE) {
        overdueCollection += p.amount;
      }
    });

    return { totalCollected, thisMonth, pendingCollection, overdueCollection };
  }, [payments]);

  /* ------------------------- status counts ------------------------- */

  const statusCounts = useMemo(() => {
    const counts = { all: payments.length };
    Object.values(STATUS).forEach((s) => {
      counts[s] = payments.filter((p) => p.status === s).length;
    });
    return counts;
  }, [payments]);

  /* ------------------------- filtering ------------------------- */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (dateFilter && p.dueDate !== dateFilter) return false;
      if (q) {
        const haystack = `${p.loanId} ${p.customerName} ${p.customerId}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [payments, search, dateFilter, statusFilter]);

  /* ------------------------- grouping by due date ------------------------- */

  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((p) => {
      const key = p.dueDate ?? "no-date";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(p);
    });

    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .map(([date, records]) => {
        const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
        const paid = records.filter((r) => r.status === STATUS.SUCCESS).length;
        const pending = records.filter((r) => r.status === STATUS.PENDING).length;
        const overdue = records.filter((r) => r.status === STATUS.OVERDUE).length;
        const rescheduled = records.filter((r) => r.status === STATUS.RESCHEDULED).length;
        return { date, records, totalAmount, paid, pending, overdue, rescheduled };
      });
  }, [filtered]);

  /* ------------------------- actions ------------------------- */

  const handleRecordPayment = useCallback((paymentId, method) => {
    const todayISO = toISODate(new Date());
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? { ...p, status: STATUS.SUCCESS, paymentDate: todayISO, method }
          : p
      )
    );
    setRecordModal(null);
  }, []);

  const handleReschedule = useCallback((paymentId, newDueDate, reason) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id !== paymentId) return p;
        const historyEntry = {
          from: p.dueDate,
          to: newDueDate,
          reason,
          date: toISODate(new Date()),
        };
        return {
          ...p,
          status: STATUS.RESCHEDULED,
          dueDate: newDueDate,
          rescheduleHistory: [...(p.rescheduleHistory ?? []), historyEntry],
        };
      })
    );
    setRescheduleModal(null);
  }, []);

  /* ------------------------- render ------------------------- */

  return (
    <div className="pmt-page">
      <header className="pmt-header">
        <h1 className="pmt-title">Payments &amp; Interest Schedule</h1>
        <p className="pmt-subtitle">
          Monitor collections, interest dues and payment transactions by date.
        </p>
      </header>
      <section className="pmt-cards" aria-label="Payment summary">
        <SummaryCard
          icon={<IndianRupee size={18} />}
          label="Total Collected"
          value={formatCurrency(summary.totalCollected)}
          tone="blue"
        />
        <SummaryCard
          icon={<Calendar size={18} />}
          label="This Month"
          value={formatCurrency(summary.thisMonth)}
          tone="green"
        />
        <SummaryCard
          icon={<Clock size={18} />}
          label="Pending Collection"
          value={formatCurrency(summary.pendingCollection)}
          tone="amber"
        />
        <SummaryCard
          icon={<RefreshCw size={18} />}
          label="Overdue Collection"
          value={formatCurrency(summary.overdueCollection)}
          tone="red"
        />
      </section>

      <section className="pmt-filters">
        <div className="pmt-search">
          <Search size={16} className="pmt-search-icon" />
          <input
            type="text"
            placeholder="Search loan ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="pmt-date-filter">
          <Calendar size={16} className="pmt-search-icon" />
          <input
            type="date"
            placeholder="dd-mm-yyyy"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </section>

      <nav className="pmt-status-filters" aria-label="Filter by status">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`pmt-status-chip${statusFilter === s.key ? " is-active" : ""}`}
            onClick={() => setStatusFilter(s.key)}
          >
            {s.label} <span className="pmt-status-count">{statusCounts[s.key] ?? 0}</span>
          </button>
        ))}
      </nav>

      <section className="pmt-activity">
        <div className="pmt-activity-header">
          <div>
            <h2>Payment Activity</h2>
            <p>Interest obligations and payment transactions grouped by due date</p>
          </div>
          <div className="pmt-activity-count">{filtered.length} records</div>
        </div>

        {groups.length === 0 && (
          <div className="pmt-empty">No payment records match the current filters.</div>
        )}

        {groups.map((group) => (
          <DateGroup
            key={group.date}
            group={group}
            onRecord={(p) => setRecordModal(p)}
            onReschedule={(p) => setRescheduleModal(p)}
              onView={(p) => setViewPayment(p)}
          />
        ))}
      </section>
{viewPayment && (
  <PaymentDetailsDrawer
    payment={viewPayment}
    onClose={() => setViewPayment(null)}
  />
)}
      {recordModal && (
        <RecordPaymentModal
          payment={recordModal}
          onClose={() => setRecordModal(null)}
          onConfirm={handleRecordPayment}
        />
      )}

      {rescheduleModal && (
        <RescheduleModal
          payment={rescheduleModal}
          onClose={() => setRescheduleModal(null)}
          onConfirm={handleReschedule}
        />
      )}
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
   ============================================================ */
function PaymentDetailsDrawer({ payment, onClose }) {
  const initials = (payment.customerName || "?")
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="pmt-details-modal-overlay"
      onClick={onClose}
    >
      <div
        className="pmt-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="pmt-details-modal-header">
          <div>
            <span className="pmt-details-modal-eyebrow">
              PAYMENT DETAILS
            </span>

            <h2>Payment Details</h2>

            <p>{payment.id}</p>
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

        {/* CONTENT */}
        <div className="pmt-details-modal-content">

          {/* SUCCESS SUMMARY */}
          <div className="pmt-payment-success-box">
            <div className="pmt-payment-success-icon">
              <Check size={21} />
            </div>

            <div className="pmt-payment-success-info">
              <strong>Payment Successful</strong>

              <span>
                {payment.paymentDate
                  ? formatDueDateLabel(payment.paymentDate)
                  : "Payment completed"}
              </span>
            </div>

            <div className="pmt-payment-success-amount">
              {formatCurrency(payment.amount)}
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

          {/* LOAN DETAILS */}
          <section className="pmt-modal-section">

            <div className="pmt-modal-section-title">
              Loan Details
            </div>

            <div className="pmt-modal-detail-grid">

              <div className="pmt-modal-detail">
                <span>Loan ID</span>
                <strong>{payment.loanId || "—"}</strong>
              </div>

              <div className="pmt-modal-detail">
                <span>Interest Due</span>
                <strong>
                  {formatCurrency(payment.interestDue)}
                </strong>
              </div>

              <div className="pmt-modal-detail">
                <span>Amount Paid</span>
                <strong className="pmt-modal-highlight">
                  {formatCurrency(payment.amount)}
                </strong>
              </div>

              <div className="pmt-modal-detail">
                <span>Payment Method</span>
                <strong>{payment.method || "—"}</strong>
              </div>

              <div className="pmt-modal-detail">
                <span>Due Date</span>
                <strong>
                  {payment.dueDate
                    ? formatDueDateLabel(payment.dueDate)
                    : "—"}
                </strong>
              </div>

              <div className="pmt-modal-detail">
                <span>Payment Date</span>
                <strong>
                  {payment.paymentDate
                    ? formatDueDateLabel(payment.paymentDate)
                    : "—"}
                </strong>
              </div>

            </div>

          </section>

          {/* STATUS */}
          <section className="pmt-modal-section">

            <div className="pmt-modal-section-title">
              Payment Status
            </div>

            <div className="pmt-modal-status-row">
              <span>Status</span>

              <StatusBadge status={payment.status} />
            </div>

          </section>

          {/* TIMELINE */}
          <section className="pmt-modal-section pmt-modal-timeline-section">

            <div className="pmt-modal-section-title">
              Payment Timeline
            </div>

            <div className="pmt-modal-timeline">

              <div className="pmt-modal-timeline-item">

                <div className="pmt-modal-timeline-marker">
                  <span />
                </div>

                <div className="pmt-modal-timeline-content">
                  <strong>Payment Due</strong>

                  <span>
                    {payment.dueDate
                      ? formatDueDateLabel(payment.dueDate)
                      : "—"}
                  </span>
                </div>

              </div>

              <div className="pmt-modal-timeline-item">

                <div className="pmt-modal-timeline-marker">
                  <span />
                </div>

                <div className="pmt-modal-timeline-content">
                  <strong>Payment Recorded</strong>

                  <span>
                    {payment.paymentDate
                      ? formatDueDateLabel(payment.paymentDate)
                      : "—"}

                    {payment.method
                      ? ` • ${payment.method}`
                      : ""}
                  </span>
                </div>

              </div>

              <div className="pmt-modal-timeline-item pmt-modal-timeline-complete">

                <div className="pmt-modal-timeline-marker">
                  <Check size={11} />
                </div>

                <div className="pmt-modal-timeline-content">
                  <strong>Payment Successful</strong>

                  <span>
                    {formatCurrency(payment.amount)} paid
                  </span>
                </div>

              </div>

            </div>

          </section>

          {/* RESCHEDULE HISTORY */}
          {payment.rescheduleHistory?.length > 0 && (
            <section className="pmt-modal-section">

              <div className="pmt-modal-section-title">
                Reschedule History
              </div>

              <div className="pmt-modal-history-list">

                {payment.rescheduleHistory.map(
                  (item, index) => (
                    <div
                      className="pmt-modal-history-item"
                      key={index}
                    >
                      <strong>
                        {item.from} → {item.to}
                      </strong>

                      {item.reason && (
                        <span>
                          {item.reason}
                        </span>
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

        </div>

      </div>
    </div>
  );
}
function DetailItem({ label, value, highlight = false }) {
  return (
    <div className="pmt-detail-item">
      <span>{label}</span>

      <strong className={highlight ? "is-highlight" : ""}>
        {value || "—"}
      </strong>
    </div>
  );
}

function SummaryCard({ icon, label, value, tone }) {
  return (
    <div className={`pmt-card pmt-card--${tone}`}>
      <div className="pmt-card-icon">{icon}</div>
      <div className="pmt-card-body">
        <span className="pmt-card-label">{label}</span>
        <span className="pmt-card-value">{value}</span>
      </div>
    </div>
  );
}

/* ============================================================
   DATE GROUP + TABLE
   ============================================================ */

function DateGroup({ group, onRecord, onReschedule, onView, }) {
  const { date, records, totalAmount, paid, pending, overdue, rescheduled } = group;

  const summaryParts = [
    `${records.length} payment${records.length === 1 ? "" : "s"}`,
    formatCurrency(totalAmount),
  ];
  if (paid) summaryParts.push(`${paid} paid`);
  if (pending) summaryParts.push(`${pending} pending`);
  if (overdue) summaryParts.push(`${overdue} overdue`);
  if (rescheduled) summaryParts.push(`${rescheduled} rescheduled`);

  return (
    <div className="pmt-date-group">
      <div className="pmt-date-group-header">
        <h3>{date === "no-date" ? "No due date" : formatDueDateLabel(date)}</h3>
        <span className="pmt-date-group-summary">{summaryParts.join(" • ")}</span>
      </div>

      <div className="pmt-table">
        <div className="pmt-table-head">
          <span>Customer</span>
          <span>Loan ID</span>
          <span>Interest</span>
          <span>Amount</span>
          <span>Method</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {records.map((p) => (
          <PaymentRow key={p.id} payment={p} onRecord={onRecord} onReschedule={onReschedule} onView={onView}/>
        ))}
      </div>
    </div>
  );
}

function PaymentRow({
  payment,
  onRecord,
  onReschedule,
  onView,
}) {
  const initials = (payment.customerName || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="pmt-table-row" data-label="Payment record">
      <span className="pmt-cell pmt-cell-customer" data-th="Customer">
        <span className="pmt-avatar">{initials}</span>
        <span className="pmt-customer-info">
          <span className="pmt-customer-name">{payment.customerName}</span>
          <span className="pmt-customer-id">{payment.customerId}</span>
        </span>
      </span>

      <span className="pmt-cell pmt-loan-id" data-th="Loan ID">
        {payment.loanId}
      </span>

      <span className="pmt-cell" data-th="Interest">
        <span className="pmt-amount">{formatCurrency(payment.interestDue)}</span>
        <span className="pmt-cell-caption">Interest</span>
      </span>

      <span className="pmt-cell" data-th="Amount">
        <span className="pmt-amount">{formatCurrency(payment.amount)}</span>
      </span>

      <span className="pmt-cell" data-th="Method">
        {payment.method ? (
          <span className="pmt-method-pill">{payment.method}</span>
        ) : (
          <span className="pmt-method-pill pmt-method-pill--empty">—</span>
        )}
      </span>

      <span className="pmt-cell" data-th="Status">
        <StatusBadge status={payment.status} />
      </span>

      <span className="pmt-cell pmt-cell-actions" data-th="Actions">
        {(payment.status === STATUS.PENDING || payment.status === STATUS.OVERDUE) && (
          <>
            <button className="pmt-action pmt-action--primary" onClick={() => onRecord(payment)}>
              <Check size={14} /> Record
            </button>
            <button className="pmt-action" onClick={() => onReschedule(payment)}>
              <CalendarClock size={14} />
            </button>
          </>
        )}
        {payment.status === STATUS.RESCHEDULED && (
          <>
            <button className="pmt-action pmt-action--primary" onClick={() => onRecord(payment)}>
              <Check size={14} /> Record
            </button>
            <button className="pmt-action" onClick={() => onReschedule(payment)}>
              <CalendarClock size={14} />
            </button>
          </>
        )}
{payment.status === STATUS.SUCCESS && (
  <button
    type="button"
    className="pmt-action pmt-view-action"
    onClick={() => onView(payment)}
  >
    <Eye size={14} />
    View
  </button>
)}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  return <span className={`pmt-badge pmt-badge--${status}`}>{STATUS_LABEL[status]}</span>;
}

/* ============================================================
   RECORD PAYMENT MODAL
   ============================================================ */

const METHODS = ["Cash", "UPI", "PhonePe", "Google Pay", "Bank Transfer"];

function RecordPaymentModal({ payment, onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1 = due, 2 = record, 3 = success
  const [method, setMethod] = useState(METHODS[0]);

  const handleConfirm = () => {
    setStep(3);
    setTimeout(() => onConfirm(payment.id, method), 550);
  };

  return (
    <div className="pmt-modal-overlay" onClick={onClose}>
      <div className="pmt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pmt-modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <ol className="pmt-steps">
          <li className={step >= 1 ? "is-active" : ""}>
            <span className="pmt-step-dot">1</span>Due
          </li>
          <li className={step >= 2 ? "is-active" : ""}>
            <span className="pmt-step-dot">2</span>Record Payment
          </li>
          <li className={step >= 3 ? "is-active" : ""}>
            <span className="pmt-step-dot">3</span>Success
          </li>
        </ol>

        {step === 1 && (
          <div className="pmt-modal-body">
            <h3>Payment due</h3>
            <p className="pmt-modal-line">
              <strong>{payment.customerName}</strong> ({payment.customerId})
            </p>
            <p className="pmt-modal-line">
              Loan <strong>{payment.loanId}</strong> — due{" "}
              {payment.dueDate ? formatDueDateLabel(payment.dueDate) : "—"}
            </p>
            <p className="pmt-modal-amount">{formatCurrency(payment.amount)}</p>
            <button className="pmt-modal-cta" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="pmt-modal-body">
            <h3>Record payment</h3>
            <p className="pmt-modal-line">Select the payment method used.</p>
            <div className="pmt-method-grid">
              {METHODS.map((m) => (
                <button
                  key={m}
                  className={`pmt-method-option${method === m ? " is-active" : ""}`}
                  onClick={() => setMethod(m)}
                  type="button"
                >
                  {m}
                </button>
              ))}
            </div>
            <button className="pmt-modal-cta" onClick={handleConfirm}>
              Confirm payment of {formatCurrency(payment.amount)}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="pmt-modal-body pmt-modal-body--success">
            <div className="pmt-success-icon">
              <Check size={28} />
            </div>
            <h3>Payment recorded</h3>
            <p className="pmt-modal-line">
              {formatCurrency(payment.amount)} marked as paid via {method}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   RESCHEDULE MODAL
   ============================================================ */

function RescheduleModal({ payment, onClose, onConfirm }) {
  const [newDate, setNewDate] = useState("");
  const [reason, setReason] = useState("");

  const canSubmit = Boolean(newDate);

  return (
    <div className="pmt-modal-overlay" onClick={onClose}>
      <div className="pmt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pmt-modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <div className="pmt-modal-body">
          <h3>Reschedule payment</h3>
          <p className="pmt-modal-line">
            <strong>{payment.customerName}</strong> — Loan {payment.loanId}
          </p>

          <label className="pmt-field">
            <span>Current due date</span>
            <input type="text" value={payment.dueDate ? formatDueDateLabel(payment.dueDate) : "—"} disabled />
          </label>

          <label className="pmt-field">
            <span>New due date</span>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </label>

          <label className="pmt-field">
            <span>Reason</span>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer requested extra time"
            />
          </label>

          <button
            className="pmt-modal-cta"
            disabled={!canSubmit}
            onClick={() => onConfirm(payment.id, newDate, reason)}
          >
            Confirm reschedule
          </button>
        </div>
      </div>
    </div>
  );
}