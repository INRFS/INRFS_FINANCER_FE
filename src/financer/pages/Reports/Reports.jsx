import { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, Download, RefreshCw, Search } from 'lucide-react';
import Button from '../../../common/components/Button';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import { buildReportRows, reportRowKey } from './reportRows';
import './Reports.css';

const REPORT_TYPES = ['customers', 'loans', 'payments', 'interest-schedule', 'overdue'];
const reportLabel = (value) => value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const columnLabel = (value) => ({
  customerNumber: 'Customer ID', loanNumber: 'Loan ID', financerNumber: 'Financer ID',
  paymentNumber: 'Payment ID', transactionNumber: 'Transaction ID',
}[value] || value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()));
const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

export default function Reports() {
  const [type, setType] = useState('customers');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [payload, setPayload] = useState({ items: [] });
  const [references, setReferences] = useState({ customers: [], loans: [], financer: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [report, customerPayload, loanPayload, profile] = await Promise.all([
        platformApi.reports.get(type, { search, from, to, pageSize: 100 }),
        platformApi.customers.all(),
        platformApi.loans.all(),
        platformApi.profile.get(),
      ]);
      setPayload(report);
      setReferences({
        customers: pageItems(customerPayload),
        loans: pageItems(loanPayload),
        financer: profile?.financer || {},
      });
    }
    catch (reason) { setError(reason.message); }
    finally { setLoading(false); }
  }, [from, search, to, type]);

  useEffect(() => { load(); }, [load]);
  const sourceRows = pageItems(payload);
  const rows = useMemo(() => buildReportRows(sourceRows, references), [references, sourceRows]);
  const columns = useMemo(() => [...new Set(rows.flatMap((row) => Object.keys(row)))].filter((key) => !['createdBy', 'updatedBy'].includes(key)), [rows]);

  const exportCsv = () => {
    const csv = [columns, ...rows.map((row) => columns.map((key) => row[key]))].map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = `${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <main className="fin-reports-page">
      <header className="fin-reports-header">
        <div><div className="fin-reports-title-row"><span className="fin-reports-title-icon"><BarChart3 size={21} /></span><h1>Reports</h1></div><p>Filter and export live financer records.</p></div>
        <Button icon={Download} onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>
      </header>
      {error && <p className="fin-reports-error" role="alert">{error}</p>}

      <div className="fin-report-tabs-wrapper"><nav className="fin-report-tabs" aria-label="Report type">
        {REPORT_TYPES.map((name) => <button type="button" key={name} className={`fin-report-tab ${name === type ? 'active' : ''}`} onClick={() => setType(name)}><span>{reportLabel(name)}</span></button>)}
      </nav></div>

      <section className="fin-report-toolbar">
        <div className="fin-report-filters">
          <label className="fin-report-search"><Search size={17} /><input aria-label="Search report" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records…" /></label>
          <label className="fin-date-input"><span>FROM</span><input aria-label="From date" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label className="fin-date-input"><span>TO</span><input aria-label="To date" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <Button icon={RefreshCw} onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Run report'}</Button>
        </div>
      </section>

      <section className="fin-report-data-card">
        <div className="fin-report-data-header"><div><h3>{reportLabel(type)} Report</h3><span>Live records matching the selected filters</span></div><span className="fin-report-record-count">{rows.length} {rows.length === 1 ? 'record' : 'records'}</span></div>
        <div className="fin-report-table-wrapper"><table><thead><tr>{columns.map((column) => <th key={column}>{columnLabel(column)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={reportRowKey(sourceRows[index], index)}>{columns.map((column) => <td key={column} title={displayValue(row[column])}>{displayValue(row[column])}</td>)}</tr>)}</tbody></table></div>
        {!loading && !rows.length && <div className="fin-report-empty"><div className="fin-report-empty-icon"><BarChart3 size={20} /></div><h3>No records found</h3><p>Try changing the report type or filters.</p></div>}
        <footer className="fin-report-data-footer"><span>Showing <strong>{rows.length}</strong> records</span><span>Report: {reportLabel(type)}</span></footer>
      </section>
    </main>
  );
}
