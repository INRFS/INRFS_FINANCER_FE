import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Activity,
} from 'lucide-react';

import './AdminUsageAnalytics.css';

const analyticsStats = [
  {
    title: 'TOTAL PLATFORM USERS',
    value: '12,450',
    change: '+4.6%',
    description: 'vs last month',
    color: 'cyan',
    icon: Users,
  },
  {
    title: 'ACTIVE LOANS',
    value: '8,320',
    change: '+7.2%',
    description: 'vs last month',
    color: 'purple',
    icon: CreditCard,
  },
  {
    title: 'SMS USAGE',
    value: '85,420',
    change: '+12.4%',
    description: 'this month',
    color: 'pink',
    icon: MessageSquare,
  },
  {
    title: 'PLATFORM ACTIVITY',
    value: '92.8%',
    change: '+3.1%',
    description: 'active rate',
    color: 'green',
    icon: Activity,
  },
];

const customerData = [
  { month: 'Mar', value: 7200 },
  { month: 'Apr', value: 7800 },
  { month: 'May', value: 8300 },
  { month: 'Jun', value: 8900 },
  { month: 'Jul', value: 10500 },
  { month: 'Aug', value: 12450 },
];

const loanData = [
  { month: 'Mar', value: 5200 },
  { month: 'Apr', value: 5800 },
  { month: 'May', value: 6300 },
  { month: 'Jun', value: 6900 },
  { month: 'Jul', value: 7600 },
  { month: 'Aug', value: 8320 },
];

const smsData = [
  { month: 'Mar', value: 48000 },
  { month: 'Apr', value: 55200 },
  { month: 'May', value: 61400 },
  { month: 'Jun', value: 70200 },
  { month: 'Jul', value: 78100 },
  { month: 'Aug', value: 85420 },
];

const subscriptionData = [
  {
    name: 'Basic',
    value: 32,
    count: 40,
    color: 'blue',
  },
  {
    name: 'Standard',
    value: 45,
    count: 56,
    color: 'purple',
  },
  {
    name: 'Premium',
    value: 23,
    count: 29,
    color: 'orange',
  },
];

const financerActivity = [
  {
    financer: 'Patel Finance Services',
    customers: 250,
    loans: 180,
    sms: 1240,
    activity: 94,
  },
  {
    financer: 'Singh Credit Solutions',
    customers: 145,
    loans: 112,
    sms: 890,
    activity: 91,
  },
  {
    financer: 'Jain Money Solutions',
    customers: 110,
    loans: 88,
    sms: 620,
    activity: 87,
  },
  {
    financer: 'Khan Financial',
    customers: 78,
    loans: 55,
    sms: 450,
    activity: 82,
  },
  {
    financer: 'Sharma Money Lenders',
    customers: 89,
    loans: 65,
    sms: 320,
    activity: 79,
  },
  {
    financer: 'Reddy Finance Corp',
    customers: 42,
    loans: 30,
    sms: 85,
    activity: 64,
  },
];

function getLinePoints(data, maxValue) {
  const width = 100;
  const height = 100;

  return data
    .map((item, index) => {
      const x =
        (index / (data.length - 1)) * width;

      const y =
        height -
        (item.value / maxValue) * height;

      return `${x},${y}`;
    })
    .join(' ');
}

