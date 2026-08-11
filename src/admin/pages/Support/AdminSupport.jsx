import React from 'react';
import { HelpCircle, Mail, Phone, ShieldCheck } from 'lucide-react';
import Button from '../../../common/components/Button';
import './AdminSupport.css';

export default function AdminSupport() {
  return (
    <div className="admin-support-page animate-fade-in">
      <div className="admin-support-header">
        <div>
          <h1 className="admin-support-title">Platform Support Desk</h1>
          <p className="admin-support-subtitle">Priority technical assistance for registered financial partners.</p>
        </div>
      </div>

      <div className="admin-support-grid">
        <div className="admin-support-card">
          <ShieldCheck size={32} className="admin-sup-icon" />
          <h3>System SLA Monitor</h3>
          <p>99.98% Platform Uptime Guaranteed</p>
        </div>
        <div className="admin-support-card">
          <Mail size={32} className="admin-sup-icon" />
          <h3>Admin Emergency Email</h3>
          <p>admin-ops@inrfs.com</p>
        </div>
      </div>
    </div>
  );
}
