import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import './AdminLogin.css';

import logo from '../../../assets/logo.png';
import { api } from '../../../common/services/apiClient';

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) return setError('Enter your email address first.');
    setSubmitting(true); setError('');
    try { await api.post('/auth/password/forgot', { email }, { auth: false }); setError('If this account exists, password reset instructions have been sent.'); }
    catch (requestError) { setError(requestError.message); }
    finally { setSubmitting(false); }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const challenge = await api.post('/auth/login', { email, password, portal: 'admin' }, { auth: false });
      navigate('/admin/verify-otp', { state: { ...challenge, email, portal: 'admin' } });
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

            <span className="inrfs-admin-portal-label">
              Admin Portal
            </span>

          </div>


          {/* Header */}
          <div className="inrfs-admin-heading">

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
                  onClick={handleForgotPassword}
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
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Login to Admin Portal'}
            </button>


            <p className="inrfs-admin-demo">
              Additional OTP verification is required.
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
                Financer organization management
              </span>
            </div>


            <div className="inrfs-admin-stat">
              <div className="inrfs-admin-check">
                <Check size={16} />
              </div>

              <span>
                Customer and loan oversight
              </span>
            </div>


            <div className="inrfs-admin-stat">
              <div className="inrfs-admin-check">
                <Check size={16} />
              </div>

              <span>
                Service-charge billing and collections
              </span>
            </div>


            <div className="inrfs-admin-stat">
              <div className="inrfs-admin-check">
                <Check size={16} />
              </div>

              <span>
                Audited platform reporting
              </span>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
}
