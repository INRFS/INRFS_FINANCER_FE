import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  UsersRound,
  Plus,
  CheckCircle,
  Building2,
  Eye,
  IndianRupee,
  TrendingUp,
  Percent,
  WalletCards,
  ChevronRight,
} from 'lucide-react';

import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import { formatCurrency } from '../../../common/utils/formatters';
import { mockFinancersList } from '../../data/mockAdminData';

import './Financers.css';

const DEFAULT_SERVICE_CHARGE_PERCENTAGE = 1;

/* =========================================================
   HELPERS
========================================================= */

const getNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const getCustomersCount = (financer) =>
  getNumber(
    financer.totalCustomers ??
      financer.customerCount ??
      financer.customersCount ??
      financer.customers
  );

const getPrincipalAmount = (financer) =>
  getNumber(
    financer.totalPrincipal ??
      financer.totalPrincipalGiven ??
      financer.totalDisbursed ??
      financer.principalAmount
  );

const getTotalInterest = (financer) =>
  getNumber(
    financer.totalInterest ??
      financer.totalInterestEarned ??
      financer.interestEarned
  );

const getMonthlyInterest = (financer) =>
  getNumber(
    financer.monthlyInterest ??
      financer.monthlyInterestCollected ??
      financer.currentMonthInterest ??
      financer.currentMonthInterestCollected
  );

const getServiceChargePercentage = (financer) =>
  getNumber(
    financer.serviceChargePercentage ??
      DEFAULT_SERVICE_CHARGE_PERCENTAGE
  );

const calculateMonthlyFee = (financer) => {
  const monthlyInterest = getMonthlyInterest(financer);
  const percentage = getServiceChargePercentage(financer);

  return (monthlyInterest * percentage) / 100;
};

const getServiceChargeStatus = (financer) =>
  financer.serviceChargeStatus || 'Pending';

const getActiveLoans = (financer) =>
  getNumber(
    financer.activeLoans ??
      financer.activeLoanCount ??
      financer.loansCount
  );

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

/* =========================================================
   FINANCERS PAGE
========================================================= */

