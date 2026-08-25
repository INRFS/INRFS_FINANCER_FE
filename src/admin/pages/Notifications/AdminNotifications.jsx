import React, { useEffect, useMemo, useState } from 'react';
import {
  ShieldAlert,
  Building2,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Search,
  X,
  FileText,
  Eye,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../auth/authState';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import { formatCurrency, formatDate } from '../../../common/utils/formatters';
import './AdminNotifications.css';

const financerLabel = (financer) => {
  const businessName = financer.displayName || financer.legalName || 'Unnamed business';
  const ownerName = financer.ownerName?.trim();
  return ownerName ? `${businessName} — ${ownerName}` : businessName;
};

const statusBadgeClass = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'RESOLVED':
      return 'status-badge--resolved';
    case 'ACTION_TAKEN':
      return 'status-badge--action';
    case 'UNDER_REVIEW':
      return 'status-badge--review';
    case 'PENDING':
    default:
      return 'status-badge--pending';
  }
};

const statusDisplayLabel = (status) => {
  switch ((status || '').toUpperCase()) {
    case 'RESOLVED':
      return 'Resolved';
    case 'ACTION_TAKEN':
      return 'Action Taken';
    case 'UNDER_REVIEW':
      return 'Under Review';
    case 'PENDING':
    default:
      return 'Pending';
  }
};

