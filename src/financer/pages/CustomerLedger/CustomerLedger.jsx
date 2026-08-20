import { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import Button from '../../../common/components/Button';
import { formatCurrency } from '../../../common/utils/formatters';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import './CustomerLedger.css';

const formatTransactionDate = (value) => new Date(value).toLocaleDateString('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
});

export default function CustomerLedger() {
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [ledger, setLedger] = useState({ customer: null, entries: [] });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    platformApi.customers.all().then((payload) => {
      const items = pageItems(payload);
      setCustomers(items);
      setSelectedId((current) => current || items[0]?.id || '');
    }).catch((reason) => setError(reason.message));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setError('');
    platformApi.customers.ledger(selectedId, { pageSize: 500 }).then(setLedger).catch((reason) => setError(reason.message));
  }, [selectedId]);

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase();
    return customers.filter((item) => !value || [item.fullName, item.customerNumber, item.phone].some((field) => String(field || '').toLowerCase().includes(value)));
  }, [customers, search]);

  const totals = useMemo(() => (ledger.entries || []).reduce(
    (sum, item) => ({ debit: sum.debit + Number(item.debit || 0), credit: sum.credit + Number(item.credit || 0) }),
    { debit: 0, credit: 0 },
  ), [ledger.entries]);

  const exportCsv = () => {
    const rows = [['Date', 'Transaction', 'Type', 'Debit', 'Credit', 'Balance'], ...(ledger.entries || []).map((item) => [item.transactionAt, item.transactionNumber, item.type, item.debit, item.credit, item.balance])];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `${ledger.customer?.customerNumber || 'customer'}-ledger.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="fin-ledger-page">
      {error && <p className="fin-ledger-error" role="alert">{error}</p>}
      <header className="fin-ledger-page-header">
        <h1 className="fin-ledger-title">Customer Ledger</h1>
        <p className="fin-ledger-subtitle">Review the authoritative transaction history for each customer.</p>
      </header>

      <div className="fin-ledger-layout">
        <aside className="fin-ledger-customer-panel">
          <div className="fin-ledger-customer-heading">CUSTOMERS</div>
          <div className="fin-ledger-search"><Search size={17} /><input aria-label="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers…" /></div>
          <div className="fin-ledger-customer-list">
            {filtered.map((item) => (
              <button type="button" key={item.id} className={`fin-ledger-customer-item ${selectedId === item.id ? 'active' : ''}`} onClick={() => setSelectedId(item.id)}>
                <span className="fin-ledger-avatar">{item.fullName?.charAt(0)?.toUpperCase()}</span>
                <span className="fin-ledger-customer-info"><strong className="fin-ledger-customer-name">{item.fullName}</strong><small className="fin-ledger-customer-loans">{item.customerNumber} · {item.phone}</small></span>
              </button>
            ))}
            {!filtered.length && <div className="fin-ledger-no-customers">No customers found.</div>}
          </div>
        </aside>

        <section className="fin-ledger-content">
          <div className="fin-ledger-customer-header">
            <div><h2>{ledger.customer?.fullName || 'Select a customer'}</h2><p>{ledger.customer?.customerNumber || 'Choose a customer to view their ledger'}</p></div>
            <Button icon={Download} variant="secondary" onClick={exportCsv} disabled={!ledger.entries?.length}>Export CSV</Button>
          </div>

          <div className="fin-ledger-summary-grid">
            <div className="fin-ledger-summary-card disbursed"><span className="fin-ledger-summary-label">TOTAL DISBURSED</span><strong>{formatCurrency(totals.debit)}</strong></div>
            <div className="fin-ledger-summary-card received"><span className="fin-ledger-summary-label">TOTAL RECEIVED</span><strong>{formatCurrency(totals.credit)}</strong></div>
            <div className="fin-ledger-summary-card outstanding"><span className="fin-ledger-summary-label">CURRENT BALANCE</span><strong>{formatCurrency(totals.debit - totals.credit)}</strong></div>
          </div>

          <div className="fin-ledger-table-card"><div className="fin-ledger-table-wrapper">
            <table className="fin-ledger-table">
              <thead><tr><th>Date</th><th>Transaction</th><th>Description</th><th>Debit</th><th>Credit</th><th>Balance</th></tr></thead>
              <tbody>{(ledger.entries || []).map((item) => (
                <tr key={item.id}>
                  <td data-label="Date"><span className="fin-ledger-date">{formatTransactionDate(item.transactionAt)}</span></td>
                  <td data-label="Transaction"><span className="fin-ledger-description">{item.transactionNumber}</span></td>
                  <td data-label="Description"><span className="fin-ledger-description">{item.type}</span></td>
                  <td data-label="Debit">{item.debit ? <span className="fin-ledger-debit">{formatCurrency(item.debit)}</span> : <span className="fin-ledger-dash">—</span>}</td>
                  <td data-label="Credit">{item.credit ? <span className="fin-ledger-credit">{formatCurrency(item.credit)}</span> : <span className="fin-ledger-dash">—</span>}</td>
                  <td data-label="Balance"><span className="fin-ledger-balance">{formatCurrency(item.balance)}</span></td>
                </tr>
              ))}</tbody>
            </table>
            {!ledger.entries?.length && <p className="fin-ledger-empty">No ledger transactions found.</p>}
          </div></div>
        </section>
      </div>
    </div>
  );
}
