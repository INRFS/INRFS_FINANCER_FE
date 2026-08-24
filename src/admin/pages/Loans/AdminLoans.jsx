import React, { useEffect, useMemo, useState } from 'react';
import {
  Banknote,
  Building2,
  CalendarDays,
  CreditCard,
  Eye,
  Search,
  X,
} from 'lucide-react';

import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatCurrency, formatCustomerNumber, formatLoanNumber } from '../../../common/utils/formatters';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import { loanFromApi } from '../../../common/utils/domainAdapters';

import './AdminLoans.css';

export default function AdminLoans() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [financerFilter, setFinancerFilter] = useState('All');
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [loans, setLoans] = useState([]);
  const [applications, setApplications] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerNames, setCustomerNames] = useState({});
  const [busyApplicationId, setBusyApplicationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    let current = true;
    Promise.all([platformApi.loans.all(), platformApi.customers.all(), platformApi.admin.allFinancers(), platformApi.loans.applications({ pageSize: 100 }), platformApi.loans.products(true)])
      .then(([loanPayload, customerPayload, financerPayload, applicationPayload, productPayload]) => {
        if (!current) return;
        const customers = new Map(pageItems(customerPayload).map((item) => [item.id, item]));
        const financers = new Map(pageItems(financerPayload).map((item) => [item.id, item]));
        setCustomerNames(Object.fromEntries(customers.entries().map(([id, customer]) => [id, customer.fullName])));
        setApplications(pageItems(applicationPayload));
        setProducts(pageItems(productPayload));
        setLoans(pageItems(loanPayload).map((item) => ({ ...loanFromApi(item, customers.get(item.customerId)), financerName: financers.get(item.financerId)?.displayName || item.financerId })));
      })
      .catch((error) => current && setPageError(error.message))
      .finally(() => current && setLoading(false));
    return () => { current = false; };
  }, []);

  const getLoanCustomer = (loan) => {
    return loan.customerName || loan.customer || 'Unknown Customer';
  };

  const getLoanFinancer = (loan) => {
    return (
      loan.financerName ||
      loan.financer ||
      'Unknown Financer'
    );
  };

  const getLoanPrincipal = (loan) => {
    return Number(
      loan.loanAmount ??
        loan.amount ??
        loan.principal ??
        0
    );
  };

  const getLoanInterest = (loan) => {
    return (
      loan.interestRate ??
      loan.interest ??
      loan.interestPercentage ??
      '—'
    );
  };

  const getLoanOutstanding = (loan) => {
    return Number(loan.outstanding || 0);
  };

  const getLoanStartDate = (loan) => {
    return (
      loan.startDate ||
      loan.disbursementDate ||
      loan.loanDate ||
      '—'
    );
  };

  const getLoanDueDate = (loan) => {
    return (
      loan.dueDate ||
      loan.endDate ||
      loan.maturityDate ||
      '—'
    );
  };

  const financerNames = useMemo(() => {
    const names = loans
      .map((loan) => getLoanFinancer(loan))
      .filter(Boolean);

    return ['All', ...new Set(names)];
  }, [loans]);

  const loanStatuses = useMemo(() => {
    const statuses = loans
      .map((loan) => loan.status)
      .filter(Boolean);

    return ['All', ...new Set(statuses)];
  }, [loans]);

  const filteredLoans = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return loans.filter((loan) => {
      const searchableText = [
        loan.id,
        loan.loanId,
        getLoanCustomer(loan),
        getLoanFinancer(loan),
        loan.customerId,
        loan.financerId,
        loan.mobile,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'All' ||
        String(loan.status || '').toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesFinancer =
        financerFilter === 'All' ||
        getLoanFinancer(loan) === financerFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFinancer
      );
    });
  }, [
    loans,
    search,
    statusFilter,
    financerFilter,
  ]);

  const summary = useMemo(() => {
    const principal = filteredLoans.reduce(
      (total, loan) =>
        total + getLoanPrincipal(loan),
      0
    );

    const outstanding = filteredLoans.reduce(
      (total, loan) =>
        total + getLoanOutstanding(loan),
      0
    );

    const activeLoans = filteredLoans.filter(
      (loan) =>
        String(loan.status || '').toLowerCase() ===
        'active'
    ).length;

    const overdueLoans = filteredLoans.filter(
      (loan) =>
        String(loan.status || '').toLowerCase() ===
        'overdue'
    ).length;

    return {
      principal,
      outstanding,
      activeLoans,
      overdueLoans,
    };
  }, [filteredLoans]);

  const getLoanStatus = (loan) => {
    return loan.status || 'Unknown';
  };

  const getStatusClass = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'active':
        return 'inrfs-loans-status-active';

      case 'completed':
      case 'closed':
      case 'paid':
        return 'inrfs-loans-status-completed';

      case 'overdue':
      case 'defaulted':
        return 'inrfs-loans-status-overdue';

      case 'pending':
        return 'inrfs-loans-status-pending';

      default:
        return '';
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setFinancerFilter('All');
  };

  const handleViewLoan = (loan) => {
    setSelectedLoan(loan);
  };

  const handleCloseLoanDetails = () => {
    setSelectedLoan(null);
  };

  const transitionApplication = async (application, action) => {
    setBusyApplicationId(application.id);
    setPageError('');
    try {
      const product = products.find((item) => item.id === application.loanProductId);
      const data = action === 'approve'
        ? { approvedPrincipal: application.requestedPrincipal, approvedAnnualRate: product?.annualInterestRate || 0, approvedTenureMonths: application.requestedTenureMonths, notes: 'Approved through admin portal' }
        : action === 'disburse'
          ? { amount: application.approvedPrincipal, disbursementDate: new Date().toISOString().slice(0, 10), mode: 'BankTransfer', bankReference: `INRFS-${Date.now()}` }
          : {};
      const updated = await platformApi.loans.transition(application.id, action, data);
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      setPageError(error.message);
    } finally {
      setBusyApplicationId('');
    }
  };

  return (
    <div className="inrfs-loans-page">
      {pageError && <p role="alert">{pageError}</p>}
      {loading && <p aria-live="polite">Loading loans...</p>}
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="inrfs-loans-header">
        <div className="inrfs-loans-header-content">
          <div>
            <h1 className="inrfs-loans-title">
              Loans Overview
            </h1>

            <p className="inrfs-loans-subtitle">
              Monitor platform-wide loan books, outstanding
              exposure, financer relationships and loan status.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="inrfs-loans-summary-grid">
        <div className="inrfs-loans-summary-card">
          <div className="inrfs-loans-summary-icon inrfs-loans-summary-icon--blue">
            <Banknote size={20} />
          </div>

          <div className="inrfs-loans-summary-content">
            <span>Total Principal</span>

            <strong>
              {formatCurrency(summary.principal)}
            </strong>

            <small>
              Principal for filtered loans
            </small>
          </div>
        </div>

        <div className="inrfs-loans-summary-card">
          <div className="inrfs-loans-summary-icon inrfs-loans-summary-icon--orange">
            <CreditCard size={20} />
          </div>

          <div className="inrfs-loans-summary-content">
            <span>Outstanding</span>

            <strong>
              {formatCurrency(summary.outstanding)}
            </strong>

            <small>
              Current outstanding exposure
            </small>
          </div>
        </div>

        <div className="inrfs-loans-summary-card">
          <div className="inrfs-loans-summary-icon inrfs-loans-summary-icon--green">
            <Banknote size={20} />
          </div>

          <div className="inrfs-loans-summary-content">
            <span>Active Loans</span>

            <strong>
              {summary.activeLoans.toLocaleString()}
            </strong>

            <small>
              Currently active loan accounts
            </small>
          </div>
        </div>

        <div className="inrfs-loans-summary-card">
          <div className="inrfs-loans-summary-icon inrfs-loans-summary-icon--red">
            <CreditCard size={20} />
          </div>

          <div className="inrfs-loans-summary-content">
            <span>Overdue Loans</span>

            <strong>
              {summary.overdueLoans.toLocaleString()}
            </strong>

            <small>
              Loans requiring attention
            </small>
          </div>
        </div>
      </section>

      <section className="inrfs-loans-content-card" aria-labelledby="admin-loan-applications-heading">
        <div className="inrfs-loans-results-bar"><h2 id="admin-loan-applications-heading">Loan Applications</h2><span>{applications.length} application{applications.length === 1 ? '' : 's'}</span></div>
        <div className="inrfs-loans-table-wrapper">
          <table className="inrfs-loans-table">
            <thead><tr><th>Application</th><th>Customer</th><th>Principal</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {applications.length === 0 ? <tr><td colSpan="5">No loan applications found.</td></tr> : applications.map((application) => (
                <tr key={application.id}>
                  <td>{application.applicationNumber || application.id}</td>
                  <td>{customerNames[application.customerId] || application.customerId}</td>
                  <td>{formatCurrency(application.requestedPrincipal)}</td>
                  <td><StatusBadge status={application.status} /></td>
                  <td>
                    {application.status === 'Submitted' && <button type="button" disabled={busyApplicationId === application.id} onClick={() => transitionApplication(application, 'verify')}>Verify</button>}
                    {application.status === 'Verified' && <button type="button" disabled={busyApplicationId === application.id} onClick={() => transitionApplication(application, 'approve')}>Approve</button>}
                    {application.status === 'Approved' && <button type="button" disabled={busyApplicationId === application.id} onClick={() => transitionApplication(application, 'disburse')}>Disburse</button>}
                    {!['Submitted', 'Verified', 'Approved'].includes(application.status) && <span>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <section className="inrfs-loans-content-card">
        {/* Toolbar */}

        <div className="inrfs-loans-toolbar">
          <div className="inrfs-loans-search-wrapper">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search loan ID, customer or financer..."
            />
          </div>

          <div className="inrfs-loans-filter-group">
            <div className="inrfs-loans-filter-control">
              <label htmlFor="inrfs-loans-status-filter">
                Status
              </label>

              <select
                id="inrfs-loans-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                {loanStatuses.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status === 'All'
                      ? 'All Statuses'
                      : status}
                  </option>
                ))}
              </select>
            </div>

            <div className="inrfs-loans-filter-control">
              <label htmlFor="inrfs-loans-financer-filter">
                Financer
              </label>

              <select
                id="inrfs-loans-financer-filter"
                value={financerFilter}
                onChange={(event) =>
                  setFinancerFilter(event.target.value)
                }
              >
                {financerNames.map((financer) => (
                  <option
                    key={financer}
                    value={financer}
                  >
                    {financer === 'All'
                      ? 'All Financers'
                      : financer}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}

        <div className="inrfs-loans-results-bar">
          <span>
            Showing{' '}
            <strong>
              {filteredLoans.length}
            </strong>{' '}
            loan
            {filteredLoans.length !== 1 ? 's' : ''}
          </span>

          {(search ||
            statusFilter !== 'All' ||
            financerFilter !== 'All') && (
            <button
              type="button"
              className="inrfs-loans-clear-filters"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredLoans.length > 0 ? (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="inrfs-loans-table-wrapper">
              <table className="inrfs-loans-table">
                <thead>
                  <tr>
                    <th>Loan ID</th>
                    <th>Customer</th>
                    <th>Financer</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Outstanding</th>
                    <th>Start Date</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id || loan.loanId}>
                      <td>
                        <strong className="inrfs-loans-id">
                          {formatLoanNumber(loan)}
                        </strong>
                      </td>

                      <td>
                        <div className="inrfs-loans-customer-cell">
                          <div className="inrfs-loans-avatar">
                            {String(
                              getLoanCustomer(loan)
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {getLoanCustomer(loan)}
                            </strong>

                            {loan.customerId && (
                              <span>
                                {formatCustomerNumber(loan)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="inrfs-loans-financer-cell">
                          <Building2 size={15} />

                          <span>
                            {getLoanFinancer(loan)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong className="inrfs-loans-principal">
                          {formatCurrency(
                            getLoanPrincipal(loan)
                          )}
                        </strong>
                      </td>

                      <td>
                        <span className="inrfs-loans-interest">
                          {getLoanInterest(loan)}
                        </span>
                      </td>

                      <td>
                        <strong className="inrfs-loans-outstanding">
                          {formatCurrency(
                            getLoanOutstanding(loan)
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="inrfs-loans-date-cell">
                          <CalendarDays size={14} />
                          <span>
                            {getLoanStartDate(loan)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="inrfs-loans-date-cell">
                          <CalendarDays size={14} />
                          <span>
                            {getLoanDueDate(loan)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`inrfs-loans-status-wrapper ${getStatusClass(
                            loan.status
                          )}`}
                        >
                          <StatusBadge
                            status={getLoanStatus(loan)}
                          />
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="inrfs-loans-view-button"
                          onClick={() =>
                            handleViewLoan(loan)
                          }
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE CARDS
            ================================================= */}

            <div className="inrfs-loans-mobile-list">
              {filteredLoans.map((loan) => (
                <article
                  className="inrfs-loans-mobile-card"
                  key={`mobile-${loan.id || loan.loanId}`}
                >
                  <div className="inrfs-loans-mobile-card-header">
                    <div className="inrfs-loans-mobile-loan">
                      <div className="inrfs-loans-avatar">
                        {String(
                          getLoanCustomer(loan)
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {formatLoanNumber(loan)}
                        </strong>

                        <span>
                          {getLoanCustomer(loan)}
                        </span>
                      </div>
                    </div>

                    <StatusBadge
                      status={getLoanStatus(loan)}
                    />
                  </div>

                  <div className="inrfs-loans-mobile-card-body">
                    <div className="inrfs-loans-mobile-row">
                      <span>Financer</span>

                      <strong>
                        {getLoanFinancer(loan)}
                      </strong>
                    </div>

                    <div className="inrfs-loans-mobile-row">
                      <span>Principal</span>

                      <strong>
                        {formatCurrency(
                          getLoanPrincipal(loan)
                        )}
                      </strong>
                    </div>

                    <div className="inrfs-loans-mobile-row">
                      <span>Interest</span>

                      <strong>
                        {getLoanInterest(loan)}
                      </strong>
                    </div>

                    <div className="inrfs-loans-mobile-row">
                      <span>Outstanding</span>

                      <strong className="inrfs-loans-mobile-outstanding">
                        {formatCurrency(
                          getLoanOutstanding(loan)
                        )}
                      </strong>
                    </div>

                    <div className="inrfs-loans-mobile-row">
                      <span>Start Date</span>

                      <strong>
                        {getLoanStartDate(loan)}
                      </strong>
                    </div>

                    <div className="inrfs-loans-mobile-row">
                      <span>Due Date</span>

                      <strong>
                        {getLoanDueDate(loan)}
                      </strong>
                    </div>
                  </div>

                  <div className="inrfs-loans-mobile-card-footer">
                    <button
                      type="button"
                      className="inrfs-loans-mobile-view-button"
                      onClick={() =>
                        handleViewLoan(loan)
                      }
                    >
                      <Eye size={16} />
                      View Loan Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          /* ===================================================
             EMPTY STATE
          =================================================== */

          <div className="inrfs-loans-empty-state">
            <div className="inrfs-loans-empty-icon">
              <Search size={24} />
            </div>

            <h3>No loans found</h3>

            <p>
              No loan records match your current search or
              filter selection.
            </p>

            <button
              type="button"
              className="inrfs-loans-empty-button"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          LOAN DETAILS MODAL
      ===================================================== */}

      {selectedLoan && (
        <div
          className="inrfs-loans-modal-backdrop"
          onMouseDown={handleCloseLoanDetails}
        >
          <div
            className="inrfs-loans-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inrfs-loans-modal-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}

            <div className="inrfs-loans-modal-header">
              <div className="inrfs-loans-modal-loan">
                <div className="inrfs-loans-modal-avatar">
                  <Banknote size={20} />
                </div>

                <div>
                  <h2 id="inrfs-loans-modal-title">
                    {formatLoanNumber(selectedLoan)}
                  </h2>

                  <span>
                    {getLoanCustomer(selectedLoan)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="inrfs-loans-modal-close"
                onClick={handleCloseLoanDetails}
                aria-label="Close loan details"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status */}

            <div className="inrfs-loans-modal-status">
              <StatusBadge
                status={getLoanStatus(selectedLoan)}
              />
            </div>

            {/* Loan Details */}

            <div className="inrfs-loans-modal-section">
              <h3>Loan Information</h3>

              <div className="inrfs-loans-detail-grid">
                <div className="inrfs-loans-detail-item">
                  <span>Loan ID</span>

                  <strong>
                    {formatLoanNumber(selectedLoan)}
                  </strong>
                </div>

                <div className="inrfs-loans-detail-item">
                  <span>Customer</span>

                  <strong>
                    {getLoanCustomer(selectedLoan)}
                  </strong>
                </div>

                <div className="inrfs-loans-detail-item">
                  <span>Customer ID</span>

                  <strong>
                    {formatCustomerNumber(selectedLoan)}
                  </strong>
                </div>

                <div className="inrfs-loans-detail-item">
                  <span>Financer</span>

                  <strong>
                    {getLoanFinancer(selectedLoan)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Financial Information */}

            <div className="inrfs-loans-modal-section">
              <h3>Financial Information</h3>

              <div className="inrfs-loans-financial-grid">
                <div className="inrfs-loans-financial-card">
                  <span>Principal</span>

                  <strong>
                    {formatCurrency(
                      getLoanPrincipal(selectedLoan)
                    )}
                  </strong>
                </div>

                <div className="inrfs-loans-financial-card">
                  <span>Interest</span>

                  <strong>
                    {getLoanInterest(selectedLoan)}
                  </strong>
                </div>

                <div className="inrfs-loans-financial-card">
                  <span>Outstanding</span>

                  <strong className="inrfs-loans-modal-outstanding">
                    {formatCurrency(
                      getLoanOutstanding(selectedLoan)
                    )}
                  </strong>
                </div>
              </div>
            </div>

            {/* Dates */}

            <div className="inrfs-loans-modal-section">
              <h3>Loan Timeline</h3>

              <div className="inrfs-loans-timeline-grid">
                <div className="inrfs-loans-timeline-item">
                  <div className="inrfs-loans-timeline-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <span>Start / Disbursement Date</span>

                    <strong>
                      {getLoanStartDate(selectedLoan)}
                    </strong>
                  </div>
                </div>

                <div className="inrfs-loans-timeline-item">
                  <div className="inrfs-loans-timeline-icon">
                    <CalendarDays size={17} />
                  </div>

                  <div>
                    <span>Due / Maturity Date</span>

                    <strong>
                      {getLoanDueDate(selectedLoan)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}

            <div className="inrfs-loans-modal-section">
              <h3>Additional Information</h3>

              <div className="inrfs-loans-additional-grid">
                {selectedLoan.mobile && (
                  <div className="inrfs-loans-detail-item">
                    <span>Customer Mobile</span>

                    <strong>
                      {selectedLoan.mobile}
                    </strong>
                  </div>
                )}

                {selectedLoan.city && (
                  <div className="inrfs-loans-detail-item">
                    <span>Customer City</span>

                    <strong>
                      {selectedLoan.city}
                    </strong>
                  </div>
                )}

                {selectedLoan.tenure && (
                  <div className="inrfs-loans-detail-item">
                    <span>Tenure</span>

                    <strong>
                      {selectedLoan.tenure}
                    </strong>
                  </div>
                )}

                {selectedLoan.installment && (
                  <div className="inrfs-loans-detail-item">
                    <span>Installment</span>

                    <strong>
                      {formatCurrency(
                        selectedLoan.installment
                      )}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}

            <div className="inrfs-loans-modal-footer">
              <div className="inrfs-loans-modal-footer-info">
                <CreditCard size={15} />

                <span>
                  Loan information from Admin registry
                </span>
              </div>

              <button
                type="button"
                className="inrfs-loans-modal-close-button"
                onClick={handleCloseLoanDetails}
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
