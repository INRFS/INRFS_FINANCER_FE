import React from 'react';
import {
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Coins,
} from 'lucide-react';

import './AdminSMSManagement.css';

const smsStats = [
  {
    label: 'SENT TODAY',
    value: '2,841',
    type: 'cyan',
  },
  {
    label: 'SENT THIS MONTH',
    value: '85,420',
    type: 'purple',
  },
  {
    label: 'DELIVERED',
    value: '83,210',
    type: 'green',
  },
  {
    label: 'FAILED',
    value: '2,210',
    type: 'red',
  },
  {
    label: 'CREDITS REMAINING',
    value: '14,545',
    type: 'orange',
  },
];

const financerUsage = [
  {
    name: 'Patel',
    used: 1240,
    allocated: 2000,
  },
  {
    name: 'Singh',
    used: 890,
    allocated: 2000,
  },
  {
    name: 'Jain',
    used: 620,
    allocated: 2000,
  },
  {
    name: 'Khan',
    used: 450,
    allocated: 2000,
  },
  {
    name: 'Sharma',
    used: 320,
    allocated: 2000,
  },
  {
    name: 'Reddy',
    used: 85,
    allocated: 500,
  },
  {
    name: 'Verma',
    used: 40,
    allocated: 500,
  },
];

const smsTableData = [
  {
    financer: 'Patel Finance Services',
    allocated: 2000,
    used: 1240,
    remaining: 760,
    usage: 62,
    status: 'Normal',
  },
  {
    financer: 'Singh Credit Solutions',
    allocated: 2000,
    used: 890,
    remaining: 1110,
    usage: 45,
    status: 'Normal',
  },
  {
    financer: 'Jain Money Solutions',
    allocated: 2000,
    used: 620,
    remaining: 1380,
    usage: 31,
    status: 'Normal',
  },
  {
    financer: 'Khan Financial',
    allocated: 2000,
    used: 450,
    remaining: 1550,
    usage: 23,
    status: 'Normal',
  },
  {
    financer: 'Sharma Money Lenders',
    allocated: 2000,
    used: 320,
    remaining: 1680,
    usage: 16,
    status: 'Normal',
  },
  {
    financer: 'Reddy Finance Corp',
    allocated: 500,
    used: 85,
    remaining: 415,
    usage: 17,
    status: 'Normal',
  },
  {
    financer: 'Verma Capital',
    allocated: 500,
    used: 40,
    remaining: 460,
    usage: 8,
    status: 'Normal',
  },
];

const maxUsage = 1800;

function formatNumber(number) {
  return number.toLocaleString('en-IN');
}

export default function AdminSMSManagement() {
  return (
    <div className="admin-sms-page">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="sms-page-header">
        <h1>SMS Management</h1>
        <p>Monitor SMS usage across all financers</p>
      </div>


      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <div className="sms-kpi-grid">
        {smsStats.map((stat, index) => (
          <div
            className={`sms-kpi-card ${stat.type}`}
            key={index}
          >
            <span className="sms-kpi-label">
              {stat.label}
            </span>

            <strong className="sms-kpi-value">
              {stat.value}
            </strong>
          </div>
        ))}
      </div>


      {/* =====================================================
          CHART + QUICK STATS
      ====================================================== */}

      <div className="sms-middle-grid">

        {/* SMS USAGE CHART */}

        <section className="sms-chart-card">

          <div className="sms-section-title">
            SMS Usage by Financer
          </div>

          <div className="sms-chart-container">

            <div className="sms-chart">

              {financerUsage.map((item, index) => {
                const usedWidth =
                  (item.used / maxUsage) * 100;

                const allocatedWidth =
                  (item.allocated / maxUsage) * 100;

                return (
                  <div
                    className="sms-chart-row"
                    key={index}
                  >

                    <div className="sms-chart-name">
                      {item.name}
                    </div>

                    <div className="sms-chart-bars">

                      {/* allocated / background bar */}
                      <div
                        className="sms-chart-background"
                        style={{
                          width: `${allocatedWidth}%`,
                        }}
                      />

                      {/* used bar */}
                      <div
                        className="sms-chart-used"
                        style={{
                          width: `${usedWidth}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              })}

              {/* X AXIS */}

              <div className="sms-chart-axis">

                <span>0</span>
                <span>450</span>
                <span>900</span>
                <span>1350</span>
                <span>1800</span>

              </div>

            </div>

          </div>

        </section>


        {/* QUICK STATS */}

        <section className="sms-quick-stats">

          <div className="sms-section-title">
            Quick Stats
          </div>

          <div className="quick-stat-box delivery">

            <div className="quick-stat-label">
              Delivery Rate
            </div>

            <div className="quick-stat-value">
              97.4%
            </div>

            <div className="quick-stat-progress">
              <div
                className="quick-stat-progress-fill"
                style={{ width: '97.4%' }}
              />
            </div>

          </div>


          <div className="quick-stat-box credits">

            <div className="quick-stat-label">
              Platform Credits Used
            </div>

            <div className="quick-stat-value">
              85,420
            </div>

            <div className="quick-stat-total">
              of 100,000 total
            </div>

            <div className="quick-stat-progress">
              <div
                className="quick-stat-progress-fill"
                style={{ width: '85.42%' }}
              />
            </div>

          </div>

        </section>

      </div>


      {/* =====================================================
          FINANCER SMS USAGE TABLE
      ====================================================== */}

      <section className="sms-table-card">

        <div className="sms-table-header">
          <h2>Financer SMS Usage</h2>
        </div>

        <div className="sms-table-wrapper">

          <table className="sms-table">

            <thead>
              <tr>
                <th>FINANCER</th>
                <th>ALLOCATED</th>
                <th>USED</th>
                <th>REMAINING</th>
                <th>USAGE %</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>

              {smsTableData.map((item, index) => (
                <tr key={index}>

                  {/* FINANCER */}

                  <td className="sms-financer-name">
                    {item.financer}
                  </td>


                  {/* ALLOCATED */}

                  <td>
                    {formatNumber(item.allocated)}
                  </td>


                  {/* USED */}

                  <td className="sms-used-value">
                    {formatNumber(item.used)}
                  </td>


                  {/* REMAINING */}

                  <td>
                    {formatNumber(item.remaining)}
                  </td>


                  {/* USAGE */}

                  <td>

                    <div className="usage-cell">

                      <div className="usage-progress">

                        <div
                          className="usage-progress-fill"
                          style={{
                            width: `${item.usage}%`,
                          }}
                        />

                      </div>

                      <span className="usage-percentage">
                        {item.usage}%
                      </span>

                    </div>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span className="sms-status-normal">
                      {item.status}
                    </span>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </section>

    </div>
  );
}