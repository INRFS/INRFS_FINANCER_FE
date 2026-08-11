import React, { useState } from 'react';

import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Activity,
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  Percent,
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

/* =========================================================
   SUBSCRIPTION REVENUE DATA
   ========================================================= */

const subscriptionRevenueData = [
  {
    month: 'Mar',
    revenue: 180000,
  },
  {
    month: 'Apr',
    revenue: 190000,
  },
  {
    month: 'May',
    revenue: 205000,
  },
  {
    month: 'Jun',
    revenue: 215000,
  },
  {
    month: 'Jul',
    revenue: 230000,
  },
  {
    month: 'Aug',
    revenue: 245000,
  },
];

/* =========================================================
   PLATFORM GROWTH DATA
   ========================================================= */

const platformGrowthData = [
  {
    month: 'Mar',
    financers: 6400,
    customers: 0,
    loans: 0,
  },
  {
    month: 'Apr',
    financers: 6800,
    customers: 0,
    loans: 0,
  },
  {
    month: 'May',
    financers: 7200,
    customers: 0,
    loans: 0,
  },
  {
    month: 'Jun',
    financers: 7500,
    customers: 0,
    loans: 0,
  },
  {
    month: 'Jul',
    financers: 7900,
    customers: 0,
    loans: 0,
  },
  {
    month: 'Aug',
    financers: 8400,
    customers: 0,
    loans: 0,
  },
];

/* =========================================================
   REPORT DATA
   ========================================================= */

const reportsData = [
  {
    id: 'financer-growth',
    title: 'Financer Growth Report',
    description: 'Registered and active financers',
    icon: Users,
    iconClass: 'report-icon-cyan',
    data: [
      {
        month: 'Mar',
        registered: 98,
        active: 89,
      },
      {
        month: 'Apr',
        registered: 105,
        active: 94,
      },
      {
        month: 'May',
        registered: 110,
        active: 98,
      },
      {
        month: 'Jun',
        registered: 112,
        active: 101,
      },
      {
        month: 'Jul',
        registered: 118,
        active: 106,
      },
      {
        month: 'Aug',
        registered: 125,
        active: 110,
      },
    ],
  },

  {
    id: 'customer-growth',
    title: 'Customer Growth Report',
    description: 'Customer acquisition and activity',
    icon: Users,
    iconClass: 'report-icon-purple',
    data: [
      {
        month: 'Mar',
        customers: 8500,
      },
      {
        month: 'Apr',
        customers: 9200,
      },
      {
        month: 'May',
        customers: 10100,
      },
      {
        month: 'Jun',
        customers: 10900,
      },
      {
        month: 'Jul',
        customers: 11700,
      },
      {
        month: 'Aug',
        customers: 12450,
      },
    ],
  },

  {
    id: 'loan-value',
    title: 'Loan Value Report',
    description: 'Loan portfolio and disbursement value',
    icon: CreditCard,
    iconClass: 'report-icon-green',
    data: [
      {
        month: 'Mar',
        value: 125000000,
      },
      {
        month: 'Apr',
        value: 138000000,
      },
      {
        month: 'May',
        value: 149000000,
      },
      {
        month: 'Jun',
        value: 161000000,
      },
      {
        month: 'Jul',
        value: 174000000,
      },
      {
        month: 'Aug',
        value: 185000000,
      },
    ],
  },

  {
    id: 'sms-usage',
    title: 'SMS Usage Report',
    description: 'Monthly SMS usage and delivery',
    icon: MessageSquare,
    iconClass: 'report-icon-pink',
    data: [
      {
        month: 'Mar',
        sent: 58000,
      },
      {
        month: 'Apr',
        sent: 63000,
      },
      {
        month: 'May',
        sent: 69000,
      },
      {
        month: 'Jun',
        sent: 74000,
      },
      {
        month: 'Jul',
        sent: 79000,
      },
      {
        month: 'Aug',
        sent: 85420,
      },
    ],
  },

  {
    id: 'subscription-revenue',
    title: 'Subscription Revenue',
    description: 'Monthly recurring subscription revenue',
    icon: TrendingUp,
    iconClass: 'report-icon-orange',
    data: subscriptionRevenueData,
  },

  {
    id: 'interest-activity',
    title: 'Interest Activity',
    description: 'Interest generated across loans',
    icon: Percent,
    iconClass: 'report-icon-yellow',
    data: [
      {
        month: 'Mar',
        interest: 420000,
      },
      {
        month: 'Apr',
        interest: 470000,
      },
      {
        month: 'May',
        interest: 520000,
      },
      {
        month: 'Jun',
        interest: 560000,
      },
      {
        month: 'Jul',
        interest: 610000,
      },
      {
        month: 'Aug',
        interest: 680000,
      },
    ],
  },

  {
    id: 'active-inactive',
    title: 'Active vs Inactive',
    description: 'Platform user activity status',
    icon: Activity,
    iconClass: 'report-icon-gray',
    data: [
      {
        type: 'Active',
        count: 110,
      },
      {
        type: 'Inactive',
        count: 15,
      },
    ],
  },

  {
    id: 'platform-health',
    title: 'Platform Health',
    description: 'System health and compliance overview',
    icon: ShieldCheck,
    iconClass: 'report-icon-red',
    data: [
      {
        metric: 'System Uptime',
        value: '99.9%',
      },
      {
        metric: 'KYC Compliance',
        value: '96%',
      },
      {
        metric: 'Active Services',
        value: '100%',
      },
      {
        metric: 'Failed Jobs',
        value: '2',
      },
    ],
  },
];

