import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  FolderKanban,
  CheckSquare2,
  Users2,
  Clock,
  AlertTriangle,
  GitPullRequest,
  CheckCircle2,
  Bug,
  Building2,
  ArrowRight,
  ChevronRight,
  Kanban,
  Flag,
  Calendar,
  Layers,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, crRes, bugRes] = await Promise.all([
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/change-requests').catch(() => ({ data: [] })),
        api.get('/bugs').catch(() => ({ data: [] })),
      ]);
      setProjects(projRes.data || []);
      setChangeRequests(crRes.data || []);
      setBugs(bugRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load manager dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Derived metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const planningProjects = projects.filter((p) => p.status === 'PLANNING').length;
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;

  const totalAllocatedTeam = projects.reduce((sum, p) => sum + (p.teamMembersCount || 0), 0);
  const pendingCRs = changeRequests.filter(
    (cr) => cr.status === 'SUBMITTED' || cr.status === 'UNDER_REVIEW' || cr.status === 'PENDING'
  ).length;
  const activeBugsCount = bugs.filter(
    (b) => b.status === 'OPEN' || b.status === 'IN_PROGRESS' || b.status === 'REOPENED'
  ).length;

  const metrics = [
    {
      title: 'Assigned Projects',
      value: totalProjects,
      change: `${activeProjects} Active, ${planningProjects} Planning`,
      icon: FolderKanban,
      link: '/manager/projects'
    },
    {
      title: 'Project Team Members',
      value: totalAllocatedTeam,
      change: `Across ${totalProjects} project workspaces`,
      icon: Users2,
      link: '/manager/team'
    },
    {
      title: 'Open Client Requests',
      value: pendingCRs,
      change: pendingCRs > 0 ? 'Requires PM scope review' : 'All reviews completed',
      icon: GitPullRequest,
      link: '/manager/change-requests'
    },
    {
      title: 'Active Defect Retests',
      value: activeBugsCount,
      change: activeBugsCount > 0 ? 'Quality tracking required' : 'Zero active bugs',
      icon: Bug,
      link: '/manager/bugs'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#444444',
              backgroundColor: '#f2f2f2',
              border: '1px solid #e5e5e5',
              padding: '0.2rem 0.55rem',
              borderRadius: '4px'
            }}>
              Project Delivery Workspace
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', margin: 0 }}>
            Executive Dashboard — {user?.fullName || 'Project Manager'}
          </h1>
          <p style={{ color: '#666666', fontSize: '0.88rem', margin: '0.35rem 0 0 0' }}>
            Portfolio progress, active team allocations, client change requests, and sprint delivery status.
          </p>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/manager/team')}
            className="btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
          >
            <Users2 size={15} /> Project Team
          </button>
          <button
            onClick={() => navigate('/manager/kanban')}
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem 0.95rem' }}
          >
            <Kanban size={15} /> Task Kanban
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="card"
              onClick={() => navigate(m.link)}
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>{m.title}</span>
                <div style={{
                  padding: '0.4rem',
                  backgroundColor: '#f4f4f4',
                  borderRadius: '6px',
                  color: '#2b2b2b'
                }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                {loading ? '...' : m.value}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#666666' }}>
                <span>{m.change}</span>
                <ChevronRight size={13} color="#8c8c8c" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Projects Portfolio Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.2rem 0' }}>
              Assigned Projects Portfolio
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
              Live sprint tracking, client contracts, and progress delivery across your projects.
            </p>
          </div>
          <button
            onClick={() => navigate('/manager/projects')}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
          >
            View All Projects
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#8c8c8c' }}>
            Loading assigned projects portfolio...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center' }}>
            <FolderKanban size={36} color="#8c8c8c" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', margin: '0 0 0.25rem 0' }}>
              No Projects Assigned Yet
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
              When the Super Admin appoints you as Lead Project Manager for client projects, they will appear here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e9ecef', color: '#8c8c8c', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Project</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Client Organization</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Priority</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, width: '180px' }}>Sprint Progress</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700 }}>Team</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const statusBg =
                    p.status === 'COMPLETED'
                      ? '#2b2b2b'
                      : p.status === 'IN_PROGRESS'
                      ? '#ffffff'
                      : '#f4f4f4';
                  const statusColor =
                    p.status === 'COMPLETED'
                      ? '#ffffff'
                      : p.status === 'IN_PROGRESS'
                      ? '#2b2b2b'
                      : '#666666';

                  return (
                    <tr key={p.projectId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <div style={{ fontWeight: 800, color: '#2b2b2b' }}>{p.projectName}</div>
                        <div style={{ fontSize: '0.74rem', color: '#8c8c8c' }}>{p.projectCode}</div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', color: '#444444' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Building2 size={13} color="#8c8c8c" />
                          <span>{p.clientCompanyName || 'Direct Client'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: statusBg,
                          color: statusColor,
                          border: p.status === 'IN_PROGRESS' ? '1px solid #2b2b2b' : '1px solid #e5e5e5'
                        }}>
                          {p.status ? p.status.replace('_', ' ') : 'PLANNING'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#444' }}>
                          {p.priority || 'MEDIUM'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, color: '#666', marginBottom: '0.25rem' }}>
                          <span>Completion</span>
                          <span>{p.progress || 0}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.progress || 0}%`, height: '100%', backgroundColor: '#2b2b2b', borderRadius: '3px' }} />
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#444' }}>
                          <Users2 size={13} color="#8c8c8c" />
                          <span>{p.teamMembersCount || 0} members</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                        <button
                          onClick={() => navigate(`/manager/projects/${p.projectId}`)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.35rem 0.75rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #d4d4d4',
                            borderRadius: '4px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: '#2b2b2b',
                            cursor: 'pointer'
                          }}
                        >
                          Workspace <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column Bottom Grid: Pending Change Requests & Defect Retests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
        {/* Change Requests Card */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.35rem', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#2b2b2b' }}>
                  <GitPullRequest size={16} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                  Client Change Requests ({pendingCRs})
                </h3>
              </div>
              <button
                onClick={() => navigate('/manager/change-requests')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#666', fontWeight: 600 }}
              >
                Review All →
              </button>
            </div>

            {changeRequests.length === 0 ? (
              <p style={{ color: '#8c8c8c', fontSize: '0.84rem', margin: '1rem 0' }}>
                No open client change requests recorded for your projects.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {changeRequests.slice(0, 3).map((cr) => (
                  <div
                    key={cr.changeRequestId || cr.id}
                    style={{
                      padding: '0.75rem 0.85rem',
                      backgroundColor: '#fafafa',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <strong style={{ color: '#2b2b2b' }}>{cr.title}</strong>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#444' }}>{cr.status}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#666' }}>
                      Impact: {cr.costImpact ? `$${Number(cr.costImpact).toLocaleString()}` : 'No cost impact'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.74rem', color: '#8c8c8c' }}>
              Client scope adjustments require PM technical evaluation and sign-off.
            </span>
          </div>
        </div>

        {/* Defects & Bugs Watch */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.35rem', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#2b2b2b' }}>
                  <Bug size={16} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                  Quality & Defects Watch ({activeBugsCount})
                </h3>
              </div>
              <button
                onClick={() => navigate('/manager/bugs')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#666', fontWeight: 600 }}
              >
                Track Bugs →
              </button>
            </div>

            {bugs.length === 0 ? (
              <p style={{ color: '#8c8c8c', fontSize: '0.84rem', margin: '1rem 0' }}>
                No active defects reported across your assigned project sprints.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bugs.slice(0, 3).map((b) => (
                  <div
                    key={b.bugId || b.id}
                    style={{
                      padding: '0.75rem 0.85rem',
                      backgroundColor: '#fafafa',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <strong style={{ color: '#2b2b2b' }}>{b.title}</strong>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: b.severity === 'CRITICAL' ? '#b91c1c' : '#444' }}>
                        {b.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#666' }}>
                      Status: {b.status} | Project: {b.projectCode || 'Active Sprint'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '0.74rem', color: '#8c8c8c' }}>
              Ensure reported QA defects are prioritized into sprint boards before release.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
