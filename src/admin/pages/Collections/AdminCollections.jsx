import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownToLine,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  IndianRupee,
  RefreshCw,
  Search,
  WalletCards,
  X,
} from 'lucide-react';

import { collectionsData } from '../../data/mockAdminData';
import { formatCurrency } from '../../../common/utils/formatters';

import './AdminCollections.css';

/* =========================================================
   HELPERS
========================================================= */

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const getMonthKey = (value) => {
  const date =
    value instanceof Date
      ? value
      : parseDate(value);

  if (!date) return '';

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;
};

const formatMonth = (value) => {
  if (!value) return '—';

  const [year, month] =
    value.split('-');

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString(
    'en-IN',
    {
      month: 'long',
      year: 'numeric',
    }
  );
};

const formatDate = (value) => {
  const date = parseDate(value);

  if (!date) return '—';

  return date.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  );
};

const getStatus = (collection) => {
  const expected = Number(
    collection.expectedAmount ??
      collection.amountDue ??
      collection.monthlyAmount ??
      collection.amountCollected ??
      0
  );

  const collected = Number(
    collection.amountCollected ??
      collection.collectedAmount ??
      0
  );

  const balance = Math.max(
    expected - collected,
    0
  );

  if (
    expected > 0 &&
    balance <= 0
  ) {
    return 'Paid';
  }

  if (
    collected > 0 &&
    balance > 0
  ) {
    return 'Partially Paid';
  }

  const dueDate =
    parseDate(
      collection.dueDate ??
        collection.collectionDate
    );

  if (
    dueDate &&
    dueDate < new Date() &&
    balance > 0
  ) {
    return 'Overdue';
  }

  return (
    collection.collectionStatus ||
    collection.settlementStatus ||
    'Pending'
  );
};

const getExpectedAmount = (
  collection
) =>
  Number(
    collection.expectedAmount ??
      collection.amountDue ??
      collection.monthlyAmount ??
      collection.amountCollected ??
      0
  );

const getCollectedAmount = (
  collection
) =>
  Number(
    collection.amountCollected ??
      collection.collectedAmount ??
      collection.paidAmount ??
      0
  );

const getBalance = (collection) =>
  Math.max(
    getExpectedAmount(collection) -
      getCollectedAmount(collection),
    0
  );

const getProgress = (collection) => {
  const expected =
    getExpectedAmount(collection);

  const collected =
    getCollectedAmount(collection);

  if (!expected) return 0;

  return Math.min(
    Math.round(
      (collected / expected) * 100
    ),
    100
  );
};

const getStatusClass = (status) => {
  switch (
    String(status || '')
      .toLowerCase()
  ) {
    case 'paid':
    case 'collected':
    case 'settled':
    case 'completed':
      return 'is-paid';

    case 'partially paid':
    case 'partial':
      return 'is-partial';

    case 'overdue':
    case 'failed':
      return 'is-overdue';

    default:
      return 'is-pending';
  }
};

const StatusBadge = ({ status }) => {
  const normalized =
    String(status || 'Pending');

  const statusClass =
    getStatusClass(normalized);

  const Icon =
    statusClass === 'is-paid'
      ? CheckCircle2
      : statusClass === 'is-overdue'
      ? AlertCircle
      : Clock3;

  return (
    <span
      className={`collections-status ${statusClass}`}
    >
      <Icon size={13} />

      {normalized}
    </span>
  );
};

/* =========================================================
   PROGRESS
========================================================= */

const CollectionProgress = ({
  collection,
}) => {
  const expected =
    getExpectedAmount(collection);

  const collected =
    getCollectedAmount(collection);

  const balance =
    getBalance(collection);

  const progress =
    getProgress(collection);

  return (
    <div className="collections-progress">
      <div className="collections-progress-header">
        <span>
          {formatCurrency(collected)}
        </span>

        <strong>
          {progress}%
        </strong>
      </div>

      <div className="collections-progress-track">
        <div
          className="collections-progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="collections-progress-footer">
        <span>
          Due {formatCurrency(expected)}
        </span>

        <strong>
          {balance > 0
            ? `${formatCurrency(
                balance
              )} balance`
            : 'Fully paid'}
        </strong>
      </div>
    </div>
  );
};

