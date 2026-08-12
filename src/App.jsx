import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// =========================================================
// GLOBAL STYLES
// =========================================================

import './common/styles/global.css';

// =========================================================
// AUTH PAGES
// =========================================================

import PortalSelection from './auth/pages/PortalSelection/PortalSelection';
import FinancerLogin from './auth/pages/FinancerLogin/FinancerLogin';
import AdminLogin from './auth/pages/AdminLogin/AdminLogin';
import OTPVerification from './auth/pages/OTPVerification/OTPVerification';
import Welcome from './auth/pages/Welcome/Welcome';

// =========================================================
// FINANCER LAYOUT & PAGES
// =========================================================

import FinancerLayout from './financer/layouts/FinancerLayout';

import ServiceCharge from './financer/pages/ServiceCharge/ServiceCharge';
import FinancerDashboard from './financer/pages/Dashboard/Dashboard';
import Customers from './financer/pages/Customers/Customers';
import Loans from './financer/pages/Loans/Loans';
import Payments from './financer/pages/Payments/Payments';
import InterestSchedule from './financer/pages/InterestSchedule/InterestSchedule';
import DueOverdue from './financer/pages/DueOverdue/DueOverdue';
import CustomerLedger from './financer/pages/CustomerLedger/CustomerLedger';
import Notifications from './financer/pages/Notifications/Notifications';
import Reports from './financer/pages/Reports/Reports';
import Support from './financer/pages/Support/Support';
import Settings from './financer/pages/Settings/Settings';

// =========================================================
// ADMIN LAYOUT & PAGES
// =========================================================

// IMPORTANT:
// AdminLayout must be imported before it is used below.
import AdminLayout from './admin/layouts/AdminLayout';

import AdminDashboard from './admin/pages/Dashboard/AdminDashboard';
import AdminFinancers from './admin/pages/Financers/Financers';
import AdminCustomers from './admin/pages/Customers/AdminCustomers';
import AdminLoans from './admin/pages/Loans/AdminLoans';
import AdminFinancerDetails from './admin/pages/Financers/FinancerDetails';
import AdminFinancerUsage from './admin/pages/UsageAnalytics/AdminUsageAnalytics';

import AdminServiceCharges from './admin/pages/ServiceCharges/AdminServiceCharges';
import AdminMonthlyBilling from './admin/pages/MonthlyBilling/AdminMonthlyBilling';
import AdminCollections from './admin/pages/Collections/AdminCollections';

import AdminSMSManagement from './admin/pages/SMSManagement/AdminSMSManagement';
import AdminReports from './admin/pages/Reports/AdminReports';

// =========================================================
// AUDIT LOGS
// =========================================================

// Add this import once you create the page:
//
// import AdminAuditLogs from './admin/pages/AuditLogs/AdminAuditLogs';

// =========================================================
// FINANCER ROUTE GUARD
// =========================================================

function FinancerGuard({ children }) {
  const isAuth =
    localStorage.getItem(
      'inrfs_financer_authenticated'
    ) === 'true';

  return isAuth ? (
    children
  ) : (
    <Navigate
      to="/financer/login"
      replace
    />
  );
}

// =========================================================
// ADMIN ROUTE GUARD
// =========================================================

function AdminGuard({ children }) {
  const isAuth =
    localStorage.getItem(
      'inrfs_admin_authenticated'
    ) === 'true';

  return isAuth ? (
    children
  ) : (
    <Navigate
      to="/admin/login"
      replace
    />
  );
}

