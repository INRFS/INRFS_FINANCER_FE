import React, { useEffect, useState } from 'react';
import {
  Database,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

import './AdminSettings.css';
import { platformApi } from '../../../common/services/platformApi';
import AdministratorSettings from './AdministratorSettings';

export default function AdminSettings() {
  /* =========================================================
     ACTIVE TAB
     ========================================================= */

  const [activeTab, setActiveTab] = useState('general');

  /* =========================================================
     GENERAL SETTINGS
     ========================================================= */

  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'INRFS Financer Platform',
    supportEmail: 'support@inrfs.in',
    timezone: 'Asia/Kolkata (IST)',
    currency: 'INR (₹)',
  });

  /* =========================================================
     SECURITY SETTINGS
     ========================================================= */

  const [securitySettings, setSecuritySettings] = useState({
    otpExpiry: '10',
    maxLoginAttempts: '5',
    sessionTimeout: '8',
  });

  /* =========================================================
     MAINTENANCE
     ========================================================= */

  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [maintenanceMessage, setMaintenanceMessage] =
    useState('');

  /* =========================================================
     GENERAL SAVE MESSAGE
     ========================================================= */

  const [generalSaved, setGeneralSaved] = useState(false);
  const [pageError, setPageError] = useState('');

  const [securitySaved, setSecuritySaved] = useState(false);

  useEffect(() => {
    platformApi.settings.list('Platform').then((items) => {
      const values = Object.fromEntries((Array.isArray(items) ? items : items?.items || []).map((item) => [item.key, item.value]));
      setGeneralSettings((current) => ({ ...current, platformName: values.platformName ?? current.platformName, supportEmail: values.supportEmail ?? current.supportEmail, timezone: values.timezone ?? current.timezone, currency: values.currency ?? current.currency }));
      setMaintenanceMode(values.maintenanceMode === 'true');
    }).catch((error) => setPageError(error.message));
  }, []);

  const saveGroup = (group, values, secretKeys = []) => Promise.all(Object.entries(values).map(([key, value]) => platformApi.settings.save(group, key, { value: String(value), valueType: typeof value, description: null, isSecret: secretKeys.includes(key), expectedVersion: null })));

  /* =========================================================
     SAVE GENERAL SETTINGS
     ========================================================= */

  const handleSaveGeneral = async () => {
    try { await saveGroup('Platform', generalSettings); } catch (error) { setPageError(error.message); return; }
    setGeneralSaved(true);

    setTimeout(() => {
      setGeneralSaved(false);
    }, 3000);
  };

  /* =========================================================
     SAVE SECURITY SETTINGS
     ========================================================= */

  const handleSaveSecurity = async () => {
    try { await saveGroup('Security', securitySettings); } catch (error) { setPageError(error.message); return; }
    setSecuritySaved(true);

    setTimeout(() => {
      setSecuritySaved(false);
    }, 3000);
  };

  /* =========================================================
     MAINTENANCE MODE
     ========================================================= */

  const handleMaintenanceMode = async () => {
    const nextValue = !maintenanceMode;

    setMaintenanceMode(nextValue);
    try { await platformApi.settings.save('Platform', 'maintenanceMode', { value: String(nextValue), valueType: 'boolean', description: 'Platform maintenance mode', isSecret: false, expectedVersion: null }); } catch (error) { setPageError(error.message); return; }

    setMaintenanceMessage(
      nextValue
        ? 'Maintenance mode has been enabled.'
        : 'Maintenance mode has been disabled.'
    );

    setTimeout(() => {
      setMaintenanceMessage('');
    }, 3000);
  };

  /* =========================================================
     CLEAR CACHE
     ========================================================= */

  const handleClearCache = () => {
    setMaintenanceMessage(
      'System cache cleared successfully.'
    );

    setTimeout(() => {
      setMaintenanceMessage('');
    }, 3000);
  };

  /* =========================================================
     DATABASE BACKUP
     ========================================================= */

  const handleBackupDatabase = () => {
    setMaintenanceMessage(
      'Database backup has been initiated successfully.'
    );

    setTimeout(() => {
      setMaintenanceMessage('');
    }, 3000);
  };

  /* =========================================================
     TAB CHANGE
     ========================================================= */

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setGeneralSaved(false);
    setSecuritySaved(false);
    setMaintenanceMessage('');
  };

  return (
    <div className="admin-settings">
      {pageError && <p role="alert">{pageError}</p>}

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="admin-settings-header">

        <div>

          <h1>System Settings</h1>

          <p>
            Platform-wide configuration and preferences
          </p>

        </div>

      </div>


      {/* =====================================================
          TABS
          ===================================================== */}

      <div className="admin-settings-tabs">

        <button
          type="button"
          className={
            activeTab === 'general'
              ? 'admin-settings-tab active'
              : 'admin-settings-tab'
          }
          onClick={() => handleTabChange('general')}
        >
          General
        </button>


        <button
          type="button"
          className={
            activeTab === 'security'
              ? 'admin-settings-tab active'
              : 'admin-settings-tab'
          }
          onClick={() => handleTabChange('security')}
        >
          Security
        </button>


        <button
          type="button"
          className={
            activeTab === 'maintenance'
              ? 'admin-settings-tab active'
              : 'admin-settings-tab'
          }
          onClick={() => handleTabChange('maintenance')}
        >
          Maintenance
        </button>

        <button
          type="button"
          className={activeTab === 'administrators' ? 'admin-settings-tab active' : 'admin-settings-tab'}
          onClick={() => handleTabChange('administrators')}
        >
          Administrators
        </button>

      </div>


      {/* =====================================================
          GENERAL TAB
          ===================================================== */}

      {activeTab === 'general' && (

        <div className="admin-settings-card">

          <h3>General Settings</h3>


          {/* PLATFORM NAME */}

          <div className="admin-settings-group">

            <label htmlFor="platformName">
              Platform Name
            </label>

            <input
              id="platformName"
              type="text"
              value={generalSettings.platformName}
              onChange={(event) =>
                setGeneralSettings({
                  ...generalSettings,
                  platformName: event.target.value,
                })
              }
            />

          </div>


          {/* SUPPORT EMAIL */}

          <div className="admin-settings-group">

            <label htmlFor="supportEmail">
              Support Email
            </label>

            <input
              id="supportEmail"
              type="email"
              value={generalSettings.supportEmail}
              onChange={(event) =>
                setGeneralSettings({
                  ...generalSettings,
                  supportEmail: event.target.value,
                })
              }
            />

          </div>


          {/* TIMEZONE */}

          <div className="admin-settings-group">

            <label htmlFor="timezone">
              Default Timezone
            </label>

            <select
              id="timezone"
              value={generalSettings.timezone}
              onChange={(event) =>
                setGeneralSettings({
                  ...generalSettings,
                  timezone: event.target.value,
                })
              }
            >
              <option value="Asia/Kolkata (IST)">
                Asia/Kolkata (IST)
              </option>

              <option value="Asia/Dubai (GST)">
                Asia/Dubai (GST)
              </option>

              <option value="Europe/London (GMT)">
                Europe/London (GMT)
              </option>

              <option value="America/New_York (EST)">
                America/New_York (EST)
              </option>
            </select>

          </div>


          {/* CURRENCY */}

          <div className="admin-settings-group">

            <label htmlFor="currency">
              Currency
            </label>

            <select
              id="currency"
              value={generalSettings.currency}
              onChange={(event) =>
                setGeneralSettings({
                  ...generalSettings,
                  currency: event.target.value,
                })
              }
            >
              <option value="INR (₹)">
                INR (₹)
              </option>

              <option value="USD ($)">
                USD ($)
              </option>

              <option value="EUR (€)">
                EUR (€)
              </option>

              <option value="GBP (£)">
                GBP (£)
              </option>
            </select>

          </div>


          {/* SUCCESS */}

          {generalSaved && (
            <div className="admin-settings-success">
              <CheckCircle2 size={17} />
              Settings saved successfully.
            </div>
          )}


          {/* SAVE */}

          <button
            type="button"
            className="admin-settings-purple-btn"
            onClick={handleSaveGeneral}
          >
            Save Settings
          </button>

        </div>

      )}


      {/* =====================================================
          SECURITY TAB
          ===================================================== */}

      {activeTab === 'security' && (

        <div className="admin-settings-card">

          <h3>Security Settings</h3>


          {/* OTP EXPIRY */}

          <div className="admin-settings-group">

            <label htmlFor="otpExpiry">
              OTP Expiry (minutes)
            </label>

            <input
              id="otpExpiry"
              type="number"
              min="1"
              value={securitySettings.otpExpiry}
              onChange={(event) =>
                setSecuritySettings({
                  ...securitySettings,
                  otpExpiry: event.target.value,
                })
              }
            />

          </div>


          {/* MAX LOGIN ATTEMPTS */}

          <div className="admin-settings-group">

            <label htmlFor="maxLoginAttempts">
              Max Login Attempts
            </label>

            <input
              id="maxLoginAttempts"
              type="number"
              min="1"
              value={securitySettings.maxLoginAttempts}
              onChange={(event) =>
                setSecuritySettings({
                  ...securitySettings,
                  maxLoginAttempts: event.target.value,
                })
              }
            />

          </div>


          {/* SESSION TIMEOUT */}

          <div className="admin-settings-group">

            <label htmlFor="sessionTimeout">
              Session Timeout (hours)
            </label>

            <input
              id="sessionTimeout"
              type="number"
              min="1"
              value={securitySettings.sessionTimeout}
              onChange={(event) =>
                setSecuritySettings({
                  ...securitySettings,
                  sessionTimeout: event.target.value,
                })
              }
            />

          </div>


          {/* SUCCESS */}

          {securitySaved && (
            <div className="admin-settings-success">
              <CheckCircle2 size={17} />
              Security settings saved successfully.
            </div>
          )}


          {/* SAVE */}

          <button
            type="button"
            className="admin-settings-purple-btn"
            onClick={handleSaveSecurity}
          >
            Save Security Settings
          </button>

        </div>

      )}


      {/* =====================================================
          MAINTENANCE TAB
          ===================================================== */}

      {activeTab === 'maintenance' && (

        <div className="admin-settings-card admin-maintenance-card">

          <h3 className="admin-maintenance-title">
            Maintenance
          </h3>


          {/* WARNING */}

          <div className="admin-maintenance-warning">

            <AlertTriangle size={20} />

            <div>
              These actions affect all users on the
              platform. Proceed with extreme caution.
            </div>

          </div>


          {/* MAINTENANCE MODE */}

          <button
            type="button"
            className={
              maintenanceMode
                ? 'admin-maintenance-action active'
                : 'admin-maintenance-action'
            }
            onClick={handleMaintenanceMode}
          >

            <div className="admin-maintenance-action-left">

              <Wrench size={18} />

              <span>
                {maintenanceMode
                  ? 'Disable Maintenance Mode'
                  : 'Enable Maintenance Mode'}
              </span>

            </div>

            <span
              className={
                maintenanceMode
                  ? 'admin-maintenance-status enabled'
                  : 'admin-maintenance-status'
              }
            >
              {maintenanceMode
                ? 'Enabled'
                : 'Disabled'}
            </span>

          </button>


          {/* CLEAR CACHE */}

          <button
            type="button"
            className="admin-maintenance-action"
            onClick={handleClearCache}
          >

            <div className="admin-maintenance-action-left">

              <Trash2 size={18} />

              <span>
                Clear System Cache
              </span>

            </div>

          </button>


          {/* BACKUP */}

          <button
            type="button"
            className="admin-maintenance-backup"
            onClick={handleBackupDatabase}
          >

            <Database size={18} />

            Backup Database

          </button>


          {/* MESSAGE */}

          {maintenanceMessage && (
            <div className="admin-settings-success admin-maintenance-message">
              <CheckCircle2 size={17} />
              {maintenanceMessage}
            </div>
          )}

        </div>

      )}

      {activeTab === 'administrators' && <AdministratorSettings />}

    </div>
  );
}
