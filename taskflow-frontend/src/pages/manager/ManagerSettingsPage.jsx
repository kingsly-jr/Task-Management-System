import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Mail,
  Briefcase,
  Key,
  Save,
  Bell,
  Sliders,
  FolderKanban,
  Kanban,
  CheckSquare2,
  Flag,
  FileText,
  Clock,
  Eye,
  Settings
} from 'lucide-react';

const DEFAULT_PREFERENCES = {
  defaultProjectTab: 'overview',
  defaultTaskPriority: 'MEDIUM',
  defaultDocVisibility: true,
  defaultSprintDuration: '2_WEEKS',
  notifyOnBugs: true,
  notifyOnChangeRequests: true,
  notifyOnMilestones: true,
  notifyOnTimesheets: true
};

const ManagerSettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [assignedCount, setAssignedCount] = useState(0);

  // Password Form State
  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_pm_settings');
      return saved ? { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) } : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });
  const [prefSuccess, setPrefSuccess] = useState('');

  useEffect(() => {
    fetchAssignedCount();
  }, []);

  const fetchAssignedCount = async () => {
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setAssignedCount(list.length);
    } catch (err) {
      console.warn('Could not fetch projects count for settings', err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError('New password and confirm password do not match');
      return;
    }

    if (pwdData.newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters in length');
      return;
    }

    setChangingPwd(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword
      });
      setPwdSuccess('Your password has been changed successfully.');
      setPwdData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdSuccess(''), 5000);
    } catch (err) {
      setPwdError(err.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setChangingPwd(false);
    }
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('taskflow_pm_settings', JSON.stringify(preferences));
      setPrefSuccess('Workspace preferences saved successfully.');
      setTimeout(() => setPrefSuccess(''), 4000);
    } catch (err) {
      console.error('Failed to save settings to localStorage', err);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            backgroundColor: '#2b2b2b',
            color: '#ffffff',
            padding: '0.2rem 0.55rem',
            borderRadius: '4px'
          }}>
            LEADERSHIP PREFERENCES &amp; SECURITY
          </span>
          <span style={{ fontSize: '0.75rem', color: '#8c8c8c', fontWeight: 600 }}>
            Project Manager Account
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.02em' }}>
          Manager Workspace &amp; Account Settings
        </h1>
        <p style={{ color: '#666666', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
          Manage your project manager profile, password security, default workspace views, and sprint notification preferences.
        </p>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #d4d4d4', marginBottom: '2rem' }}>
        {[
          { id: 'profile', label: 'Manager Profile', icon: User },
          { id: 'security', label: 'Security & Password', icon: Lock },
          { id: 'preferences', label: 'Project Defaults & Sprints', icon: Sliders },
          { id: 'notifications', label: 'Alert Subscriptions', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#1e1e1e' : '#666666',
                borderBottom: isActive ? '2px solid #1e1e1e' : '2px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#1e1e1e' : '#8c8c8c'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Profile */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#2b2b2b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: 800
              }}>
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'M'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                    {user?.fullName || `${user?.firstName || 'Project'} ${user?.lastName || 'Manager'}`}
                  </h2>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.55rem', backgroundColor: '#e6fcf5', color: '#0ca678', borderRadius: '4px' }}>
                    ACTIVE LEAD
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666666' }}>
                  {user?.email} • Appointed Lead Project Manager
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Assigned Role</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e1e1e', marginTop: '0.25rem' }}>
                  {user?.role || 'PROJECT_MANAGER'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Department</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e1e1e', marginTop: '0.25rem' }}>
                  Engineering &amp; Agile Delivery
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Workspaces Under Leadership</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0ca678', marginTop: '0.25rem' }}>
                  {assignedCount} Assigned Project{assignedCount === 1 ? '' : 's'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Authentication Identity</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e1e1e', marginTop: '0.25rem' }}>
                  JWT Secured Account
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Security & Password */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f0f0f0' }}>
              <Lock size={20} color="#1e1e1e" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                Change Account Password
              </h2>
            </div>

            {pwdSuccess && (
              <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#ebfbee', border: '1px solid #b2f2bb', color: '#2b8a3e', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', color: '#c92a2a', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '480px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter existing password"
                  value={pwdData.currentPassword}
                  onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={pwdData.newPassword}
                  onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={pwdData.confirmPassword}
                  onChange={(e) => setPwdData({ ...pwdData, confirmPassword: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={changingPwd}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.6rem', fontSize: '0.88rem' }}
                >
                  {changingPwd ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: Project Defaults & Sprint Preferences */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f0f0f0' }}>
              <Sliders size={20} color="#1e1e1e" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                Default Workspace &amp; Sprint Settings
              </h2>
            </div>

            {prefSuccess && (
              <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#ebfbee', border: '1px solid #b2f2bb', color: '#2b8a3e', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} />
                <span>{prefSuccess}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Default Project Workspace Tab
                </label>
                <select
                  value={preferences.defaultProjectTab}
                  onChange={(e) => setPreferences({ ...preferences, defaultProjectTab: e.target.value })}
                  className="form-control"
                  style={{ height: '44px' }}
                >
                  <option value="overview">Overview &amp; Specs</option>
                  <option value="team">Team Allocation</option>
                  <option value="tasks">Sprint Tasks</option>
                  <option value="kanban">Kanban Board</option>
                  <option value="milestones">Milestones</option>
                  <option value="bugs">Bugs &amp; Retest</option>
                  <option value="change-requests">Change Requests</option>
                  <option value="documents">Documents</option>
                  <option value="messages">Project Messages</option>
                </select>
                <span style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.25rem', display: 'block' }}>
                  The section automatically displayed when you open any project workspace.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Default Task Priority
                </label>
                <select
                  value={preferences.defaultTaskPriority}
                  onChange={(e) => setPreferences({ ...preferences, defaultTaskPriority: e.target.value })}
                  className="form-control"
                  style={{ height: '44px' }}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
                <span style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.25rem', display: 'block' }}>
                  Default priority applied when creating new sprint tasks.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Default Document Visibility
                </label>
                <select
                  value={preferences.defaultDocVisibility ? 'CLIENT' : 'INTERNAL'}
                  onChange={(e) => setPreferences({ ...preferences, defaultDocVisibility: e.target.value === 'CLIENT' })}
                  className="form-control"
                  style={{ height: '44px' }}
                >
                  <option value="CLIENT">Visible in Client Portal (Default)</option>
                  <option value="INTERNAL">Internal Team Only</option>
                </select>
                <span style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.25rem', display: 'block' }}>
                  Initial toggle state when uploading new deliverables or contracts.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Sprint Iteration Cadence
                </label>
                <select
                  value={preferences.defaultSprintDuration}
                  onChange={(e) => setPreferences({ ...preferences, defaultSprintDuration: e.target.value })}
                  className="form-control"
                  style={{ height: '44px' }}
                >
                  <option value="1_WEEK">1-Week Agile Sprints</option>
                  <option value="2_WEEKS">2-Weeks Standard Iterations</option>
                  <option value="4_WEEKS">Monthly Milestones</option>
                </select>
                <span style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.25rem', display: 'block' }}>
                  Expected planning horizon for deliverable milestones.
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.6rem' }}
              >
                <Save size={16} /> Save Preferences
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: Notifications */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '2rem', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #f0f0f0' }}>
              <Bell size={20} color="#1e1e1e" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                Manager Alerts &amp; Event Subscriptions
              </h2>
            </div>

            {prefSuccess && (
              <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#ebfbee', border: '1px solid #b2f2bb', color: '#2b8a3e', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} />
                <span>{prefSuccess}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                {
                  key: 'notifyOnBugs',
                  title: 'Defect & Bug Reports',
                  desc: 'Notify when a QA engineer or client stakeholder files a new defect ticket in your projects.'
                },
                {
                  key: 'notifyOnChangeRequests',
                  title: 'Scope & Change Requests',
                  desc: 'Notify when a client submits a new contract scope modification or feature addition.'
                },
                {
                  key: 'notifyOnMilestones',
                  title: 'Milestone Deadline Reminders',
                  desc: 'Receive alerts 48 hours before an upcoming milestone target delivery date.'
                },
                {
                  key: 'notifyOnTimesheets',
                  title: 'Timesheet Submission Reminders',
                  desc: 'Notify when team members submit weekly worklogs awaiting your management approval.'
                }
              ].map((item) => (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: preferences[item.key] ? '#f8fbf9' : '#fafafa',
                    border: preferences[item.key] ? '1px solid #b2f2bb' : '1px solid #e5e5e5',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={preferences[item.key]}
                    onChange={(e) => setPreferences({ ...preferences, [item.key]: e.target.checked })}
                    style={{ accentColor: '#2b2b2b', width: '18px', height: '18px', marginTop: '0.2rem', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e1e1e' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#666666', marginTop: '0.15rem' }}>
                      {item.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.6rem' }}
              >
                <Save size={16} /> Save Notification Settings
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ManagerSettingsPage;
