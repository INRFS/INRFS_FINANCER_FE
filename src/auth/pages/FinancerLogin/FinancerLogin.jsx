import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './FinancerLogin.css';

import logo from '../../../assets/logo.png';
import { api } from '../../../common/services/apiClient';
import { useAuth } from '../../authState';
import Modal from '../../../common/components/Modal';

export default function FinancerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeLogin } = useAuth();

  const [isRegistering, setIsRegistering] = useState(
    () => new URLSearchParams(location.search).get('mode') === 'register',
  );
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    mobile: '',
    email: '',
    city: '',
    state: '',
  });

  /* =====================================================
     LOGIN
     ===================================================== */

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const tokens = await api.post('/auth/login/financer', { email: mobile, password, portal: 'financer' }, { auth: false });
      completeLogin(tokens);
      navigate('/financer/welcome', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     REGISTER
     ===================================================== */

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const challenge = await api.post('/auth/register/financer', formData, { auth: false });
      navigate('/financer/verify-otp', { state: { ...challenge, email: formData.email.trim().toLowerCase(), portal: 'financer', registration: true } });
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the account.');
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     FORGOT PASSWORD
     ===================================================== */

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setForgotStatus('');
    try {
      await api.post('/auth/password/forgot', { email: forgotEmail.trim().toLowerCase() }, { auth: false });
      setForgotStatus('If the account exists, password reset instructions have been sent.');
    } catch (requestError) {
      setForgotStatus(requestError.message || 'Unable to request a password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     LOGIN VIEW
     ===================================================== */

  if (!isRegistering) {
    return (
      <div className="fin-login-page">

        <div className="fin-login-card">

          {/* Brand */}
          <div className="fin-login-brand">

            <img
              src={logo}
              alt="INRFS"
              className="fin-login-logo"
            />

            <span className="fin-login-portal-label">
              Financer Portal
            </span>

          </div>

          {/* Heading */}
          <div className="fin-login-heading">

            <h1>Welcome back</h1>

            <p>
              Manage your customers and loans with ease.
            </p>

          </div>

          {/* Login Form */}
          <form
            className="fin-login-form"
            onSubmit={handleLoginSubmit}
          >

            {/* Mobile */}
            <div className="fin-login-field">

              <label htmlFor="login-mobile">
                Mobile Number
              </label>

              <input
                id="login-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                required
              />

            </div>

            {/* Password */}
            <div className="fin-login-field">

              <label htmlFor="login-password">
                Password
              </label>

              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              {/* Forgot Password */}
              <div className="fin-forgot-password-row">

                <button
                  type="button"
                  className="fin-forgot-password"
                  onClick={() => {
                    setForgotEmail('');
                    setForgotStatus('');
                    setIsForgotPassword(true);
                    setIsRegistering(false);
                  }}
                >
                  Forgot password?
                </button>

              </div>

            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="fin-login-submit"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Login'}
            </button>

            {error && <div className="fin-login-error" role="alert">{error}</div>}
            {(location.state?.registrationSuccess || location.state?.notice) && <div className="fin-login-success" role="status">{location.state.registrationSuccess || location.state.notice}</div>}

          </form>

          {/* Register */}
          <div className="fin-login-register">

            <span>New to INRFS?</span>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setIsForgotPassword(false);
              }}
            >
              Create account
            </button>

          </div>

          {/* Divider */}
          <div className="fin-login-divider"></div>

          {/* Back */}
          <Link
            to="/"
            className="fin-login-back"
          >
            ← Back to portal selection
          </Link>

          <Modal isOpen={isForgotPassword} onClose={() => { if (!submitting) setIsForgotPassword(false); }} title="Reset your password" maxWidth="480px">
            <p className="fin-forgot-modal-intro">Enter your registered email address. We’ll send a secure reset link if an account matches.</p>
            <form className="fin-login-form fin-forgot-modal-form" onSubmit={handleForgotPasswordSubmit}>
              <div className="fin-login-field">
                <label htmlFor="forgot-email-dialog">Email Address</label>
                <input id="forgot-email-dialog" type="email" value={forgotEmail} onChange={(e) => { setForgotEmail(e.target.value); setForgotStatus(''); }} placeholder="you@example.com" autoComplete="email" required />
              </div>
              {forgotStatus && <div className="fin-login-reset-status" role="status">{forgotStatus}</div>}
              <div className="fin-forgot-modal-actions">
                <button type="button" className="fin-forgot-modal-cancel" onClick={() => setIsForgotPassword(false)} disabled={submitting}>Cancel</button>
                <button type="submit" className="fin-login-submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send reset instructions'}</button>
              </div>
            </form>
          </Modal>

        </div>

      </div>
    );
  }

  /* =====================================================
     FORGOT PASSWORD VIEW
     ===================================================== */

  if (isForgotPassword) {
    return (
      <div className="fin-login-page">

        <div className="fin-login-card fin-forgot-card">

          {/* Brand */}
          <div className="fin-login-brand">

            <img
              src={logo}
              alt="INRFS"
              className="fin-login-logo"
            />

          </div>

          {/* Heading */}
          <div className="fin-login-heading">

            <h1>Forgot password?</h1>

            <p>
              Enter your registered email address to reset your password.
            </p>

          </div>

          {/* Forgot Password Form */}
          <form
            className="fin-login-form"
            onSubmit={handleForgotPasswordSubmit}
          >

            <div className="fin-login-field">

              <label htmlFor="forgot-email">
                Email Address
              </label>

              <input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

            </div>

            <button
              type="submit"
              className="fin-login-submit"
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send reset instructions'}
            </button>

            {error && <div className="fin-login-error" role="status">{error}</div>}

          </form>

          {/* Back to Login */}
          <div className="fin-forgot-back">

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setIsRegistering(false);
              }}
            >
              ← Back to Login
            </button>

          </div>

        </div>

      </div>
    );
  }

  /* =====================================================
     REGISTER VIEW
     ===================================================== */

  return (
    <div className="fin-login-page">

      <div className="fin-login-card fin-register-card">

        {/* Brand */}
        <div className="fin-login-brand fin-register-brand">

          <img
            src={logo}
            alt="INRFS"
            className="fin-login-logo"
          />

        </div>

        {/* Register Heading */}
        <div className="fin-login-heading fin-register-heading">

          <h1>Create your INRFS account</h1>

          <p>
            Join thousands of financers managing loans digitally
          </p>

        </div>

        {/* Register Form */}
        <form
          className="fin-register-form"
          onSubmit={handleRegisterSubmit}
        >

          {/* Full Name */}
          <div className="fin-register-field">

            <label htmlFor="fullName">
              Full Name
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleRegisterChange}
              placeholder="Suresh Patel"
              required
            />

          </div>

          {/* Business Name */}
          <div className="fin-register-field">

            <label htmlFor="businessName">
              Business / Finance Name
            </label>

            <input
              id="businessName"
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={handleRegisterChange}
              placeholder="Patel Finance Services"
              required
            />

          </div>

          {/* Mobile */}
          <div className="fin-register-field">

            <label htmlFor="register-mobile">
              Mobile Number
            </label>

            <input
              id="register-mobile"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleRegisterChange}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              required
            />

          </div>

          {/* Email */}
          <div className="fin-register-field">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleRegisterChange}
              placeholder="suresh@patelfinance.in"
              autoComplete="email"
              required
            />

          </div>

          {/* City */}
          <div className="fin-register-field">

            <label htmlFor="city">
              City
            </label>

            <input
              id="city"
              name="city"
              type="text"
              value={formData.city}
              onChange={handleRegisterChange}
              placeholder="Ahmedabad"
              required
            />

          </div>

          {/* State */}
          <div className="fin-register-field">

            <label htmlFor="state">
              State
            </label>

            <input
              id="state"
              name="state"
              type="text"
              value={formData.state}
              onChange={handleRegisterChange}
              placeholder="Gujarat"
              required
            />

          </div>

          {/* Send OTP */}
          <button
            type="submit"
            className="fin-login-submit fin-register-submit"
            disabled={submitting}
          >
            {submitting ? 'Sending OTP…' : 'Send OTP to Verify'}
          </button>

          {error && <div className="fin-login-error" role="alert">{error}</div>}

        </form>

        {/* Existing account */}
        <div className="fin-register-existing">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setIsForgotPassword(false);
            }}
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}
