import React from 'react';
import {
  ArrowRight, BarChart3, Check, ClipboardCheck, Clock3, Database, Download,
  FileClock, FileSpreadsheet, Headphones, IndianRupee, KeyRound, Landmark,
  LifeBuoy, ListChecks, LockKeyhole, ReceiptIndianRupee, ShieldCheck,
  TrendingUp, UserCheck, UsersRound, WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import DashboardPreview from './DashboardPreview';
import FaqAccordion from './FaqAccordion';
import LandingHeader from './LandingHeader';
import './PortalSelection.css';

const capabilities = [
  ['Customer Records', 'Keep customer details, identity records, documents, and account history together.', UsersRound, '#workflow'],
  ['Loan Management', 'Create loans, define schedules, and follow balances from approval to closure.', Landmark, '#workflow'],
  ['Payments & Ledgers', 'Record collections and maintain a traceable history for every customer account.', WalletCards, '#workflow'],
  ['Reports', 'Find operational data quickly and export records for review and reconciliation.', BarChart3, '#faq'],
];

const workflow = [
  ['Add and verify a customer', 'Create the customer record and complete the required identity details.', UserCheck],
  ['Create and approve a loan', 'Capture the loan terms and move it through the authorised approval flow.', ClipboardCheck],
  ['Define the repayment schedule', 'Set dates, frequency, principal, and interest expectations.', ListChecks],
  ['Record repayments', 'Post collections against the correct loan and preserve the transaction history.', ReceiptIndianRupee],
  ['Monitor overdue amounts', 'See current balances, upcoming dues, and overdue accounts in one place.', Clock3],
  ['Generate reports', 'Filter and export operational records for routine review.', Download],
];

const benefits = [
  ['One connected workflow', 'Move from customer onboarding to collections without maintaining duplicate records.', ClipboardCheck],
  ['Clear financial visibility', 'Give your team a consistent view of principal, collections, balances, and dues.', TrendingUp],
  ['Role-based access', 'Separate responsibilities across owner, manager, loan officer, and collection roles.', KeyRound],
  ['Less spreadsheet dependency', 'Keep daily lending activity in structured customer and loan records.', FileSpreadsheet],
  ['Faster reporting', 'Search and export operational data without rebuilding reports by hand.', BarChart3],
  ['Better overdue tracking', 'Surface due and overdue amounts early so collection follow-up stays focused.', Clock3],
];

const securityItems = [
  ['Authentication and sessions', 'Password and OTP flows protect sign-in, with secure-session handling in the application.', LockKeyhole],
  ['Role-based access', 'Permissions separate financer owners, managers, loan officers, collection agents, and administrators.', KeyRound],
  ['Audit history', 'Administrative and platform activity can be reviewed through audit records.', FileClock],
  ['Data protection', 'Access-controlled APIs and validation help protect account data. Hosting-level encryption details must be confirmed before publication.', ShieldCheck],
  ['Backups', 'No public backup frequency or restoration commitment is currently documented. Ask the INRFS team for the applicable hosting and retention terms.', Database],
  ['Support', 'Signed-in financer users can create, track, and reply to support tickets within their workspace.', Headphones],
];

const faqs = [
  ['How do I create a financer account?', 'Select Create Account, enter your organisation and contact details, and complete the password and OTP steps. Lending operations remain inactive until the account has been reviewed and verified.'],
  ['How long does account verification take?', 'A published verification timeframe is not currently available. The INRFS team will confirm the expected review time after your details are submitted.'],
  ['How is account data protected?', 'The application uses authenticated sessions, password and OTP sign-in flows, access-controlled APIs, input validation, and role-based permissions. Hosting-level encryption, retention, and backup terms should be confirmed with INRFS before onboarding.'],
  ['Can I import existing customer and loan data?', 'A self-service bulk import is not currently shown in the product. Contact INRFS support to discuss migration options before creating duplicate records.'],
  ['Can I record customer repayments?', 'Yes. Authorised financer users can record repayments against loans and review balances and ledger entries.'],
  ['How is the 1% platform fee calculated?', 'The default configuration calculates 1% of customer interest collected during the billing period, not 1% of loan principal. For example, if ₹50,000 in interest is collected, the platform fee is ₹500. Taxes and any exceptions require confirmation in your commercial terms.'],
  ['What roles and permissions are supported?', 'The application defines Financer Owner, Financer Manager, Loan Officer, and Collection Agent roles, plus separate administrator roles. Access varies by role and workspace.'],
  ['Can I export reports?', 'Yes. Export controls are available for operational reports and customer ledger records, subject to the signed-in user’s access.'],
  ['How can I cancel my account or export my data?', 'The public cancellation and full-account data-export process has not yet been published. Raise an in-platform support ticket or use the owner-provided support contact before cancellation.'],
  ['Where can I get customer support?', 'Signed-in users can create and track support tickets in the platform. The public support email and phone number must be confirmed by the business owner before launch.'],
];

export default function PortalSelection() {
  return <div className="landing-page">
    <LandingHeader />
    <main>
      <section id="home" className="landing-hero">
        <div className="landing-shell landing-hero-grid">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow"><ShieldCheck size={17} /> Financial operations for financer teams</span>
            <h1>Run your entire lending operation without spreadsheets.</h1>
            <p>Manage customers, loans, repayments, overdue accounts, ledgers, and reports from one secure workspace.</p>
            <div className="landing-hero-actions">
              <a className="landing-primary-button" href="mailto:support@inrfs.in?subject=INRFS%20demo%20request">Book a Demo <ArrowRight size={18} /></a>
              <Link className="landing-secondary-button" to="/financer/login?mode=register">Create Account</Link>
            </div>
            <p className="landing-verification"><Check size={17} /> Account review and verification are required before lending operations can be activated.</p>
          </div>
          <div className="landing-hero-visual"><DashboardPreview /></div>
        </div>
      </section>

      <section id="capabilities" className="landing-section landing-capabilities"><div className="landing-shell">
        <div className="landing-section-intro"><span>CORE CAPABILITIES</span><h2>Everything your team needs to keep lending operations moving</h2><p>Connected records give every authorised user the context they need for the next action.</p></div>
        <div className="landing-card-grid">{capabilities.map(([title, description, Icon, href]) => <a href={href} className="landing-capability-card" key={title}><span><Icon size={23} /></span><h3>{title}</h3><p>{description}</p><em>Explore the workflow <ArrowRight size={16} /></em></a>)}</div>
      </div></section>

      <section id="workflow" className="landing-section landing-workflow"><div className="landing-shell">
        <div className="landing-section-intro"><span>HOW INRFS WORKS</span><h2>A clear path from customer onboarding to reporting</h2><p>Six connected steps keep account activity structured and easier to follow.</p></div>
        <ol className="landing-workflow-grid">{workflow.map(([title, description, Icon], index) => <li key={title}><div className="landing-step-head"><span>{String(index + 1).padStart(2, '0')}</span><Icon size={21} /></div><h3>{title}</h3><p>{description}</p></li>)}</ol>
      </div></section>

      <section id="benefits" className="landing-section landing-benefits"><div className="landing-shell">
        <div className="landing-section-intro"><span>BUILT FOR DAILY OPERATIONS</span><h2>More control, fewer manual handoffs</h2><p>Help your team work from the same financial picture throughout the loan lifecycle.</p></div>
        <div className="landing-benefit-grid">{benefits.map(([title, description, Icon]) => <article key={title}><span><Icon size={22} /></span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
      </div></section>

      <section id="security" className="landing-section landing-security"><div className="landing-shell">
        <div className="landing-section-intro"><span>SECURITY & TRUST</span><h2>Practical controls for sensitive financial work</h2><p>Clear statements about the controls present in the application—and where deployment terms still need confirmation.</p></div>
        <div className="landing-security-grid">{securityItems.map(([title, description, Icon]) => <article key={title}><span><Icon size={22} /></span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
      </div></section>

      <section id="pricing" className="landing-section landing-pricing"><div className="landing-shell landing-pricing-card">
        <div className="landing-price-badge"><IndianRupee size={27} /><strong>1%</strong><span>default platform fee</span></div>
        <div><span className="landing-section-label">STRAIGHTFORWARD PRICING</span><h2>Pay 1% of interest collected</h2><p>The default platform fee is calculated on customer interest collected during the billing period—not on loan principal. If you collect <strong>₹50,000</strong> in interest, the fee is <strong>₹500</strong>.</p><p className="landing-pricing-note">Taxes, billing frequency, exceptions, minimum charges, and custom pricing are not confirmed publicly and must be agreed in your commercial terms.</p><a className="landing-primary-button" href="mailto:support@inrfs.in?subject=INRFS%20pricing%20details">Talk to Sales <ArrowRight size={18} /></a></div>
      </div></section>

      <section id="faq" className="landing-section landing-faq"><div className="landing-shell landing-faq-grid"><div className="landing-faq-copy"><span className="landing-section-label">FAQ</span><h2>Answers before you get started</h2><p>Account access, verification, data, repayments, pricing, roles, exports, and support.</p><a href="mailto:support@inrfs.in"><LifeBuoy size={18} /> Contact support</a></div><FaqAccordion items={faqs} /></div></section>

      <section className="landing-final-cta"><div className="landing-shell"><div><span>SEE THE WORKFLOW IN ACTION</span><h2>Bring your lending operations into one connected workspace.</h2><p>Book a guided walkthrough, or create an account to begin the verification process.</p></div><div><a className="landing-primary-button light" href="mailto:support@inrfs.in?subject=INRFS%20demo%20request">Book a Demo <ArrowRight size={18} /></a><Link className="landing-secondary-button light" to="/financer/login?mode=register">Create Account</Link></div></div></section>
    </main>

    <footer className="landing-footer"><div className="landing-shell"><div className="landing-footer-grid">
      <div className="landing-footer-company"><strong>INRFS</strong><span>Financer Platform</span><p>A connected workspace for customer records, loans, repayments, ledgers, overdue accounts, and reports.</p></div>
      <div><h2>Product</h2><a href="#capabilities">Capabilities</a><a href="#workflow">How it works</a><a href="#pricing">Pricing</a><Link to="/financer/login">Financer Sign In</Link><Link to="/admin/login">Admin Sign In</Link></div>
      <div><h2>Trust & legal</h2><a href="#security">Security</a><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link><a href="#account-information">Account deletion & cancellation</a></div>
      <div id="account-information"><h2>Contact</h2><a href="mailto:support@inrfs.in">support@inrfs.in</a><Link to="/financer/login">In-platform support</Link><a href="mailto:support@inrfs.in?subject=Account%20cancellation%20or%20data%20export">Cancellation & data export</a><a href="mailto:support@inrfs.in?subject=INRFS%20demo%20request">Product walkthrough</a></div>
    </div><div className="landing-footer-bottom"><span>&copy; {new Date().getFullYear()} INRFS Financer Platform.</span><span><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms">Terms of Service</Link></span></div></div></footer>
  </div>;
}
