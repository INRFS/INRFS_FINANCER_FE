import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ArrowLeft } from 'lucide-react';
import './OTPVerification.css';

import logo from '../../../assets/logo.png';
import { api } from '../../../common/services/apiClient';
import { useAuth } from '../../authState';

export default function OTPVerification({ portal: propPortal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeLogin } = useAuth();

  const isFinancerRoute = location.pathname.includes('/financer/');
  const portal =
    propPortal || (isFinancerRoute ? 'financer' : 'admin');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [challengeId, setChallengeId] = useState(location.state?.challengeId || null);

  const inputRefs = useRef([]);

  const contactInfo =
    location.state?.mobile ||
    location.state?.email || '';


  useEffect(() => {
    if (!challengeId || !contactInfo) {
      navigate(portal === 'financer' ? '/financer/login' : '/admin/login', { replace: true });
      return;
    }
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [challengeId, contactInfo, navigate, portal]);


  const handleChange = (index, value) => {

    // Allow only numbers
    if (!/^\d*$/.test(value)) {
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = value.slice(-1);

    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };


  const handleKeyDown = (index, e) => {

    if (e.key === 'Backspace') {

      if (otp[index]) {

        const newOtp = [...otp];

        newOtp[index] = '';

        setOtp(newOtp);

      } else if (index > 0) {

        inputRefs.current[index - 1]?.focus();

      }
    }


    if (
      e.key === 'ArrowLeft' &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }


    if (
      e.key === 'ArrowRight' &&
      index < 5
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };


  const handlePaste = (e) => {

    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pastedValue) {
      return;
    }

    const newOtp = ['', '', '', '', '', ''];

    pastedValue.split('').forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);

    const focusIndex = Math.min(
      pastedValue.length,
      5
    );

    inputRefs.current[focusIndex]?.focus();
  };


  const handleVerify = async (e) => {

    e.preventDefault();

    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }


    if (!challengeId) {
      setError('This verification challenge is missing or expired. Please sign in again.');
      return;
    }
    setSubmitting(true);
    try {
      if (location.state?.registration) {
        const result = await api.post('/auth/otp/verify-registration', { challengeId, code: enteredOtp }, { auth: false });
        navigate('/financer/login', { replace: true, state: { registrationSuccess: result.message } });
      } else {
        const tokens = await api.post('/auth/otp/verify', { challengeId, code: enteredOtp }, { auth: false });
        completeLogin(tokens);
        navigate(portal === 'financer' ? '/financer/welcome' : '/admin/welcome', { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message || 'OTP verification failed.');
    } finally {
      setSubmitting(false);
    }
  };


  const handleChangeNumber = () => {

    navigate(
      portal === 'financer'
        ? '/financer/login'
        : '/admin/login'
    );
  };


  const handleResend = async () => {

    setOtp(['', '', '', '', '', '']);

    setError('');

    inputRefs.current[0]?.focus();
    try {
      const challenge = await api.post('/auth/otp/request', { destination: contactInfo, purpose: location.state?.registration ? 'Registration' : 'Login' }, { auth: false });
      setChallengeId(challenge.challengeId);
    } catch (requestError) {
      setError(requestError.message || 'Unable to resend the OTP.');
    }
  };


  return (
    <div className="fin-auth-otp-page">

      <div className="fin-auth-otp-card">

        {/* Brand */}
        <div className="fin-auth-otp-brand">

          <img
            src={logo}
            alt="INRFS"
            className="fin-auth-otp-logo"
          />

        </div>


        {/* Phone icon */}
        <div className="fin-auth-otp-phone-icon">
          <Phone size={31} strokeWidth={2} />
        </div>


        {/* Heading */}
        <div className="fin-auth-otp-heading">

          <h1>
            Verify your mobile number
          </h1>

          <p>
            Enter the 6-digit OTP sent to your mobile number.
          </p>

          <strong>
            {contactInfo}
          </strong>

        </div>


        {/* OTP Form */}
        <form
          className="fin-auth-otp-form"
          onSubmit={handleVerify}
        >

          <div
            className="fin-auth-otp-inputs"
            onPaste={handlePaste}
          >

            {otp.map((digit, index) => (

              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                className="fin-auth-otp-input"
                type="text"
                inputMode="numeric"
                autoComplete={
                  index === 0
                    ? 'one-time-code'
                    : 'off'
                }
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(
                    index,
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                aria-label={`OTP digit ${index + 1}`}
              />

            ))}

          </div>


          {error && (
            <div className="fin-auth-otp-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="fin-auth-otp-verify"
            disabled={submitting}
          >
            {submitting ? 'Verifying…' : 'Verify OTP'}
          </button>

        </form>


        {/* Secondary actions */}
        <div className="fin-auth-otp-actions">

          <button
            type="button"
            onClick={handleResend}
            className="fin-auth-otp-secondary"
          >
            Resend OTP
          </button>

          <button
            type="button"
            onClick={handleChangeNumber}
            className="fin-auth-otp-secondary"
          >
            Change Number
          </button>

        </div>


        <p className="fin-auth-otp-demo">The code expires automatically for your security.</p>


        {/* Back */}
        <button
          type="button"
          className="fin-auth-otp-back"
          onClick={() =>
            navigate(
              portal === 'financer'
                ? '/financer/login'
                : '/admin/login'
            )
          }
        >
          <ArrowLeft size={15} />
          Back to login
        </button>

      </div>

    </div>
  );
}
