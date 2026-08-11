import React from 'react';
import { NavLink } from 'react-router-dom';

import {
  LayoutDashboard,
  UsersRound,
  UserRound,
  WalletCards,
  CreditCard,
  MessageSquare,
  BarChart3,
  LifeBuoy,
  FileText,
  Settings,
  ShieldCheck,
} from 'lucide-react';

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
    label: 'Customers Overview',
    path: '/admin/customers',
    icon: UserRound,
  },

  {
    label: 'Loans Overview',
    path: '/admin/loans',
    icon: WalletCards,
  },

  {
    label: 'Subscriptions',
    path: '/admin/subscriptions',
    icon: CreditCard,
  },

  {
    label: 'SMS Management',
    path: '/admin/sms-management',
    icon: MessageSquare,
  },

  // {
  //   label: 'Usage Analytics',
  //   path: '/admin/usage-analytics',
  //   icon: BarChart3,
  // },

  // {
  //   label: 'Support Tickets',
  //   path: '/admin/support-tickets',
  //   icon: LifeBuoy,
  //   badge: 2,
  // },

  {
    label: 'Reports',
    path: '/admin/reports',
    icon: FileText,
  },

  // {
  //   label: 'System Settings',
  //   path: '/admin/settings',
  //   icon: Settings,
  // },

  // {
  //   label: 'Audit Logs',
  //   path: '/admin/audit-logs',
  //   icon: ShieldCheck,
  // },
];


/* =========================================================
   ADMIN SIDEBAR
   ========================================================= */

export default function AdminSidebar({
  isOpen = false,
  onClose,
}) {
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

            {/* LOGO */}

            <div className="admin-sidebar-logo-mark">

              <span
                className="logo-petal logo-petal-1"
              />

              <span
                className="logo-petal logo-petal-2"
              />

              <span
                className="logo-petal logo-petal-3"
              />

              <span
                className="logo-petal logo-petal-4"
              />

              <span className="logo-center" />

            </div>


            {/* BRAND TEXT */}

            <div className="admin-sidebar-brand-text">

              <div className="admin-sidebar-brand-name">
                INRFS
              </div>

              <div className="admin-sidebar-brand-subtitle">
                Financer Platform
              </div>

            </div>

          </div>


          {/* ADMIN BADGE */}

          <div className="admin-sidebar-role">
            ADMIN
          </div>

        </div>


        {/* ===================================================
            NAVIGATION
        ==================================================== */}

        <nav
          className="admin-sidebar-nav"
          aria-label="Admin navigation"
        >

          {adminNavigation.map((item) => {

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

                {/* ICON */}

                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className="admin-sidebar-nav-icon"
                />


                {/* LABEL */}

                <span className="admin-sidebar-nav-label">
                  {item.label}
                </span>


                {/* BADGE */}

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

            {/* AVATAR */}

            <div className="admin-sidebar-user-avatar">
              A
            </div>


            {/* USER INFO */}

            <div className="admin-sidebar-user-info">

              <div className="admin-sidebar-user-name">
                Admin
              </div>

              <div className="admin-sidebar-user-role">
                Administrator
              </div>

            </div>

          </div>

        </div>

      </aside>
    </>
  );
}