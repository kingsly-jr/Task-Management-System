import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  FolderKanban,
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Building2,
  CheckSquare2,
  Kanban,
  Layers,
  ArrowRight,
  Filter
} from 'lucide-react';

const MemberProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, planning: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchProjectsAndStats();
  }, []);

  const fetchProjectsAndStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [projectsRes, statsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/projects/stats').catch(() => ({ data: { data: null } }))
      ]);

      const list = projectsRes.data || [];
      setProjects(list);

      if (statsRes.data?.data) {
        setStats(statsRes.data.data);
      } else {
        // Compute client-side fallback
        const total = list.length;
        const active = list.filter((p) => p.status === 'IN_PROGRESS').length;
        const completed = list.filter((p) => p.status === 'COMPLETED').length;
        const planning = list.filter((p) => p.status === 'PLANNING').length;
        setStats({ total, active, completed, planning });
      }
    } catch (err) {
      setError(err.message || 'Failed to load assigned projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return { bg: '#e6fcf5', color: '#0ca678', border: '#b2f2bb', label: 'COMPLETED' };
      case 'IN_PROGRESS':
        return { bg: '#1e1e1e', color: '#ffffff', border: '#1e1e1e', label: 'IN PROGRESS' };
      case 'ON_HOLD':
        return { bg: '#fff9db', color: '#f59f00', border: '#ffe066', label: 'ON HOLD' };
      case 'DELAYED':
        return { bg: '#fff5f5', color: '#fa5252', border: '#ffc9c9', label: 'DELAYED' };
      default:
        return { bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb', label: 'PLANNING' };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return { bg: '#fff5f5', color: '#e03131', label: 'URGENT' };
      case 'HIGH':
        return { bg: '#fff0f6', color: '#c2255c', label: 'HIGH' };
      case 'MEDIUM':
        return { bg: '#eff6ff', color: '#2563eb', label: 'MEDIUM' };
      default:
        return { bg: '#f8fafc', color: '#64748b', label: 'LOW' };
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      !search.trim() ||
      p.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode?.toLowerCase().includes(search.toLowerCase()) ||
      p.clientCompanyName?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || p.status?.toUpperCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1e1e1e', marginBottom: '0.35rem' }}>
            My Assigned Projects
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem' }}>
            Initiatives and client deliveries where you are an active engineering team member.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/member/tasks')} className="btn-secondary">
            <CheckSquare2 size={16} /> My Assigned Tasks
          </button>
          <button onClick={() => navigate('/member/kanban')} className="btn-primary">
            <Kanban size={16} /> Interactive Task Board
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Total Assigned</span>
            <div style={{ padding: '0.4rem', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#1e1e1e' }}>
              <FolderKanban size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e1e1e' }}>{stats.total}</div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.2rem' }}>All active initiatives</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>In Progress</span>
            <div style={{ padding: '0.4rem', backgroundColor: '#e6fcf5', borderRadius: '6px', color: '#0ca678' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0ca678' }}>{stats.active}</div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Currently being developed</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Planning / Review</span>
            <div style={{ padding: '0.4rem', backgroundColor: '#f3f4f6', borderRadius: '6px', color: '#4b5563' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4b5563' }}>{stats.planning}</div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Scoping or upcoming</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Completed</span>
            <div style={{ padding: '0.4rem', backgroundColor: '#f0fdf4', borderRadius: '6px', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#16a34a' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Successfully shipped</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c' }} />
            <input
              type="text"
              placeholder="Search by project name, code, or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Filter size={15} color="#666666" />
            {['ALL', 'IN_PROGRESS', 'PLANNING', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: statusFilter === st ? 700 : 500,
                  border: '1px solid',
                  borderColor: statusFilter === st ? '#1e1e1e' : '#e5e5e5',
                  backgroundColor: statusFilter === st ? '#1e1e1e' : '#ffffff',
                  color: statusFilter === st ? '#ffffff' : '#4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st === 'ALL' ? 'All Projects' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fff4f4',
          border: '1px solid #e0b4b4',
          color: '#b00020',
          padding: '0.85rem 1.15rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#666666' }}>
          Loading your assigned projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FolderKanban size={42} style={{ color: '#8c8c8c', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e1e1e', marginBottom: '0.4rem' }}>
            No Projects Found
          </h3>
          <p style={{ color: '#666666', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
            {search || statusFilter !== 'ALL'
              ? 'No projects match your current search and filter criteria.'
              : 'You are not assigned to any project yet. Once your Project Manager adds you to a project team, it will show up here.'}
          </p>
          {(search || statusFilter !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('ALL'); }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredProjects.map((p) => {
            const statusInfo = getStatusBadge(p.status);
            const priorityInfo = getPriorityBadge(p.priority);
            const techStack = p.technologyStack
              ? p.technologyStack.split(',').map((s) => s.trim()).filter(Boolean)
              : [];

            return (
              <div
                key={p.projectId}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  position: 'relative',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Header tags */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: '#f4f4f4',
                      color: '#2b2b2b',
                      border: '1px solid #d4d4d4'
                    }}>
                      {p.projectCode}
                    </span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                      border: `1px solid ${statusInfo.border}`
                    }}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: priorityInfo.bg,
                    color: priorityInfo.color
                  }}>
                    {priorityInfo.label}
                  </span>
                </div>

                {/* Project Title & Description */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1e1e', marginBottom: '0.45rem', letterSpacing: '-0.01em' }}>
                  {p.projectName}
                </h3>
                <p style={{
                  color: '#666666',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  marginBottom: '1.15rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flex: 1
                }}>
                  {p.description || 'No description provided for this project.'}
                </p>

                {/* Meta details: Client and PM */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.45rem',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.8rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#444444' }}>
                    <Building2 size={14} style={{ flexShrink: 0, color: '#666666' }} />
                    <span style={{ fontWeight: 600 }}>Client:</span>
                    <span style={{ color: '#1e1e1e' }}>{p.clientCompanyName || 'Internal Project'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#444444' }}>
                    <User size={14} style={{ flexShrink: 0, color: '#666666' }} />
                    <span style={{ fontWeight: 600 }}>Project Manager:</span>
                    <span style={{ color: '#1e1e1e' }}>{p.projectManagerName}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: '#444444', marginBottom: '0.35rem' }}>
                    <span>Progress</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div style={{ height: '7px', backgroundColor: '#ebebeb', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, Math.max(0, p.progress || 0))}%`,
                        backgroundColor: (p.progress || 0) === 100 ? '#16a34a' : '#1e1e1e',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Tech Stack Chips */}
                {techStack.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.15rem' }}>
                    {techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#4b5563',
                          backgroundColor: '#f3f4f6',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px'
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Timeline */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  color: '#666666',
                  marginBottom: '1.25rem'
                }}>
                  <Calendar size={13} />
                  <span>Target Delivery: {p.expectedEndDate || 'Flexible'}</span>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.65rem',
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '1rem',
                  marginTop: 'auto'
                }}>
                  <button
                    onClick={() => navigate('/member/tasks')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    <CheckSquare2 size={14} /> My Tasks
                  </button>
                  <button
                    onClick={() => navigate('/member/kanban')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                  >
                    <Kanban size={14} /> Board <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberProjectsPage;
