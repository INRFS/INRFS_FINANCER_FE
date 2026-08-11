import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, Plus, FileText } from 'lucide-react';
import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import StatusBadge from '../../../common/components/StatusBadge';
import { mockSupportTickets } from '../../data/mockFinancerData';
import './Support.css';

export default function Support() {
  const [tickets, setTickets] = useState(mockSupportTickets);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  const [newTicket, setNewTicket] = useState({ subject: '', category: 'Technical', description: '' });

  const faqs = [
    { q: 'How is daily collection interest calculated?', a: 'Daily collection interest is computed based on the principal balance multiplied by daily rate fraction divided by compounding tenure.' },
    { q: 'Can I export ledger statements to Excel or PDF?', a: 'Yes! Navigate to the Customer Ledger page, pick a customer account and click "Export PDF" or "Print Statement".' },
    { q: 'What happens when a customer payment is overdue?', a: 'Overdue loans trigger automated notifications in the Notifications Center and highlight the account in red on the Due & Overdue page.' },
    { q: 'How do I add a secondary financer user or staff?', a: 'Go to Settings > Profile or Security settings to invite loan officers and staff members with custom permissions.' }
  ];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    const created = {
      id: `TCK-${Math.floor(802 + Math.random() * 100)}`,
      subject: newTicket.subject,
      category: newTicket.category,
      date: '10-Sep-2026',
      status: 'Pending'
    };
    setTickets([created, ...tickets]);
    setIsTicketModalOpen(false);
    setNewTicket({ subject: '', category: 'Technical', description: '' });
  };

  return (
    <div className="fin-support-page animate-fade-in">
      <div className="fin-support-header">
        <div>
          <h1 className="fin-support-title">Help & Customer Support</h1>
          <p className="fin-support-subtitle">Get instant assistance, access guides or raise a ticket with the INRFS helpdesk team.</p>
        </div>
        <Button variant="cyan" icon={Plus} onClick={() => setIsTicketModalOpen(true)}>
          Create Support Ticket
        </Button>
      </div>

      {/* Support Cards */}
      <div className="fin-support-contact-grid">
        <div className="fin-support-card">
          <div className="fin-support-icon-wrapper fin-sup-blue">
            <Phone size={24} />
          </div>
          <h3>Dedicated Helpline</h3>
          <p>Toll-Free 1800-123-4567</p>
          <span className="fin-support-availability">Mon - Sat (9 AM - 7 PM)</span>
        </div>

        <div className="fin-support-card">
          <div className="fin-support-icon-wrapper fin-sup-green">
            <MessageSquare size={24} />
          </div>
          <h3>WhatsApp Support</h3>
          <p>+91 98765 00000</p>
          <span className="fin-support-availability">Instant AI & Human Response</span>
        </div>

        <div className="fin-support-card">
          <div className="fin-support-icon-wrapper fin-sup-purple">
            <Mail size={24} />
          </div>
          <h3>Email Support</h3>
          <p>support@inrfs.com</p>
          <span className="fin-support-availability">Response within 2 hours</span>
        </div>
      </div>

      {/* FAQ & Ticket History Section */}
      <div className="fin-support-layout-grid">
        {/* FAQ Accordion */}
        <div className="fin-support-faq-card">
          <div className="fin-support-faq-header">
            <HelpCircle size={20} className="fin-support-hdr-icon" />
            <h3>Frequently Asked Questions</h3>
          </div>

          <div className="fin-support-faq-list">
            {faqs.map((faq, idx) => (
              <div key={idx} className="fin-support-faq-item">
                <button
                  className="fin-support-faq-question"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaqIndex === idx && (
                  <div className="fin-support-faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Ticket History */}
        <div className="fin-support-tickets-card">
          <div className="fin-support-tickets-header">
            <FileText size={20} className="fin-support-hdr-icon" />
            <h3>Support Ticket History</h3>
          </div>

          <div className="fin-support-tickets-list">
            {tickets.map((t) => (
              <div key={t.id} className="fin-support-ticket-item">
                <div className="fin-support-ticket-top">
                  <span className="fin-support-tck-id">{t.id}</span>
                  <StatusBadge status={t.status} />
                </div>
                <h4 className="fin-support-tck-subject">{t.subject}</h4>
                <div className="fin-support-ticket-bottom">
                  <span className="fin-support-tck-cat">{t.category}</span>
                  <span className="fin-support-tck-date">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Create New Support Ticket"
      >
        <form onSubmit={handleTicketSubmit} className="fin-support-modal-form">
          <div className="fin-support-input-group">
            <label>Ticket Subject</label>
            <input
              type="text"
              placeholder="e.g. Issue generating collection report"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              required
            />
          </div>

          <div className="fin-support-input-group">
            <label>Category</label>
            <select
              value={newTicket.category}
              onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
            >
              <option value="Technical">Technical Issue</option>
              <option value="Billing">Billing & Plan</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Account">Account Security</option>
            </select>
          </div>

          <div className="fin-support-input-group">
            <label>Description & Details</label>
            <textarea
              rows={4}
              placeholder="Describe your issue in detail..."
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              required
            />
          </div>

          <div className="fin-support-modal-actions">
            <Button type="button" variant="secondary" onClick={() => setIsTicketModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cyan">
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
