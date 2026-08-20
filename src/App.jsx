import React, { Suspense, lazy } from 'react';
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
import ResetPassword from './auth/pages/ResetPassword/ResetPassword';
import LegalNotice from './auth/pages/LegalNotice/LegalNotice';
import { useAuth } from './auth/authState';
import ErrorBoundary from './common/components/ErrorBoundary';
import { ADMIN_PORTAL_ROLES, BILLING_MANAGE_ROLES, CONFIG_MANAGE_ROLES, SUPPORT_MANAGE_ROLES } from './admin/adminAccess';

// =========================================================
// FINANCER LAYOUT & PAGES
// =========================================================

import FinancerLayout from './financer/layouts/FinancerLayout';

const ServiceCharge = lazy(() => import('./financer/pages/ServiceCharge/ServiceCharge'));
const FinancerDashboard = lazy(() => import('./financer/pages/Dashboard/Dashboard'));
const Customers = lazy(() => import('./financer/pages/Customers/Customers'));
const Loans = lazy(() => import('./financer/pages/Loans/Loans'));
const Payments = lazy(() => import('./financer/pages/Payments/Payments'));
const InterestSchedule = lazy(() => import('./financer/pages/InterestSchedule/InterestSchedule'));
const DueOverdue = lazy(() => import('./financer/pages/DueOverdue/DueOverdue'));
const CustomerLedger = lazy(() => import('./financer/pages/CustomerLedger/CustomerLedger'));
const Notifications = lazy(() => import('./financer/pages/Notifications/Notifications'));
const Reports = lazy(() => import('./financer/pages/Reports/Reports'));
const Support = lazy(() => import('./financer/pages/Support/Support'));
const Settings = lazy(() => import('./financer/pages/Settings/Settings'));

// =========================================================
// ADMIN LAYOUT & PAGES
// =========================================================

// IMPORTANT:
// AdminLayout must be imported before it is used below.
import AdminLayout from './admin/layouts/AdminLayout';

const AdminDashboard = lazy(() => import('./admin/pages/Dashboard/AdminBillingDashboard'));
const AdminFinancers = lazy(() => import('./admin/pages/Financers/FinancersHub'));
const AdminFinancerDetails = lazy(() => import('./admin/pages/Financers/FinancerDetails'));
const AdminServiceCharges = lazy(() => import('./admin/pages/ServiceCharges/AdminServiceCharges'));
const AdminMonthlyBilling = lazy(() => import('./admin/pages/MonthlyBilling/AdminMonthlyBilling'));
const AdminReports = lazy(() => import('./admin/pages/Reports/AdminReports'));
const AdminSettings = lazy(() => import('./admin/pages/Settings/AdminSettings'));
const AdminSupport = lazy(() => import('./admin/pages/Support/AdminSupport'));
const AdminNotifications = lazy(() => import('./admin/pages/Notifications/AdminNotifications'));
const AdminOperations = lazy(() => import('./admin/pages/Operations/AdminOperations'));
const CollectionOperations = lazy(() => import('./admin/pages/Collections/CollectionOperations'));

// =========================================================
// FINANCER ROUTE GUARD
// =========================================================

function FinancerGuard({ children }) {
  const { session, loading, hasRole } = useAuth();
  if (loading) return <div className="route-loading" role="status">Loading secure session…</div>;
  const isAuth = session && hasRole('FinancerOwner', 'FinancerManager', 'LoanOfficer', 'CollectionAgent');

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
  const { session, loading, hasRole } = useAuth();
  if (loading) return <div className="route-loading" role="status">Loading secure session…</div>;
  const isAuth = session && hasRole(...ADMIN_PORTAL_ROLES);

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
      <ErrorBoundary><Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}><Routes>

        {/* ===================================================
            PORTAL SELECTION
        ==================================================== */}

        <Route
          path="/"
          element={<PortalSelection />}
        />
        <Route path="/privacy-policy" element={<LegalNotice type="privacy" />} />
        <Route path="/terms" element={<LegalNotice type="terms" />} />

        {/* ===================================================
            FINANCER AUTH ROUTES
        ==================================================== */}

        <Route
          path="/financer/login"
          element={<FinancerLogin />}
        />
        <Route path="/reset-password" element={<ResetPassword />} />

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
          <Route path="financers/:financerId" element={<AdminFinancerDetails />} />
          {/* =================================================
              FINANCER USAGE
          ================================================== */}

          <Route
            path="financer-usage"
            element={<Navigate to="/admin/financers?tab=usage" replace />}
          />

          {/* =================================================
              SERVICE CHARGES
          ================================================== */}

          <Route
            path="service-charges"
            element={<AdminRoleGuard roles={CONFIG_MANAGE_ROLES}><AdminServiceCharges /></AdminRoleGuard>}
          />

          {/* =================================================
              MONTHLY BILLING
          ================================================== */}

          <Route
            path="monthly-billing"
            element={<AdminRoleGuard roles={BILLING_MANAGE_ROLES}><AdminMonthlyBilling /></AdminRoleGuard>}
          />

          {/* =================================================
              COLLECTIONS
          ================================================== */}

          <Route
            path="collections"
            element={<AdminRoleGuard roles={BILLING_MANAGE_ROLES}><CollectionOperations /></AdminRoleGuard>}
          />

          {/* =================================================
              REPORTS
          ================================================== */}

          <Route
            path="reports"
            element={<AdminReports />}
          />

          <Route path="customers" element={<Navigate to="/admin/financers" replace />} />
          <Route path="sms-management" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="payments" element={<Navigate to="/admin/monthly-billing" replace />} />
          <Route path="notifications" element={<AdminRoleGuard roles={CONFIG_MANAGE_ROLES}><AdminNotifications /></AdminRoleGuard>} />
          <Route path="operations" element={<AdminOperations />} />
          <Route path="subscriptions" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="settings" element={<AdminRoleGuard roles={CONFIG_MANAGE_ROLES}><AdminSettings /></AdminRoleGuard>} />
          <Route path="support" element={<AdminRoleGuard roles={SUPPORT_MANAGE_ROLES}><AdminSupport /></AdminRoleGuard>} />

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

      </Routes></Suspense></ErrorBoundary>
    </BrowserRouter>
  );
}

function AdminRoleGuard({ roles, children }) {
  const { session, loading, hasRole } = useAuth();
  if (loading) return <div className="route-loading" role="status">Loading secure session…</div>;
  return session && hasRole(...roles) ? children : <Navigate to="/admin/dashboard" replace />;
}
