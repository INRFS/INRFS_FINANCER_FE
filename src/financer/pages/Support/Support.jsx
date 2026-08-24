import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileText, HelpCircle, LifeBuoy, Mail, MessageSquare, Plus } from 'lucide-react';

import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import StatusBadge from '../../../common/components/StatusBadge';
import { useApiQuery } from '../../../common/hooks/useApiQuery';
import { pageItems, platformApi } from '../../../common/services/platformApi';
import './Support.css';

const dateTime = (value) => value ? new Date(value).toLocaleString('en-IN') : 'Not available';

export default function Support() {
  const location = useLocation();
  const { data, loading, error, refetch } = useApiQuery(() => platformApi.support.list({ page: 1, pageSize: 100 }), { items: [] });
  const tickets = pageItems(data);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'Technical', description: '', priority: 'Medium' });
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const ticketId = location.state?.ticketId;
    if (!ticketId) return;
    platformApi.support.get(ticketId)
      .then((ticket) => { setSelected(ticket); setReply(''); })
      .catch((requestError) => setActionError(requestError.message));
  }, [location.state?.ticketId]);

  const faqs = [
    { q: 'How do I raise a support request?', a: 'Select Create Support Ticket, choose a category and priority, and describe the issue. The request will appear in your ticket history.' },
    { q: 'Where can I see a reply from INRFS?', a: 'Open a ticket from Ticket History to view the complete conversation and send a follow-up message.' },
    { q: 'Can I reopen a resolved ticket?', a: 'Reply to the resolved ticket with the additional information. Platform support can then reopen it where further action is required.' },
    { q: 'How do I contact support outside the portal?', a: 'Use the verified support email shown on this page. Phone and messaging channels are not displayed until they are officially configured.' },
  ];

  const openTicket = async (ticket) => {
    setActionError('');
    try { setSelected(await platformApi.support.get(ticket.id)); setReply(''); }
    catch (requestError) { setActionError(requestError.message); }
  };

  const createTicket = async (event) => {
    event.preventDefault();
    // Subject — must not be whitespace-only
    if (!newTicket.subject.trim()) {
      setActionError('Ticket subject is required and cannot be blank or spaces only.');
      return;
    }
    // Description — must not be whitespace-only and must have reasonable length
    if (!newTicket.description.trim()) {
      setActionError('Description is required and cannot be blank or spaces only.');
      return;
    }
    if (newTicket.description.trim().length < 20) {
      setActionError('Please provide a more detailed description (at least 20 characters).');
      return;
    }
    setSubmitting(true); setActionError('');
    try {
      await platformApi.support.create({
        ...newTicket,
        subject: newTicket.subject.trim(),
        description: newTicket.description.trim(),
      });
      setCreateOpen(false);
      setNewTicket({ subject: '', category: 'Technical', description: '', priority: 'Medium' });
      await refetch();
    }
    catch (requestError) { setActionError(requestError.message); }
    finally { setSubmitting(false); }
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true); setActionError('');
    try { await platformApi.support.message(selected.id, { message: reply.trim(), isInternal: false }); setReply(''); setSelected(await platformApi.support.get(selected.id)); await refetch(); }
    catch (requestError) { setActionError(requestError.message); }
    finally { setSubmitting(false); }
  };

  return <div className="fin-support-page animate-fade-in">
    <header className="fin-support-header"><div><h1 className="fin-support-title">Help & Support</h1><p className="fin-support-subtitle">Create a request and keep the complete conversation in one place.</p></div><Button variant="cyan" icon={Plus} onClick={() => { setActionError(''); setCreateOpen(true); }}>Create Support Ticket</Button></header>
    {actionError && <p className="fin-support-error" role="alert">{actionError}</p>}

    <section className="fin-support-contact-grid"><article className="fin-support-card"><div className="fin-support-icon-wrapper fin-sup-blue"><LifeBuoy size={23} /></div><h2>In-platform support</h2><p>Create and track tickets</p><span className="fin-support-availability">Recommended for account and billing issues</span></article><article className="fin-support-card"><div className="fin-support-icon-wrapper fin-sup-purple"><Mail size={23} /></div><h2>Email support</h2><a href="mailto:support@inrfs.in">support@inrfs.in</a><span className="fin-support-availability">Use your registered organization email</span></article></section>

    <div className="fin-support-layout-grid"><section className="fin-support-faq-card"><div className="fin-support-faq-header"><HelpCircle size={20} className="fin-support-hdr-icon" /><h2>Frequently Asked Questions</h2></div><div className="fin-support-faq-list">{faqs.map((faq, index) => <article key={faq.q} className="fin-support-faq-item"><h3><button type="button" className="fin-support-faq-question" aria-expanded={openFaqIndex === index} onClick={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}><span>{faq.q}</span>{openFaqIndex === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button></h3>{openFaqIndex === index && <div className="fin-support-faq-answer"><p>{faq.a}</p></div>}</article>)}</div></section>
      <section className="fin-support-tickets-card"><div className="fin-support-tickets-header"><FileText size={20} className="fin-support-hdr-icon" /><h2>Ticket History</h2></div><div className="fin-support-tickets-list">{loading && <p role="status">Loading tickets...</p>}{error && <div className="fin-support-query-error"><p>{error.message}</p><Button onClick={refetch}>Try again</Button></div>}{!loading && !error && tickets.length === 0 && <div className="fin-support-empty"><MessageSquare size={24} /><strong>No support tickets yet</strong><span>Create a ticket when you need assistance.</span></div>}{tickets.map((ticket) => <button type="button" key={ticket.id} className="fin-support-ticket-item" onClick={() => openTicket(ticket)}><div className="fin-support-ticket-top"><span className="fin-support-tck-id">{ticket.ticketNumber || ticket.id}</span><StatusBadge status={ticket.status} /></div><strong className="fin-support-tck-subject">{ticket.subject}</strong><div className="fin-support-ticket-bottom"><span>{ticket.category} · {ticket.priority}</span><span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('en-IN') : ''}</span></div></button>)}</div></section></div>

    <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Support Ticket"><form onSubmit={createTicket} className="fin-support-modal-form"><div className="fin-support-input-group"><label htmlFor="ticketSubject">Ticket Subject</label><input id="ticketSubject" value={newTicket.subject} onChange={(event) => setNewTicket({ ...newTicket, subject: event.target.value })} required maxLength="200" /></div><div className="fin-support-field-grid"><div className="fin-support-input-group"><label htmlFor="ticketCategory">Category</label><select id="ticketCategory" value={newTicket.category} onChange={(event) => setNewTicket({ ...newTicket, category: event.target.value })}><option value="Technical">Technical Issue</option><option value="Billing">Billing</option><option value="Feature Request">Feature Request</option><option value="Account">Account Access</option></select></div><div className="fin-support-input-group"><label htmlFor="ticketPriority">Priority</label><select id="ticketPriority" value={newTicket.priority} onChange={(event) => setNewTicket({ ...newTicket, priority: event.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div></div><div className="fin-support-input-group"><label htmlFor="ticketDescription">Description</label><textarea id="ticketDescription" rows="5" value={newTicket.description} onChange={(event) => setNewTicket({ ...newTicket, description: event.target.value })} required maxLength="4000" /></div>{actionError && <p className="fin-support-error" role="alert">{actionError}</p>}<div className="fin-support-modal-actions"><Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" variant="cyan" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Ticket'}</Button></div></form></Modal>

    <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${selected.ticketNumber} · ${selected.subject}` : 'Support ticket'}>{selected && <div className="fin-ticket-detail"><div className="fin-ticket-meta"><StatusBadge status={selected.status} /><span>{selected.category}</span><span>{selected.priority} priority</span></div><section><h3>Your request</h3><p>{selected.description}</p><small>{dateTime(selected.createdAt)}</small></section><section><h3>Conversation</h3><div className="fin-ticket-messages">{(selected.messages || []).filter((item) => !item.isInternal).length ? selected.messages.filter((item) => !item.isInternal).map((item) => <article key={item.id}><strong>{item.senderId === selected.openedBy ? 'Your team' : 'INRFS support'}</strong><p>{item.message}</p><small>{dateTime(item.createdAt)}</small></article>) : <p>No replies yet.</p>}</div></section><form onSubmit={sendReply} className="fin-support-modal-form"><div className="fin-support-input-group"><label htmlFor="financerTicketReply">Follow-up message</label><textarea id="financerTicketReply" rows="4" value={reply} onChange={(event) => setReply(event.target.value)} required maxLength="4000" /></div>{actionError && <p className="fin-support-error" role="alert">{actionError}</p>}<div className="fin-support-modal-actions"><Button type="button" variant="secondary" onClick={() => setSelected(null)}>Close</Button><Button type="submit" variant="cyan" disabled={submitting || !reply.trim()}>{submitting ? 'Sending...' : 'Send Message'}</Button></div></form></div>}</Modal>
  </div>;
}
