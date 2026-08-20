import React, { useEffect, useMemo, useState } from 'react';

import {
  Users,
  CreditCard,
  MessageSquare,
  Activity,
  Building2,
  ReceiptIndianRupee,
  ArrowUpRight,
  Search,
} from 'lucide-react';

import { platformApi, pageItems } from '../../../common/services/platformApi';

import './AdminUsageAnalytics.css';

/* =========================================================
   HELPERS
========================================================= */

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN');

const getActivityPercentage = (item) => {
  const customerScore =
    Math.min(Number(item.customerCount || 0) / 5, 25);

  const loanScore =
    Math.min(Number(item.loanCount || 0) / 4, 25);

  const transactionScore =
    Math.min(
      Number(item.transactionCount || 0) / 30,
      25
    );

  const smsScore =
    Math.min(Number(item.smsActivity || 0) / 500, 25);

  return Math.round(
    customerScore +
      loanScore +
      transactionScore +
      smsScore
  );
};

/* =========================================================
   MONTHLY CUSTOMER DATA
========================================================= */

/* =========================================================
   MONTHLY LOAN DATA
========================================================= */

/* =========================================================
   MONTHLY SMS DATA
========================================================= */

/* =========================================================
   LINE CHART POINTS
========================================================= */

function getLinePoints(data, maxValue) {
  const width = 100;
  const height = 100;

  if (!data.length) {
    return '';
  }

  if (data.length === 1) {
    return `0,${height / 2}`;
  }

  return data
    .map((item, index) => {
      const x =
        (index / (data.length - 1)) * width;

      const safeMax =
        maxValue > 0 ? maxValue : 1;

      const y =
        height -
        (Number(item.value || 0) / safeMax) *
          height;

      return `${x},${y}`;
    })
    .join(' ');
}

/* =========================================================
   ANALYTICS LINE CHART
========================================================= */