/* =========================================================
   COLLECTION NORMALIZATION
========================================================= */

const normalizeCollections = (
  records
) => {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.map(
    (item, index) => {
      const expected =
        getExpectedAmount(item);

      const collected =
        getCollectedAmount(item);

      const balance =
        Math.max(
          expected - collected,
          Number(
            item.outstandingAmount || 0
          )
        );

      const status =
        getStatus({
          ...item,
          expectedAmount: expected,
          amountCollected: collected,
        });

      return {
        ...item,

        collectionId:
          item.collectionId ||
          `COL-${String(
            index + 1
          ).padStart(4, '0')}`,

        customerName:
          item.customerName ||
          'Unknown Customer',

        customerId:
          item.customerId ||
          '—',

        financerName:
          item.financerName ||
          'Unknown Financer',

        financerId:
          item.financerId ||
          '—',

        loanId:
          item.loanId ||
          '—',

        expectedAmount:
          expected,

        amountCollected:
          collected,

        outstandingAmount:
          balance,

        dueDate:
          item.dueDate ||
          item.collectionDate,

        collectionStatus:
          status,

        settlementStatus:
          item.settlementStatus ||
          status,

        recurring:
          item.recurring ??
          item.isRecurring ??
          true,

        paymentFrequency:
          item.paymentFrequency ||
          'Monthly',

        dueDay:
          item.dueDay ||
          parseDate(
            item.dueDate ||
              item.collectionDate
          )?.getDate() ||
          '—',
      };
    }
  );
};

/* =========================================================
   DETAIL MODAL
========================================================= */

