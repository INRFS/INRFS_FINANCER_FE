import React, { useEffect, useMemo, useState } from 'react';
import {
  Percent,
  Settings2,
  Building2,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Pencil,
  Plus,
  Search,
  Save,
  X,
  Info,
} from 'lucide-react';

import { platformApi, pageItems } from '../../../common/services/platformApi';
const serviceChargeConfiguration = null;
const financerServiceCharges = [];

import './AdminServiceCharges.css';

const INRFS_DEFAULT_CHARGE =
  Number(
    serviceChargeConfiguration?.defaultPercentage
  ) || 1;

const INITIAL_FINANCER_CHARGES =
  Array.isArray(financerServiceCharges)
    ? financerServiceCharges
    : [];

const formatPercentage = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '0.00%';
  }

  return `${number.toFixed(2)}%`;
};

const formatDate = (value) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function AdminServiceCharges() {
  const [defaultPercentage, setDefaultPercentage] =
    useState(INRFS_DEFAULT_CHARGE);

  const [defaultEffectiveDate, setDefaultEffectiveDate] =
    useState(
      serviceChargeConfiguration?.effectiveDate ||
        '2026-08-01'
    );

  const [defaultStatus, setDefaultStatus] =
    useState(
      serviceChargeConfiguration?.status || 'Active'
    );

  const [charges, setCharges] = useState(
    INITIAL_FINANCER_CHARGES
  );
  const [pageError, setPageError] = useState('');
  useEffect(() => {
    Promise.all([platformApi.admin.allFinancers(), platformApi.settings.list('Platform')]).then(async ([financerPayload, settings]) => {
      const defaultSetting = (Array.isArray(settings) ? settings : []).find((item) => item.key === 'ServiceChargePercentage');
      if (defaultSetting) setDefaultPercentage(Number(defaultSetting.value));
      const financerItems = pageItems(financerPayload);
      const overrides = await Promise.all(financerItems.map((item) => platformApi.settings.list(`Financer:${item.id}`).catch(() => [])));
      setCharges(financerItems.map((item, index) => {
        const override = (Array.isArray(overrides[index]) ? overrides[index] : []).find((setting) => setting.key === 'ServiceChargePercentage');
        return { financerId: item.id, financerName: item.displayName, serviceChargePercentage: override ? Number(override.value) : item.serviceChargePercentage ?? Number(defaultSetting?.value || 1), effectiveDate: item.createdAt, status: item.status };
      }));
    }).catch((error) => setPageError(error.message));
  }, []);

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] =
    useState('All');

  const [isDefaultEditing, setIsDefaultEditing] =
    useState(false);

  const [isFinancerModalOpen, setIsFinancerModalOpen] =
    useState(false);

  const [editingFinancer, setEditingFinancer] =
    useState(null);

  const [form, setForm] = useState({
    financerId: '',
    financerName: '',
    serviceChargePercentage:
      INRFS_DEFAULT_CHARGE,
    effectiveDate: '2026-08-01',
    status: 'Active',
  });

  const [message, setMessage] = useState('');

  /* =====================================================
     SUMMARY
  ====================================================== */

  const summary = useMemo(() => {
    const activeCount =
      charges.filter(
        (item) => item.status === 'Active'
      ).length;

    const inactiveCount =
      charges.filter(
        (item) => item.status === 'Inactive'
      ).length;

    const averagePercentage =
      charges.length > 0
        ? charges.reduce(
            (total, item) =>
              total +
              Number(
                item.serviceChargePercentage || 0
              ),
            0
          ) / charges.length
        : 0;

    return {
      totalFinancers: charges.length,
      activeCount,
      inactiveCount,
      averagePercentage,
    };
  }, [charges]);

  /* =====================================================
     FILTER
  ====================================================== */

  const filteredCharges = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return charges.filter((item) => {
      const matchesSearch =
        !searchValue ||
        item.financerName
          ?.toLowerCase()
          .includes(searchValue) ||
        item.financerId
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === 'All' ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    charges,
    search,
    statusFilter,
  ]);

  /* =====================================================
     DEFAULT CONFIGURATION
  ====================================================== */

  const handleSaveDefault = async () => {
    const percentage =
      Number(defaultPercentage);

    if (
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      setMessage(
        'Please enter a service charge between 0% and 100%.'
      );
      return;
    }

    try { await platformApi.settings.save('Platform', 'ServiceChargePercentage', { value: String(percentage), valueType: 'number', description: 'Default platform service charge percentage', isSecret: false, expectedVersion: null }); }
    catch (error) { setPageError(error.message); return; }
    setIsDefaultEditing(false);

    setMessage(
      'Default service charge configuration saved successfully.'
    );

    window.setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  /* =====================================================
     OPEN ADD MODAL
  ====================================================== */

  const handleAddFinancerCharge = () => {
    setEditingFinancer(null);

    setForm({
      financerId: '',
      financerName: '',
      serviceChargePercentage:
        defaultPercentage,
      effectiveDate:
        defaultEffectiveDate ||
        '2026-08-01',
      status: 'Active',
    });

    setIsFinancerModalOpen(true);
  };

  /* =====================================================
     OPEN EDIT MODAL
  ====================================================== */

  const handleEditFinancer = (financer) => {
    setEditingFinancer(financer);

    setForm({
      financerId:
        financer.financerId || '',
      financerName:
        financer.financerName || '',
      serviceChargePercentage:
        financer.serviceChargePercentage ??
        defaultPercentage,
      effectiveDate:
        financer.effectiveDate ||
        defaultEffectiveDate ||
        '2026-08-01',
      status:
        financer.status || 'Active',
    });

    setIsFinancerModalOpen(true);
  };

  /* =====================================================
     CLOSE MODAL
  ====================================================== */

  const handleCloseModal = () => {
    setIsFinancerModalOpen(false);
    setEditingFinancer(null);
  };

  /* =====================================================
     SAVE FINANCER CHARGE
  ====================================================== */

  const handleSaveFinancerCharge = async (event) => {
    event.preventDefault();

    const percentage =
      Number(
        form.serviceChargePercentage
      );

    if (
      !form.financerName.trim()
    ) {
      setMessage(
        'Financer name is required.'
      );
      return;
    }

    if (
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      setMessage(
        'Please enter a service charge between 0% and 100%.'
      );
      return;
    }

    try { await platformApi.settings.save(`Financer:${form.financerId}`, 'ServiceChargePercentage', { value: String(percentage), valueType: 'number', description: 'Financer service charge override', isSecret: false, expectedVersion: null }); }
    catch (error) { setPageError(error.message); return; }
    if (editingFinancer) {
      setCharges((current) =>
        current.map((item) =>
          item.financerId ===
          editingFinancer.financerId
            ? {
                ...item,
                financerName:
                  form.financerName.trim(),
                serviceChargePercentage:
                  percentage,
                effectiveDate:
                  form.effectiveDate,
                status:
                  form.status,
              }
            : item
        )
      );

      setMessage(
        'Financer service charge updated successfully.'
      );
    } else {
      const newId =
        form.financerId.trim() ||
        `FIN-${Date.now()}`;

      setCharges((current) => [
        {
          financerId: newId,
          financerName:
            form.financerName.trim(),
          serviceChargePercentage:
            percentage,
          effectiveDate:
            form.effectiveDate,
          status:
            form.status,
        },
        ...current,
      ]);

      setMessage(
        'Financer service charge added successfully.'
      );
    }

    handleCloseModal();

    window.setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  /* =====================================================
     TOGGLE STATUS
  ====================================================== */

  const handleToggleStatus = (financerId) => {
    setCharges((current) =>
      current.map((item) =>
        item.financerId === financerId
          ? {
              ...item,
              status:
                item.status === 'Active'
                  ? 'Inactive'
                  : 'Active',
            }
          : item
      )
    );

    setMessage(
      'Service charge status updated successfully.'
    );

    window.setTimeout(() => {
      setMessage('');
    }, 2500);
  };

  return (
    <main className="inrfs-service-charge-page">
      {pageError && <p role="alert">{pageError}</p>}

      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <header className="inrfs-service-charge-header">

        <div className="inrfs-service-charge-header-copy">

          <div className="inrfs-service-charge-title-icon">
            <Percent size={22} />
          </div>

          <div>

            <h1>
              Service Charge Management
            </h1>

            <p>
              Configure INRFS service charges for
              the platform and individual financers.
            </p>

          </div>

        </div>

        <button
          type="button"
          className="inrfs-service-charge-primary-btn"
          onClick={
            handleAddFinancerCharge
          }
        >
          <Plus size={17} />
          Add Financer Charge
        </button>

      </header>

      {/* =================================================
          FEEDBACK
      ================================================== */}

      {message && (
        <div className="inrfs-service-charge-toast">

          <CheckCircle2 size={17} />

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() =>
              setMessage('')
            }
            aria-label="Close notification"
          >
            <X size={15} />
          </button>

        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================== */}

      <section className="inrfs-service-charge-summary">

        <article className="inrfs-service-charge-summary-card">

          <div className="inrfs-service-charge-summary-icon inrfs-service-charge-summary-icon--blue">
            <Building2 size={19} />
          </div>

          <div>
            <span>
              FINANCERS WITH CONFIGURATION
            </span>

            <strong>
              {summary.totalFinancers}
            </strong>
          </div>

        </article>

        <article className="inrfs-service-charge-summary-card">

          <div className="inrfs-service-charge-summary-icon inrfs-service-charge-summary-icon--green">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>
              ACTIVE CONFIGURATIONS
            </span>

            <strong>
              {summary.activeCount}
            </strong>
          </div>

        </article>

        <article className="inrfs-service-charge-summary-card">

          <div className="inrfs-service-charge-summary-icon inrfs-service-charge-summary-icon--orange">
            <XCircle size={19} />
          </div>

          <div>
            <span>
              INACTIVE CONFIGURATIONS
            </span>

            <strong>
              {summary.inactiveCount}
            </strong>
          </div>

        </article>

        <article className="inrfs-service-charge-summary-card">

          <div className="inrfs-service-charge-summary-icon inrfs-service-charge-summary-icon--purple">
            <Percent size={19} />
          </div>

          <div>
            <span>
              AVERAGE FINANCER CHARGE
            </span>

            <strong>
              {formatPercentage(
                summary.averagePercentage
              )}
            </strong>
          </div>

        </article>

      </section>

      {/* =================================================
          DEFAULT PLATFORM CONFIGURATION
      ================================================== */}

      <section className="inrfs-service-charge-default-card">

        <div className="inrfs-service-charge-default-heading">

          <div className="inrfs-service-charge-default-icon">
            <Settings2 size={20} />
          </div>

          <div>

            <h2>
              Default Service Charge
            </h2>

            <p>
              This percentage applies when a financer
              does not have a specific service-charge
              configuration.
            </p>

          </div>

        </div>

        <div className="inrfs-service-charge-default-grid">

          <div className="inrfs-service-charge-field">

            <label>
              Default Service Charge %
            </label>

            {isDefaultEditing ? (

              <div className="inrfs-service-charge-input-wrap">

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={defaultPercentage}
                  onChange={(event) =>
                    setDefaultPercentage(
                      event.target.value
                    )
                  }
                />

                <span>
                  %
                </span>

              </div>

            ) : (

              <div className="inrfs-service-charge-large-value">
                {formatPercentage(
                  defaultPercentage
                )}
              </div>

            )}

          </div>

          <div className="inrfs-service-charge-field">

            <label>
              Effective Date
            </label>

            {isDefaultEditing ? (

              <input
                type="date"
                className="inrfs-service-charge-date-input"
                value={
                  defaultEffectiveDate
                }
                onChange={(event) =>
                  setDefaultEffectiveDate(
                    event.target.value
                  )
                }
              />

            ) : (

              <div className="inrfs-service-charge-date-display">

                <CalendarDays
                  size={17}
                />

                <span>
                  {formatDate(
                    defaultEffectiveDate
                  )}
                </span>

              </div>

            )}

          </div>

          <div className="inrfs-service-charge-field">

            <label>
              Status
            </label>

            {isDefaultEditing ? (

              <select
                className="inrfs-service-charge-select"
                value={defaultStatus}
                onChange={(event) =>
                  setDefaultStatus(
                    event.target.value
                  )
                }
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            ) : (

              <span
                className={`inrfs-service-charge-status-badge ${
                  defaultStatus ===
                  'Active'
                    ? 'is-active'
                    : 'is-inactive'
                }`}
              >

                {defaultStatus ===
                'Active' ? (
                  <CheckCircle2
                    size={14}
                  />
                ) : (
                  <XCircle
                    size={14}
                  />
                )}

                {defaultStatus}

              </span>

            )}

          </div>

          <div className="inrfs-service-charge-default-actions">

            {isDefaultEditing ? (

              <>

                <button
                  type="button"
                  className="inrfs-service-charge-secondary-btn"
                  onClick={() =>
                    setIsDefaultEditing(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="inrfs-service-charge-save-btn"
                  onClick={
                    handleSaveDefault
                  }
                >
                  <Save size={15} />
                  Save Changes
                </button>

              </>

            ) : (

              <button
                type="button"
                className="inrfs-service-charge-edit-btn"
                onClick={() =>
                  setIsDefaultEditing(
                    true
                  )
                }
              >
                <Pencil size={15} />
                Edit Default
              </button>

            )}

          </div>

        </div>

      </section>

      {/* =================================================
          INFORMATION
      ================================================== */}

      <div className="inrfs-service-charge-info">

        <Info size={17} />

        <span>
          Service charges are calculated from the
          applicable customer interest for the billing
          month. A financer-specific percentage takes
          priority over the default platform percentage.
        </span>

      </div>

      {/* =================================================
          FINANCER CONFIGURATION
      ================================================== */}

      <section className="inrfs-service-charge-financer-card">

        <div className="inrfs-service-charge-financer-header">

          <div>

            <h2>
              Financer-Specific Service Charges
            </h2>

            <p>
              Configure individual service-charge
              percentages and effective dates.
            </p>

          </div>

          <button
            type="button"
            className="inrfs-service-charge-add-btn"
            onClick={
              handleAddFinancerCharge
            }
          >
            <Plus size={16} />
            Add Configuration
          </button>

        </div>

        {/* =================================================
            FILTER BAR
        ================================================== */}

        <div className="inrfs-service-charge-filter-bar">

          <div className="inrfs-service-charge-search">

            <Search size={16} />

            <input
              type="text"
              placeholder="Search financer..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch('')
                }
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}

          </div>

          <select
            className="inrfs-service-charge-filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >

            <option value="All">
              All Statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>

          </select>

          <span className="inrfs-service-charge-results">
            Showing{' '}
            <strong>
              {filteredCharges.length}
            </strong>{' '}
            of{' '}
            <strong>
              {charges.length}
            </strong>
          </span>

        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================== */}

        <div className="inrfs-service-charge-table-wrap">

          <table className="inrfs-service-charge-table">

            <thead>

              <tr>

                <th>
                  FINANCER
                </th>

                <th>
                  SERVICE CHARGE
                </th>

                <th>
                  EFFECTIVE DATE
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  ACTIONS
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredCharges.length > 0 ? (

                filteredCharges.map(
                  (item) => (
                    <tr
                      key={
                        item.financerId
                      }
                    >

                      <td>

                        <div className="inrfs-service-charge-financer-cell">

                          <div className="inrfs-service-charge-financer-avatar">
                            <Building2
                              size={17}
                            />
                          </div>

                          <div>

                            <strong>
                              {
                                item.financerName
                              }
                            </strong>

                            <span>
                              {
                                item.financerId
                              }
                            </span>

                          </div>

                        </div>

                      </td>

                      <td>

                        <div className="inrfs-service-charge-percentage-cell">

                          <strong>
                            {formatPercentage(
                              item.serviceChargePercentage
                            )}
                          </strong>

                          <span>
                            Applicable service charge
                          </span>

                        </div>

                      </td>

                      <td>

                        <div className="inrfs-service-charge-effective-cell">

                          <CalendarDays
                            size={15}
                          />

                          <span>
                            {formatDate(
                              item.effectiveDate
                            )}
                          </span>

                        </div>

                      </td>

                      <td>

                        <span
                          className={`inrfs-service-charge-status-badge ${
                            item.status ===
                            'Active'
                              ? 'is-active'
                              : 'is-inactive'
                          }`}
                        >

                          {item.status ===
                          'Active' ? (
                            <CheckCircle2
                              size={14}
                            />
                          ) : (
                            <XCircle
                              size={14}
                            />
                          )}

                          {item.status}

                        </span>

                      </td>

                      <td>

                        <div className="inrfs-service-charge-row-actions">

                          <button
                            type="button"
                            className="inrfs-service-charge-row-edit"
                            onClick={() =>
                              handleEditFinancer(
                                item
                              )
                            }
                            title="Edit service charge"
                          >
                            <Pencil
                              size={15}
                            />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="inrfs-service-charge-row-toggle"
                            onClick={() =>
                              handleToggleStatus(
                                item.financerId
                              )
                            }
                            title={
                              item.status ===
                              'Active'
                                ? 'Deactivate'
                                : 'Activate'
                            }
                          >
                            {item.status ===
                            'Active'
                              ? 'Deactivate'
                              : 'Activate'}
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="inrfs-service-charge-empty"
                  >

                    <Percent
                      size={30}
                    />

                    <strong>
                      No configurations found
                    </strong>

                    <span>
                      Try changing your search
                      or status filter.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            MOBILE CARDS
        ================================================== */}

        <div className="inrfs-service-charge-mobile-list">

          {filteredCharges.length > 0 ? (

            filteredCharges.map(
              (item) => (
                <article
                  key={
                    item.financerId
                  }
                  className="inrfs-service-charge-mobile-card"
                >

                  <div className="inrfs-service-charge-mobile-top">

                    <div className="inrfs-service-charge-financer-cell">

                      <div className="inrfs-service-charge-financer-avatar">
                        <Building2
                          size={17}
                        />
                      </div>

                      <div>

                        <strong>
                          {
                            item.financerName
                          }
                        </strong>

                        <span>
                          {
                            item.financerId
                          }
                        </span>

                      </div>

                    </div>

                    <span
                      className={`inrfs-service-charge-status-badge ${
                        item.status ===
                        'Active'
                          ? 'is-active'
                          : 'is-inactive'
                      }`}
                    >
                      {item.status}
                    </span>

                  </div>

                  <div className="inrfs-service-charge-mobile-grid">

                    <div>

                      <span>
                        Service Charge
                      </span>

                      <strong>
                        {formatPercentage(
                          item.serviceChargePercentage
                        )}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Effective Date
                      </span>

                      <strong>
                        {formatDate(
                          item.effectiveDate
                        )}
                      </strong>

                    </div>

                  </div>

                  <div className="inrfs-service-charge-mobile-actions">

                    <button
                      type="button"
                      className="inrfs-service-charge-row-edit"
                      onClick={() =>
                        handleEditFinancer(
                          item
                        )
                      }
                    >
                      <Pencil
                        size={15}
                      />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="inrfs-service-charge-row-toggle"
                      onClick={() =>
                        handleToggleStatus(
                          item.financerId
                        )
                      }
                    >
                      {item.status ===
                      'Active'
                        ? 'Deactivate'
                        : 'Activate'}
                    </button>

                  </div>

                </article>
              )
            )

          ) : (

            <div className="inrfs-service-charge-mobile-empty">

              <Percent size={30} />

              <strong>
                No configurations found
              </strong>

              <span>
                Try changing your filters.
              </span>

            </div>

          )}

        </div>

      </section>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================== */}

      {isFinancerModalOpen && (

        <div
          className="inrfs-service-charge-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseModal();
            }
          }}
        >

          <div className="inrfs-service-charge-modal">

            <div className="inrfs-service-charge-modal-header">

              <div>

                <h2>
                  {editingFinancer
                    ? 'Edit Service Charge'
                    : 'Add Service Charge'}
                </h2>

                <p>
                  Configure the service charge for
                  this financer.
                </p>

              </div>

              <button
                type="button"
                className="inrfs-service-charge-modal-close"
                onClick={
                  handleCloseModal
                }
                aria-label="Close modal"
              >
                <X size={18} />
              </button>

            </div>

            <form
              className="inrfs-service-charge-modal-form"
              onSubmit={
                handleSaveFinancerCharge
              }
            >

              <div className="inrfs-service-charge-modal-field">

                <label>
                  Financer ID
                </label>

                <input
                  type="text"
                  placeholder="e.g. FIN-1009"
                  value={
                    form.financerId
                  }
                  disabled={
                    Boolean(
                      editingFinancer
                    )
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      financerId:
                        event.target.value,
                    })
                  }
                />

              </div>

              <div className="inrfs-service-charge-modal-field">

                <label>
                  Financer Name
                </label>

                <input
                  type="text"
                  placeholder="Enter financer name"
                  value={
                    form.financerName
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      financerName:
                        event.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="inrfs-service-charge-modal-two-column">

                <div className="inrfs-service-charge-modal-field">

                  <label>
                    Service Charge %
                  </label>

                  <div className="inrfs-service-charge-modal-percentage">

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={
                        form.serviceChargePercentage
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          serviceChargePercentage:
                            event.target.value,
                        })
                      }
                      required
                    />

                    <span>
                      %
                    </span>

                  </div>

                </div>

                <div className="inrfs-service-charge-modal-field">

                  <label>
                    Effective Date
                  </label>

                  <input
                    type="date"
                    value={
                      form.effectiveDate
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        effectiveDate:
                          event.target.value,
                      })
                    }
                    required
                  />

                </div>

              </div>

              <div className="inrfs-service-charge-modal-field">

                <label>
                  Status
                </label>

                <select
                  value={
                    form.status
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status:
                        event.target.value,
                    })
                  }
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </div>

              <div className="inrfs-service-charge-modal-actions">

                <button
                  type="button"
                  className="inrfs-service-charge-secondary-btn"
                  onClick={
                    handleCloseModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inrfs-service-charge-save-btn"
                >

                  <Save size={15} />

                  {editingFinancer
                    ? 'Save Changes'
                    : 'Add Configuration'}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}
