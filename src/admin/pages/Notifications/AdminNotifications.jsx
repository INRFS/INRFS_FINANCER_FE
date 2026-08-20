import React, { useEffect, useState } from 'react';
import { ShieldAlert, Building2, Send } from 'lucide-react';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import './AdminNotifications.css';

const financerLabel = (financer) => {
  const businessName = financer.displayName || financer.legalName || 'Unnamed business';
  const ownerName = financer.ownerName?.trim();
  return ownerName ? `${businessName} — ${ownerName}` : businessName;
};

export default function AdminNotifications() {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [financers, setFinancers] = useState([]);
  const [form, setForm] = useState({ financerId: '', title: '', message: '' });
  const [sending, setSending] = useState(false);
  const load = () => platformApi.notifications.list({ pageSize: 200 }).then((payload) => setAlerts(pageItems(payload)));
  useEffect(() => {
    Promise.all([load(), platformApi.admin.allFinancers({ pageSize: 100 })])
      .then(([, payload]) => setFinancers(pageItems(payload)))
      .catch((reason) => setError(reason.message));
  }, []);

  const sendAnnouncement = async (event) => {
    event.preventDefault(); setSending(true); setError(''); setSuccess('');
    try {
      const recipients = form.financerId === '__all__'
        ? financers
        : financers.filter((financer) => financer.id === form.financerId);
      const announcement = (financerId) => platformApi.notifications.create({
        financerId,
        userId: null,
        title: form.title.trim(),
        message: form.message.trim(),
        type: 'System',
        channel: 'InApp',
        entityType: null,
        entityId: null,
      });
      await Promise.all(recipients.map((financer) => announcement(financer.id)));
      setSuccess(form.financerId === '__all__'
        ? `Announcement sent to all ${recipients.length} financers.`
        : 'Announcement sent successfully.');
      setForm({ financerId: '', title: '', message: '' });
      await load();
    } catch (reason) { setError(reason.message); }
    finally { setSending(false); }
  };

  return (
    <div className="admin-notifications-page animate-fade-in">
      {error && <p role="alert">{error}</p>}
      {success && <p className="admin-notifications-success" role="status">{success}</p>}
      <div className="admin-notifications-header">
        <div>
          <h1 className="admin-notifications-title">System Audit Alerts</h1>
          <p className="admin-notifications-subtitle">Real-time alerts regarding platform security, KYC submissions & system health.</p>
        </div>
      </div>

      <form className="admin-notifications-compose" onSubmit={sendAnnouncement}>
        <h2>Send account or system announcement</h2>
        <label>Financer
          <select value={form.financerId} onChange={(event) => setForm({ ...form, financerId: event.target.value })} required>
            <option value="">Select a financer</option>
            <option value="__all__">All financers ({financers.length})</option>
            {financers.map((financer) => (
              <option key={financer.id} value={financer.id}>{financerLabel(financer)}</option>
            ))}
          </select>
        </label>
        <label>Title
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={200} required />
        </label>
        <label>Message
          <textarea rows="4" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} maxLength={2000} required />
        </label>
        <button type="submit" disabled={sending}><Send size={17} />{sending ? 'Sending…' : 'Send announcement'}</button>
      </form>

      <div className="admin-notifications-list">
        {alerts.map((a) => (
          <div key={a.id} className="admin-notifications-card">
            <div className="admin-notifications-icon">
              {String(a.type).toLowerCase().includes('kyc') ? <Building2 size={20} className="admin-notif-purple" /> : <ShieldAlert size={20} className="admin-notif-cyan" />}
            </div>
            <div className="admin-notifications-body">
              <div className="admin-notifications-top">
                <h4>{a.title}</h4>
                <span className="admin-notifications-time">{a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}</span>
              </div>
              <p>{a.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
