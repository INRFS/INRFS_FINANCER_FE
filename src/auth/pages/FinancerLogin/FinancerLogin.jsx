import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

import './FinancerLogin.css';

import logo from '../../../assets/logo.png';

export default function FinancerLogin() {
  const navigate = useNavigate();

  /* =====================================================
     VIEW STATES
  ===================================================== */

  const [isRegistering, setIsRegistering] =
    useState(false);

  const [isForgotPassword, setIsForgotPassword] =
    useState(false);


  /* =====================================================
     LOGIN STATE
  ===================================================== */

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] =
    useState(false);

  const [loginError, setLoginError] =
    useState('');


  /* =====================================================
     FORGOT PASSWORD STATE
  ===================================================== */

  const [forgotMobile, setForgotMobile] =
    useState('');


  /* =====================================================
     REGISTER STATE
     
     IMPORTANT:
     Password is intentionally NOT collected here.
     The system will generate the password after OTP
     verification and send it to the registered email.
  ===================================================== */

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

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!mobile.trim() || !password.trim()) {
      setLoginError(
        'Please enter your mobile number and password.'
      );
      return;
    }

    setLoginError('');

    /*
      Replace this with your real login API later.

      Example:

      const response = await loginFinancer({
        mobile,
        password,
      });

      if (!response.success) {
        setLoginError(response.message);
        return;
      }
    */

    navigate('/financer/dashboard');
  };


  /* =====================================================
     REGISTER INPUT CHANGE
  ===================================================== */

  const handleRegisterChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* =====================================================
     REGISTER
     
     Registration does NOT create a password.
     
     Details are passed to OTP verification.
  ===================================================== */

  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    /*
      The backend should:
      1. Validate registration details
      2. Generate/send OTP
      3. Verify OTP
      4. Create account
      5. Generate temporary password
      6. Email password to registered email
    */

    navigate('/financer/verify-otp', {
      state: {
        mobile: formData.mobile,
        email: formData.email,
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

    if (!forgotMobile.trim()) {
      return;
    }

    navigate('/financer/verify-otp', {
      state: {
        mobile: forgotMobile,
        portal: 'financer',
        resetPassword: true,
      },
    });
  };


  /* =====================================================
     SWITCH TO REGISTER
  ===================================================== */

  const openRegister = () => {
    setIsRegistering(true);
    setIsForgotPassword(false);
    setLoginError('');
  };


  /* =====================================================
     SWITCH TO LOGIN
  ===================================================== */

  const openLogin = () => {
    setIsRegistering(false);
    setIsForgotPassword(false);
    setLoginError('');
  };


  /* =====================================================
     FORGOT PASSWORD VIEW
  ===================================================== */

  const openForgotPassword = () => {
    setIsForgotPassword(true);
    setIsRegistering(false);
    setLoginError('');
  };


  /* =====================================================
     LOGIN VIEW
  ===================================================== */

  if (
    !isRegistering &&
    !isForgotPassword
  ) {
    return (
      <div className="fin-login-page">

        <div className="fin-login-card">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="fin-login-brand">

            <img
              src={logo}
              alt="INRFS"
              className="fin-login-logo"
            />

            <div className="fin-login-brand-text">
              <h2>INRFS</h2>

              <span>
                Financer Platform
              </span>
            </div>

          </div>


          {/* =================================================
              HEADING
          ================================================= */}

          <div className="fin-login-heading">

            <h1>
              Welcome back
            </h1>

            <p>
              Manage your customers and loans
              with ease.
            </p>

          </div>


          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <form
            className="fin-login-form"
            onSubmit={handleLoginSubmit}
          >

            {/* =================================================
                MOBILE
            ================================================= */}

            <div className="fin-login-field">

              <label htmlFor="login-mobile">
                Mobile Number
              </label>

              <input
                id="login-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value);
                  setLoginError('');
                }}
                placeholder="+91 98765 43210"
                autoComplete="tel"
                required
              />

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="fin-login-field">

              <div className="fin-login-password-label">

                <label htmlFor="login-password">
                  Password
                </label>

                <button
                  type="button"
                  className="fin-forgot-password"
                  onClick={openForgotPassword}
                >
                  Forgot password?
                </button>

              </div>


              <div className="fin-login-password-wrapper">

                <input
                  id="login-password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="fin-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
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


            {/* =================================================
                ERROR
            ================================================= */}

            {loginError && (
              <div className="fin-login-error">
                {loginError}
              </div>
            )}


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="fin-login-submit"
            >
              Login
            </button>

          </form>


          {/* =================================================
              REGISTER
          ================================================= */}

          <div className="fin-login-register">

            <span>
              New to INRFS?
            </span>

            <button
              type="button"
              onClick={openRegister}
            >
              Create account
            </button>

          </div>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="fin-login-divider"></div>


          {/* =================================================
              BACK
          ================================================= */}

          <Link
            to="/"
            className="fin-login-back"
          >
            <ArrowLeft size={15} />
            Back to portal selection
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

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="fin-login-brand">

            <img
              src={logo}
              alt="INRFS"
              className="fin-login-logo"
            />

            <div className="fin-login-brand-text">

              <h2>
                INRFS
              </h2>

              <span>
                Financer Platform
              </span>

            </div>

          </div>


          {/* =================================================
              HEADING
          ================================================= */}

          <div className="fin-login-heading">

            <h1>
              Forgot password?
            </h1>

            <p>
              Enter your registered mobile
              number to reset your password.
            </p>

          </div>


          {/* =================================================
              FORGOT FORM
          ================================================= */}

          <form
            className="fin-login-form"
            onSubmit={
              handleForgotPasswordSubmit
            }
          >

            <div className="fin-login-field">

              <label htmlFor="forgot-mobile">
                Mobile Number
              </label>

              <input
                id="forgot-mobile"
                type="tel"
                value={forgotMobile}
                onChange={(e) =>
                  setForgotMobile(
                    e.target.value
                  )
                }
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


          {/* =================================================
              BACK
          ================================================= */}

          <div className="fin-forgot-back">

            <button
              type="button"
              onClick={openLogin}
            >
              <ArrowLeft size={15} />
              Back to Login
            </button>

          </div>

        </div>

      </div>
    );
  }


  /* =====================================================
     CREATE ACCOUNT VIEW
  ===================================================== */

  return (
    <div className="fin-login-page">

      <div className="fin-login-card fin-register-card">

        {/* =================================================
            BRAND
        ================================================= */}

        <div className="fin-login-brand fin-register-brand">

          <img
            src={logo}
            alt="INRFS"
            className="fin-login-logo"
          />

          <div className="fin-login-brand-text">

            <h2>
              INRFS
            </h2>

            <span>
              Financer Platform
            </span>

          </div>

        </div>


        {/* =================================================
            REGISTER HEADING
        ================================================= */}

        <div className="fin-login-heading fin-register-heading">

          <h1>
            Create your INRFS account
          </h1>

          <p>
            Enter your details to create
            your financer account.
          </p>

        </div>


        {/* =================================================
            INFORMATION MESSAGE
        ================================================= */}

        <div className="fin-register-info">

          <div className="fin-register-info-icon">
            <Check size={15} />
          </div>

          <div>

            <strong>
              No password required
            </strong>

            <p>
              After OTP verification, your
              login password will be generated
              and sent to your registered email.
            </p>

          </div>

        </div>


        {/* =================================================
            REGISTER FORM
        ================================================= */}

        <form
          className="fin-register-form"
          onSubmit={handleRegisterSubmit}
        >

          {/* =================================================
              FULL NAME
          ================================================= */}

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
              autoComplete="name"
              required
            />

          </div>


          {/* =================================================
              BUSINESS NAME
          ================================================= */}

          <div className="fin-register-field">

            <label htmlFor="businessName">
              Business / Finance Name
            </label>

            <input
              id="businessName"
              name="businessName"
              type="text"
              value={
                formData.businessName
              }
              onChange={handleRegisterChange}
              placeholder="Patel Finance Services"
              required
            />

          </div>


          {/* =================================================
              MOBILE
          ================================================= */}

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


          {/* =================================================
              EMAIL
          ================================================= */}

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


          {/* =================================================
              CITY
          ================================================= */}

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


          {/* =================================================
              STATE
          ================================================= */}

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


          {/* =================================================
              SEND OTP
          ================================================= */}

          <button
            type="submit"
            className="fin-login-submit fin-register-submit"
          >
            Send OTP to Verify
          </button>

        </form>


        {/* =================================================
            EXISTING ACCOUNT
        ================================================= */}

        <div className="fin-register-existing">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={openLogin}
          >
            Login
          </button>

        </div>

      </div>

    </div>
  );
}