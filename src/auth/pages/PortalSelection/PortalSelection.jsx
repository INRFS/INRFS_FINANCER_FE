import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, LayoutGrid, ArrowRight } from 'lucide-react';
import './PortalSelection.css';

import logo from '../../../assets/logo.png';

export default function PortalSelection() {
  const navigate = useNavigate();

  return (
    <div className="inrfs-portal-page">

      {/* Soft decorative background shapes */}
      <div className="inrfs-bg-shape inrfs-bg-top-right">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <i></i>
      </div>

      <div className="inrfs-bg-shape inrfs-bg-bottom-left">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <i></i>
      </div>

      <div className="inrfs-bg-shape inrfs-bg-middle-left">
        <span></span>
      </div>

      {/* Main content */}
      <main className="inrfs-portal-content">

        {/* Brand */}
        <div className="inrfs-brand-section">

          <div className="inrfs-brand">
            <img
              src={logo}
             alt="INRFS Financer Platform Logo"
              className="inrfs-brand-logo"
            />

            <div className="inrfs-brand-text">
              <h2>INRFS</h2>
              <p>Financer Platform</p>
            </div>
          </div>

<h1 className="inrfs-portal-welcome-title">
  INRFS Financer Platform
</h1>

<p className="inrfs-portal-welcome-subtitle">
  Secure financial management platform for customers, loans, collections and administration.
</p>

        </div>

        {/* Portal Cards */}
        <div className="inrfs-portal-cards">

          {/* Financer */}
          <div
            className="inrfs-portal-card inrfs-financer-card"
            onClick={() => navigate('/financer/login')}
          >
            <div className="inrfs-card-icon inrfs-financer-icon">
              <UserRound size={30} strokeWidth={2} />
            </div>

            <h3>Financer Portal</h3>

            <p>
              Manage customers, loans &amp; collections
            </p>

            <div className="inrfs-card-arrow">
              Access Portal
              <ArrowRight size={16} />
            </div>
          </div>


          {/* Admin */}
          <div
            className="inrfs-portal-card inrfs-admin-card"
            onClick={() => navigate('/admin/login')}
          >
            <div className="inrfs-card-icon inrfs-admin-icon">
              <LayoutGrid size={30} strokeWidth={2} />
            </div>

            <h3>Admin Portal</h3>

            <p>
              Platform management &amp; oversight
            </p>

            <div className="inrfs-card-arrow">
              Access Admin
              <ArrowRight size={16} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="inrfs-portal-footer">
          INRFS © {new Date().getFullYear()} · Secure Fintech Platform
        </footer>

      </main>
    </div>
  );
}