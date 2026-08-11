import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './FinancerLogin.css';

import logo from '../../../assets/logo.png';

export default function FinancerLogin() {
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);

  const [mobile, setMobile] = useState('+91 98765 43210');

  const [formData, setFormData] = useState({
    fullName: 'Suresh Patel',
    businessName: 'Patel Finance Services',
    mobile: '+91 98765 43210',
    email: 'suresh@patelfinance.in',
    city: 'Ahmedabad',
    state: 'Gujarat',
  });


  /* =====================================================
     LOGIN
     ===================================================== */

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    navigate('/financer/verify-otp', {
      state: {
        mobile,
        portal: 'financer',
      },
    });
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
      },
    });
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


            <button
              type="submit"
              className="fin-login-submit"
            >
              Send OTP
            </button>

          </form>


          {/* Register */}
          <div className="fin-login-register">

            <span>New to INRFS?</span>

            <button
              type="button"
              onClick={() => setIsRegistering(true)}
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
            onClick={() => setIsRegistering(false)}
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}