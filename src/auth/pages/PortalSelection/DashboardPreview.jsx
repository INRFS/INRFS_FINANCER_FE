import React from 'react';
import { AlertTriangle, ArrowUpRight, CalendarDays, IndianRupee, MoreHorizontal, ReceiptIndianRupee, UsersRound } from 'lucide-react';

export default function DashboardPreview() {
  return <figure className="landing-dashboard-frame"><div className="landing-dashboard" role="img" aria-label="INRFS dashboard product preview showing realistic sample financial data">
    <div className="landing-dashboard-top"><div><span className="landing-dashboard-mark">I</span><strong>INRFS Workspace</strong></div><span>August overview</span><MoreHorizontal size={18} /></div>
    <div className="landing-dashboard-body">
      <aside aria-hidden="true"><span className="active" /><span /><span /><span /><span /></aside>
      <div className="landing-dashboard-content">
        <div className="landing-dashboard-welcome"><div><small>FINANCIAL OVERVIEW</small><strong>Good afternoon</strong><span>Here is today&apos;s account activity.</span></div><button type="button" tabIndex="-1"><CalendarDays size={14} /> This month</button></div>
        <div className="landing-dashboard-kpis">
          <article><span><IndianRupee size={17} /></span><small>OUTSTANDING PRINCIPAL</small><strong>₹8,42,000</strong><em><ArrowUpRight size={12} /> 64 active loans</em></article>
          <article><span><AlertTriangle size={17} /></span><small>OVERDUE LOANS</small><strong>₹76,400</strong><em className="neutral">9 accounts</em></article>
          <article><span><ReceiptIndianRupee size={17} /></span><small>RECENT COLLECTIONS</small><strong>₹1,18,600</strong><em><ArrowUpRight size={12} /> This month</em></article>
          <article><span><UsersRound size={17} /></span><small>ACTIVE CUSTOMERS</small><strong>128</strong><em>Across 64 loans</em></article>
        </div>
        <div className="landing-dashboard-lower">
          <article className="landing-preview-chart"><div><strong>Repayment activity</strong><small>Six-month collection trend</small></div><div className="landing-chart-bars" aria-hidden="true"><span style={{height:'44%'}} /><span style={{height:'61%'}} /><span style={{height:'53%'}} /><span style={{height:'76%'}} /><span style={{height:'68%'}} /><span style={{height:'90%'}} /></div><div className="landing-chart-labels"><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div></article>
          <article className="landing-preview-activity"><div><strong>Recent payments</strong><small>Latest ledger entries</small></div>{[['A','Account payment','INR 12,500'],['R','Repayment received','INR 8,200'],['S','Scheduled payment','INR 6,750']].map(([initial,label,value]) => <p key={label}><span>{initial}</span><em>{label}<small>Processed</small></em><strong>{value}</strong></p>)}</article>
        </div>
      </div>
    </div>
  </div><figcaption>INRFS dashboard preview with illustrative sample data</figcaption></figure>;
}
