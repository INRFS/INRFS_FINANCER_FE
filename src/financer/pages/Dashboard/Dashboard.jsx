import React, { useEffect, useState } from 'react';
import {
  Users,
  Banknote,
  TrendingUp,
  CreditCard,
  Calendar,
  Plus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import StatusBadge from '../../../common/components/StatusBadge';
import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import { formatCurrency, formatLoanNumber } from '../../../common/utils/formatters';
import { platformApi } from '../../../common/services/platformApi';
import { useAuth } from '../../../auth/authState';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState({ totalCustomers: 0, activeLoans: 0, totalPrincipal: 0, principalOutstanding: 0, loanStatusData: [], monthlyCollections: [], upcomingPayments: [] });
  const [pageError, setPageError] = useState('');
  const payments = dashboard.upcomingPayments || [];
  const [recordModalItem, setRecordModalItem] = useState(null);
  const loadDashboard = React.useCallback(() => platformApi.dashboard.financer().then(setDashboard).catch((error) => setPageError(error.message)), []);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  const loanStatusData = (dashboard.loanStatusData || []).map((item, index) => ({ name: item.status, value: item.count, color: ['#74D900', '#10AFE9', '#FFB020', '#F04444'][index % 4] }));
  const monthlyCollections = (dashboard.monthlyCollections || []).map((item) => ({ ...item, collected: item.amount }));
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Financer';

  const handleRecordPayment = (item) => {
    setRecordModalItem(item);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await platformApi.payments.record({ loanId: recordModalItem.loanId, paymentScheduleId: recordModalItem.id, amount: Number(form.get('amount')), receivedAt: new Date().toISOString(), mode: form.get('mode'), externalReference: null, notes: null });
      setRecordModalItem(null);
      await loadDashboard();
    } catch (error) { setPageError(error.message); }
  };

  return (
    <div className="fin-dashboard-page animate-fade-in">
      {pageError && <p role="alert">{pageError}</p>}
      {/* Header Banner */}
      <div className="fin-dashboard-header">
        <div>
          <h1 className="fin-dashboard-title">Welcome, {displayName}</h1>
          <p className="fin-dashboard-subtitle">Here's your loan and customer overview for today.</p>
        </div>
        <div className="fin-dashboard-date-badge">
          <Calendar size={16} /> {new Date().toLocaleDateString('en-IN')}
        </div>
      </div>

      {/* 8 Statistics Cards Grid */}
      <div className="fin-dashboard-stat-grid">
        <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-blue">
            <Users size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">TOTAL CUSTOMERS</span>
            <h2 className="fin-dashboard-stat-value">{dashboard.totalCustomers}</h2>
          </div>
        </div>

        <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-cyan">
            <Banknote size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">ACTIVE LOANS</span>
            <h2 className="fin-dashboard-stat-value">{dashboard.activeLoans}</h2>
          </div>
        </div>

        <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-purple">
            <TrendingUp size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">TOTAL GIVEN</span>
            <h2 className="fin-dashboard-stat-value">{formatCurrency(dashboard.totalPrincipal)}</h2>
            <span className="fin-dashboard-stat-subtext">Principal disbursed</span>
          </div>
        </div>

        <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-navy">
            <CreditCard size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">PRINCIPAL OUTSTANDING</span>
            <h2 className="fin-dashboard-stat-value">{formatCurrency(dashboard.principalOutstanding)}</h2>
            <span className="fin-dashboard-stat-subtext">To be recovered</span>
          </div>
        </div>

      </div>

      {/* Analytics Section Grid */}
      <div className="fin-dashboard-charts-grid">
        <div className="fin-dashboard-chart-card">
          <div className="fin-dashboard-chart-header">
            <div>
              <h3>Collection Overview</h3>
              <p>Monthly interest collected</p>
            </div>
            <div className="fin-dashboard-chart-legend">
              <span className="fin-legend-dot fin-dot-collected" /> Collected
            </div>
          </div>
<div className="fin-dashboard-chart-body">
  <ResponsiveContainer width="100%" height={210}>
    <BarChart
      data={monthlyCollections}
      margin={{ top: 8, right: 8, left: 12, bottom: 0 }}
      barCategoryGap="28%"
    >
      <CartesianGrid
        strokeDasharray="3 3"
        vertical={false}
        stroke="#E1E7ED"
      />

      <XAxis
        dataKey="month"
        tickLine={false}
        axisLine={{ stroke: '#E1E7ED' }}
        tick={{ fontSize: 11, fill: '#64748B' }}
      />

      <YAxis
        tickLine={false}
        axisLine={false}
        width={42}
        tick={{ fontSize: 10, fill: '#64748B' }}
        tickFormatter={(value) => `₹${value / 1000}K`}
      />

      <Tooltip
        formatter={(value) => [
          `₹${Number(value).toLocaleString('en-IN')}`,
          ''
        ]}
      />

      <Bar
        dataKey="collected"
        fill="#10AFE9"
        radius={[3, 3, 0, 0]}
        barSize={16}
      />
    </BarChart>
  </ResponsiveContainer>
</div>
        </div>

        <div className="fin-dashboard-chart-card">
          <div className="fin-dashboard-chart-header">
            <div>
              <h3>Loan Status</h3>
              <p>Distribution of {dashboard.activeLoans} active loans</p>
            </div>
          </div>
          <div className="fin-dashboard-chart-body fin-donut-container">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upcoming & Due Payments Table */}
      <div className="fin-dashboard-payments-card">
        <div className="fin-dashboard-payments-header">
          <div>
            <h3>Upcoming & Due Payments</h3>
            <p>Immediate payments requiring collection action</p>
          </div>
        </div>

        <div className="fin-dashboard-table-container">
          <table className="fin-dashboard-payment-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>LOAN ID</th>
                <th>AMOUNT</th>
                <th>DUE DATE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((row) => {
                const status = row.status || (row.dueDate <= new Date().toISOString().slice(0, 10) ? 'Due' : 'Upcoming');
                return (
                <tr key={row.id}>
                  <td className="fin-tbl-customer-name">{row.customer}</td>
                  <td className="fin-tbl-loan-id" title={row.loanId}>{formatLoanNumber(row)}</td>
                  <td className="fin-tbl-amount">{formatCurrency(row.amount)}</td>
                  <td>{row.dueDate}</td>
                  <td>
                    <StatusBadge status={status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {status !== 'Paid' ? (
                      <Button
                        variant="cyan"
                        size="small"
                        icon={Plus}
                        onClick={() => handleRecordPayment(row)}
                      >
                        Record Payment
                      </Button>
                    ) : (
                      <span className="fin-tbl-paid-done">✓ Recorded</span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {recordModalItem && (
        <Modal
          isOpen={true}
          onClose={() => setRecordModalItem(null)}
          title={`Record Payment for ${recordModalItem.customer}`}
        >
          <form onSubmit={handleConfirmPayment} className="fin-dashboard-modal-form">
            <div className="fin-dashboard-modal-info">
              <div><span>Loan ID:</span> <strong>{formatLoanNumber(recordModalItem)}</strong></div>
              <div><span>Due Amount:</span> <strong>{formatCurrency(recordModalItem.amount)}</strong></div>
            </div>

            <div className="fin-dashboard-input-group">
              <label>Amount Received (₹)</label>
              <input name="amount" type="number" min="0.01" step="0.01" defaultValue={recordModalItem.amount} required />
            </div>

            <div className="fin-dashboard-input-group">
              <label>Payment Mode</label>
              <select name="mode" defaultValue="Upi">
                <option value="Upi">UPI</option>
                <option value="Cash">Cash</option>
                <option value="BankTransfer">Bank Transfer</option>
              </select>
            </div>

            <div className="fin-dashboard-modal-actions">
              <Button type="button" variant="secondary" onClick={() => setRecordModalItem(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="cyan">
                Confirm Payment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
