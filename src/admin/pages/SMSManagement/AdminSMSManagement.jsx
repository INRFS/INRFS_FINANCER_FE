import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Coins,
  Eye,
  MessageSquare,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';

import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import './AdminSMSManagement.css';

import {
  adminSMSStats,
  adminSMSFinancerUsage,
  adminSMSActivity,
} from '../../data/mockAdminData';

function formatNumber(number) {
  return Number(number || 0).toLocaleString('en-IN');
}

function getUsageStatus(usage) {
  if (usage >= 90) {
    return 'Critical';
  }

  if (usage >= 75) {
    return 'Warning';
  }

  return 'Normal';
}

function getUsageStatusClass(usage) {
  if (usage >= 90) {
    return 'inrfs-sms-status-critical';
  }

  if (usage >= 75) {
    return 'inrfs-sms-status-warning';
  }

  return 'inrfs-sms-status-normal';
}

export default function AdminSMSManagement() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedActivity, setSelectedActivity] = useState(null);

  const stats = adminSMSStats || {};
  const financerUsage = Array.isArray(adminSMSFinancerUsage)
    ? adminSMSFinancerUsage
    : [];

  const smsActivity = Array.isArray(adminSMSActivity)
    ? adminSMSActivity
    : [];

  const filteredFinancerUsage = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return financerUsage.filter((item) => {
      const usageStatus = getUsageStatus(
        Number(item.usage || 0)
      );

      const searchableText = [
        item.financer,
        item.financerId,
        usageStatus,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'All' ||
        usageStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [financerUsage, search, statusFilter]);

  const filteredActivity = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return smsActivity.filter((item) => {
      const searchableText = [
        item.activityId,
        item.financer,
        item.customer,
        item.mobile,
        item.messageType,
        item.status,
        item.reference,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        !normalizedSearch ||
        searchableText.includes(normalizedSearch)
      );
    });
  }, [smsActivity, search]);

  const deliveryRate =
    Number(stats.sentThisMonth || 0) > 0
      ? (
          (Number(stats.delivered || 0) /
            Number(stats.sentThisMonth || 0)) *
          100
        ).toFixed(1)
      : '0.0';

  const platformCreditsUsed = Number(
    stats.sentThisMonth || 0
  );

  const platformCreditLimit = Number(
    stats.platformCreditLimit || 100000
  );

  const platformCreditsPercentage =
    platformCreditLimit > 0
      ? Math.min(
          (platformCreditsUsed / platformCreditLimit) * 100,
          100
        )
      : 0;

  const maxUsage = Math.max(
    1800,
    ...financerUsage.map((item) =>
      Number(item.allocated || 0)
    )
  );

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
  };

  return (
    <div className="inrfs-sms-page">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="inrfs-sms-header">
        <div className="inrfs-sms-header-content">
          <div>
            <h1 className="inrfs-sms-title">
              SMS Management
            </h1>

            <p className="inrfs-sms-subtitle">
              Monitor platform SMS usage, delivery performance,
              financer allocations and messaging activity.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <section className="inrfs-sms-kpi-grid">
        <div className="inrfs-sms-kpi-card">
          <div className="inrfs-sms-kpi-icon inrfs-sms-kpi-icon--blue">
            <MessageSquare size={20} />
          </div>

          <div className="inrfs-sms-kpi-content">
            <span>Sent Today</span>
            <strong>
              {formatNumber(stats.sentToday)}
            </strong>
            <small>Messages sent today</small>
          </div>
        </div>

        <div className="inrfs-sms-kpi-card">
          <div className="inrfs-sms-kpi-icon inrfs-sms-kpi-icon--purple">
            <TrendingUp size={20} />
          </div>

          <div className="inrfs-sms-kpi-content">
            <span>Sent This Month</span>
            <strong>
              {formatNumber(stats.sentThisMonth)}
            </strong>
            <small>Monthly SMS volume</small>
          </div>
        </div>

        <div className="inrfs-sms-kpi-card">
          <div className="inrfs-sms-kpi-icon inrfs-sms-kpi-icon--green">
            <CheckCircle2 size={20} />
          </div>

          <div className="inrfs-sms-kpi-content">
            <span>Delivered</span>
            <strong>
              {formatNumber(stats.delivered)}
            </strong>
            <small>{deliveryRate}% delivery rate</small>
          </div>
        </div>

        <div className="inrfs-sms-kpi-card">
          <div className="inrfs-sms-kpi-icon inrfs-sms-kpi-icon--red">
            <X size={20} />
          </div>

          <div className="inrfs-sms-kpi-content">
            <span>Failed</span>
            <strong>
              {formatNumber(stats.failed)}
            </strong>
            <small>Failed message attempts</small>
          </div>
        </div>

        <div className="inrfs-sms-kpi-card">
          <div className="inrfs-sms-kpi-icon inrfs-sms-kpi-icon--orange">
            <Coins size={20} />
          </div>

          <div className="inrfs-sms-kpi-content">
            <span>Credits Remaining</span>
            <strong>
              {formatNumber(stats.creditsRemaining)}
            </strong>
            <small>Available platform credits</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          ANALYTICS SECTION
      ====================================================== */}

      <section className="inrfs-sms-analytics-grid">
        {/* Usage Chart */}

        <div className="inrfs-sms-chart-card">
          <div className="inrfs-sms-section-header">
            <div>
              <h2>SMS Usage by Financer</h2>
              <p>
                Allocated versus consumed SMS credits
              </p>
            </div>
          </div>

          <div className="inrfs-sms-chart-content">
            {financerUsage.length > 0 ? (
              <>
                <div className="inrfs-sms-chart-list">
                  {financerUsage.map((item) => {
                    const usedWidth =
                      Math.min(
                        (Number(item.used || 0) /
                          maxUsage) *
                          100,
                        100
                      );

                    const allocatedWidth =
                      Math.min(
                        (Number(item.allocated || 0) /
                          maxUsage) *
                          100,
                        100
                      );

                    return (
                      <div
                        className="inrfs-sms-chart-row"
                        key={
                          item.financerId ||
                          item.financer
                        }
                      >
                        <div className="inrfs-sms-chart-label">
                          <span>
                            {item.financer}
                          </span>

                          <strong>
                            {formatNumber(item.used)}
                          </strong>
                        </div>

                        <div className="inrfs-sms-chart-track">
                          <div
                            className="inrfs-sms-chart-allocated"
                            style={{
                              width: `${allocatedWidth}%`,
                            }}
                          />

                          <div
                            className="inrfs-sms-chart-used"
                            style={{
                              width: `${usedWidth}%`,
                            }}
                          />
                        </div>

                        <div className="inrfs-sms-chart-meta">
                          {Number(item.usage || 0)}%
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="inrfs-sms-chart-axis">
                  <span>0</span>
                  <span>
                    {formatNumber(
                      Math.round(maxUsage / 4)
                    )}
                  </span>
                  <span>
                    {formatNumber(
                      Math.round(maxUsage / 2)
                    )}
                  </span>
                  <span>
                    {formatNumber(
                      Math.round((maxUsage * 3) / 4)
                    )}
                  </span>
                  <span>
                    {formatNumber(maxUsage)}
                  </span>
                </div>

                <div className="inrfs-sms-chart-legend">
                  <div>
                    <span className="inrfs-sms-legend-box inrfs-sms-legend-box--allocated" />
                    Allocated
                  </div>

                  <div>
                    <span className="inrfs-sms-legend-box inrfs-sms-legend-box--used" />
                    Used
                  </div>
                </div>
              </>
            ) : (
              <div className="inrfs-sms-chart-empty">
                No financer usage data available.
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}

        <div className="inrfs-sms-quick-card">
          <div className="inrfs-sms-section-header">
            <div>
              <h2>Quick Stats</h2>
              <p>Platform-level SMS performance</p>
            </div>
          </div>

          <div className="inrfs-sms-quick-stat">
            <div className="inrfs-sms-quick-stat-top">
              <span>Delivery Rate</span>

              <strong>{deliveryRate}%</strong>
            </div>

            <div className="inrfs-sms-progress-track">
              <div
                className="inrfs-sms-progress-fill inrfs-sms-progress-fill--green"
                style={{
                  width: `${Math.min(
                    Number(deliveryRate),
                    100
                  )}%`,
                }}
              />
            </div>

            <small>
              {formatNumber(stats.delivered)} delivered
              out of {formatNumber(stats.sentThisMonth)}
              messages
            </small>
          </div>

          <div className="inrfs-sms-quick-stat">
            <div className="inrfs-sms-quick-stat-top">
              <span>Platform Credits Used</span>

              <strong>
                {formatNumber(platformCreditsUsed)}
              </strong>
            </div>

            <div className="inrfs-sms-progress-track">
              <div
                className="inrfs-sms-progress-fill inrfs-sms-progress-fill--purple"
                style={{
                  width: `${platformCreditsPercentage}%`,
                }}
              />
            </div>

            <small>
              {platformCreditsPercentage.toFixed(1)}% of{' '}
              {formatNumber(platformCreditLimit)} total
              credits
            </small>
          </div>

          <div className="inrfs-sms-quick-stat">
            <div className="inrfs-sms-quick-stat-top">
              <span>Failed Messages</span>

              <strong>
                {formatNumber(stats.failed)}
              </strong>
            </div>

            <div className="inrfs-sms-progress-track">
              <div
                className="inrfs-sms-progress-fill inrfs-sms-progress-fill--red"
                style={{
                  width: `${Math.min(
                    Number(stats.failed || 0) /
                      Math.max(
                        Number(stats.sentThisMonth || 1),
                        1
                      ) *
                      100 *
                      5,
                    100
                  )}%`,
                }}
              />
            </div>

            <small>
              Requires monitoring for delivery issues
            </small>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINANCER USAGE
      ====================================================== */}

      <section className="inrfs-sms-table-card">
        <div className="inrfs-sms-table-header">
          <div>
            <h2>Financer SMS Usage</h2>

            <p>
              Monitor SMS allocation and credit consumption
              by financer.
            </p>
          </div>
        </div>

        <div className="inrfs-sms-table-toolbar">
          <div className="inrfs-sms-search-wrapper">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search financer or status..."
            />
          </div>

          <div className="inrfs-sms-status-filter">
            <label htmlFor="inrfs-sms-status-filter">
              Usage Status
            </label>

            <select
              id="inrfs-sms-status-filter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All Statuses</option>
              <option value="Normal">Normal</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="inrfs-sms-results-bar">
          <span>
            Showing{' '}
            <strong>
              {filteredFinancerUsage.length}
            </strong>{' '}
            financer
            {filteredFinancerUsage.length !== 1
              ? 's'
              : ''}
          </span>

          {(search || statusFilter !== 'All') && (
            <button
              type="button"
              className="inrfs-sms-clear-button"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredFinancerUsage.length > 0 ? (
          <>
            {/* Desktop Table */}

            <div className="inrfs-sms-table-wrapper">
              <table className="inrfs-sms-table">
                <thead>
                  <tr>
                    <th>Financer</th>
                    <th>Allocated</th>
                    <th>Used</th>
                    <th>Remaining</th>
                    <th>Usage</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredFinancerUsage.map((item) => {
                    const usageStatus =
                      getUsageStatus(
                        Number(item.usage || 0)
                      );

                    return (
                      <tr
                        key={
                          item.financerId ||
                          item.financer
                        }
                      >
                        <td>
                          <div className="inrfs-sms-financer-cell">
                            <div className="inrfs-sms-financer-avatar">
                              {String(
                                item.financer || 'F'
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {item.financer}
                              </strong>

                              {item.financerId && (
                                <span>
                                  {item.financerId}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          {formatNumber(item.allocated)}
                        </td>

                        <td>
                          <strong className="inrfs-sms-used-value">
                            {formatNumber(item.used)}
                          </strong>
                        </td>

                        <td>
                          <strong className="inrfs-sms-remaining-value">
                            {formatNumber(item.remaining)}
                          </strong>
                        </td>

                        <td>
                          <div className="inrfs-sms-usage-cell">
                            <div className="inrfs-sms-usage-track">
                              <div
                                className="inrfs-sms-usage-fill"
                                style={{
                                  width: `${Math.min(
                                    Number(item.usage || 0),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>

                            <span>
                              {item.usage}%
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`inrfs-sms-usage-status ${getUsageStatusClass(
                              Number(item.usage || 0)
                            )}`}
                          >
                            {usageStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}

            <div className="inrfs-sms-mobile-list">
              {filteredFinancerUsage.map((item) => {
                const usageStatus =
                  getUsageStatus(
                    Number(item.usage || 0)
                  );

                return (
                  <article
                    className="inrfs-sms-mobile-card"
                    key={`mobile-${
                      item.financerId ||
                      item.financer
                    }`}
                  >
                    <div className="inrfs-sms-mobile-card-header">
                      <div className="inrfs-sms-mobile-financer">
                        <div className="inrfs-sms-financer-avatar">
                          {String(
                            item.financer || 'F'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {item.financer}
                          </strong>

                          {item.financerId && (
                            <span>
                              {item.financerId}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inrfs-sms-usage-status ${getUsageStatusClass(
                          Number(item.usage || 0)
                        )}`}
                      >
                        {usageStatus}
                      </span>
                    </div>

                    <div className="inrfs-sms-mobile-card-body">
                      <div className="inrfs-sms-mobile-row">
                        <span>Allocated</span>
                        <strong>
                          {formatNumber(
                            item.allocated
                          )}
                        </strong>
                      </div>

                      <div className="inrfs-sms-mobile-row">
                        <span>Used</span>
                        <strong className="inrfs-sms-mobile-used">
                          {formatNumber(item.used)}
                        </strong>
                      </div>

                      <div className="inrfs-sms-mobile-row">
                        <span>Remaining</span>
                        <strong>
                          {formatNumber(
                            item.remaining
                          )}
                        </strong>
                      </div>

                      <div className="inrfs-sms-mobile-usage">
                        <div className="inrfs-sms-mobile-usage-header">
                          <span>Usage</span>
                          <strong>
                            {item.usage}%
                          </strong>
                        </div>

                        <div className="inrfs-sms-usage-track">
                          <div
                            className="inrfs-sms-usage-fill"
                            style={{
                              width: `${Math.min(
                                Number(
                                  item.usage || 0
                                ),
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="inrfs-sms-empty-state">
            <div className="inrfs-sms-empty-icon">
              <Search size={24} />
            </div>

            <h3>No financer usage found</h3>

            <p>
              No financer matches the current search or
              usage-status filter.
            </p>

            <button
              type="button"
              className="inrfs-sms-empty-button"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          SMS ACTIVITY
      ====================================================== */}

      <section className="inrfs-sms-activity-card">
        <div className="inrfs-sms-table-header">
          <div>
            <h2>SMS Activity</h2>

            <p>
              Recent SMS delivery and messaging activity.
            </p>
          </div>

          <span className="inrfs-sms-activity-count">
            {filteredActivity.length} records
          </span>
        </div>

        {filteredActivity.length > 0 ? (
          <>
            <div className="inrfs-sms-activity-table-wrapper">
              <table className="inrfs-sms-activity-table">
                <thead>
                  <tr>
                    <th>Activity ID</th>
                    <th>Financer</th>
                    <th>Customer</th>
                    <th>Message Type</th>
                    <th>Date / Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredActivity.map((activity) => (
                    <tr key={activity.activityId}>
                      <td>
                        <strong>
                          {activity.activityId}
                        </strong>
                      </td>

                      <td>{activity.financer}</td>

                      <td>
                        <div className="inrfs-sms-activity-customer">
                          <strong>
                            {activity.customer}
                          </strong>

                          <span>
                            {activity.mobile}
                          </span>
                        </div>
                      </td>

                      <td>
                        {activity.messageType}
                      </td>

                      <td>
                        <div className="inrfs-sms-activity-date">
                          <Clock3 size={14} />
                          {activity.dateTime}
                        </div>
                      </td>

                      <td>
                        <StatusBadge
                          status={activity.status}
                        />
                      </td>

                      <td>
                        <button
                          type="button"
                          className="inrfs-sms-activity-view"
                          onClick={() =>
                            setSelectedActivity(
                              activity
                            )
                          }
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="inrfs-sms-activity-mobile-list">
              {filteredActivity.map((activity) => (
                <article
                  className="inrfs-sms-activity-mobile-card"
                  key={`mobile-${activity.activityId}`}
                >
                  <div className="inrfs-sms-activity-mobile-header">
                    <div>
                      <span>Activity ID</span>

                      <strong>
                        {activity.activityId}
                      </strong>
                    </div>

                    <StatusBadge
                      status={activity.status}
                    />
                  </div>

                  <div className="inrfs-sms-activity-mobile-body">
                    <div>
                      <span>Financer</span>
                      <strong>
                        {activity.financer}
                      </strong>
                    </div>

                    <div>
                      <span>Customer</span>
                      <strong>
                        {activity.customer}
                      </strong>
                    </div>

                    <div>
                      <span>Message</span>
                      <strong>
                        {activity.messageType}
                      </strong>
                    </div>

                    <div>
                      <span>Date / Time</span>
                      <strong>
                        {activity.dateTime}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="inrfs-sms-activity-mobile-view"
                    onClick={() =>
                      setSelectedActivity(activity)
                    }
                  >
                    <Eye size={15} />
                    View Activity
                  </button>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="inrfs-sms-empty-state">
            <div className="inrfs-sms-empty-icon">
              <MessageSquare size={24} />
            </div>

            <h3>No SMS activity found</h3>

            <p>
              No SMS activity matches the current search.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          SMS ACTIVITY DETAILS
      ====================================================== */}

      {selectedActivity && (
        <div
          className="inrfs-sms-modal-backdrop"
          onMouseDown={() =>
            setSelectedActivity(null)
          }
        >
          <div
            className="inrfs-sms-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inrfs-sms-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="inrfs-sms-modal-header">
              <div className="inrfs-sms-modal-title-area">
                <div className="inrfs-sms-modal-icon">
                  <MessageSquare size={19} />
                </div>

                <div>
                  <h2 id="inrfs-sms-modal-title">
                    SMS Activity
                  </h2>

                  <span>
                    {selectedActivity.activityId}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="inrfs-sms-modal-close"
                onClick={() =>
                  setSelectedActivity(null)
                }
                aria-label="Close SMS activity"
              >
                <X size={19} />
              </button>
            </div>

            <div className="inrfs-sms-modal-status">
              <StatusBadge
                status={selectedActivity.status}
              />
            </div>

            <div className="inrfs-sms-modal-section">
              <h3>Activity Information</h3>

              <div className="inrfs-sms-modal-detail-grid">
                <div>
                  <span>Financer</span>
                  <strong>
                    {selectedActivity.financer}
                  </strong>
                </div>

                <div>
                  <span>Customer</span>
                  <strong>
                    {selectedActivity.customer}
                  </strong>
                </div>

                <div>
                  <span>Mobile Number</span>
                  <strong>
                    {selectedActivity.mobile}
                  </strong>
                </div>

                <div>
                  <span>Message Type</span>
                  <strong>
                    {selectedActivity.messageType}
                  </strong>
                </div>

                <div>
                  <span>Date / Time</span>
                  <strong>
                    {selectedActivity.dateTime}
                  </strong>
                </div>

                <div>
                  <span>Reference</span>
                  <strong>
                    {selectedActivity.reference || '—'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="inrfs-sms-modal-section">
              <h3>Message</h3>

              <div className="inrfs-sms-message-preview">
                {selectedActivity.message ||
                  'Message content is not available in mock data.'}
              </div>
            </div>

            <div className="inrfs-sms-modal-footer">
              <button
                type="button"
                className="inrfs-sms-modal-done"
                onClick={() =>
                  setSelectedActivity(null)
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}