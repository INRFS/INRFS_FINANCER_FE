import React, { useMemo, useState } from 'react';
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
} from 'lucide-react';

import './AdminMonthlyBilling.css';
import {
  monthlyBillingData,
} from '../../data/mockAdminData';
/* =========================================================
   DEMO BILLING DATA

   Later this can be replaced with:
   import { monthlyBillingData } from '../../data/mockAdminData';

   Expected backend fields:

   financerId
   financerName
   billingMonth
   applicableInterest
   serviceChargePercentage
   serviceChargeAmount
   collectedAmount
   outstandingAmount
   settlementStatus
   invoiceNumber
========================================================= */

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


/* =========================================================
   BILLING DATA NORMALIZATION
   ========================================================= */

const normalizeBillingMonth = (value) => {
  if (!value) {
    return '';
  }

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

const initialBillingData = Array.isArray(monthlyBillingData)
  ? monthlyBillingData.map((item, index) => ({
      ...item,

      billingMonth: normalizeBillingMonth(
        item.billingMonth
      ),

      serviceChargeAmount: Number(
        item.serviceChargeAmount ??
          item.serviceCharge ??
          0
      ),

      collectedAmount: Number(
        item.collectedAmount ??
          item.amountCollected ??
          0
      ),

      outstandingAmount: Number(
        item.outstandingAmount ?? 0
      ),

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
    }))
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
   STATEMENT MODAL
========================================================= */

function BillingStatementModal({
  billing,
  onClose,
}) {
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
                {billing.invoiceNumber}
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
              {billing.financerId}
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
                {billing.serviceChargePercentage}%
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
            onClick={() => {
              window.alert(
                `Statement ${billing.invoiceNumber} would be downloaded here.`
              );
            }}
          >
            <Download size={15} />
            Download Statement
          </button>

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

  const handleMarkCollected = (
    billing
  ) => {
    setBillingData((current) =>
      current.map((item) => {
        if (
          item.invoiceNumber !==
          billing.invoiceNumber
        ) {
          return item;
        }

        return {
          ...item,
          collectedAmount:
            item.serviceChargeAmount,
          outstandingAmount: 0,
          settlementStatus: 'Paid',
        };
      })
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
            <h1>
              Monthly Billing
            </h1>

            <p>
              Manage financer-wise monthly statements,
              service charges and settlement status.
            </p>
          </div>

        </div>

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
                        key={
                          billing.invoiceNumber
                        }
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
                                  billing.financerId
                                }
                              </span>

                              <small>
                                {
                                  billing.invoiceNumber
                                }
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
                            {
                              billing.serviceChargePercentage
                            }%
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
                            >
                              <Eye size={15} />
                              View
                            </button>

                            <button
                              type="button"
                              className="inrfs-monthly-billing-download-icon-btn"
                              onClick={() =>
                                window.alert(
                                  `Statement ${billing.invoiceNumber} would be downloaded here.`
                                )
                              }
                              title="Download statement"
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
                    key={
                      billing.invoiceNumber
                    }
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
                              billing.financerId
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
                        Invoice
                      </span>

                      <strong>
                        {
                          billing.invoiceNumber
                        }
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
                          {
                            billing.serviceChargePercentage
                          }%
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
                        onClick={() =>
                          window.alert(
                            `Statement ${billing.invoiceNumber} would be downloaded here.`
                          )
                        }
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
            INRFS service charge is calculated
            using the applicable service-charge
            percentage against the customer's
            applicable interest for the billing month.
          </span>

        </div>

      </div>

      {/* =================================================
          STATEMENT MODAL
      ================================================== */}

      <BillingStatementModal
        billing={selectedBilling}
        onClose={() =>
          setSelectedBilling(null)
        }
      />

    </main>
  );
}