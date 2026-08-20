import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, CheckCircle2, IndianRupee, Search, TriangleAlert, WalletCards } from 'lucide-react';

import { useAuth } from '../../../auth/authState';
import { BILLING_MANAGE_ROLES } from '../../adminAccess';
import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import { pageItems, platformApi } from '../../../common/services/platformApi';
import { formatCurrency } from '../../../common/utils/formatters';
import { outstandingFor } from './platformFeeCollectionUtils';

import './AdminPlatformFeeCollections.css';

const toAmount = (value) => Number(value || 0);

export default function AdminPlatformFeeCollections() {
  const { hasRole } = useAuth();
  const canCollect = hasRole(...BILLING_MANAGE_ROLES);
  const [invoices, setInvoices] = useState([]);
  const [financers, setFinancers] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [billingPayload, financerPayload] = await Promise.all([
        platformApi.admin.billing({ pageSize: 100 }),
        platformApi.admin.allFinancers(),
      ]);
      setInvoices(pageItems(billingPayload));
      setFinancers(pageItems(financerPayload));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const names = useMemo(() => new Map(financers.map((financer) => [financer.id, financer.displayName])), [financers]);
  const rows = useMemo(() => invoices.map((invoice) => ({
    ...invoice,
    financerName: names.get(invoice.financerId) || invoice.financerId,
    outstanding: outstandingFor(invoice),
  })).filter((invoice) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || `${invoice.financerName} ${invoice.id} ${invoice.reference || ''}`.toLowerCase().includes(term);
    const matchesStatus = status === 'All' || invoice.status === status;
    return matchesSearch && matchesStatus;
  }), [invoices, names, search, status]);

  const summary = useMemo(() => invoices.reduce((result, invoice) => {
    result.generated += toAmount(invoice.chargeAmount);
    result.collected += toAmount(invoice.collectedAmount);
    result.outstanding += outstandingFor(invoice);
    if (invoice.status === 'Overdue') result.overdue += outstandingFor(invoice);
    return result;
  }, { generated: 0, collected: 0, outstanding: 0, overdue: 0 }), [invoices]);

  const openCollection = (invoice) => {
    setSelected(invoice);
    setAmount(String(invoice.outstanding));
    setReference('');
    setError('');
  };

  const submitCollection = async (event) => {
    event.preventDefault();
    const payment = Number(amount);
    const paymentReference = reference.trim();
    if (!Number.isFinite(payment) || payment <= 0) return setError('Enter a positive collection amount.');
    if (payment > selected.outstanding) return setError('Collection amount cannot exceed the outstanding platform fee.');
    if (!paymentReference) return setError('Payment reference is required.');

    setSaving(true);
    setError('');
    try {
      const updated = await platformApi.admin.collectInvoice(selected.id, { amount: payment, reference: paymentReference });
      setInvoices((current) => current.map((invoice) => invoice.id === selected.id ? { ...invoice, ...updated } : invoice));
      setSelected(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="platform-collections-page">
      <header className="platform-collections-header">
        <div><span>ADMIN BILLING</span><h1>Platform Fee Collections</h1><p>Collect INRFS platform fees from financers based on customer interest.</p></div>
        <Button onClick={load} disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</Button>
      </header>

      {error && <p className="platform-collections-error" role="alert">{error}</p>}

      <section className="platform-collections-summary" aria-label="Platform fee collection summary">
        <article><WalletCards size={21} /><div><span>Fees Generated</span><strong>{formatCurrency(summary.generated)}</strong></div></article>
        <article><CheckCircle2 size={21} /><div><span>Collected</span><strong>{formatCurrency(summary.collected)}</strong></div></article>
        <article><IndianRupee size={21} /><div><span>Outstanding</span><strong>{formatCurrency(summary.outstanding)}</strong></div></article>
        <article><TriangleAlert size={21} /><div><span>Overdue</span><strong>{formatCurrency(summary.overdue)}</strong></div></article>
      </section>

      <section className="platform-collections-card">
        <div className="platform-collections-toolbar">
          <label><Search size={16} /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search financer or invoice..." aria-label="Search platform fee collections" /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter collection status"><option>All</option><option>Pending</option><option>Partially Paid</option><option>Paid</option><option>Overdue</option></select>
        </div>
        <div className="platform-collections-table-wrap">
          <table><thead><tr><th>Financer</th><th>Billing Period</th><th>Interest</th><th>Fee Rate</th><th>Fee Generated</th><th>Collected</th><th>Outstanding</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>{rows.length ? rows.map((invoice) => <tr key={invoice.id}><td><span className="platform-collections-financer"><Building2 size={15} />{invoice.financerName}</span></td><td>{invoice.periodStart} – {invoice.periodEnd}</td><td>{formatCurrency(invoice.interestActivity)}</td><td>{toAmount(invoice.chargePercentage)}%</td><td>{formatCurrency(invoice.chargeAmount)}</td><td>{formatCurrency(invoice.collectedAmount)}</td><td>{formatCurrency(invoice.outstanding)}</td><td><span className={`platform-collection-status ${String(invoice.status || '').toLowerCase().replaceAll(' ', '-')}`}>{invoice.status}</span></td><td>{canCollect && invoice.outstanding > 0 ? <button type="button" onClick={() => openCollection(invoice)}>Record Payment</button> : <span>—</span>}</td></tr>) : <tr><td colSpan="9" className="platform-collections-empty">{loading ? 'Loading platform-fee invoices...' : 'No platform-fee invoices match the filters.'}</td></tr>}</tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={Boolean(selected)} onClose={() => !saving && setSelected(null)} title="Record Platform Fee Payment">
        {selected && <form className="platform-collection-form" onSubmit={submitCollection}>
          <div className="platform-collection-invoice"><span>Financer</span><strong>{selected.financerName}</strong><span>Outstanding platform fee</span><strong>{formatCurrency(selected.outstanding)}</strong></div>
          <label>Amount received<input type="number" min="0.01" max={selected.outstanding} step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required /></label>
          <label>Payment reference<input value={reference} onChange={(event) => setReference(event.target.value)} maxLength="200" placeholder="UPI, bank, or receipt reference" required /></label>
          <div className="platform-collection-form-actions"><Button variant="secondary" onClick={() => setSelected(null)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Recording...' : 'Record Payment'}</Button></div>
        </form>}
      </Modal>
    </main>
  );
}
