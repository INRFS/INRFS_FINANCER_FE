import React from 'react';
import {
  Menu,
  Bell,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import './AdminHeader.css';

export default function AdminHeader({
  onToggleSidebar,
}) {
  return (
    <header className="inrfs-admin-header">

      {/* =====================================================
          LEFT SECTION
      ====================================================== */}
      <div className="inrfs-admin-header-left">

        {/* Mobile Hamburger */}
        <button
          type="button"
          className="inrfs-admin-header-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Open admin navigation"
          title="Open navigation"
        >
          <Menu size={22} strokeWidth={2.2} />
        </button>

        {/* Environment Badge */}
        <div className="inrfs-admin-header-environment">

          <span className="inrfs-admin-header-shield-wrap">
            <ShieldCheck
              size={16}
              strokeWidth={2}
            />
          </span>

          <span className="inrfs-admin-header-environment-text">
            System Environment: Production Cloud
          </span>

        </div>

      </div>

      {/* =====================================================
          RIGHT SECTION
      ====================================================== */}
      <div className="inrfs-admin-header-right">

        {/* Portal Switcher */}
        <Link
          to="/"
          className="inrfs-admin-header-switch-link"
        >
          <span>
            Portal Switcher
          </span>

          <ExternalLink
            size={14}
            strokeWidth={2}
          />
        </Link>

        {/* Notifications */}
        <button
          type="button"
          className="inrfs-admin-header-notification-btn"
          title="System Alerts"
          aria-label="System Alerts"
        >
          <Bell
            size={20}
            strokeWidth={2}
          />

          <span
            className="inrfs-admin-header-notification-dot"
            aria-hidden="true"
          />
        </button>

        {/* Admin Profile */}
        <div
          className="inrfs-admin-header-profile"
          title="Super Admin"
          aria-label="Super Admin"
        >
          <span>
            SA
          </span>
        </div>

      </div>

    </header>
  );
}