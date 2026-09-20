import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  FolderKanban,
  Flag,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const ClientProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [milestonesByProject, setMilestonesByProject] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setProjects(list);

      // Auto expand the first project and load its milestones
      if (list.length > 0) {
        const firstId = list[0].projectId;
        setExpandedProjects({ [firstId]: true });
        loadProjectMilestones(firstId);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectMilestones = async (projectId) => {
    if (milestonesByProject[projectId]) return;
    try {
      const res = await api.get(`/projects/${projectId}/milestones`);
      setMilestonesByProject((prev) => ({
        ...prev,
        [projectId]: res.data || []
      }));
    } catch (err) {
      console.error('Failed to load milestones for project ' + projectId, err);
    }
  };

  const toggleExpand = (projectId) => {
    setExpandedProjects((prev) => {
      const nextState = !prev[projectId];
      if (nextState) {
        loadProjectMilestones(projectId);
      }
      return { ...prev, [projectId]: nextState };
    });
  };

  const filteredProjects = projects.filter((p) => {
    return (
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#e6fcf5', color: '#0ca678', label: 'COMPLETED' };
      case 'IN_PROGRESS':
        return { bg: '#2b2b2b', color: '#ffffff', label: 'IN PROGRESS' };
      case 'DELAYED':
        return { bg: '#ffe3e3', color: '#c92a2a', label: 'DELAYED' };
      case 'ON_HOLD':
        return { bg: '#fff9db', color: '#f59f00', label: 'ON HOLD' };
      default:
        return { bg: '#f1f1f1', color: '#666666', label: 'PLANNING' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', margin: '0 0 0.35rem 0' }}>
            Contracted Projects &amp; Deliverables
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Track project delivery roadmaps, inspect sprint milestones, and monitor real-time completion progress.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} color="#8c8c8c" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              backgroundColor: '#ffffff',
              border: '1px solid #d4d4d4',
              borderRadius: '6px',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#666666' }}>
          Loading contracted projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <FolderKanban size={38} color="#b3b3b3" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
            No Contracted Projects Found
          </h3>
          <p style={{ color: '#666666', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto' }}>
            There are currently no active contracts or projects mapped to your client profile.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredProjects.map((p) => {
            const badge = getStatusBadge(p.status);
            const isExpanded = !!expandedProjects[p.projectId];
            const pMilestones = milestonesByProject[p.projectId] || [];

            return (
              <div
                key={p.projectId}
                className="card"
                style={{
                  padding: '1.5rem',
                  borderTop: '4px solid #2b2b2b',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* Project Header Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', letterSpacing: '0.04em' }}>
                        {p.projectCode}
                      </span>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2b2b2b', margin: 0, letterSpacing: '-0.01em' }}>
                        {p.projectName}
                      </h2>
                      <span style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: badge.bg,
                        color: badge.color
                      }}>
                        {badge.label}
                      </span>
                    </div>

                    {p.description && (
                      <p style={{ fontSize: '0.88rem', color: '#666666', margin: 0, lineHeight: 1.4, maxWidth: '750px' }}>
                        {p.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(p.projectId)}
                    className="btn btn-secondary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isExpanded ? 'Hide Deliverables' : 'View Milestones & Roadmap'}
                  </button>
                </div>

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', backgroundColor: '#fafafa', padding: '1.25rem', borderRadius: '6px', marginBottom: '1.25rem', border: '1px solid #f0f0f0' }}>
                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 700, color: '#2b2b2b' }}>Overall Project Progress</span>
                      <span style={{ fontWeight: 800, color: '#2b2b2b' }}>{p.progressPercentage}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e5e5e5', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${p.progressPercentage}%`,
                          backgroundColor: p.progressPercentage === 100 ? '#0ca678' : '#2b2b2b',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                  </div>

                  {/* Appointed Project Manager */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2b2b2b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                      {p.projectManagerName ? p.projectManagerName.charAt(0) : 'P'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#8c8c8c', fontWeight: 700, textTransform: 'uppercase' }}>Project Manager</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2b2b2b' }}>{p.projectManagerName || 'Appointed Manager'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666666' }}>{p.projectManagerEmail}</div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.25rem', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666666' }}>
                      <Calendar size={14} color="#2b2b2b" />
                      <span>Start: <strong>{p.startDate || '—'}</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666666' }}>
                      <Clock size={14} color="#2b2b2b" />
                      <span>Target End: <strong>{p.endDate || '—'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Milestones & Deliverables Roadmap Section */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #d4d4d4', paddingTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2b2b2b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Flag size={18} color="#2b2b2b" /> Delivery Milestones &amp; Acceptance Roadmap
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#8c8c8c' }}>
                        {pMilestones.length} Deliverables Planned
                      </span>
                    </div>

                    {pMilestones.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fcfcfc', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                        <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
                          No milestone deliverables have been published yet for this project.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {pMilestones.map((m) => {
                          const mBadge = getStatusBadge(m.status);
                          return (
                            <div
                              key={m.milestoneId}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                padding: '1rem 1.25rem',
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e5e5',
                                borderRadius: '6px',
                                borderLeft: m.status === 'COMPLETED' ? '4px solid #0ca678' : m.status === 'DELAYED' ? '4px solid #c92a2a' : '4px solid #2b2b2b'
                              }}
                            >
                              {/* Left: Info */}
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: '240px' }}>
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
                                  fontSize: '0.8rem',
                                  flexShrink: 0
                                }}>
                                  M{m.orderIndex}
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                                      {m.title}
                                    </h4>
                                    <span style={{
                                      padding: '0.15rem 0.45rem',
                                      borderRadius: '3px',
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      backgroundColor: mBadge.bg,
                                      color: mBadge.color
                                    }}>
                                      {mBadge.label}
                                    </span>
                                  </div>
                                  {m.description && (
                                    <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0, lineHeight: 1.35 }}>
                                      {m.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right: Progress & Target Date */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                                <div style={{ width: '130px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                                    <span style={{ color: '#666666' }}>Progress</span>
                                    <span style={{ fontWeight: 800, color: '#2b2b2b' }}>{m.progressPercentage}%</span>
                                  </div>
                                  <div style={{ height: '6px', backgroundColor: '#ececec', borderRadius: '999px', overflow: 'hidden' }}>
                                    <div
                                      style={{
                                        height: '100%',
                                        width: `${m.progressPercentage}%`,
                                        backgroundColor: m.progressPercentage === 100 ? '#0ca678' : '#2b2b2b'
                                      }}
                                    />
                                  </div>
                                </div>

                                <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                                  <div style={{ color: '#8c8c8c', fontSize: '0.7rem' }}>TARGET DELIVERY</div>
                                  <div style={{ fontWeight: 700, color: '#2b2b2b' }}>{m.targetDate || 'TBD'}</div>
                                  {m.actualCompletionDate && (
                                    <div style={{ color: '#0ca678', fontSize: '0.72rem', fontWeight: 600 }}>
                                      Delivered {m.actualCompletionDate}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientProjectsPage;
