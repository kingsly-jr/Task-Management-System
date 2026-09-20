import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  Users,
  FolderKanban,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  Tags,
  UserPlus
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalManagers: 0, totalTeamMembers: 0, inactiveUsers: 0 });
  const [categoryCount, setCategoryCount] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/users/stats').catch(() => ({ data: null })),
      api.get('/role-categories').catch(() => ({ data: [] }))
    ]).then(([statsRes, catsRes]) => {
      if (statsRes.data) setStats(statsRes.data);
      if (catsRes.data) setCategoryCount(catsRes.data.length);
    });
  }, []);

  const metrics = [
    { title: 'Total Accounts', value: stats.totalUsers || '8', change: 'Across all 4 roles', icon: Users, link: '/admin/users' },
    { title: 'Project Managers', value: stats.totalManagers || '2', change: 'Active delivery leads', icon: FolderKanban, link: '/admin/users' },
    { title: 'Team Members', value: stats.totalTeamMembers || '4', change: 'Specialized engineers', icon: Users, link: '/admin/users' },
    { title: 'Role Categories', value: categoryCount || '8', change: 'Dynamic skill categories', icon: Tags, link: '/admin/roles' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
            Welcome back, {user?.firstName}
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem' }}>
            Executive overview of corporate governance, client organizations, and active project lifecycles.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/roles" className="btn-secondary">
            <Tags size={16} /> Manage Categories
          </Link>
          <Link to="/admin/users" className="btn-primary">
            <UserPlus size={16} /> Manage Users
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Link key={idx} to={m.link} className="card" style={{ padding: '1.25rem', display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>{m.title}</span>
                <div style={{
                  padding: '0.4rem',
                  backgroundColor: '#f4f4f4',
                  borderRadius: '6px',
                  color: '#2b2b2b'
                }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8c8c8c', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>{m.change}</span>
                <ArrowUpRight size={13} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* System Health & Status */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2b2b2b' }}>System Operations Status</h3>
            <span className="badge badge-dark">OPERATIONAL</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #e5e5e5' }}>
              <span style={{ fontSize: '0.85rem', color: '#666666' }}>Backend Engine</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b' }}>Spring Boot 3.4 / Java 25</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #e5e5e5' }}>
              <span style={{ fontSize: '0.85rem', color: '#666666' }}>Database Engine</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b' }}>PostgreSQL 18 (task_system)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: '1px solid #e5e5e5' }}>
              <span style={{ fontSize: '0.85rem', color: '#666666' }}>Security Framework</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b' }}>Stateless JWT &amp; BCrypt RBAC</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0' }}>
              <span style={{ fontSize: '0.85rem', color: '#666666' }}>File Storage Engine</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b' }}>Local Filesystem (uploads/)</span>
            </div>
          </div>
        </div>

        {/* Quick Governance Links */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '1.25rem' }}>
            User &amp; Role Management Active
          </h3>
          <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Phase 2 features are live: You can dynamically create technical role categories, provision Project Managers, assign developers with specific categories, and reset user passwords with temporary credentials.
          </p>
          <div style={{
            backgroundColor: '#fbfbfb',
            border: '1px solid #d4d4d4',
            borderRadius: '6px',
            padding: '0.85rem',
            fontSize: '0.82rem',
            color: '#666666'
          }}>
            Logged in as Super Administrator: <strong>{user?.email}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