function AnalyticsLineChart({
  data,
  maxValue,
  type,
}) {
  if (!data.length) {
    return <p className="analytics-empty-state">Historical trend data is not available from the reporting API.</p>;
  }
  const points = getLinePoints(
    data,
    maxValue
  );

  return (
    <div className="analytics-line-chart">

      <div className="analytics-y-axis">

        <span>
          {maxValue.toLocaleString('en-IN')}
        </span>

        <span>
          {Math.round(
            maxValue * 0.75
          ).toLocaleString('en-IN')}
        </span>

        <span>
          {Math.round(
            maxValue * 0.5
          ).toLocaleString('en-IN')}
        </span>

        <span>
          {Math.round(
            maxValue * 0.25
          ).toLocaleString('en-IN')}
        </span>

        <span>
          0
        </span>

      </div>

      <div className="analytics-chart-area">

        <div className="analytics-grid-lines">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

        <svg
          className="analytics-svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            points={points}
            fill="none"
            className={`analytics-line ${type}`}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="analytics-months">

          {data.map((item, index) => (
            <span key={index}>
              {item.month}
            </span>
          ))}

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function UsageStatCard({
  title,
  value,
  change,
  description,
  color,
  icon: Icon,
}) {
  return (
    <div
      className={`usage-stat-card ${color}`}
    >

      <div className="usage-stat-content">

        <span className="usage-stat-title">
          {title}
        </span>

        <strong className="usage-stat-value">
          {value}
        </strong>

        <span className="usage-stat-description">
          <b>{change}</b>{' '}
          {description}
        </span>

      </div>

      <div className="usage-stat-icon">

        <Icon
          size={18}
          strokeWidth={1.8}
        />

      </div>

    </div>
  );
}

/* =========================================================
   FINANCER STATUS
========================================================= */

function getStatusClass(status) {
  switch (status) {
    case 'Active':
      return 'active';

    case 'Inactive':
      return 'inactive';

    case 'Suspended':
      return 'suspended';

    default:
      return 'pending';
  }
}

/* =========================================================
   SERVICE CHARGE STATUS
========================================================= */

function getServiceChargeClass(status) {
  switch (status) {
    case 'Paid':
      return 'paid';

    case 'Pending':
      return 'pending';

    case 'Overdue':
      return 'overdue';

    case 'Partially Paid':
      return 'partial';

    default:
      return 'pending';
  }
}

/* =========================================================
   ADMIN USAGE ANALYTICS
========================================================= */

export default function AdminUsageAnalytics() {
  const [financerUsageData, setFinancerUsageData] = useState([]);
  const [pageError, setPageError] = useState('');
  useEffect(() => {
    platformApi.admin.allFinancers().then(async (payload) => {
      const usage = await Promise.all(pageItems(payload).map(async (financer) => {
        const data = await platformApi.admin.financerUsage(financer.id);
        return { financerId: financer.id, financerName: financer.displayName, status: financer.status, customerCount: data.totalCustomers, loanCount: data.activeLoans + data.overdueLoans, transactionCount: data.upcomingPayments?.length || 0, smsActivity: 0, principalAmount: data.totalPrincipal, serviceChargeStatus: 'Pending' };
      }));
      setFinancerUsageData(usage);
    }).catch((error) => setPageError(error.message));
  }, []);
  const [period, setPeriod] =
    useState('This Month');

  const [search, setSearch] =
    useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [
    serviceChargeFilter,
    setServiceChargeFilter,
  ] = useState('All');

  /* =======================================================
     SUMMARY STATISTICS
  ======================================================= */

  const summary = useMemo(() => {
    const totalFinancers =
      financerUsageData.length;

    const activeFinancers =
      financerUsageData.filter(
        (item) =>
          item.status === 'Active'
      ).length;

    const inactiveFinancers =
      financerUsageData.filter(
        (item) =>
          item.status === 'Inactive'
      ).length;

    const suspendedFinancers =
      financerUsageData.filter(
        (item) =>
          item.status === 'Suspended'
      ).length;

    const totalCustomers =
      financerUsageData.reduce(
        (total, item) =>
          total +
          Number(
            item.customerCount || 0
          ),
        0
      );

    const totalLoans =
      financerUsageData.reduce(
        (total, item) =>
          total +
          Number(
            item.loanCount || 0
          ),
        0
      );

    const totalTransactions =
      financerUsageData.reduce(
        (total, item) =>
          total +
          Number(
            item.transactionCount || 0
          ),
        0
      );

    const totalSms =
      financerUsageData.reduce(
        (total, item) =>
          total +
          Number(
            item.smsActivity || 0
          ),
        0
      );

    const financersWithServiceChargeIssues =
      financerUsageData.filter(
        (item) =>
          item.serviceChargeStatus !==
          'Paid'
      ).length;

    return {
      totalFinancers,
      activeFinancers,
      inactiveFinancers,
      suspendedFinancers,
      totalCustomers,
      totalLoans,
      totalTransactions,
      totalSms,
      financersWithServiceChargeIssues,
    };
  }, [financerUsageData]);

  const currentPeriod = new Date().toLocaleDateString('en-IN', { month: 'short' });
  const customerData = financerUsageData.length ? [{ month: currentPeriod, value: summary.totalCustomers }] : [];
  const loanData = financerUsageData.length ? [{ month: currentPeriod, value: summary.totalLoans }] : [];
  const smsData = summary.totalSms ? [{ month: currentPeriod, value: summary.totalSms }] : [];

  /* =======================================================
     FILTERED FINANCER DATA
  ======================================================= */

  const filteredFinancers = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return financerUsageData.filter(
      (item) => {

        const matchesSearch =
          !searchValue ||
          item.financerName
            ?.toLowerCase()
            .includes(searchValue) ||
          item.financerId
            ?.toLowerCase()
            .includes(searchValue);

        const matchesStatus =
          statusFilter === 'All' ||
          item.status === statusFilter;

        const matchesServiceCharge =
          serviceChargeFilter === 'All' ||
          item.serviceChargeStatus ===
            serviceChargeFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesServiceCharge
        );
      }
    );
  }, [
    financerUsageData,
    search,
    statusFilter,
    serviceChargeFilter,
  ]);

  return (
    <div className="admin-usage-page">
      {pageError && <p role="alert">{pageError}</p>}

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="usage-page-header">

        <div>

          <h1>
            Financer Usage Monitoring
          </h1>

          <p>
            Monitor financer activity, customers,
            loans, transactions, SMS usage and
            service-charge status.
          </p>

        </div>

        <select
          className="usage-period-select"
          value={period}
          onChange={(event) =>
            setPeriod(event.target.value)
          }
        >

          <option>
            This Month
          </option>

          <option>
            Last Month
          </option>

          <option>
            Last 3 Months
          </option>

          <option>
            Last 6 Months
          </option>

          <option>
            This Year
          </option>

        </select>

      </div>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="usage-stats-grid">

        <UsageStatCard
          title="TOTAL FINANCERS"
          value={formatNumber(
            summary.totalFinancers
          )}
          change="+7"
          description="this month"
          color="cyan"
          icon={Building2}
        />

        <UsageStatCard
          title="ACTIVE FINANCERS"
          value={formatNumber(
            summary.activeFinancers
          )}
          change={`${Math.round(
            (summary.activeFinancers /
              Math.max(
                summary.totalFinancers,
                1
              )) *
              100
          )}%`}
          description="active rate"
          color="green"
          icon={Activity}
        />

        <UsageStatCard
          title="TOTAL CUSTOMERS"
          value={formatNumber(
            summary.totalCustomers
          )}
          change="+550"
          description="this month"
          color="cyan"
          icon={Users}
        />

        <UsageStatCard
          title="TOTAL LOANS"
          value={formatNumber(
            summary.totalLoans
          )}
          change="+"
          description="across financers"
          color="purple"
          icon={CreditCard}
        />

        <UsageStatCard
          title="TRANSACTIONS"
          value={formatNumber(
            summary.totalTransactions
          )}
          change="+"
          description="recorded activity"
          color="green"
          icon={Activity}
        />

        <UsageStatCard
          title="SMS ACTIVITY"
          value={formatNumber(
            summary.totalSms
          )}
          change="+12.4%"
          description="this month"
          color="pink"
          icon={MessageSquare}
        />

        <UsageStatCard
          title="INACTIVE FINANCERS"
          value={formatNumber(
            summary.inactiveFinancers
          )}
          change="Monitor"
          description="inactive accounts"
          color="orange"
          icon={Building2}
        />

        <UsageStatCard
          title="SERVICE CHARGE ISSUES"
          value={formatNumber(
            summary.financersWithServiceChargeIssues
          )}
          change="Attention"
          description="pending / overdue"
          color="purple"
          icon={ReceiptIndianRupee}
        />

      </div>

      {/* =====================================================
          FIRST CHART ROW
      ====================================================== */}

      <div className="usage-chart-grid">

        {/* CUSTOMER GROWTH */}

        <section className="usage-chart-card">

          <div className="usage-chart-header">

            <div>

              <h2>
                Customer Usage
              </h2>

              <p>
                Total customers registered over time
              </p>

            </div>

            <span className="chart-indicator cyan">
              Customers
            </span>

          </div>

          <AnalyticsLineChart
            data={customerData}
            maxValue={14000}
            type="cyan"
          />

        </section>

        {/* LOAN ACTIVITY */}

        <section className="usage-chart-card">

          <div className="usage-chart-header">

            <div>

              <h2>
                Loan Activity
              </h2>

              <p>
                Loans across the platform
              </p>

            </div>

            <span className="chart-indicator purple">
              Loans
            </span>

          </div>

          <AnalyticsLineChart
            data={loanData}
            maxValue={10000}
            type="purple"
          />

        </section>

      </div>

      {/* =====================================================
          SECOND ROW
      ====================================================== */}

      <div className="usage-secondary-grid">

        {/* SMS USAGE */}

        <section className="usage-chart-card sms-analytics-card">

          <div className="usage-chart-header">

            <div>

              <h2>
                SMS Usage Trend
              </h2>

              <p>
                Platform SMS activity
              </p>

            </div>

            <span className="chart-indicator pink">
              SMS
            </span>

          </div>

          <AnalyticsLineChart
            data={smsData}
            maxValue={100000}
            type="pink"
          />

        </section>

        {/* FINANCER STATUS */}

        <section className="subscription-distribution-card">

          <div className="usage-section-heading">

            <h2>
              Financer Status
            </h2>

            <p>
              Current account status
            </p>

          </div>

          <div className="subscription-content">

            <div className="subscription-donut">

              <div className="donut-ring">

                <div className="donut-center">

                  <strong>
                    {summary.totalFinancers}
                  </strong>

                  <span>
                    Financers
                  </span>

                </div>

              </div>

            </div>

            <div className="subscription-legend">

              <div className="subscription-legend-item">

                <div className="legend-name">

                  <span className="legend-dot green" />

                  <span>
                    Active
                  </span>

                </div>

                <div className="legend-value">

                  <strong>
                    {summary.activeFinancers}
                  </strong>

                  <span>
                    {Math.round(
                      (summary.activeFinancers /
                        Math.max(
                          summary.totalFinancers,
                          1
                        )) *
                        100
                    )}%
                  </span>

                </div>

              </div>

              <div className="subscription-legend-item">

                <div className="legend-name">

                  <span className="legend-dot blue" />

                  <span>
                    Inactive
                  </span>

                </div>

                <div className="legend-value">

                  <strong>
                    {summary.inactiveFinancers}
                  </strong>

                  <span>
                    {Math.round(
                      (summary.inactiveFinancers /
                        Math.max(
                          summary.totalFinancers,
                          1
                        )) *
                        100
                    )}%
                  </span>

                </div>

              </div>

              <div className="subscription-legend-item">

                <div className="legend-name">

                  <span className="legend-dot orange" />

                  <span>
                    Suspended
                  </span>

                </div>

                <div className="legend-value">

                  <strong>
                    {summary.suspendedFinancers}
                  </strong>

                  <span>
                    {Math.round(
                      (summary.suspendedFinancers /
                        Math.max(
                          summary.totalFinancers,
                          1
                        )) *
                        100
                    )}%
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

      {/* =====================================================
          FINANCER USAGE MONITORING
      ====================================================== */}

      <section className="financer-activity-card">

        <div className="financer-activity-header">

          <div>

            <h2>
              Financer Usage Monitoring
            </h2>

            <p>
              Usage statistics and service-charge
              status by financer
            </p>

          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >

            <span
              style={{
                fontSize: '13px',
                color: '#8190A5',
              }}
            >
              {filteredFinancers.length} financers
            </span>

          </div>

        </div>

        {/* ===================================================
            FILTERS
        ==================================================== */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(220px, 1fr) 180px 200px',
            gap: '12px',
            padding: '0 24px 20px',
          }}
        >

          {/* SEARCH */}

          <div
            style={{
              position: 'relative',
            }}
          >

            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform:
                  'translateY(-50%)',
                color: '#8190A5',
                pointerEvents: 'none',
              }}
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search financer..."
              style={{
                width: '100%',
                height: '40px',
                padding:
                  '0 12px 0 36px',
                border:
                  '1px solid #E1E7EF',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '13px',
                background: '#FFFFFF',
              }}
            />

          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            style={{
              height: '40px',
              padding: '0 12px',
              border:
                '1px solid #E1E7EF',
              borderRadius: '8px',
              outline: 'none',
              fontSize: '13px',
              background: '#FFFFFF',
            }}
          >

            <option value="All">
              All Statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

            <option value="Suspended">
              Suspended
            </option>

          </select>

          {/* SERVICE CHARGE STATUS */}

          <select
            value={serviceChargeFilter}
            onChange={(event) =>
              setServiceChargeFilter(
                event.target.value
              )
            }
            style={{
              height: '40px',
              padding: '0 12px',
              border:
                '1px solid #E1E7EF',
              borderRadius: '8px',
              outline: 'none',
              fontSize: '13px',
              background: '#FFFFFF',
            }}
          >

            <option value="All">
              All Service Charges
            </option>

            <option value="Paid">
              Paid
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Overdue">
              Overdue
            </option>

            <option value="Partially Paid">
              Partially Paid
            </option>

          </select>

        </div>

        {/* ===================================================
            TABLE
        ==================================================== */}

        <div className="financer-activity-wrapper">

          <table className="financer-activity-table">

            <thead>

              <tr>

                <th>
                  FINANCER
                </th>

                <th>
                  REGISTRATION DATE
                </th>

                <th>
                  LAST LOGIN
                </th>

                <th>
                  CUSTOMERS
                </th>

                <th>
                  LOANS
                </th>

                <th>
                  TRANSACTIONS
                </th>

                <th>
                  SMS ACTIVITY
                </th>

                <th>
                  ACTIVITY
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  SERVICE CHARGE
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredFinancers.length > 0 ? (

                filteredFinancers.map(
                  (item) => {

                    const activity =
                      getActivityPercentage(
                        item
                      );

                    return (

                      <tr
                        key={
                          item.financerId
                        }
                      >

                        {/* FINANCER */}

                        <td className="activity-financer">

                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '10px',
                            }}
                          >

                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius:
                                  '9px',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                background:
                                  'rgba(16,174,239,0.10)',
                                color:
                                  '#10AEEF',
                                flexShrink: 0,
                              }}
                            >

                              <Building2
                                size={17}
                              />

                            </div>

                            <div>

                              <strong
                                style={{
                                  display:
                                    'block',
                                }}
                              >
                                {
                                  item.financerName
                                }
                              </strong>

                              <span
                                style={{
                                  display:
                                    'block',
                                  marginTop:
                                    '2px',
                                  fontSize:
                                    '11px',
                                  color:
                                    '#8190A5',
                                }}
                              >
                                {
                                  item.financerId
                                }
                              </span>

                            </div>

                          </div>

                        </td>

                        {/* REGISTRATION DATE */}

                        <td>
                          {
                            item.registrationDate
                          }
                        </td>

                        {/* LAST LOGIN */}

                        <td>
                          {
                            item.lastLogin
                          }
                        </td>

                        {/* CUSTOMERS */}

                        <td>
                          {formatNumber(
                            item.customerCount
                          )}
                        </td>

                        {/* LOANS */}

                        <td>
                          {formatNumber(
                            item.loanCount
                          )}
                        </td>

                        {/* TRANSACTIONS */}

                        <td>
                          {formatNumber(
                            item.transactionCount
                          )}
                        </td>

                        {/* SMS */}

                        <td>
                          {formatNumber(
                            item.smsActivity
                          )}
                        </td>

                        {/* ACTIVITY */}

                        <td>

                          <div className="activity-progress-cell">

                            <div className="activity-progress">

                              <div
                                className="activity-progress-fill"
                                style={{
                                  width: `${activity}%`,
                                }}
                              />

                            </div>

                            <span>
                              {activity}%
                            </span>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td>

                          <span
                            className={`activity-status ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>

                        </td>

                        {/* SERVICE CHARGE STATUS */}

                        <td>

                          <span
                            className={`activity-status ${getServiceChargeClass(
                              item.serviceChargeStatus
                            )}`}
                          >

                            {item.serviceChargeStatus}

                          </span>

                        </td>

                      </tr>

                    );
                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="10"
                    style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#8190A5',
                    }}
                  >

                    No financers found
                    matching the selected filters.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* =====================================================
          MONITORING NOTE
      ====================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginTop: '18px',
          padding: '16px 20px',
          border:
            '1px solid rgba(16,174,239,0.15)',
          borderRadius: '10px',
          background:
            'rgba(16,174,239,0.04)',
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >

          <Activity
            size={18}
            color="#10AEEF"
          />

          <div>

            <strong
              style={{
                display: 'block',
                fontSize: '13px',
              }}
            >
              Usage monitoring
            </strong>

            <span
              style={{
                display: 'block',
                marginTop: '3px',
                fontSize: '12px',
                color: '#8190A5',
              }}
            >
              Usage data includes customer,
              loan, transaction and SMS activity
              for each financer.
            </span>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent(
                'inrfs-admin-action',
                {
                  detail: {
                    key: 'financers',
                    label:
                      'Manage Financers',
                  },
                }
              )
            )
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            background: 'transparent',
            color: '#10AEEF',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >

          Manage Financers

          <ArrowUpRight
            size={14}
          />

        </button>

      </div>

    </div>
  );
}
