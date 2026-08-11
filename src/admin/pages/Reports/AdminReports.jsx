import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle2,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Percent,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import './AdminReports.css';

import {
  adminReports,
  mockAdminStats,
} from '../../data/mockAdminData';

/* =========================================================
   FORMATTERS
========================================================= */

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString('en-IN');
};

const formatCurrency = (value) => {
  return `₹${formatNumber(value)}`;
};

const formatCrore = (value) => {
  return `₹${(Number(value || 0) / 10000000).toFixed(1)} Cr`;
};

const formatReportValue = (value, key) => {
  if (value === null || value === undefined) {
    return '—';
  }

  if (
    key === 'amount' ||
    key === 'value' ||
    key === 'principal' ||
    key === 'outstanding' ||
    key === 'collected' ||
    key === 'interest' ||
    key === 'serviceCharge'
  ) {
    return formatCurrency(value);
  }

  if (
    key === 'usage' ||
    key === 'rate' ||
    key === 'percentage'
  ) {
    return `${value}%`;
  }

  if (typeof value === 'number') {
    return formatNumber(value);
  }

  return value;
};

const formatHeader = (value) => {
  return String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/^./, (text) => text.toUpperCase());
};

/* =========================================================
   REPORT CATEGORY HELPERS
========================================================= */

const reportCategories = [
  'All',
  'Financer',
  'Customer',
  'Loan',
  'Collection',
  'Billing',
  'SMS',
  'Platform',
];

const getReportCategory = (report) => {
  return report?.category || 'Platform';
};

/* =========================================================
   TOOLTIP
========================================================= */

const ReportTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="inrfs-reports-tooltip">
      <p className="inrfs-reports-tooltip-title">
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="inrfs-reports-tooltip-value"
        >
          {formatHeader(item.dataKey)}:{' '}
          {typeof item.value === 'number'
            ? formatNumber(item.value)
            : item.value}
        </p>
      ))}
    </div>
  );
};

/* =========================================================
   CSV EXPORT
========================================================= */