function CollectionDetails({
  collection,
  onClose,
}) {
  if (!collection) {
    return null;
  }

  const expected =
    getExpectedAmount(collection);

  const collected =
    getCollectedAmount(collection);

  const balance =
    getBalance(collection);

  const progress =
    getProgress(collection);

  const status =
    collection.collectionStatus ||
    getStatus(collection);

  const paymentHistory =
    Array.isArray(
      collection.paymentHistory
    )
      ? collection.paymentHistory
      : [];

  return (
    <div
      className="collections-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <aside className="collections-modal">
        <header className="collections-modal-header">
          <div className="collections-modal-heading">
            <div className="collections-modal-icon">
              <WalletCards size={20} />
            </div>

            <div>
              <span>
                COLLECTION DETAILS
              </span>

              <h2>
                {collection.customerName}
              </h2>

              <small>
                {collection.collectionId}
              </small>
            </div>
          </div>

          <button
            type="button"
            className="collections-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="collections-modal-body">
          <div className="collections-detail-top">
            <div>
              <span>Current Status</span>

              <StatusBadge
                status={status}
              />
            </div>

            <div>
              <span>Billing Cycle</span>

              <strong>
                {collection.paymentFrequency ||
                  'Monthly'}
              </strong>
            </div>
          </div>

          <section className="collections-detail-progress">
            <div className="collections-detail-progress-heading">
              <div>
                <span>
                  Collection Progress
                </span>

                <strong>
                  {progress}%
                </strong>
              </div>
            </div>

            <CollectionProgress
              collection={
                collection
              }
            />
          </section>

          <section className="collections-detail-money">
            <div>
              <span>Total Due</span>

              <strong>
                {formatCurrency(
                  expected
                )}
              </strong>
            </div>

            <div className="is-paid">
              <span>Collected</span>

              <strong>
                {formatCurrency(
                  collected
                )}
              </strong>
            </div>

            <div className="is-balance">
              <span>Balance</span>

              <strong>
                {formatCurrency(
                  balance
                )}
              </strong>
            </div>
          </section>

          <section className="collections-detail-grid">
            <div>
              <span>
                Customer ID
              </span>

              <strong>
                {collection.customerId}
              </strong>
            </div>

            <div>
              <span>
                Financer
              </span>

              <strong>
                {collection.financerName}
              </strong>
            </div>

            <div>
              <span>
                Financer ID
              </span>

              <strong>
                {collection.financerId}
              </strong>
            </div>

            <div>
              <span>
                Loan ID
              </span>

              <strong>
                {collection.loanId}
              </strong>
            </div>

            <div>
              <span>
                Due Date
              </span>

              <strong>
                {formatDate(
                  collection.dueDate
                )}
              </strong>
            </div>

            <div>
              <span>
                Collection Date
              </span>

              <strong>
                {formatDate(
                  collection.collectionDate
                )}
              </strong>
            </div>

            <div>
              <span>
                Payment Method
              </span>

              <strong>
                {collection.paymentMethod ||
                  '—'}
              </strong>
            </div>

            <div>
              <span>
                Payment Reference
              </span>

              <strong>
                {collection.paymentReference ||
                  collection.referenceNumber ||
                  '—'}
              </strong>
            </div>
          </section>

          <section className="collections-next-payment">
            <div className="collections-next-payment-icon">
              <CalendarDays size={17} />
            </div>

            <div>
              <span>
                NEXT COLLECTION
              </span>

              <strong>
                {collection.nextCollectionDate
                  ? formatDate(
                      collection.nextCollectionDate
                    )
                  : 'Next monthly cycle'}
              </strong>

              <small>
                {collection.recurring
                  ? 'Recurring monthly collection'
                  : 'One-time collection'}
              </small>
            </div>
          </section>

          {paymentHistory.length > 0 && (
            <section className="collections-payment-history">
              <div className="collections-history-heading">
                <div>
                  <span>
                    PAYMENT HISTORY
                  </span>

                  <strong>
                    {paymentHistory.length}{' '}
                    payments
                  </strong>
                </div>
              </div>

              <div className="collections-history-list">
                {paymentHistory.map(
                  (
                    payment,
                    index
                  ) => (
                    <div
                      key={
                        payment.id ||
                        index
                      }
                      className="collections-history-row"
                    >
                      <div>
                        <strong>
                          {formatDate(
                            payment.date
                          )}
                        </strong>

                        <span>
                          {payment.method ||
                            payment.paymentMethod ||
                            'Payment'}
                        </span>
                      </div>

                      <strong>
                        {formatCurrency(
                          payment.amount
                        )}
                      </strong>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          {collection.notes && (
            <section className="collections-notes">
              <span>NOTES</span>

              <p>
                {collection.notes}
              </p>
            </section>
          )}
        </div>

        <footer className="collections-modal-footer">
          <button
            type="button"
            className="collections-modal-secondary"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </aside>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AdminCollections = () => {
  const collectionRecords =
    useMemo(
      () =>
        normalizeCollections(
          collectionsData
        ),
      []
    );

  const currentMonth =
    getMonthKey(new Date());

  const [selectedMonth, setSelectedMonth] =
    useState(currentMonth);

  const [searchTerm, setSearchTerm] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [financerFilter, setFinancerFilter] =
    useState('All');

  const [selectedCollection, setSelectedCollection] =
    useState(null);

  /* =======================================================
     MONTH OPTIONS
  ======================================================= */

  const monthOptions = useMemo(() => {
    const months = new Set();

    collectionRecords.forEach(
      (item) => {
        const month =
          getMonthKey(
            item.dueDate ||
              item.collectionDate
          );

        if (month) {
          months.add(month);
        }
      }
    );

    months.add(currentMonth);

    const currentDate =
      new Date();

    for (
      let i = 0;
      i < 12;
      i += 1
    ) {
      const date =
        new Date(currentDate);

      date.setMonth(
        date.getMonth() - i
      );

      months.add(
        getMonthKey(date)
      );
    }

    return Array.from(months)
      .filter(Boolean)
      .sort()
      .reverse();
  }, [
    collectionRecords,
    currentMonth,
  ]);

  /* =======================================================
     FINANCERS
  ======================================================= */

  const financerOptions =
    useMemo(() => {
      const map = new Map();

      collectionRecords.forEach(
        (item) => {
          if (
            item.financerId
          ) {
            map.set(
              item.financerId,
              item.financerName
            );
          }
        }
      );

      return Array.from(
        map.entries()
      ).map(
        ([id, name]) => ({
          id,
          name,
        })
      );
    }, [
      collectionRecords,
    ]);

  /* =======================================================
     FILTERED COLLECTIONS
  ======================================================= */

  const filteredCollections =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return collectionRecords.filter(
        (collection) => {
          const date =
            collection.dueDate ||
            collection.collectionDate;

          const collectionMonth =
            getMonthKey(date);

          const searchable =
            [
              collection.collectionId,
              collection.customerName,
              collection.customerId,
              collection.financerName,
              collection.financerId,
              collection.loanId,
              collection.referenceNumber,
              collection.paymentReference,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();

          const matchesSearch =
            !search ||
            searchable.includes(
              search
            );

          const matchesMonth =
            selectedMonth ===
              'All' ||
            collectionMonth ===
              selectedMonth;

          const matchesStatus =
            statusFilter ===
              'All' ||
            collection.collectionStatus ===
              statusFilter ||
            collection.settlementStatus ===
              statusFilter;

          const matchesFinancer =
            financerFilter ===
              'All' ||
            collection.financerId ===
              financerFilter;

          return (
            matchesSearch &&
            matchesMonth &&
            matchesStatus &&
            matchesFinancer
          );
        }
      );
    }, [
      collectionRecords,
      searchTerm,
      selectedMonth,
      statusFilter,
      financerFilter,
    ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    return filteredCollections.reduce(
      (result, collection) => {
        result.expected +=
          getExpectedAmount(
            collection
          );

        result.collected +=
          getCollectedAmount(
            collection
          );

        result.outstanding +=
          getBalance(
            collection
          );

        const status =
          collection.collectionStatus;

        if (
          status === 'Paid' ||
          status === 'Collected' ||
          status === 'Settled'
        ) {
          result.paid += 1;
        }

        if (
          status ===
          'Partially Paid'
        ) {
          result.partial += 1;
        }

        if (
          status === 'Pending'
        ) {
          result.pending += 1;
        }

        if (
          status === 'Overdue'
        ) {
          result.overdue += 1;
        }

        return result;
      },
      {
        expected: 0,
        collected: 0,
        outstanding: 0,
        paid: 0,
        partial: 0,
        pending: 0,
        overdue: 0,
      }
    );
  }, [
    filteredCollections,
  ]);

  const collectionProgress =
    summary.expected > 0
      ? Math.min(
          Math.round(
            (summary.collected /
              summary.expected) *
              100
          ),
          100
        )
      : 0;

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  const navigateMonth = (
    direction
  ) => {
    const [year, month] =
      selectedMonth.split('-');

    const date = new Date(
      Number(year),
      Number(month) - 1,
      1
    );

    date.setMonth(
      date.getMonth() +
        direction
    );

    setSelectedMonth(
      getMonthKey(date)
    );
  };

  /* =======================================================
     EXPORT
  ======================================================= */

  const handleExport = () => {
    const headers = [
      'Collection ID',
      'Customer',
      'Customer ID',
      'Financer',
      'Financer ID',
      'Loan ID',
      'Due Date',
      'Expected Amount',
      'Amount Collected',
      'Outstanding Amount',
      'Status',
      'Payment Method',
      'Payment Reference',
    ];

    const rows =
      filteredCollections.map(
        (item) => [
          item.collectionId || '',
          item.customerName || '',
          item.customerId || '',
          item.financerName || '',
          item.financerId || '',
          item.loanId || '',
          item.dueDate || '',
          item.expectedAmount || 0,
          item.amountCollected || 0,
          item.outstandingAmount || 0,
          item.collectionStatus || '',
          item.paymentMethod || '',
          item.paymentReference ||
            item.referenceNumber ||
            '',
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(',')
      )
      .join('\n');

    const blob = new Blob(
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
      `collections-${selectedMonth}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     CLEAR
  ======================================================= */

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setFinancerFilter('All');
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="collections-page">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="collections-header">
        <div className="collections-header-main">
          <div className="collections-heading-icon">
            <WalletCards size={22} />
          </div>

          <div>
            <span className="collections-eyebrow">
              COLLECTION MANAGEMENT
            </span>

            <h1>
              Collections
            </h1>

            <p>
              Manage recurring monthly
              collections, payments and
              outstanding balances.
            </p>
          </div>
        </div>

        <div className="collections-header-actions">
          <button
            type="button"
            className="collections-refresh-button"
            onClick={() =>
              window.location.reload()
            }
          >
            <RefreshCw size={16} />

            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="collections-export-button"
            onClick={
              handleExport
            }
          >
            <ArrowDownToLine size={16} />

            <span>Export</span>
          </button>
        </div>
      </header>

      {/* =================================================
          MONTH BAR
      ================================================= */}

      <section className="collections-period-bar">
        <div className="collections-period-navigation">
          <button
            type="button"
            onClick={() =>
              navigateMonth(-1)
            }
            aria-label="Previous month"
          >
            <ChevronLeft
              size={18}
            />
          </button>

          <div className="collections-period-title">
            <CalendarDays
              size={17}
            />

            <div>
              <span>
                COLLECTION PERIOD
              </span>

              <strong>
                {formatMonth(
                  selectedMonth
                )}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigateMonth(1)
            }
            aria-label="Next month"
          >
            <ChevronRight
              size={18}
            />
          </button>
        </div>

        <div className="collections-month-select">
          <CalendarDays size={15} />

          <select
            value={selectedMonth}
            onChange={(event) =>
              setSelectedMonth(
                event.target.value
              )
            }
          >
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

          <ChevronDown size={15} />
        </div>
      </section>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <section className="collections-summary-grid">
        <article className="collections-summary-card is-green">
          <div className="collections-summary-icon">
            <IndianRupee
              size={19}
            />
          </div>

          <div>
            <span>
              TOTAL COLLECTED
            </span>

            <strong>
              {formatCurrency(
                summary.collected
              )}
            </strong>

            <small>
              {collectionProgress}%
              of expected
            </small>
          </div>
        </article>

        <article className="collections-summary-card is-blue">
          <div className="collections-summary-icon">
            <IndianRupee
              size={19}
            />
          </div>

          <div>
            <span>
              TOTAL EXPECTED
            </span>

            <strong>
              {formatCurrency(
                summary.expected
              )}
            </strong>

            <small>
              This month's schedule
            </small>
          </div>
        </article>

        <article className="collections-summary-card is-orange">
          <div className="collections-summary-icon">
            <Clock3 size={19} />
          </div>

          <div>
            <span>
              OUTSTANDING
            </span>

            <strong>
              {formatCurrency(
                summary.outstanding
              )}
            </strong>

            <small>
              Balance to collect
            </small>
          </div>
        </article>

        <article className="collections-summary-card is-red">
          <div className="collections-summary-icon">
            <AlertCircle
              size={19}
            />
          </div>

          <div>
            <span>
              OVERDUE
            </span>

            <strong>
              {summary.overdue}
            </strong>

            <small>
              Need attention
            </small>
          </div>
        </article>
      </section>

      {/* =================================================
          MONTHLY HEALTH
      ================================================= */}

      <section className="collections-health-card">
        <div className="collections-health-header">
          <div>
            <span>
              MONTHLY COLLECTION HEALTH
            </span>

            <h2>
              {formatMonth(
                selectedMonth
              )}
            </h2>
          </div>

          <div className="collections-health-percentage">
            <strong>
              {collectionProgress}%
            </strong>

            <span>
              collected
            </span>
          </div>
        </div>

        <div className="collections-health-track">
          <div
            className="collections-health-fill"
            style={{
              width: `${collectionProgress}%`,
            }}
          />
        </div>

        <div className="collections-health-stats">
          <div className="is-paid">
            <CheckCircle2
              size={16}
            />

            <div>
              <span>Paid</span>

              <strong>
                {summary.paid}
              </strong>
            </div>
          </div>

          <div className="is-partial">
            <Clock3 size={16} />

            <div>
              <span>
                Partially Paid
              </span>

              <strong>
                {summary.partial}
              </strong>
            </div>
          </div>

          <div className="is-pending">
            <Clock3 size={16} />

            <div>
              <span>
                Pending
              </span>

              <strong>
                {summary.pending}
              </strong>
            </div>
          </div>

          <div className="is-overdue">
            <AlertCircle
              size={16}
            />

            <div>
              <span>
                Overdue
              </span>

              <strong>
                {summary.overdue}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          COLLECTION TABLE CARD
      ================================================= */}

      <section className="collections-content-card">
        <div className="collections-content-header">
          <div>
            <span>
              COLLECTION SCHEDULE
            </span>

            <h2>
              Monthly Collections
            </h2>

            <p>
              Recurring collections and
              payment status for the
              selected period.
            </p>
          </div>

          <div className="collections-record-count">
            <strong>
              {filteredCollections.length}
            </strong>

            <span>
              records
            </span>
          </div>
        </div>

        {/* FILTER BAR */}

        <div className="collections-toolbar">
          <div className="collections-search">
            <Search size={16} />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search customer, financer, loan..."
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm('')
                }
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="collections-filter">
            <select
              value={financerFilter}
              onChange={(event) =>
                setFinancerFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Financers
              </option>

              {financerOptions.map(
                (financer) => (
                  <option
                    key={financer.id}
                    value={financer.id}
                  >
                    {financer.name}
                  </option>
                )
              )}
            </select>

            <ChevronDown
              size={14}
            />
          </div>

          <div className="collections-filter">
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Partially Paid">
                Partially Paid
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Overdue">
                Overdue
              </option>
            </select>

            <ChevronDown
              size={14}
            />
          </div>

          {(searchTerm ||
            statusFilter !==
              'All' ||
            financerFilter !==
              'All') && (
            <button
              type="button"
              className="collections-clear"
              onClick={
                clearFilters
              }
            >
              Clear
            </button>
          )}
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div className="collections-table-wrapper">
          <table className="collections-table">
            <thead>
              <tr>
                <th>
                  CUSTOMER
                </th>

                <th>
                  FINANCER
                </th>

                <th>
                  LOAN
                </th>

                <th>
                  DUE DATE
                </th>

                <th>
                  EXPECTED
                </th>

                <th>
                  COLLECTED
                </th>

                <th>
                  BALANCE
                </th>

                <th>
                  PROGRESS
                </th>

                <th>
                  STATUS
                </th>

                <th />
              </tr>
            </thead>

            <tbody>
              {filteredCollections.length >
              0 ? (
                filteredCollections.map(
                  (collection) => (
                    <tr
                      key={
                        collection.collectionId
                      }
                    >
                      <td>
                        <div className="collections-customer">
                          <div className="collections-customer-avatar">
                            {collection.customerName
                              ?.charAt(
                                0
                              )
                              ?.toUpperCase() ||
                              'C'}
                          </div>

                          <div>
                            <strong>
                              {
                                collection.customerName
                              }
                            </strong>

                            <span>
                              {
                                collection.customerId
                              }
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="collections-financer">
                          <strong>
                            {
                              collection.financerName
                            }
                          </strong>

                          <span>
                            {
                              collection.financerId
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="collections-loan">
                          <strong>
                            {
                              collection.loanId
                            }
                          </strong>

                          <span>
                            {
                              collection.collectionId
                            }
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="collections-date">
                          <CalendarDays
                            size={14}
                          />

                          <span>
                            {formatDate(
                              collection.dueDate
                            )}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong className="collections-expected">
                          {formatCurrency(
                            collection.expectedAmount
                          )}
                        </strong>
                      </td>

                      <td>
                        <strong className="collections-collected">
                          {formatCurrency(
                            collection.amountCollected
                          )}
                        </strong>
                      </td>

                      <td>
                        <strong
                          className={
                            collection.outstandingAmount >
                            0
                              ? 'collections-balance'
                              : 'collections-zero'
                          }
                        >
                          {formatCurrency(
                            collection.outstandingAmount
                          )}
                        </strong>
                      </td>

                      <td>
                        <CollectionProgress
                          collection={
                            collection
                          }
                        />
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            collection.collectionStatus
                          }
                        />
                      </td>

                      <td>
                        <button
                          type="button"
                          className="collections-view-button"
                          onClick={() =>
                            setSelectedCollection(
                              collection
                            )
                          }
                        >
                          <Eye
                            size={15}
                          />

                          View
                        </button>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="collections-empty"
                  >
                    <Search
                      size={32}
                    />

                    <strong>
                      No collections found
                    </strong>

                    <span>
                      Try changing your
                      month, financer,
                      status or search.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            MOBILE CARDS
        ================================================= */}

        <div className="collections-mobile-list">
          {filteredCollections.length >
          0 ? (
            filteredCollections.map(
              (collection) => (
                <article
                  className="collections-mobile-card"
                  key={`mobile-${collection.collectionId}`}
                >
                  <div className="collections-mobile-card-top">
                    <div className="collections-customer">
                      <div className="collections-customer-avatar">
                        {collection.customerName
                          ?.charAt(
                            0
                          )
                          ?.toUpperCase() ||
                          'C'}
                      </div>

                      <div>
                        <strong>
                          {
                            collection.customerName
                          }
                        </strong>

                        <span>
                          {
                            collection.customerId
                          }
                        </span>
                      </div>
                    </div>

                    <StatusBadge
                      status={
                        collection.collectionStatus
                      }
                    />
                  </div>

                  <div className="collections-mobile-info">
                    <div>
                      <span>
                        Financer
                      </span>

                      <strong>
                        {
                          collection.financerName
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Loan
                      </span>

                      <strong>
                        {
                          collection.loanId
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Due Date
                      </span>

                      <strong>
                        {formatDate(
                          collection.dueDate
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Frequency
                      </span>

                      <strong>
                        {collection.paymentFrequency ||
                          'Monthly'}
                      </strong>
                    </div>
                  </div>

                  <div className="collections-mobile-progress">
                    <CollectionProgress
                      collection={
                        collection
                      }
                    />
                  </div>

                  <div className="collections-mobile-money">
                    <div>
                      <span>
                        Expected
                      </span>

                      <strong>
                        {formatCurrency(
                          collection.expectedAmount
                        )}
                      </strong>
                    </div>

                    <div className="is-collected">
                      <span>
                        Collected
                      </span>

                      <strong>
                        {formatCurrency(
                          collection.amountCollected
                        )}
                      </strong>
                    </div>

                    <div className="is-balance">
                      <span>
                        Balance
                      </span>

                      <strong>
                        {formatCurrency(
                          collection.outstandingAmount
                        )}
                      </strong>
                    </div>
                  </div>

                  {collection.outstandingAmount >
                    0 && (
                    <div className="collections-mobile-balance-message">
                      <Clock3
                        size={14}
                      />

                      <span>
                        {formatCurrency(
                          collection.outstandingAmount
                        )}{' '}
                        still pending
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="collections-mobile-view"
                    onClick={() =>
                      setSelectedCollection(
                        collection
                      )
                    }
                  >
                    <Eye size={15} />

                    View Collection
                  </button>
                </article>
              )
            )
          ) : (
            <div className="collections-mobile-empty">
              <Search size={30} />

              <strong>
                No collections found
              </strong>

              <span>
                Try changing your
                filters.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* =================================================
          AUTOMATIC UPDATE NOTE
      ================================================= */}

      <section className="collections-automation-note">
        <div className="collections-automation-icon">
          <RefreshCw size={17} />
        </div>

        <div>
          <strong>
            Monthly collection sync
          </strong>

          <p>
            Collection payments are the
            source of truth. Monthly
            Billing should reflect the
            collected amount, remaining
            balance and settlement status
            for each billing period.
          </p>
        </div>
      </section>

      {/* =================================================
          DETAILS
      ================================================= */}

      <CollectionDetails
        collection={
          selectedCollection
        }
        onClose={() =>
          setSelectedCollection(
            null
          )
        }
      />
    </main>
  );
};

export default AdminCollections;