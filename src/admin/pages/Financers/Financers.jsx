import React, { useMemo, useState } from 'react';

import {
  UsersRound,
  Plus,
  CheckCircle,
  Building2,
  Ban,
  Eye,
  IndianRupee,
  TrendingUp,
  Percent,
  WalletCards,
  Power,
  PowerOff,
} from 'lucide-react';

import SearchInput from '../../../common/components/SearchInput';
import StatusBadge from '../../../common/components/StatusBadge';
import Button from '../../../common/components/Button';
import Modal from '../../../common/components/Modal';
import { formatCurrency } from '../../../common/utils/formatters';
import { mockFinancersList } from '../../data/mockAdminData';

import './Financers.css';

/* =========================================================
   CONFIGURATION
========================================================= */

/*
 * Default INRFS service charge percentage.
 *
 * The BRD requires a configurable default percentage and
 * financer-specific percentage.
 *
 * Individual financers can override this using:
 *
 * financer.serviceChargePercentage
 */
const DEFAULT_SERVICE_CHARGE_PERCENTAGE = 1;

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const getNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

/*
 * These helpers support different property names so the
 * existing mock/API structure does not immediately break.
 *
 * Later, when backend is connected, keep these property names
 * consistent in your API response.
 */

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

/*
 * Current month's applicable interest.
 */

const getMonthlyInterest = (financer) =>
  getNumber(
    financer.monthlyInterest ??
      financer.monthlyInterestCollected ??
      financer.currentMonthInterest ??
      financer.currentMonthInterestCollected
  );

/*
 * Get the applicable service charge percentage.
 *
 * Priority:
 *
 * 1. Financer-specific percentage
 * 2. Default INRFS percentage
 */

const getServiceChargePercentage = (financer) =>
  getNumber(
    financer.serviceChargePercentage ??
      DEFAULT_SERVICE_CHARGE_PERCENTAGE
  );

/*
 * Calculate monthly INRFS service charge.
 *
 * Formula:
 *
 * Applicable Interest × Service Charge %
 * ---------------------------------------
 *                 100
 */

const calculateMonthlyFee = (financer) => {
  const monthlyInterest = getMonthlyInterest(financer);

  const percentage =
    getServiceChargePercentage(financer);

  return (monthlyInterest * percentage) / 100;
};

/*
 * Get service-charge status.
 *
 * Backend can later provide this directly.
 * For now we safely fall back to Pending.
 */

const getServiceChargeStatus = (financer) =>
  financer.serviceChargeStatus || 'Pending';

/* =========================================================
   FINANCERS PAGE
========================================================= */

