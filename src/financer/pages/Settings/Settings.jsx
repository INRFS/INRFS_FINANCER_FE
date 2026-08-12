import React, { useState } from 'react';
import { CheckCircle, Shield, User, Bell, MessageSquare } from 'lucide-react';
import Button from '../../../common/components/Button';
import { mockFinancerProfile } from '../../data/mockFinancerData';
import './Settings.css';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [profile, setProfile] = useState(mockFinancerProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [notifications, setNotifications] = useState({
    duePayment: true,
    overdue: true,
    paymentReceived: true,
    smsStatus: true,
    weeklySummary: true,
  });

  const tabs = [
    {
      name: 'Profile',
      icon: User,
    },
    // {
    //   name: 'Notifications',
    //   icon: Bell,
    // },
    // {
    //   name: 'SMS Settings',
    //   icon: MessageSquare,
    // },
    // {
    //   name: 'Security',
    //   icon: Shield,
    // },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    setSavedSuccess(true);

    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="fin-settings-page animate-fade-in">

      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="fin-settings-header">
        <div>
          <h1 className="fin-settings-title">Settings</h1>
          <p className="fin-settings-subtitle">
            Manage your account and preferences
          </p>
        </div>
      </div>


      {/* =========================================================
          TABS
      ========================================================= */}
      <div className="fin-settings-tabs-wrapper">
        <div className="fin-settings-tabs">
          {tabs.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              className={`fin-settings-tab ${
                activeTab === name ? 'fin-settings-tab-active' : ''
              }`}
              onClick={() => setActiveTab(name)}
            >
              <Icon className="fin-settings-tab-icon" size={17} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>


      {/* =========================================================
          PROFILE
      ========================================================= */}
      {activeTab === 'Profile' && (
        <div className="fin-settings-profile-card animate-fade-in">

          {/* Profile header */}
          <div className="fin-settings-profile-top">
            <div className="fin-settings-avatar">
              {profile.avatarLetter}
            </div>

            <div className="fin-settings-identity">
              <h2 className="fin-settings-name">
                {profile.name}
              </h2>

              <span className="fin-settings-plan-badge">
                {profile.plan}
              </span>
            </div>
          </div>


          {/* Success message */}
          {savedSuccess && (
            <div className="fin-settings-toast">
              <CheckCircle size={17} />
              <span>Profile changes saved successfully!</span>
            </div>
          )}


          {/* Profile form */}
          <form
            onSubmit={handleSubmit}
            className="fin-settings-form"
          >
            <div className="fin-settings-form-grid">

              {/* Full Name */}
              <div className="fin-settings-input-group">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>


              {/* Business Name */}
              <div className="fin-settings-input-group">
                <label htmlFor="businessName">
                  Business Name
                </label>

                <input
                  id="businessName"
                  type="text"
                  value={profile.businessName}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      businessName: e.target.value,
                    })
                  }
                  required
                />
              </div>


              {/* Mobile */}
              <div className="fin-settings-input-group">
                <label htmlFor="mobile">
                  Mobile
                </label>

                <input
                  id="mobile"
                  type="text"
                  value={profile.mobile}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      mobile: e.target.value,
                    })
                  }
                  required
                />
              </div>


              {/* Email */}
              <div className="fin-settings-input-group">
                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </div>


              {/* City */}
              <div className="fin-settings-input-group">
                <label htmlFor="city">
                  City
                </label>

                <input
                  id="city"
                  type="text"
                  value={profile.city}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      city: e.target.value,
                    })
                  }
                  required
                />
              </div>


              {/* State */}
              <div className="fin-settings-input-group">
                <label htmlFor="state">
                  State
                </label>

                <input
                  id="state"
                  type="text"
                  value={profile.state}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      state: e.target.value,
                    })
                  }
                  required
                />
              </div>

            </div>


            {/* Save */}
            <div className="fin-settings-actions">
              <Button
                type="submit"
                variant="cyan"
                size="large"
              >
                Save Changes
              </Button>
            </div>
          </form>

        </div>
      )}


      {/* =========================================================
          NOTIFICATIONS
      ========================================================= */}
      {activeTab === 'Notifications' && (
        <div className="fin-settings-panel fin-settings-notification-panel animate-fade-in">

          <h3>Notification Preferences</h3>

          <div className="fin-settings-toggle-list">

            {/* Due payment */}
            <div className="fin-settings-toggle-item">
              <span>Due payment reminders</span>

              <button
                type="button"
                role="switch"
                aria-checked={notifications.duePayment}
                className={`fin-settings-switch ${
                  notifications.duePayment
                    ? 'fin-settings-switch-active'
                    : ''
                }`}
                onClick={() =>
                  handleNotificationChange('duePayment')
                }
              >
                <span className="fin-settings-switch-knob" />
              </button>
            </div>


            {/* Overdue */}
            <div className="fin-settings-toggle-item">
              <span>Overdue alerts</span>

              <button
                type="button"
                role="switch"
                aria-checked={notifications.overdue}
                className={`fin-settings-switch ${
                  notifications.overdue
                    ? 'fin-settings-switch-active'
                    : ''
                }`}
                onClick={() =>
                  handleNotificationChange('overdue')
                }
              >
                <span className="fin-settings-switch-knob" />
              </button>
            </div>


            {/* Payment received */}
            <div className="fin-settings-toggle-item">
              <span>Payment received</span>

              <button
                type="button"
                role="switch"
                aria-checked={notifications.paymentReceived}
                className={`fin-settings-switch ${
                  notifications.paymentReceived
                    ? 'fin-settings-switch-active'
                    : ''
                }`}
                onClick={() =>
                  handleNotificationChange('paymentReceived')
                }
              >
                <span className="fin-settings-switch-knob" />
              </button>
            </div>


            {/* SMS */}
            <div className="fin-settings-toggle-item">
              <span>SMS delivery status</span>

              <button
                type="button"
                role="switch"
                aria-checked={notifications.smsStatus}
                className={`fin-settings-switch ${
                  notifications.smsStatus
                    ? 'fin-settings-switch-active'
                    : ''
                }`}
                onClick={() =>
                  handleNotificationChange('smsStatus')
                }
              >
                <span className="fin-settings-switch-knob" />
              </button>
            </div>


            {/* Weekly */}
            <div className="fin-settings-toggle-item">
              <span>Weekly summary</span>

              <button
                type="button"
                role="switch"
                aria-checked={notifications.weeklySummary}
                className={`fin-settings-switch ${
                  notifications.weeklySummary
                    ? 'fin-settings-switch-active'
                    : ''
                }`}
                onClick={() =>
                  handleNotificationChange('weeklySummary')
                }
              >
                <span className="fin-settings-switch-knob" />
              </button>
            </div>

          </div>
        </div>
      )}


      {/* =========================================================
          SMS SETTINGS
      ========================================================= */}
      {activeTab === 'SMS Settings' && (
        <div className="fin-settings-panel fin-settings-sms-panel animate-fade-in">

          <h3>SMS Settings</h3>


          {/* Credits */}
          <div className="fin-settings-sms-credit-box">

            <span className="fin-settings-credit-label">
              SMS Credits Remaining
            </span>

            <strong className="fin-settings-credit-number">
              760 credits
            </strong>

            <span className="fin-settings-credit-plan">
              Premium Plan · 2,000/month
            </span>

          </div>


          {/* Sender ID */}
          <div className="fin-settings-sms-field">
            <label htmlFor="senderId">
              Sender ID
            </label>

            <input
              id="senderId"
              type="text"
              value="INRFS"
              readOnly
            />
          </div>


          {/* Template */}
          <div className="fin-settings-sms-field">
            <label htmlFor="smsTemplate">
              Default SMS Template
            </label>

            <textarea
              id="smsTemplate"
              defaultValue={
                'Dear {name}, your interest payment of ₹{amount} is due on {date}. - INRFS'
              }
              rows={3}
            />
          </div>

        </div>
      )}


      {/* =========================================================
          SECURITY
      ========================================================= */}
      {activeTab === 'Security' && (
        <div className="fin-settings-panel fin-settings-security-panel animate-fade-in">

          <h3>Security</h3>

          <p className="fin-settings-security-description">
            Your account uses Mobile OTP authentication.
            No password is required.
          </p>


          <div className="fin-settings-security-status">

            <Shield size={22} />

            <span>
              OTP-secured account
            </span>

          </div>

        </div>
      )}

    </div>
  );
}