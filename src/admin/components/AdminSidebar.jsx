import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  UsersRound,
  ReceiptIndianRupee,
  CalendarDays,
  FileText,
  LogOut,
  Settings,
  Headphones,
  Bell,
  HandCoins,
} from 'lucide-react';
import { useAuth } from '../../auth/authState';
import logo from '../../assets/logo.png';
import { BILLING_MANAGE_ROLES, CONFIG_MANAGE_ROLES, SUPPORT_MANAGE_ROLES } from '../adminAccess';

import './AdminSidebar.css';

/* =========================================================
   ADMIN NAVIGATION
========================================================= */

const adminNavigation = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },

  {
    label: 'Financers',
    path: '/admin/financers',
    icon: UsersRound,
  },

  {
    label: 'Service Charges',
    path: '/admin/service-charges',
    icon: ReceiptIndianRupee,
    roles: CONFIG_MANAGE_ROLES,
  },

  {
    label: 'Monthly Billing',
    path: '/admin/monthly-billing',
    icon: CalendarDays,
    roles: BILLING_MANAGE_ROLES,
  },

  {
    label: 'Reports',
    path: '/admin/reports',
    icon: FileText,
  },
  {
    label: 'Collections',
    path: '/admin/collections',
    icon: HandCoins,
    roles: BILLING_MANAGE_ROLES,
  },
  { label: 'Support', path: '/admin/support', icon: Headphones, roles: SUPPORT_MANAGE_ROLES },
  { label: 'Announcements', path: '/admin/notifications', icon: Bell, roles: CONFIG_MANAGE_ROLES },
  // { label: 'Operations', path: '/admin/operations', icon: Activity },
  { label: 'Settings', path: '/admin/settings', icon: Settings, roles: CONFIG_MANAGE_ROLES },
];

/* =========================================================
   ADMIN SIDEBAR
========================================================= */

export default function AdminSidebar({
  isOpen = false,
  onClose,
}) {
  const navigate = useNavigate();
  const { logout, hasRole } = useAuth();
  const handleLogout = async () => {
    await logout();
    onClose?.();
    navigate('/admin/login', { replace: true });
  };
  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}

      {isOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`admin-sidebar ${
          isOpen ? 'open' : ''
        }`}
      >

        {/* ===================================================
            BRAND
        ==================================================== */}

        <div className="admin-sidebar-brand">

          <div className="admin-sidebar-logo">

            <div className="admin-sidebar-logo-mark">
              <img src={logo} alt="" />
            </div>

          </div>

          <div className="admin-sidebar-role">
            ADMIN PORTAL
          </div>

        </div>

        {/* ===================================================
            NAVIGATION
        ==================================================== */}

        <nav
          className="admin-sidebar-nav"
          aria-label="Admin navigation"
        >

          {adminNavigation.filter((item) => !item.roles || hasRole(...item.roles)).map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `admin-sidebar-nav-item ${
                    isActive ? 'active' : ''
                  }`
                }
              >

                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className="admin-sidebar-nav-icon"
                />

                <span className="admin-sidebar-nav-label">
                  {item.label}
                </span>

                {item.badge && (
                  <span className="admin-sidebar-nav-badge">
                    {item.badge}
                  </span>
                )}

              </NavLink>
            );
          })}

        </nav>

        {/* ===================================================
            BOTTOM ADMIN INFO
        ==================================================== */}

        <div className="admin-sidebar-bottom">

          <div className="admin-sidebar-user-card">

            <div className="admin-sidebar-user-avatar">
              A
            </div>

            <div className="admin-sidebar-user-info">

              <div className="admin-sidebar-user-name">
                Admin
              </div>

              <div className="admin-sidebar-user-role">
                Administrator
              </div>

            </div>

            <button type="button" onClick={handleLogout} className="admin-sidebar-logout" aria-label="Logout" title="Logout">
              <LogOut size={18} />
            </button>

          </div>

        </div>

      </aside>
    </>
  );
}
