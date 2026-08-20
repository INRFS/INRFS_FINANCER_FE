import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, CalendarClock, CheckCircle2, Download, MessageCircle, Phone, RefreshCw, Send, UserRound } from 'lucide-react';
import { pageItems, platformApi } from '../../../common/services/platformApi';
import { actionableDue, additionalWindowDue, displayCaseStatus, formatDueAmount } from './collectionOperationsUtils';
import './CollectionOperations.css';

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const receivedAt = (date) => date === today() ? new Date().toISOString() : new Date(`${date}T12:00:00+05:30`).toISOString();
const modes = ['Cash', 'Upi', 'BankTransfer', 'Cheque', 'Card', 'Other'];

export default function CollectionOperations() {
  const [rows, setRows] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState('');
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState({ reminderDays: 1, escalationDays: 3 });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [collections, users, settings] = await Promise.all([
        platformApi.collections.list({ pageSize: 100 }),
        platformApi.admin.users({ pageSize: 100 }).catch(() => ({ items: [] })),
        platformApi.settings.list('Platform').catch(() => ({ items: [] })),
      ]);
      const collectionRows = pageItems(collections);
      setRows(collectionRows);
      setAgents(pageItems(users).filter((user) => (user.roles || []).some((role) => String(role.name || role).toLowerCase() === 'collectionagent')));
      const settingRows = pageItems(settings);
      setRules({
        reminderDays: Number(settingRows.find((item) => item.key === 'CollectionReminderDaysBefore')?.value ?? 1),
        escalationDays: Number(settingRows.find((item) => item.key === 'CollectionEscalationDays')?.value ?? 3),
      });
      return collectionRows;
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => rows.filter((row) => {
    const derived = displayCaseStatus(row);
    if (status !== 'All' && derived !== status) return false;
    return `${row.customer} ${row.loanNumber} ${row.financer} ${row.assignedToName}`.toLowerCase().includes(search.toLowerCase());
  }), [rows, search, status]);
  const summary = useMemo(() => ({
    due: rows.reduce((sum, row) => sum + Number(row.dueNow || 0), 0),
    overdue: rows.filter((row) => row.daysPastDue > 0).reduce((sum, row) => sum + Number(row.dueNow || 0), 0),
    promises: rows.filter((row) => row.caseStatus === 'PromiseToPay').length,
    unassigned: rows.filter((row) => !row.assignedTo).length,
  }), [rows]);

  const perform = async (fn) => {
    setSaving(true); setError('');
    try {
      const selectedId = selected?.id;
      await fn();
      setAction('');
      const refreshed = await load();
      if (selectedId) setSelected(refreshed?.find((row) => row.id === selectedId) || null);
    }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  const saveRules = () => perform(async () => {
    await Promise.all([
      platformApi.settings.save('Platform', 'CollectionReminderDaysBefore', { value: String(rules.reminderDays), valueType: 'Number', description: 'Days before due date to queue a customer reminder', isSecret: false }),
      platformApi.settings.save('Platform', 'CollectionEscalationDays', { value: String(rules.escalationDays), valueType: 'Number', description: 'Overdue days before automatic escalation', isSecret: false }),
    ]);
  });
  const exportCsv = () => {
    const csv = [['Financer','Customer','Loan','Due date','Outstanding','Days overdue','Case status','Agent'], ...filtered.map((r) => [r.financer,r.customer,r.loanNumber,r.dueDate,r.due,r.daysPastDue,r.caseStatus || '',r.assignedToName || ''])]
      .map((line) => line.map((cell) => `"${String(cell ?? '').replaceAll('"','""')}"`).join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = `collection-operations-${today()}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };

  return <main className="ops-collections">
    <header className="ops-page-header"><div><span>INRFS COLLECTION OPERATIONS</span><h1>Due &amp; Overdue Work Queue</h1><p>Manage customer follow-ups and collections across every financer.</p></div><div className="ops-header-actions"><button onClick={load}><RefreshCw size={16}/>Refresh</button><button className="ops-export" onClick={exportCsv}><Download size={16}/>Export</button></div></header>
    {error && <div className="ops-error" role="alert">{error}</div>}
    <section className="ops-summary">
      <article><BellRing/><span>Total due now</span><strong>{formatDueAmount(summary.due)}</strong></article>
      <article><CalendarClock/><span>Overdue</span><strong>{formatDueAmount(summary.overdue)}</strong></article>
      <article><CheckCircle2/><span>Promises to pay</span><strong>{summary.promises}</strong></article>
      <article><UserRound/><span>Unassigned</span><strong>{summary.unassigned}</strong></article>
    </section>
    <section className="ops-rules"><div className="ops-rules-title"><BellRing size={18}/><span><strong>Automation rules</strong><small>Control reminders and escalation timing</small></span></div><label><span>Reminder lead time</span><span className="ops-rule-control"><input type="number" min="0" max="30" value={rules.reminderDays} onChange={(e) => setRules({ ...rules, reminderDays: e.target.value })}/><em>days before due</em></span></label><label><span>Escalation threshold</span><span className="ops-rule-control"><input type="number" min="1" max="365" value={rules.escalationDays} onChange={(e) => setRules({ ...rules, escalationDays: e.target.value })}/><em>overdue days</em></span></label><button disabled={saving} onClick={saveRules}>{saving ? 'Saving…' : 'Save rules'}</button></section>
    <section className="ops-card">
      <div className="ops-toolbar"><input placeholder="Search financer, customer, loan or agent" value={search} onChange={(e) => setSearch(e.target.value)}/><select value={status} onChange={(e) => setStatus(e.target.value)}><option>All</option><option>Upcoming</option><option>Open</option><option>Contacted</option><option>PromiseToPay</option><option>PartiallyCollected</option><option>Escalated</option></select><span>{filtered.length} cases</span></div>
      <div className="ops-table-wrap"><table><thead><tr><th>Priority</th><th>Financer / Customer</th><th>Loan / Due</th><th>Due now / next</th><th>Case</th><th>Agent</th><th>Actions</th></tr></thead><tbody>
        {filtered.map((row) => { const latest = row.activities?.[0]; const additional = additionalWindowDue(row); return <tr key={row.id}><td><b className={row.daysPastDue > 0 ? 'danger' : 'today'}>{row.daysPastDue > 0 ? `${row.daysPastDue}d overdue` : row.daysUntilDue > 0 ? `Due in ${row.daysUntilDue}d` : 'Due today'}</b></td><td><strong>{row.customer}</strong><small>{row.financer}</small></td><td><strong>{row.loanNumber}</strong><small>{row.dueDate || 'Today'}</small></td><td><strong>{formatDueAmount(actionableDue(row))}</strong>{additional > 0 && <small>{formatDueAmount(additional)} additional through {row.queueThrough}</small>}</td><td><span className="ops-status">{displayCaseStatus(row)}</span>{row.promiseToPayDate && <small>Promise: {row.promiseToPayDate}</small>}{row.nextFollowUpDate && <small>Follow-up: {row.nextFollowUpDate}</small>}{latest && <small title={latest.notes}>Latest: {latest.type} · {latest.notes}</small>}</td><td>{row.assignedToName || 'Unassigned'}</td><td><button onClick={() => setSelected(row)}>Manage</button></td></tr>; })}
        {!loading && !filtered.length && <tr><td colSpan="7">No collection cases match the filters.</td></tr>}
      </tbody></table></div>
    </section>
    {selected && <div className="ops-modal-bg" onClick={() => setSelected(null)}><aside className="ops-modal" onClick={(e) => e.stopPropagation()}><button className="ops-close" onClick={() => setSelected(null)}>×</button><h2>{selected.customer}</h2><p>{selected.financer} · {selected.loanNumber} · {formatDueAmount(actionableDue(selected))} due now/next</p>
      <div className="ops-action-grid"><button onClick={() => setAction('assign')}><UserRound/>Assign</button><button onClick={() => setAction('promise')}><CalendarClock/>Promise</button><button onClick={() => setAction('followup')}><CalendarClock/>Follow-up</button><button onClick={() => perform(() => platformApi.collections.remind(selected.id, { type: 'PaymentReminder', notes: 'SMS reminder queued by INRFS operations.' }))}><Send/>SMS</button><button onClick={() => { perform(() => platformApi.collections.action(selected.id, { type: 'WhatsApp', notes: 'WhatsApp follow-up initiated.' })); window.open(`https://wa.me/${String(selected.customerPhone || '').replace(/\D/g,'')}`, '_blank', 'noopener'); }}><MessageCircle/>WhatsApp</button><button onClick={() => setAction('call')}><Phone/>Call</button><button onClick={() => setAction('payment')}><CheckCircle2/>Record payment</button></div>
      {action === 'assign' && <ActionForm title="Assign collection agent" onSubmit={(form) => perform(() => platformApi.collections.action(selected.id, { type: 'Assigned', notes: 'Case assigned by INRFS operations.', assignedTo: form.get('agent') || null, status: 'Open' }))}><select name="agent" required><option value="">Select agent</option>{agents.map((a) => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}</select></ActionForm>}
      {action === 'promise' && <ActionForm title="Promise to pay" onSubmit={(form) => perform(() => platformApi.collections.action(selected.id, { type: 'PromiseToPay', notes: form.get('notes') || 'Customer promised payment.', promiseToPayDate: form.get('date'), status: 'PromiseToPay' }))}><input name="date" type="date" min={today()} required/><textarea name="notes" placeholder="Conversation notes"/></ActionForm>}
      {action === 'followup' && <ActionForm title="Schedule follow-up" onSubmit={(form) => perform(() => platformApi.collections.action(selected.id, { type: 'FollowUpScheduled', notes: form.get('notes') || 'Customer follow-up scheduled.', nextFollowUpDate: form.get('date'), status: 'Contacted' }))}><input name="date" type="date" min={today()} required/><textarea name="notes" placeholder="Follow-up instructions"/></ActionForm>}
      {action === 'call' && <ActionForm title="Record call outcome" onSubmit={(form) => { const outcome = form.get('outcome'); const promiseDate = form.get('promiseDate') || null; const followUpDate = form.get('followUpDate') || null; return perform(() => platformApi.collections.action(selected.id, { type: 'CallCompleted', notes: `${outcome}: ${form.get('notes')}`, promiseToPayDate: promiseDate, nextFollowUpDate: followUpDate, status: promiseDate ? 'PromiseToPay' : 'Contacted' })); }}><select name="outcome" required><option value="">Select call outcome</option><option>Customer contacted</option><option>No answer</option><option>Busy / switched off</option><option>Payment confirmed</option><option>Promise to pay</option><option>Dispute raised</option></select><textarea name="notes" placeholder="Customer response and call description" required/><label>Promise date (optional)<input name="promiseDate" type="date" min={today()}/></label><label>Next follow-up (optional)<input name="followUpDate" type="date" min={today()}/></label><button type="button" onClick={() => { window.location.href = `tel:${selected.customerPhone}`; }}>Open phone dialer</button></ActionForm>}
      {action === 'payment' && <ActionForm title="Record customer payment" onSubmit={(form) => perform(() => platformApi.payments.record({ loanId: selected.id, paymentScheduleId: selected.paymentScheduleId, amount: Number(form.get('amount')), receivedAt: receivedAt(form.get('date')), mode: form.get('mode'), externalReference: form.get('reference') || null, notes: 'Recorded by INRFS collection operations' }))}><input name="amount" type="number" min="0.01" step="0.01" max={selected.due} defaultValue={actionableDue(selected)} required/><input name="date" type="date" max={today()} defaultValue={today()} required/><select name="mode">{modes.map((m) => <option key={m}>{m}</option>)}</select><input name="reference" placeholder="Reference (optional)"/></ActionForm>}
      <section className="ops-history"><h3>Activity history</h3>{(selected.activities || []).map((item) => <div key={item.id}><strong>{item.type}</strong><span>{item.notes}</span><small>{new Date(item.occurredAt).toLocaleString('en-IN')}</small></div>)}{!(selected.activities || []).length && <p>No activity recorded yet.</p>}</section>
    </aside></div>}
  </main>;
}

function ActionForm({ title, onSubmit, children }) {
  return <form className="ops-form" onSubmit={(e) => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)); }}><h3>{title}</h3>{children}<button type="submit">Confirm</button></form>;
}
