import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  UsersRound,
  WalletCards,
  IndianRupee,
  TrendingUp,
  Percent,
  CreditCard,
  ReceiptText,
  CalendarDays,
  MapPin,
  UserRound,
  ChevronRight,
  Search,
  Download,
} from 'lucide-react';

import StatusBadge from '../../../common/components/StatusBadge';
import { formatCurrency } from '../../../common/utils/formatters';
import { platformApi, pageItems } from '../../../common/services/platformApi';
import { customerFromApi, loanFromApi } from '../../../common/utils/domainAdapters';
import { applyCustomerLoanMetrics } from './customerLoanMetrics';

import './FinancerDetails.css';

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
  getNumber(financer.serviceChargePercentage ?? 1);

const calculateServiceCharge = (financer) => {
  return (
    getMonthlyInterest(financer) *
    getServiceChargePercentage(financer)
  ) / 100;
};

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
   MAIN COMPONENT
========================================================= */

export default function FinancerDetails() {
  const navigate = useNavigate();
  const { financerId } = useParams();

  const [activeTab, setActiveTab] = useState('overview');
  const [customerSearch, setCustomerSearch] = useState('');
  const [loanSearch, setLoanSearch] = useState('');

  const [financer, setFinancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  useEffect(() => {
    let current = true;
    Promise.all([
      platformApi.admin.allFinancers(),
      platformApi.customers.all({ financerId }),
      platformApi.loans.all({ financerId }),
      platformApi.payments.transactions({ financerId, pageSize: 200 }),
      platformApi.dashboard.admin({ financerId }),
    ]).then(([financerPayload, customerPayload, loanPayload, transactionPayload, usage]) => {
      if (!current) return;
      const organization = pageItems(financerPayload).find((item) => item.id === financerId);
      const customerItems = pageItems(customerPayload);
      const byId = new Map(customerItems.map((item) => [item.id, item]));
      const normalizedLoans = pageItems(loanPayload).map((item) => loanFromApi(item, byId.get(item.customerId)));
      const normalizedCustomers = applyCustomerLoanMetrics(customerItems.map(customerFromApi), normalizedLoans);
      setFinancer(organization ? { ...organization, name: organization.displayName, owner: organization.ownerName, totalCustomers: usage.totalCustomers, activeLoans: usage.activeLoans, totalPrincipal: usage.totalPrincipal, totalInterest: usage.interestOutstanding, monthlyInterest: usage.collections, customers: normalizedCustomers, loans: normalizedLoans, transactions: pageItems(transactionPayload) } : null);
    }).catch((error) => current && setPageError(error.message)).finally(() => current && setLoading(false));
    return () => { current = false; };
  }, [financerId]);

  /* =======================================================
     NOT FOUND
  ======================================================= */

  const safeFinancer = financer || {};

  /* =======================================================
     FINANCIAL DATA
  ======================================================= */

  const totalCustomers =
    getCustomersCount(safeFinancer);

  const activeLoans =
    getActiveLoans(safeFinancer);

  const totalPrincipal =
    getPrincipalAmount(safeFinancer);

  const totalInterest =
    getTotalInterest(safeFinancer);

  const monthlyInterest =
    getMonthlyInterest(safeFinancer);

  const serviceChargePercentage =
    getServiceChargePercentage(safeFinancer);

  const serviceCharge =
    calculateServiceCharge(safeFinancer);

  const customers = useMemo(() => Array.isArray(financer?.customers) ? financer.customers : [], [financer]);

  const loans = useMemo(() => Array.isArray(financer?.loans) ? financer.loans : [], [financer]);

  const transactions = Array.isArray(
    safeFinancer.transactions
  )
    ? safeFinancer.transactions
    : [];

  /* =======================================================
     FILTER CUSTOMER DATA
  ======================================================= */

  const filteredCustomers = useMemo(() => {
    const value = customerSearch
      .trim()
      .toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.name,
        customer.id,
        customer.phone,
      ].some((field) =>
        String(field || '')
          .toLowerCase()
          .includes(value)
      )
    );
  }, [customers, customerSearch]);

  /* =======================================================
     FILTER LOAN DATA
  ======================================================= */

  const filteredLoans = useMemo(() => {
    const value = loanSearch
      .trim()
      .toLowerCase();

    if (!value) {
      return loans;
    }

    return loans.filter((loan) =>
      [
        loan.id,
        loan.customerName,
        loan.status,
      ].some((field) =>
        String(field || '')
          .toLowerCase()
          .includes(value)
      )
    );
  }, [loans, loanSearch]);

  if (loading) return <div role="status">Loading financer details…</div>;
  if (!financer) {
    return <div className="financer-details-page"><div className="financer-details-not-found"><div className="financer-not-found-icon"><Building2 size={28} /></div><h2>Financer not found</h2><p>The financer account you're looking for doesn't exist or is no longer available.</p><button type="button" onClick={() => navigate('/admin/financers')}><ArrowLeft size={16} />Back to Financers</button></div></div>;
  }

  /* =======================================================
     TABS
  ======================================================= */

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
    },
    {
      id: 'customers',
      label: 'Customers',
      count: totalCustomers,
    },
    {
      id: 'loans',
      label: 'Loans',
      count: activeLoans,
    },
    {
      id: 'transactions',
      label: 'Transactions',
    },
    {
      id: 'service',
      label: 'Service Charges',
    },
  ];

  return (
    <div className="financer-details-page">
      {pageError && <p role="alert">{pageError}</p>}

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="financer-details-breadcrumb">

        <button
          type="button"
          onClick={() =>
            navigate('/admin/financers')
          }
        >
          Financers
        </button>

        <ChevronRight size={14} />

        <span>{financer.name}</span>

      </div>

      {/* =================================================
          BACK BUTTON
      ================================================= */}

      <button
        type="button"
        className="financer-back-button"
        onClick={() =>
          navigate('/admin/financers')
        }
      >
        <ArrowLeft size={16} />
        Back to Financers
      </button>

      {/* =================================================
          PROFILE HEADER
      ================================================= */}

      <section className="financer-profile-header">

        <div className="financer-profile-main">

          <div className="financer-profile-avatar">
            <Building2 size={28} />
          </div>

          <div className="financer-profile-information">

            <div className="financer-profile-id">
              {financer.id}
            </div>

            <h1>
              {financer.name}
            </h1>

            <div className="financer-profile-meta">

              <span>
                <UserRound size={13} />
                {financer.owner || 'Owner not available'}
              </span>

              <span>
                <MapPin size={13} />
                {financer.city || 'Location not available'}
              </span>

            </div>

          </div>

        </div>

        <div className="financer-profile-statuses">

          <div className="financer-status-item">
            <span>KYC</span>

            <StatusBadge
              status={
                financer.kycStatus || 'Pending'
              }
            />
          </div>

          <div className="financer-status-item">
            <span>Account</span>

            <StatusBadge
              status={
                financer.status || 'Pending'
              }
            />
          </div>

        </div>

      </section>

      {/* =================================================
          FINANCIAL SUMMARY
      ================================================= */}

      <section className="financer-detail-kpi-grid">

        <DetailKpi
          icon={UsersRound}
          label="Total Customers"
          value={totalCustomers.toLocaleString('en-IN')}
        />

        <DetailKpi
          icon={CreditCard}
          label="Active Loans"
          value={activeLoans.toLocaleString('en-IN')}
        />

        <DetailKpi
          icon={IndianRupee}
          label="Total Principal"
          value={formatCurrency(totalPrincipal)}
        />

        <DetailKpi
          icon={TrendingUp}
          label="Total Interest"
          value={formatCurrency(totalInterest)}
        />

        <DetailKpi
          icon={WalletCards}
          label="This Month Interest"
          value={formatCurrency(monthlyInterest)}
        />

        <DetailKpi
          icon={Percent}
          label="Monthly Service Charge"
          value={formatCurrency(serviceCharge)}
          secondary={`${serviceChargePercentage}% applicable`}
          highlighted
        />

      </section>

      {/* =================================================
          TABS
      ================================================= */}

      <nav className="financer-detail-tabs">

        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={
              activeTab === tab.id
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveTab(tab.id)
            }
          >
            <span>{tab.label}</span>

            {tab.count !== undefined && (
              <small>
                {tab.count.toLocaleString('en-IN')}
              </small>
            )}
          </button>
        ))}

      </nav>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      {activeTab === 'overview' && (
        <section className="financer-detail-section">

          <SectionHeader
            title="Financer Overview"
            description="Institution information and account configuration."
          />

          <div className="financer-overview-grid">

            <InfoItem
              icon={Building2}
              label="Institution Name"
              value={financer.name}
            />

            <InfoItem
              icon={ReceiptText}
              label="Financer ID"
              value={financer.id}
            />

            <InfoItem
              icon={UserRound}
              label="Proprietor / Owner"
              value={financer.owner || '—'}
            />

            <InfoItem
              icon={MapPin}
              label="Location"
              value={financer.city || '—'}
            />

            <InfoItem
              icon={UsersRound}
              label="Registered Customers"
              value={totalCustomers.toLocaleString('en-IN')}
            />

            <InfoItem
              icon={CreditCard}
              label="Active Loans"
              value={activeLoans.toLocaleString('en-IN')}
            />

            <InfoItem
              icon={Percent}
              label="Service Charge Rate"
              value={`${serviceChargePercentage}%`}
            />

            <div className="financer-info-item">

              <div className="financer-info-icon">
                <CalendarDays size={17} />
              </div>

              <div>
                <span>Service Charge Status</span>

                <StatusBadge
                  status={
                    financer.serviceChargeStatus ||
                    'Pending'
                  }
                />
              </div>

            </div>

          </div>

          {/* FINANCIAL OVERVIEW */}

          <div className="financer-overview-financial">

            <div className="financer-overview-financial-header">
              <div>
                <h3>Financial Overview</h3>

                <p>
                  Current financial position of this financer.
                </p>
              </div>
            </div>

            <div className="financial-overview-grid">

              <FinancialMetric
                label="Total Principal"
                value={formatCurrency(totalPrincipal)}
              />

              <FinancialMetric
                label="Total Interest"
                value={formatCurrency(totalInterest)}
              />

              <FinancialMetric
                label="Current Month Interest"
                value={formatCurrency(monthlyInterest)}
              />

              <FinancialMetric
                label="Current Month Service Charge"
                value={formatCurrency(serviceCharge)}
                accent
              />

            </div>

          </div>

        </section>
      )}

      {/* =================================================
          CUSTOMERS
      ================================================= */}

      {activeTab === 'customers' && (
        <section className="financer-detail-section">

          <SectionHeader
            title="Customers"
            description={`Customers registered under ${financer.name}.`}
            count={`${totalCustomers.toLocaleString('en-IN')} Customers`}
          />

          <div className="detail-toolbar">

            <div className="detail-search">

              <Search size={16} />

              <input
                type="text"
                value={customerSearch}
                onChange={(event) =>
                  setCustomerSearch(
                    event.target.value
                  )
                }
                placeholder="Search customer..."
              />

            </div>

            <button
              type="button"
              className="detail-export-button"
            >
              <Download size={15} />
              Export
            </button>

          </div>

          {filteredCustomers.length > 0 ? (
            <CustomerTable
              customers={filteredCustomers}
            />
          ) : (
            <EmptyTab
              icon={UsersRound}
              title={
                customers.length === 0
                  ? 'Customer records not available'
                  : 'No customers found'
              }
              description={
                customers.length === 0
                  ? 'Individual customer records will appear here once the financer customer data is connected.'
                  : 'Try changing your search.'
              }
            />
          )}

        </section>
      )}

      {/* =================================================
          LOANS
      ================================================= */}

      {activeTab === 'loans' && (
        <section className="financer-detail-section">

          <SectionHeader
            title="Loans"
            description={`Loans issued through ${financer.name}.`}
            count={`${activeLoans.toLocaleString('en-IN')} Active`}
          />

          <div className="detail-toolbar">

            <div className="detail-search">

              <Search size={16} />

              <input
                type="text"
                value={loanSearch}
                onChange={(event) =>
                  setLoanSearch(
                    event.target.value
                  )
                }
                placeholder="Search loan ID, customer..."
              />

            </div>

            <button
              type="button"
              className="detail-export-button"
            >
              <Download size={15} />
              Export
            </button>

          </div>

          {filteredLoans.length > 0 ? (
            <LoanTable
              loans={filteredLoans}
            />
          ) : (
            <EmptyTab
              icon={CreditCard}
              title={
                loans.length === 0
                  ? 'Loan records not available'
                  : 'No loans found'
              }
              description={
                loans.length === 0
                  ? 'Individual loan records will appear here once the financer loan data is connected.'
                  : 'Try changing your search.'
              }
            />
          )}

        </section>
      )}

      {/* =================================================
          TRANSACTIONS
      ================================================= */}

      {activeTab === 'transactions' && (
        <section className="financer-detail-section">

          <SectionHeader
            title="Transactions"
            description="Financial activity related to this financer."
          />

          {transactions.length > 0 ? (
            <TransactionTable
              transactions={transactions}
            />
          ) : (
            <EmptyTab
              icon={ReceiptText}
              title="No transaction records available"
              description="Transaction activity for this financer will appear here."
            />
          )}

        </section>
      )}

      {/* =================================================
          SERVICE CHARGES
      ================================================= */}

      {activeTab === 'service' && (
        <section className="financer-detail-section">

          <SectionHeader
            title="Service Charges"
            description="INRFS service charge calculation for this financer."
          />

          <div className="service-charge-detail">

            <div className="service-charge-detail-main">

              <div className="service-charge-large-icon">
                <Percent size={25} />
              </div>

              <div>
                <span>
                  Applicable Service Charge
                </span>

                <strong>
                  {serviceChargePercentage}%
                </strong>

                <p>
                  Calculated on applicable customer
                  interest generated during the billing month.
                </p>
              </div>

            </div>

            <div className="service-charge-detail-amount">

              <span>
                Current Month Charge
              </span>

              <strong>
                {formatCurrency(serviceCharge)}
              </strong>

              <StatusBadge
                status={
                  financer.serviceChargeStatus ||
                  'Pending'
                }
              />

            </div>

          </div>

          <div className="service-charge-calculation">

            <div>
              <span>Calculation</span>

              <strong>
                {formatCurrency(monthlyInterest)}
                {' × '}
                {serviceChargePercentage}%
                {' = '}
                {formatCurrency(serviceCharge)}
              </strong>
            </div>

            <div>
              <span>Billing Period</span>

              <strong>
                Current Month
              </strong>
            </div>

          </div>

        </section>
      )}

    </div>
  );
}