function AnalyticsLineChart({
  data,
  maxValue,
  type,
}) {
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
          {Math.round(maxValue * 0.75).toLocaleString(
            'en-IN'
          )}
        </span>

        <span>
          {Math.round(maxValue * 0.5).toLocaleString(
            'en-IN'
          )}
        </span>

        <span>
          {Math.round(maxValue * 0.25).toLocaleString(
            'en-IN'
          )}
        </span>

        <span>0</span>
      </div>

      <div className="analytics-chart-area">

        <div className="analytics-grid-lines">
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

export default function AdminUsageAnalytics() {
  const [period, setPeriod] = useState('This Month');

  return (
    <div className="admin-usage-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="usage-page-header">

        <div>
          <h1>Usage Analytics</h1>

          <p>
            Monitor platform usage and performance
            across all financers
          </p>
        </div>

        <select
          className="usage-period-select"
          value={period}
          onChange={(e) =>
            setPeriod(e.target.value)
          }
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 3 Months</option>
          <option>Last 6 Months</option>
          <option>This Year</option>
        </select>

      </div>


      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="usage-stats-grid">

        {analyticsStats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              className={`usage-stat-card ${stat.color}`}
              key={index}
            >

              <div className="usage-stat-content">

                <span className="usage-stat-title">
                  {stat.title}
                </span>

                <strong className="usage-stat-value">
                  {stat.value}
                </strong>

                <span className="usage-stat-description">
                  <b>{stat.change}</b>{' '}
                  {stat.description}
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
        })}

      </div>


      {/* =====================================================
          FIRST CHART ROW
      ====================================================== */}

      <div className="usage-chart-grid">

        {/* CUSTOMER GROWTH */}

        <section className="usage-chart-card">

          <div className="usage-chart-header">
            <div>
              <h2>Customer Usage</h2>
              <p>Total customers registered over time</p>
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
              <h2>Loan Activity</h2>
              <p>Active loans across the platform</p>
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
              <h2>SMS Usage Trend</h2>
              <p>Platform SMS consumption</p>
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


        {/* SUBSCRIPTIONS */}

        <section className="subscription-distribution-card">

          <div className="usage-section-heading">
            <h2>Subscription Distribution</h2>
            <p>Current financer plans</p>
          </div>

          <div className="subscription-content">

            <div className="subscription-donut">

              <div className="donut-ring">

                <div className="donut-center">
                  <strong>125</strong>
                  <span>Financers</span>
                </div>

              </div>

            </div>

            <div className="subscription-legend">

              {subscriptionData.map(
                (item, index) => (
                  <div
                    className="subscription-legend-item"
                    key={index}
                  >

                    <div className="legend-name">

                      <span
                        className={`legend-dot ${item.color}`}
                      />

                      <span>
                        {item.name}
                      </span>

                    </div>

                    <div className="legend-value">
                      <strong>
                        {item.count}
                      </strong>

                      <span>
                        {item.value}%
                      </span>
                    </div>

                  </div>
                )
              )}

            </div>

          </div>

        </section>

      </div>


      {/* =====================================================
          FINANCER ACTIVITY TABLE
      ====================================================== */}

      <section className="financer-activity-card">

        <div className="financer-activity-header">
          <div>
            <h2>Financer Activity</h2>
            <p>
              Usage statistics by financer
            </p>
          </div>
        </div>

        <div className="financer-activity-wrapper">

          <table className="financer-activity-table">

            <thead>
              <tr>
                <th>FINANCER</th>
                <th>CUSTOMERS</th>
                <th>ACTIVE LOANS</th>
                <th>SMS USED</th>
                <th>ACTIVITY</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>

              {financerActivity.map(
                (item, index) => (
                  <tr key={index}>

                    <td className="activity-financer">
                      {item.financer}
                    </td>

                    <td>
                      {item.customers.toLocaleString(
                        'en-IN'
                      )}
                    </td>

                    <td>
                      {item.loans.toLocaleString(
                        'en-IN'
                      )}
                    </td>

                    <td>
                      {item.sms.toLocaleString(
                        'en-IN'
                      )}
                    </td>

                    <td>

                      <div className="activity-progress-cell">

                        <div className="activity-progress">

                          <div
                            className="activity-progress-fill"
                            style={{
                              width: `${item.activity}%`,
                            }}
                          />

                        </div>

                        <span>
                          {item.activity}%
                        </span>

                      </div>

                    </td>

                    <td>
                      <span className="activity-status">
                        Active
                      </span>
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}