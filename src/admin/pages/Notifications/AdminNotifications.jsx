import React from 'react';
import { Bell, ShieldAlert, CheckCircle2, Building2 } from 'lucide-react';
import './AdminNotifications.css';

export default function AdminNotifications() {
  const alerts = [
    { id: 1, title: 'New Financer KYC Submission', msg: 'City FinCorp India uploaded business PAN & GST documents for review.', time: '1 hour ago', type: 'kyc' },
    { id: 2, title: 'API Gateway Spike', msg: 'High transaction rate detected on Ahmedabad cluster.', time: '3 hours ago', type: 'system' },
    { id: 3, title: 'Platform Payout Processed', msg: 'Monthly platform settlement completed for 142 institutions.', time: '1 day ago', type: 'success' },
  ];

  return (
    <div className="admin-notifications-page animate-fade-in">
      <div className="admin-notifications-header">
        <div>
          <h1 className="admin-notifications-title">System Audit Alerts</h1>
          <p className="admin-notifications-subtitle">Real-time alerts regarding platform security, KYC submissions & system health.</p>
        </div>
      </div>

      <div className="admin-notifications-list">
        {alerts.map((a) => (
          <div key={a.id} className="admin-notifications-card">
            <div className="admin-notifications-icon">
              {a.type === 'kyc' ? <Building2 size={20} className="admin-notif-purple" /> : <ShieldAlert size={20} className="admin-notif-cyan" />}
            </div>
            <div className="admin-notifications-body">
              <div className="admin-notifications-top">
                <h4>{a.title}</h4>
                <span className="admin-notifications-time">{a.time}</span>
              </div>
              <p>{a.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
