import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import './AdminLogin.css';

import logo from '../../../assets/logo.png';

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@inrfs.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');


const handleSubmit = (e) => {
  e.preventDefault();

  if (!email || !password) {
    setError('Please enter email and password');
    return;
  }

  setError('');

  // Direct admin login
  navigate('/admin/dashboard');
};


  return (
    <div className="inrfs-admin-login-page">

      {/* =================================================
          LEFT LOGIN SECTION
          ================================================= */}

      <section className="inrfs-admin-login-left">

        <div className="inrfs-admin-login-container">

          {/* Logo */}
          <div className="inrfs-admin-brand">

            <img
              src={logo}
              alt="INRFS"
              className="inrfs-admin-logo"
            />

            <div className="inrfs-admin-brand-text">
              <h2>INRFS</h2>
              <span>Financer Platform</span>
            </div>

          </div>


          {/* Header */}
          <div className="inrfs-admin-heading">

            <div className="inrfs-admin-badge">
              ADMIN PORTAL
            </div>

            <h1>
              Platform Administration
            </h1>

            <p>
              Secure access for INRFS administrators only.
            </p>

          </div>


          {/* Form */}
          <form
            className="inrfs-admin-form"
            onSubmit={handleSubmit}
          >

            {/* Email */}
            <div className="inrfs-admin-field">

              <label htmlFor="admin-email">
                Email Address
              </label>

              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="admin@inrfs.in"
                autoComplete="email"
                required
              />

            </div>


            {/* Password */}
            <div className="inrfs-admin-field">

              <div className="inrfs-admin-password-label">

                <label htmlFor="admin-password">
                  Password
                </label>

                <button
                  type="button"
                  className="inrfs-admin-forgot"
                  onClick={() => {
                    // Add forgot password flow here later
                  }}
                >
                  Forgot password?
                </button>

              </div>


              <div className="inrfs-admin-password-wrapper">

                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="inrfs-admin-password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>

              </div>

            </div>


            {/* Remember */}
            <label className="inrfs-admin-remember">

              <input
                type="checkbox"
              />

              <span>
                Remember me for 30 days
              </span>

            </label>


            {/* Error */}
            {error && (
              <div className="inrfs-admin-error">
                {error}
              </div>
            )}


            {/* Submit */}
            <button
              type="submit"
              className="inrfs-admin-submit"
            >
              Login to Admin Portal
            </button>


            {/* Demo */}
            <p className="inrfs-admin-demo">
              Demo: Enter any email and password
            </p>

          </form>


          {/* Back */}
          <Link
            to="/"
            className="inrfs-admin-back"
          >
            <ArrowLeft size={15} />
            Back to portal selection
          </Link>

        </div>

      </section>


      {/* =================================================
          RIGHT PROMOTIONAL SECTION
          ================================================= */}

      <section className="inrfs-admin-promo">

        {/* Decorative flower */}
        <div className="inrfs-admin-flower inrfs-admin-flower-top">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <i></i>
        </div>


        <div className="inrfs-admin-flower inrfs-admin-flower-bottom">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <i></i>
        </div>


        <div className="inrfs-admin-promo-content">

          <h2>
            Manage the entire INRFS platform
          </h2>

          <p>
            Oversee financers, service charges, SMS usage,
            and platform analytics from one powerful dashboard.
          </p>


          {/* Stats */}
          <div className="inrfs-admin-stats">

            <div className="inrfs-admin-stat">
              <div className="inrfs-admin-check">
                <Check size={16} />
              </div>

              <span>
                125 Active Financers
              </span>
            </div>


            <div className="inrfs-admin-stat">
              <div className="inrfs-admin-check">
                <Check size={16} />
              </div>

              <span>
                12,450 Customers
              </span>
            </div>


            <div className="inrfs-admin-stat">
              <div className="inrfs-admin-check">
                <Check size={16} />
              </div>

              <span>
                ₹8,50,000 Service Charges — Aug
              </span>
            </div>


            <div className="inrfs-admin-stat">
              <div className="inrfs-admin-check">
                <Check size={16} />
              </div>

              <span>
                ₹18.5 Cr Total Loan Value
              </span>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}