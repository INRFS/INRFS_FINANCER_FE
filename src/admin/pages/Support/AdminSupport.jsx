import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, LifeBuoy, MessageSquare, Search, UserRound } from 'lucide-react';

import Modal from '../../../common/components/Modal';
import StatusBadge from '../../../common/components/StatusBadge';
import { pageItems, platformApi } from '../../../common/services/platformApi';
import './AdminSupport.css';

const dateTime = (value) => value ? new Date(value).toLocaleString('en-IN') : 'Not available';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');
  const [assignee, setAssignee] = useState('');
  const [busy, setBusy] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [ticketPayload, userPayload] = await Promise.all([
        platformApi.support.list({ page: 1, pageSize: 100, status: statusFilter }),
        platformApi.admin.admins({ page: 1, pageSize: 100 }),
      ]);
      setTickets(pageItems(ticketPayload));
      setStaff(pageItems(userPayload).filter((user) => user.status === 'Active' && user.roles?.some((role) => ['SuperAdmin', 'Admin', 'SupportAgent'].includes(role))));
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { loadTickets(); }, [loadTickets]);

  const visibleTickets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? tickets.filter((ticket) => [ticket.ticketNumber, ticket.subject, ticket.category, ticket.description].some((value) => String(value || '').toLowerCase().includes(term))) : tickets;
  }, [tickets, search]);

  const openTicket = async (ticket) => {
    setError('');
    try {
      const detail = await platformApi.support.get(ticket.id);
      setSelected(detail); setAssignee(detail.assignedTo || ''); setMessage('');
    } catch (requestError) { setError(requestError.message); }
  };

  const refreshSelected = async () => {
    if (!selected) return;
    setSelected(await platformApi.support.get(selected.id));
    await loadTickets();
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setBusy(true); setError('');
    try { await platformApi.support.message(selected.id, { message: message.trim(), isInternal: false }); setMessage(''); await refreshSelected(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  const changeStatus = async (status) => {
    setBusy(true); setError('');
    try { await platformApi.support.status(selected.id, { status, assignedTo: selected.assignedTo || null }); await refreshSelected(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  const assign = async () => {
    setBusy(true); setError('');
    try { await platformApi.support.assign(selected.id, { status: selected.status, assignedTo: assignee || null }); await refreshSelected(); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  };

  return <div className="admin-support-page animate-fade-in">
    <header className="admin-support-header"><div><span>FINANCER ASSISTANCE</span><h1 className="admin-support-title">Platform Support Desk</h1><p className="admin-support-subtitle">Review, assign, reply to, and resolve financer support requests.</p></div><div className="admin-support-total"><LifeBuoy size={18} /><strong>{tickets.length}</strong><small>loaded tickets</small></div></header>
    {error && <p className="admin-support-error" role="alert">{error}</p>}
    <section className="admin-support-toolbar" aria-label="Ticket filters"><label><Search size={17} aria-hidden="true" /><input aria-label="Search tickets" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search number, subject, category..." /></label><label><Filter size={17} aria-hidden="true" /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option><option>Open</option><option>InProgress</option><option>Resolved</option><option>Closed</option></select></label></section>
    {loading ? <div className="admin-support-state" role="status">Loading support tickets...</div> : visibleTickets.length ? <div className="admin-support-grid">{visibleTickets.map((ticket) => <article key={ticket.id} className="admin-support-card"><div className="admin-support-card-top"><span>{ticket.ticketNumber}</span><StatusBadge status={ticket.status} /></div><h2>{ticket.subject}</h2><p>{ticket.description}</p><dl><div><dt>Category</dt><dd>{ticket.category}</dd></div><div><dt>Priority</dt><dd>{ticket.priority}</dd></div><div><dt>Created</dt><dd>{dateTime(ticket.createdAt)}</dd></div></dl><button type="button" onClick={() => openTicket(ticket)}>View and respond</button></article>)}</div> : <div className="admin-support-state"><LifeBuoy size={28} /><h2>No support tickets found</h2><p>{search || statusFilter ? 'Try changing the search or status filter.' : 'New financer requests will appear here.'}</p></div>}

    <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.ticketNumber} · ${selected.subject}` : 'Support ticket'}>
      {selected && <div className="admin-ticket-detail">
        <div className="admin-ticket-meta"><StatusBadge status={selected.status} /><span>{selected.category}</span><span>{selected.priority} priority</span><span>Created {dateTime(selected.createdAt)}</span></div>
        <section><h3>Request</h3><p>{selected.description}</p></section>
        <section><h3>Conversation</h3><div className="admin-ticket-messages"><article className="request"><strong>Financer request</strong><p>{selected.description}</p><small>{dateTime(selected.createdAt)}</small></article>{(selected.messages || []).filter((item) => !item.isInternal).map((item) => <article key={item.id}><strong>{staff.some((user) => user.id === item.senderId) ? 'Platform support' : 'Financer'}</strong><p>{item.message}</p><small>{dateTime(item.createdAt)}</small></article>)}</div></section>
        <section className="admin-ticket-assignment"><label htmlFor="ticketAssignee"><UserRound size={15} /> Assigned administrator</label><div><select id="ticketAssignee" value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="">Unassigned</option>{staff.map((user) => <option key={user.id} value={user.id}>{user.firstName} {user.lastName} ({user.roles?.[0]})</option>)}</select><button type="button" onClick={assign} disabled={busy}>Save assignment</button></div></section>
        <form onSubmit={sendReply} className="admin-support-reply-form"><label htmlFor="admin-support-reply"><MessageSquare size={15} /> Reply to financer</label><textarea id="admin-support-reply" rows="4" value={message} onChange={(event) => setMessage(event.target.value)} required maxLength="4000" /><div className="admin-support-actions"><button type="button" onClick={() => setSelected(null)}>Close</button>{selected.status === 'Resolved' || selected.status === 'Closed' ? <button type="button" disabled={busy} onClick={() => changeStatus('Open')}>Reopen</button> : <button type="button" disabled={busy} onClick={() => changeStatus('Resolved')}>Resolve</button>}<button type="submit" disabled={busy || !message.trim()}>{busy ? 'Working...' : 'Send reply'}</button></div></form>
      </div>}
    </Modal>
  </div>;
}
