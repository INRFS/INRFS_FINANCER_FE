import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Banknote,
  ShieldAlert,
} from "lucide-react";

import Button from "../../../common/components/Button";
import { platformApi, pageItems } from "../../../common/services/platformApi";
import { useApiQuery } from "../../../common/hooks/useApiQuery";

import "./Notifications.css";

export default function Notifications() {
  const navigate = useNavigate();
  const { data, setData, loading, error, refetch } = useApiQuery(
    () => platformApi.notifications.list({ pageSize: 100 }), { items: [] }
  );
  const items = pageItems(data).map((notification) => ({
    ...notification,
    category: notification.category || notification.type || "System",
    isRead: notification.isRead ?? Boolean(notification.readAt),
  }));

  const [activeCategory, setActiveCategory] =
    useState("All");

  const categories = [
    "All",
    "Payments",
    "Loans",
    "Overdue",
    "Support",
    "Service Charges",
    "System",
  ];

  const filtered = items.filter(
    (notification) =>
      activeCategory === "All" ||
      notification.category === activeCategory
  );

  const handleMarkAllRead = async () => {
    await platformApi.notifications.readAll();
    setData({ ...data, items: items.map((notification) => ({ ...notification, isRead: true })) });
    window.dispatchEvent(new Event('inrfs:notifications-updated'));
  };

  const handleNotification = async (item) => {
    const id = item.id;
    if (!item.isRead) {
      await platformApi.notifications.read(id);
      setData({ ...data, items: items.map((notification) => notification.id === id ? { ...notification, isRead: true, readAt: new Date().toISOString() } : notification) });
      window.dispatchEvent(new Event('inrfs:notifications-updated'));
    }
    if (item.entityType === 'SupportTicket' && item.entityId)
      navigate('/financer/support', { state: { ticketId: item.entityId } });
    else if (item.entityType === 'Payment' && item.entityId)
      navigate('/financer/payments');
    else if (item.entityType === 'PaymentSchedule' && item.entityId)
      navigate('/financer/due-overdue');
    else if (item.entityType === 'ServiceChargeInvoice' && item.entityId)
      navigate('/financer/service-charge');
  };

  const getIcon = (category) => {
    switch (category) {
      case "Overdue":
        return (
          <ShieldAlert
            size={22}
            className="fin-notifications-icon"
          />
        );

      case "Payments":
        return (
          <CheckCheck
            size={22}
            className="fin-notifications-icon"
          />
        );

      case "Loans":
        return (
          <Banknote
            size={22}
            className="fin-notifications-icon"
          />
        );

      case "System":
        return (
          <RefreshCw
            size={22}
            className="fin-notifications-icon"
          />
        );

      default:
        return (
          <Bell
            size={22}
            className="fin-notifications-icon"
          />
        );
    }
  };

  return (
    <div className="fin-notifications-page">

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <div className="fin-notifications-header">

        <div className="fin-notifications-header-content">

          <h1 className="fin-notifications-title">
            Notifications Center
          </h1>

          <p className="fin-notifications-subtitle">
            Alerts for due payments, loan approvals
            and system updates.
          </p>

        </div>

        <Button
          variant="secondary"
          icon={CheckCheck}
          onClick={handleMarkAllRead}
        >
          Mark All As Read
        </Button>

      </div>


      {/* =========================================
          CATEGORY TABS
      ========================================= */}

      <div className="fin-notifications-tabs">

        {categories.map((category) => (

          <button
            key={category}
            type="button"
            className={`fin-notifications-tab ${
              activeCategory === category
                ? "fin-notifications-tab-active"
                : ""
            }`}
            onClick={() =>
              setActiveCategory(category)
            }
          >
            {category}
          </button>

        ))}

      </div>


      {/* =========================================
          NOTIFICATIONS LIST
      ========================================= */}

      <div className="fin-notifications-list">

        {loading ? <div className="fin-notifications-empty"><p>Loading notifications...</p></div> : error ? <div className="fin-notifications-empty"><AlertCircle /><h3>Could not load notifications</h3><p>{error.message}</p><Button onClick={refetch}>Try again</Button></div> : filtered.length > 0 ? (

          filtered.map((item) => (

            <div
              key={item.id}
              className={`fin-notifications-card ${
                !item.isRead
                  ? "fin-notifications-unread"
                  : ""
              }`}
              onClick={() => handleNotification(item)}
            >

              {/* Icon */}

              <div
                className={`fin-notifications-icon-wrapper fin-notifications-${item.category.toLowerCase().replaceAll(' ', '-')}`}
              >
                {getIcon(item.category)}
              </div>


              {/* Content */}

              <div className="fin-notifications-content">

                <div className="fin-notifications-top-row">

                  <h4 className="fin-notifications-card-title">
                    {item.title}
                  </h4>

                  <span className="fin-notifications-time">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                  </span>

                </div>


                <p className="fin-notifications-message">
                  {item.message}
                </p>

              </div>


              {/* Unread Indicator */}

              {!item.isRead && (
                <span
                  className="fin-notifications-dot"
                  title="Unread"
                />
              )}

            </div>

          ))

        ) : (

          <div className="fin-notifications-empty">

            <div className="fin-notifications-empty-icon">
              <Bell size={28} />
            </div>

            <h3>
              No notifications
            </h3>

            <p>
              There are no notifications in this
              category.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}
