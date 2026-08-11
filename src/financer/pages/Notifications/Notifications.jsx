import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  Banknote,
  ShieldAlert,
} from "lucide-react";

import Button from "../../../common/components/Button";
import { mockNotifications } from "../../data/mockFinancerData";

import "./Notifications.css";

export default function Notifications() {
  const [items, setItems] = useState(
    mockNotifications
  );

  const [activeCategory, setActiveCategory] =
    useState("All");

  const categories = [
    "All",
    "Payments",
    "Loans",
    "Overdue",
    "System",
  ];

  const filtered = items.filter(
    (notification) =>
      activeCategory === "All" ||
      notification.category === activeCategory
  );

  const handleMarkAllRead = () => {
    setItems(
      items.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  };

  const handleToggleRead = (id) => {
    setItems(
      items.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              unread: !notification.unread,
            }
          : notification
      )
    );
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

        {filtered.length > 0 ? (

          filtered.map((item) => (

            <div
              key={item.id}
              className={`fin-notifications-card ${
                item.unread
                  ? "fin-notifications-unread"
                  : ""
              }`}
              onClick={() =>
                handleToggleRead(item.id)
              }
            >

              {/* Icon */}

              <div
                className={`fin-notifications-icon-wrapper fin-notifications-${item.category.toLowerCase()}`}
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
                    {item.time}
                  </span>

                </div>


                <p className="fin-notifications-message">
                  {item.message}
                </p>

              </div>


              {/* Unread Indicator */}

              {item.unread && (
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