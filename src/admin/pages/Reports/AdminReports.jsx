import React, { useMemo, useState } from 'react';
import {
  Search,
  Download,
  FileDown,
  RotateCcw,
  FileText,
  Users,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Building2,
  ReceiptText,
  CalendarDays,
  Filter,
  ChevronRight,
  X,
} from 'lucide-react';

import './AdminReports.css';

import {
  adminReports,
  mockAdminStats,
} from '../../data/mockAdminData';

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN');

const formatCurrency = (value) =>
  `₹${formatNumber(value)}`;

const formatCrore = (value) =>
  `₹${(Number(value || 0) / 10000000).toFixed(1)} Cr`;

const formatHeader = (value) =>
  String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .replace(/^./, (text) => text.toUpperCase());

const formatValue = (value, key = '') => {
  if (value === null || value === undefined || value === '') return '—';

  const currencyKeys = [
    'amount',
    'value',
    'principal',
    'outstanding',
    'collected',
    'interest',
    'serviceCharge',
    'revenue',
    'total',
    'balance',
  ];

  const percentageKeys = ['usage', 'rate', 'percentage'];

  if (currencyKeys.includes(key)) return formatCurrency(value);
  if (percentageKeys.includes(key)) return `${value}%`;

  if (typeof value === 'number') return formatNumber(value);

  return value;
};

const getCategory = (report) => report?.category || 'Platform';

const reportCategories = [
  { id: 'All', label: 'All Reports', icon: FileText },
  { id: 'Financer', label: 'Financers', icon: Building2 },
  { id: 'Customer', label: 'Customers', icon: Users },
  { id: 'Loan', label: 'Loans', icon: CreditCard },
  { id: 'Collection', label: 'Collections', icon: TrendingUp },
  { id: 'Billing', label: 'Billing', icon: ReceiptText },
  // { id: 'SMS', label: 'SMS', icon: MessageSquare },
  { id: 'Platform', label: 'Platform', icon: Building2 },
];

const getReportIcon = (category) => {
  const match = reportCategories.find((item) => item.id === category);
  return match?.icon || FileText;
};

const getReportRows = (report) =>
  Array.isArray(report?.data) ? report.data : [];