export default function AdminNotifications() {
  const location = useLocation();
  let authContext = null;
  try {
    authContext = useAuth();
  } catch {
    authContext = null;
  }
  const user = authContext?.user;

  const [activeTab, setActiveTab] = useState('concerns'); // 'concerns' | 'announcements'
  const [concerns, setConcerns] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [financers, setFinancers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Concern filters & search
  const [concernStatusFilter, setConcernStatusFilter] = useState('All');
  const [concernSearch, setConcernSearch] = useState('');

  // Selected concern for Modal
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [savingAction, setSavingAction] = useState(false);

  // Announcement compose form
  const [form, setForm] = useState({ financerId: '', title: '', message: '' });
  const [sending, setSending] = useState(false);

  const adminFullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'Administrator';
  const adminId = user?.id || 'admin_user';

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifsPayload, financersPayload, concernsPayload] = await Promise.all([
        platformApi.notifications.list({ pageSize: 200 }).catch(() => ({ items: [] })),
        platformApi.admin.allFinancers({ pageSize: 100 }).catch(() => ({ items: [] })),
        platformApi.collectionConcerns?.list ? platformApi.collectionConcerns.list() : { items: [] },
      ]);

      const notifItems = pageItems(notifsPayload);
      setAlerts(notifItems);
      setFinancers(pageItems(financersPayload));

      const concernItems = pageItems(concernsPayload);
      setConcerns(concernItems);

      // Check if navigated with a selected concern ID
      if (location.state?.selectedConcernId) {
        const found = concernItems.find((c) => c.id === location.state.selectedConcernId);
        if (found) {
          openConcernModal(found);
        }
      }
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('inrfs-notification-updated', handleUpdate);
    return () => window.removeEventListener('inrfs-notification-updated', handleUpdate);
  }, []);

  const openConcernModal = (concern) => {
    setSelectedConcern(concern);
    setSelectedStatus(concern.status || 'PENDING');
    setAdminNotes(concern.adminNotes || '');

    // Mark corresponding notification as read if not already read
    const relatedNotif = alerts.find(
      (a) => a.concernId === concern.id || a.entityId === concern.id
    );
    if (relatedNotif && !relatedNotif.readAt) {
      platformApi.notifications.read(relatedNotif.id).catch(() => {});
    }
  };

  const closeConcernModal = () => {
    setSelectedConcern(null);
    setAdminNotes('');
  };

  const handleUpdateConcern = async (newStatus) => {
    if (!selectedConcern) return;
    setSavingAction(true);
    setError('');
    setSuccess('');

    const targetStatus = newStatus || selectedStatus;

    try {
      const updated = await platformApi.collectionConcerns.update(selectedConcern.id, {
        status: targetStatus,
        adminNotes: adminNotes.trim(),
        handledByAdminId: adminId,
        handledByAdminName: adminFullName,
      });

      setSuccess(`Customer Collection Concern updated to "${statusDisplayLabel(targetStatus)}".`);
      setSelectedConcern(updated);
      setSelectedStatus(updated.status);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update concern.');
    } finally {
      setSavingAction(false);
    }
  };

  const sendAnnouncement = async (event) => {
    event.preventDefault();
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const recipients =
        form.financerId === '__all__'
          ? financers
          : financers.filter((financer) => financer.id === form.financerId);

      const announcement = (financerId) =>
        platformApi.notifications.create({
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
      setSuccess(
        form.financerId === '__all__'
          ? `Announcement sent to all ${recipients.length} financers.`
          : 'Announcement sent successfully.'
      );
      setForm({ financerId: '', title: '', message: '' });
      await loadData();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSending(false);
    }
  };

  const filteredConcerns = useMemo(() => {
    return concerns.filter((item) => {
      const matchesStatus =
        concernStatusFilter === 'All' ||
        (item.status || '').toUpperCase() === concernStatusFilter.toUpperCase();

      const searchStr = concernSearch.trim().toLowerCase();
      const matchesSearch =
        !searchStr ||
        `${item.customerName || ''} ${item.customerNumber || ''} ${item.loanNumber || ''} ${item.financerName || ''}`
          .toLowerCase()
          .includes(searchStr);

      return matchesStatus && matchesSearch;
    });
  }, [concerns, concernStatusFilter, concernSearch]);

  const concernCounts = useMemo(() => {
    return {
      all: concerns.length,
      pending: concerns.filter((c) => (c.status || '').toUpperCase() === 'PENDING').length,
      underReview: concerns.filter((c) => (c.status || '').toUpperCase() === 'UNDER_REVIEW').length,
      actionTaken: concerns.filter((c) => (c.status || '').toUpperCase() === 'ACTION_TAKEN').length,
      resolved: concerns.filter((c) => (c.status || '').toUpperCase() === 'RESOLVED').length,
    };
  }, [concerns]);

  return (
    <div className="admin-notifications-page animate-fade-in">
      {error && <p className="admin-notifications-error" role="alert">{error}</p>}
      {success && <p className="admin-notifications-success" role="status">{success}</p>}

      <div className="admin-notifications-header">
        <div>
          <h1 className="admin-notifications-title">Notifications &amp; Concerns</h1>
          <p className="admin-notifications-subtitle">
            Review customer collection concerns flagged by financers, take administrative actions, and manage platform alerts.
          </p>
        </div>

        <div className="admin-notifications-nav-tabs">
          <button
            type="button"
            className={`admin-nav-tab ${activeTab === 'concerns' ? 'active' : ''}`}
            onClick={() => setActiveTab('concerns')}
          >
            <AlertTriangle size={17} />
            <span>Collection Concerns</span>
            {concernCounts.pending > 0 && (
              <span className="admin-tab-badge">{concernCounts.pending}</span>
            )}
          </button>
          <button
            type="button"
            className={`admin-nav-tab ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <ShieldAlert size={17} />
            <span>System Alerts &amp; Announcements</span>
            {alerts.filter((a) => !a.readAt).length > 0 && (
              <span className="admin-tab-badge admin-tab-badge--cyan">
                {alerts.filter((a) => !a.readAt).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: COLLECTION CONCERNS
          ======================================================== */}
      {activeTab === 'concerns' && (
        <section className="admin-concerns-section">
          {/* Metrics summary */}
          <div className="admin-concerns-metrics">
            <div className="admin-metric-card">
              <span className="admin-metric-label">Total Flagged</span>
              <strong className="admin-metric-value">{concernCounts.all}</strong>
            </div>
            <div className="admin-metric-card admin-metric-card--amber">
              <span className="admin-metric-label">Pending Review</span>
              <strong className="admin-metric-value">{concernCounts.pending}</strong>
            </div>
            <div className="admin-metric-card admin-metric-card--purple">
              <span className="admin-metric-label">Under Review</span>
              <strong className="admin-metric-value">{concernCounts.underReview}</strong>
            </div>
            <div className="admin-metric-card admin-metric-card--indigo">
              <span className="admin-metric-label">Action Taken</span>
              <strong className="admin-metric-value">{concernCounts.actionTaken}</strong>
            </div>
            <div className="admin-metric-card admin-metric-card--green">
              <span className="admin-metric-label">Resolved</span>
              <strong className="admin-metric-value">{concernCounts.resolved}</strong>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="admin-concerns-toolbar">
            <div className="admin-concerns-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by customer, loan ID, or financer..."
                value={concernSearch}
                onChange={(e) => setConcernSearch(e.target.value)}
              />
              {concernSearch && (
                <button
                  type="button"
                  className="admin-search-clear"
                  onClick={() => setConcernSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="admin-concerns-filters">
              <button
                type="button"
                className={`admin-filter-chip ${concernStatusFilter === 'All' ? 'active' : ''}`}
                onClick={() => setConcernStatusFilter('All')}
              >
                All ({concernCounts.all})
              </button>
              <button
                type="button"
                className={`admin-filter-chip ${concernStatusFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => setConcernStatusFilter('PENDING')}
              >
                Pending ({concernCounts.pending})
              </button>
              <button
                type="button"
                className={`admin-filter-chip ${concernStatusFilter === 'UNDER_REVIEW' ? 'active' : ''}`}
                onClick={() => setConcernStatusFilter('UNDER_REVIEW')}
              >
                Under Review ({concernCounts.underReview})
              </button>
              <button
                type="button"
                className={`admin-filter-chip ${concernStatusFilter === 'ACTION_TAKEN' ? 'active' : ''}`}
                onClick={() => setConcernStatusFilter('ACTION_TAKEN')}
              >
                Action Taken ({concernCounts.actionTaken})
              </button>
              <button
                type="button"
                className={`admin-filter-chip ${concernStatusFilter === 'RESOLVED' ? 'active' : ''}`}
                onClick={() => setConcernStatusFilter('RESOLVED')}
              >
                Resolved ({concernCounts.resolved})
              </button>
            </div>
          </div>

          {/* Concern Cards List */}
          <div className="admin-concerns-list">
            {filteredConcerns.length === 0 ? (
              <div className="admin-empty-state">
                <AlertTriangle size={36} className="admin-empty-icon" />
                <h3>No Customer Collection Concerns Found</h3>
                <p>
                  {concernSearch || concernStatusFilter !== 'All'
                    ? 'No records match the current filter and search criteria.'
                    : 'When financers flag collection concerns during loan creation, they will appear here.'}
                </p>
              </div>
            ) : (
              filteredConcerns.map((concern) => (
                <div key={concern.id} className="admin-concern-card">
                  <div className="admin-concern-card-main">
                    <div className="admin-concern-card-top">
                      <div className="admin-concern-title-row">
                        <span className={`admin-status-badge ${statusBadgeClass(concern.status)}`}>
                          {statusDisplayLabel(concern.status)}
                        </span>
                        <h3 className="admin-concern-customer">
                          {concern.customerName}
                          {concern.customerNumber && (
                            <span className="admin-concern-cust-num"> ({concern.customerNumber})</span>
                          )}
                        </h3>
                      </div>
                      <span className="admin-concern-time">
                        {concern.createdAt ? new Date(concern.createdAt).toLocaleString() : ''}
                      </span>
                    </div>

                    <div className="admin-concern-meta-grid">
                      <div className="admin-meta-item">
                        <span className="admin-meta-label">Loan ID</span>
                        <strong className="admin-meta-val">{concern.loanNumber || concern.loanId}</strong>
                      </div>
                      <div className="admin-meta-item">
                        <span className="admin-meta-label">Principal Amount</span>
                        <strong className="admin-meta-val admin-meta-val--amount">
                          {formatCurrency(concern.principal)}
                        </strong>
                      </div>
                      <div className="admin-meta-item">
                        <span className="admin-meta-label">Financer</span>
                        <strong className="admin-meta-val">{concern.financerName || 'Financer'}</strong>
                      </div>
                    </div>

                    <div className="admin-concern-reason-box">
                      <Info size={15} />
                      <p>
                        <strong>Financer Concern: </strong>
                        {concern.reason || 'Customer flagged as potentially difficult for repayment collection.'}
                      </p>
                    </div>

                    {concern.adminNotes && (
                      <div className="admin-concern-notes-box">
                        <strong>Admin Notes / Action Taken: </strong>
                        <span>{concern.adminNotes}</span>
                        {concern.handledByAdminName && (
                          <small className="admin-handled-by">
                            — Handled by {concern.handledByAdminName} on{' '}
                            {concern.actionDate ? new Date(concern.actionDate).toLocaleString() : ''}
                          </small>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="admin-concern-card-actions">
                    <button
                      type="button"
                      className="admin-view-details-btn"
                      onClick={() => openConcernModal(concern)}
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          TAB 2: SYSTEM ANNOUNCEMENTS & ALERTS
          ======================================================== */}
      {activeTab === 'announcements' && (
        <section className="admin-announcements-section">
          <form className="admin-notifications-compose" onSubmit={sendAnnouncement}>
            <h2>Send account or system announcement</h2>
            <label>
              Financer
              <select
                value={form.financerId}
                onChange={(event) => setForm({ ...form, financerId: event.target.value })}
                required
              >
                <option value="">Select a financer</option>
                <option value="__all__">All financers ({financers.length})</option>
                {financers.map((financer) => (
                  <option key={financer.id} value={financer.id}>
                    {financerLabel(financer)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                maxLength={200}
                required
              />
            </label>
            <label>
              Message
              <textarea
                rows="4"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                maxLength={2000}
                required
              />
            </label>
            <button type="submit" disabled={sending}>
              <Send size={17} />
              {sending ? 'Sending…' : 'Send announcement'}
            </button>
          </form>

          <div className="admin-notifications-list">
            {alerts.length === 0 ? (
              <p className="admin-empty-state">No system alerts recorded.</p>
            ) : (
              alerts.map((a) => (
                <div key={a.id} className={`admin-notifications-card ${a.readAt ? '' : 'unread'}`}>
                  <div className="admin-notifications-icon">
                    {String(a.type).toLowerCase().includes('kyc') ? (
                      <Building2 size={20} className="admin-notif-purple" />
                    ) : String(a.type).toLowerCase().includes('collection') ? (
                      <AlertTriangle size={20} className="admin-notif-amber" />
                    ) : (
                      <ShieldAlert size={20} className="admin-notif-cyan" />
                    )}
                  </div>
                  <div className="admin-notifications-body">
                    <div className="admin-notifications-top">
                      <h4>{a.title}</h4>
                      <span className="admin-notifications-time">
                        {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <p>{a.message}</p>
                    {a.customerName && (
                      <div className="admin-notif-meta">
                        <span>Customer: {a.customerName}</span>
                        {a.loanNumber && <span>Loan: {a.loanNumber}</span>}
                        {a.principal && <span>Principal: {formatCurrency(a.principal)}</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ========================================================
          CONCERN DETAILS MODAL
          ======================================================== */}
      {selectedConcern && (
        <div className="admin-modal-overlay" onMouseDown={closeConcernModal}>
          <div
            className="admin-modal-content"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="admin-modal-header">
              <div>
                <h2>Customer Collection Concern Details</h2>
                <p>
                  Review customer &amp; loan information and record administrative action taken.
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={closeConcernModal}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Customer and Loan Overview Grid */}
              <div className="admin-modal-two-col">
                {/* Customer Card */}
                <div className="admin-modal-info-card">
                  <div className="admin-info-card-header">
                    <User size={18} />
                    <h3>Customer Details</h3>
                  </div>
                  <div className="admin-info-rows">
                    <div className="admin-info-row">
                      <span>Customer Name</span>
                      <strong>{selectedConcern.customerName}</strong>
                    </div>
                    <div className="admin-info-row">
                      <span>Customer ID / No.</span>
                      <strong>{selectedConcern.customerNumber || selectedConcern.customerId || '—'}</strong>
                    </div>
                    {selectedConcern.customerPhone && (
                      <div className="admin-info-row">
                        <span>Phone</span>
                        <strong>{selectedConcern.customerPhone}</strong>
                      </div>
                    )}
                    {selectedConcern.customerEmail && (
                      <div className="admin-info-row">
                        <span>Email</span>
                        <strong>{selectedConcern.customerEmail}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Loan Card */}
                <div className="admin-modal-info-card">
                  <div className="admin-info-card-header">
                    <FileText size={18} />
                    <h3>Loan Details</h3>
                  </div>
                  <div className="admin-info-rows">
                    <div className="admin-info-row">
                      <span>Loan Number</span>
                      <strong>{selectedConcern.loanNumber || selectedConcern.loanId}</strong>
                    </div>
                    <div className="admin-info-row">
                      <span>Principal Amount</span>
                      <strong className="admin-highlight-amount">
                        {formatCurrency(selectedConcern.principal)}
                      </strong>
                    </div>
                    <div className="admin-info-row">
                      <span>Interest Rate</span>
                      <strong>{selectedConcern.annualInterestRate || selectedConcern.interestRate || '—'}% / Month</strong>
                    </div>
                    <div className="admin-info-row">
                      <span>Duration</span>
                      <strong>{selectedConcern.durationValue} {selectedConcern.durationUnit || 'Months'}</strong>
                    </div>
                    <div className="admin-info-row">
                      <span>Start Date</span>
                      <strong>{formatDate(selectedConcern.startDate)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financer & Concern Flagging Details */}
              <div className="admin-modal-info-card admin-flag-summary-card">
                <div className="admin-info-card-header">
                  <AlertTriangle size={18} className="admin-icon-amber" />
                  <h3>Flagged by Financer</h3>
                </div>
                <div className="admin-info-rows">
                  <div className="admin-info-row">
                    <span>Financer Name</span>
                    <strong>{selectedConcern.financerName || 'Financer'}</strong>
                  </div>
                  <div className="admin-info-row">
                    <span>Flagged On</span>
                    <strong>{selectedConcern.createdAt ? new Date(selectedConcern.createdAt).toLocaleString() : '—'}</strong>
                  </div>
                  <div className="admin-info-row">
                    <span>Concern Reason</span>
                    <strong className="admin-concern-highlight-reason">
                      {selectedConcern.reason || 'Financer flagged difficulty in collection during loan creation.'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Admin Action Form */}
              <div className="admin-modal-action-box">
                <h3>Take Administrative Action</h3>

                <div className="admin-action-status-select-row">
                  <label htmlFor="concernStatusSelect">
                    <strong>Concern Status:</strong>
                  </label>
                  <select
                    id="concernStatusSelect"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="admin-status-select"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="ACTION_TAKEN">Action Taken</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>

                <div className="admin-action-notes-field">
                  <label htmlFor="adminNotesTextarea">
                    <strong>Admin Notes / Action Taken:</strong>
                  </label>
                  <textarea
                    id="adminNotesTextarea"
                    rows="3"
                    placeholder="e.g. Contacted financer and instructed them to collect repayment through follow-up visits..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                {selectedConcern.handledByAdminName && (
                  <div className="admin-action-history-audit">
                    <CheckCircle2 size={15} />
                    <span>
                      Previously updated by <strong>{selectedConcern.handledByAdminName}</strong> on{' '}
                      {selectedConcern.actionDate ? new Date(selectedConcern.actionDate).toLocaleString() : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={closeConcernModal}
                disabled={savingAction}
              >
                Close
              </button>

              <button
                type="button"
                className="admin-btn-action-taken"
                onClick={() => handleUpdateConcern('ACTION_TAKEN')}
                disabled={savingAction}
              >
                <Check size={16} />
                Mark as Action Taken
              </button>

              <button
                type="button"
                className="admin-btn-resolved"
                onClick={() => handleUpdateConcern('RESOLVED')}
                disabled={savingAction}
              >
                <CheckCircle2 size={16} />
                Mark as Resolved
              </button>

              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => handleUpdateConcern()}
                disabled={savingAction}
              >
                {savingAction ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
