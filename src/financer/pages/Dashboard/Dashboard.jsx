import React, { useState } from 'react';
import {
  Users,
  Banknote,
  TrendingUp,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowUpRight,
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
import { formatCurrency } from '../../../common/utils/formatters';
import {
  mockDashboardStats,
  mockLoanStatusData,
  mockMonthlyCollectionsData,
  mockUpcomingPayments
} from '../../data/mockFinancerData';
import './Dashboard.css';

export default function Dashboard() {
  const [payments, setPayments] = useState(mockUpcomingPayments);
  const [recordModalItem, setRecordModalItem] = useState(null);

  const handleRecordPayment = (item) => {
    setRecordModalItem(item);
  };

  const handleConfirmPayment = (e) => {
    e.preventDefault();
    setPayments(payments.map(p => p.id === recordModalItem.id ? { ...p, status: 'Paid' } : p));
    setRecordModalItem(null);
  };

  return (
    <div className="fin-dashboard-page animate-fade-in">
      {/* Header Banner */}
      <div className="fin-dashboard-header">
        <div>
          <h1 className="fin-dashboard-title">Good Evening, Suresh 👋</h1>
          <p className="fin-dashboard-subtitle">Here's your loan and customer overview for today.</p>
        </div>
        <div className="fin-dashboard-date-badge">
          <Calendar size={16} /> 10-Sep-2026
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
            <h2 className="fin-dashboard-stat-value">{mockDashboardStats.totalCustomers}</h2>
            <span className="fin-dashboard-stat-growth fin-growth-up">{mockDashboardStats.totalCustomersGrowth}</span>
          </div>
        </div>

        <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-cyan">
            <Banknote size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">ACTIVE LOANS</span>
            <h2 className="fin-dashboard-stat-value">{mockDashboardStats.activeLoans}</h2>
            <span className="fin-dashboard-stat-subtext">{mockDashboardStats.activeLoansGrowth}</span>
          </div>
        </div>

        <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-purple">
            <TrendingUp size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">TOTAL GIVEN</span>
            <h2 className="fin-dashboard-stat-value">{formatCurrency(mockDashboardStats.totalGiven)}</h2>
            <span className="fin-dashboard-stat-subtext">Principal disbursed</span>
          </div>
        </div>

        <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-navy">
            <CreditCard size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">PRINCIPAL OUTSTANDING</span>
            <h2 className="fin-dashboard-stat-value">{formatCurrency(mockDashboardStats.principalOutstanding)}</h2>
            <span className="fin-dashboard-stat-subtext">To be recovered</span>
          </div>
        </div>

        {/* <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-orange">
            <Clock size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">INTEREST DUE TODAY</span>
            <h2 className="fin-dashboard-stat-value">{formatCurrency(mockDashboardStats.interestDueToday)}</h2>
            <span className="fin-dashboard-stat-subtext">Due for collection</span>
          </div>
        </div>

        <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-green">
            <CheckCircle2 size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">INTEREST RECEIVED</span>
            <h2 className="fin-dashboard-stat-value">{formatCurrency(mockDashboardStats.interestReceived)}</h2>
            <span className="fin-dashboard-stat-growth fin-growth-up">{mockDashboardStats.interestReceivedGrowth}</span>
          </div>
        </div>

        <div className="fin-dashboard-stat-card">
          <div className="fin-dashboard-stat-icon-bg fin-stat-amber">
            <Clock size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">PENDING INTEREST</span>
            <h2 className="fin-dashboard-stat-value">{formatCurrency(mockDashboardStats.pendingInterest)}</h2>
            <span className="fin-dashboard-stat-subtext">Across active loans</span>
          </div>
        </div> */}

        {/* <div className="fin-dashboard-stat-card fin-stat-card-highlight-red">
          <div className="fin-dashboard-stat-icon-bg fin-stat-red">
            <AlertOctagon size={22} />
          </div>
          <div className="fin-dashboard-stat-content">
            <span className="fin-dashboard-stat-label">OVERDUE AMOUNT</span>
            <h2 className="fin-dashboard-stat-value fin-value-red">{formatCurrency(mockDashboardStats.overdueAmount)}</h2>
            <span className="fin-dashboard-stat-subtext fin-text-red">{mockDashboardStats.overdueAccountsCount} accounts overdue</span>
          </div>
        </div> */}
      </div>

      {/* Analytics Section Grid */}
      <div className="fin-dashboard-charts-grid">
        <div className="fin-dashboard-chart-card">
          <div className="fin-dashboard-chart-header">
            <div>
              <h3>Collection Overview</h3>
              <p>Monthly interest collections vs expected</p>
            </div>
            <div className="fin-dashboard-chart-legend">
              <span className="fin-legend-dot fin-dot-expected" /> Expected
              <span className="fin-legend-dot fin-dot-collected" /> Collected
            </div>
          </div>
          <div className="fin-dashboard-chart-body">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mockMonthlyCollectionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E1E7ED" />
                <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E1E7ED' }} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(val) => [`₹${val}`, '']} />
                <Bar dataKey="expected" fill="#E1E7ED" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" fill="#10AFE9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="fin-dashboard-chart-card">
          <div className="fin-dashboard-chart-header">
            <div>
              <h3>Loan Status</h3>
              <p>Distribution of 180 active loans</p>
            </div>
          </div>
          <div className="fin-dashboard-chart-body fin-donut-container">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={mockLoanStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockLoanStatusData.map((entry, index) => (
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
              {payments.map((row) => (
                <tr key={row.id}>
                  <td className="fin-tbl-customer-name">{row.customer}</td>
                  <td className="fin-tbl-loan-id">{row.loanId}</td>
                  <td className="fin-tbl-amount">{formatCurrency(row.amount)}</td>
                  <td>{row.dueDate}</td>
                  <td>
                    <StatusBadge status={row.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {row.status !== 'Paid' ? (
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
              ))}
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
              <div><span>Loan ID:</span> <strong>{recordModalItem.loanId}</strong></div>
              <div><span>Due Amount:</span> <strong>{formatCurrency(recordModalItem.amount)}</strong></div>
            </div>

            <div className="fin-dashboard-input-group">
              <label>Amount Received (₹)</label>
              <input type="number" defaultValue={recordModalItem.amount} required />
            </div>

            <div className="fin-dashboard-input-group">
              <label>Payment Mode</label>
              <select defaultValue="UPI">
                <option value="UPI">UPI / GPay</option>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank Transfer</option>
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
