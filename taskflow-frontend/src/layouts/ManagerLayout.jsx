import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from '../components/NotificationCenter';
import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  CheckSquare2,
  Kanban,
  Flag,
  Bug,
  GitPullRequest,
  FileText,
  Clock,
  LogOut,
  Briefcase,
  MessageSquare,
  Settings
} from 'lucide-react';

const ManagerLayout = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/manager/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Projects', path: '/manager/projects', icon: FolderKanban },
    { name: 'Project Team', path: '/manager/team', icon: Users2 },
    { name: 'Time Tracking', path: '/manager/time-reports', icon: Clock },
    { name: 'Settings', path: '/manager/settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fbfbfb' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #d4d4d4',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 50
      }}>
        {/* Brand */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #d4d4d4',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: '#2b2b2b',
            color: '#ffffff',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem'
          }}>TF</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: '#2b2b2b' }}>TASKFLOW</div>
            <div style={{ fontSize: '0.68rem', color: '#8c8c8c', fontWeight: 600, letterSpacing: '0.06em' }}>PROJECT MANAGER</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', padding: '0 0.75rem 0.5rem 0.75rem', letterSpacing: '0.05em' }}>
            PROJECT EXECUTION
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#2b2b2b',
                    backgroundColor: isActive ? '#2b2b2b' : 'transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Card */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid #d4d4d4',
          backgroundColor: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#f4f4f4',
                border: '1px solid #d4d4d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#2b2b2b',
                flexShrink: 0
              }}>
                {user?.firstName?.charAt(0) || 'M'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: '#2b2b2b' }}>
                  {user?.fullName || user?.email}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#8c8c8c' }}>Project Manager</div>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                padding: '0.45rem',
                borderRadius: '4px',
                color: '#666666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{
          height: '60px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #d4d4d4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-dark">Project Manager</span>
            <span style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>Delivery & Team Leadership</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationCenter />
            <span style={{ fontSize: '0.85rem', color: '#666666' }}>{user?.email}</span>
            <button
              onClick={logout}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;
