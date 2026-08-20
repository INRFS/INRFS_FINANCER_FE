import React, { useCallback, useEffect, useState } from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { platformApi, pageItems } from '../../common/services/platformApi';
import './FinancerHeader.css';

export default function FinancerHeader({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const refreshUnread = useCallback(() => {
    platformApi.notifications.list({ status: 'unread', pageSize: 1 })
      .then((payload) => setHasUnreadNotifications(pageItems(payload).length > 0))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshUnread();
    const interval = window.setInterval(refreshUnread, 30000);
    window.addEventListener('focus', refreshUnread);
    window.addEventListener('inrfs:notifications-updated', refreshUnread);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshUnread);
      window.removeEventListener('inrfs:notifications-updated', refreshUnread);
    };
  }, [refreshUnread]);
  const submitSearch = async (event) => {
    event.preventDefault();
    const value = search.trim();
    if (!value) return;
    setSearching(true);
    try {
      const customers = await platformApi.customers.list({ search: value, pageSize: 1 });
      navigate(pageItems(customers).length ? '/financer/customers' : '/financer/loans', { state: { search: value } });
    } finally { setSearching(false); }
  };
  return (
    <header className="fin-header">
      <div className="fin-header-left">
        <button type="button" className="fin-header-menu-btn" onClick={onToggleSidebar} aria-label="Open navigation">
          <Menu size={22} />
        </button>
        <form className="fin-header-search" onSubmit={submitSearch} role="search">
          <Search size={16} className="fin-header-search-icon" />
          <input aria-label="Search loans and customers" value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder={searching ? 'Searching…' : 'Quick search loans, customers...'} />
        </form>
      </div>

      <div className="fin-header-right">
        <button type="button" className="fin-header-notif-btn" aria-label="Notifications" onClick={() => navigate('/financer/notifications')}>
          <Bell size={20} />
          {hasUnreadNotifications && <span className="fin-header-notif-dot" />}
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
