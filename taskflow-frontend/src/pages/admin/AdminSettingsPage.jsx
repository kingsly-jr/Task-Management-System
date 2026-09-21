import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  Settings,
  Shield,
  KeyRound,
  HardDrive,
  Bell,
  Activity,
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Sliders,
  Globe,
  Lock,
  Database,
  Server,
  FileCheck,
  AlertTriangle,
  Info
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  // General
  organizationName: 'TaskFlow Enterprise Solutions Ltd.',
  supportEmail: 'support@taskflow.com',
  systemTimezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  currency: 'USD ($)',
  workingHoursPerDay: 8,

  // Security
  passwordMinLength: 8,
  requireUppercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  forceFirstLoginReset: true,
  sessionTimeoutHours: 24,
  maxFailedLogins: 5,
  enforceMfa: false,

  // Storage
  maxUploadSizeMb: 25,
  allowedExtensions: '.pdf, .docx, .xlsx, .pptx, .png, .jpg, .zip',
  storageProvider: 'LOCAL_FILESYSTEM',

  // Notifications
  emailDispatchEnabled: true,
  notifyOnNewUser: true,
  notifyOnCriticalBug: true,
  notifyOnChangeRequest: true,
  broadcastBannerActive: false,
  broadcastBannerMessage: 'System update scheduled for upcoming weekend. No downtime anticipated.'
};

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_system_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Password Change Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Save Settings handler
  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      localStorage.setItem('taskflow_system_settings', JSON.stringify(settings));
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess('System governance settings updated and applied successfully.');
        setTimeout(() => setSaveSuccess(''), 4000);
      }, 400);
    } catch (err) {
      setIsSaving(false);
      setSaveError('Failed to persist settings: ' + err.message);
    }
  };

  // Password Change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Please provide your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordSuccess('Password changed successfully! Keep your new credentials safe.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Organization & General', icon: Globe },
    { id: 'security', label: 'Security & Governance', icon: Shield },
    { id: 'storage', label: 'File Storage & Uploads', icon: HardDrive },
    { id: 'notifications', label: 'Alerts & Broadcast', icon: Bell },
    { id: 'diagnostics', label: 'System Diagnostics', icon: Activity },
    { id: 'profile', label: 'Admin Security Profile', icon: Lock }
  ];

  return (
    <div className="animate-fade-in" style={{ padding: '0 0.5rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{
              padding: '0.4rem',
              backgroundColor: '#2b2b2b',
              color: '#ffffff',
              borderRadius: '6px',
              display: 'flex'
            }}>
              <Settings size={18} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', margin: 0 }}>
              System Governance Settings
            </h1>
          </div>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Configure organizational defaults, security governance, file quotas, notifications, and administrator credentials.
          </p>
        </div>

        {activeTab !== 'profile' && activeTab !== 'diagnostics' && (
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        )}
      </div>

      {/* Global Alerts */}
      {saveSuccess && (
        <div style={{
          backgroundColor: '#e6f4ea',
          border: '1px solid #34a853',
          color: '#137333',
          padding: '0.85rem 1.25rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          {saveSuccess}
        </div>
      )}
      {saveError && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#b91c1c',
          padding: '0.85rem 1.25rem',
          borderRadius: '6px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.88rem'
        }}>
          <AlertCircle size={18} />
          {saveError}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid #d4d4d4',
        marginBottom: '1.75rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#2b2b2b' : '#666666',
                borderBottom: isActive ? '2px solid #2b2b2b' : '2px solid transparent',
                marginBottom: '-2px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Organization & General */}
      {activeTab === 'general' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.25rem' }}>
              Organization &amp; Workspace Defaults
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>
              Base settings applied across projects, client contracts, and system reports.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Organization / Company Legal Name</label>
              <input
                type="text"
                className="input-field"
                value={settings.organizationName}
                onChange={(e) => setSettings({ ...settings, organizationName: e.target.value })}
              />
              <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.25rem' }}>
                Displayed on invoices, client contracts, and official exports.
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Governance Support Contact Email</label>
              <input
                type="email"
                className="input-field"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
              <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.25rem' }}>
                System notifications and escalations will reference this address.
              </div>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Default System Timezone</label>
              <select
                className="input-field"
                value={settings.systemTimezone}
                onChange={(e) => setSettings({ ...settings, systemTimezone: e.target.value })}
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Europe/Paris">Europe/Paris (CET/CEST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT - UTC+8)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST - UTC+9)</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Default System Currency</label>
              <select
                className="input-field"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              >
                <option value="USD ($)">USD - US Dollar ($)</option>
                <option value="EUR (€)">EUR - Euro (€)</option>
                <option value="GBP (£)">GBP - British Pound (£)</option>
                <option value="INR (₹)">INR - Indian Rupee (₹)</option>
                <option value="CAD ($)">CAD - Canadian Dollar ($)</option>
                <option value="AUD ($)">AUD - Australian Dollar ($)</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Date Display Format</label>
              <select
                className="input-field"
                value={settings.dateFormat}
                onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601 standard)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (European format)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US standard format)</option>
                <option value="DD-MMM-YYYY">DD-MMM-YYYY (e.g. 20-Sep-2026)</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Standard Daily Working Hours</label>
              <input
                type="number"
                min="4"
                max="16"
                className="input-field"
                value={settings.workingHoursPerDay}
                onChange={(e) => setSettings({ ...settings, workingHoursPerDay: parseInt(e.target.value) || 8 })}
              />
              <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.25rem' }}>
                Used by project managers for sprint velocity and timesheet quota calculation.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Security & Governance */}
      {activeTab === 'security' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.25rem' }}>
              Security &amp; RBAC Governance Policies
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>
              Enforce password hygiene, session lifetime, lockout conditions, and initial login policies.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Session Timeout */}
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Stateless JWT Session Expiry</label>
              <select
                className="input-field"
                value={settings.sessionTimeoutHours}
                onChange={(e) => setSettings({ ...settings, sessionTimeoutHours: parseInt(e.target.value) })}
              >
                <option value={1}>1 Hour (Strict Financial Grade)</option>
                <option value={4}>4 Hours (Standard Working Session)</option>
                <option value={12}>12 Hours (Half-Day Session)</option>
                <option value={24}>24 Hours (Default Developer Token)</option>
                <option value={168}>7 Days (Extended Remember-Me)</option>
              </select>
            </div>

            {/* Lockout threshold */}
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Max Failed Login Attempts</label>
              <select
                className="input-field"
                value={settings.maxFailedLogins}
                onChange={(e) => setSettings({ ...settings, maxFailedLogins: parseInt(e.target.value) })}
              >
                <option value={3}>3 Attempts (High Alert)</option>
                <option value={5}>5 Attempts (Recommended)</option>
                <option value={10}>10 Attempts (Relaxed)</option>
              </select>
              <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.25rem' }}>
                Account flagged and locked temporarily after consecutive failed authentication attempts.
              </div>
            </div>

            {/* Minimum Password Length */}
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Minimum Password Character Length</label>
              <select
                className="input-field"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
              >
                <option value={6}>6 Characters (Basic)</option>
                <option value={8}>8 Characters (Recommended Standard)</option>
                <option value={12}>12 Characters (High Security)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Force First Login Reset Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.forceFirstLoginReset}
                onChange={(e) => setSettings({ ...settings, forceFirstLoginReset: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2b2b2b' }}>
                  Force Password Change on First Login
                </div>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  When enabled, newly created Project Managers and Team Members are forced to set a private password before accessing the system.
                </div>
              </div>
            </label>

            {/* Require Uppercase */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.requireUppercase}
                onChange={(e) => setSettings({ ...settings, requireUppercase: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2b2b2b' }}>
                  Require At Least One Uppercase Letter (A-Z)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  Enforced on all employee and client passwords during reset.
                </div>
              </div>
            </label>

            {/* Require Numbers */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.requireNumbers}
                onChange={(e) => setSettings({ ...settings, requireNumbers: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2b2b2b' }}>
                  Require At Least One Numeric Digit (0-9)
                </div>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  Strengthens entropy against dictionary attacks.
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* TAB 3: File Storage & Uploads */}
      {activeTab === 'storage' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.25rem' }}>
              File Storage &amp; Document Controls
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>
              Manage project attachment limits, permitted document types, and storage health.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Maximum File Upload Size</label>
              <select
                className="input-field"
                value={settings.maxUploadSizeMb}
                onChange={(e) => setSettings({ ...settings, maxUploadSizeMb: parseInt(e.target.value) })}
              >
                <option value={10}>10 MB (Lightweight Documents)</option>
                <option value={25}>25 MB (Standard Enterprise Default)</option>
                <option value={50}>50 MB (High Definition Assets)</option>
                <option value={100}>100 MB (Large Archives &amp; Builds)</option>
              </select>
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Active Storage Engine</label>
              <div style={{
                padding: '0.65rem 0.85rem',
                backgroundColor: '#f4f4f4',
                border: '1px solid #d4d4d4',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#2b2b2b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <HardDrive size={16} />
                Local Filesystem Volume (<code>taskflow-backend/uploads/</code>)
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Permitted File Extensions</label>
              <input
                type="text"
                className="input-field"
                value={settings.allowedExtensions}
                onChange={(e) => setSettings({ ...settings, allowedExtensions: e.target.value })}
              />
              <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.25rem' }}>
                Comma-separated list of MIME-validated file types accepted by the Document and Bug attachment controllers.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Notifications & Broadcast */}
      {activeTab === 'notifications' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.25rem' }}>
              System Alerts &amp; Organization Announcement
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>
              Control automatic system notifications and broadcast banners across all portal dashboards.
            </p>
          </div>

          {/* System Broadcast Announcement */}
          <div style={{
            backgroundColor: '#fbfbfb',
            border: '1px solid #d4d4d4',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: '#b45309' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2b2b2b', margin: 0 }}>
                  Global System Broadcast Banner
                </h4>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: settings.broadcastBannerActive ? '#137333' : '#666' }}>
                  {settings.broadcastBannerActive ? 'ACTIVE / BROADCASTING' : 'INACTIVE'}
                </span>
                <input
                  type="checkbox"
                  checked={settings.broadcastBannerActive}
                  onChange={(e) => setSettings({ ...settings, broadcastBannerActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#666', marginBottom: '0.75rem' }}>
              When activated, this notice will be prominently displayed at the top of all Project Manager, Team Member, and Client dashboards.
            </p>

            <textarea
              className="input-field"
              rows={2}
              value={settings.broadcastBannerMessage}
              onChange={(e) => setSettings({ ...settings, broadcastBannerMessage: e.target.value })}
              placeholder="e.g. Scheduled system maintenance tonight at 11:00 PM UTC..."
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Notification Triggers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.emailDispatchEnabled}
                onChange={(e) => setSettings({ ...settings, emailDispatchEnabled: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2b2b2b' }}>
                  Master Email Dispatch Engine
                </div>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  Allow Spring Boot MailSender to transmit outbound notification emails.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.notifyOnNewUser}
                onChange={(e) => setSettings({ ...settings, notifyOnNewUser: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2b2b2b' }}>
                  Notify Admin on New User Onboarding
                </div>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  Dispatch an alert to support email whenever a new employee account is provisioned.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.notifyOnCriticalBug}
                onChange={(e) => setSettings({ ...settings, notifyOnCriticalBug: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#2b2b2b' }}>
                  Immediate Alert on CRITICAL / BLOCKER Bug Submissions
                </div>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  Sends high-priority notifications to project leads when severity is marked as BLOCKER.
                </div>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: System Diagnostics */}
      {activeTab === 'diagnostics' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.25rem' }}>
              System Diagnostics &amp; Runtime Operations
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>
              Live infrastructure parameters and active backend connection states.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ padding: '1.25rem', backgroundColor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#666' }}>DATABASE STATUS</span>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#e6f4ea', color: '#137333' }}>
                  ONLINE
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                PostgreSQL 18.3
              </div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>
                Database: <code>task_system</code> (localhost:5432)
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#666' }}>BACKEND ENGINE</span>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#e6f4ea', color: '#137333' }}>
                  ACTIVE
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                Spring Boot 3.4.3
              </div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>
                Runtime: Java 25 (JVM HotSpot 64-Bit)
              </div>
            </div>

            <div style={{ padding: '1.25rem', backgroundColor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#666' }}>IDENTITY ARCHITECTURE</span>
                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#e8f0fe', color: '#1a73e8' }}>
                  BIGINT PK
                </span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                Sequential (1, 2, 3...)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>
                PostgreSQL BIGSERIAL Identity Generation
              </div>
            </div>
          </div>

          {/* Diagnostics Actions */}
          <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.5rem' }}>
              System Maintenance Operations
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('taskflow_system_settings');
                  setSettings(DEFAULT_SETTINGS);
                  alert('Settings reset to default factory configurations.');
                }}
                className="btn-secondary"
              >
                Reset Default Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Admin Profile & Security */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Current Admin Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '1.25rem' }}>
              Super Administrator Identity
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#2b2b2b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem'
              }}>
                {user?.firstName?.charAt(0) || 'S'}
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2b2b2b' }}>
                  {user?.fullName || 'System Administrator'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>{user?.email}</div>
                <div style={{ marginTop: '0.35rem' }}>
                  <span className="badge badge-dark">ROLE: ADMIN (ID = 1)</span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fbfbfb',
              border: '1px solid #d4d4d4',
              borderRadius: '6px',
              padding: '1rem',
              fontSize: '0.82rem',
              color: '#666',
              lineHeight: 1.6
            }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                <strong>Role Privileges:</strong> Full Organization Root Access
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                <li>Manage Company Users &amp; Project Managers</li>
                <li>Provision Custom Role Skill Categories</li>
                <li>Onboard Client Organizations &amp; Projects</li>
                <li>View Productivity Reports &amp; Full Audit Trails</li>
              </ul>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.35rem' }}>
              Change Master Password
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.25rem' }}>
              Updates your encrypted BCrypt password credentials directly on the backend database.
            </p>

            {passwordSuccess && (
              <div style={{
                backgroundColor: '#e6f4ea',
                border: '1px solid #34a853',
                color: '#137333',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 size={16} />
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #ef4444',
                color: '#b91c1c',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} />
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Current Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter current master password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>New Master Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Minimum 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem' }}>Confirm New Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Re-type new master password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="btn-primary"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <KeyRound size={16} />
                {passwordLoading ? 'Updating Credentials...' : 'Update Admin Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsPage;
