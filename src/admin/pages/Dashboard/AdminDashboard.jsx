import React, { useEffect, useMemo, useState } from 'react';

import {
  Users,
  Check,
  UserRound,
  Hexagon,
  DollarSign,
  TrendingUp,
  Percent,
  WalletCards,
  Clock3,
  ArrowUpRight,
  FileText,
  Settings2,
  Headphones,
  Receipt,
  Send,
  Search,
  Building2,
  Activity,
  ChevronDown,
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

import { platformApi } from '../../../common/services/platformApi';
import { pageItems } from '../../../common/services/platformApi';

import './AdminDashboard.css';

/* =========================================================
   INRFS ADMIN DASHBOARD
   Financer Usage is intentionally merged into this page.
   Keep the Dashboard route as the single admin overview.
========================================================= */

const dashboardStats = {
  totalFinancers: 0,
  activeFinancers: 0,
  inactiveFinancers: 0,

  totalCustomers: 0,
  totalLoans: 0,

  totalPrincipal: 0,
  interestActivity: 0,

  monthlyServiceCharges: 0,
  collectedCharges: 0,
  pendingCharges: 0,
  overdueCharges: 0,

  totalTransactions: 0,
  smsSent: 0,
};

const statCards = [
  {
    label: 'TOTAL FINANCERS',
    value: dashboardStats.totalFinancers,
    sub: 'Registered organizations',
    icon: Users,
    tone: 'cyan',
  },
  {
    label: 'ACTIVE FINANCERS',
    value: dashboardStats.activeFinancers,
    sub: 'Currently active',
    icon: Check,
    tone: 'green',
  },
  {
    label: 'INACTIVE FINANCERS',
    value: dashboardStats.inactiveFinancers,
    sub: 'Not currently active',
    icon: Clock3,
    tone: 'orange',
  },
  {
    label: 'TOTAL CUSTOMERS',
    value: dashboardStats.totalCustomers,
    sub: 'Across all financers',
    icon: UserRound,
    tone: 'purple',
  },
  {
    label: 'TOTAL LOANS',
    value: dashboardStats.totalLoans,
    sub: 'Across all financers',
    icon: Hexagon,
    tone: 'orange',
  },
  {
    label: 'TOTAL PRINCIPAL',
    value: '₹0',
    sub: 'Platform portfolio',
    icon: DollarSign,
    tone: 'cyan',
  },
  {
    label: 'INTEREST ACTIVITY',
    value: '₹0',
    sub: 'This month',
    icon: Percent,
    tone: 'pink',
  },
  {
    label: 'MONTHLY SERVICE CHARGES',
    value: '₹0',
    sub: 'Generated this month',
    icon: TrendingUp,
    tone: 'green',
  },
];

const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN');

const getActivityPercentage = (item) => {
  const customerScore = Math.min(
    Number(item.customerCount || 0) / 5,
    25
  );

  const loanScore = Math.min(
    Number(item.loanCount || 0) / 4,
    25
  );

  const transactionScore = Math.min(
    Number(item.transactionCount || 0) / 30,
    25
  );

  const smsScore = Math.min(
    Number(item.smsActivity || 0) / 500,
    25
  );

  return Math.min(
    100,
    Math.round(
      customerScore +
        loanScore +
        transactionScore +
        smsScore
    )
  );
};

const getStatusClass = (status) => {
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
};

const getServiceChargeClass = (status) => {
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
};

function StatCard({ card }) {
  const Icon = card.icon;

  return (
    <article
      className={`inrfs-admin-stat-card inrfs-admin-stat-${card.tone}`}
    >
      <div className="inrfs-admin-stat-content">
        <div
          className={`inrfs-admin-stat-icon inrfs-admin-stat-icon-${card.tone}`}
          aria-hidden="true"
        >
          <Icon size={20} strokeWidth={2} />
        </div>

        <div className="inrfs-admin-stat-copy">
          <span className="inrfs-admin-stat-label">
            {card.label}
          </span>

          <strong className="inrfs-admin-stat-value">
            {typeof card.value === 'number'
              ? formatNumber(card.value)
              : card.value}
          </strong>

          <span className="inrfs-admin-stat-sub">
            {card.sub}
          </span>
        </div>
      </div>
    </article>
  );
}

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="inrfs-admin-tooltip">
      <strong>{label}</strong>

      <span className="tooltip-green">
        Service charges: ₹{Number(payload[0]?.value || 0)}k
      </span>

      <span className="tooltip-amber">
        Interest activity: ₹{Number(payload[1]?.value || 0)}k
      </span>
    </div>
  );
}

function PlatformTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="inrfs-admin-tooltip">
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
          : {formatNumber(item.value)}
        </span>
      ))}
    </div>
  );
}

function FinancerGrowthTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="inrfs-admin-tooltip">
      <strong>{label}</strong>

      <span className="tooltip-cyan">
        Financers: {formatNumber(payload[0]?.value)}
      </span>
    </div>
  );
}

function SmsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="inrfs-admin-tooltip">
      <strong>{label}</strong>

      <span className="tooltip-pink">
        SMS: {formatNumber(payload[0]?.value)}
      </span>
    </div>
  );
}

export default function AdminDashboard({
  onQuickAction,
}) {
  const [period, setPeriod] = useState('This Month');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('All');
  const [serviceChargeFilter, setServiceChargeFilter] =
    useState('All');

  const [activeAction, setActiveAction] =
    useState(null);
  const [financerUsageData, setFinancerUsageData] = useState([]);
  const [liveDashboard, setLiveDashboard] = useState(null);
  const [billingSummary, setBillingSummary] = useState({ interest: 0, generated: 0, collected: 0, pending: 0, overdue: 0 });
  const [pageError, setPageError] = useState('');
  useEffect(() => {
    Promise.all([platformApi.dashboard.admin(), platformApi.admin.allFinancers(), platformApi.admin.billing({ pageSize: 100 })]).then(async ([dashboard, financersPayload, billingPayload]) => {
      setLiveDashboard(dashboard);
      const monthKey = new Date().toISOString().slice(0, 7);
      const invoices = pageItems(billingPayload).filter((item) => String(item.periodStart || '').startsWith(monthKey));
      const invoiceByFinancer = new Map(invoices.map((item) => [item.financerId, item]));
      setBillingSummary(invoices.reduce((summary, item) => {
        const charge = Number(item.chargeAmount || 0);
        const collected = Number(item.collectedAmount || 0);
        const outstanding = Math.max(0, charge - collected);
        summary.interest += Number(item.interestActivity || 0);
        summary.generated += charge;
        summary.collected += collected;
        if (item.status === 'Overdue') summary.overdue += outstanding;
        else summary.pending += outstanding;
        return summary;
      }, { interest: 0, generated: 0, collected: 0, pending: 0, overdue: 0 }));
      const usage = await Promise.all(pageItems(financersPayload).map(async (financer) => {
        const data = await platformApi.admin.financerUsage(financer.id);
        return { financerId: financer.id, financerName: financer.displayName, status: financer.status, customerCount: data.totalCustomers, loanCount: data.activeLoans + data.overdueLoans, transactionCount: data.upcomingPayments?.length || 0, smsActivity: 0, principalAmount: data.totalPrincipal, serviceChargeStatus: invoiceByFinancer.get(financer.id)?.status || 'Not Generated' };
      }));
      setFinancerUsageData(usage);
    }).catch((error) => setPageError(error.message));
  }, []);
  const activeFinancers = financerUsageData.filter((item) => item.status === 'Active').length;
  const inactiveFinancers = Math.max(0, financerUsageData.length - activeFinancers);
  const currentMonth = new Date().toLocaleDateString('en-IN', { month: 'short' });
  const financerGrowth = financerUsageData.length ? [{ month: currentMonth, value: financerUsageData.length }] : [];
  const platformGrowth = liveDashboard ? [{ month: currentMonth, customers: liveDashboard.totalCustomers || 0, loans: (liveDashboard.activeLoans || 0) + (liveDashboard.overdueLoans || 0) }] : [];
  const revenueData = (liveDashboard?.monthlyCollections || []).map((item) => ({ month: item.month, serviceCharges: 0, interest: Number(item.amount || 0) }));
  const smsData = [];
  const collectionMix = [
    { name: 'Collected', value: billingSummary.collected },
    { name: 'Pending', value: billingSummary.pending },
    { name: 'Overdue', value: billingSummary.overdue },
  ];
  const liveStatCards = statCards.map((card) => {
    const values = {
      'TOTAL FINANCERS': liveDashboard?.totalFinancers,
      'ACTIVE FINANCERS': activeFinancers,
      'INACTIVE FINANCERS': inactiveFinancers,
      'TOTAL CUSTOMERS': liveDashboard?.totalCustomers,
      'TOTAL LOANS': liveDashboard ? liveDashboard.activeLoans + liveDashboard.overdueLoans : undefined,
      'TOTAL PRINCIPAL': liveDashboard ? `₹${Number(liveDashboard.totalPrincipal || 0).toLocaleString('en-IN')}` : undefined,
      'INTEREST ACTIVITY': liveDashboard ? `₹${Number(liveDashboard.collections || 0).toLocaleString('en-IN')}` : undefined,
      'MONTHLY SERVICE CHARGES': `₹${billingSummary.generated.toLocaleString('en-IN')}`,
    };
    return values[card.label] === undefined ? card : { ...card, value: values[card.label] };
  });

  const filteredFinancers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return financerUsageData.filter((item) => {
      const matchesSearch =
        !value ||
        item.financerName
          ?.toLowerCase()
          .includes(value) ||
        item.financerId
          ?.toLowerCase()
          .includes(value);

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
    });
  }, [
    financerUsageData,
    search,
    statusFilter,
    serviceChargeFilter,
  ]);

  const collectionTotal = collectionMix.reduce(
    (total, item) => total + item.value,
    0
  );

  const collectionProgress =
    billingSummary.generated > 0
      ? Math.min(
          100,
          (billingSummary.collected /
            billingSummary.generated) *
            100
        )
      : 0;

  const statusDistribution = [
    {
      name: 'Active',
      value: activeFinancers,
    },
    {
      name: 'Inactive',
      value: financerUsageData.filter((item) => item.status === 'Inactive').length,
    },
    {
      name: 'Suspended',
      value: financerUsageData.filter((item) => item.status === 'Suspended').length,
    },
  ];

  const handleAction = (action) => {
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
    <main className="inrfs-admin-dashboard">
      {pageError && <p role="alert">{pageError}</p>}
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="inrfs-admin-page-header">
        <div>
          <span className="inrfs-admin-eyebrow">
            ADMIN PORTAL
          </span>

          <h1>INRFS Admin</h1>

          <p>
            Platform overview · Last updated: {new Date().toLocaleString('en-IN')}
          </p>
        </div>

        <label className="inrfs-admin-period-control">
          <span className="sr-only">
            Dashboard period
          </span>

          <select
            value={period}
            onChange={(event) =>
              setPeriod(event.target.value)
            }
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>This Year</option>
          </select>

          <ChevronDown size={16} />
        </label>
      </header>

      {/* =====================================================
          PLATFORM KPI CARDS
      ===================================================== */}

      <section
        className="inrfs-admin-stats-grid"
        aria-label="Platform statistics"
      >
        {liveStatCards.map((card) => (
          <StatCard
            key={card.label}
            card={card}
          />
        ))}
      </section>

      {/* =====================================================
          SERVICE CHARGE OVERVIEW
      ===================================================== */}

      <section className="inrfs-admin-service-card">
        <div className="inrfs-admin-service-header">
          <div>
            <h2>Monthly Service Charge Overview</h2>
            <p>
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} · INRFS charges based on
              applicable customer interest
            </p>
          </div>

          <button
            type="button"
            className="inrfs-admin-outline-button"
            onClick={() =>
              handleAction({
                label: 'Monthly Billing',
                key: 'monthly-billing',
                source: 'dashboard',
              })
            }
          >
            View Full Billing
            <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="inrfs-admin-service-metrics">
          <div className="inrfs-admin-service-metric metric-cyan">
            <span>THIS MONTH'S INTEREST</span>
            <strong>₹{billingSummary.interest.toLocaleString('en-IN')}</strong>
          </div>

          <div className="inrfs-admin-service-metric metric-purple">
            <span>SERVICE CHARGES GENERATED</span>
            <strong>₹{billingSummary.generated.toLocaleString('en-IN')}</strong>
          </div>

          <div className="inrfs-admin-service-metric metric-green">
            <span>COLLECTED</span>
            <strong>₹{billingSummary.collected.toLocaleString('en-IN')}</strong>
          </div>

          <div className="inrfs-admin-service-metric metric-yellow">
            <span>PENDING</span>
            <strong>₹{billingSummary.pending.toLocaleString('en-IN')}</strong>
          </div>

          <div className="inrfs-admin-service-metric metric-red">
            <span>OVERDUE</span>
            <strong>₹{billingSummary.overdue.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="inrfs-admin-service-footer">
          <div className="inrfs-admin-collection-progress">
            <div className="inrfs-admin-progress-heading">
              <span>Collection progress</span>
              <strong>
                {Math.round(collectionProgress)}%
              </strong>
            </div>

            <div className="inrfs-admin-progress-track">
              <div
                className="inrfs-admin-progress-fill"
                style={{
                  width: `${collectionProgress}%`,
                }}
              />
            </div>
          </div>

          <div className="inrfs-admin-mini-mix">
            <PieChart width={72} height={72}>
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
              <span>Collection mix</span>
              <strong>
                ₹{collectionTotal.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DASHBOARD CHARTS
      ===================================================== */}

      <section className="inrfs-admin-chart-grid">
        <article className="inrfs-admin-chart-card">
          <div className="inrfs-admin-chart-header">
            <div>
              <h2>INRFS Monthly Revenue</h2>
              <p>
                Service charge revenue and interest
                activity — last 6 months
              </p>
            </div>
          </div>

          <div className="inrfs-admin-chart-body">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={revenueData}
                margin={{
                  top: 10,
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
                />

                <Bar
                  dataKey="serviceCharges"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                >
                  {revenueData.map(
                    (entry, index) => (
                      <Cell
                        key={entry.month}
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
                  maxBarSize={24}
                  fill="#F7C83E"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="inrfs-admin-chart-legend">
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

        <article className="inrfs-admin-chart-card">
          <div className="inrfs-admin-chart-header">
            <div>
              <h2>Customer & Loan Growth</h2>
              <p>
                Platform growth trend across the
                last 6 months
              </p>
            </div>
          </div>

          <div className="inrfs-admin-chart-body">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={platformGrowth}
                margin={{
                  top: 10,
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
                  content={<PlatformTooltip />}
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

          <div className="inrfs-admin-chart-legend">
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

        <article className="inrfs-admin-chart-card">
          <div className="inrfs-admin-chart-header">
            <div>
              <h2>SMS Usage Trend</h2>
              <p>
                Platform SMS activity over the last
                6 months
              </p>
            </div>

            <span className="inrfs-admin-chart-pill pill-pink">
              SMS
            </span>
          </div>

          <div className="inrfs-admin-chart-body">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={smsData}
                margin={{
                  top: 10,
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
                  domain={[0, 100000]}
                  ticks={[
                    0,
                    25000,
                    50000,
                    75000,
                    100000,
                  ]}
                />

                <Tooltip
                  content={<SmsTooltip />}
                />

                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#EC168C"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="inrfs-admin-chart-legend">
            <span>
              <i className="legend-dot legend-pink" />
              SMS activity
            </span>

            <strong className="inrfs-admin-chart-total">
              {formatNumber(dashboardStats.smsSent)} this month
            </strong>
          </div>
        </article>

        <article className="inrfs-admin-chart-card">
          <div className="inrfs-admin-chart-header">
            <div>
              <h2>Financer Growth & Status</h2>
              <p>
                Registered financers and current
                account distribution
              </p>
            </div>
          </div>

          <div className="inrfs-admin-financer-status-layout">
            <div className="inrfs-admin-financer-growth">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={financerGrowth}
                  margin={{
                    top: 10,
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
                  />

                  <Bar
                    dataKey="value"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={34}
                  >
                    {financerGrowth.map(
                      (entry, index) => (
                        <Cell
                          key={entry.month}
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

            <div className="inrfs-admin-status-summary">
              <div className="inrfs-admin-status-donut">
                <PieChart width={150} height={150}>
                  <Pie
                    data={statusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={43}
                    outerRadius={62}
                    paddingAngle={3}
                    stroke="none"
                  >
                    <Cell fill="#18C46A" />
                    <Cell fill="#10AEEF" />
                    <Cell fill="#F59E0B" />
                  </Pie>
                </PieChart>

                <div className="inrfs-admin-donut-center">
                  <strong>
                    {dashboardStats.totalFinancers}
                  </strong>
                  <span>Financers</span>
                </div>
              </div>

              <div className="inrfs-admin-status-list">
                <div>
                  <span>
                    <i className="legend-dot legend-green" />
                    Active
                  </span>
                  <strong>
                    {dashboardStats.activeFinancers}
                  </strong>
                </div>

                <div>
                  <span>
                    <i className="legend-dot legend-cyan" />
                    Inactive
                  </span>
                  <strong>
                    {dashboardStats.inactiveFinancers}
                  </strong>
                </div>

                <div>
                  <span>
                    <i className="legend-dot legend-orange" />
                    Suspended
                  </span>
                  <strong>0</strong>
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* =====================================================
          MERGED FINANCER USAGE MONITORING
      ===================================================== */}

      <section className="inrfs-admin-usage-card">
        <div className="inrfs-admin-usage-header">
          <div>
            <div className="inrfs-admin-section-kicker">
              FINANCER MONITORING
            </div>

            <h2>Financer Usage Monitoring</h2>

            <p>
              Monitor customer, loan, transaction,
              SMS and service-charge activity from
              the same admin dashboard.
            </p>
          </div>

          <div className="inrfs-admin-usage-header-meta">
            <span>
              {filteredFinancers.length} financer records
            </span>

            <button
              type="button"
              onClick={() =>
                handleAction({
                  key: 'financers',
                  label: 'Manage Financers',
                  source: 'usage-monitoring',
                })
              }
            >
              Manage Financers
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <div className="inrfs-admin-usage-filters">
          <label className="inrfs-admin-search-box">
            <Search size={16} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search financer or ID..."
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">
              All Statuses
            </option>
            <option value="Active">Active</option>
            <option value="Inactive">
              Inactive
            </option>
            <option value="Suspended">
              Suspended
            </option>
          </select>

          <select
            value={serviceChargeFilter}
            onChange={(event) =>
              setServiceChargeFilter(
                event.target.value
              )
            }
          >
            <option value="All">
              All Service Charges
            </option>
            <option value="Paid">Paid</option>
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

        <div className="inrfs-admin-table-scroll">
          <table className="inrfs-admin-usage-table">
            <thead>
              <tr>
                <th>FINANCER</th>
                <th>REGISTRATION</th>
                <th>LAST LOGIN</th>
                <th>CUSTOMERS</th>
                <th>LOANS</th>
                <th>TRANSACTIONS</th>
                <th>SMS ACTIVITY</th>
                <th>ACTIVITY</th>
                <th>STATUS</th>
                <th>SERVICE CHARGE</th>
              </tr>
            </thead>

            <tbody>
              {filteredFinancers.length > 0 ? (
                filteredFinancers.map((item) => {
                  const activity =
                    getActivityPercentage(item);

                  return (
                    <tr key={item.financerId}>
                      <td className="inrfs-admin-financer-cell">
                        <div className="inrfs-admin-financer-identity">
                          <div className="inrfs-admin-financer-icon">
                            <Building2 size={17} />
                          </div>

                          <div>
                            <strong>
                              {item.financerName}
                            </strong>

                            <span>
                              {item.financerId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>{item.registrationDate}</td>
                      <td>{item.lastLogin}</td>
                      <td>
                        {formatNumber(
                          item.customerCount
                        )}
                      </td>
                      <td>
                        {formatNumber(
                          item.loanCount
                        )}
                      </td>
                      <td>
                        {formatNumber(
                          item.transactionCount
                        )}
                      </td>
                      <td>
                        {formatNumber(
                          item.smsActivity
                        )}
                      </td>

                      <td>
                        <div className="inrfs-admin-activity-cell">
                          <div className="inrfs-admin-activity-track">
                            <div
                              className="inrfs-admin-activity-fill"
                              style={{
                                width: `${activity}%`,
                              }}
                            />
                          </div>

                          <span>{activity}%</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`inrfs-admin-status-badge ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`inrfs-admin-status-badge ${getServiceChargeClass(
                            item.serviceChargeStatus
                          )}`}
                        >
                          {item.serviceChargeStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="10"
                    className="inrfs-admin-empty-state"
                  >
                    No financers found matching the
                    selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="inrfs-admin-monitoring-note">
          <div>
            <Activity size={18} />

            <div>
              <strong>Usage monitoring</strong>
              <span>
                Usage data includes customer, loan,
                transaction and SMS activity for each
                financer.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              handleAction({
                key: 'financers',
                label: 'Manage Financers',
                source: 'monitoring-note',
              })
            }
          >
            Open Financers
            <ArrowUpRight size={14} />
          </button>
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS
          No "Financer Usage" item here anymore.
      ===================================================== */}

      <section className="inrfs-admin-quick-actions">
        <div className="inrfs-admin-quick-header">
          <div>
            <h2>Quick Actions</h2>
            <p>
              Jump directly to common admin tasks.
            </p>
          </div>
        </div>

        <div className="inrfs-admin-quick-grid">
          {[
            {
              label: 'Manage Financers',
              key: 'financers',
              icon: Users,
              tone: 'cyan',
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
          ].map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.key}
                type="button"
                className={`inrfs-admin-quick-button quick-${action.tone}`}
                onClick={() =>
                  handleAction(action)
                }
              >
                <Icon size={15} />
                <span>{action.label}</span>
                <ArrowUpRight
                  className="inrfs-admin-quick-arrow"
                  size={14}
                />
              </button>
            );
          })}
        </div>
      </section>

      {activeAction && (
        <div
          className="inrfs-admin-action-toast"
          role="status"
        >
          <div className="inrfs-admin-toast-icon">
            <Check size={16} />
          </div>

          <div>
            <strong>{activeAction.label}</strong>
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
            ×
          </button>
        </div>
      )}
    </main>
  );
}
