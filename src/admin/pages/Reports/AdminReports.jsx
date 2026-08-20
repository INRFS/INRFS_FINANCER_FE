import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, FileText, RefreshCw, ReceiptIndianRupee, WalletCards } from 'lucide-react';

import Button from '../../../common/components/Button';
import SearchInput from '../../../common/components/SearchInput';
import { pageItems, platformApi } from '../../../common/services/platformApi';
import { buildBillingReportRows } from './billingReportUtils';

import './AdminReports.css';

const REPORTS = [
  { key: 'platform-fees', label: 'Platform Fees', icon: ReceiptIndianRupee },
  { key: 'fee-collections', label: 'Fee Collections', icon: WalletCards },
];

const humanize = (value) => value.replace(/([A-Z])/g, ' $1').replaceAll('_', ' ').trim();
const formatCell = (value) => value === null || value === undefined || value === '' ? '—' : String(value);

export default function AdminReports() {
  const [report, setReport] = useState(REPORTS[0].key);
  const [search, setSearch] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [financers, setFinancers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [billingPayload, financerPayload] = await Promise.all([
        platformApi.admin.allInvoices({ from, to }),
        platformApi.admin.allFinancers(),
      ]);
      setInvoices(pageItems(billingPayload));
      setFinancers(pageItems(financerPayload));
    } catch (reason) {
      setError(reason.message);
      setInvoices([]);
      setFinancers([]);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const rows = useMemo(() => buildBillingReportRows(invoices, financers, report, search), [invoices, financers, report, search]);
  const columns = useMemo(() => rows[0] ? Object.keys(rows[0]) : [], [rows]);
  const activeReport = REPORTS.find((item) => item.key === report);

  const exportCsv = () => {
    const csv = [columns, ...rows.map((row) => columns.map((key) => row[key]))].map((row) => row.map((value) => `"${formatCell(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-reports-page">
      <header className="admin-reports-header"><div className="admin-reports-heading"><div><span className="admin-reports-title-icon"><FileText size={22} /></span><div><h1>Platform Reports</h1><p>Financer interest, platform-fee, and collection records.</p></div></div><Button icon={Download} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button></div></header>
      {error && <p className="admin-reports-error" role="alert">{error}</p>}
      <div className="admin-reports-tabs-card"><nav className="admin-reports-tabs" aria-label="Report type">{REPORTS.map(({ key, label, icon: Icon }) => <button type="button" key={key} className={`admin-reports-tab ${report === key ? 'active' : ''}`} aria-current={report === key ? 'page' : undefined} onClick={() => setReport(key)}><Icon size={16} /><span>{label}</span></button>)}</nav></div>
      <div className="admin-reports-toolbar"><div className="admin-reports-filter-row"><div className="admin-reports-search"><SearchInput value={search} onChange={setSearch} placeholder="Search financer or invoice..." /></div><label>From <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label>To <input type="date" value={to} min={from} onChange={(event) => setTo(event.target.value)} /></label><Button icon={RefreshCw} onClick={load} disabled={loading}>{loading ? 'Loading...' : 'Refresh Report'}</Button></div><div className="admin-reports-toolbar-meta"><span><strong>{rows.length}</strong> records</span><span>Report: {activeReport?.label}</span></div></div>
      <section className="admin-reports-content" aria-busy={loading}><div className="admin-reports-content-header"><div><h2>{activeReport?.label}</h2><p>{report === 'fee-collections' ? 'Invoices with full or partial platform-fee payments received from financers.' : 'Platform fees calculated from each financer’s collected customer interest.'}</p></div></div>{rows.length ? <div className="admin-reports-table-wrap"><table className="admin-reports-table"><thead><tr>{columns.map((column) => <th key={column}>{humanize(column)}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.invoiceId}>{columns.map((column) => <td key={column} title={formatCell(row[column])}>{formatCell(row[column])}</td>)}</tr>)}</tbody></table></div> : !loading && <div className="admin-reports-empty"><span className="admin-reports-empty-icon"><FileText size={22} /></span><h3>No records found</h3><p>{report === 'fee-collections' ? 'No platform-fee payments have been collected yet.' : 'No platform-fee invoices match the search.'}</p></div>}</section>
    </main>
  );
}