export default function Financers() {
  const navigate = useNavigate();

  const [financers, setFinancers] = useState(mockFinancersList);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newFinancer, setNewFinancer] = useState({
    name: '',
    owner: '',
    city: 'Ahmedabad',
    serviceChargePercentage:
      DEFAULT_SERVICE_CHARGE_PERCENTAGE,
  });

  /* =======================================================
     FILTER
  ======================================================= */

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return financers;
    }

    return financers.filter((financer) =>
      [
        financer.name,
        financer.owner,
        financer.id,
        financer.city,
      ].some((value) =>
        value?.toLowerCase().includes(searchValue)
      )
    );
  }, [financers, search]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const totalCustomers = financers.reduce(
      (total, financer) =>
        total + getCustomersCount(financer),
      0
    );

    const totalPrincipal = financers.reduce(
      (total, financer) =>
        total + getPrincipalAmount(financer),
      0
    );

    const totalInterest = financers.reduce(
      (total, financer) =>
        total + getTotalInterest(financer),
      0
    );

    const monthlyInterest = financers.reduce(
      (total, financer) =>
        total + getMonthlyInterest(financer),
      0
    );

    const monthlyPlatformFee = financers.reduce(
      (total, financer) =>
        total + calculateMonthlyFee(financer),
      0
    );

    return {
      totalCustomers,
      totalPrincipal,
      totalInterest,
      monthlyInterest,
      monthlyPlatformFee,
    };
  }, [financers]);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleApprove = (id) => {
    setFinancers((current) =>
      current.map((financer) =>
        financer.id === id
          ? {
              ...financer,
              status: 'Active',
              kycStatus: 'Verified',
            }
          : financer
      )
    );
  };
  const handleView = (financer) => {
    navigate(`/admin/financers/${financer.id}`);
  };

  /* =======================================================
     ADD FINANCER
  ======================================================= */

  const handleAddSubmit = (event) => {
    event.preventDefault();

    const created = {
      id: `FIN-${Math.floor(106 + Math.random() * 50)}`,
      name: newFinancer.name,
      owner: newFinancer.owner,
      city: newFinancer.city,

      totalCustomers: 0,
      activeLoans: 0,
      totalPrincipal: 0,
      totalInterest: 0,
      monthlyInterest: 0,

      serviceChargePercentage:
        getNumber(
          newFinancer.serviceChargePercentage
        ) || DEFAULT_SERVICE_CHARGE_PERCENTAGE,

      serviceChargeStatus: 'Pending',
      kycStatus: 'Verified',
      status: 'Active',
    };

    setFinancers((current) => [
      created,
      ...current,
    ]);

    setIsAddModalOpen(false);

    setNewFinancer({
      name: '',
      owner: '',
      city: 'Ahmedabad',
      serviceChargePercentage:
        DEFAULT_SERVICE_CHARGE_PERCENTAGE,
    });
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="financer-management-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="financer-management-header">

        <div>
          <div className="financer-breadcrumb">
            Administration
            <ChevronRight size={14} />
            Financers
          </div>

          <h1 className="financer-management-title">
            Financer Institutions
          </h1>

          <p className="financer-management-subtitle">
            Manage financer institutions and access their
            customers, loans and financial activity.
          </p>
        </div>

        <Button
          variant="purple"
          icon={Plus}
          onClick={() =>
            setIsAddModalOpen(true)
          }
        >
          Add Financer
        </Button>

      </div>

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <section className="financer-summary-grid">

        <div className="financer-summary-card">
          <div className="financer-summary-icon financer-summary-icon--customers">
            <UsersRound size={20} />
          </div>

          <div>
            <span>Total Customers</span>
            <strong>
              {summary.totalCustomers.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        <div className="financer-summary-card">
          <div className="financer-summary-icon financer-summary-icon--principal">
            <IndianRupee size={20} />
          </div>

          <div>
            <span>Total Principal</span>
            <strong>
              {formatCurrency(summary.totalPrincipal)}
            </strong>
          </div>
        </div>

        <div className="financer-summary-card">
          <div className="financer-summary-icon financer-summary-icon--interest">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Total Interest</span>
            <strong>
              {formatCurrency(summary.totalInterest)}
            </strong>
          </div>
        </div>

        <div className="financer-summary-card">
          <div className="financer-summary-icon financer-summary-icon--monthly">
            <WalletCards size={20} />
          </div>

          <div>
            <span>This Month Interest</span>
            <strong>
              {formatCurrency(summary.monthlyInterest)}
            </strong>
          </div>
        </div>

        <div className="financer-summary-card financer-summary-card--fee">
          <div className="financer-summary-icon financer-summary-icon--fee">
            <Percent size={20} />
          </div>

          <div>
            <span>Monthly Service Charges</span>
            <strong>
              {formatCurrency(summary.monthlyPlatformFee)}
            </strong>
          </div>
        </div>

      </section>

      {/* ===================================================
          SERVICE CHARGE INFO
      =================================================== */}

      <section className="financer-fee-info">

        <div className="financer-fee-info-icon">
          <Percent size={18} />
        </div>

        <div className="financer-fee-info-content">
          <strong>Monthly Service Charge</strong>

          <span>
            INRFS service charges are calculated using the
            applicable service-charge percentage on customer
            interest generated during the billing month.
          </span>
        </div>

        <div className="financer-fee-formula">
          <span>
            Applicable Interest × Service Charge %
          </span>

          <strong>
            = INRFS Service Charge
          </strong>
        </div>

      </section>

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <div className="financer-management-toolbar">

        <div className="financer-search-container">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search financer, owner or ID..."
          />
        </div>

        <div className="financer-result-count">
          Showing
          <strong>{filtered.length}</strong>
          of
          <strong>{financers.length}</strong>
          financers
        </div>

      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div className="financer-table-card">

        <div className="financer-table-scroll">

          <table className="financer-data-table">

            <thead>
              <tr>
                <th>FINANCER</th>
                <th>CUSTOMERS</th>
                <th>ACTIVE LOANS</th>
                <th>TOTAL PRINCIPAL</th>
                <th>TOTAL INTEREST</th>
                <th>STATUS</th>
                <th className="financer-action-header">
                  ACTION
                </th>
              </tr>
            </thead>

            <tbody>

              {filtered.length > 0 ? (
                filtered.map((financer) => {

                  const customers =
                    getCustomersCount(financer);

                  const principal =
                    getPrincipalAmount(financer);

                  const totalInterest =
                    getTotalInterest(financer);

                  return (
                    <tr
                      key={financer.id}
                      onClick={() =>
                        handleView(financer)
                      }
                      className="financer-table-row"
                    >

                      <td>
                        <div className="financer-identity">

                          <div className="financer-identity-avatar">
                            <Building2 size={18} />
                          </div>

                          <div className="financer-identity-details">
                            <strong>
                              {financer.name}
                            </strong>

                            <span>
                              {financer.id}
                            </span>

                            <small>
                              {financer.owner}
                              {' · '}
                              {financer.city}
                            </small>
                          </div>

                        </div>
                      </td>

                      <td>
                        <div className="financer-number-cell">
                          <UsersRound size={15} />

                          <strong>
                            {customers.toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <strong className="financer-loan-count">
                          {getActiveLoans(financer).toLocaleString('en-IN')}
                        </strong>
                      </td>

                      <td>
                        <strong className="financer-money-cell">
                          {formatCurrency(principal)}
                        </strong>
                      </td>

                      <td>
                        <strong className="financer-interest-cell">
                          {formatCurrency(totalInterest)}
                        </strong>
                      </td>
                      <td>
                        <StatusBadge
                          status={financer.status}
                        />
                      </td>

                      <td
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                      >
                        <div className="financer-action-buttons">
                          <button
                            type="button"
                            className="financer-view-action"
                            onClick={() =>
                              handleView(financer)
                            }
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                        </div>

                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="financer-empty-state"
                  >
                    <UsersRound size={34} />
                    <strong>No financers found</strong>
                    <span>
                      Try changing your search.
                    </span>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* ===================================================
          MOBILE
      =================================================== */}

      <div className="financer-mobile-list">

        {filtered.length > 0 ? (
          filtered.map((financer) => {

            const customers =
              getCustomersCount(financer);

            const principal =
              getPrincipalAmount(financer);

            return (
              <article
                key={financer.id}
                className="financer-mobile-card"
                onClick={() =>
                  handleView(financer)
                }
              >

                <div className="financer-mobile-card-header">

                  <div className="financer-mobile-identity">

                    <div className="financer-mobile-avatar">
                      {getInitials(financer.name)}
                    </div>

                    <div>
                      <strong>
                        {financer.name}
                      </strong>

                      <span>
                        {financer.id}
                      </span>
                    </div>

                  </div>

                  <StatusBadge
                    status={financer.status}
                  />

                </div>

                <div className="financer-mobile-owner">
                  <span>Proprietor</span>
                  <strong>
                    {financer.owner}
                  </strong>
                </div>

                <div className="financer-mobile-stats">

                  <div>
                    <span>Customers</span>
                    <strong>
                      {customers.toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div>
                    <span>Active Loans</span>
                    <strong>
                      {getActiveLoans(financer).toLocaleString('en-IN')}
                    </strong>
                  </div>

                  <div>
                    <span>Principal</span>
                    <strong>
                      {formatCurrency(principal)}
                    </strong>
                  </div>

                  <div>
                    <span>Total Interest</span>
                    <strong>
                      {formatCurrency(
                        getTotalInterest(financer)
                      )}
                    </strong>
                  </div>

                </div>

                <div className="financer-mobile-card-footer">

                  <div className="financer-mobile-statuses">
                    <div>
                      <span>Service Charge</span>
                      <strong>
                        {getServiceChargePercentage(financer)}%
                      </strong>
                    </div>

                  </div>

                  <button
                    type="button"
                    className="financer-mobile-view"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleView(financer);
                    }}
                  >
                    View Details
                    <ChevronRight size={16} />
                  </button>

                </div>

              </article>
            );
          })
        ) : (
          <div className="financer-mobile-empty">
            <UsersRound size={32} />
            <strong>No financers found</strong>
            <span>Try changing your search.</span>
          </div>
        )}

      </div>

      {/* ===================================================
          ADD FINANCER MODAL
      =================================================== */}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() =>
          setIsAddModalOpen(false)
        }
        title="Register Financer Institution"
      >

        <form
          onSubmit={handleAddSubmit}
          className="financer-register-form"
        >

          <div className="financer-register-field">
            <label>Institution Name</label>

            <input
              type="text"
              placeholder="e.g. Apex Finance"
              value={newFinancer.name}
              onChange={(event) =>
                setNewFinancer({
                  ...newFinancer,
                  name: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="financer-register-field">
            <label>Proprietor / Owner Name</label>

            <input
              type="text"
              placeholder="e.g. Suresh Patel"
              value={newFinancer.owner}
              onChange={(event) =>
                setNewFinancer({
                  ...newFinancer,
                  owner: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="financer-register-field">
            <label>City</label>

            <input
              type="text"
              value={newFinancer.city}
              onChange={(event) =>
                setNewFinancer({
                  ...newFinancer,
                  city: event.target.value,
                })
              }
              required
            />
          </div>

          <div className="financer-register-field">
            <label>Service Charge %</label>

            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={
                newFinancer.serviceChargePercentage
              }
              onChange={(event) =>
                setNewFinancer({
                  ...newFinancer,
                  serviceChargePercentage:
                    event.target.value,
                })
              }
              required
            />

            <small>
              Default: {DEFAULT_SERVICE_CHARGE_PERCENTAGE}%
            </small>
          </div>

          <div className="financer-register-actions">

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setIsAddModalOpen(false)
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="purple"
            >
              Register Financer
            </Button>

          </div>

        </form>

      </Modal>

    </div>
  );
}


/* =========================================================
   FINANCER DETAILS PAGE
========================================================= */

export function FinancerDetails({
  financer,
}) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState('overview');

  if (!financer) {
    return (
      <div className="financer-details-page">
        <div className="financer-details-not-found">
          <Building2 size={40} />
          <h2>Financer not found</h2>
          <button
            type="button"
            onClick={() =>
              navigate('/admin/financers')
            }
          >
            Back to Financers
          </button>
        </div>
      </div>
    );
  }

  const customers =
    getCustomersCount(financer);

  const activeLoans =
    getActiveLoans(financer);

  const principal =
    getPrincipalAmount(financer);

  const totalInterest =
    getTotalInterest(financer);

  const monthlyInterest =
    getMonthlyInterest(financer);

  const serviceCharge =
    calculateMonthlyFee(financer);

  const serviceChargePercentage =
    getServiceChargePercentage(financer);

  /*
   * These arrays are intentionally read from the financer
   * object so the page can directly consume backend data.
   *
   * Expected future API structure:
   *
   * financer.customers = [...]
   * financer.loans = [...]
   * financer.transactions = [...]
   */

  const customerRows =
    Array.isArray(financer.customers)
      ? financer.customers
      : [];

  const loanRows =
    Array.isArray(financer.loans)
      ? financer.loans
      : [];

  const transactionRows =
    Array.isArray(financer.transactions)
      ? financer.transactions
      : [];

  return (
    <div className="financer-details-page">

      {/* =================================================
          BACK
      ================================================= */}

      <button
        type="button"
        className="financer-back-button"
        onClick={() =>
          navigate('/admin/financers')
        }
      >
        ← Back to Financers
      </button>

      {/* =================================================
          PROFILE HEADER
      ================================================= */}

      <section className="financer-profile-header">

        <div className="financer-profile-main">

          <div className="financer-profile-avatar">
            <Building2 size={28} />
          </div>

          <div>

            <div className="financer-profile-id">
              {financer.id}
            </div>

            <h1>
              {financer.name}
            </h1>

            <p>
              {financer.owner}
              {' · '}
              {financer.city}
            </p>

          </div>

        </div>

        <div className="financer-profile-statuses">

          <StatusBadge
            status={financer.kycStatus}
          />

          <StatusBadge
            status={financer.status}
          />

        </div>

      </section>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <section className="financer-detail-kpi-grid">

        <div className="financer-detail-kpi">
          <div className="financer-detail-kpi-icon">
            <UsersRound size={19} />
          </div>

          <span>Total Customers</span>

          <strong>
            {customers.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="financer-detail-kpi">
          <div className="financer-detail-kpi-icon">
            <WalletCards size={19} />
          </div>

          <span>Active Loans</span>

          <strong>
            {activeLoans.toLocaleString('en-IN')}
          </strong>
        </div>

        <div className="financer-detail-kpi">
          <div className="financer-detail-kpi-icon">
            <IndianRupee size={19} />
          </div>

          <span>Total Principal</span>

          <strong>
            {formatCurrency(principal)}
          </strong>
        </div>

        <div className="financer-detail-kpi">
          <div className="financer-detail-kpi-icon">
            <TrendingUp size={19} />
          </div>

          <span>Total Interest</span>

          <strong>
            {formatCurrency(totalInterest)}
          </strong>
        </div>

        <div className="financer-detail-kpi">
          <div className="financer-detail-kpi-icon">
            <WalletCards size={19} />
          </div>

          <span>This Month Interest</span>

          <strong>
            {formatCurrency(monthlyInterest)}
          </strong>
        </div>

        <div className="financer-detail-kpi financer-detail-kpi--fee">
          <div className="financer-detail-kpi-icon">
            <Percent size={19} />
          </div>

          <span>Service Charge</span>

          <strong>
            {formatCurrency(serviceCharge)}
          </strong>

          <small>
            {serviceChargePercentage}% applicable
          </small>
        </div>

      </section>

      {/* =================================================
          TABS
      ================================================= */}

      <div className="financer-detail-tabs">

        <button
          type="button"
          className={
            activeTab === 'overview'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab('overview')
          }
        >
          Overview
        </button>

        <button
          type="button"
          className={
            activeTab === 'customers'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab('customers')
          }
        >
          Customers
          <span>{customers}</span>
        </button>

        <button
          type="button"
          className={
            activeTab === 'loans'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab('loans')
          }
        >
          Loans
          <span>{activeLoans}</span>
        </button>

        <button
          type="button"
          className={
            activeTab === 'transactions'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab('transactions')
          }
        >
          Transactions
        </button>

        <button
          type="button"
          className={
            activeTab === 'service'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab('service')
          }
        >
          Service Charges
        </button>

      </div>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      {activeTab === 'overview' && (
        <div className="financer-detail-content">

          <section className="financer-detail-section">

            <div className="financer-section-heading">
              <div>
                <h2>Financer Overview</h2>
                <p>
                  Key information and financial performance
                  of this institution.
                </p>
              </div>
            </div>

            <div className="financer-overview-grid">

              <div className="financer-overview-item">
                <span>Institution Name</span>
                <strong>{financer.name}</strong>
              </div>

              <div className="financer-overview-item">
                <span>Financer ID</span>
                <strong>{financer.id}</strong>
              </div>

              <div className="financer-overview-item">
                <span>Proprietor / Owner</span>
                <strong>{financer.owner}</strong>
              </div>

              <div className="financer-overview-item">
                <span>Location</span>
                <strong>{financer.city}</strong>
              </div>

              <div className="financer-overview-item">
                <span>KYC Status</span>
                <StatusBadge
                  status={financer.kycStatus}
                />
              </div>

              <div className="financer-overview-item">
                <span>Account Status</span>
                <StatusBadge
                  status={financer.status}
                />
              </div>

              <div className="financer-overview-item">
                <span>Service Charge Rate</span>
                <strong>
                  {serviceChargePercentage}%
                </strong>
              </div>

              <div className="financer-overview-item">
                <span>Service Charge Status</span>
                <StatusBadge
                  status={getServiceChargeStatus(financer)}
                />
              </div>

            </div>

          </section>

        </div>
      )}

      {/* =================================================
          CUSTOMERS
      ================================================= */}

      {activeTab === 'customers' && (
        <div className="financer-detail-content">

          <section className="financer-detail-section">

            <div className="financer-section-heading">
              <div>
                <h2>Customers</h2>
                <p>
                  Customers associated with {financer.name}.
                </p>
              </div>

              <strong className="financer-section-count">
                {customers} Customers
              </strong>
            </div>

            {customerRows.length > 0 ? (
              <div className="financer-detail-table-wrapper">

                <table className="financer-detail-table">

                  <thead>
                    <tr>
                      <th>CUSTOMER</th>
                      <th>CUSTOMER ID</th>
                      <th>PHONE</th>
                      <th>ACTIVE LOANS</th>
                      <th>OUTSTANDING</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {customerRows.map((customer) => (
                      <tr key={customer.id}>

                        <td>
                          <div className="detail-person">
                            <div className="detail-person-avatar">
                              {getInitials(
                                customer.name
                              )}
                            </div>

                            <strong>
                              {customer.name}
                            </strong>
                          </div>
                        </td>

                        <td>
                          {customer.id}
                        </td>

                        <td>
                          {customer.phone || '—'}
                        </td>

                        <td>
                          {customer.activeLoans ?? 0}
                        </td>

                        <td>
                          {formatCurrency(
                            getNumber(
                              customer.outstanding
                            )
                          )}
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              customer.status ||
                              'Active'
                            }
                          />
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            ) : (
              <EmptyDetailState
                icon={UsersRound}
                title="Customer details will appear here"
                text="Connect the financer customers array from your API to display individual customer records."
              />
            )}

          </section>

        </div>
      )}

      {/* =================================================
          LOANS
      ================================================= */}

      {activeTab === 'loans' && (
        <div className="financer-detail-content">

          <section className="financer-detail-section">

            <div className="financer-section-heading">
              <div>
                <h2>Loans</h2>
                <p>
                  Loans issued through {financer.name}.
                </p>
              </div>

              <strong className="financer-section-count">
                {activeLoans} Active
              </strong>
            </div>

            {loanRows.length > 0 ? (
              <div className="financer-detail-table-wrapper">

                <table className="financer-detail-table">

                  <thead>
                    <tr>
                      <th>LOAN ID</th>
                      <th>CUSTOMER</th>
                      <th>PRINCIPAL</th>
                      <th>INTEREST</th>
                      <th>OUTSTANDING</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {loanRows.map((loan) => (
                      <tr key={loan.id}>

                        <td>
                          <strong>
                            {loan.id}
                          </strong>
                        </td>

                        <td>
                          {loan.customerName || '—'}
                        </td>

                        <td>
                          {formatCurrency(
                            getNumber(
                              loan.principal
                            )
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            getNumber(
                              loan.interest
                            )
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            getNumber(
                              loan.outstanding
                            )
                          )}
                        </td>

                        <td>
                          <StatusBadge
                            status={
                              loan.status ||
                              'Active'
                            }
                          />
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            ) : (
              <EmptyDetailState
                icon={WalletCards}
                title="Loan details will appear here"
                text="Connect the financer loans array from your API to display individual loan records."
              />
            )}

          </section>

        </div>
      )}

      {/* =================================================
          TRANSACTIONS
      ================================================= */}

      {activeTab === 'transactions' && (
        <div className="financer-detail-content">

          <section className="financer-detail-section">

            <div className="financer-section-heading">
              <div>
                <h2>Transactions</h2>
                <p>
                  Financial activity related to this financer.
                </p>
              </div>
            </div>

            {transactionRows.length > 0 ? (
              <div className="financer-detail-table-wrapper">

                <table className="financer-detail-table">

                  <thead>
                    <tr>
                      <th>TRANSACTION ID</th>
                      <th>DATE</th>
                      <th>TYPE</th>
                      <th>AMOUNT</th>
                      <th>REFERENCE</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>

                  <tbody>

                    {transactionRows.map(
                      (transaction) => (
                        <tr key={transaction.id}>

                          <td>
                            {transaction.id}
                          </td>

                          <td>
                            {transaction.date || '—'}
                          </td>

                          <td>
                            {transaction.type || '—'}
                          </td>

                          <td>
                            {formatCurrency(
                              getNumber(
                                transaction.amount
                              )
                            )}
                          </td>

                          <td>
                            {transaction.reference ||
                              '—'}
                          </td>

                          <td>
                            <StatusBadge
                              status={
                                transaction.status ||
                                'Completed'
                              }
                            />
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            ) : (
              <EmptyDetailState
                icon={WalletCards}
                title="No transactions available"
                text="Transaction activity for this financer will appear here."
              />
            )}

          </section>

        </div>
      )}

      {/* =================================================
          SERVICE CHARGES
      ================================================= */}

      {activeTab === 'service' && (
        <div className="financer-detail-content">

          <section className="financer-detail-section">

            <div className="financer-section-heading">
              <div>
                <h2>Service Charges</h2>
                <p>
                  INRFS service charge calculation for this
                  financer.
                </p>
              </div>
            </div>

            <div className="service-charge-detail-card">

              <div className="service-charge-detail-icon">
                <Percent size={24} />
              </div>

              <div className="service-charge-detail-main">

                <span>
                  Applicable Service Charge
                </span>

                <strong>
                  {serviceChargePercentage}%
                </strong>

                <p>
                  Calculated on applicable customer interest
                  generated during the billing month.
                </p>

              </div>

              <div className="service-charge-detail-amount">

                <span>
                  Current Month Charge
                </span>

                <strong>
                  {formatCurrency(serviceCharge)}
                </strong>

                <StatusBadge
                  status={getServiceChargeStatus(financer)}
                />

              </div>

            </div>

            <div className="service-charge-formula-box">

              <span>Calculation</span>

              <strong>
                {formatCurrency(monthlyInterest)}
                {' × '}
                {serviceChargePercentage}%
                {' = '}
                {formatCurrency(serviceCharge)}
              </strong>

            </div>

          </section>

        </div>
      )}

    </div>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyDetailState({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="financer-detail-empty">

      <div className="financer-detail-empty-icon">
        <Icon size={28} />
      </div>

      <strong>{title}</strong>

      <span>{text}</span>

    </div>
  );
}