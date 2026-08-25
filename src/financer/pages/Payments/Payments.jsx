import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
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
import { platformApi, pageItems } from "../../../common/services/platformApi";
import { dateKeyInTimeZone, paymentReceivedAt, statusForDueDate } from "./paymentStatus";

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
  PARTIAL: "partial",
  DUE_TODAY: "due-today",
};

const STATUS_LABEL = {
  [STATUS.SUCCESS]: "Success",
  [STATUS.PENDING]: "Pending",
  [STATUS.OVERDUE]: "Overdue",
  [STATUS.RESCHEDULED]: "Rescheduled",
  [STATUS.PARTIAL]: "Partially paid",
  [STATUS.DUE_TODAY]: "Due Today",
};
function toISODate(value) {
  if (!value) return null;
  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4}-\d{2}-\d{2})(?:$|T)/)?.[1];
    if (dateOnly) return dateOnly;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return dateKeyInTimeZone(d);
}

function shortRecordId(value, prefix) {
  if (!value) return `${prefix}-NA`;
  const text = String(value).trim();
  if (/^[A-Z]{2,6}-[A-Z0-9-]{3,}$/i.test(text) && !/^[0-9a-f]{8}-/i.test(text)) return text.toUpperCase();
  return `${prefix}-${text.replaceAll('-', '').slice(-8).toUpperCase()}`;
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

  let status = rawStatus === 'paid' || rawStatus === 'completed'
    ? STATUS.SUCCESS
    : rawStatus === 'partiallypaid' ? STATUS.PARTIAL
      : rawStatus === 'upcoming' ? STATUS.PENDING
      : Object.values(STATUS).includes(rawStatus) ? rawStatus : STATUS.PENDING;
  status = statusForDueDate(status, dueDate);

  return {
    id: raw.id ?? raw.paymentId ?? `${raw.loanId}-${dueDate}`,
    loanId: raw.loanId ?? raw.loan_id,
    loanDisplayId: raw.loanNumber ?? raw.loan_number ?? shortRecordId(raw.loanId ?? raw.loan_id, 'LN'),
    customerId: raw.customerId ?? raw.customer_id ?? customer?.id,
    customerDisplayId: raw.customerNumber ?? raw.customer_number ?? customer?.customerNumber ?? shortRecordId(raw.customerId ?? raw.customer_id ?? customer?.id, 'CUS'),
    customerName: typeof raw.customer === 'string' ? raw.customer : customer?.name ?? "Unknown customer",
    interestDue: Number(raw.interestDue ?? raw.interest_due ?? 0),
    principalDue: Number(raw.principalDue ?? raw.principal_due ?? 0),
    totalDue: Number(raw.totalDue ?? raw.total_due ?? 0),
    amountPaid: Number(raw.amountPaid ?? raw.amount_paid ?? 0),
    amount: status === STATUS.SUCCESS
      ? Number(raw.amountPaid ?? raw.amount_paid ?? raw.amount ?? 0)
      : Number(raw.balance ?? raw.totalDue ?? raw.amount ?? 0),
    outstanding: Number(raw.balance ?? raw.outstanding ?? 0),
    loanOutstanding: Number(raw.loanOutstanding ?? raw.loan_outstanding ?? raw.balance ?? raw.outstanding ?? 0),
    loanStatus: raw.loanStatus ?? raw.loan_status ?? null,
    dueDate,
    paymentDate,
    method: raw.method ?? raw.mode ?? raw.paymentMethod
      ?? (status === STATUS.SUCCESS ? "Not recorded" : "Awaiting payment"),
    status,
    paymentHistory: raw.paymentHistory ?? raw.payments ?? [],
    rescheduleHistory: raw.rescheduleHistory ?? [],
  };
}

function shouldDisplayPayment(payment) {
  const hasFinancialActivity = payment.amount > 0 || payment.amountPaid > 0 || payment.totalDue > 0;
  if (!hasFinancialActivity) return false;
  const loanIsClosed = ['closed', 'settled', 'cancelled'].includes(String(payment.loanStatus || '').toLowerCase());
  return !loanIsClosed || payment.status === STATUS.SUCCESS;
}

