import React from 'react';
import { Menu, Bell, Plus, Search } from 'lucide-react';
import Button from '../../common/components/Button';
import './FinancerHeader.css';

export default function FinancerHeader({ onToggleSidebar, onQuickPayment }) {
  return (
    <header className="fin-header">
      <div className="fin-header-left">
        <button className="fin-header-menu-btn" onClick={onToggleSidebar}>
          <Menu size={22} />
        </button>
        <div className="fin-header-search">
          <Search size={16} className="fin-header-search-icon" />
          <input type="text" placeholder="Quick search loans, customers..." />
        </div>
      </div>

      <div className="fin-header-right">
        <button className="fin-header-notif-btn" title="Notifications">
          <Bell size={20} />
          <span className="fin-header-notif-dot" />
        </button>

        {/* <Button
          variant="cyan"
          size="medium"
          icon={Plus}
          onClick={onQuickPayment}
        >
          Record Payment
        </Button> */}
      </div>
    </header>
  );
}
