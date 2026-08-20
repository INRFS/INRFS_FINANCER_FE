import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Building2, CheckCircle2, IndianRupee, Landmark, Percent, ReceiptIndianRupee, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../auth/authState';
import { BILLING_MANAGE_ROLES, CONFIG_MANAGE_ROLES, FINANCER_MANAGE_ROLES, SUPPORT_MANAGE_ROLES } from '../../adminAccess';
import { pageItems, platformApi } from '../../../common/services/platformApi';
import { formatCurrency } from '../../../common/utils/formatters';

import './AdminBillingDashboard.css';

const amount = (value) => Number(value || 0);

export default function AdminBillingDashboard() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManageFinancers = hasRole(...FINANCER_MANAGE_ROLES);
  const canManageBilling = hasRole(...BILLING_MANAGE_ROLES);
  const canConfigure = hasRole(...CONFIG_MANAGE_ROLES);
  const canManageSupport = hasRole(...SUPPORT_MANAGE_ROLES);
  const [financers, setFinancers] = useState([]);
  const [billingUsage, setBillingUsage] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const now = new Date();
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
    Promise.all([
      platformApi.admin.allFinancers(),
      platformApi.admin.billingUsage({ from, to }),
    ]).then(([financerPayload, usagePayload]) => {
      setFinancers(pageItems(financerPayload));
      setBillingUsage(Array.isArray(usagePayload) ? usagePayload : pageItems(usagePayload));
    }).catch((requestError) => setError(requestError.message));
  }, []);

  const summary = useMemo(() => billingUsage.reduce((result, usage) => {
    result.interest += amount(usage.interestCollected);
    result.generated += amount(usage.feeGenerated);
    result.collected += amount(usage.feeCollected);
    result.outstanding += amount(usage.outstanding);
    result.overdue += amount(usage.overdue);
    return result;
  }, { interest: 0, generated: 0, collected: 0, outstanding: 0, overdue: 0 }), [billingUsage]);

  const financerNames = useMemo(() => new Map(financers.map((financer) => [financer.id, financer.displayName])), [financers]);
  const activeFinancers = financers.filter((financer) => financer.status === 'Active').length;
  const collectionRate = summary.generated ? Math.round((summary.collected / summary.generated) * 100) : 0;

  const cards = [
    ['Total Financers', financers.length.toLocaleString('en-IN'), 'Registered organizations', Building2, 'cyan'],
    ['Active Financers', activeFinancers.toLocaleString('en-IN'), 'Currently active', CheckCircle2, 'green'],
    ['Interest Collected', formatCurrency(summary.interest), 'Completed customer payments this month', Percent, 'pink'],
    ['Platform Fee Accrued', formatCurrency(summary.generated), 'Live fee calculated on collected interest', ReceiptIndianRupee, 'purple'],
    ['Platform Fee Collected', formatCurrency(summary.collected), `${collectionRate}% collection rate`, Landmark, 'green'],
    ['Outstanding Fees', formatCurrency(summary.outstanding), 'Pending from financers', IndianRupee, 'orange'],
    ['Overdue Fees', formatCurrency(summary.overdue), 'Requires financer follow-up', TriangleAlert, 'red'],
  ];

  return (
    <main className="billing-dashboard">
      <header className="billing-dashboard-header">
        <div><span>BILLING DASHBOARD</span><h1>Platform Fee Overview</h1><p>Financer billing, collections, and outstanding-fee activity</p></div>
        <button type="button" onClick={() => navigate(canManageBilling ? '/admin/monthly-billing' : '/admin/reports')}>{canManageBilling ? 'View Monthly Billing' : 'View Billing Reports'} <ArrowUpRight size={16} /></button>
      </header>

      {error && <p className="billing-dashboard-error" role="alert">{error}</p>}

      <section className="billing-dashboard-cards" aria-label="Billing summary">
        {cards.map(([label, value, description, Icon, tone]) => (
          <article key={label} className={`billing-dashboard-card ${tone}`}>
            <Icon size={21} /><div><span>{label}</span><strong>{value}</strong><small>{description}</small></div>
          </article>
        ))}
      </section>

      <section className="billing-dashboard-panel">
        <div className="billing-dashboard-panel-header">
          <div><h2>Current Month Financer Billing</h2><p>Platform fee calculated from each financer’s collected customer interest.</p></div>
          {canManageBilling && <button type="button" onClick={() => navigate('/admin/monthly-billing')}>Manage Billing & Payments <ArrowUpRight size={15} /></button>}
        </div>
        <div className="billing-dashboard-table-wrap">
          <table>
            <thead><tr><th>Financer</th><th>Interest Collected</th><th>Fee Rate</th><th>Fee Generated</th><th>Collected</th><th>Outstanding</th><th>Status</th></tr></thead>
            <tbody>
              {billingUsage.length ? billingUsage.map((usage) => {
                const interest = amount(usage.interestCollected);
                const generated = amount(usage.feeGenerated);
                const outstanding = amount(usage.outstanding);
                const rate = interest ? (generated / interest) * 100 : 0;
                const status = outstanding > 0 ? (amount(usage.overdue) > 0 ? 'Overdue' : 'Accrued') : generated > 0 ? 'Paid' : 'No activity';
                return <tr key={usage.financerId}><td>{usage.financerName || financerNames.get(usage.financerId) || usage.financerId}</td><td>{formatCurrency(interest)}</td><td>{rate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}%</td><td>{formatCurrency(generated)}</td><td>{formatCurrency(usage.feeCollected)}</td><td>{formatCurrency(outstanding)}</td><td><span className={`billing-status ${String(status).toLowerCase().replaceAll(' ', '-')}`}>{status}</span></td></tr>;
              }) : <tr><td colSpan="7" className="billing-dashboard-empty">No completed-payment interest for the current month.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="billing-dashboard-actions">
        <button type="button" onClick={() => navigate('/admin/financers')}>{canManageFinancers ? 'Manage Financers' : 'View Financers'} <ArrowUpRight size={15} /></button>
        {canConfigure && <button type="button" onClick={() => navigate('/admin/service-charges')}>Configure Service Charges <ArrowUpRight size={15} /></button>}
        <button type="button" onClick={() => navigate('/admin/reports')}>View Billing Reports <ArrowUpRight size={15} /></button>
        {canManageSupport && <button type="button" onClick={() => navigate('/admin/support')}>Financer Support <ArrowUpRight size={15} /></button>}
      </section>
    </main>
  );
}
