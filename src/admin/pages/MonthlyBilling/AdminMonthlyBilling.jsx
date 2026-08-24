import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  IndianRupee,
  ReceiptIndianRupee,
  WalletCards,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Search,
  Eye,
  Download,
  CircleDollarSign,
  X,
  FileText,
  Plus,
} from 'lucide-react';

import './AdminMonthlyBilling.css';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import { getCurrentBillingCycle, groupMonthlyBilling, normalizeBillingInvoice } from './monthlyBillingGroups';

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
  if (!value) {
    return '—';
  }

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
  if (!value) {
    return '—';
  }

  const [year, month] = value.split('-');

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

const downloadBillingStatement = (billing, documentType = 'invoice') => {
  const money = (value) => `INR ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const lineItemLines = (billing.items || []).flatMap((item, index) => [
    `${index + 1}. ${item.invoiceNumber}: interest ${money(item.applicableInterest)}, charge ${money(item.serviceChargeAmount)}`,
    `   collected ${money(item.collectedAmount)}, outstanding ${money(item.outstandingAmount)}`,
  ]);
  const invoiceLines = [
    'INRFS FINANCER PLATFORM', 'DEMO / NOT A TAX INVOICE', '',
    `Statement number: ${billing.invoiceNumber}`, `Bill to: ${billing.financerName}`,
    `Billing period: ${billing.periodStart} to ${billing.periodEnd}`,
    `Invoice due date: ${billing.dueDate}`, '',
    'CHARGE DETAILS', `Applicable interest: ${money(billing.applicableInterest)}`,
    `Platform fee rate: ${billing.serviceChargePercentage}%`,
    `Total platform fee billed: ${money(billing.serviceChargeAmount)}`, '',
    `Amount received to date: ${money(billing.collectedAmount)}`,
    `Amount currently due: ${money(billing.outstandingAmount)}`,
    `Statement status: ${billing.settlementStatus}`, '', 'INVOICE LINE ITEMS', ...lineItemLines, '',
    'This document states the platform fee billed for the period.',
  ];
  const receiptLines = [
    'INRFS FINANCER PLATFORM', 'DEMO PAYMENT RECEIPT', '',
    `Receipt for invoice: ${billing.invoiceNumber}`, `Received from: ${billing.financerName}`,
    `Payment amount: ${money(billing.latestCollectionAmount ?? billing.collectedAmount)}`,
    `Payment date: ${billing.latestCollectionAt ? new Date(billing.latestCollectionAt).toLocaleString('en-IN') : 'Not available for historical collection'}`,
    `Payment reference: ${billing.latestCollectionReference || 'Not available for historical collection'}`, '',
    `Total invoice amount: ${money(billing.serviceChargeAmount)}`,
    `Total received to date: ${money(billing.collectedAmount)}`,
    `Remaining balance: ${money(billing.outstandingAmount)}`,
    `Settlement status: ${billing.settlementStatus}`, '',
    'This receipt acknowledges a platform-fee payment received.',
  ];
  const lines = [...(documentType === 'receipt' ? receiptLines : invoiceLines), '',
    'Demo issuer: INRFS Demo Operations', 'Address / GST / tax details: BUSINESS CONFIRMATION REQUIRED'];
  const escapePdf = (value) => value.replace(/[^\x20-\x7E]/g, '?').replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
  const stream = `BT /F1 12 Tf 52 790 Td ${lines.map((line, index) => `${index ? '0 -24 Td ' : ''}(${escapePdf(line)}) Tj`).join(' ')} ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n `).join('\n')}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${billing.invoiceNumber || 'billing-statement'}-${documentType}-DEMO.pdf`;
  link.click();
  URL.revokeObjectURL(url);
};


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
   STATEMENT MODAL
========================================================= */