// =========================================================
// APP
// =========================================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ===================================================
            PORTAL SELECTION
        ==================================================== */}

        <Route
          path="/"
          element={<PortalSelection />}
        />

        {/* ===================================================
            FINANCER AUTH ROUTES
        ==================================================== */}

        <Route
          path="/financer/login"
          element={<FinancerLogin />}
        />

        <Route
          path="/financer/verify-otp"
          element={
            <OTPVerification
              portal="financer"
            />
          }
        />

        <Route
          path="/financer/welcome"
          element={<Welcome />}
        />

        {/* ===================================================
            FINANCER PORTAL ROUTES
        ==================================================== */}

        <Route
          path="/financer"
          element={
            <FinancerGuard>
              <FinancerLayout />
            </FinancerGuard>
          }
        >

          {/* /financer → /financer/dashboard */}

          <Route
            index
            element={
              <Navigate
                to="/financer/dashboard"
                replace
              />
            }
          />

          {/* Dashboard */}

          <Route
            path="dashboard"
            element={<FinancerDashboard />}
          />

          {/* Customers */}

          <Route
            path="customers"
            element={<Customers />}
          />

          {/* Loans */}

          <Route
            path="loans"
            element={<Loans />}
          />

          {/* Payments */}

          <Route
            path="payments"
            element={<Payments />}
          />

          {/* Interest Schedule */}

          <Route
            path="interest-schedule"
            element={<InterestSchedule />}
          />

          {/* Due / Overdue */}

          <Route
            path="due-overdue"
            element={<DueOverdue />}
          />

          {/* Customer Ledger */}

          <Route
            path="customer-ledger"
            element={<CustomerLedger />}
          />

          {/* Notifications */}

          <Route
            path="notifications"
            element={<Notifications />}
          />

          {/* Reports */}

          <Route
            path="reports"
            element={<Reports />}
          />

          {/* Service Charge */}

          <Route
            path="service-charge"
            element={<ServiceCharge />}
          />

          {/* Support */}

          <Route
            path="support"
            element={<Support />}
          />

          {/* Settings */}

          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>

        {/* ===================================================
            ADMIN AUTH ROUTES
        ==================================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin/verify-otp"
          element={
            <OTPVerification
              portal="admin"
            />
          }
        />

        <Route
          path="/admin/welcome"
          element={<Welcome />}
        />

        {/* ===================================================
            ADMIN PORTAL ROUTES
        ==================================================== */}

        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >

          {/* =================================================
              /admin → /admin/dashboard
          ================================================== */}

          <Route
            index
            element={
              <Navigate
                to="/admin/dashboard"
                replace
              />
            }
          />

          {/* =================================================
              DASHBOARD
          ================================================== */}

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          {/* =================================================
              FINANCERS
          ================================================== */}

          <Route
            path="financers"
            element={<AdminFinancers />}
          />
<Route
  path="financers/:financerId"
  element={<AdminFinancerDetails />}
/>
          {/* =================================================
              CUSTOMERS OVERVIEW
          ================================================== */}

          <Route
            path="customers"
            element={<AdminCustomers />}
          />

          {/* =================================================
              LOANS OVERVIEW
          ================================================== */}

          <Route
            path="loans"
            element={<AdminLoans />}
          />

          {/* =================================================
              FINANCER USAGE
          ================================================== */}

          <Route
            path="financer-usage"
            element={<AdminFinancerUsage />}
          />

          {/* =================================================
              SERVICE CHARGES
          ================================================== */}

          <Route
            path="service-charges"
            element={<AdminServiceCharges />}
          />

          {/* =================================================
              MONTHLY BILLING
          ================================================== */}

          <Route
            path="monthly-billing"
            element={<AdminMonthlyBilling />}
          />

          {/* =================================================
              COLLECTIONS
          ================================================== */}

          <Route
            path="collections"
            element={<AdminCollections />}
          />

          {/* =================================================
              SMS MANAGEMENT
          ================================================== */}

          <Route
            path="sms-management"
            element={<AdminSMSManagement />}
          />

          {/* =================================================
              REPORTS
          ================================================== */}

          <Route
            path="reports"
            element={<AdminReports />}
          />

          {/* =================================================
              AUDIT LOGS
              
              Uncomment after creating the page:
              
              <Route
                path="audit-logs"
                element={<AdminAuditLogs />}
              />
          ================================================== */}

        </Route>

        {/* ===================================================
            FALLBACK
        ==================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}