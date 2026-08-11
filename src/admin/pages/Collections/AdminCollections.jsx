import React, { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  IndianRupee,
  Search,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import { formatCurrency } from '../../../common/utils/formatters';
import { collectionsData } from '../../data/mockAdminData';

import './AdminCollections.css';

const AdminCollections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedCollection, setSelectedCollection] = useState(null);

  const collectionRecords = Array.isArray(collectionsData)
    ? collectionsData
    : [];

  const summary = useMemo(() => {
    const totalCollected = collectionRecords.reduce(
      (total, item) => total + Number(item.amountCollected || 0),
      0
    );

    const outstanding = collectionRecords.reduce(
      (total, item) => total + Number(item.outstandingAmount || 0),
      0
    );

    const pending = collectionRecords.filter(
      (item) =>
        String(item.settlementStatus || '').toLowerCase() === 'pending'
    ).length;

    const overdue = collectionRecords.filter(
      (item) => String(item.collectionStatus || '').toLowerCase() === 'overdue'
    ).length;

    return {
      totalCollected,
      outstanding,
      pending,
      overdue,
    };
  }, [collectionRecords]);

  const filteredCollections = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return collectionRecords.filter((collection) => {
      const searchableValues = [
        collection.collectionId,
        collection.customerName,
        collection.customerId,
        collection.financerName,
        collection.financerId,
        collection.loanId,
        collection.referenceNumber,
        collection.paymentReference,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableValues.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'All' ||
        collection.collectionStatus === statusFilter ||
        collection.settlementStatus === statusFilter;

      const matchesDate =
        dateFilter === 'All' ||
        collection.dateFilter === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [collectionRecords, searchTerm, statusFilter, dateFilter]);

  const getStatusVariant = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'collected':
      case 'settled':
      case 'completed':
        return 'success';

      case 'pending':
        return 'warning';

      case 'overdue':
      case 'failed':
        return 'danger';

      default:
        return 'default';
    }
  };

  const handleViewDetails = (collection) => {
    setSelectedCollection(collection);
  };

  const handleCloseModal = () => {
    setSelectedCollection(null);
  };

  const handleExport = () => {
    const headers = [
      'Collection ID',
      'Customer',
      'Financer',
      'Loan',
      'Collection Date',
      'Amount Collected',
      'Outstanding Amount',
      'Payment Reference',
      'Collection Status',
      'Settlement Status',
    ];

    const rows = filteredCollections.map((item) => [
      item.collectionId || '',
      item.customerName || '',
      item.financerName || '',
      item.loanId || '',
      item.collectionDate || '',
      item.amountCollected || 0,
      item.outstandingAmount || 0,
      item.paymentReference || item.referenceNumber || '',
      item.collectionStatus || '',
      item.settlementStatus || '',
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'inrfs-collections.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="inrfs-collections-page">
      <div className="inrfs-collections-header">
        <div className="inrfs-collections-header-content">
          <div>
            <h1 className="inrfs-collections-title">Collections</h1>
            <p className="inrfs-collections-subtitle">
              Monitor collection activity, outstanding amounts and settlement
              status across financers.
            </p>
          </div>

          <div className="inrfs-collections-header-actions">
            <Button
              variant="secondary"
              onClick={handleExport}
            >
              <ArrowDownToLine size={17} />
              Export
            </Button>
          </div>
        </div>
      </div>

      <section className="inrfs-collections-summary-grid">
        <div className="inrfs-collections-summary-card">
          <div className="inrfs-collections-summary-icon inrfs-collections-summary-icon--success">
            <IndianRupee size={20} />
          </div>

          <div className="inrfs-collections-summary-content">
            <span>Total Collected</span>
            <strong>{formatCurrency(summary.totalCollected)}</strong>
            <small>Across all collection records</small>
          </div>
        </div>

        <div className="inrfs-collections-summary-card">
          <div className="inrfs-collections-summary-icon inrfs-collections-summary-icon--warning">
            <Clock3 size={20} />
          </div>

          <div className="inrfs-collections-summary-content">
            <span>Outstanding Amount</span>
            <strong>{formatCurrency(summary.outstanding)}</strong>
            <small>Amount yet to be collected</small>
          </div>
        </div>

        <div className="inrfs-collections-summary-card">
          <div className="inrfs-collections-summary-icon inrfs-collections-summary-icon--pending">
            <AlertCircle size={20} />
          </div>

          <div className="inrfs-collections-summary-content">
            <span>Pending Collections</span>
            <strong>{summary.pending}</strong>
            <small>Awaiting settlement</small>
          </div>
        </div>

        <div className="inrfs-collections-summary-card">
          <div className="inrfs-collections-summary-icon inrfs-collections-summary-icon--danger">
            <XCircle size={20} />
          </div>

          <div className="inrfs-collections-summary-content">
            <span>Overdue Collections</span>
            <strong>{summary.overdue}</strong>
            <small>Collections requiring attention</small>
          </div>
        </div>
      </section>

      <section className="inrfs-collections-content-card">
        <div className="inrfs-collections-toolbar">
          <div className="inrfs-collections-search-wrapper">
            <SearchInput
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search customer, financer, loan or reference..."
            />
          </div>

          <div className="inrfs-collections-filter-group">
            <div className="inrfs-collections-filter-control">
              <label htmlFor="collections-status-filter">
                Status
              </label>

              <select
                id="collections-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Collected">Collected</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                <option value="Settled">Settled</option>
              </select>
            </div>

            <div className="inrfs-collections-filter-control">
              <label htmlFor="collections-date-filter">
                Date
              </label>

              <select
                id="collections-date-filter"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                <option value="All">All Dates</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        <div className="inrfs-collections-results-bar">
          <div>
            <strong>{filteredCollections.length}</strong>{' '}
            collection record
            {filteredCollections.length !== 1 ? 's' : ''}
          </div>

          {(searchTerm || statusFilter !== 'All' || dateFilter !== 'All') && (
            <button
              type="button"
              className="inrfs-collections-clear-filters"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setDateFilter('All');
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredCollections.length > 0 ? (
          <>
            <div className="inrfs-collections-table-wrapper">
              <table className="inrfs-collections-table">
                <thead>
                  <tr>
                    <th>Collection</th>
                    <th>Customer</th>
                    <th>Financer</th>
                    <th>Loan / Reference</th>
                    <th>Collection Date</th>
                    <th>Amount Collected</th>
                    <th>Outstanding</th>
                    <th>Settlement</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCollections.map((collection) => (
                    <tr key={collection.collectionId}>
                      <td>
                        <div className="inrfs-collections-primary-cell">
                          <strong>
                            {collection.collectionId}
                          </strong>
                          <span>
                            {collection.paymentMethod || 'Payment'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="inrfs-collections-primary-cell">
                          <strong>{collection.customerName}</strong>
                          <span>{collection.customerId}</span>
                        </div>
                      </td>

                      <td>
                        <div className="inrfs-collections-primary-cell">
                          <strong>{collection.financerName}</strong>
                          <span>{collection.financerId}</span>
                        </div>
                      </td>

                      <td>
                        <div className="inrfs-collections-primary-cell">
                          <strong>{collection.loanId}</strong>
                          <span>
                            {collection.paymentReference ||
                              collection.referenceNumber}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="inrfs-collections-date-cell">
                          <CalendarDays size={15} />
                          <span>{collection.collectionDate}</span>
                        </div>
                      </td>

                      <td>
                        <strong className="inrfs-collections-amount">
                          {formatCurrency(collection.amountCollected)}
                        </strong>
                      </td>

                      <td>
                        <span className="inrfs-collections-outstanding">
                          {formatCurrency(collection.outstandingAmount)}
                        </span>
                      </td>

                      <td>
                        <div className="inrfs-collections-status-stack">
                          <StatusBadge
                            status={collection.collectionStatus}
                            variant={getStatusVariant(
                              collection.collectionStatus
                            )}
                          />

                          <StatusBadge
                            status={collection.settlementStatus}
                            variant={getStatusVariant(
                              collection.settlementStatus
                            )}
                          />
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="inrfs-collections-view-button"
                          onClick={() => handleViewDetails(collection)}
                          aria-label={`View ${collection.collectionId}`}
                        >
                          <Eye size={17} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="inrfs-collections-mobile-list">
              {filteredCollections.map((collection) => (
                <article
                  className="inrfs-collections-mobile-card"
                  key={`mobile-${collection.collectionId}`}
                >
                  <div className="inrfs-collections-mobile-card-header">
                    <div>
                      <span className="inrfs-collections-mobile-label">
                        Collection
                      </span>

                      <strong>
                        {collection.collectionId}
                      </strong>
                    </div>

                    <StatusBadge
                      status={collection.collectionStatus}
                      variant={getStatusVariant(
                        collection.collectionStatus
                      )}
                    />
                  </div>

                  <div className="inrfs-collections-mobile-card-body">
                    <div className="inrfs-collections-mobile-row">
                      <span>Customer</span>
                      <strong>{collection.customerName}</strong>
                    </div>

                    <div className="inrfs-collections-mobile-row">
                      <span>Financer</span>
                      <strong>{collection.financerName}</strong>
                    </div>

                    <div className="inrfs-collections-mobile-row">
                      <span>Loan</span>
                      <strong>{collection.loanId}</strong>
                    </div>

                    <div className="inrfs-collections-mobile-row">
                      <span>Collection Date</span>
                      <strong>{collection.collectionDate}</strong>
                    </div>

                    <div className="inrfs-collections-mobile-row">
                      <span>Amount Collected</span>
                      <strong className="inrfs-collections-mobile-amount">
                        {formatCurrency(collection.amountCollected)}
                      </strong>
                    </div>

                    <div className="inrfs-collections-mobile-row">
                      <span>Outstanding</span>
                      <strong>
                        {formatCurrency(collection.outstandingAmount)}
                      </strong>
                    </div>

                    <div className="inrfs-collections-mobile-row">
                      <span>Settlement</span>
                      <StatusBadge
                        status={collection.settlementStatus}
                        variant={getStatusVariant(
                          collection.settlementStatus
                        )}
                      />
                    </div>

                    <div className="inrfs-collections-mobile-row">
                      <span>Payment Reference</span>
                      <strong>
                        {collection.paymentReference ||
                          collection.referenceNumber ||
                          '—'}
                      </strong>
                    </div>
                  </div>

                  <div className="inrfs-collections-mobile-card-footer">
                    <button
                      type="button"
                      className="inrfs-collections-mobile-view-button"
                      onClick={() => handleViewDetails(collection)}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="inrfs-collections-empty-state">
            <div className="inrfs-collections-empty-icon">
              <Search size={24} />
            </div>

            <h3>No collections found</h3>

            <p>
              No collection records match the selected search or filters.
            </p>

            <button
              type="button"
              className="inrfs-collections-empty-action"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setDateFilter('All');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {selectedCollection && (
        <Modal
          isOpen={Boolean(selectedCollection)}
          onClose={handleCloseModal}
          title="Collection Details"
        >
          <div className="inrfs-collections-modal-content">
            <div className="inrfs-collections-modal-heading">
              <div>
                <span>Collection ID</span>
                <h3>{selectedCollection.collectionId}</h3>
              </div>

              <StatusBadge
                status={selectedCollection.collectionStatus}
                variant={getStatusVariant(
                  selectedCollection.collectionStatus
                )}
              />
            </div>

            <div className="inrfs-collections-detail-grid">
              <div className="inrfs-collections-detail-item">
                <span>Customer</span>
                <strong>{selectedCollection.customerName}</strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Customer ID</span>
                <strong>{selectedCollection.customerId}</strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Financer</span>
                <strong>{selectedCollection.financerName}</strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Financer ID</span>
                <strong>{selectedCollection.financerId}</strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Loan ID</span>
                <strong>{selectedCollection.loanId}</strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Collection Date</span>
                <strong>{selectedCollection.collectionDate}</strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Amount Collected</span>
                <strong className="inrfs-collections-detail-highlight">
                  {formatCurrency(selectedCollection.amountCollected)}
                </strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Outstanding Amount</span>
                <strong>
                  {formatCurrency(selectedCollection.outstandingAmount)}
                </strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Payment Method</span>
                <strong>
                  {selectedCollection.paymentMethod || '—'}
                </strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Payment Reference</span>
                <strong>
                  {selectedCollection.paymentReference ||
                    selectedCollection.referenceNumber ||
                    '—'}
                </strong>
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Settlement Status</span>
                <StatusBadge
                  status={selectedCollection.settlementStatus}
                  variant={getStatusVariant(
                    selectedCollection.settlementStatus
                  )}
                />
              </div>

              <div className="inrfs-collections-detail-item">
                <span>Settlement Date</span>
                <strong>
                  {selectedCollection.settlementDate || '—'}
                </strong>
              </div>
            </div>

            {selectedCollection.notes && (
              <div className="inrfs-collections-detail-notes">
                <span>Notes</span>
                <p>{selectedCollection.notes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminCollections;