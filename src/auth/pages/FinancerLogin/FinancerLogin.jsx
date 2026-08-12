import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './FinancerLogin.css';

import logo from '../../../assets/logo.png';

export default function FinancerLogin() {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const [forgotMobile, setForgotMobile] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    businessName: '',
    mobile: '',
    email: '',
    city: '',
    state: '',
    password: '',
  });

  /* =====================================================
     LOGIN
     ===================================================== */

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    // Login directly using mobile + password
    // Replace this with your API login call when backend is ready.
    console.log('Login:', {
      mobile,
      password,
    });

    // Example:
    // navigate('/financer/dashboard');

    navigate('/financer/dashboard');
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

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    navigate('/financer/verify-otp', {
      state: {
        mobile: formData.mobile,
        portal: 'financer',
        registration: true,
        registrationData: formData,
      },
    });
  };

  /* =====================================================
     FORGOT PASSWORD
     ===================================================== */

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();

    navigate('/financer/verify-otp', {
      state: {
        mobile: forgotMobile,
        portal: 'financer',
        resetPassword: true,
      },
    });
  };

  /* =====================================================
     LOGIN VIEW
     ===================================================== */

  if (!isRegistering && !isForgotPassword) {
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

            <div className="fin-login-brand-text">
              <h2>INRFS</h2>
              <span>Financer Platform</span>
            </div>

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
            >
              Login
            </button>

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

            <div className="fin-login-brand-text">
              <h2>INRFS</h2>
              <span>Financer Platform</span>
            </div>

          </div>

          {/* Heading */}
          <div className="fin-login-heading">

            <h1>Forgot password?</h1>

            <p>
              Enter your registered mobile number to reset your password.
            </p>

          </div>

          {/* Forgot Password Form */}
          <form
            className="fin-login-form"
            onSubmit={handleForgotPasswordSubmit}
          >

            <div className="fin-login-field">

              <label htmlFor="forgot-mobile">
                Mobile Number
              </label>

              <input
                id="forgot-mobile"
                type="tel"
                value={forgotMobile}
                onChange={(e) => setForgotMobile(e.target.value)}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                required
              />

            </div>

            <button
              type="submit"
              className="fin-login-submit"
            >
              Send OTP
            </button>

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

          <div className="fin-login-brand-text">
            <h2>INRFS</h2>
            <span>Financer Platform</span>
          </div>

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

          {/* Password */}
          <div className="fin-register-field">

            <label htmlFor="register-password">
              Password
            </label>

            <input
              id="register-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleRegisterChange}
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />

          </div>

          {/* Send OTP */}
          <button
            type="submit"
            className="fin-login-submit fin-register-submit"
          >
            Send OTP to Verify
          </button>

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