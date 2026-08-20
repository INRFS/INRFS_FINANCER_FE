import React, { useEffect, useMemo, useState } from 'react';
import { IndianRupee, Landmark, Percent, ReceiptIndianRupee } from 'lucide-react';

import { platformApi } from '../../../common/services/platformApi';
import { formatCurrency } from '../../../common/utils/formatters';

import './FinancerBillingUsage.css';

const number = (value) => Number(value || 0);
const sameId = (left, right) => String(left || '').toLowerCase() === String(right || '').toLowerCase();
const isCompleted = (status) => status === 1 || String(status).toLowerCase() === 'completed';

export default function FinancerBillingUsage() {
  const [usage, setUsage] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    platformApi.admin.billingUsage()
      .then(setUsage)
      .catch(async (requestError) => {
        if (requestError.status !== 404) { setError(requestError.message); return; }
        try {
          const [financerPayload, invoicePayload, paymentPayload] = await Promise.all([
            platformApi.admin.allFinancers(),
            platformApi.admin.allInvoices(),
            platformApi.payments.all(),
          ]);
          const financers = financerPayload?.items || financerPayload || [];
          const invoices = invoicePayload?.items || invoicePayload || [];
          const payments = paymentPayload?.items || paymentPayload || [];
          setUsage(financers.map((financer) => {
            const financerInvoices = invoices.filter((invoice) => sameId(invoice.financerId, financer.id));
            const feeGenerated = financerInvoices.reduce((sum, invoice) => sum + number(invoice.chargeAmount), 0);
            const feeCollected = financerInvoices.reduce((sum, invoice) => sum + number(invoice.collectedAmount), 0);
            return {
              financerId: financer.id,
              financerNumber: financer.financerNumber,
              financerName: financer.displayName,
              status: financer.status,
              interestCollected: payments.filter((payment) => sameId(payment.financerId, financer.id) && isCompleted(payment.status)).reduce((sum, payment) => sum + number(payment.interestAmount), 0),
              feeGenerated,
              feeCollected,
              outstanding: Math.max(0, feeGenerated - feeCollected),
              overdue: financerInvoices.filter((invoice) => invoice.status === 'Overdue').reduce((sum, invoice) => sum + Math.max(0, number(invoice.chargeAmount) - number(invoice.collectedAmount)), 0),
            };
          }));
        } catch (fallbackError) { setError(fallbackError.message); }
      });
  }, []);

  const rows = useMemo(() => usage.map((item) => ({
    id: item.financerId,
    displayId: item.financerNumber || item.financerId,
    name: item.financerName,
    status: item.status,
    interest: number(item.interestCollected),
    generated: number(item.feeGenerated),
    collected: number(item.feeCollected),
    outstanding: number(item.outstanding),
    overdue: number(item.overdue),
  })).filter((row) => `${row.name} ${row.displayId}`.toLowerCase().includes(search.trim().toLowerCase())), [usage, search]);

  const totals = rows.reduce((result, row) => ({
    interest: result.interest + row.interest,
    generated: result.generated + row.generated,
    collected: result.collected + row.collected,
    outstanding: result.outstanding + row.outstanding,
  }), { interest: 0, generated: 0, collected: 0, outstanding: 0 });

  const cards = [
    ['Interest Collected', totals.interest, Percent],
    ['Platform Fee Generated', totals.generated, ReceiptIndianRupee],
    ['Platform Fee Collected', totals.collected, Landmark],
    ['Outstanding Fees', totals.outstanding, IndianRupee],
  ];
  const openDetails = async (row) => {
    setError('');
    try {
      const payload = await platformApi.payments.all({ financerId: row.id, pageSize: 100 });
      setDetails({ row, payments: (payload?.items || payload || []).filter((payment) => isCompleted(payment.status)) });
    } catch (requestError) { setError(requestError.message); }
  };

  return <div className="financer-billing-usage">
    <header><div><h1>Financer Usage Analytics</h1><p>Financial platform usage measured through interest and platform-fee billing.</p></div><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search financer..." aria-label="Search financer usage" /></header>
    {error && <p role="alert" className="financer-billing-error">{error}</p>}
    <section className="financer-billing-summary">{cards.map(([label, value, Icon]) => <article key={label}><Icon size={20} /><div><span>{label}</span><strong>{formatCurrency(value)}</strong></div></article>)}</section>
    <section className="financer-billing-table"><div className="financer-billing-table-scroll"><table><thead><tr><th>Financer</th><th>Status</th><th>Interest Collected</th><th>Fee Generated</th><th>Fee Collected</th><th>Outstanding</th><th>Overdue</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}><td><button type="button" onClick={() => openDetails(row)}><strong>{row.name}</strong><small>{row.displayId}</small></button></td><td>{row.status}</td><td>{formatCurrency(row.interest)}</td><td>{formatCurrency(row.generated)}</td><td>{formatCurrency(row.collected)}</td><td>{formatCurrency(row.outstanding)}</td><td>{formatCurrency(row.overdue)}</td></tr>) : <tr><td colSpan="7" className="financer-billing-empty">No financer billing data found.</td></tr>}</tbody></table></div></section>
    {details && <section className="financer-billing-table" aria-label={`Completed payments for ${details.row.name}`}><header><div><h2>{details.row.name}: underlying payments</h2><p>Completed payments contributing to collected interest.</p></div><button type="button" onClick={() => setDetails(null)}>Close</button></header><div className="financer-billing-table-scroll"><table><thead><tr><th>Payment</th><th>Received</th><th>Total</th><th>Principal</th><th>Interest</th><th>Fees</th></tr></thead><tbody>{details.payments.map((payment) => <tr key={payment.id}><td>{payment.paymentNumber}</td><td>{new Date(payment.receivedAt).toLocaleDateString('en-IN')}</td><td>{formatCurrency(payment.amount)}</td><td>{formatCurrency(payment.principalAmount)}</td><td>{formatCurrency(payment.interestAmount)}</td><td>{formatCurrency(payment.feeAmount)}</td></tr>)}</tbody></table></div></section>}
  </div>;
}
