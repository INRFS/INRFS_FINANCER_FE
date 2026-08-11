import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Banknote,
  CreditCard,
  CalendarDays,
  BookOpenCheck,
  BarChart3,
  Percent,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import logo from "../../assets/logo.png";

import "./FinancerSidebar.css";


export default function FinancerSidebar({
  isOpen = false,
  onClose = () => {},
}) {

  const navigate = useNavigate();


  const navItems = [
    {
      label: "Dashboard",
      path: "/financer/dashboard",
      icon: LayoutDashboard,
    },

    {
      label: "Customers",
      path: "/financer/customers",
      icon: Users,
    },

    {
      label: "Loans",
      path: "/financer/loans",
      icon: Banknote,
    },

    {
      label: "Payments",
      path: "/financer/payments",
      icon: CreditCard,
    },

    // {
    //   label: "Interest Schedule",
    //   path: "/financer/interest-schedule",
    //   icon: CalendarDays,
    // },

    {
      label: "Customer Ledger",
      path: "/financer/customer-ledger",
      icon: BookOpenCheck,
    },

    {
      label: "Reports",
      path: "/financer/reports",
      icon: BarChart3,
    },

    {
      label: "Service Charge",
      path: "/financer/service-charge",
      icon: Percent,
      badge: "1",
    },

    {
      label: "Settings",
      path: "/financer/settings",
      icon: Settings,
    },
  ];


  const handleLogout = () => {
    localStorage.removeItem("inrfs_financer_authenticated");

    onClose();

    navigate("/financer/login");
  };


  const handleNavigation = () => {
    onClose();
  };


  return (
    <>

      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}

      <div
        className={`inrfs-fin-sidebar-overlay ${
          isOpen
            ? "inrfs-fin-sidebar-overlay-visible"
            : ""
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />


      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`inrfs-fin-sidebar ${
          isOpen
            ? "inrfs-fin-sidebar-open"
            : ""
        }`}
      >

        {/* ===================================================
            HEADER / BRAND
            =================================================== */}

        <div className="inrfs-fin-sidebar-header">

          <NavLink
            to="/financer/dashboard"
            className="inrfs-fin-sidebar-brand"
            onClick={handleNavigation}
          >

            <img
              src={logo}
              alt="INRFS"
              className="inrfs-fin-sidebar-logo"
            />

            <div className="inrfs-fin-sidebar-brand-text">

              <span className="inrfs-fin-sidebar-brand-name">
                INRFS
              </span>

              <span className="inrfs-fin-sidebar-brand-subtitle">
                Financer Platform
              </span>

            </div>

          </NavLink>


          {/* Mobile close button */}

          <button
            type="button"
            className="inrfs-fin-sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>

        </div>


        {/* ===================================================
            DIVIDER
            =================================================== */}

        <div className="inrfs-fin-sidebar-divider" />


        {/* ===================================================
            NAVIGATION
            =================================================== */}

        <nav
          className="inrfs-fin-sidebar-nav"
          aria-label="Financer navigation"
        >

          <div className="inrfs-fin-sidebar-nav-list">

            {navItems.map((item) => {

              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    `inrfs-fin-sidebar-nav-item ${
                      isActive
                        ? "inrfs-fin-sidebar-nav-item-active"
                        : ""
                    }`
                  }
                >

                  {/* Active indicator */}

                  <span className="inrfs-fin-sidebar-active-line" />


                  {/* Icon */}

                  <span className="inrfs-fin-sidebar-nav-icon">

                    <Icon
                      size={20}
                      strokeWidth={1.9}
                    />

                  </span>


                  {/* Label */}

                  <span className="inrfs-fin-sidebar-nav-label">
                    {item.label}
                  </span>


                  {/* Badge */}

                  {item.badge && (
                    <span className="inrfs-fin-sidebar-nav-badge">
                      {item.badge}
                    </span>
                  )}

                </NavLink>
              );

            })}

          </div>

        </nav>


        {/* ===================================================
            USER FOOTER
            =================================================== */}

        <div className="inrfs-fin-sidebar-bottom">

          <div className="inrfs-fin-sidebar-user">

            <div className="inrfs-fin-sidebar-avatar">
              S
            </div>


            <div className="inrfs-fin-sidebar-user-details">

              <span className="inrfs-fin-sidebar-user-name">
                Suresh Patel
              </span>

              <span className="inrfs-fin-sidebar-user-role">
                Patel Finance
              </span>

            </div>

          </div>


          {/* Logout */}

          <button
            type="button"
            className="inrfs-fin-sidebar-logout"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >

            <LogOut
              size={18}
              strokeWidth={1.9}
            />

          </button>

        </div>

      </aside>

    </>
  );
}