/* ============================================================
   SMALL HELPERS
   ============================================================ */

function formatCurrency(value) {
  const n = Number(value) || 0;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
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
  // { key: "all", label: "All" },
  { key: STATUS.PENDING, label: "Upcoming" },
  { key: STATUS.DUE_TODAY, label: "Due Today" },
  { key: STATUS.OVERDUE, label: "Overdue" },
  { key: STATUS.RESCHEDULED, label: "Rescheduled" },
  { key: STATUS.PARTIAL, label: "Partially Paid" },
  { key: STATUS.SUCCESS, label: "Paid" },
];

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function Payments({ initialData }) {
  const [payments, setPayments] = useState(() => initialData ? initialData.map(normalizePayment).filter(shouldDisplayPayment) : []);
  const [loading, setLoading] = useState(!initialData);
  const [pageError, setPageError] = useState('');
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
 const [statusFilter, setStatusFilter] = useState(STATUS.PENDING);
const [viewPayment, setViewPayment] = useState(null);
  const [recordModal, setRecordModal] = useState(null); // payment object
  const [rescheduleModal, setRescheduleModal] = useState(null); // payment object

  const loadPayments = useCallback(async () => {
    if (initialData) return;
    setLoading(true);
    setPageError('');
    try {
      const [payload, customerPayload, loanPayload] = await Promise.all([
        platformApi.payments.allSchedules(),
        platformApi.customers.all(),
        platformApi.loans.all(),
      ]);
      const customersById = new Map(
        pageItems(customerPayload).map((customer) => [customer.id, customer])
      );
      const loansById = new Map(pageItems(loanPayload).map((loan) => [loan.id, loan]));
      setPayments(pageItems(payload)
        .map((payment) => {
          const loan = loansById.get(payment.loanId);
          return normalizePayment({
            ...payment,
            customer: payment.customer || customersById.get(payment.customerId)?.fullName || customersById.get(payment.customerId)?.name,
            customerNumber: payment.customerNumber || customersById.get(payment.customerId)?.customerNumber,
            loanNumber: payment.loanNumber || loan?.loanNumber,
            loanStatus: loan?.status,
            loanOutstanding: Number(loan?.principalOutstanding || 0) + Number(loan?.interestOutstanding || 0) + Number(loan?.feesOutstanding || 0),
          });
        })
        .filter(shouldDisplayPayment));
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

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
        const haystack = `${p.loanId} ${p.loanDisplayId} ${p.customerName} ${p.customerId} ${p.customerDisplayId}`.toLowerCase();
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

  const handleRecordPayment = useCallback(async (paymentId, details) => {
    const scheduled = payments.find((item) => item.id === paymentId);
    if (!scheduled) return;
    try {
      await platformApi.payments.record({
        loanId: scheduled.loanId,
        paymentScheduleId: details.paymentType === 'FullSettlement' ? null : scheduled.id,
        amount: Number(details.amount),
        receivedAt: paymentReceivedAt(details.paymentDate),
        mode: details.method,
        externalReference: details.reference || null,
        notes: details.notes || null,
        paymentType: details.paymentType,
      });
      await loadPayments();
    } catch (error) {
      const message = error.message;
      setPageError(message);
      await loadPayments().catch(() => {});
      throw new Error(message);
    }
  }, [loadPayments, payments]);

  const handleReschedule = useCallback(async (paymentId, newDueDate, reason) => {
    try {
      await platformApi.payments.reschedule(paymentId, { newDueDate, reason });
      setRescheduleModal(null);
      await loadPayments();
    } catch (error) {
      setPageError(error.message);
    }
  }, [loadPayments]);

  /* ------------------------- render ------------------------- */

  return (
    <div className="pmt-page">
      {pageError && <div role="alert">{pageError} <button type="button" onClick={loadPayments}>Retry</button></div>}
      {loading && <p aria-live="polite">Loading payment schedules...</p>}
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
                  {payment.customerDisplayId}
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
                <strong>{payment.loanDisplayId || "—"}</strong>
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
function _DetailItem({ label, value, highlight = false }) {
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
          <span className="pmt-customer-id" title={payment.customerId}>{payment.customerDisplayId}</span>
        </span>
      </span>

      <span className="pmt-cell pmt-loan-id" data-th="Loan ID">
        <span title={payment.loanId}>{payment.loanDisplayId}</span>
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
        {(payment.status === STATUS.PENDING || payment.status === STATUS.DUE_TODAY || payment.status === STATUS.PARTIAL || payment.status === STATUS.OVERDUE) && (
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

const METHODS = ["Cash", "Upi", "BankTransfer", "Cheque", "Card", "Other"];

function RecordPaymentModal({ payment, onClose, onConfirm }) {
  const [step, setStep] = useState(1); // 1 = due, 2 = record, 3 = success
  const [method, setMethod] = useState(METHODS[0]);
  const [amount, setAmount] = useState(String(Math.max(0, payment.interestDue - Math.min(payment.interestDue, payment.amountPaid))));
  const [paymentDate, setPaymentDate] = useState(() => dateKeyInTimeZone());
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false);
  const [submitError, setSubmitError] = useState('');
  const [paymentType, setPaymentType] = useState('InterestOnly');
  const [settlementQuote, setSettlementQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const interestMaximum = Math.max(0, payment.interestDue - Math.min(payment.interestDue, payment.amountPaid));
  const maximum = paymentType === 'FullSettlement' ? Number(settlementQuote?.settlementAmount || 0)
    : paymentType === 'InterestOnly' ? interestMaximum : Math.max(payment.amount, payment.loanOutstanding);

  const customerInitial = (payment.customerName || 'C').trim().charAt(0).toUpperCase() || 'C';

  useEffect(() => {
    if (paymentType !== 'FullSettlement') return;
    let active = true;
    setQuoteLoading(true);
    setSubmitError('');
    platformApi.payments.settlementQuote(payment.loanId, paymentDate)
      .then((quote) => { if (active) { setSettlementQuote(quote); setAmount(String(quote.settlementAmount)); } })
      .catch((error) => { if (active) { setSettlementQuote(null); setAmount(''); setSubmitError(error.message); } })
      .finally(() => { if (active) setQuoteLoading(false); });
    return () => { active = false; };
  }, [payment.loanId, paymentDate, paymentType]);

  const selectPaymentType = (type) => {
    setPaymentType(type);
    setSettlementQuote(null);
    if (type === 'InterestOnly') setAmount(String(interestMaximum));
    if (type === 'Regular') setAmount(String(Math.max(payment.amount, payment.loanOutstanding)));
    if (type === 'FullSettlement') setAmount('');
  };

  const handleConfirm = async () => {
    if (submitLock.current || Number(amount) <= 0 || Number(amount) > maximum || quoteLoading) return;
    submitLock.current = true;
    setSubmitting(true);
    setSubmitError('');
    try {
      await onConfirm(payment.id, { amount, paymentDate, method, reference, notes, paymentType });
      setStep(3);
      window.setTimeout(onClose, 900);
    } catch (error) {
      setSubmitError(error.message || 'Payment could not be recorded. Please try again.');
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  const remainingAfterPayment = Math.max(0, maximum - (Number(amount) || 0));

  return (
    <div className="pmt-modal-overlay" onClick={onClose}>
      <div className="pmt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pmt-modal-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        <ol className="pmt-steps">
          <li className={`pmt-step-item ${step >= 1 ? "is-active" : ""} ${step > 1 ? "is-complete" : ""}`}>
            <span className="pmt-step-dot">{step > 1 ? <Check size={12} strokeWidth={3} /> : "1"}</span>
            <span className="pmt-step-label">Due</span>
          </li>
          <div className={`pmt-step-connector ${step >= 2 ? "is-active" : ""}`} />
          <li className={`pmt-step-item ${step >= 2 ? "is-active" : ""} ${step > 2 ? "is-complete" : ""}`}>
            <span className="pmt-step-dot">{step > 2 ? <Check size={12} strokeWidth={3} /> : "2"}</span>
            <span className="pmt-step-label">Record Payment</span>
          </li>
          <div className={`pmt-step-connector ${step >= 3 ? "is-active" : ""}`} />
          <li className={`pmt-step-item ${step >= 3 ? "is-active" : ""}`}>
            <span className="pmt-step-dot">3</span>
            <span className="pmt-step-label">Success</span>
          </li>
        </ol>

        {step === 1 && (
          <div className="pmt-modal-body pmt-modal-body--card">
            <div className="pmt-modal-header-block">
              <h3 className="pmt-modal-heading">Payment Due</h3>
              <p className="pmt-modal-subheading">Review the payment details before recording.</p>
            </div>

            <div className="pmt-customer-summary-card">
              <div className="pmt-customer-card-header">
                <div className="pmt-customer-card-avatar">{customerInitial}</div>
                <div className="pmt-customer-card-info">
                  <strong className="pmt-customer-card-name">{payment.customerName || "Customer"}</strong>
                  <span className="pmt-customer-card-id">{payment.customerDisplayId || "—"}</span>
                </div>
              </div>

              <div className="pmt-customer-card-divider" />

              <div className="pmt-customer-card-grid">
                <div className="pmt-customer-card-meta">
                  <span className="pmt-card-meta-label">Loan</span>
                  <strong className="pmt-card-meta-val">{payment.loanDisplayId || "—"}</strong>
                </div>
                <div className="pmt-customer-card-meta pmt-customer-card-meta--right">
                  <span className="pmt-card-meta-label">Due Date</span>
                  <strong className="pmt-card-meta-val">
                    {payment.dueDate ? formatDueDateLabel(payment.dueDate) : "—"}
                  </strong>
                </div>
              </div>
            </div>

            <div className="pmt-amount-due-card">
              <span className="pmt-amount-due-label">Amount Due</span>
              <span className="pmt-amount-due-val">{formatCurrency(payment.amount)}</span>
            </div>

            <button type="button" className="pmt-modal-cta" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="pmt-modal-body pmt-modal-body--card">
            <div className="pmt-modal-header-block">
              <h3 className="pmt-modal-heading">Record Payment</h3>
              <p className="pmt-modal-subheading">Enter payment details and payment method.</p>
            </div>

            <div className="pmt-compact-context-card">
              <div className="pmt-compact-avatar">{customerInitial}</div>
              <div className="pmt-compact-info">
                <strong className="pmt-compact-name">{payment.customerName}</strong>
                <span className="pmt-compact-sub">
                  Loan <strong>{payment.loanDisplayId}</strong> · Due {payment.dueDate ? formatDueDateLabel(payment.dueDate) : "—"}
                </span>
              </div>
              <div className="pmt-compact-due">
                <span>Due</span>
                <strong>{formatCurrency(payment.amount)}</strong>
              </div>
            </div>

            <div className="pmt-payment-types" role="group" aria-label="Payment type">
              <button type="button" className={paymentType === 'InterestOnly' ? 'is-active' : ''} onClick={() => selectPaymentType('InterestOnly')}>Interest Payment</button>
              <button type="button" className={paymentType === 'Regular' ? 'is-active' : ''} onClick={() => selectPaymentType('Regular')}>Regular Payment</button>
              <button type="button" className={paymentType === 'FullSettlement' ? 'is-active' : ''} onClick={() => selectPaymentType('FullSettlement')}>Full Settlement</button>
            </div>

            {paymentType === 'InterestOnly' && <p className="pmt-type-hint">Pay partial or full interest. Principal will not be reduced.</p>}
            {paymentType === 'Regular' && <p className="pmt-type-hint">Payment is applied to fees and interest first, then principal.</p>}
            {paymentType === 'FullSettlement' && settlementQuote && (
              <div className="pmt-settlement-quote">
                <div><span>Principal outstanding</span><strong>{formatCurrency(settlementQuote.principalOutstanding)}</strong></div>
                <div><span>Accrued interest</span><strong>{formatCurrency(settlementQuote.accruedInterest)}</strong></div>
                <div><span>Fees</span><strong>{formatCurrency(settlementQuote.feesOutstanding)}</strong></div>
                <div><span>Future interest waived</span><strong>-{formatCurrency(settlementQuote.futureInterestWaived)}</strong></div>
                <div className="pmt-settlement-total"><span>Settlement amount</span><strong>{formatCurrency(settlementQuote.settlementAmount)}</strong></div>
              </div>
            )}

            <div className="pmt-form-section">
              <label className="pmt-field">
                <span>Amount received</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={maximum}
                  value={amount}
                  readOnly={paymentType === 'FullSettlement'}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>

              <div className="pmt-partial-summary" role="status">
                <strong>{paymentType === 'FullSettlement' ? 'Settlement' : 'Payment'}</strong>
                <span>{paymentType === 'FullSettlement' && !settlementQuote ? (quoteLoading ? 'Calculating…' : 'Quote unavailable') : `Maximum allowed: ${formatCurrency(maximum)}`}</span>
              </div>

              {remainingAfterPayment > 0 && (
                <div className="pmt-partial-summary" role="status">
                  <strong>Partial payment</strong>
                  <span>{formatCurrency(remainingAfterPayment)} will remain outstanding.</span>
                </div>
              )}

              <label className="pmt-field">
                <span>Payment date</span>
                <input
                  type="date"
                  max={dateKeyInTimeZone()}
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                />
              </label>

              <div className="pmt-field-group">
                <span className="pmt-field-label">Payment method</span>
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
              </div>

              <label className="pmt-field">
                <span>Reference number (optional)</span>
                <input
                  value={reference}
                  placeholder="e.g. UPI Ref / Cheque No."
                  onChange={(event) => setReference(event.target.value)}
                />
              </label>

              <label className="pmt-field">
                <span>Note (optional)</span>
                <textarea
                  rows={2}
                  value={notes}
                  placeholder="Add note..."
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
            </div>

            {submitError && <p className="pmt-submit-error" role="alert">{submitError}</p>}

            <div className="pmt-modal-button-row">
              <button type="button" className="pmt-modal-btn-secondary" onClick={() => setStep(1)}>
                Back
              </button>
              <button
                type="button"
                className="pmt-modal-cta"
                disabled={submitting || quoteLoading || Number(amount) <= 0 || Number(amount) > maximum}
                onClick={handleConfirm}
              >
                {submitting ? 'Recording…' : paymentType === 'FullSettlement' ? `Settle for ${formatCurrency(amount)}` : `Record ${formatCurrency(amount)}`}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="pmt-modal-body pmt-modal-body--success">
            <div className="pmt-success-badge">
              <Check size={32} strokeWidth={2.5} />
            </div>

            <h3 className="pmt-success-title">Payment Recorded Successfully</h3>
            <p className="pmt-success-subtitle">
              The payment has been recorded and the loan account has been updated.
            </p>

            <div className="pmt-success-details-card">
              <div className="pmt-success-row">
                <span className="pmt-success-row-label">Customer</span>
                <strong className="pmt-success-row-value">{payment.customerName}</strong>
              </div>
              <div className="pmt-success-row">
                <span className="pmt-success-row-label">Loan</span>
                <strong className="pmt-success-row-value">{payment.loanDisplayId}</strong>
              </div>
              <div className="pmt-success-row">
                <span className="pmt-success-row-label">Amount Paid</span>
                <strong className="pmt-success-row-value pmt-success-amount-val">{formatCurrency(amount)}</strong>
              </div>
              <div className="pmt-success-row">
                <span className="pmt-success-row-label">Method</span>
                <strong className="pmt-success-row-value">{method}</strong>
              </div>
            </div>

            <button type="button" className="pmt-modal-cta" onClick={onClose}>
              Done
            </button>
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
            <strong>{payment.customerName}</strong> — Loan {payment.loanDisplayId}
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
