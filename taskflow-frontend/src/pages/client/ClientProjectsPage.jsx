import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  FolderKanban,
  Flag,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock3,
  User,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  ShieldCheck,
  Star,
  CheckSquare2,
  FileText,
  MessageSquare,
  ArrowRight,
  Download,
  Send,
  Eye,
  Hash
} from 'lucide-react';

const ClientProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [taskStatsByProject, setTaskStatsByProject] = useState({});
  const [milestonesByProject, setMilestonesByProject] = useState({});
  const [tasksByProject, setTasksByProject] = useState({});
  const [docsByProject, setDocsByProject] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [activeCardTab, setActiveCardTab] = useState({}); // { [projectId]: 'milestones' | 'tasks' | 'docs' | 'chat' }
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

      // Auto expand the first project and load details
      if (list.length > 0) {
        const firstId = list[0].projectId;
        setExpandedProjects({ [firstId]: true });
        setActiveCardTab({ [firstId]: 'tasks' });
        loadProjectDetails(firstId);
      }

      // Fetch task stats for all projects in background
      list.forEach((p) => {
        api.get(`/projects/${p.projectId}/tasks/stats`)
          .then((sRes) => {
            setTaskStatsByProject((prev) => ({ ...prev, [p.projectId]: sRes.data }));
          })
          .catch(() => {});
      });
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId) => {
    try {
      const [mRes, tRes, dRes] = await Promise.all([
        !milestonesByProject[projectId] ? api.get(`/projects/${projectId}/milestones`) : Promise.resolve(null),
        !tasksByProject[projectId] ? api.get(`/projects/${projectId}/tasks`) : Promise.resolve(null),
        !docsByProject[projectId] ? api.get(`/projects/${projectId}/documents`) : Promise.resolve(null)
      ]);

      if (mRes) setMilestonesByProject((prev) => ({ ...prev, [projectId]: mRes.data || [] }));
      if (tRes) setTasksByProject((prev) => ({ ...prev, [projectId]: tRes.data || [] }));
      if (dRes) setDocsByProject((prev) => ({ ...prev, [projectId]: dRes.data || [] }));
    } catch (err) {
      console.error('Failed to load project details for ' + projectId, err);
    }
  };

  const toggleExpand = (projectId) => {
    setExpandedProjects((prev) => {
      const nextState = !prev[projectId];
      if (nextState) {
        if (!activeCardTab[projectId]) {
          setActiveCardTab((t) => ({ ...t, [projectId]: 'tasks' }));
        }
        loadProjectDetails(projectId);
      }
      return { ...prev, [projectId]: nextState };
    });
  };

  const setCardTab = (projectId, tab) => {
    setActiveCardTab((prev) => ({ ...prev, [projectId]: tab }));
    loadProjectDetails(projectId);
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
        return { bg: '#f1f1f1', color: '#666666', label: status || 'PLANNING' };
    }
  };

  const getTaskStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#e6fcf5', color: '#0ca678', label: 'Completed' };
      case 'IN_REVIEW':
        return { bg: '#e7f5ff', color: '#1971c2', label: 'In Review' };
      case 'IN_PROGRESS':
        return { bg: '#fff4e6', color: '#d9480f', label: 'In Progress' };
      default:
        return { bg: '#f1f3f5', color: '#495057', label: 'To Do' };
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
            Track project delivery roadmaps, inspect real-time task progress, documents, and reach out directly to each project's manager.
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
            const currentTab = activeCardTab[p.projectId] || 'tasks';
            const pMilestones = milestonesByProject[p.projectId] || [];
            const pTasks = tasksByProject[p.projectId] || [];
            const pDocs = docsByProject[p.projectId] || [];
            const pStats = taskStatsByProject[p.projectId];

            const progressVal = p.progressPercentage !== undefined && p.progressPercentage !== null
              ? p.progressPercentage
              : (p.progress !== undefined && p.progress !== null ? p.progress : 0);

            return (
              <div
                key={p.projectId}
                className="card"
                style={{
                  padding: '1.5rem',
                  borderTop: '4px solid #2b2b2b',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
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

                  {/* Actions Header */}
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link
                      to={`/client/projects/${p.projectId}`}
                      className="btn btn-primary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                        padding: '0.55rem 1rem'
                      }}
                    >
                      <FolderKanban size={15} />
                      <span>Open Project Hub</span>
                      <ArrowRight size={14} />
                    </Link>

                    {p.status === 'COMPLETED' && (
                      <Link
                        to="/client/feedback"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          backgroundColor: '#1e1e1e',
                          color: '#ffffff',
                          padding: '0.55rem 0.95rem',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                        }}
                      >
                        <Star size={13} fill="#ffffff" />
                        <span>Give Feedback</span>
                      </Link>
                    )}

                    <button
                      onClick={() => toggleExpand(p.projectId)}
                      className="btn btn-secondary"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      {isExpanded ? 'Collapse' : 'Quick Inspect'}
                    </button>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', backgroundColor: '#fafafa', padding: '1.25rem', borderRadius: '6px', marginBottom: '1.25rem', border: '1px solid #f0f0f0' }}>
                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 700, color: '#2b2b2b' }}>Overall Project Progress</span>
                      <span style={{ fontWeight: 800, color: '#2b2b2b', fontSize: '0.9rem' }}>{progressVal}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e5e5e5', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${progressVal}%`,
                          backgroundColor: progressVal === 100 ? '#0ca678' : '#2b2b2b',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    {/* Task summary pills */}
                    {pStats && (
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.45rem', fontSize: '0.72rem' }}>
                        <span style={{ padding: '0.1rem 0.4rem', backgroundColor: '#e6fcf5', color: '#0ca678', borderRadius: '3px', fontWeight: 700 }}>
                          ✓ {pStats.completed || 0} Done
                        </span>
                        <span style={{ padding: '0.1rem 0.4rem', backgroundColor: '#e7f5ff', color: '#1971c2', borderRadius: '3px', fontWeight: 700 }}>
                          ⏳ {pStats.inReview || 0} In Review
                        </span>
                        <span style={{ padding: '0.1rem 0.4rem', backgroundColor: '#fff4e6', color: '#d9480f', borderRadius: '3px', fontWeight: 700 }}>
                          ⚡ {pStats.inProgress || 0} Active
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Appointed Project Manager */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#2b2b2b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0 }}>
                      {p.projectManagerName ? p.projectManagerName.charAt(0) : 'P'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#8c8c8c', fontWeight: 700, textTransform: 'uppercase' }}>Project Manager</div>
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
                      <span>Target End: <strong>{p.expectedEndDate || p.endDate || '—'}</strong></span>
                    </div>
                  </div>

                  {/* Financial Settlement */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: 700, color: '#2b2b2b' }}>Contract Billing</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        backgroundColor: (p.remainingAmount !== null && p.remainingAmount !== undefined ? Number(p.remainingAmount) : Math.max(0, (Number(p.budget) || 0) - (Number(p.paidAmount) || 0))) === 0 && Number(p.budget) > 0 ? '#e6fcf5' : '#f1f1f1',
                        color: (p.remainingAmount !== null && p.remainingAmount !== undefined ? Number(p.remainingAmount) : Math.max(0, (Number(p.budget) || 0) - (Number(p.paidAmount) || 0))) === 0 && Number(p.budget) > 0 ? '#0ca678' : '#2b2b2b'
                      }}>
                        {(p.remainingAmount !== null && p.remainingAmount !== undefined ? Number(p.remainingAmount) : Math.max(0, (Number(p.budget) || 0) - (Number(p.paidAmount) || 0))) === 0 && Number(p.budget) > 0 ? '✓ Settled' : 'Partial'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#666666', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Budget:</span>
                        <strong style={{ color: '#2b2b2b' }}>${p.budget ? Number(p.budget).toLocaleString() : 'N/A'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Paid:</span>
                        <strong style={{ color: '#2b8a3e' }}>${p.paidAmount !== null && p.paidAmount !== undefined ? Number(p.paidAmount).toLocaleString() : '0'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Balance Due:</span>
                        <strong style={{ color: Number(p.remainingAmount) > 0 ? '#d9480f' : '#2b2b2b' }}>${p.remainingAmount !== null && p.remainingAmount !== undefined ? Number(p.remainingAmount).toLocaleString() : (p.budget ? Number(p.budget - (p.paidAmount || 0)).toLocaleString() : '0')}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* In-Card Quick Tab Accordion */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1.25rem' }}>
                    {/* Tab Selection Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f5f5f5', padding: '0.25rem', borderRadius: '6px' }}>
                        <button
                          onClick={() => setCardTab(p.projectId, 'tasks')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: currentTab === 'tasks' ? 800 : 600,
                            backgroundColor: currentTab === 'tasks' ? '#ffffff' : 'transparent',
                            color: currentTab === 'tasks' ? '#2b2b2b' : '#666666',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: currentTab === 'tasks' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          <CheckSquare2 size={14} /> Tasks ({pTasks.length})
                        </button>

                        <button
                          onClick={() => setCardTab(p.projectId, 'milestones')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: currentTab === 'milestones' ? 800 : 600,
                            backgroundColor: currentTab === 'milestones' ? '#ffffff' : 'transparent',
                            color: currentTab === 'milestones' ? '#2b2b2b' : '#666666',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: currentTab === 'milestones' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          <Flag size={14} /> Milestones ({pMilestones.length})
                        </button>

                        <button
                          onClick={() => setCardTab(p.projectId, 'docs')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: currentTab === 'docs' ? 800 : 600,
                            backgroundColor: currentTab === 'docs' ? '#ffffff' : 'transparent',
                            color: currentTab === 'docs' ? '#2b2b2b' : '#666666',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: currentTab === 'docs' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          <FileText size={14} /> Documents ({pDocs.length})
                        </button>

                        <button
                          onClick={() => setCardTab(p.projectId, 'chat')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: currentTab === 'chat' ? 800 : 600,
                            backgroundColor: currentTab === 'chat' ? '#ffffff' : 'transparent',
                            color: currentTab === 'chat' ? '#2b2b2b' : '#666666',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            boxShadow: currentTab === 'chat' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          <MessageSquare size={14} /> Direct Chat
                        </button>
                      </div>

                      <Link
                        to={`/client/projects/${p.projectId}?tab=${currentTab === 'chat' ? 'messages' : currentTab === 'docs' ? 'documents' : 'progress'}`}
                        style={{ fontSize: '0.8rem', color: '#2b2b2b', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <span>Full Workspace View</span>
                        <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                      </Link>
                    </div>

                    {/* TAB: TASKS PREVIEW */}
                    {currentTab === 'tasks' && (
                      <div>
                        {pTasks.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fcfcfc', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                            <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
                              No tasks have been created yet for this project.
                            </p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {pTasks.slice(0, 5).map((t) => {
                              const tBadge = getTaskStatusBadge(t.status);
                              const subTotal = t.totalSubtasks || 0;
                              const subDone = t.completedSubtasks || 0;

                              return (
                                <div
                                  key={t.taskId}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#fafafa',
                                    border: '1px solid #e9ecef',
                                    borderRadius: '6px'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.35rem', backgroundColor: '#e9ecef', borderRadius: '3px' }}>
                                      {t.taskCode || `TSK-${t.taskId}`}
                                    </span>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2b2b2b' }}>
                                      {t.title}
                                    </span>
                                    <span style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      padding: '0.1rem 0.4rem',
                                      borderRadius: '3px',
                                      backgroundColor: tBadge.bg,
                                      color: tBadge.color
                                    }}>
                                      {tBadge.label}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', color: '#666666' }}>
                                    {subTotal > 0 && (
                                      <span>Checklist: <strong>{subDone}/{subTotal}</strong></span>
                                    )}
                                    {t.prUrl && (
                                      <a href={t.prUrl} target="_blank" rel="noreferrer" style={{ color: '#1971c2', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                        <ExternalLink size={12} /> PR
                                      </a>
                                    )}
                                    <Link
                                      to={`/client/projects/${p.projectId}?tab=progress`}
                                      style={{ color: '#2b2b2b', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                    >
                                      Inspect <ArrowRight size={12} />
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}

                            {pTasks.length > 5 && (
                              <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                                <Link
                                  to={`/client/projects/${p.projectId}?tab=progress`}
                                  style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', textDecoration: 'none' }}
                                >
                                  View all {pTasks.length} tasks in Project Hub →
                                </Link>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: MILESTONES PREVIEW */}
                    {currentTab === 'milestones' && (
                      <div>
                        {pMilestones.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fcfcfc', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                            <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
                              No milestone deliverables have been published yet for this project.
                            </p>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
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
                                    padding: '0.85rem 1rem',
                                    backgroundColor: '#fafafa',
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '6px',
                                    borderLeft: m.status === 'COMPLETED' ? '4px solid #0ca678' : '4px solid #2b2b2b'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.1rem 0.35rem', backgroundColor: '#2b2b2b', color: '#fff', borderRadius: '3px' }}>
                                      M{m.orderIndex}
                                    </span>
                                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2b2b2b' }}>
                                      {m.title}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '3px', backgroundColor: mBadge.bg, color: mBadge.color }}>
                                      {mBadge.label}
                                    </span>
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem' }}>
                                    <span>Progress: <strong>{m.progressPercentage}%</strong></span>
                                    <span>Target: <strong>{m.targetDate || 'TBD'}</strong></span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: DOCUMENTS PREVIEW */}
                    {currentTab === 'docs' && (
                      <div>
                        {pDocs.length === 0 ? (
                          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fcfcfc', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                            <p style={{ fontSize: '0.85rem', color: '#666666', margin: '0 0 0.5rem 0' }}>
                              No documents uploaded for this project yet.
                            </p>
                            <Link to={`/client/projects/${p.projectId}?tab=documents`} className="btn btn-secondary" style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}>
                              Upload Document in Project Hub
                            </Link>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {pDocs.slice(0, 4).map((doc) => (
                              <div
                                key={doc.documentId}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.75rem 1rem',
                                  backgroundColor: '#fafafa',
                                  border: '1px solid #e9ecef',
                                  borderRadius: '6px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <FileText size={16} color="#2b2b2b" />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2b2b2b' }}>{doc.title}</span>
                                  <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.35rem', backgroundColor: '#e9ecef', borderRadius: '3px' }}>{doc.category}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
                                  <span style={{ color: '#8c8c8c' }}>{doc.fileSizeFormatted}</span>
                                  <Link to={`/client/projects/${p.projectId}?tab=documents`} style={{ color: '#2b2b2b', fontWeight: 700, textDecoration: 'none' }}>
                                    View &amp; Download →
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB: DIRECT CHAT PREVIEW */}
                    {currentTab === 'chat' && (
                      <div style={{ padding: '1.25rem', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e9ecef', textAlign: 'center' }}>
                        <MessageSquare size={28} color="#2b2b2b" style={{ margin: '0 auto 0.5rem auto' }} />
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.25rem 0' }}>
                          Direct Messaging with {p.projectManagerName || 'Alex Morgan'}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#666666', maxWidth: '440px', margin: '0 auto 1rem auto' }}>
                          Communicate in dedicated project channels without mixing conversations from other contracts.
                        </p>
                        <Link
                          to={`/client/projects/${p.projectId}?tab=messages`}
                          className="btn btn-primary"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 1rem' }}
                        >
                          <MessageSquare size={14} /> Open Project Chat Thread
                        </Link>
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
