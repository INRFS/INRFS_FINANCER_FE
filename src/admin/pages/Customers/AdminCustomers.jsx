import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  CreditCard,
  Eye,
  MapPin,
  Phone,
  Search,
  UserRound,
  X,
} from 'lucide-react';

import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import { formatCurrency } from '../../../common/utils/formatters';
import { mockCustomers } from '../../../financer/data/mockFinancerData';

import './AdminCustomers.css';

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [financerFilter, setFinancerFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  /*
   * The existing mockCustomers dataset currently comes from
   * mockFinancerData.js.
   *
   * Later, this can be moved to:
   * src/admin/data/mockAdminData.js
   * without changing the UI structure.
   */

  const customers = Array.isArray(mockCustomers) ? mockCustomers : [];

  const financerNames = useMemo(() => {
    const names = customers
      .map(
        (customer) =>
          customer.financerName ||
          customer.financer ||
          'Patel Finance Services'
      )
      .filter(Boolean);

    return ['All', ...new Set(names)];
  }, [customers]);

  const customerStatuses = useMemo(() => {
    const statuses = customers
      .map((customer) => customer.status)
      .filter(Boolean);

    return ['All', ...new Set(statuses)];
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const financerName =
        customer.financerName ||
        customer.financer ||
        'Patel Finance Services';

      const searchableText = [
        customer.id,
        customer.name,
        customer.mobile,
        customer.city,
        financerName,
        customer.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === 'All' ||
        String(customer.status || '').toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesFinancer =
        financerFilter === 'All' ||
        financerName === financerFilter;

      return matchesSearch && matchesStatus && matchesFinancer;
    });
  }, [customers, search, statusFilter, financerFilter]);

  const totalOutstanding = useMemo(() => {
    return filteredCustomers.reduce(
      (total, customer) => total + Number(customer.outstanding || 0),
      0
    );
  }, [filteredCustomers]);

  const totalActiveLoans = useMemo(() => {
    return filteredCustomers.reduce(
      (total, customer) => total + Number(customer.activeLoans || 0),
      0
    );
  }, [filteredCustomers]);

  const activeCustomers = useMemo(() => {
    return customers.filter(
      (customer) =>
        String(customer.status || '').toLowerCase() === 'active'
    ).length;
  }, [customers]);

  const getCustomerFinancer = (customer) => {
    return (
      customer.financerName ||
      customer.financer ||
      'Patel Finance Services'
    );
  };

  const getLoanStatus = (customer) => {
    if (Number(customer.activeLoans || 0) > 0) {
      return 'Active';
    }

    return 'No Active Loans';
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setFinancerFilter('All');
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseCustomerDetails = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="inrfs-customers-page">
      {/* Page Header */}
      <div className="inrfs-customers-header">
        <div className="inrfs-customers-header-content">
          <div>
            <h1 className="inrfs-customers-title">
              Customer Overview
            </h1>

            <p className="inrfs-customers-subtitle">
              Central registry of customers and their borrowing
              relationships across registered financer institutions.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="inrfs-customers-summary-grid">
        <div className="inrfs-customers-summary-card">
          <div className="inrfs-customers-summary-icon inrfs-customers-summary-icon--blue">
            <UserRound size={20} />
          </div>

          <div className="inrfs-customers-summary-content">
            <span>Total Customers</span>
            <strong>{customers.length.toLocaleString()}</strong>
            <small>Registered borrowing accounts</small>
          </div>
        </div>

        <div className="inrfs-customers-summary-card">
          <div className="inrfs-customers-summary-icon inrfs-customers-summary-icon--green">
            <UserRound size={20} />
          </div>

          <div className="inrfs-customers-summary-content">
            <span>Active Customers</span>
            <strong>{activeCustomers.toLocaleString()}</strong>
            <small>Currently active accounts</small>
          </div>
        </div>

        <div className="inrfs-customers-summary-card">
          <div className="inrfs-customers-summary-icon inrfs-customers-summary-icon--purple">
            <CreditCard size={20} />
          </div>

          <div className="inrfs-customers-summary-content">
            <span>Active Loans</span>
            <strong>{totalActiveLoans.toLocaleString()}</strong>
            <small>For filtered customers</small>
          </div>
        </div>

        <div className="inrfs-customers-summary-card">
          <div className="inrfs-customers-summary-icon inrfs-customers-summary-icon--orange">
            <CreditCard size={20} />
          </div>

          <div className="inrfs-customers-summary-content">
            <span>Outstanding</span>
            <strong>{formatCurrency(totalOutstanding)}</strong>
            <small>For filtered customers</small>
          </div>
        </div>
      </section>

      {/* Main Customer Section */}
      <section className="inrfs-customers-content-card">
        {/* Toolbar */}
        <div className="inrfs-customers-toolbar">
          <div className="inrfs-customers-search-wrapper">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search customer, mobile, city or ID..."
            />
          </div>

          <div className="inrfs-customers-filter-group">
            <div className="inrfs-customers-filter-control">
              <label htmlFor="inrfs-customers-status-filter">
                Status
              </label>

              <select
                id="inrfs-customers-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                {customerStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>

            <div className="inrfs-customers-filter-control">
              <label htmlFor="inrfs-customers-financer-filter">
                Financer
              </label>

              <select
                id="inrfs-customers-financer-filter"
                value={financerFilter}
                onChange={(event) =>
                  setFinancerFilter(event.target.value)
                }
              >
                {financerNames.map((financer) => (
                  <option key={financer} value={financer}>
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
        <div className="inrfs-customers-results-bar">
          <span>
            Showing{' '}
            <strong>{filteredCustomers.length}</strong>{' '}
            customer
            {filteredCustomers.length !== 1 ? 's' : ''}
          </span>

          {(search ||
            statusFilter !== 'All' ||
            financerFilter !== 'All') && (
            <button
              type="button"
              className="inrfs-customers-clear-filters"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredCustomers.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="inrfs-customers-table-wrapper">
              <table className="inrfs-customers-table">
                <thead>
                  <tr>
                    <th>Customer ID</th>
                    <th>Customer</th>
                    <th>Mobile</th>
                    <th>Financer</th>
                    <th>Location</th>
                    <th>Active Loans</th>
                    <th>Outstanding</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong className="inrfs-customers-id">
                          {customer.id}
                        </strong>
                      </td>

                      <td>
                        <div className="inrfs-customers-name-cell">
                          <div className="inrfs-customers-avatar">
                            {String(customer.name || 'C')
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{customer.name}</strong>

                            {customer.email && (
                              <span>{customer.email}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="inrfs-customers-mobile-cell">
                          <Phone size={14} />
                          <span>{customer.mobile || '—'}</span>
                        </div>
                      </td>

                      <td>
                        <div className="inrfs-customers-financer-cell">
                          <Building2 size={15} />
                          <span>
                            {getCustomerFinancer(customer)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="inrfs-customers-location-cell">
                          <MapPin size={14} />
                          <span>{customer.city || '—'}</span>
                        </div>
                      </td>

                      <td>
                        <strong className="inrfs-customers-loan-count">
                          {customer.activeLoans || 0}
                        </strong>
                      </td>

                      <td>
                        <strong className="inrfs-customers-outstanding">
                          {formatCurrency(customer.outstanding || 0)}
                        </strong>
                      </td>

                      <td>
                        <StatusBadge status={customer.status} />
                      </td>

                      <td>
                        <button
                          type="button"
                          className="inrfs-customers-view-button"
                          onClick={() =>
                            handleViewCustomer(customer)
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

            {/* Mobile Cards */}
            <div className="inrfs-customers-mobile-list">
              {filteredCustomers.map((customer) => (
                <article
                  className="inrfs-customers-mobile-card"
                  key={`mobile-${customer.id}`}
                >
                  <div className="inrfs-customers-mobile-card-header">
                    <div className="inrfs-customers-mobile-customer">
                      <div className="inrfs-customers-avatar">
                        {String(customer.name || 'C')
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>{customer.name}</strong>
                        <span>{customer.id}</span>
                      </div>
                    </div>

                    <StatusBadge status={customer.status} />
                  </div>

                  <div className="inrfs-customers-mobile-card-body">
                    <div className="inrfs-customers-mobile-row">
                      <span>Mobile</span>
                      <strong>
                        {customer.mobile || '—'}
                      </strong>
                    </div>

                    <div className="inrfs-customers-mobile-row">
                      <span>Financer</span>
                      <strong>
                        {getCustomerFinancer(customer)}
                      </strong>
                    </div>

                    <div className="inrfs-customers-mobile-row">
                      <span>City</span>
                      <strong>
                        {customer.city || '—'}
                      </strong>
                    </div>

                    <div className="inrfs-customers-mobile-row">
                      <span>Active Loans</span>
                      <strong>
                        {customer.activeLoans || 0}
                      </strong>
                    </div>

                    <div className="inrfs-customers-mobile-row">
                      <span>Outstanding</span>
                      <strong className="inrfs-customers-mobile-outstanding">
                        {formatCurrency(customer.outstanding || 0)}
                      </strong>
                    </div>
                  </div>

                  <div className="inrfs-customers-mobile-card-footer">
                    <button
                      type="button"
                      className="inrfs-customers-mobile-view-button"
                      onClick={() =>
                        handleViewCustomer(customer)
                      }
                    >
                      <Eye size={16} />
                      View Customer Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="inrfs-customers-empty-state">
            <div className="inrfs-customers-empty-icon">
              <Search size={24} />
            </div>

            <h3>No customers found</h3>

            <p>
              No customer records match your current search or
              filter selection.
            </p>

            <button
              type="button"
              className="inrfs-customers-empty-button"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* Customer Details Overlay */}
      {selectedCustomer && (
        <div
          className="inrfs-customers-modal-backdrop"
          onMouseDown={handleCloseCustomerDetails}
        >
          <div
            className="inrfs-customers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inrfs-customers-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="inrfs-customers-modal-header">
              <div className="inrfs-customers-modal-customer">
                <div className="inrfs-customers-modal-avatar">
                  {String(selectedCustomer.name || 'C')
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h2 id="inrfs-customers-modal-title">
                    {selectedCustomer.name}
                  </h2>

                  <span>
                    Customer ID: {selectedCustomer.id}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="inrfs-customers-modal-close"
                onClick={handleCloseCustomerDetails}
                aria-label="Close customer details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="inrfs-customers-modal-status">
              <StatusBadge status={selectedCustomer.status} />
            </div>

            <div className="inrfs-customers-modal-section">
              <h3>Customer Information</h3>

              <div className="inrfs-customers-detail-grid">
                <div className="inrfs-customers-detail-item">
                  <span>Full Name</span>
                  <strong>
                    {selectedCustomer.name || '—'}
                  </strong>
                </div>

                <div className="inrfs-customers-detail-item">
                  <span>Mobile Number</span>
                  <strong>
                    {selectedCustomer.mobile || '—'}
                  </strong>
                </div>

                <div className="inrfs-customers-detail-item">
                  <span>Email</span>
                  <strong>
                    {selectedCustomer.email || 'Not available'}
                  </strong>
                </div>

                <div className="inrfs-customers-detail-item">
                  <span>City</span>
                  <strong>
                    {selectedCustomer.city || '—'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="inrfs-customers-modal-section">
              <h3>Financer Relationship</h3>

              <div className="inrfs-customers-financer-detail">
                <div className="inrfs-customers-financer-detail-icon">
                  <Building2 size={19} />
                </div>

                <div>
                  <span>Associated Financer</span>
                  <strong>
                    {getCustomerFinancer(selectedCustomer)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="inrfs-customers-modal-section">
              <h3>Loan Overview</h3>

              <div className="inrfs-customers-loan-summary-grid">
                <div className="inrfs-customers-loan-summary">
                  <span>Active Loans</span>
                  <strong>
                    {selectedCustomer.activeLoans || 0}
                  </strong>
                </div>

                <div className="inrfs-customers-loan-summary">
                  <span>Outstanding</span>
                  <strong>
                    {formatCurrency(
                      selectedCustomer.outstanding || 0
                    )}
                  </strong>
                </div>

                <div className="inrfs-customers-loan-summary">
                  <span>Loan Status</span>
                  <strong>
                    {getLoanStatus(selectedCustomer)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="inrfs-customers-modal-footer">
              <div className="inrfs-customers-modal-footer-info">
                <CalendarDays size={15} />
                <span>
                  Customer information from Admin registry
                </span>
              </div>

              <button
                type="button"
                className="inrfs-customers-modal-done-button"
                onClick={handleCloseCustomerDetails}
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