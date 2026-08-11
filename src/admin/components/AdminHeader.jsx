import React from 'react';
import { Menu, Bell, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../common/components/Button';
import './AdminHeader.css';

export default function AdminHeader({ onToggleSidebar }) {
  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button className="admin-header-menu-btn" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>
        <div className="admin-header-pill">
          <ShieldCheck size={16} className="admin-header-shield" />
          <span>System Environment: Production Cloud</span>
        </div>
      </div>

      <div className="admin-header-right">
        <Link to="/" className="admin-header-switch-link">
          Portal Switcher <ExternalLink size={14} />
        </Link>

        <button className="admin-header-notif-btn" title="System Alerts">
          <Bell size={20} />
          <span className="admin-header-notif-dot" />
        </button>

        <div className="admin-header-profile-badge">
          <span>SA</span>
        </div>
      </div>
    </header>
  );
}
