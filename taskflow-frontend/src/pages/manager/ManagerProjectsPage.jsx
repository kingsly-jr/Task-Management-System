import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  FolderKanban,
  Search,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';

const ManagerProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignedProjects();
  }, [search, statusFilter]);

  const fetchAssignedProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get('/projects', { params });
      setProjects(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned projects');
    } finally {
      setLoading(false);
    }
  };

  const totalCount = projects.length;
  const inProgressCount = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const planningCount = projects.filter((p) => p.status === 'PLANNING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2b2b2b', letterSpacing: '-0.02em', margin: 0 }}>
            My Assigned Projects
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666666' }}>
            Projects where you are appointed as Lead Project Manager. Manage team allocations, sprint tasks, and delivery schedules.
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Assigned Projects</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{totalCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Under your leadership</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Active Execution</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{inProgressCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>In Progress sprints</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Planning & Staffing</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{planningCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Awaiting resource allocation</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fff2f2', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fbfbfb', border: '1px solid #d4d4d4', borderRadius: '6px', padding: '0.45rem 0.75rem', minWidth: '260px', flex: 1 }}>
          <Search size={16} color="#8c8c8c" />
          <input
            type="text"
            placeholder="Search assigned projects by code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: '#2b2b2b' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'PLANNING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: statusFilter === status ? '#2b2b2b' : '#d4d4d4',
                backgroundColor: statusFilter === status ? '#2b2b2b' : '#ffffff',
                color: statusFilter === status ? '#ffffff' : '#666666',
              }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.9rem', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px' }}>
          Loading your assigned projects...
        </div>
      ) : projects.length === 0 ? (
        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px' }}>
          <FolderKanban size={38} color="#b3b3b3" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', margin: '0 0 0.25rem 0' }}>No Projects Assigned</h3>
          <p style={{ fontSize: '0.82rem', color: '#8c8c8c', margin: 0 }}>
            You do not currently have any active projects assigned to your portfolio. Contact company administration to be assigned to new client initiatives.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {projects.map((p) => (
            <div
              key={p.projectId}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d4d4d4',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.5rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', letterSpacing: '0.04em' }}>
                    {p.projectCode}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: p.priority === 'URGENT' ? '#ffe3e3' : p.priority === 'HIGH' ? '#fff3bf' : '#f1f1f1',
                        color: p.priority === 'URGENT' ? '#c92a2a' : p.priority === 'HIGH' ? '#d9480f' : '#495057',
                      }}
                    >
                      {p.priority}
                    </span>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: p.status === 'COMPLETED' ? '#e6fcf5' : p.status === 'IN_PROGRESS' ? '#2b2b2b' : '#f1f1f1',
                        color: p.status === 'COMPLETED' ? '#0ca678' : p.status === 'IN_PROGRESS' ? '#ffffff' : '#666666',
                      }}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.35rem 0', letterSpacing: '-0.01em' }}>
                  {p.projectName}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#666666', marginBottom: '0.75rem' }}>
                  <Building2 size={13} color="#8c8c8c" />
                  <span>Client: <strong>{p.clientCompanyName}</strong></span>
                </div>

                {p.description && (
                  <p style={{ fontSize: '0.8rem', color: '#666666', margin: '0 0 0.85rem 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                )}

                {/* Progress bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#666666', marginBottom: '0.3rem' }}>
                    <span>Milestone Completion</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${p.progress || 0}%`, height: '100%', backgroundColor: '#2b2b2b', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.76rem', color: '#666666', backgroundColor: '#fafafa', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Layers size={13} color="#8c8c8c" />
                    <span>Allocated: <strong>{p.teamMembersCount} members</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} color="#8c8c8c" />
                    <span>Target: <strong>{p.expectedEndDate}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => navigate(`/manager/projects/${p.projectId}`)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1rem',
                    backgroundColor: '#2b2b2b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2b2b2b')}
                >
                  Manage Team & Project <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerProjectsPage;
