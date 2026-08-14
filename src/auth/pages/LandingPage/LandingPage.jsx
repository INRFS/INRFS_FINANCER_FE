import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  WalletCards,
  UsersRound,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

import './LandingPage.css';
import logo from '../../../assets/logo.png';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="inrfs-landing-page">

      {/* =========================
          BACKGROUND DECORATIONS
      ========================== */}

      <div className="inrfs-gradient-orb inrfs-orb-one"></div>
      <div className="inrfs-gradient-orb inrfs-orb-two"></div>
      <div className="inrfs-gradient-orb inrfs-orb-three"></div>

      <div className="inrfs-grid-pattern"></div>


      {/* =========================
          NAVBAR
      ========================== */}

      <header className="inrfs-navbar">

        <div className="inrfs-nav-brand">

          <img
            src={logo}
            alt="INRFS Logo"
            className="inrfs-nav-logo"
          />

          <div className="inrfs-nav-brand-text">
            <strong>INRFS</strong>
            <span>Financer Platform</span>
          </div>

        </div>


        <button
          className="inrfs-nav-button"
          onClick={() => navigate('/portals')}
        >
          Access Platform
          <ArrowRight size={17} />
        </button>

      </header>


      {/* =========================
          HERO SECTION
      ========================== */}

      <main>

        <section className="inrfs-hero">

          {/* LEFT CONTENT */}

          <div className="inrfs-hero-content">

            <div className="inrfs-eyebrow">
              <span className="inrfs-eyebrow-dot"></span>
              Secure Financial Management
            </div>


            <h1>
              Smarter Finance.
              <span> Better Management.</span>
            </h1>


            <p className="inrfs-hero-description">
              INRFS is a secure and intelligent financial management
              platform designed to simplify customers, loans,
              collections and administration in one powerful ecosystem.
            </p>


            <div className="inrfs-hero-actions">

              <button
                className="inrfs-primary-button"
                onClick={() => navigate('/portals')}
              >
                Get Started
                <ArrowRight size={19} />
              </button>


              <div className="inrfs-security-note">
                <ShieldCheck size={18} />
                <span>Secure &amp; Reliable Platform</span>
              </div>

            </div>


            {/* TRUST POINTS */}

            <div className="inrfs-trust-points">

              <div>
                <CheckCircle2 size={16} />
                Customer Management
              </div>

              <div>
                <CheckCircle2 size={16} />
                Loan Management
              </div>

              <div>
                <CheckCircle2 size={16} />
                Collection Tracking
              </div>

            </div>

          </div>


          {/* RIGHT VISUAL */}

          <div className="inrfs-hero-visual">

            <div className="inrfs-visual-glow"></div>

            <div className="inrfs-logo-card">

              <div className="inrfs-logo-ring ring-one"></div>
              <div className="inrfs-logo-ring ring-two"></div>

              <div className="inrfs-logo-inner">

                <img
                  src={logo}
                  alt="INRFS"
                  className="inrfs-hero-logo"
                />

              </div>

            </div>


            {/* FLOATING CARDS */}

            <div className="inrfs-floating-card inrfs-floating-card-top">

              <div className="inrfs-floating-icon icon-purple">
                <WalletCards size={19} />
              </div>

              <div>
                <strong>Financial Control</strong>
                <span>All in one platform</span>
              </div>

            </div>


            <div className="inrfs-floating-card inrfs-floating-card-bottom">

              <div className="inrfs-floating-icon icon-green">
                <BarChart3 size={19} />
              </div>

              <div>
                <strong>Smart Insights</strong>
                <span>Manage with confidence</span>
              </div>

            </div>

          </div>

        </section>


        {/* =========================
            FEATURES
        ========================== */}

        <section className="inrfs-features-section">

          <div className="inrfs-section-heading">

            <span>ONE POWERFUL PLATFORM</span>

            <h2>
              Everything you need to
              <strong> manage finance better.</strong>
            </h2>

          </div>


          <div className="inrfs-feature-grid">

            {/* CARD 1 */}

            <div className="inrfs-feature-card">

              <div className="inrfs-feature-icon feature-blue">
                <UsersRound size={23} />
              </div>

              <h3>Customer Management</h3>

              <p>
                Manage customer information and maintain
                organized financial records with ease.
              </p>

            </div>


            {/* CARD 2 */}

            <div className="inrfs-feature-card">

              <div className="inrfs-feature-icon feature-purple">
                <WalletCards size={23} />
              </div>

              <h3>Loan Management</h3>

              <p>
                Streamline loan operations, tracking and
                financial activities from one platform.
              </p>

            </div>


            {/* CARD 3 */}

            <div className="inrfs-feature-card">

              <div className="inrfs-feature-icon feature-green">
                <BarChart3 size={23} />
              </div>

              <h3>Collections &amp; Insights</h3>

              <p>
                Keep track of collections and gain clear
                visibility into your financial operations.
              </p>

            </div>


            {/* CARD 4 */}

            <div className="inrfs-feature-card">

              <div className="inrfs-feature-icon feature-orange">
                <ShieldCheck size={23} />
              </div>

              <h3>Secure Administration</h3>

              <p>
                Powerful administrative controls designed
                for secure and reliable platform management.
              </p>

            </div>

          </div>

        </section>


        {/* =========================
            CTA
        ========================== */}

        <section className="inrfs-bottom-cta">

          <div>

            <span>READY TO GET STARTED?</span>

            <h2>
              Enter the INRFS platform.
            </h2>

            <p>
              Choose your portal and continue securely.
            </p>

          </div>


          <button
            onClick={() => navigate('/portals')}
            className="inrfs-cta-button"
          >
            Access INRFS
            <ArrowRight size={19} />
          </button>

        </section>

      </main>


      {/* =========================
          FOOTER
      ========================== */}

      <footer className="inrfs-landing-footer">

        <div className="inrfs-footer-brand">

          <img
            src={logo}
            alt="INRFS"
          />

          <span>
            INRFS Financer Platform
          </span>

        </div>


        <p>
          INRFS © {new Date().getFullYear()} · Secure Fintech Platform
        </p>

      </footer>

    </div>
  );
}