/*
  Admin report data currently exposes period information as
  strings such as "Aug 2026". The date/month/year controls below
  therefore filter against that period information.
*/
const reportMatchesPeriod = (
  report,
  filterType,
  selectedDate,
  selectedMonth,
  selectedYear
) => {
  if (filterType === 'all') return true;

  const periods = Array.isArray(report?.periods)
    ? report.periods
    : [];

  if (!periods.length) return true;

  if (filterType === 'month') {
    if (!selectedMonth && !selectedYear) return true;

    return periods.some((period) => {
      const text = String(period).toLowerCase();

      const monthMatch =
        !selectedMonth ||
        text.includes(selectedMonth.toLowerCase());

      const yearMatch =
        !selectedYear ||
        text.includes(selectedYear);

      return monthMatch && yearMatch;
    });
  }

  if (filterType === 'year') {
    if (!selectedYear) return true;

    return periods.some((period) =>
      String(period).includes(selectedYear)
    );
  }

  if (filterType === 'date') {
    if (!selectedDate) return true;

    const date = new Date(`${selectedDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) return true;

    const month = date.toLocaleString('en-US', {
      month: 'short',
    });

    const year = String(date.getFullYear());

    return periods.some((period) => {
      const text = String(period).toLowerCase();
      return (
        text.includes(month.toLowerCase()) &&
        text.includes(year)
      );
    });
  }

  return true;
};

/* =========================================================
   CSV EXPORT
========================================================= */

const downloadReportCSV = (report) => {
  const rows = getReportRows(report);

  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const csvRows = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? '';
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csv = [
    headers.join(','),
    ...csvRows,
  ].join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${report.id || 'report'}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const exportAllReports = (reports) => {
  const allRows = [];

  reports.forEach((report) => {
    getReportRows(report).forEach((row) => {
      allRows.push({
        Report: report.title,
        Category: getCategory(report),
        ...row,
      });
    });
  });

  if (!allRows.length) return;

  const headers = Array.from(
    new Set(allRows.flatMap((row) => Object.keys(row)))
  );

  const csvRows = allRows.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? '';
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(',')
  );

  const csv = [
    headers.join(','),
    ...csvRows,
  ].join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'INRFS-admin-reports.csv';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/* =========================================================
   REPORT DETAIL DRAWER
========================================================= */

function ReportDrawer({ report, onClose }) {
  if (!report) return null;

  const rows = getReportRows(report);
  const columns = rows.length
    ? Object.keys(rows[0])
    : [];

  return (
    <div
      className="admin-reports-drawer-overlay"
      onMouseDown={onClose}
    >
      <aside
        className="admin-reports-drawer"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-reports-drawer-header">
          <div className="admin-reports-drawer-title">
            <div className="admin-reports-drawer-icon">
              <FileText size={19} />
            </div>

            <div>
              <h2>{report.title}</h2>
              <p>{report.description}</p>
            </div>
          </div>

          <button
            type="button"
            className="admin-reports-close"
            onClick={onClose}
            aria-label="Close report"
          >
            <X size={18} />
          </button>
        </div>

        <div className="admin-reports-drawer-meta">
          <span>{getCategory(report)}</span>
          <span>
            {report.period || 'Monthly'}
          </span>
          <span>{rows.length} rows</span>
        </div>

        <div className="admin-reports-drawer-body">
          {rows.length ? (
            <div className="admin-reports-detail-table-wrap">
              <table className="admin-reports-detail-table">
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
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map((column) => (
                        <td key={column}>
                          {formatValue(
                            row[column],
                            column
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-reports-empty-detail">
              No data available for this report.
            </div>
          )}
        </div>

        <div className="admin-reports-drawer-footer">
          <button
            type="button"
            className="admin-reports-secondary-btn"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="admin-reports-primary-btn"
            onClick={() => downloadReportCSV(report)}
          >
            <Download size={15} />
            Export Report
          </button>
        </div>
      </aside>
    </div>
  );
}

/* =========================================================
   MAIN ADMIN REPORTS PAGE
========================================================= */

export default function AdminReports() {
  const [activeCategory, setActiveCategory] =
    useState('All');

  const [search, setSearch] = useState('');

  const [filterType, setFilterType] =
    useState('month');

  const [selectedDate, setSelectedDate] =
    useState('');

  const [selectedMonth, setSelectedMonth] =
    useState('');

  const [selectedYear, setSelectedYear] =
    useState('');

  const [selectedReport, setSelectedReport] =
    useState(null);

  const reports = Array.isArray(adminReports)
    ? adminReports
    : [];

  const filteredReports = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    return reports.filter((report) => {
      const categoryMatches =
        activeCategory === 'All' ||
        getCategory(report) === activeCategory;

      const searchMatches =
        !searchValue ||
        String(report.title || '')
          .toLowerCase()
          .includes(searchValue) ||
        String(report.description || '')
          .toLowerCase()
          .includes(searchValue) ||
        String(getCategory(report))
          .toLowerCase()
          .includes(searchValue);

      const periodMatches = reportMatchesPeriod(
        report,
        filterType,
        selectedDate,
        selectedMonth,
        selectedYear
      );

      return (
        categoryMatches &&
        searchMatches &&
        periodMatches
      );
    });
  }, [
    reports,
    activeCategory,
    search,
    filterType,
    selectedDate,
    selectedMonth,
    selectedYear,
  ]);

  const resetFilters = () => {
    setActiveCategory('All');
    setSearch('');
    setFilterType('month');
    setSelectedDate('');
    setSelectedMonth('');
    setSelectedYear('');
  };

  const currentCollection = useMemo(() => {
    const report = reports.find(
      (item) => item.id === 'collection-performance'
    );

    const row = report?.data?.find(
      (item) =>
        String(item.month || '').toLowerCase() ===
        'aug'
    );

    return row?.collected || 0;
  }, [reports]);

  const totalRows = filteredReports.reduce(
    (total, report) =>
      total + getReportRows(report).length,
    0
  );

  return (
    <div className="admin-reports-page">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="admin-reports-header">
        <div className="admin-reports-heading">
          <div className="admin-reports-title-icon">
            <FileText size={21} />
          </div>

          <div>
            <h1>Reports</h1>
            <p>
              View, filter and export platform reports
            </p>
          </div>
        </div>

        <button
          type="button"
          className="admin-reports-export-all"
          onClick={() =>
            exportAllReports(filteredReports)
          }
        >
          <Download size={16} />
          Export All
        </button>
      </header>

      {/* =====================================================
          ADMIN SUMMARY
      ====================================================== */}

      <section className="admin-reports-summary">
        <div className="admin-report-stat-card">
          <div className="admin-report-stat-icon blue">
            <Building2 size={18} />
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

        <div className="admin-report-stat-card">
          <div className="admin-report-stat-icon purple">
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

        <div className="admin-report-stat-card">
          <div className="admin-report-stat-icon green">
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

        <div className="admin-report-stat-card">
          <div className="admin-report-stat-icon orange">
            <TrendingUp size={18} />
          </div>
          <div>
            <span>Collections</span>
            <strong>
              {formatCrore(currentCollection)}
            </strong>
          </div>
        </div>
      </section>

      {/* =====================================================
          CATEGORY TABS
      ====================================================== */}

      <section className="admin-reports-tabs-card">
        <div className="admin-reports-tabs">
          {reportCategories.map((category) => {
            const Icon = category.icon;
            const active =
              activeCategory === category.id;

            return (
              <button
                type="button"
                key={category.id}
                className={`admin-reports-tab ${
                  active ? 'active' : ''
                }`}
                onClick={() =>
                  setActiveCategory(category.id)
                }
              >
                <Icon size={16} />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          FILTER TOOLBAR
      ====================================================== */}

      <section className="admin-reports-toolbar">
        <div className="admin-reports-filter-row">
          <div className="admin-reports-search">
            <Search size={17} />
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search reports..."
              aria-label="Search reports"
            />
          </div>

          <div className="admin-reports-filter-type">
            <Filter size={15} />

            <select
              value={filterType}
              onChange={(event) => {
                setFilterType(
                  event.target.value
                );
                setSelectedDate('');
                setSelectedMonth('');
                setSelectedYear('');
              }}
              aria-label="Filter type"
            >
              <option value="date">Date</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>

          {filterType === 'date' && (
            <label className="admin-reports-date-input">
              <span>Date</span>
              <CalendarDays size={14} />

              <input
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(
                    event.target.value
                  )
                }
              />
            </label>
          )}

          {filterType === 'month' && (
            <>
              <label className="admin-reports-select-field">
                <span>Month</span>
                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Months
                  </option>
                  <option value="Jan">
                    January
                  </option>
                  <option value="Feb">
                    February
                  </option>
                  <option value="Mar">
                    March
                  </option>
                  <option value="Apr">
                    April
                  </option>
                  <option value="May">
                    May
                  </option>
                  <option value="Jun">
                    June
                  </option>
                  <option value="Jul">
                    July
                  </option>
                  <option value="Aug">
                    August
                  </option>
                  <option value="Sep">
                    September
                  </option>
                  <option value="Oct">
                    October
                  </option>
                  <option value="Nov">
                    November
                  </option>
                  <option value="Dec">
                    December
                  </option>
                </select>
              </label>

              <label className="admin-reports-select-field">
                <span>Year</span>
                <select
                  value={selectedYear}
                  onChange={(event) =>
                    setSelectedYear(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    All Years
                  </option>
                  <option value="2025">
                    2025
                  </option>
                  <option value="2026">
                    2026
                  </option>
                  <option value="2027">
                    2027
                  </option>
                </select>
              </label>
            </>
          )}

          {filterType === 'year' && (
            <label className="admin-reports-select-field">
              <span>Year</span>
              <select
                value={selectedYear}
                onChange={(event) =>
                  setSelectedYear(
                    event.target.value
                  )
                }
              >
                <option value="">
                  All Years
                </option>
                <option value="2025">
                  2025
                </option>
                <option value="2026">
                  2026
                </option>
                <option value="2027">
                  2027
                </option>
              </select>
            </label>
          )}

          <button
            type="button"
            className="admin-reports-reset"
            onClick={resetFilters}
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        <div className="admin-reports-toolbar-meta">
          <span>
            Showing{' '}
            <strong>
              {filteredReports.length}
            </strong>{' '}
            of {reports.length} reports
          </span>

          <span>
            {totalRows} data rows
          </span>
        </div>
      </section>

      {/* =====================================================
          REPORT LIST
      ====================================================== */}

      <section className="admin-reports-content">
        <div className="admin-reports-content-header">
          <div>
            <h2>
              {activeCategory === 'All'
                ? 'All Reports'
                : `${activeCategory} Reports`}
            </h2>
            <p>
              Select a report to view detailed data
              and export it.
            </p>
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="admin-reports-table-wrap">
            <table className="admin-reports-table">
              <thead>
                <tr>
                  <th>REPORT</th>
                  <th>CATEGORY</th>
                  <th>DESCRIPTION</th>
                  <th>PERIOD</th>
                  <th>ROWS</th>
                  <th className="action-column">
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredReports.map((report) => {
                  const Icon = getReportIcon(
                    getCategory(report)
                  );

                  return (
                    <tr key={report.id}>
                      <td>
                        <div className="admin-report-name">
                          <div className="admin-report-row-icon">
                            <Icon size={18} />
                          </div>

                          <div>
                            <strong>
                              {report.title}
                            </strong>

                            <small>
                              {report.id}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-report-category ${String(
                            getCategory(report)
                          ).toLowerCase()}`}
                        >
                          {getCategory(report)}
                        </span>
                      </td>

                      <td>
                        <span className="admin-report-description">
                          {report.description ||
                            'Platform report'}
                        </span>
                      </td>

                      <td>
                        <span className="admin-report-period">
                          <CalendarDays size={14} />
                          {report.period ||
                            report.periods?.[0] ||
                            'Monthly'}
                        </span>
                      </td>

                      <td>
                        <strong className="admin-report-row-count">
                          {getReportRows(report).length}
                        </strong>
                      </td>

                      <td>
                        <div className="admin-report-actions">
                          <button
                            type="button"
                            className="admin-report-view-btn"
                            onClick={() =>
                              setSelectedReport(
                                report
                              )
                            }
                          >
                            <FileText size={14} />
                            View
                            <ChevronRight size={14} />
                          </button>

                          <button
                            type="button"
                            className="admin-report-export-btn"
                            onClick={() =>
                              downloadReportCSV(
                                report
                              )
                            }
                            aria-label={`Export ${report.title}`}
                          >
                            <Download size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-reports-empty">
            <div className="admin-reports-empty-icon">
              <Search size={23} />
            </div>

            <h3>No reports found</h3>
            <p>
              Try changing the category, search or
              reporting period.
            </p>

            <button
              type="button"
              onClick={resetFilters}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* DETAIL DRAWER */}
      <ReportDrawer
        report={selectedReport}
        onClose={() =>
          setSelectedReport(null)
        }
      />
    </div>
  );
}