/* =========================================================
   KPI COMPONENT
========================================================= */

function DetailKpi({
  icon: Icon,
  label,
  value,
  secondary,
  highlighted,
}) {
  return (
    <div
      className={`detail-kpi ${
        highlighted
          ? 'detail-kpi--highlighted'
          : ''
      }`}
    >
      <div className="detail-kpi-icon">
        <Icon size={19} />
      </div>

      <span>{label}</span>

      <strong>{value}</strong>

      {secondary && (
        <small>{secondary}</small>
      )}
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  description,
  count,
}) {
  return (
    <div className="financer-section-header">

      <div>
        <h2>{title}</h2>

        <p>{description}</p>
      </div>

      {count && (
        <strong>
          {count}
        </strong>
      )}

    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="financer-info-item">

      <div className="financer-info-icon">
        <Icon size={17} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

/* =========================================================
   FINANCIAL METRIC
========================================================= */

function FinancialMetric({
  label,
  value,
  accent,
}) {
  return (
    <div
      className={`financial-metric ${
        accent
          ? 'financial-metric--accent'
          : ''
      }`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================================================
   CUSTOMER TABLE
========================================================= */

function CustomerTable({
  customers,
}) {
  return (
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
            <th></th>
          </tr>
        </thead>

        <tbody>

          {customers.map((customer) => (
            <tr key={customer.id}>

              <td>
                <div className="detail-person">

                  <div className="detail-person-avatar">
                    {getInitials(
                      customer.name
                    )}
                  </div>

                  <strong>
                    {customer.name || '—'}
                  </strong>

                </div>
              </td>

              <td>
                {customer.id || '—'}
              </td>

              <td>
                {customer.phone || '—'}
              </td>

              <td>
                {getNumber(
                  customer.activeLoans
                )}
              </td>

              <td className="detail-money">
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

              <td className="detail-row-arrow">
                <ChevronRight size={16} />
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   LOAN TABLE
========================================================= */

function LoanTable({
  loans,
}) {
  return (
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
            <th></th>
          </tr>
        </thead>

        <tbody>

          {loans.map((loan) => (
            <tr key={loan.id}>

              <td>
                <strong className="detail-loan-id">
                  {loan.id || '—'}
                </strong>
              </td>

              <td>
                {loan.customerName || loan.customer || '—'}
              </td>

              <td className="detail-money">
                {formatCurrency(
                  getNumber(
                    loan.principal
                  )
                )}
              </td>

              <td className="detail-money">
                {formatCurrency(
                  getNumber(
                    loan.interest
                  )
                )}
              </td>

              <td className="detail-money">
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

              <td className="detail-row-arrow">
                <ChevronRight size={16} />
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

/* =========================================================
   TRANSACTION TABLE
========================================================= */

function TransactionTable({
  transactions,
}) {
  return (
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

          {transactions.map(
            (transaction) => (
              <tr key={transaction.id}>

                <td>
                  <strong>
                    {transaction.id || '—'}
                  </strong>
                </td>

                <td>
                  {transaction.date || '—'}
                </td>

                <td>
                  {transaction.type || '—'}
                </td>

                <td className="detail-money">
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
  );
}

/* =========================================================
   EMPTY TAB
========================================================= */

function EmptyTab({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="financer-detail-empty">

      <div className="financer-detail-empty-icon">
        <Icon size={27} />
      </div>

      <strong>{title}</strong>

      <span>{description}</span>

    </div>
  );
}
