import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from '../components/NotificationCenter';
import {
  LayoutDashboard,
  FolderKanban,
  GitPullRequest,
  FileText,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Building
} from 'lucide-react';

const ClientLayout = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
    { name: 'My Projects', path: '/client/projects', icon: FolderKanban },
    { name: 'Change Requests', path: '/client/change-requests', icon: GitPullRequest },
    { name: 'Documents', path: '/client/documents', icon: FileText },
    { name: 'Messages', path: '/client/messages', icon: MessageSquare },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fbfbfb' }}>
      {/* Top Navbar */}
      <header style={{
        height: '64px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #d4d4d4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
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
              <div style={{ fontSize: '0.65rem', color: '#8c8c8c', fontWeight: 600, letterSpacing: '0.06em' }}>CLIENT PORTAL</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#666666',
                    backgroundColor: isActive ? '#2b2b2b' : 'transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User & Sign Out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <NotificationCenter />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#f4f4f4',
              border: '1px solid #d4d4d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: '#2b2b2b'
            }}>
              {user?.firstName?.charAt(0) || 'C'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b' }}>{user?.fullName || user?.email}</div>
              <div style={{ fontSize: '0.7rem', color: '#8c8c8c' }}>Verified Client</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2.5rem', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
