import React, { useMemo, useState } from 'react';

import {
  UserPlus,
  Users,
  Search,
  MoreVertical,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  X,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  UserRound,
  UserRoundPen,
  UserRoundX,
  UserRoundCheck,
  Trash2,
  Eye,
  Clock3,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';

import './AdminManagement.css';

/* =========================================================
   INITIAL ADMIN DATA

   Replace this with API data later.
========================================================= */

const initialAdmins = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@inrfs.com',
    phone: '9876543210',
    city: 'Hyderabad',
    state: 'Telangana',
    status: 'Active',
    lastActive: 'Today, 10:42 AM',
    lastLoginDate: new Date(),
  },
  {
    id: 2,
    name: 'Mani',
    email: 'y21@gmail.com',
    phone: '9769585484',
    city: 'Guntur',
    state: 'Andhra Pradesh',
    status: 'Active',
    lastActive: '2 days ago',
    lastLoginDate: new Date(
      Date.now() - 2 * 24 * 60 * 60 * 1000
    ),
  },
];

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminManagement() {
  /* =======================================================
     ADMIN DATA
  ======================================================== */

  const [admins, setAdmins] = useState(initialAdmins);

  /* =======================================================
     PAGE STATE
  ======================================================== */

  const [showAddForm, setShowAddForm] = useState(false);

  const [search, setSearch] = useState('');

  const [openMenuId, setOpenMenuId] = useState(null);

  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [showStatusModal, setShowStatusModal] =
    useState(false);

  const [showDetailsModal, setShowDetailsModal] =
    useState(false);

  /* =======================================================
     ADD ADMIN / OTP STATE
  ======================================================== */

  const [showOtpModal, setShowOtpModal] = useState(false);

  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const [otp, setOtp] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: '',
  });

  /* =======================================================
     FORM CHANGE
  ======================================================== */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =======================================================
     SEND OTP
  ======================================================== */

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      formData.phone.length !== 10 ||
      !formData.state ||
      !formData.city.trim()
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * BACKEND:
       *
       * await axios.post('/api/admin/send-otp', {
       *   name: formData.name,
       *   email: formData.email,
       *   phone: formData.phone,
       *   state: formData.state,
       *   city: formData.city,
       * });
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      setShowOtpModal(true);
    } catch (error) {
      console.error(
        'Failed to send OTP:',
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================================================
     OTP CHANGE
  ======================================================== */

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const updatedOtp = [...otp];

    updatedOtp[index] = value;

    setOtp(updatedOtp);

    if (
      value &&
      index < updatedOtp.length - 1
    ) {
      document
        .getElementById(
          `admin-otp-${index + 1}`
        )
        ?.focus();
    }
  };

  /* =======================================================
     OTP KEYBOARD
  ======================================================== */

  const handleOtpKeyDown = (e, index) => {
    if (
      e.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      document
        .getElementById(
          `admin-otp-${index - 1}`
        )
        ?.focus();
    }
  };

  /* =======================================================
     VERIFY OTP
  ======================================================== */

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * BACKEND:
       *
       * await axios.post('/api/admin/verify-otp', {
       *   phone: formData.phone,
       *   otp: enteredOtp,
       * });
       *
       * await axios.post('/api/admin/create', formData);
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 900)
      );

      const newAdmin = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        status: 'Active',
        lastActive: 'Just now',
        lastLoginDate: new Date(),
      };

      setAdmins((prev) => [
        ...prev,
        newAdmin,
      ]);

      setShowOtpModal(false);
      setShowSuccessModal(true);

      setOtp([
        '',
        '',
        '',
        '',
        '',
        '',
      ]);
    } catch (error) {
      console.error(
        'OTP verification failed:',
        error
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================================================
     RESEND OTP
  ======================================================== */

  const handleResendOtp = () => {
    setOtp([
      '',
      '',
      '',
      '',
      '',
      '',
    ]);

    /*
     * BACKEND:
     *
     * await axios.post('/api/admin/send-otp', {
     *   phone: formData.phone,
     * });
     */
  };

  /* =======================================================
     CLOSE ADD FORM
  ======================================================== */

  const handleCloseForm = () => {
    setShowAddForm(false);

    setFormData({
      name: '',
      email: '',
      phone: '',
      state: '',
      city: '',
    });

    setOtp([
      '',
      '',
      '',
      '',
      '',
      '',
    ]);
  };

  /* =======================================================
     MENU
  ======================================================== */

  const handleMenuToggle = (id) => {
    setOpenMenuId((current) =>
      current === id ? null : id
    );
  };

  /* =======================================================
     VIEW DETAILS
  ======================================================== */

  const handleViewDetails = (admin) => {
    setSelectedAdmin(admin);
    setShowDetailsModal(true);
    setOpenMenuId(null);
  };

  /* =======================================================
     DELETE
  ======================================================== */

  const handleDeleteClick = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const handleDeleteAdmin = () => {
    if (!selectedAdmin) {
      return;
    }

    setAdmins((prev) =>
      prev.filter(
        (admin) =>
          admin.id !== selectedAdmin.id
      )
    );

    setShowDeleteModal(false);
    setSelectedAdmin(null);
  };

  /* =======================================================
     STATUS
  ======================================================== */

  const handleStatusClick = (admin) => {
    setSelectedAdmin(admin);
    setShowStatusModal(true);
    setOpenMenuId(null);
  };

  const handleStatusChange = () => {
    if (!selectedAdmin) {
      return;
    }

    setAdmins((prev) =>
      prev.map((admin) => {
        if (
          admin.id !== selectedAdmin.id
        ) {
          return admin;
        }

        const becomingInactive =
          admin.status === 'Active';

        return {
          ...admin,
          status: becomingInactive
            ? 'Inactive'
            : 'Active',
          lastActive:
            becomingInactive
              ? admin.lastActive
              : 'Just now',
        };
      })
    );

    setShowStatusModal(false);
    setSelectedAdmin(null);
  };

  /* =======================================================
     SEARCH
  ======================================================== */

  const filteredAdmins = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return admins;
    }

    return admins.filter((admin) =>
      [
        admin.name,
        admin.email,
        admin.phone,
        admin.city,
        admin.state,
        admin.status,
      ].some((value) =>
        value
          .toLowerCase()
          .includes(query)
      )
    );
  }, [admins, search]);

  /* =======================================================
     STATISTICS
  ======================================================== */

  const activeAdmins = admins.filter(
    (admin) =>
      admin.status === 'Active'
  ).length;

  const inactiveAdmins = admins.filter(
    (admin) =>
      admin.status === 'Inactive'
  ).length;

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <div className="admin-management-page">

      {/* ===================================================
          PAGE HEADER
      ==================================================== */}

      <header className="admin-management-header">

        <div className="admin-management-heading">

          <div className="admin-management-title-row">

            <div className="admin-management-title-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h1>
                Admin Management
              </h1>

              <p>
                Manage administrator accounts,
                access and activity.
              </p>
            </div>

          </div>

        </div>

        {!showAddForm && (
          <button
            type="button"
            className="admin-primary-button"
            onClick={() =>
              setShowAddForm(true)
            }
          >
            <UserPlus size={18} />
            Add New Admin
          </button>
        )}

      </header>

      {/* ===================================================
          ADD ADMIN FORM
      ==================================================== */}

      {showAddForm ? (
        <div className="admin-form-section">

          <div className="admin-form-header">

            <button
              type="button"
              className="admin-back-button"
              onClick={handleCloseForm}
            >
              <ArrowLeft size={17} />
              Back to Admins
            </button>

            <h2>
              Create Administrator
            </h2>

            <p>
              Enter the administrator's
              details and verify their
              phone number.
            </p>

          </div>

          <form
            className="admin-form-card"
            onSubmit={handleSendOtp}
          >

            {/* PERSONAL */}

            <div className="admin-form-section-title">

              <div className="admin-section-icon">
                <UserRound size={18} />
              </div>

              <div>
                <h3>
                  Personal Information
                </h3>

                <p>
                  Basic information for
                  the administrator.
                </p>
              </div>

            </div>

            <div className="admin-form-grid">

              {/* NAME */}

              <div className="admin-form-group admin-full-width">

                <label htmlFor="name">
                  Full Name
                  <span>*</span>
                </label>

                <div className="admin-input-wrapper">

                  <UserRound size={17} />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="admin-form-group">

                <label htmlFor="email">
                  Email Address
                  <span>*</span>
                </label>

                <div className="admin-input-wrapper">

                  <Mail size={17} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                </div>

                <small>
                  Account setup details
                  will be sent here.
                </small>

              </div>

              {/* PHONE */}

              <div className="admin-form-group">

                <label htmlFor="phone">
                  Phone Number
                  <span>*</span>
                </label>

                <div className="admin-input-wrapper phone-input">

                  <span className="country-code">
                    +91
                  </span>

                  <Phone size={17} />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      const value =
                        e.target.value.replace(
                          /\D/g,
                          ''
                        );

                      setFormData((prev) => ({
                        ...prev,
                        phone: value,
                      }));
                    }}
                    autoComplete="tel"
                    required
                  />

                </div>

                <small>
                  OTP will be sent to
                  this number.
                </small>

              </div>

            </div>

            {/* LOCATION */}

            <div className="admin-form-section-title location-title">

              <div className="admin-section-icon">
                <MapPin size={18} />
              </div>

              <div>
                <h3>
                  Location
                </h3>

                <p>
                  Administrator's
                  registered location.
                </p>
              </div>

            </div>

            <div className="admin-form-grid">

              <div className="admin-form-group">

                <label htmlFor="state">
                  State
                  <span>*</span>
                </label>

                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select State
                  </option>

                  <option value="Andhra Pradesh">
                    Andhra Pradesh
                  </option>

                  <option value="Telangana">
                    Telangana
                  </option>

                  <option value="Karnataka">
                    Karnataka
                  </option>

                  <option value="Tamil Nadu">
                    Tamil Nadu
                  </option>

                  <option value="Maharashtra">
                    Maharashtra
                  </option>

                  <option value="Kerala">
                    Kerala
                  </option>

                  <option value="Delhi">
                    Delhi
                  </option>
                </select>

              </div>

              <div className="admin-form-group">

                <label htmlFor="city">
                  City
                  <span>*</span>
                </label>

                <div className="admin-input-wrapper">

                  <MapPin size={17} />

                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

            </div>

            {/* SECURITY */}

            <div className="admin-security-note">

              <div className="admin-security-icon">
                <ShieldCheck size={20} />
              </div>

              <div>
                <strong>
                  Secure account creation
                </strong>

                <p>
                  The phone number will be
                  verified using OTP. After
                  successful verification,
                  the administrator account
                  will be created and account
                  setup instructions will be
                  sent to the registered email.
                </p>
              </div>

            </div>

            {/* ACTIONS */}

            <div className="admin-form-actions">

              <button
                type="button"
                className="admin-secondary-button"
                onClick={handleCloseForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-primary-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw
                      size={17}
                      className="admin-spin"
                    />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Phone size={17} />
                    Continue with OTP
                  </>
                )}
              </button>

            </div>

          </form>

        </div>
      ) : (
        <>
          {/* =================================================
              STATISTICS
          ================================================== */}

          <section className="admin-stat-grid">

            <div className="admin-stat-card">

              <div className="admin-stat-icon blue">
                <Users size={20} />
              </div>

              <div>
                <span>
                  Total Administrators
                </span>

                <strong>
                  {admins.length}
                </strong>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon green">
                <UserRoundCheck size={20} />
              </div>

              <div>
                <span>
                  Active
                </span>

                <strong>
                  {activeAdmins}
                </strong>
              </div>

            </div>

            <div className="admin-stat-card">

              <div className="admin-stat-icon gray">
                <UserRoundX size={20} />
              </div>

              <div>
                <span>
                  Inactive
                </span>

                <strong>
                  {inactiveAdmins}
                </strong>
              </div>

            </div>

          </section>

          {/* =================================================
              ADMIN LIST
          ================================================== */}

          <section className="admin-list-card">

            <div className="admin-list-header">

              <div>
                <h2>
                  Administrators
                </h2>

                <p>
                  Review accounts, activity
                  and access status.
                </p>
              </div>

              <div className="admin-search">

                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search by name, email or location"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />

                {search && (
                  <button
                    type="button"
                    className="admin-search-clear"
                    onClick={() =>
                      setSearch('')
                    }
                  >
                    <X size={14} />
                  </button>
                )}

              </div>

            </div>

            {/* DESKTOP TABLE */}

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>
                      Administrator
                    </th>

                    <th>
                      Contact
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Last Active
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="action-column">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map(
                      (admin) => (
                        <tr key={admin.id}>

                          {/* ADMIN */}

                          <td>

                            <div className="admin-person">

                              <div className="admin-avatar">
                                {admin.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {admin.name}
                                </strong>

                                <span>
                                  Administrator
                                </span>
                              </div>

                            </div>

                          </td>

                          {/* CONTACT */}

                          <td>

                            <div className="admin-contact">

                              <span>
                                <Mail size={14} />
                                {admin.email}
                              </span>

                              <span>
                                <Phone size={14} />
                                +91 {admin.phone}
                              </span>

                            </div>

                          </td>

                          {/* LOCATION */}

                          <td>

                            <div className="admin-location">

                              <MapPin size={15} />

                              <span>
                                {admin.city},{' '}
                                {admin.state}
                              </span>

                            </div>

                          </td>

                          {/* LAST ACTIVE */}

                          <td>

                            <div className="admin-last-active">

                              <Clock3 size={15} />

                              <span>
                                {admin.lastActive}
                              </span>

                            </div>

                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`admin-status ${
                                admin.status
                                  .toLowerCase()
                              }`}
                            >
                              <span />

                              {admin.status}
                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="action-column">

                            <div className="admin-action-wrapper">

                              <button
                                type="button"
                                className={`admin-more-button ${
                                  openMenuId ===
                                  admin.id
                                    ? 'active'
                                    : ''
                                }`}
                                onClick={() =>
                                  handleMenuToggle(
                                    admin.id
                                  )
                                }
                                aria-label={`Actions for ${admin.name}`}
                              >
                                <MoreVertical
                                  size={18}
                                />
                              </button>

                              {openMenuId ===
                                admin.id && (
                                <AdminActionMenu
                                  admin={admin}
                                  onView={
                                    handleViewDetails
                                  }
                                  onStatus={
                                    handleStatusClick
                                  }
                                  onDelete={
                                    handleDeleteClick
                                  }
                                />
                              )}

                            </div>

                          </td>

                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="admin-empty-state"
                      >
                        <Users size={25} />

                        <strong>
                          No administrators found
                        </strong>

                        <span>
                          Try a different search.
                        </span>
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>

            </div>

            {/* MOBILE */}

            <div className="admin-mobile-list">

              {filteredAdmins.length > 0 ? (
                filteredAdmins.map(
                  (admin) => (
                    <div
                      className="admin-mobile-card"
                      key={admin.id}
                    >

                      <div className="admin-mobile-card-top">

                        <div className="admin-person">

                          <div className="admin-avatar">
                            {admin.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {admin.name}
                            </strong>

                            <span>
                              Administrator
                            </span>
                          </div>

                        </div>

                        <div className="admin-action-wrapper">

                          <button
                            type="button"
                            className="admin-more-button"
                            onClick={() =>
                              handleMenuToggle(
                                admin.id
                              )
                            }
                          >
                            <MoreVertical
                              size={18}
                            />
                          </button>

                          {openMenuId ===
                            admin.id && (
                            <AdminActionMenu
                              admin={admin}
                              onView={
                                handleViewDetails
                              }
                              onStatus={
                                handleStatusClick
                              }
                              onDelete={
                                handleDeleteClick
                              }
                              mobile
                            />
                          )}

                        </div>

                      </div>

                      <div className="admin-mobile-details">

                        <div>
                          <Mail size={15} />
                          <span>
                            {admin.email}
                          </span>
                        </div>

                        <div>
                          <Phone size={15} />
                          <span>
                            +91 {admin.phone}
                          </span>
                        </div>

                        <div>
                          <MapPin size={15} />
                          <span>
                            {admin.city},{' '}
                            {admin.state}
                          </span>
                        </div>

                        <div>
                          <Clock3 size={15} />
                          <span>
                            Last active:{' '}
                            {admin.lastActive}
                          </span>
                        </div>

                      </div>

                      <div className="admin-mobile-bottom">

                        <span
                          className={`admin-status ${
                            admin.status.toLowerCase()
                          }`}
                        >
                          <span />
                          {admin.status}
                        </span>

                        <button
                          type="button"
                          className="admin-mobile-view"
                          onClick={() =>
                            handleViewDetails(
                              admin
                            )
                          }
                        >
                          View details
                        </button>

                      </div>

                    </div>
                  )
                )
              ) : (
                <div className="admin-mobile-empty">
                  <Users size={26} />

                  <strong>
                    No administrators found
                  </strong>

                  <span>
                    Try a different search.
                  </span>
                </div>
              )}

            </div>

          </section>
        </>
      )}

      {/* =====================================================
          OTP MODAL
      ====================================================== */}

      {showOtpModal && (
        <div className="admin-modal-overlay">

          <div className="admin-modal otp-modal">

            <button
              type="button"
              className="admin-modal-close"
              onClick={() =>
                setShowOtpModal(false)
              }
            >
              <X size={18} />
            </button>

            <div className="admin-modal-icon">
              <Phone size={22} />
            </div>

            <h2>
              Verify Phone Number
            </h2>

            <p>
              Enter the 6-digit OTP sent to
            </p>

            <strong className="otp-phone">
              +91 {formData.phone}
            </strong>

            <div className="otp-inputs">

              {otp.map(
                (digit, index) => (
                  <input
                    key={index}
                    id={`admin-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(
                        e.target.value,
                        index
                      )
                    }
                    onKeyDown={(e) =>
                      handleOtpKeyDown(
                        e,
                        index
                      )
                    }
                  />
                )
              )}

            </div>

            <button
              type="button"
              className="admin-primary-button otp-verify-button"
              onClick={handleVerifyOtp}
              disabled={
                otp.join('').length !== 6 ||
                isSubmitting
              }
            >
              {isSubmitting ? (
                <>
                  <RefreshCw
                    size={17}
                    className="admin-spin"
                  />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck
                    size={17}
                  />
                  Verify & Create Admin
                </>
              )}
            </button>

            <div className="otp-resend">
              Didn't receive the OTP?

              <button
                type="button"
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          SUCCESS MODAL
      ====================================================== */}

      {showSuccessModal && (
        <div className="admin-modal-overlay">

          <div className="admin-modal success-modal">

            <div className="success-icon">
              <CheckCircle2 size={32} />
            </div>

            <h2>
              Admin Created
            </h2>

            <p>
              The phone number has been
              successfully verified.
            </p>

            <div className="email-confirmation">

              <Mail size={19} />

              <div>
                <strong>
                  Account setup details
                  will be sent to
                </strong>

                <span>
                  {formData.email}
                </span>
              </div>

            </div>

            <button
              type="button"
              className="admin-primary-button success-button"
              onClick={() => {
                setShowSuccessModal(false);
                handleCloseForm();
              }}
            >
              Done
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          VIEW DETAILS
      ====================================================== */}

      {showDetailsModal &&
        selectedAdmin && (
          <div className="admin-modal-overlay">

            <div className="admin-modal details-modal">

              <button
                type="button"
                className="admin-modal-close"
                onClick={() =>
                  setShowDetailsModal(false)
                }
              >
                <X size={18} />
              </button>

              <div className="details-avatar">
                {selectedAdmin.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <h2>
                {selectedAdmin.name}
              </h2>

              <span className="details-role">
                Administrator
              </span>

              <div className="details-list">

                <DetailRow
                  icon={<Mail size={16} />}
                  label="Email"
                  value={
                    selectedAdmin.email
                  }
                />

                <DetailRow
                  icon={<Phone size={16} />}
                  label="Phone"
                  value={`+91 ${selectedAdmin.phone}`}
                />

                <DetailRow
                  icon={<MapPin size={16} />}
                  label="Location"
                  value={`${selectedAdmin.city}, ${selectedAdmin.state}`}
                />

                <DetailRow
                  icon={<Clock3 size={16} />}
                  label="Last Active"
                  value={
                    selectedAdmin.lastActive
                  }
                />

                <DetailRow
                  icon={<ShieldCheck size={16} />}
                  label="Account Status"
                  value={
                    selectedAdmin.status
                  }
                />

              </div>

              <button
                type="button"
                className="admin-primary-button details-close-button"
                onClick={() =>
                  setShowDetailsModal(false)
                }
              >
                Close
              </button>

            </div>

          </div>
        )}

      {/* =====================================================
          STATUS MODAL
      ====================================================== */}

      {showStatusModal &&
        selectedAdmin && (
          <div className="admin-modal-overlay">

            <div className="admin-modal confirm-modal">

              <div className="warning-icon">
                {selectedAdmin.status ===
                'Active' ? (
                  <UserRoundX size={25} />
                ) : (
                  <UserRoundCheck
                    size={25}
                  />
                )}
              </div>

              <h2>
                {selectedAdmin.status ===
                'Active'
                  ? 'Deactivate Admin?'
                  : 'Activate Admin?'}
              </h2>

              <p>
                {selectedAdmin.status ===
                'Active'
                  ? `Are you sure you want to mark ${selectedAdmin.name} as inactive? They will no longer be treated as an active administrator.`
                  : `Do you want to reactivate ${selectedAdmin.name} as an active administrator?`}
              </p>

              <div className="confirm-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => {
                    setShowStatusModal(
                      false
                    );
                    setSelectedAdmin(
                      null
                    );
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={
                    selectedAdmin.status ===
                    'Active'
                      ? 'admin-danger-button'
                      : 'admin-primary-button'
                  }
                  onClick={
                    handleStatusChange
                  }
                >
                  {selectedAdmin.status ===
                  'Active'
                    ? 'Set Inactive'
                    : 'Activate Admin'}
                </button>

              </div>

            </div>

          </div>
        )}

      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {showDeleteModal &&
        selectedAdmin && (
          <div className="admin-modal-overlay">

            <div className="admin-modal confirm-modal">

              <div className="delete-icon">
                <Trash2 size={25} />
              </div>

              <h2>
                Delete Administrator?
              </h2>

              <p>
                You are about to permanently
                remove{' '}
                <strong>
                  {selectedAdmin.name}
                </strong>{' '}
                from the administrator list.
                This action cannot be undone.
              </p>

              <div className="delete-warning">

                <AlertTriangle size={17} />

                <span>
                  Make sure this administrator
                  no longer requires access
                  before continuing.
                </span>

              </div>

              <div className="confirm-actions">

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => {
                    setShowDeleteModal(
                      false
                    );
                    setSelectedAdmin(
                      null
                    );
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="admin-danger-button"
                  onClick={
                    handleDeleteAdmin
                  }
                >
                  <Trash2 size={16} />
                  Delete Admin
                </button>

              </div>

            </div>

          </div>
        )}

    </div>
  );
}

/* =========================================================
   ACTION MENU
========================================================= */

function AdminActionMenu({
  admin,
  onView,
  onStatus,
  onDelete,
}) {
  return (
    <div className="admin-action-menu">

      <button
        type="button"
        onClick={() => onView(admin)}
      >
        <Eye size={16} />
        View Details
      </button>

      <button
        type="button"
        onClick={() => onStatus(admin)}
      >
        {admin.status === 'Active' ? (
          <>
            <UserRoundX size={16} />
            Set Inactive
          </>
        ) : (
          <>
            <UserRoundCheck size={16} />
            Activate Admin
          </>
        )}
      </button>

      <button
        type="button"
        onClick={() => onDelete(admin)}
        className="danger-action"
      >
        <Trash2 size={16} />
        Delete Admin
      </button>

    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="detail-row">

      <div className="detail-row-icon">
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </div>
  );
}