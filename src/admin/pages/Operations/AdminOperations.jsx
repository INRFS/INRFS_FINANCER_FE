import React, { useCallback, useEffect, useState } from 'react';
import { Activity, ClipboardCheck, History, RefreshCw, Scale } from 'lucide-react';
import { pageItems, platformApi } from '../../../common/services/platformApi';
import { formatCurrency } from '../../../common/utils/formatters';
import './AdminOperations.css';

const tabs = [['audit', 'Audit History', History], ['kyc', 'KYC Review', ClipboardCheck], ['reconciliation', 'Reconciliation', Scale], ['health', 'System Health', Activity]];
const dateTime = (value) => value ? new Date(value).toLocaleString('en-IN') : '—';

export default function AdminOperations() {
  const [tab, setTab] = useState('audit');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [documents, setDocuments] = useState(null);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      if (tab === 'audit') setRows(pageItems(await platformApi.admin.auditLogs({ pageSize: 100, from, to })));
      if (tab === 'kyc') {
        const [financerPayload, customerPayload] = await Promise.all([platformApi.admin.allFinancers(), platformApi.kyc.list({ pageSize: 100 })]);
        setRows([
          ...pageItems(financerPayload).map((item) => ({ ...item, recordType: 'Financer', customerName: item.displayName, customerId: item.id, status: item.kycStatus, identityType: 'Organization documents' })),
          ...pageItems(customerPayload).map((item) => ({ ...item, recordType: 'Customer' })),
        ]);
      }
      if (tab === 'reconciliation') setRows(pageItems(await platformApi.payments.transactions({ pageSize: 100, from, to })));
      if (tab === 'health') {
        const response = await fetch('/health/ready');
        setRows([{ component: 'API and database', status: response.ok ? 'Healthy' : 'Unhealthy', checkedAt: new Date().toISOString() }]);
      }
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [tab, from, to]);
  useEffect(() => { load(); }, [load]);
  const decide = async (row, status) => { const notes = window.prompt(`Reason for ${status}:`); if (!notes) return; if (row.recordType === 'Financer') await platformApi.admin.decideFinancerKyc(row.id, { status, notes }); else await platformApi.kyc.decide(row.id, { status, notes }); await load(); };
  const reconcile = async (row) => { const externalReference = window.prompt('Verified bank or settlement reference:', row.externalReference || ''); if (!externalReference) return; await platformApi.payments.reconcile(row.id, { externalReference }); await load(); };
  const showDocuments = async (row) => setDocuments({ row, items: await platformApi.documents.listForFinancer(row.id) });
  const decideDocument = async (document, status) => { const notes = window.prompt(`Document review notes for ${status}:`); if (!notes) return; await platformApi.documents.verify(document.id, { status, notes }); await showDocuments(documents.row); };
  const downloadDocument = async (document) => { const blob = await platformApi.documents.download(document.id); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = document.originalFileName; link.click(); URL.revokeObjectURL(url); };
  const uploadDocument = async (event) => { const file = event.target.files?.[0]; if (!file) return; const category = window.prompt('Document category:', 'OrganizationKYC'); if (!category) return; await platformApi.documents.upload(file, category, null, null, documents.row.id); await showDocuments(documents.row); };
  return <div className="admin-operations"><header><div><h1>Platform Operations</h1><p>Audit, compliance, settlement reconciliation, and service health.</p></div><button type="button" onClick={load} disabled={loading}><RefreshCw size={16}/>{loading ? 'Refreshing…' : 'Refresh'}</button></header>
    <nav aria-label="Operations sections">{tabs.map(([key,label,Icon]) => <button type="button" key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}><Icon size={17}/>{label}</button>)}</nav>
    {(tab === 'audit' || tab === 'reconciliation') && <section className="operations-filters"><label>From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)}/></label><label>To<input type="date" value={to} onChange={(e) => setTo(e.target.value)}/></label></section>}
    {error && <p role="alert">{error}</p>}
    <div className="operations-table"><table><thead><tr>{tab === 'audit' && <><th>Time</th><th>Action</th><th>Entity</th><th>Actor</th></>}{tab === 'kyc' && <><th>Customer</th><th>Identity</th><th>Status</th><th>Submitted</th><th>Action</th></>}{tab === 'reconciliation' && <><th>Transaction</th><th>Type</th><th>Amount</th><th>Reference</th><th>Status</th><th>Action</th></>}{tab === 'health' && <><th>Component</th><th>Status</th><th>Checked</th></>}</tr></thead><tbody>
      {rows.map((row) => tab === 'audit' ? <tr key={row.id}><td>{dateTime(row.timestamp)}</td><td>{row.action}</td><td>{row.entityType}<small>{row.entityId}</small></td><td>{row.actorId || 'System'}</td></tr> : tab === 'kyc' ? <tr key={`${row.recordType}-${row.id}`}><td>{row.customerName}<small>{row.recordType} · {row.customerId}</small></td><td>{row.identityType}{row.recordType === 'Financer' && <button type="button" onClick={() => showDocuments(row)}>Review files</button>}</td><td>{row.status}</td><td>{dateTime(row.createdAt)}</td><td>{!['Verified','Rejected'].includes(row.status) ? <span className="row-actions"><button onClick={() => decide(row, 'Verified')}>Verify</button><button onClick={() => decide(row, 'NeedsInformation')}>Request info</button><button onClick={() => decide(row, 'Rejected')}>Reject</button></span> : 'Completed'}</td></tr> : tab === 'reconciliation' ? <tr key={row.id}><td>{row.transactionNumber}</td><td>{row.type}</td><td>{formatCurrency(row.amount)}</td><td>{row.externalReference || '—'}</td><td>{row.isReconciled ? 'Reconciled' : 'Pending'}</td><td>{row.isReconciled ? dateTime(row.reconciledAt) : <button onClick={() => reconcile(row)}>Reconcile</button>}</td></tr> : <tr key={row.component}><td>{row.component}</td><td>{row.status}</td><td>{dateTime(row.checkedAt)}</td></tr>)}
      {!rows.length && !loading && <tr><td colSpan="6">No records found.</td></tr>}
    </tbody></table></div>
    {documents && <section><h2>Organization documents: {documents.row.customerName}</h2><label>Upload demo organization document<input type="file" accept="application/pdf,image/png,image/jpeg" onChange={uploadDocument}/></label>{documents.items.length ? documents.items.map((document) => <article key={document.id}><strong>{document.category}: {document.originalFileName}</strong> <span>{document.status}</span><button type="button" onClick={() => downloadDocument(document)}>Download</button>{document.status === 'Pending' && <><button type="button" onClick={() => decideDocument(document, 'Verified')}>Verify file</button><button type="button" onClick={() => decideDocument(document, 'Rejected')}>Reject file</button></>}</article>) : <p>No organization documents uploaded.</p>}<button type="button" onClick={() => setDocuments(null)}>Close documents</button></section>}
  </div>;
}
