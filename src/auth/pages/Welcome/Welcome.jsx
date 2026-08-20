import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './Welcome.css';

import logo from '../../../assets/logo.png';

export default function Welcome() {
  const navigate = useNavigate();
  const location = useLocation();

  const isFinancer = location.pathname.includes('/financer/');

  const targetDashboard = isFinancer
    ? '/financer/dashboard'
    : '/admin/dashboard';

  const handleContinue = () => {
    navigate(targetDashboard);
  };


  return (
    <div
      className={`inrfs-welcome-page ${
        !isFinancer ? 'inrfs-welcome-admin' : ''
      }`}
    >

      {/* Decorative background glow */}
      <div className="inrfs-welcome-glow inrfs-welcome-glow-one"></div>
      <div className="inrfs-welcome-glow inrfs-welcome-glow-two"></div>
      <div className="inrfs-welcome-glow inrfs-welcome-glow-three"></div>


      {/* Main content */}
      <main className="inrfs-welcome-content">

        {/* Logo */}
        <div className="inrfs-welcome-logo-circle">

          <img
            src={logo}
            alt="INRFS"
            className="inrfs-welcome-logo"
          />

        </div>


        {/* Welcome heading */}
        <h1 className="inrfs-welcome-title">
          Welcome to INRFS! <span>🎉</span>
        </h1>


        {/* Subtitle */}
        <p className="inrfs-welcome-subtitle">
          Your account is ready. Start managing your loans.
        </p>


        {/* Continue button */}
        <button
          type="button"
          className="inrfs-welcome-button"
          onClick={handleContinue}
        >
          <span>
            Continue to Dashboard
          </span>

          <ArrowRight
            size={19}
            strokeWidth={2.4}
          />
        </button>

      </main>


      {/* Footer */}
      <div className="inrfs-welcome-footer">
        Secure Fintech Platform
      </div>

    </div>
  );
}
