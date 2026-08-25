import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronDown, LogOut, Menu, Search, ShieldCheck, UserRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/authState';
import { pageItems, platformApi } from '../../common/services/platformApi';
import './AdminHeader.css';

const destinations = [
  ['Dashboard', '/admin/dashboard', 'overview analytics'],
  ['Financers', '/admin/financers', 'business organizations kyc'],
  ['Usage Analytics', '/admin/financers?tab=usage', 'interest platform fee'],
  ['Service Charges', '/admin/service-charges', 'rates pricing'],
  ['Monthly Billing', '/admin/monthly-billing', 'invoices statements'],
  ['Collections', '/admin/collections', 'due overdue agents promises reminders'],
  ['Reports', '/admin/reports', 'export billing'],
  ['Support', '/admin/support', 'tickets help'],
  ['Announcements', '/admin/notifications', 'alerts notifications'],
  ['Operations', '/admin/operations', 'health audit sessions'],
  ['Settings', '/admin/settings', 'security configuration profile'],
];

const pageTitle = (pathname) => destinations.find(([, path]) => path.split('?')[0] === pathname)?.[0] || 'Administration';

export default function AdminHeader({ onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const containerRef = useRef(null);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [openMenu, setOpenMenu] = useState('');

  const loadNotifications = () => {
    platformApi.notifications.list({ pageSize: 10 })
      .then((payload) => setNotifications(pageItems(payload)))
      .catch(() => setNotifications([]));
  };

  useEffect(() => {
    loadNotifications();
    const handleUpdate = () => loadNotifications();
    window.addEventListener('inrfs-notification-updated', handleUpdate);
    return () => window.removeEventListener('inrfs-notification-updated', handleUpdate);
  }, [location.pathname]);

  useEffect(() => {
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'mousedown' && containerRef.current?.contains(event.target)) return;
      setOpenMenu('');
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, []);

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return destinations.filter(([label, , keywords]) => `${label} ${keywords}`.toLowerCase().includes(term)).slice(0, 6);
  }, [search]);
  const unread = notifications.filter((item) => !item.readAt).length;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.email || 'Administrator';
  const initials = [user?.firstName, user?.lastName].filter(Boolean).map((value) => value[0]).join('').slice(0, 2).toUpperCase() || 'A';
  const role = user?.roles?.[0] || 'Administrator';

  const go = (path, state) => { navigate(path, { state }); setSearch(''); setOpenMenu(''); };
  const handleLogout = async () => { await logout(); navigate('/admin/login', { replace: true }); };
  const openNotification = async (item) => {
    if (!item.readAt) {
      await platformApi.notifications.read(item.id).catch(() => {});
      setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, readAt: new Date().toISOString() } : entry));
    }
    go('/admin/notifications', { selectedConcernId: item.concernId || item.entityId });
  };

  return (
    <header className="inrfs-admin-header" ref={containerRef}>
      <div className="inrfs-admin-header-left">
        <button type="button" className="inrfs-admin-header-menu-btn" onClick={onToggleSidebar} aria-label="Open admin navigation"><Menu size={22} /></button>
        <div className="inrfs-admin-header-context"><span>Admin workspace</span><strong>{pageTitle(location.pathname)}</strong></div>
      </div>

      <div className="inrfs-admin-header-search">
        <Search size={18} aria-hidden="true" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} onFocus={() => setOpenMenu('search')}
          onKeyDown={(event) => { if (event.key === 'Enter' && matches[0]) go(matches[0][1]); }}
          placeholder="Search admin pages…" aria-label="Search admin pages" autoComplete="off" />
        {openMenu === 'search' && search && <div className="inrfs-admin-header-popover inrfs-admin-search-results">
          {matches.length ? matches.map(([label, path]) => <button type="button" key={path} onClick={() => go(path)}><Search size={15}/><span>{label}</span></button>) : <p>No matching admin page</p>}
        </div>}
      </div>

      <div className="inrfs-admin-header-right">
        <div className="inrfs-admin-header-control">
          <button type="button" className="inrfs-admin-header-notification-btn" onClick={() => setOpenMenu(openMenu === 'notifications' ? '' : 'notifications')} aria-expanded={openMenu === 'notifications'} aria-label={`${unread} unread notifications`}>
            <Bell size={19}/>{unread > 0 && <span className="inrfs-admin-notification-count">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {openMenu === 'notifications' && <div className="inrfs-admin-header-popover inrfs-admin-notifications-menu">
            <div><strong>Notifications</strong><button type="button" onClick={() => go('/admin/notifications')}>View all</button></div>
            {notifications.length ? notifications.slice(0, 5).map((item) => <button type="button" key={item.id} className={item.readAt ? '' : 'unread'} onClick={() => openNotification(item)}><span>{item.title}</span><small>{item.message}</small></button>) : <p>No notifications</p>}
          </div>}
        </div>
        <div className="inrfs-admin-header-control">
          <button type="button" className="inrfs-admin-header-profile" onClick={() => setOpenMenu(openMenu === 'profile' ? '' : 'profile')} aria-expanded={openMenu === 'profile'} aria-label="Open administrator menu">
            {user?.profileImageDataUrl ? <img src={user.profileImageDataUrl} alt=""/> : <span>{initials}</span>}<ChevronDown size={14}/>
          </button>
          {openMenu === 'profile' && <div className="inrfs-admin-header-popover inrfs-admin-profile-menu">
            <div className="inrfs-admin-profile-summary"><span>{initials}</span><div><strong>{fullName}</strong><small>{role}</small></div></div>
            <button type="button" onClick={() => go('/admin/settings')}><UserRound size={16}/>Profile &amp; security settings</button>
            <button type="button" onClick={() => go('/admin/operations')}><ShieldCheck size={16}/>Sessions and audit</button>
            <button type="button" className="logout" onClick={handleLogout}><LogOut size={16}/>Sign out</button>
          </div>}
        </div>
      </div>
    </header>
  );
}