/* =========================================================
   FORMATTERS
   ========================================================= */

const formatCurrency = (value) => {
  return `₹${Number(value).toLocaleString('en-IN')}`;
};

const formatCrore = (value) => {
  return `₹${(Number(value) / 10000000).toFixed(1)} Cr`;
};

/* =========================================================
   CHART TOOLTIP
   ========================================================= */

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="admin-reports-tooltip">
      <p className="admin-reports-tooltip-title">
        {label}
      </p>

      <p className="admin-reports-tooltip-value">
        Revenue: {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
};

const GrowthTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="admin-reports-tooltip">
      <p className="admin-reports-tooltip-title">
        {label}
      </p>

      {payload.map((item) => (
        <p
          key={item.dataKey}
          className="admin-reports-tooltip-value"
        >
          {item.dataKey === 'financers'
            ? 'Financers'
            : item.dataKey}
          : {Number(item.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

/* =========================================================
   CSV EXPORT
   ========================================================= */

const downloadCSV = (report) => {
  if (!report || !report.data || !report.data.length) {
    return;
  }

  const headers = Object.keys(report.data[0]);

  const rows = report.data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];

        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"'))
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

/* =========================================================
   EXPORT ALL
   ========================================================= */

const exportAllReports = () => {
  const allRows = [];

  reportsData.forEach((report) => {
    report.data.forEach((row) => {
      allRows.push({
        report: report.title,
        ...row,
      });
    });
  });

  const headers = Array.from(
    new Set(
      allRows.flatMap((row) => Object.keys(row))
    )
  );

  const rows = allRows.map((row) =>
    headers
      .map((header) => {
        const value = row[header] ?? '';

        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"'))
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
   REPORT VIEW MODAL
   ========================================================= */

function ReportModal({ report, onClose }) {
  if (!report) {
    return null;
  }

  return (
    <div
      className="admin-report-modal-overlay"
      onClick={onClose}
    >
      <div
        className="admin-report-modal"
        onClick={(event) => event.stopPropagation()}
      >

        <div className="admin-report-modal-header">

          <div>
            <h3>{report.title}</h3>

            <p>
              {report.description}
            </p>
          </div>

          <button
            type="button"
            className="admin-report-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>

        </div>


        <div className="admin-report-modal-body">

          <div className="admin-report-modal-table-wrapper">

            <table className="admin-report-modal-table">

              <thead>
                <tr>
                  {Object.keys(report.data[0]).map(
                    (header) => (
                      <th key={header}>
                        {header
                          .replace(/([A-Z])/g, ' $1')
                          .replace(/^./, (text) =>
                            text.toUpperCase()
                          )}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>

                {report.data.map((row, index) => (
                  <tr key={index}>

                    {Object.entries(row).map(
                      ([key, value]) => (
                        <td key={key}>
                          {typeof value === 'number'
                            ? Number(value).toLocaleString(
                                'en-IN'
                              )
                            : value}
                        </td>
                      )
                    )}

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        </div>


        <div className="admin-report-modal-footer">

          <button
            type="button"
            className="admin-report-modal-cancel"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="admin-report-modal-export"
            onClick={() => downloadCSV(report)}
          >
            <Download size={16} />
            Export Report
          </button>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   MAIN REPORTS PAGE
   ========================================================= */

export default function AdminReports() {

  const [selectedReport, setSelectedReport] =
    useState(null);

  return (
    <div className="admin-reports">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="admin-reports-header">

        <div>

          <h1>Reports</h1>

          <p>
            Platform analytics and export
          </p>

        </div>


        <button
          type="button"
          className="admin-reports-export-all"
          onClick={exportAllReports}
        >
          <Download size={18} />

          Export All
        </button>

      </div>


      {/* =====================================================
          TOP CHARTS
          ===================================================== */}

      <div className="admin-reports-charts-grid">

        {/* =================================================
            SUBSCRIPTION REVENUE
            ================================================= */}

        <div className="admin-reports-chart-card">

          <div className="admin-reports-chart-header">

            <h3>
              Subscription Revenue
            </h3>

            <p>
              Monthly recurring revenue (₹)
            </p>

          </div>


          <div className="admin-reports-chart-body">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <BarChart
                data={subscriptionRevenueData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E1E7ED"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) =>
                    `₹${value / 1000}K`
                  }
                />

                <Tooltip
                  content={<RevenueTooltip />}
                />

                <Bar
                  dataKey="revenue"
                  radius={[5, 5, 0, 0]}
                  fill="#E9DDFB"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* =================================================
            PLATFORM GROWTH TREND
            ================================================= */}

        <div className="admin-reports-chart-card">

          <div className="admin-reports-chart-header">

            <h3>
              Platform Growth Trend
            </h3>

            <p>
              Financ﻿ers, customers and loans
            </p>

          </div>


          <div className="admin-reports-chart-body">

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <LineChart
                data={platformGrowthData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E1E7ED"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 10000]}
                  ticks={[
                    0,
                    2500,
                    5000,
                    7500,
                    10000,
                  ]}
                />

                <Tooltip
                  content={<GrowthTooltip />}
                />

                <Line
                  type="monotone"
                  dataKey="financers"
                  stroke="#78D900"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#10AEEF"
                  strokeWidth={3}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>


      {/* =====================================================
          REPORT CARDS
          ===================================================== */}

      <div className="admin-reports-grid">

        {reportsData.map((report) => {

          const Icon = report.icon;

          return (
            <div
              className="admin-reports-card"
              key={report.id}
            >

              {/* ICON */}

              <div
                className={`admin-reports-card-icon ${report.iconClass}`}
              >
                <Icon size={22} />
              </div>


              {/* CONTENT */}

              <div className="admin-reports-card-content">

                <h3>
                  {report.title}
                </h3>

                <p>
                  {report.description}
                </p>

              </div>


              {/* ACTIONS */}

              <div className="admin-reports-card-actions">

                <button
                  type="button"
                  className="admin-reports-view-btn"
                  onClick={() =>
                    setSelectedReport(report)
                  }
                >
                  View
                </button>


                <button
                  type="button"
                  className="admin-reports-export-btn"
                  onClick={() =>
                    downloadCSV(report)
                  }
                >
                  Export
                </button>

              </div>

            </div>
          );
        })}

      </div>


      {/* =====================================================
          VIEW REPORT MODAL
          ===================================================== */}

      <ReportModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

    </div>
  );
}