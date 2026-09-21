import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationCenter from '../components/NotificationCenter';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare2,
  GitPullRequest,
  Star,
  DollarSign,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ShieldCheck,
  Building2,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navGroups = [
    {
      group: 'WORKSPACE',
      items: [
        { name: 'Dashboard', path: '/client/dashboard', icon: LayoutDashboard },
        { name: 'My Projects', path: '/client/projects', icon: FolderKanban },
      ]
    },
    {
      group: 'DELIVERABLES & SCOPE',
      items: [
        { name: 'Milestones & Deliverables', path: '/client/deliverables', icon: CheckSquare2 },
        { name: 'Change Requests', path: '/client/change-requests', icon: GitPullRequest },
      ]
    },
    {
      group: 'REVIEWS & RATINGS',
      items: [
        { name: 'Project Feedback', path: '/client/feedback', icon: Star },
      ]
    },
    {
      group: 'FINANCIALS',
      items: [
        { name: 'Invoices & Billing', path: '/client/invoices', icon: DollarSign },
      ]
    },
    {
      group: 'COMMUNICATION & ASSETS',
      items: [
        { name: 'Documents', path: '/client/documents', icon: FileText },
        { name: 'Direct Messages', path: '/client/messages', icon: MessageSquare },
      ]
    },
    {
      group: 'ORGANIZATION',
      items: [
        { name: 'Company Settings', path: '/client/settings', icon: Settings },
      ]
    }
  ];

  // Derive current page title
  const currentItem = navGroups.flatMap(g => g.items).find(i => location.pathname === i.path);
  const currentTitle = currentItem ? currentItem.name : 'Client Portal';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fbfbfb' }}>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 49,
            display: 'none'
          }}
          className="mobile-overlay"
        />
      )}

      {/* Left Sidebar */}
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
        zIndex: 50,
        transition: 'transform 0.2s ease',
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #d4d4d4',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
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
            fontSize: '1rem',
            flexShrink: 0
          }}>TF</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: '#2b2b2b' }}>TASKFLOW</div>
            <div style={{ fontSize: '0.65rem', color: '#8c8c8c', fontWeight: 700, letterSpacing: '0.06em' }}>CLIENT PORTAL</div>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ flex: 1, padding: '1.25rem 0.85rem', overflowY: 'auto' }}>
          {navGroups.map((group) => (
            <div key={group.group} style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#8c8c8c',
                padding: '0 0.75rem 0.4rem 0.75rem',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                {group.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#ffffff' : '#4a4a4a',
                        backgroundColor: isActive ? '#2b2b2b' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                      })}
                    >
                      <Icon size={16} />
                      <span style={{ flex: 1 }}>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom User Card */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #d4d4d4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#2b2b2b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              flexShrink: 0
            }}>
              {user?.firstName?.charAt(0) || 'C'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName || user?.email}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#2b8a3e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={11} /> Verified Client
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#8c8c8c',
              padding: '0.35rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s'
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Sticky Top Header */}
        <header style={{
          height: '64px',
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
          {/* Left Title / Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#8c8c8c' }}>
              <span>Client Portal</span>
              <ChevronRight size={14} />
              <span style={{ fontWeight: 700, color: '#2b2b2b' }}>{currentTitle}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Tenant Boundary Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.65rem',
              backgroundColor: '#f2f9f2',
              border: '1px solid #d3ebd3',
              borderRadius: '20px',
              fontSize: '0.72rem',
              color: '#2b8a3e',
              fontWeight: 700
            }}>
              <ShieldCheck size={13} />
              <span>Tenant Boundary Enforced</span>
            </div>

            <NotificationCenter />

            <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e5e5' }} />

            <button
              onClick={logout}
              className="btn-secondary"
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main style={{
          flex: 1,
          padding: '2rem 2.5rem',
          maxWidth: '1600px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
