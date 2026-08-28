import React, { useState } from 'react';
import { CheckCircle, Shield, Trash2, Upload, User } from 'lucide-react';
import Button from '../../../common/components/Button';
import { platformApi } from '../../../common/services/platformApi';
import { useApiQuery } from '../../../common/hooks/useApiQuery';
import { useAuth } from '../../../auth/authState';
import { isValidEmail, isValidIndianMobile, validateName } from '../../../common/utils/formValidation';
import './Settings.css';

const textValue = (value, fallback = '') =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;

const userFullName = (user) =>
  textValue(user?.fullName) || [textValue(user?.firstName), textValue(user?.lastName)].filter(Boolean).join(' ');

const errorMessage = (error, fallback) =>
  typeof error?.message === 'string'
    ? error.message
    : typeof error === 'string'
      ? error
      : fallback;

export default function Settings() {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile');
  const { data: profileData, loading, error, refetch } = useApiQuery(() => platformApi.profile.get());
  const [profile, setProfile] = useState({ name: '', businessName: '', mobile: '', email: '', city: '', state: '', avatarLetter: '', profileImage: '', plan: '' });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

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

  React.useEffect(() => {
    if (!profileData) return;
    const fullName = userFullName(profileData.user);
    setProfile({
      name: fullName, businessName: textValue(profileData.financer?.displayName),
      mobile: textValue(profileData.user?.phone), email: textValue(profileData.user?.email),
      city: textValue(profileData.financer?.city), state: textValue(profileData.financer?.state),
      avatarLetter: (fullName || 'U').charAt(0), profileImage: textValue(profileData.profileImage),
      plan: textValue(profileData.plan, 'No active plan'),
    });
  }, [profileData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Full name — must be a plausible person name, not numbers-only or symbols
    const nameError = validateName(profile.name, 'Full name');
    if (nameError) { setSaveError(nameError); return; }
    if (!profile.businessName.trim()) {
      setSaveError('Business name is required.');
      return;
    }
    if (profile.businessName.trim().length > 150) {
      setSaveError('Business name must not exceed 150 characters.');
      return;
    }
    if (!isValidIndianMobile(profile.mobile)) {
      setSaveError('Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    if (!isValidEmail(profile.email)) {
      setSaveError('Enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!profile.city.trim()) {
      setSaveError('City is required.');
      return;
    }
    if (!profile.state.trim()) {
      setSaveError('State is required.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      const saved = await platformApi.profile.update({ fullName: profile.name, businessName: profile.businessName, mobile: profile.mobile, email: profile.email, city: profile.city, state: profile.state, profileImageDataUrl: profile.profileImage || null });
      const fullName = userFullName(saved.user);
      setProfile({
        name: fullName, businessName: textValue(saved.financer?.displayName),
        mobile: textValue(saved.user?.phone), email: textValue(saved.user?.email), city: textValue(saved.financer?.city),
        state: textValue(saved.financer?.state), avatarLetter: (fullName || 'U').charAt(0),
        profileImage: textValue(saved.profileImage), plan: textValue(saved.plan, 'No active plan'),
      });
      // A profile response is not an authentication response. Update only the
      // fields shown in the shell so an absent/empty roles collection can never
      // invalidate the active session and trigger the route guard.
      updateUser({
        firstName: saved.user?.firstName,
        lastName: saved.user?.lastName,
        email: saved.user?.email,
        phone: saved.user?.phone,
        profileImage: saved.profileImage || '',
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (reason) {
      setSaveError(errorMessage(reason, 'Unable to save profile changes.'));
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setSaveError('Choose a valid image file.');
    if (file.size > 2 * 1024 * 1024) return setSaveError('Profile photo must be 2 MB or smaller.');
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((current) => ({ ...current, profileImage: String(reader.result || '') }));
      setSaveError('');
    };
    reader.readAsDataURL(file);
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
          {loading && <p>Loading profile...</p>}
          {error && <div><p>{errorMessage(error, 'Unable to load profile.')}</p><Button onClick={refetch}>Try again</Button></div>}

          {/* Profile header */}
          <div className="fin-settings-profile-top">
            <div className="fin-settings-photo-block">
              <div className="fin-settings-avatar">
                {profile.profileImage ? <img src={profile.profileImage} alt="Profile" /> : profile.avatarLetter}
              </div>
              <div className="fin-settings-photo-actions">
                <label className="fin-settings-photo-button">
                  <Upload size={15} /> {profile.profileImage ? 'Change photo' : 'Add photo'}
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePhotoChange} />
                </label>
                {profile.profileImage && (
                  <button type="button" className="fin-settings-photo-remove" onClick={() => setProfile((current) => ({ ...current, profileImage: '' }))}>
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
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
            <div className="fin-settings-toast" role="status" aria-live="polite">
              <CheckCircle size={17} />
              <span>Details saved successfully</span>
            </div>
          )}
          {saveError && <div className="fin-settings-error" role="alert">{saveError}</div>}


          {/* Profile form */}
          <form
            onSubmit={handleSubmit}
            className="fin-settings-form"
          >
            <div className="fin-settings-form-grid">

              {/* Full Name */}
              <div className="fin-settings-input-group">
                <label htmlFor="fullName">
                  Full Name <span aria-hidden="true">*</span>
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
                  placeholder="Suresh Patel"
                  maxLength={100}
                  autoComplete="name"
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
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
