import React, { useMemo, useState } from 'react';

import {
  Users,
  Check,
  UserRound,
  Hexagon,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Percent,
  WalletCards,
  Clock3,
  ArrowUpRight,
  ChevronRight,
  FileText,
  Settings2,
  Headphones,
  Receipt,
  Send,
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
  Cell,
  PieChart,
  Pie,
} from 'recharts';

import './AdminDashboard.css';

/* =========================================================
   MOCK / API-READY ADMIN DATA
   Based on INRFS Admin BRD
========================================================= */

const dashboardStats = {
  totalFinancers: 125,
  activeFinancers: 110,
  inactiveFinancers: 15,

  totalCustomers: 12450,

  totalLoans: 12500,
  totalPrincipal: 185000000,

  interestActivity: 850000,

  monthlyServiceCharges: 8500,

  collectedCharges: 5050,
  pendingCharges: 2790,
  overdueCharges: 189,

  smsSent: 85420,
};

/* =========================================================
   FINANCER GROWTH
========================================================= */

const financerGrowth = [
  { month: 'Mar', value: 98 },
  { month: 'Apr', value: 105 },
  { month: 'May', value: 110 },
  { month: 'Jun', value: 112 },
  { month: 'Jul', value: 118 },
  { month: 'Aug', value: 125 },
];

/* =========================================================
   PLATFORM GROWTH
========================================================= */

const platformGrowth = [
  { month: 'Mar', customers: 6500, loans: 10000 },
  { month: 'Apr', customers: 7000, loans: 10500 },
  { month: 'May', customers: 7300, loans: 11000 },
  { month: 'Jun', customers: 7500, loans: 11500 },
  { month: 'Jul', customers: 7800, loans: 12000 },
  { month: 'Aug', customers: 12450, loans: 12500 },
];

/* =========================================================
   INRFS REVENUE / SERVICE CHARGE DATA
========================================================= */

const revenueData = [
  { month: 'Mar', serviceCharges: 590, interest: 30 },
  { month: 'Apr', serviceCharges: 650, interest: 38 },
  { month: 'May', serviceCharges: 700, interest: 45 },
  { month: 'Jun', serviceCharges: 750, interest: 48 },
  { month: 'Jul', serviceCharges: 770, interest: 60 },
  { month: 'Aug', serviceCharges: 850, interest: 85 },
];

/* =========================================================
   COLLECTION MIX
========================================================= */

const collectionMix = [
  {
    name: 'Collected',
    value: dashboardStats.collectedCharges,
  },
  {
    name: 'Pending',
    value: dashboardStats.pendingCharges,
  },
  {
    name: 'Overdue',
    value: dashboardStats.overdueCharges,
  },
];

/* =========================================================
   QUICK ACTIONS
========================================================= */

const quickActions = [
  {
    label: 'Manage Financers',
    key: 'financers',
    icon: Users,
    tone: 'cyan',
  },

  {
    label: 'Financer Usage',
    key: 'financer-usage',
    icon: BarChart,
    tone: 'purple',
  },

  {
    label: 'Service Charges',
    key: 'service-charges',
    icon: Settings2,
    tone: 'orange',
  },

  {
    label: 'Monthly Billing',
    key: 'monthly-billing',
    icon: Receipt,
    tone: 'purple',
  },

  {
    label: 'Collections',
    key: 'collections',
    icon: WalletCards,
    tone: 'amber',
  },

  {
    label: 'SMS Management',
    key: 'sms',
    icon: Send,
    tone: 'pink',
  },

  {
    label: 'Reports',
    key: 'reports',
    icon: FileText,
    tone: 'green',
  },

  {
    label: 'Support',
    key: 'support',
    icon: Headphones,
    tone: 'red',
  },
];

/* =========================================================
   STAT CARDS
========================================================= */

const statCards = [
  {
    label: 'TOTAL FINANCERS',
    value: dashboardStats.totalFinancers.toLocaleString('en-IN'),
    sub: '↑ 7 this month',
    icon: Users,
    tone: 'cyan',
  },

  {
    label: 'ACTIVE FINANCERS',
    value: dashboardStats.activeFinancers.toLocaleString('en-IN'),
    sub: '88% active rate',
    icon: Check,
    tone: 'green',
  },

  {
    label: 'INACTIVE FINANCERS',
    value: dashboardStats.inactiveFinancers.toLocaleString('en-IN'),
    sub: '12% of financers',
    icon: Clock3,
    tone: 'orange',
  },

  {
    label: 'TOTAL CUSTOMERS',
    value: dashboardStats.totalCustomers.toLocaleString('en-IN'),
    sub: '↑ 550 this month',
    icon: UserRound,
    tone: 'purple',
  },

  {
    label: 'TOTAL LOANS',
    value: dashboardStats.totalLoans.toLocaleString('en-IN'),
    sub: 'Across all financers',
    icon: Hexagon,
    tone: 'orange',
  },

  {
    label: 'TOTAL PRINCIPAL',
    value: '₹185.0 Cr',
    sub: 'Platform portfolio',
    icon: DollarSign,
    tone: 'cyan',
  },

  {
    label: 'INTEREST ACTIVITY',
    value: '₹8.50 L',
    sub: 'This month',
    icon: Percent,
    tone: 'pink',
  },

  {
    label: 'MONTHLY SERVICE CHARGES',
    value: '₹8,500',
    sub: 'Generated this month',
    icon: TrendingUp,
    tone: 'green',
  },
];

