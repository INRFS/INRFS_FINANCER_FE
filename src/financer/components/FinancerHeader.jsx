import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu, Bell, Search, Users, CreditCard, CalendarDays, BookOpen, BarChart3, Percent, Headphones, Settings, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { platformApi, pageItems } from '../../common/services/platformApi';
import './FinancerHeader.css';

const SIDEBAR_ITEMS = [
  {
    label: 'Dashboard',
    path: '/financer/dashboard',
    keywords: 'dashboard home overview',
    icon: LayoutDashboard,
  },
  {
    label: 'Customers',
    path: '/financer/customers',
    keywords: 'customers customer users clients',
    icon: Users,
  },
  {
    label: 'Loans',
    path: '/financer/loans',
    keywords: 'loans loan lending',
    icon: CreditCard,
  },
  {
    label: 'Upcoming Dues',
    path: '/financer/upcoming-dues',
    keywords: 'upcoming dues payments emi repayment',
    icon: CalendarDays,
  },
  {
    label: 'Customer Ledger',
    path: '/financer/customer-ledger',
    keywords: 'customer ledger transactions history',
    icon: BookOpen,
  },
  {
    label: 'Reports',
    path: '/financer/reports',
    keywords: 'reports analytics report',
    icon: BarChart3,
  },
  {
    label: 'Service Charge',
    path: '/financer/service-charge',
    keywords: 'service charge charges fee fees',
    icon: Percent,
  },
  {
    label: 'Support',
    path: '/financer/support',
    keywords: 'support help',
    icon: Headphones,
  },
  {
    label: 'Settings',
    path: '/financer/settings',
    keywords: 'settings configuration preferences',
    icon: Settings,
  },
];

export default function FinancerHeader({ onToggleSidebar }) {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [customerResults, setCustomerResults] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const refreshUnread = useCallback(() => {
    platformApi.notifications
      .list({ status: 'unread', pageSize: 1 })
      .then((payload) => {
        setHasUnreadNotifications(pageItems(payload).length > 0);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshUnread();

    const interval = window.setInterval(refreshUnread, 30000);

    window.addEventListener('focus', refreshUnread);
    window.addEventListener(
      'inrfs:notifications-updated',
      refreshUnread
    );

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshUnread);
      window.removeEventListener(
        'inrfs:notifications-updated',
        refreshUnread
      );
    };
  }, [refreshUnread]);

  /*
   * Sidebar search
   */
  const filteredSidebarItems = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return [];

    return SIDEBAR_ITEMS.filter((item) => {
      return (
        item.label.toLowerCase().includes(value) ||
        item.keywords.toLowerCase().includes(value)
      );
    });
  }, [search]);

  /*
   * Customer search
   */
  useEffect(() => {
    const value = search.trim();

    if (!value) {
      setCustomerResults([]);
      setSearching(false);
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(async () => {
      setSearching(true);

      try {
        const payload = await platformApi.customers.list({
          search: value,
          pageSize: 5,
        });

        if (!cancelled) {
          setCustomerResults(pageItems(payload));
        }
      } catch {
        if (!cancelled) {
          setCustomerResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search]);

  const openPage = (path) => {
    setSearch('');
    setShowResults(false);
    navigate(path);
  };

  const openCustomer = (customer) => {
    setSearch('');
    setShowResults(false);

    /*
     * If your customer details route is different,
     * change this path accordingly.
     */
    const customerId =
      customer.id ||
      customer.customerId ||
      customer._id;

    if (customerId) {
      navigate(`/financer/customers/${customerId}`);
    } else {
      navigate('/financer/customers', {
        state: { search: search.trim() },
      });
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();

    const value = search.trim();

    if (!value) return;

    /*
     * First priority:
     * matching sidebar page
     */
    if (filteredSidebarItems.length > 0) {
      openPage(filteredSidebarItems[0].path);
      return;
    }

    /*
     * Second priority:
     * matching customer
     */
    if (customerResults.length > 0) {
      openCustomer(customerResults[0]);
      return;
    }

    /*
     * Nothing found:
     * send user to customers with the search preserved.
     */
    navigate('/financer/customers', {
      state: { search: value },
    });

    setShowResults(false);
  };

  const hasResults =
    filteredSidebarItems.length > 0 ||
    customerResults.length > 0;

  return (
    <header className="fin-header">
      <div className="fin-header-left">

        <button
          type="button"
          className="fin-header-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <form
          className="fin-header-search"
          onSubmit={submitSearch}
          role="search"
        >
          <Search
            size={16}
            className="fin-header-search-icon"
          />

          <input
            aria-label="Search loans, customers and pages"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              if (search.trim()) {
                setShowResults(true);
              }
            }}
            type="search"
            placeholder={
              searching
                ? 'Searching…'
                : 'Quick search loans, customers...'
            }
          />

          {showResults && search.trim() && (
            <div className="fin-header-search-results">

              {/* PAGES / FUNCTIONS */}
              {filteredSidebarItems.length > 0 && (
                <div className="search-result-section">
                  <div className="search-result-heading">
                    Pages
                  </div>

                  {filteredSidebarItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.path}
                        type="button"
                        className="search-result-item"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          openPage(item.path);
                        }}
                      >
                        <span className="search-result-icon">
                          <Icon size={18} />
                        </span>

                        <span className="search-result-content">
                          <span className="search-result-title">
                            {item.label}
                          </span>

                          <span className="search-result-subtitle">
                            Open {item.label}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* CUSTOMERS */}
              {customerResults.length > 0 && (
                <div className="search-result-section">
                  <div className="search-result-heading">
                    Customers
                  </div>

                  {customerResults.map((customer, index) => {
                    const name =
                      customer.name ||
                      customer.customerName ||
                      customer.fullName ||
                      'Customer';

                    const phone =
                      customer.phone ||
                      customer.mobile ||
                      customer.mobileNumber ||
                      customer.phoneNumber ||
                      '';

                    const id =
                      customer.id ||
                      customer.customerId ||
                      customer._id ||
                      index;

                    return (
                      <button
                        key={id}
                        type="button"
                        className="search-result-item"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          openCustomer(customer);
                        }}
                      >
                        <span className="search-result-icon customer">
                          <Users size={18} />
                        </span>

                        <span className="search-result-content">
                          <span className="search-result-title">
                            {name}
                          </span>

                          {phone && (
                            <span className="search-result-subtitle">
                              {phone}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* NO RESULT */}
              {!searching && !hasResults && (
                <div className="search-no-results">
                  No matching pages or customers found
                </div>
              )}

            </div>
          )}
        </form>
      </div>

      <div className="fin-header-right">
        <button
          type="button"
          className="fin-header-notif-btn"
          aria-label="Notifications"
          onClick={() => navigate('/financer/notifications')}
        >
          <Bell size={20} />

          {hasUnreadNotifications && (
            <span className="fin-header-notif-dot" />
          )}
        </button>
      </div>
    </header>
  );
}