export default function Financers() {
  const [financers, setFinancers] =
    useState(mockFinancersList);

  const [search, setSearch] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);

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
    const searchValue =
      search.trim().toLowerCase();

    if (!searchValue) {
      return financers;
    }

    return financers.filter((financer) =>
      financer.name
        ?.toLowerCase()
        .includes(searchValue) ||
      financer.owner
        ?.toLowerCase()
        .includes(searchValue) ||
      financer.id
        ?.toLowerCase()
        .includes(searchValue) ||
      financer.city
        ?.toLowerCase()
        .includes(searchValue)
    );
  }, [financers, search]);

  /* =======================================================
     OVERALL FINANCER STATISTICS
  ======================================================= */

  const summary = useMemo(() => {
    const totalCustomers =
      financers.reduce(
        (total, financer) =>
          total + getCustomersCount(financer),
        0
      );

    const totalPrincipal =
      financers.reduce(
        (total, financer) =>
          total + getPrincipalAmount(financer),
        0
      );

    const totalInterest =
      financers.reduce(
        (total, financer) =>
          total + getTotalInterest(financer),
        0
      );

    const monthlyInterest =
      financers.reduce(
        (total, financer) =>
          total + getMonthlyInterest(financer),
        0
      );

    const monthlyPlatformFee =
      financers.reduce(
        (total, financer) =>
          total + calculateMonthlyFee(financer),
        0
      );

    const activeFinancers =
      financers.filter(
        (financer) =>
          financer.status === 'Active'
      ).length;

    const inactiveFinancers =
      financers.filter(
        (financer) =>
          financer.status === 'Inactive'
      ).length;

    const suspendedFinancers =
      financers.filter(
        (financer) =>
          financer.status === 'Suspended'
      ).length;

    return {
      totalCustomers,
      totalPrincipal,
      totalInterest,
      monthlyInterest,
      monthlyPlatformFee,
      activeFinancers,
      inactiveFinancers,
      suspendedFinancers,
    };
  }, [financers]);

  /* =======================================================
     APPROVE
  ======================================================= */

  const handleApprove = (id) => {
    setFinancers((currentFinancers) =>
      currentFinancers.map((financer) =>
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

  /* =======================================================
     ACTIVATE
  ======================================================= */

  const handleActivate = (id) => {
    setFinancers((currentFinancers) =>
      currentFinancers.map((financer) =>
        financer.id === id
          ? {
              ...financer,
              status: 'Active',
            }
          : financer
      )
    );
  };

  /* =======================================================
     DEACTIVATE
  ======================================================= */

  const handleDeactivate = (id) => {
    setFinancers((currentFinancers) =>
      currentFinancers.map((financer) =>
        financer.id === id
          ? {
              ...financer,
              status: 'Inactive',
            }
          : financer
      )
    );
  };

  /* =======================================================
     SUSPEND
  ======================================================= */

  const handleSuspend = (id) => {
    setFinancers((currentFinancers) =>
      currentFinancers.map((financer) =>
        financer.id === id
          ? {
              ...financer,
              status: 'Suspended',
            }
          : financer
      )
    );
  };

  /* =======================================================
     ADD FINANCER
  ======================================================= */

  const handleAddSubmit = (event) => {
    event.preventDefault();

    const created = {
      id: `FIN-${Math.floor(
        106 + Math.random() * 50
      )}`,

      name: newFinancer.name,

      owner: newFinancer.owner,

      city: newFinancer.city,

      activeLoans: 0,

      /*
       * Financial fields.
       * Backend can populate these later.
       */

      totalCustomers: 0,

      totalPrincipal: 0,

      totalInterest: 0,

      monthlyInterest: 0,

      totalDisbursed: 0,

      /*
       * BRD service-charge configuration.
       */

      serviceChargePercentage:
        getNumber(
          newFinancer.serviceChargePercentage
        ) ||
        DEFAULT_SERVICE_CHARGE_PERCENTAGE,

      serviceChargeStatus: 'Pending',

      kycStatus: 'Verified',

      status: 'Active',
    };

    setFinancers((currentFinancers) => [
      created,
      ...currentFinancers,
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
    <div className="financer-management-page animate-fade-in">

      {/* ===================================================
          HEADER
      ==================================================== */}

      <div className="financer-management-header">

        <div className="financer-management-heading">

          <h1 className="financer-management-title">
            Financer Accounts
          </h1>

          <p className="financer-management-subtitle">
            Manage financer institutions, customers,
            loans, service charges and account status.
          </p>

        </div>

        <Button
          variant="purple"
          icon={Plus}
          onClick={() =>
            setIsAddModalOpen(true)
          }
        >
          Add Financer Institution
        </Button>

      </div>

      {/* ===================================================
          SUMMARY CARDS
      ==================================================== */}

      <section className="financer-summary-grid">

        {/* TOTAL CUSTOMERS */}

        <div className="financer-summary-card">

          <div className="financer-summary-icon financer-summary-icon--customers">
            <UsersRound size={21} />
          </div>

          <div className="financer-summary-content">

            <span className="financer-summary-label">
              Total Customers
            </span>

            <strong className="financer-summary-value">
              {summary.totalCustomers.toLocaleString(
                'en-IN'
              )}
            </strong>

          </div>

        </div>

        {/* TOTAL PRINCIPAL */}

        <div className="financer-summary-card">

          <div className="financer-summary-icon financer-summary-icon--principal">
            <IndianRupee size={21} />
          </div>

          <div className="financer-summary-content">

            <span className="financer-summary-label">
              Total Principal
            </span>

            <strong className="financer-summary-value">
              {formatCurrency(
                summary.totalPrincipal
              )}
            </strong>

          </div>

        </div>

        {/* TOTAL INTEREST */}

        <div className="financer-summary-card">

          <div className="financer-summary-icon financer-summary-icon--interest">
            <TrendingUp size={21} />
          </div>

          <div className="financer-summary-content">

            <span className="financer-summary-label">
              Total Interest
            </span>

            <strong className="financer-summary-value">
              {formatCurrency(
                summary.totalInterest
              )}
            </strong>

          </div>

        </div>

        {/* MONTHLY INTEREST */}

        <div className="financer-summary-card">

          <div className="financer-summary-icon financer-summary-icon--monthly">
            <WalletCards size={21} />
          </div>

          <div className="financer-summary-content">

            <span className="financer-summary-label">
              This Month's Interest
            </span>

            <strong className="financer-summary-value">
              {formatCurrency(
                summary.monthlyInterest
              )}
            </strong>

          </div>

        </div>

        {/* MONTHLY SERVICE CHARGES */}

        <div className="financer-summary-card financer-summary-card--fee">

          <div className="financer-summary-icon financer-summary-icon--fee">
            <Percent size={21} />
          </div>

          <div className="financer-summary-content">

            <span className="financer-summary-label">
              Monthly Service Charges
            </span>

            <strong className="financer-summary-value financer-summary-value--fee">
              {formatCurrency(
                summary.monthlyPlatformFee
              )}
            </strong>

          </div>

        </div>

      </section>

      {/* ===================================================
          BILLING EXPLANATION
      ==================================================== */}

      <section className="financer-fee-info">

        <div className="financer-fee-info-icon">
          <Percent size={18} />
        </div>

        <div className="financer-fee-info-content">

          <strong>
            Monthly Service Charge
          </strong>

          <span>
            INRFS service charges are calculated using
            the applicable service-charge percentage on
            customer interest generated during the
            billing month.
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
      ==================================================== */}

      <div className="financer-management-toolbar">

        <div className="financer-search-container">

          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search institution, owner or financer ID..."
          />

        </div>

        <div className="financer-result-count">

          Showing

          <strong>
            {filtered.length}
          </strong>

          of

          <strong>
            {financers.length}
          </strong>

          financers

        </div>

      </div>

      {/* ===================================================
          DESKTOP TABLE
      ==================================================== */}

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

                <th>MONTHLY INTEREST</th>

                <th>SERVICE CHARGE</th>

                <th>KYC</th>

                <th>STATUS</th>

                <th>SERVICE CHARGE STATUS</th>

                <th className="financer-action-header">
                  ACTIONS
                </th>

              </tr>

            </thead>

            <tbody>

              {filtered.length > 0 ? (

                filtered.map((financer) => {

                  const customers =
                    getCustomersCount(
                      financer
                    );

                  const principal =
                    getPrincipalAmount(
                      financer
                    );

                  const totalInterest =
                    getTotalInterest(
                      financer
                    );

                  const monthlyInterest =
                    getMonthlyInterest(
                      financer
                    );

                  const monthlyFee =
                    calculateMonthlyFee(
                      financer
                    );

                  const serviceChargePercentage =
                    getServiceChargePercentage(
                      financer
                    );

                  const serviceChargeStatus =
                    getServiceChargeStatus(
                      financer
                    );

                  return (

                    <tr key={financer.id}>

                      {/* FINANCER */}

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
                              {financer.owner} ·{' '}
                              {financer.city}
                            </small>

                          </div>

                        </div>

                      </td>

                      {/* CUSTOMERS */}

                      <td>

                        <div className="financer-number-cell">

                          <UsersRound size={15} />

                          <strong>
                            {customers.toLocaleString(
                              'en-IN'
                            )}
                          </strong>

                        </div>

                      </td>

                      {/* ACTIVE LOANS */}

                      <td>

                        <strong className="financer-loan-count">
                          {getNumber(
                            financer.activeLoans
                          ).toLocaleString(
                            'en-IN'
                          )}
                        </strong>

                      </td>

                      {/* PRINCIPAL */}

                      <td>

                        <strong className="financer-money-cell">
                          {formatCurrency(
                            principal
                          )}
                        </strong>

                      </td>

                      {/* TOTAL INTEREST */}

                      <td>

                        <strong className="financer-interest-cell">
                          {formatCurrency(
                            totalInterest
                          )}
                        </strong>

                      </td>

                      {/* MONTHLY INTEREST */}

                      <td>

                        <div className="financer-monthly-interest">

                          <strong>
                            {formatCurrency(
                              monthlyInterest
                            )}
                          </strong>

                          <span>
                            Current month
                          </span>

                        </div>

                      </td>

                      {/* SERVICE CHARGE */}

                      <td>

                        <div className="financer-platform-fee">

                          <strong>
                            {formatCurrency(
                              monthlyFee
                            )}
                          </strong>

                          <span>
                            {serviceChargePercentage}%
                            charge
                          </span>

                        </div>

                      </td>

                      {/* KYC */}

                      <td>

                        <StatusBadge
                          status={
                            financer.kycStatus
                          }
                        />

                      </td>

                      {/* STATUS */}

                      <td>

                        <StatusBadge
                          status={
                            financer.status
                          }
                        />

                      </td>

                      {/* SERVICE CHARGE STATUS */}

                      <td>

                        <StatusBadge
                          status={
                            serviceChargeStatus
                          }
                        />

                      </td>

                      {/* ACTIONS */}

                      <td>

                        <div className="financer-action-buttons">

                          {/* APPROVE */}

                          {financer.status ===
                            'Pending Approval' && (

                            <button
                              type="button"
                              className="financer-approve-action"
                              onClick={() =>
                                handleApprove(
                                  financer.id
                                )
                              }
                              title="Approve Financer"
                            >

                              <CheckCircle
                                size={16}
                              />

                              <span>
                                Approve
                              </span>

                            </button>

                          )}

                          {/* ACTIVE ACTIONS */}

                          {financer.status ===
                            'Active' && (

                            <>

                              <button
                                type="button"
                                className="financer-suspend-action"
                                onClick={() =>
                                  handleSuspend(
                                    financer.id
                                  )
                                }
                                title="Suspend Financer"
                              >
                                <Ban
                                  size={16}
                                />
                              </button>

                              <button
                                type="button"
                                className="financer-deactivate-action"
                                onClick={() =>
                                  handleDeactivate(
                                    financer.id
                                  )
                                }
                                title="Deactivate Financer"
                              >
                                <PowerOff
                                  size={15}
                                />

                                <span>
                                  Deactivate
                                </span>
                              </button>

                            </>

                          )}

                          {/* INACTIVE */}

                          {financer.status ===
                            'Inactive' && (

                            <button
                              type="button"
                              className="financer-activate-action"
                              onClick={() =>
                                handleActivate(
                                  financer.id
                                )
                              }
                              title="Activate Financer"
                            >

                              <Power
                                size={15}
                              />

                              <span>
                                Activate
                              </span>

                            </button>

                          )}

                          {/* SUSPENDED */}

                          {financer.status ===
                            'Suspended' && (

                            <button
                              type="button"
                              className="financer-activate-action"
                              onClick={() =>
                                handleActivate(
                                  financer.id
                                )
                              }
                              title="Activate Financer"
                            >

                              <Power
                                size={15}
                              />

                              <span>
                                Activate
                              </span>

                            </button>

                          )}

                          {/* VIEW */}

                          <button
                            type="button"
                            className="financer-view-action"
                            title="View Financer Details"
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
                    colSpan="11"
                    className="financer-empty-state"
                  >

                    <UsersRound size={34} />

                    <strong>
                      No financers found
                    </strong>

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
          MOBILE FINANCER CARDS
      ==================================================== */}

      <div className="financer-mobile-list">

        {filtered.length > 0 ? (

          filtered.map((financer) => {

            const customers =
              getCustomersCount(
                financer
              );

            const principal =
              getPrincipalAmount(
                financer
              );

            const totalInterest =
              getTotalInterest(
                financer
              );

            const monthlyInterest =
              getMonthlyInterest(
                financer
              );

            const monthlyFee =
              calculateMonthlyFee(
                financer
              );

            const serviceChargePercentage =
              getServiceChargePercentage(
                financer
              );

            const serviceChargeStatus =
              getServiceChargeStatus(
                financer
              );

            return (

              <article
                key={financer.id}
                className="financer-mobile-card"
              >

                {/* MOBILE HEADER */}

                <div className="financer-mobile-card-header">

                  <div className="financer-mobile-identity">

                    <div className="financer-mobile-avatar">
                      <Building2 size={18} />
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
                    status={
                      financer.status
                    }
                  />

                </div>

                {/* OWNER */}

                <div className="financer-mobile-owner">

                  <span>
                    Proprietor
                  </span>

                  <strong>
                    {financer.owner}
                  </strong>

                </div>

                {/* MOBILE FINANCIAL GRID */}

                <div className="financer-mobile-stats">

                  <div className="financer-mobile-stat">

                    <span>
                      Customers
                    </span>

                    <strong>
                      {customers.toLocaleString(
                        'en-IN'
                      )}
                    </strong>

                  </div>

                  <div className="financer-mobile-stat">

                    <span>
                      Active Loans
                    </span>

                    <strong>
                      {getNumber(
                        financer.activeLoans
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </strong>

                  </div>

                  <div className="financer-mobile-stat">

                    <span>
                      Principal
                    </span>

                    <strong>
                      {formatCurrency(
                        principal
                      )}
                    </strong>

                  </div>

                  <div className="financer-mobile-stat">

                    <span>
                      Total Interest
                    </span>

                    <strong>
                      {formatCurrency(
                        totalInterest
                      )}
                    </strong>

                  </div>

                  <div className="financer-mobile-stat">

                    <span>
                      This Month Interest
                    </span>

                    <strong>
                      {formatCurrency(
                        monthlyInterest
                      )}
                    </strong>

                  </div>

                  <div className="financer-mobile-stat financer-mobile-stat--fee">

                    <span>
                      Service Charge
                    </span>

                    <strong>
                      {formatCurrency(
                        monthlyFee
                      )}
                    </strong>

                    <small>
                      {serviceChargePercentage}%
                    </small>

                  </div>

                </div>

                {/* MOBILE FOOTER */}

                <div className="financer-mobile-card-footer">

                  <div className="financer-mobile-statuses">

                    <div>

                      <span>
                        KYC
                      </span>

                      <StatusBadge
                        status={
                          financer.kycStatus
                        }
                      />

                    </div>

                    <div>

                      <span>
                        Service Charge
                      </span>

                      <StatusBadge
                        status={
                          serviceChargeStatus
                        }
                      />

                    </div>

                  </div>

                  <div className="financer-action-buttons">

                    {/* APPROVE */}

                    {financer.status ===
                      'Pending Approval' && (

                      <button
                        type="button"
                        className="financer-approve-action"
                        onClick={() =>
                          handleApprove(
                            financer.id
                          )
                        }
                      >

                        <CheckCircle
                          size={16}
                        />

                        <span>
                          Approve
                        </span>

                      </button>

                    )}

                    {/* ACTIVE */}

                    {financer.status ===
                      'Active' && (

                      <>

                        <button
                          type="button"
                          className="financer-suspend-action"
                          onClick={() =>
                            handleSuspend(
                              financer.id
                            )
                          }
                          title="Suspend Financer"
                        >
                          <Ban
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          className="financer-deactivate-action"
                          onClick={() =>
                            handleDeactivate(
                              financer.id
                            )
                          }
                          title="Deactivate Financer"
                        >
                          <PowerOff
                            size={15}
                          />

                          <span>
                            Deactivate
                          </span>
                        </button>

                      </>

                    )}

                    {/* INACTIVE */}

                    {financer.status ===
                      'Inactive' && (

                      <button
                        type="button"
                        className="financer-activate-action"
                        onClick={() =>
                          handleActivate(
                            financer.id
                          )
                        }
                      >

                        <Power
                          size={15}
                        />

                        <span>
                          Activate
                        </span>

                      </button>

                    )}

                    {/* SUSPENDED */}

                    {financer.status ===
                      'Suspended' && (

                      <button
                        type="button"
                        className="financer-activate-action"
                        onClick={() =>
                          handleActivate(
                            financer.id
                          )
                        }
                      >

                        <Power
                          size={15}
                        />

                        <span>
                          Activate
                        </span>

                      </button>

                    )}

                    {/* VIEW */}

                    <button
                      type="button"
                      className="financer-view-action"
                      title="View Financer Details"
                    >

                      <Eye size={16} />

                    </button>

                  </div>

                </div>

              </article>

            );
          })

        ) : (

          <div className="financer-mobile-empty">

            <UsersRound size={32} />

            <strong>
              No financers found
            </strong>

            <span>
              Try changing your search.
            </span>

          </div>

        )}

      </div>

      {/* ===================================================
          ADD FINANCER MODAL
      ==================================================== */}

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

          {/* INSTITUTION NAME */}

          <div className="financer-register-field">

            <label>
              Institution Name
            </label>

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

          {/* OWNER */}

          <div className="financer-register-field">

            <label>
              Proprietor / Owner Name
            </label>

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

          {/* CITY */}

          <div className="financer-register-field">

            <label>
              City
            </label>

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

          {/* SERVICE CHARGE */}

          <div className="financer-register-field">

            <label>
              Service Charge %
            </label>

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

          {/* ACTIONS */}

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