/* =========================================================
   FORMATTERS
========================================================= */

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN')}`;

const formatCompactCurrency = (amount) => {
  const value = Number(amount || 0);

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)} L`;
  }

  return formatCurrency(value);
};

/* =========================================================
   TOOLTIP COMPONENTS
========================================================= */

function FinancerGrowthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="admin-chart-tooltip">
      <strong>{label}</strong>

      <span className="tooltip-cyan">
        Financers:{' '}
        {Number(payload[0].value).toLocaleString('en-IN')}
      </span>
    </div>
  );
}

function PlatformGrowthTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="admin-chart-tooltip">
      <strong>{label}</strong>

      {payload.map((item) => (
        <span
          key={item.dataKey}
          className={
            item.dataKey === 'customers'
              ? 'tooltip-cyan'
              : 'tooltip-purple'
          }
        >
          {item.dataKey === 'customers'
            ? 'Customers'
            : 'Loans'}
          :{' '}
          {Number(item.value).toLocaleString('en-IN')}
        </span>
      ))}
    </div>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="admin-chart-tooltip">
      <strong>{label}</strong>

      <span className="tooltip-green">
        Service charges: ₹
        {Number(payload[0]?.value || 0)}k
      </span>

      <span className="tooltip-amber">
        Interest activity: ₹
        {Number(payload[1]?.value || 0)}k
      </span>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ card }) {
  const Icon = card.icon;

  return (
    <article
      className={`admin-stat-card admin-stat-${card.tone}`}
    >
      <div className="admin-stat-card-content">

        <div
          className={`admin-stat-icon admin-stat-icon-${card.tone}`}
          aria-hidden="true"
        >
          <Icon
            size={20}
            strokeWidth={2}
          />
        </div>

        <div className="admin-stat-copy">

          <span className="admin-stat-label">
            {card.label}
          </span>

          <strong className="admin-stat-value">
            {card.value}
          </strong>

          <span className="admin-stat-sub">
            {card.sub}
          </span>

        </div>
      </div>
    </article>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function AdminDashboard({
  onQuickAction,
}) {
  const [activeAction, setActiveAction] =
    useState(null);

  const collectionTotal = useMemo(
    () =>
      collectionMix.reduce(
        (total, item) => total + item.value,
        0
      ),
    []
  );

  const collectionProgress =
    dashboardStats.monthlyServiceCharges > 0
      ? (
          (dashboardStats.collectedCharges /
            dashboardStats.monthlyServiceCharges) *
          100
        )
      : 0;

  const handleQuickAction = (action) => {
    setActiveAction(action);

    if (typeof onQuickAction === 'function') {
      onQuickAction(action);
    }

    window.dispatchEvent(
      new CustomEvent('inrfs-admin-action', {
        detail: action,
      })
    );
  };

  return (
    <main className="admin-dashboard">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <header className="admin-dashboard-header">
        <div>
          <h1>INRFS Admin</h1>

          <p>
            Platform overview · Last updated: 10 Aug 2026,
            14:32
          </p>
        </div>
      </header>

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <section
        className="admin-dashboard-stats-grid"
        aria-label="Platform statistics"
      >
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            card={card}
          />
        ))}
      </section>

      {/* =====================================================
          MONTHLY SERVICE CHARGE OVERVIEW
      ===================================================== */}

      <section className="admin-service-overview admin-panel">

        <div className="admin-service-header">

          <div>
            <h2>
              Monthly Service Charge Overview
            </h2>

            <p>
              August 2026 · INRFS charges based on
              applicable customer interest
            </p>
          </div>

          <button
            type="button"
            className="admin-outline-button"
            onClick={() =>
              handleQuickAction({
                label: 'Monthly Billing',
                key: 'monthly-billing',
                source: 'service-overview',
              })
            }
          >
            View Full Billing
            <ArrowUpRight size={15} />
          </button>

        </div>

        <div className="admin-service-grid">

          <div className="admin-service-metric metric-cyan">
            <span>
              THIS MONTH'S INTEREST
            </span>

            <strong>
              ₹8,50,000
            </strong>
          </div>

          <div className="admin-service-metric metric-purple">
            <span>
              SERVICE CHARGES GENERATED
            </span>

            <strong>
              ₹8,500
            </strong>
          </div>

          <div className="admin-service-metric metric-green">
            <span>
              COLLECTED
            </span>

            <strong>
              ₹5,050
            </strong>
          </div>

          <div className="admin-service-metric metric-yellow">
            <span>
              PENDING
            </span>

            <strong>
              ₹2,790
            </strong>
          </div>

          <div className="admin-service-metric metric-red">
            <span>
              OVERDUE
            </span>

            <strong>
              ₹189
            </strong>
          </div>

        </div>

        <div className="admin-service-bottom">

          <div className="admin-service-progress">

            <div className="admin-service-progress-head">

              <span>
                Collection progress
              </span>

              <strong>
                {Math.round(collectionProgress)}%
              </strong>

            </div>

            <div className="admin-progress-track">

              <div
                className="admin-progress-fill"
                style={{
                  width: `${collectionProgress}%`,
                }}
              />

            </div>

          </div>

          <div className="admin-mini-collection">

            <PieChart
              width={72}
              height={72}
            >
              <Pie
                data={collectionMix}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={31}
                paddingAngle={2}
                stroke="none"
              >
                <Cell fill="#10AEEF" />
                <Cell fill="#F4C542" />
                <Cell fill="#EF4444" />
              </Pie>
            </PieChart>

            <div>
              <span>
                Collection mix
              </span>

              <strong>
                ₹
                {collectionTotal.toLocaleString(
                  'en-IN'
                )}
              </strong>
            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <section className="admin-dashboard-charts-grid">

        {/* ===================================================
            INRFS REVENUE
        ==================================================== */}

        <article className="admin-chart-card">

          <div className="admin-chart-header">

            <div>
              <h2>
                INRFS Monthly Revenue
              </h2>

              <p>
                Service charge revenue (₹) — last
                6 months
              </p>
            </div>

          </div>

          <div className="admin-chart-body">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={revenueData}
                margin={{
                  top: 12,
                  right: 8,
                  left: -18,
                  bottom: 0,
                }}
                barGap={5}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5EAF0"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: '#8190A5',
                    fontSize: 11,
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: '#8190A5',
                    fontSize: 11,
                  }}
                  domain={[0, 900]}
                  ticks={[
                    0,
                    200,
                    400,
                    600,
                    800,
                  ]}
                />

                <Tooltip
                  content={<RevenueTooltip />}
                  cursor={{
                    fill: 'rgba(16,174,239,.05)',
                  }}
                />

                <Bar
                  dataKey="serviceCharges"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={23}
                >
                  {revenueData.map(
                    (entry, index) => (
                      <Cell
                        key={`service-${entry.month}`}
                        fill={
                          index ===
                          revenueData.length - 1
                            ? '#18C46A'
                            : '#D8F7E6'
                        }
                      />
                    )
                  )}
                </Bar>

                <Bar
                  dataKey="interest"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={23}
                  fill="#F7C83E"
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

          <div className="admin-chart-legend">

            <span>
              <i className="legend-dot legend-green" />
              Service charges
            </span>

            <span>
              <i className="legend-dot legend-yellow" />
              Interest activity
            </span>

          </div>

        </article>

        {/* ===================================================
            PLATFORM GROWTH
        ==================================================== */}

        <article className="admin-chart-card">

          <div className="admin-chart-header">

            <div>
              <h2>
                Financer &amp; Customer Growth
              </h2>

              <p>
                Platform growth trend
              </p>
            </div>

          </div>

          <div className="admin-chart-body">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={platformGrowth}
                margin={{
                  top: 12,
                  right: 8,
                  left: -18,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5EAF0"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: '#8190A5',
                    fontSize: 11,
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: '#8190A5',
                    fontSize: 11,
                  }}
                  domain={[0, 14000]}
                  ticks={[
                    0,
                    3500,
                    7000,
                    10500,
                    14000,
                  ]}
                />

                <Tooltip
                  content={
                    <PlatformGrowthTooltip />
                  }
                  cursor={{
                    stroke: '#DDE4EC',
                    strokeDasharray: '4 4',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="customers"
                  stroke="#10AEEF"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />

                <Line
                  type="monotone"
                  dataKey="loans"
                  stroke="#7D1FE8"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>

          <div className="admin-chart-legend">

            <span>
              <i className="legend-dot legend-cyan" />
              Customers
            </span>

            <span>
              <i className="legend-dot legend-purple" />
              Loans
            </span>

          </div>

        </article>

        {/* ===================================================
            FINANCER GROWTH
        ==================================================== */}

        <article className="admin-chart-card">

          <div className="admin-chart-header">

            <div>
              <h2>
                Financer Growth
              </h2>

              <p>
                Registered financers over time
              </p>
            </div>

          </div>

          <div className="admin-chart-body">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={financerGrowth}
                margin={{
                  top: 12,
                  right: 8,
                  left: -18,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5EAF0"
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: '#8190A5',
                    fontSize: 11,
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: '#8190A5',
                    fontSize: 11,
                  }}
                  domain={[90, 130]}
                  ticks={[
                    90,
                    100,
                    110,
                    120,
                    130,
                  ]}
                />

                <Tooltip
                  content={
                    <FinancerGrowthTooltip />
                  }
                  cursor={{
                    fill: 'rgba(16,174,239,.05)',
                  }}
                />

                <Bar
                  dataKey="value"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={42}
                >
                  {financerGrowth.map(
                    (entry, index) => (
                      <Cell
                        key={`financer-${entry.month}`}
                        fill={
                          index ===
                          financerGrowth.length - 1
                            ? '#10AEEF'
                            : '#D9F4FC'
                        }
                      />
                    )
                  )}
                </Bar>

              </BarChart>
            </ResponsiveContainer>

          </div>

          <div className="admin-chart-legend">

            <span>
              <i className="legend-dot legend-cyan" />
              Registered financers
            </span>

          </div>

        </article>

        {/* ===================================================
            SERVICE CHARGE COLLECTION
        ==================================================== */}

        <article className="admin-chart-card admin-collection-card">

          <div className="admin-chart-header">

            <div>
              <h2>
                Service Charge Collection
              </h2>

              <p>
                Collected, pending and overdue charges
              </p>
            </div>

          </div>

          <div className="admin-donut-layout">

            <div className="admin-donut">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={collectionMix}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={3}
                    stroke="none"
                  >

                    <Cell fill="#18C46A" />
                    <Cell fill="#F4C542" />
                    <Cell fill="#EF4444" />

                  </Pie>

                  <Tooltip
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString(
                        'en-IN'
                      )}`,
                      'Amount',
                    ]}
                  />

                </PieChart>
              </ResponsiveContainer>

              <div className="admin-donut-center">

                <span>
                  Total
                </span>

                <strong>
                  ₹
                  {collectionTotal.toLocaleString(
                    'en-IN'
                  )}
                </strong>

              </div>

            </div>

            <div className="admin-donut-details">

              <div>
                <i className="legend-dot legend-green" />

                <span>
                  Collected
                </span>

                <strong>
                  ₹
                  {dashboardStats.collectedCharges.toLocaleString(
                    'en-IN'
                  )}
                </strong>
              </div>

              <div>
                <i className="legend-dot legend-yellow" />

                <span>
                  Pending
                </span>

                <strong>
                  ₹
                  {dashboardStats.pendingCharges.toLocaleString(
                    'en-IN'
                  )}
                </strong>
              </div>

              <div>
                <i className="legend-dot legend-red" />

                <span>
                  Overdue
                </span>

                <strong>
                  ₹
                  {dashboardStats.overdueCharges.toLocaleString(
                    'en-IN'
                  )}
                </strong>
              </div>

            </div>

          </div>

        </article>

      </section>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="admin-quick-actions admin-panel">

        <div className="admin-quick-header">

          <div>
            <h2>
              Quick Actions
            </h2>

            <p>
              Jump directly to common admin tasks
            </p>
          </div>

        </div>

        <div className="admin-quick-grid">

          {quickActions.map((action) => {

            const Icon = action.icon;

            return (
              <button
                key={action.key}
                type="button"
                className={`admin-quick-button quick-${action.tone}`}
                onClick={() =>
                  handleQuickAction(action)
                }
              >

                <Icon size={15} />

                <span>
                  {action.label}
                </span>

                <ChevronRight
                  className="quick-arrow"
                  size={14}
                />

              </button>
            );
          })}

        </div>

      </section>

      {/* =====================================================
          ACTION FEEDBACK
      ===================================================== */}

      {activeAction && (
        <div
          className="admin-action-toast"
          role="status"
        >

          <div className="admin-toast-icon">
            <Check size={16} />
          </div>

          <div>
            <strong>
              {activeAction.label}
            </strong>

            <span>
              Action selected successfully.
            </span>
          </div>

          <button
            type="button"
            aria-label="Close notification"
            onClick={() =>
              setActiveAction(null)
            }
          >
            <X size={16} />
          </button>

        </div>
      )}

    </main>
  );
}