function BillingStatementModal({
  billing,
  onClose,
  onCollect,
  onCredit,
}) {
  const [reference, setReference] = useState('');
  const [collecting, setCollecting] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  if (!billing) {
    return null;
  }

  const statusConfig =
    getSettlementConfig(
      billing.settlementStatus
    );

  const StatusIcon =
    statusConfig.icon;

  return (
    <div
      className="inrfs-monthly-billing-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="inrfs-monthly-billing-modal">

        <div className="inrfs-monthly-billing-modal-header">

          <div className="inrfs-monthly-billing-modal-title">

            <div className="inrfs-monthly-billing-modal-icon">
              <FileText size={20} />
            </div>

            <div>
              <h2>Monthly Statement</h2>

              <p>
                {billing.invoiceNumber} · {billing.items.length} invoice line {billing.items.length === 1 ? 'item' : 'items'}
              </p>
            </div>

          </div>

          <button
            type="button"
            className="inrfs-monthly-billing-modal-close"
            onClick={onClose}
            aria-label="Close statement"
          >
            <X size={18} />
          </button>

        </div>

        <div className="inrfs-monthly-billing-statement-body">

          <div className="inrfs-monthly-billing-statement-financer">

            <span>FINANCER</span>

            <strong>
              {billing.financerName}
            </strong>

            <small>
              {billing.financerNumber}
            </small>

          </div>

          <div className="inrfs-monthly-billing-statement-period">

            <div>
              <span>Billing Month</span>
              <strong>
                {formatMonth(
                  billing.billingMonth
                )}
              </strong>
            </div>

            <div>
              <span>Settlement Status</span>

              <strong
                className={`inrfs-monthly-billing-status ${statusConfig.className}`}
              >
                <StatusIcon size={14} />
                {billing.settlementStatus}
              </strong>
            </div>

          </div>

          <div className="inrfs-monthly-billing-statement-grid">

            <div>
              <span>Applicable Interest</span>

              <strong>
                {formatCurrency(
                  billing.applicableInterest
                )}
              </strong>
            </div>

            <div>
              <span>Service Charge</span>

              <strong>
                {billing.serviceChargePercentage == null ? 'Mixed rates' : `${billing.serviceChargePercentage}%`}
              </strong>
            </div>

            <div>
              <span>INRFS Service Charge</span>

              <strong>
                {formatCurrency(
                  billing.serviceChargeAmount
                )}
              </strong>
            </div>

            <div>
              <span>Collected Amount</span>

              <strong>
                {formatCurrency(
                  billing.collectedAmount
                )}
              </strong>
            </div>

            <div>
              <span>Outstanding Amount</span>

              <strong>
                {formatCurrency(
                  billing.outstandingAmount
                )}
              </strong>
            </div>

          </div>

          <div className="inrfs-monthly-billing-statement-total">

            <span>
              Total Service Charge
            </span>

            <strong>
              {formatCurrency(
                billing.serviceChargeAmount
              )}
            </strong>

          </div>

          <section className="inrfs-monthly-billing-line-items">
            <div className="inrfs-monthly-billing-line-items-heading">
              <strong>Invoice line items</strong>
              <span>{billing.items.length} record{billing.items.length === 1 ? '' : 's'}</span>
            </div>
            {billing.items.map((item) => (
              <div className="inrfs-monthly-billing-line-item" key={item.id}>
                <div><strong>{item.invoiceNumber}</strong><span>Due {item.dueDate}</span></div>
                <div><span>Interest</span><strong>{formatCurrency(item.applicableInterest)}</strong></div>
                <div><span>Charge</span><strong>{formatCurrency(item.serviceChargeAmount)}</strong></div>
                <div><span>Collected</span><strong>{formatCurrency(item.collectedAmount)}</strong></div>
                <div><span>Outstanding</span><strong>{formatCurrency(item.outstandingAmount)}</strong></div>
              </div>
            ))}
          </section>

        </div>

        <div className="inrfs-monthly-billing-modal-footer">

          <button
            type="button"
            className="inrfs-monthly-billing-secondary-btn"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="inrfs-monthly-billing-download-btn"
            onClick={() => downloadBillingStatement(billing)}
          >
            <Download size={15} />
            Download Invoice
          </button>
          {billing.collectedAmount > 0 && <button type="button" className="inrfs-monthly-billing-download-btn" onClick={() => downloadBillingStatement(billing, 'receipt')}><ReceiptIndianRupee size={15} />Download Payment Receipt</button>}

          {billing.outstandingAmount > 0 && (
            <form onSubmit={async (event) => {
              event.preventDefault();
              setCollecting(true);
              try {
                await onCollect(billing, reference.trim());
              } finally {
                setCollecting(false);
              }
            }}>
              <label>
                Payment reference
                <input value={reference} onChange={(event) => setReference(event.target.value)} required />
              </label>
              <button type="submit" disabled={collecting} className="inrfs-monthly-billing-download-btn">
                {collecting ? 'Saving…' : `Collect ${formatCurrency(billing.outstandingAmount)}`}
              </button>
            </form>
          )}
          {billing.serviceChargeAmount > billing.collectedAmount && <form onSubmit={async (event) => {
            event.preventDefault(); setCollecting(true);
            try { await onCredit(billing, Number(creditAmount), creditReason.trim()); }
            finally { setCollecting(false); }
          }}>
            <label>Credit-note amount<input type="number" min="0.01" step="0.01" max={billing.outstandingAmount} value={creditAmount} onChange={(event) => setCreditAmount(event.target.value)} required /></label>
            <label>Adjustment reason<input value={creditReason} onChange={(event) => setCreditReason(event.target.value)} maxLength="300" required /></label>
            <button type="submit" disabled={collecting} className="inrfs-monthly-billing-secondary-btn">Issue Credit Note</button>
          </form>}

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AdminMonthlyBilling() {
  const [billingData, setBillingData] =
    useState([]);
  const [pageError, setPageError] = useState('');
  const [pageSuccess, setPageSuccess] = useState('');
  const [generating, setGenerating] = useState(false);
  const generationInFlight = useRef(false);

  const loadBilling = async () => {
    const [payload, financerPayload] = await Promise.all([platformApi.admin.allBilling(), platformApi.admin.allFinancers()]);
    const byId = new Map(pageItems(financerPayload).map((item) => [item.id, item]));
    const invoices = pageItems(payload).map((item) => normalizeBillingInvoice(item, byId.get(item.financerId)));
    setBillingData(groupMonthlyBilling(invoices));
  };

  const [selectedMonth, setSelectedMonth] =
    useState(() =>
      'All'
    );

  const generateCurrentMonth = async () => {
    if (generationInFlight.current) return;
    generationInFlight.current = true;
    setGenerating(true); setPageError(''); setPageSuccess('');
    try {
      const financers = await platformApi.admin.allFinancers().then(pageItems);
      const cycle = getCurrentBillingCycle();
      const cycleMonth = cycle.periodEnd.slice(0, 7);
      const activeFinancers = financers.filter((item) => {
        if (item.status !== 'Active') return false;
        const sameMonthItems = billingData
          .filter((statement) => statement.financerId === item.id && statement.billingMonth === cycleMonth)
          .flatMap((statement) => statement.items);
        return sameMonthItems.length === 0 || sameMonthItems.some((invoice) => invoice.periodStart === cycle.periodStart && invoice.periodEnd === cycle.periodEnd);
      });
      const results = await Promise.allSettled(activeFinancers.map((item) => platformApi.admin.generateInvoice({ financerId: item.id, ...cycle })));
      const failed = results.filter((result) => result.status === 'rejected');
      if (failed.length) {
        const reason = failed[0]?.reason?.message || '';
        const message = reason.includes('already exists')
            ? 'A current-month statement already exists. Restart the API to enable statement recalculation.'
            : reason || `${failed.length} invoice(s) could not be generated.`;
        setPageError(message);
      }
      const updated = results.filter((result) => result.status === 'fulfilled');
      if (updated.length) {
        const interest = updated.reduce((total, result) => total + Number(result.value?.interestActivity || 0), 0);
        setPageSuccess(`${updated.length} statement${updated.length === 1 ? '' : 's'} refreshed for the current cycle ending ${cycle.periodEnd}, with ${formatCurrency(interest)} applicable interest.`);
      } else if (!failed.length) {
        setPageSuccess(`The current cycle ending ${cycle.periodEnd} already has statements. No duplicate statements were generated.`);
      }
      await loadBilling();
    } catch (error) { setPageError(error.message); }
    finally { generationInFlight.current = false; setGenerating(false); }
  };

  const generateCurrentMonthRef = useRef(generateCurrentMonth);
  generateCurrentMonthRef.current = generateCurrentMonth;

  useEffect(() => {
    let active = true;
    const syncCurrentCycle = () => {
      if (!active) return;
      generateCurrentMonthRef.current();
    };
    syncCurrentCycle();
    window.addEventListener('focus', syncCurrentCycle);
    return () => {
      active = false;
      window.removeEventListener('focus', syncCurrentCycle);
    };
  }, []);

  const [search, setSearch] =
    useState('');

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
        item.billingMonth ===
          selectedMonth;

      const matchesStatus =
        statusFilter === 'All' ||
        item.settlementStatus ===
          statusFilter;

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
          item.settlementStatus ===
          'Paid'
      ).length;

    const pendingCount =
      filteredBilling.filter(
        (item) =>
          item.settlementStatus ===
          'Pending'
      ).length;

    const overdueCount =
      filteredBilling.filter(
        (item) =>
          item.settlementStatus ===
          'Overdue'
      ).length;

    return {
      totalServiceCharges,
      totalCollected,
      totalOutstanding,
      totalInterest,
      paidCount,
      pendingCount,
      overdueCount,
    };
  }, [filteredBilling]);

  /* =======================================================
     MARK AS COLLECTED
  ======================================================= */

  const handleCollect = async (billing, reference) => {
    setPageError('');
    setPageSuccess('');
    try {
      const outstandingItems = billing.items.filter((item) => item.outstandingAmount > 0);
      for (const item of outstandingItems) {
        await platformApi.admin.collectInvoice(item.id, { amount: item.outstandingAmount, reference });
      }
      await loadBilling();
      setPageSuccess(`Payment of ${formatCurrency(billing.outstandingAmount)} recorded for ${billing.invoiceNumber}.`);
      setSelectedBilling(null);
    } catch (error) {
      setPageError(error.message);
      await loadBilling().catch(() => {});
      setSelectedBilling(null);
      throw error;
    }
  };

  const handleCredit = async (billing, creditAmount, reason) => {
    setPageError('');
    try {
      let remaining = creditAmount;
      for (const item of billing.items.filter((entry) => entry.outstandingAmount > 0)) {
        if (remaining <= 0) break;
        const allocated = Math.min(remaining, item.outstandingAmount);
        await platformApi.admin.creditInvoice(item.id, { creditAmount: allocated, reason });
        remaining = Math.round((remaining - allocated) * 100) / 100;
      }
      await loadBilling();
      setSelectedBilling(null);
    } catch (error) {
      setPageError(error.message);
      await loadBilling().catch(() => {});
      setSelectedBilling(null);
      throw error;
    }
  };

  return (
    <main className="inrfs-monthly-billing-page">
      {(pageError || pageSuccess) && (
        <div
          className={`inrfs-monthly-billing-feedback ${pageError ? 'is-error' : 'is-success'}`}
          role={pageError ? 'alert' : 'status'}
        >
          {pageError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <div>
            <strong>{pageError ? 'Statement not generated' : 'Billing updated'}</strong>
            <span>{pageError || pageSuccess}</span>
          </div>

          <button type="button" onClick={() => { setPageError(''); setPageSuccess(''); }} aria-label="Close notification">
            <X size={18} />
          </button>
        </div>
      )}

      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <header className="inrfs-monthly-billing-header">

        <div className="inrfs-monthly-billing-header-copy">

          <div className="inrfs-monthly-billing-title-icon">
            <CalendarDays size={22} />
          </div>

          <div>
            <h1>
              Monthly Billing
            </h1>

            <p>
              Manage financer-wise monthly statements,
              service charges and settlement status.
            </p>
          </div>

        </div>

        <button type="button" className="inrfs-monthly-billing-generate" onClick={generateCurrentMonth} disabled={generating}>
          <Plus size={18} />
          {generating ? 'Refreshing…' : 'Refresh Current Cycle'}
        </button>

        <div className="inrfs-monthly-billing-header-month">

          <CalendarDays size={16} />

          <select
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(
                event.target.value
              )
            }
          >

            <option value="All">
              All Billing Months
            </option>

            {monthOptions.map(
              (month) => (
                <option
                  key={month}
                  value={month}
                >
                  {formatMonth(month)}
                </option>
              )
            )}

          </select>

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
          description="Pending collection"
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
            <h2>
              Settlement Overview
            </h2>

            <p>
              Current billing status for the
              selected period.
            </p>
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
          BILLING TABLE CARD
      ================================================== */}

      <section className="inrfs-monthly-billing-card">

        <div className="inrfs-monthly-billing-card-header">

          <div>
            <h2>
              Financer Monthly Statements
            </h2>

            <p>
              View and manage monthly billing
              statements for each financer.
            </p>
          </div>

          <span className="inrfs-monthly-billing-count">
            {filteredBilling.length} statements
          </span>

        </div>

        {/* =================================================
            FILTER BAR
        ================================================== */}

        <div className="inrfs-monthly-billing-filter-bar">

          <div className="inrfs-monthly-billing-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search financer or invoice..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch('')
                }
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}

          </div>

          <select
            className="inrfs-monthly-billing-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="All">
              All Settlement Statuses
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Partially Paid">
              Partially Paid
            </option>

            <option value="Overdue">
              Overdue
            </option>

          </select>

        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================== */}

        <div className="inrfs-monthly-billing-table-wrap">

          <table className="inrfs-monthly-billing-table">

            <thead>

              <tr>

                <th>
                  FINANCER
                </th>

                <th>
                  BILLING MONTH
                </th>

                <th>
                  APPLICABLE INTEREST
                </th>

                <th>
                  SERVICE CHARGE
                </th>

                <th>
                  INRFS CHARGE
                </th>

                <th>
                  COLLECTED
                </th>

                <th>
                  OUTSTANDING
                </th>

                <th>
                  SETTLEMENT
                </th>

                <th>
                  ACTIONS
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredBilling.length > 0 ? (

                filteredBilling.map(
                  (billing) => {

                    const statusConfig =
                      getSettlementConfig(
                        billing.settlementStatus
                      );

                    const StatusIcon =
                      statusConfig.icon;

                    return (
                      <tr
                        key={billing.groupKey}
                      >

                        {/* FINANCER */}

                        <td>

                          <div className="inrfs-monthly-billing-financer-cell">

                            <div className="inrfs-monthly-billing-financer-avatar">
                              <WalletCards
                                size={17}
                              />
                            </div>

                            <div>
                              <strong>
                                {
                                  billing.financerName
                                }
                              </strong>

                              <span>
                                {
                                  billing.financerNumber
                                }
                              </span>

                              <small>
                                {billing.items.length} invoice line {billing.items.length === 1 ? 'item' : 'items'}
                              </small>
                            </div>

                          </div>

                        </td>

                        {/* MONTH */}

                        <td>

                          <div className="inrfs-monthly-billing-month-cell">

                            <CalendarDays
                              size={15}
                            />

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

                        {/* SERVICE CHARGE % */}

                        <td>

                          <span className="inrfs-monthly-billing-percentage">
                            {billing.serviceChargePercentage == null ? 'Mixed' : `${billing.serviceChargePercentage}%`}
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

                        {/* COLLECTED */}

                        <td>

                          <strong className="inrfs-monthly-billing-collected-value">
                            {formatCurrency(
                              billing.collectedAmount
                            )}
                          </strong>

                        </td>

                        {/* OUTSTANDING */}

                        <td>

                          <strong
                            className={
                              billing.outstandingAmount >
                              0
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

                            <StatusIcon
                              size={13}
                            />

                            {
                              billing.settlementStatus
                            }

                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td>

                          <div className="inrfs-monthly-billing-row-actions">

                            <button
                              type="button"
                              className="inrfs-monthly-billing-view-btn"
                              onClick={() =>
                                setSelectedBilling(
                                  billing
                                )
                              }
                              title="View statement"
                              aria-label="View statement"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              className="inrfs-monthly-billing-download-icon-btn"
                              onClick={() => downloadBillingStatement(billing)}
                              title="Download statement"
                              aria-label="Download statement"
                            >
                              <Download
                                size={15}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="inrfs-monthly-billing-empty"
                  >

                    <FileText size={32} />

                    <strong>
                      No billing statements found
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

            filteredBilling.map(
              (billing) => {

                const statusConfig =
                  getSettlementConfig(
                    billing.settlementStatus
                  );

                const StatusIcon =
                  statusConfig.icon;

                return (
                  <article
                    key={billing.groupKey}
                    className="inrfs-monthly-billing-mobile-card"
                  >

                    <div className="inrfs-monthly-billing-mobile-top">

                      <div className="inrfs-monthly-billing-financer-cell">

                        <div className="inrfs-monthly-billing-financer-avatar">
                          <WalletCards
                            size={17}
                          />
                        </div>

                        <div>
                          <strong>
                            {
                              billing.financerName
                            }
                          </strong>

                          <span>
                            {
                              billing.financerNumber
                            }
                          </span>
                        </div>

                      </div>

                      <span
                        className={`inrfs-monthly-billing-status ${statusConfig.className}`}
                      >
                        <StatusIcon size={13} />
                        {
                          billing.settlementStatus
                        }
                      </span>

                    </div>

                    <div className="inrfs-monthly-billing-mobile-invoice">

                      <span>
                        Statement
                      </span>

                      <strong>
                        {billing.items.length} invoice line {billing.items.length === 1 ? 'item' : 'items'}
                      </strong>

                    </div>

                    <div className="inrfs-monthly-billing-mobile-grid">

                      <div>
                        <span>
                          Billing Month
                        </span>

                        <strong>
                          {formatMonth(
                            billing.billingMonth
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Service Charge
                        </span>

                        <strong>
                          {billing.serviceChargePercentage == null ? 'Mixed rates' : `${billing.serviceChargePercentage}%`}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Applicable Interest
                        </span>

                        <strong>
                          {formatCurrency(
                            billing.applicableInterest
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          INRFS Charge
                        </span>

                        <strong>
                          {formatCurrency(
                            billing.serviceChargeAmount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Collected
                        </span>

                        <strong className="is-collected">
                          {formatCurrency(
                            billing.collectedAmount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Outstanding
                        </span>

                        <strong
                          className={
                            billing.outstandingAmount >
                            0
                              ? 'is-outstanding'
                              : 'is-zero'
                          }
                        >
                          {formatCurrency(
                            billing.outstandingAmount
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className="inrfs-monthly-billing-mobile-actions">

                      <button
                        type="button"
                        className="inrfs-monthly-billing-view-btn"
                        onClick={() =>
                          setSelectedBilling(
                            billing
                          )
                        }
                      >
                        <Eye size={15} />
                        View Statement
                      </button>

                      <button
                        type="button"
                        className="inrfs-monthly-billing-download-icon-btn"
                        onClick={() => downloadBillingStatement(billing)}
                      >
                        <Download size={15} />
                      </button>

                    </div>

                  </article>
                );
              }
            )

          ) : (

            <div className="inrfs-monthly-billing-mobile-empty">

              <FileText size={30} />

              <strong>
                No billing statements found
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
            Monthly billing calculation
          </strong>

          <span>
            Each billing cycle runs from the 26th through the 25th and closes
            automatically on the 25th. The INRFS service charge is calculated
            against interest collected during that cycle.
          </span>

        </div>

      </div>

      {/* =================================================
          STATEMENT MODAL
      ================================================== */}

      <BillingStatementModal
        billing={selectedBilling}
        onCollect={handleCollect}
        onCredit={handleCredit}
        onClose={() =>
          setSelectedBilling(null)
        }
      />

    </main>
  );
}