const downloadCSV = (report) => {
  if (!report?.data?.length) {
    return;
  }

  const headers = Object.keys(report.data[0]);

  const rows = report.data.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? '';

        if (
          typeof value === 'string' &&
          (value.includes(',') ||
            value.includes('"') ||
            value.includes('\n'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(',')
  );

  const csvContent = [
    headers.join(','),
    ...rows,
  ].join('\n');

  const blob = new Blob(
    [csvContent],
    {
      type: 'text/csv;charset=utf-8;',
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${report.id}-report.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const exportReports = (reports) => {
  if (!reports?.length) {
    return;
  }

  const allRows = [];

  reports.forEach((report) => {
    if (!Array.isArray(report.data)) {
      return;
    }

    report.data.forEach((row) => {
      allRows.push({
        report: report.title,
        category: report.category,
        ...row,
      });
    });
  });

  if (!allRows.length) {
    return;
  }

  const headers = Array.from(
    new Set(
      allRows.flatMap((row) =>
        Object.keys(row)
      )
    )
  );

  const rows = allRows.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? '';

        if (
          typeof value === 'string' &&
          (value.includes(',') ||
            value.includes('"') ||
            value.includes('\n'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }

        return value;
      })
      .join(',')
  );

  const csvContent = [
    headers.join(','),
    ...rows,
  ].join('\n');

  const blob = new Blob(
    [csvContent],
    {
      type: 'text/csv;charset=utf-8;',
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'INRFS-platform-reports.csv';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/* =========================================================
   REPORT MODAL
========================================================= */

function ReportModal({
  report,
  onClose,
}) {
  if (!report) {
    return null;
  }

  const columns =
    report.data?.length
      ? Object.keys(report.data[0])
      : [];

  return (
    <div
      className="inrfs-reports-modal-overlay"
      onMouseDown={onClose}
    >
      <div
        className="inrfs-reports-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inrfs-reports-modal-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="inrfs-reports-modal-header">
          <div className="inrfs-reports-modal-heading">
            <div className="inrfs-reports-modal-icon">
              <FileText size={19} />
            </div>

            <div>
              <h2 id="inrfs-reports-modal-title">
                {report.title}
              </h2>

              <p>{report.description}</p>
            </div>
          </div>

          <button
            type="button"
            className="inrfs-reports-modal-close"
            onClick={onClose}
            aria-label="Close report"
          >
            <X size={18} />
          </button>
        </div>

        <div className="inrfs-reports-modal-meta">
          <span>{report.category}</span>
          <span>{report.period || 'Monthly'}</span>
        </div>

        <div className="inrfs-reports-modal-body">
          {columns.length > 0 ? (
            <>
              <div className="inrfs-reports-modal-table-wrapper">
                <table className="inrfs-reports-modal-table">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th key={column}>
                          {formatHeader(column)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {report.data.map(
                      (row, rowIndex) => (
                        <tr key={rowIndex}>
                          {columns.map(
                            (column) => (
                              <td key={column}>
                                {formatReportValue(
                                  row[column],
                                  column
                                )}
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="inrfs-reports-modal-mobile-list">
                {report.data.map(
                  (row, rowIndex) => (
                    <div
                      className="inrfs-reports-modal-mobile-card"
                      key={rowIndex}
                    >
                      {columns.map(
                        (column) => (
                          <div
                            className="inrfs-reports-modal-mobile-row"
                            key={column}
                          >
                            <span>
                              {formatHeader(
                                column
                              )}
                            </span>

                            <strong>
                              {formatReportValue(
                                row[column],
                                column
                              )}
                            </strong>
                          </div>
                        )
                      )}
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="inrfs-reports-empty">
              No data available for this report.
            </div>
          )}
        </div>

        <div className="inrfs-reports-modal-footer">
          <button
            type="button"
            className="inrfs-reports-modal-cancel"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="inrfs-reports-modal-export"
            onClick={() =>
              downloadCSV(report)
            }
          >
            <Download size={15} />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminReports() {
  const [selectedReport, setSelectedReport] =
    useState(null);

  const [categoryFilter, setCategoryFilter] =
    useState('All');

  const [monthFilter, setMonthFilter] =
    useState('All');

  const reports = Array.isArray(adminReports)
    ? adminReports
    : [];

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesCategory =
        categoryFilter === 'All' ||
        getReportCategory(report) ===
          categoryFilter;

      const matchesMonth =
        monthFilter === 'All' ||
        !report.periods ||
        report.periods.includes(monthFilter);

      return (
        matchesCategory &&
        matchesMonth
      );
    });
  }, [
    reports,
    categoryFilter,
    monthFilter,
  ]);

  const availableMonths = useMemo(() => {
    const months = new Set();

    reports.forEach((report) => {
      if (Array.isArray(report.periods)) {
        report.periods.forEach((month) =>
          months.add(month)
        );
      }
    });

    return Array.from(months);
  }, [reports]);

  return (
    <div className="inrfs-reports-page">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <header className="inrfs-reports-header">
        <div className="inrfs-reports-header-content">
          <div>
            <div className="inrfs-reports-title-row">
              <div className="inrfs-reports-title-icon">
                <BarChart3 size={21} />
              </div>

              <h1 className="inrfs-reports-title">
                Reports
              </h1>
            </div>

            <p className="inrfs-reports-subtitle">
              Platform analytics, operational reports
              and downloadable Admin insights.
            </p>
          </div>

          <button
            type="button"
            className="inrfs-reports-export-all"
            onClick={() =>
              exportReports(filteredReports)
            }
          >
            <Download size={17} />
            <span>Export All</span>
          </button>
        </div>
      </header>

      {/* =====================================================
          SUMMARY
      ====================================================== */}

      <section className="inrfs-reports-summary-grid">
        <div className="inrfs-reports-summary-card">
          <div className="inrfs-reports-summary-icon inrfs-reports-summary-icon--blue">
            <Users size={18} />
          </div>

          <div>
            <span>Total Financers</span>
            <strong>
              {formatNumber(
                mockAdminStats?.totalFinancers
              )}
            </strong>
          </div>
        </div>

        <div className="inrfs-reports-summary-card">
          <div className="inrfs-reports-summary-icon inrfs-reports-summary-icon--purple">
            <Users size={18} />
          </div>

          <div>
            <span>Total Customers</span>
            <strong>
              {formatNumber(
                mockAdminStats?.totalCustomers
              )}
            </strong>
          </div>
        </div>

        <div className="inrfs-reports-summary-card">
          <div className="inrfs-reports-summary-icon inrfs-reports-summary-icon--green">
            <CreditCard size={18} />
          </div>

          <div>
            <span>Loan Portfolio</span>
            <strong>
              {formatCrore(
                mockAdminStats?.totalPrincipal
              )}
            </strong>
          </div>
        </div>

        <div className="inrfs-reports-summary-card">
          <div className="inrfs-reports-summary-icon inrfs-reports-summary-icon--orange">
            <TrendingUp size={18} />
          </div>

          <div>
            <span>Collections</span>
            <strong>
              {formatCrore(
                reports.find(
                (report) => report.id === 'collection-performance'
              )?.data?.find(
                (row) => row.month === 'Aug'
              )?.collected
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <section className="inrfs-reports-filter-card">
        <div className="inrfs-reports-filter-heading">
          <div>
            <h2>Report Filters</h2>
            <p>
              Select a report category and period.
            </p>
          </div>

          <span className="inrfs-reports-result-count">
            {filteredReports.length} reports
          </span>
        </div>

        <div className="inrfs-reports-filter-controls">
          <div className="inrfs-reports-filter-field">
            <label htmlFor="inrfs-report-category">
              Report Category
            </label>

            <select
              id="inrfs-report-category"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(
                  event.target.value
                )
              }
            >
              {reportCategories.map(
                (category) => (
                  <option
                    value={category}
                    key={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="inrfs-reports-filter-field">
            <label htmlFor="inrfs-report-month">
              Month / Period
            </label>

            <select
              id="inrfs-report-month"
              value={monthFilter}
              onChange={(event) =>
                setMonthFilter(
                  event.target.value
                )
              }
            >
              <option value="All">
                All Periods
              </option>

              {availableMonths.map(
                (month) => (
                  <option
                    value={month}
                    key={month}
                  >
                    {month}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            className="inrfs-reports-reset-button"
            onClick={() => {
              setCategoryFilter('All');
              setMonthFilter('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      </section>

      {/* =====================================================
          FEATURED CHARTS
      ====================================================== */}

      <section className="inrfs-reports-charts-grid">
        {/* Revenue */}

        <div className="inrfs-reports-chart-card">
          <div className="inrfs-reports-chart-header">
            <div>
              <h2>Subscription Revenue</h2>
              <p>
                Monthly recurring subscription
                revenue.
              </p>
            </div>

            <div className="inrfs-reports-chart-icon inrfs-reports-chart-icon--purple">
              <TrendingUp size={17} />
            </div>
          </div>

          <div className="inrfs-reports-chart-body">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={
                  reports.find(
                    (report) =>
                      report.id ===
                      'subscription-revenue'
                  )?.data || []
                }
                margin={{
                  top: 10,
                  right: 8,
                  left: -15,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 11,
                    fill: '#6b7280',
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 10,
                    fill: '#9ca3af',
                  }}
                  tickFormatter={(value) =>
                    `₹${value / 1000}K`
                  }
                />

                <Tooltip
                  content={<ReportTooltip />}
                />

                <Bar
                  dataKey="revenue"
                  fill="#8b5cf6"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Growth */}

        <div className="inrfs-reports-chart-card">
          <div className="inrfs-reports-chart-header">
            <div>
              <h2>Platform Growth Trend</h2>
              <p>
                Financers, customers and loan
                accounts.
              </p>
            </div>

            <div className="inrfs-reports-chart-icon inrfs-reports-chart-icon--blue">
              <Activity size={17} />
            </div>
          </div>

          <div className="inrfs-reports-chart-body">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={
                  reports.find(
                    (report) =>
                      report.id ===
                      'platform-growth'
                  )?.data || []
                }
                margin={{
                  top: 10,
                  right: 8,
                  left: -15,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 11,
                    fill: '#6b7280',
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 10,
                    fill: '#9ca3af',
                  }}
                />

                <Tooltip
                  content={<ReportTooltip />}
                />

                <Line
                  type="monotone"
                  dataKey="financers"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="loans"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="inrfs-reports-chart-legend">
            <span>
              <i className="inrfs-reports-legend-dot inrfs-reports-legend-dot--blue" />
              Financers
            </span>

            <span>
              <i className="inrfs-reports-legend-dot inrfs-reports-legend-dot--purple" />
              Customers
            </span>

            <span>
              <i className="inrfs-reports-legend-dot inrfs-reports-legend-dot--green" />
              Loans
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          REPORT CARDS
      ====================================================== */}

      {filteredReports.length > 0 ? (
        <section className="inrfs-reports-grid">
          {filteredReports.map((report) => {
            const Icon =
              report.icon || FileText;

            return (
              <article
                className="inrfs-reports-card"
                key={report.id}
              >
                <div className="inrfs-reports-card-top">
                  <div
                    className={`inrfs-reports-card-icon ${
                      report.iconClass ||
                      'inrfs-reports-card-icon--default'
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  <span className="inrfs-reports-category-badge">
                    {report.category}
                  </span>
                </div>

                <div className="inrfs-reports-card-content">
                  <h3>{report.title}</h3>

                  <p>{report.description}</p>
                </div>

                <div className="inrfs-reports-card-footer">
                  <span>
                    {report.data?.length || 0}{' '}
                    data rows
                  </span>

                  <div className="inrfs-reports-card-actions">
                    <button
                      type="button"
                      className="inrfs-reports-view-button"
                      onClick={() =>
                        setSelectedReport(
                          report
                        )
                      }
                    >
                      <FileText size={14} />
                      View
                    </button>

                    <button
                      type="button"
                      className="inrfs-reports-export-button"
                      onClick={() =>
                        downloadCSV(report)
                      }
                    >
                      <FileSpreadsheet
                        size={14}
                      />
                      Export
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="inrfs-reports-empty">
          <div className="inrfs-reports-empty-icon">
            <BarChart3 size={24} />
          </div>

          <h3>No reports found</h3>

          <p>
            No reports match the selected category
            and period.
          </p>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter('All');
              setMonthFilter('All');
            }}
          >
            Clear Filters
          </button>
        </section>
      )}

      {/* =====================================================
          MODAL
      ====================================================== */}

      <ReportModal
        report={selectedReport}
        onClose={() =>
          setSelectedReport(null)
        }
      />
    </div>
  );
}