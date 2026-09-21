import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import {
  Bug,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Search,
  Filter,
  FolderKanban,
  ExternalLink,
  MessageSquare,
  Send,
  X,
  ShieldAlert,
  ArrowRight,
  Plus
} from 'lucide-react';

const ManagerBugsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectMembers, setProjectMembers] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, assigned: 0, inProgress: 0, resolved: 0, underRetest: 0, closed: 0, critical: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals & Detail State
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [activeBugDetail, setActiveBugDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [commentContent, setCommentContent] = useState('');

  // Report Defect Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    projectId: '',
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    severity: 'MEDIUM',
    priority: 'MEDIUM',
    environment: 'Chrome / Windows 11'
  });
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchBugs();
      fetchBugStats(selectedProjectId);
      fetchProjectMembers(selectedProjectId);
    }
  }, [selectedProjectId, statusFilter, severityFilter, search]);

  useEffect(() => {
    const isAnyOpen = (selectedBugId && activeBugDetail) || showReportModal;
    if (isAnyOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedBugId, activeBugDetail, showReportModal]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setProjects(list);
      if (list.length > 0) {
        setSelectedProjectId(list[0].projectId);
        setReportForm((prev) => ({ ...prev, projectId: list[0].projectId }));
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      setLoading(false);
    }
  };

  const handleReportBug = async (e) => {
    e.preventDefault();
    setReportSubmitting(true);
    setError('');
    try {
      await api.post(`/projects/${reportForm.projectId}/bugs`, reportForm);
      setShowReportModal(false);
      setSuccessMsg('Defect reported successfully and queued for assignment!');
      // Refresh if the selected project matches
      if (reportForm.projectId === selectedProjectId) {
        fetchBugs();
        fetchBugStats(selectedProjectId);
      } else {
        setSelectedProjectId(reportForm.projectId);
      }
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to submit defect report');
    } finally {
      setReportSubmitting(false);
    }
  };

  const fetchProjectMembers = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/members`);
      setProjectMembers(res.data || []);
    } catch (err) {
      console.error('Failed to load project members', err);
    }
  };

  const fetchBugs = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (severityFilter !== 'ALL') params.severity = severityFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get(`/projects/${selectedProjectId}/bugs`, { params });
      setBugs(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load bugs');
    } finally {
      setLoading(false);
    }
  };

  const fetchBugStats = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/bugs/stats`);
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to load bug stats', err);
    }
  };

  const handleOpenDetail = async (bugId) => {
    setSelectedBugId(bugId);
    setDetailLoading(true);
    try {
      const res = await api.get(`/bugs/${bugId}`);
      setActiveBugDetail(res.data);
      setSelectedAssigneeId(res.data?.assignedToId || '');
    } catch (err) {
      setError(err.message || 'Failed to load bug details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAssignBug = async () => {
    if (!selectedAssigneeId || !selectedBugId) return;
    try {
      await api.put(`/bugs/${selectedBugId}/assign`, { assignedToId: selectedAssigneeId });
      setSuccessMsg('Bug assigned successfully!');
      handleOpenDetail(selectedBugId);
      fetchBugs();
      fetchBugStats(selectedProjectId);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to assign developer');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || !selectedBugId) return;
    try {
      await api.post(`/bugs/${selectedBugId}/comments`, { content: commentContent.trim() });
      setCommentContent('');
      handleOpenDetail(selectedBugId);
    } catch (err) {
      setError(err.message || 'Failed to add comment');
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return { bg: '#ffe3e3', color: '#c92a2a', label: 'CRITICAL' };
      case 'HIGH':
        return { bg: '#fff3bf', color: '#d9480f', label: 'HIGH' };
      case 'MEDIUM':
        return { bg: '#f1f1f1', color: '#495057', label: 'MEDIUM' };
      default:
        return { bg: '#f8f9fa', color: '#868e96', label: 'LOW' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
        return { bg: '#ffe3e3', color: '#c92a2a', label: 'OPEN' };
      case 'ASSIGNED':
        return { bg: '#fff3bf', color: '#d9480f', label: 'ASSIGNED' };
      case 'IN_PROGRESS':
        return { bg: '#2b2b2b', color: '#ffffff', label: 'IN PROGRESS' };
      case 'RESOLVED':
        return { bg: '#e7f5ff', color: '#1c7ed6', label: 'RESOLVED' };
      case 'CLOSED':
        return { bg: '#e6fcf5', color: '#0ca678', label: 'CLOSED' };
      case 'REOPENED':
        return { bg: '#ffe3e3', color: '#c92a2a', label: 'REOPENED' };
      default:
        return { bg: '#f1f1f1', color: '#666666', label: status };
    }
  };

  const currentProject = projects.find((p) => p.projectId === selectedProjectId);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', margin: '0 0 0.35rem 0' }}>
            Bug Triage &amp; QA Defect Tracking
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Triage defects, assign developers, inspect resolution notes, and track QA retest cycles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Project Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '6px', padding: '0.4rem 0.75rem' }}>
            <FolderKanban size={16} color="#666666" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: 700, color: '#2b2b2b', outline: 'none', cursor: 'pointer' }}
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode} — {p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Report New Defect Button */}
          <button
            onClick={() => {
              setReportForm((prev) => ({ ...prev, projectId: selectedProjectId || (projects[0]?.projectId || '') }));
              setShowReportModal(true);
            }}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Report New Defect
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ebfbee', border: '1px solid #b2f2bb', borderRadius: '6px', color: '#2b8a3e', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          {successMsg}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase' }}>Total Defects</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.total}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c92a2a', textTransform: 'uppercase' }}>Critical</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c92a2a' }}>{stats.critical}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#c92a2a', textTransform: 'uppercase' }}>Open</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c92a2a' }}>{stats.open}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d9480f', textTransform: 'uppercase' }}>Assigned</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d9480f' }}>{stats.assigned}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2b2b2b', textTransform: 'uppercase' }}>In Progress</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.inProgress}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1c7ed6', textTransform: 'uppercase' }}>Resolved</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c7ed6' }}>{stats.resolved}</div>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0ca678', textTransform: 'uppercase' }}>Closed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0ca678' }}>{stats.closed}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#666666' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="REOPENED">REOPENED</option>
            </select>
          </div>

          {/* Severity filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#666666' }}>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b' }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} color="#8c8c8c" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search defects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.35rem 0.65rem 0.35rem 2rem', border: '1px solid #d4d4d4', borderRadius: '4px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {/* Defects Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#666666' }}>Loading defects...</div>
        ) : bugs.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <CheckCircle2 size={38} color="#0ca678" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
              No Defects Matching Criteria
            </h3>
            <p style={{ color: '#666666', fontSize: '0.88rem' }}>
              No matching bugs found for <strong>{currentProject?.projectName}</strong>.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid #d4d4d4', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Defect Code &amp; Title</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Severity</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Priority</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Reporter</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Assignee</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bugs.map((b) => {
                  const sBadge = getSeverityBadge(b.severity);
                  const stBadge = getStatusBadge(b.status);

                  return (
                    <tr
                      key={b.bugId}
                      onClick={() => handleOpenDetail(b.bugId)}
                      style={{ borderBottom: '1px solid #ececec', cursor: 'pointer', transition: 'background-color 0.1s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.45rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', letterSpacing: '0.03em' }}>
                            {b.bugCode}
                          </span>
                          {b.taskCode && (
                            <span style={{ fontSize: '0.68rem', color: '#666666', border: '1px solid #e0e0e0', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                              Task: {b.taskCode}
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, color: '#2b2b2b' }}>{b.title}</div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          backgroundColor: sBadge.bg,
                          color: sBadge.color
                        }}>
                          {sBadge.label}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: '#495057' }}>
                        {b.priority}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#2b2b2b' }}>
                        {b.reportedByName}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        {b.assignedToName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: '#2b2b2b' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2b2b2b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700 }}>
                              {b.assignedToName.charAt(0)}
                            </div>
                            <span>{b.assignedToName}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#c92a2a', fontWeight: 700 }}>
                            Unassigned
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          backgroundColor: stBadge.bg,
                          color: stBadge.color
                        }}>
                          {stBadge.label}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          Triage <ArrowRight size={13} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL & TRIAGE MODAL */}
      {/* REPORT NEW DEFECT MODAL */}
      {showReportModal && createPortal(
        <div
          onClick={() => setShowReportModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1.5rem 1rem',
            overflowY: 'auto'
          }}
        >
          <div
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '580px',
              width: '100%',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.2rem 0' }}>Report New Defect</h2>
                <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>Document a software defect for the development team to resolve.</p>
              </div>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666666' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportBug} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Project */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>Project *</label>
                <select
                  required
                  value={reportForm.projectId}
                  onChange={(e) => setReportForm({ ...reportForm, projectId: e.target.value })}
                  className="form-control"
                >
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>{p.projectCode} — {p.projectName}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>Defect Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Short, descriptive defect title"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                  className="form-control"
                />
              </div>

              {/* Severity & Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>Severity</label>
                  <select value={reportForm.severity} onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })} className="form-control">
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>Priority</label>
                  <select value={reportForm.priority} onChange={(e) => setReportForm({ ...reportForm, priority: e.target.value })} className="form-control">
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the defect in detail..."
                  value={reportForm.description}
                  onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                  className="form-control"
                />
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>Steps to Reproduce</label>
                <textarea
                  rows={3}
                  placeholder="1. Navigate to...&#10;2. Click on...&#10;3. Observe..."
                  value={reportForm.stepsToReproduce}
                  onChange={(e) => setReportForm({ ...reportForm, stepsToReproduce: e.target.value })}
                  className="form-control"
                />
              </div>

              {/* Expected vs Actual */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0ca678', marginBottom: '0.3rem' }}>Expected Behavior</label>
                  <textarea
                    rows={2}
                    placeholder="What should happen?"
                    value={reportForm.expectedBehavior}
                    onChange={(e) => setReportForm({ ...reportForm, expectedBehavior: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#c92a2a', marginBottom: '0.3rem' }}>Actual Behavior</label>
                  <textarea
                    rows={2}
                    placeholder="What actually happens?"
                    value={reportForm.actualBehavior}
                    onChange={(e) => setReportForm({ ...reportForm, actualBehavior: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Environment */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>Environment</label>
                <input
                  type="text"
                  placeholder="e.g. Chrome 120 / Windows 11 / Staging"
                  value={reportForm.environment}
                  onChange={(e) => setReportForm({ ...reportForm, environment: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={() => setShowReportModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={reportSubmitting}>
                  {reportSubmitting ? 'Reporting...' : 'Submit Defect Report'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {selectedBugId && activeBugDetail && createPortal(
        <div
          onClick={() => setSelectedBugId(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1.5rem 1rem',
            overflowY: 'auto'
          }}
        >
          <div
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '740px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              padding: '2rem'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #ececec', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.5rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px' }}>
                    {activeBugDetail.bugCode}
                  </span>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    backgroundColor: getSeverityBadge(activeBugDetail.severity).bg,
                    color: getSeverityBadge(activeBugDetail.severity).color
                  }}>
                    {activeBugDetail.severity}
                  </span>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    backgroundColor: getStatusBadge(activeBugDetail.status).bg,
                    color: getStatusBadge(activeBugDetail.status).color
                  }}>
                    {activeBugDetail.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                  {activeBugDetail.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedBugId(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#666666' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Developer Assignment Section */}
            <div style={{ backgroundColor: '#fafafa', border: '1px solid #e5e5e5', borderRadius: '6px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Assigned Developer (Project Team Member)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  value={selectedAssigneeId}
                  onChange={(e) => setSelectedAssigneeId(e.target.value)}
                  style={{ flex: 1, minWidth: '220px', padding: '0.5rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="">-- Unassigned --</option>
                  {projectMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName} — {m.roleCategoryName}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAssignBug}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  Save Assignment
                </button>
              </div>
            </div>

            {/* Core Bug Description & Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {activeBugDetail.description && (
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>Overview</h4>
                  <p style={{ fontSize: '0.88rem', color: '#2b2b2b', margin: 0, lineHeight: 1.45, backgroundColor: '#fcfcfc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                    {activeBugDetail.description}
                  </p>
                </div>
              )}

              {activeBugDetail.stepsToReproduce && (
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>Steps to Reproduce</h4>
                  <pre style={{ fontSize: '0.85rem', color: '#2b2b2b', margin: 0, padding: '0.75rem', backgroundColor: '#fcfcfc', borderRadius: '6px', border: '1px solid #f0f0f0', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {activeBugDetail.stepsToReproduce}
                  </pre>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0ca678', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>Expected Behavior</h4>
                  <p style={{ fontSize: '0.85rem', color: '#2b2b2b', margin: 0, padding: '0.75rem', backgroundColor: '#f6fdf9', borderRadius: '6px', border: '1px solid #d3f9d8' }}>
                    {activeBugDetail.expectedBehavior || 'Not specified'}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#c92a2a', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>Actual Behavior</h4>
                  <p style={{ fontSize: '0.85rem', color: '#2b2b2b', margin: 0, padding: '0.75rem', backgroundColor: '#fff5f5', borderRadius: '6px', border: '1px solid #ffc9c9' }}>
                    {activeBugDetail.actualBehavior || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Environment & Metadata */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: '#666666', backgroundColor: '#fafafa', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                <div><strong>Environment:</strong> {activeBugDetail.environment || 'N/A'}</div>
                <div><strong>Reported By:</strong> {activeBugDetail.reportedByName}</div>
                <div><strong>Reported On:</strong> {new Date(activeBugDetail.createdAt).toLocaleDateString()}</div>
              </div>

              {/* Resolution Notes (if any) */}
              {activeBugDetail.resolutionNotes && (
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1c7ed6', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>Developer Fix &amp; Resolution Notes</h4>
                  <p style={{ fontSize: '0.86rem', color: '#2b2b2b', margin: 0, padding: '0.75rem', backgroundColor: '#f0f8ff', borderRadius: '6px', border: '1px solid #d0ebff', lineHeight: 1.4 }}>
                    {activeBugDetail.resolutionNotes}
                  </p>
                </div>
              )}

              {/* Retest Notes (if any) */}
              {activeBugDetail.retestNotes && (
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>QA Retest Audit Log</h4>
                  <p style={{ fontSize: '0.86rem', color: '#2b2b2b', margin: 0, padding: '0.75rem', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e0e0e0', lineHeight: 1.4 }}>
                    {activeBugDetail.retestNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Activity Discussion Thread */}
            <div style={{ borderTop: '1px solid #ececec', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={16} /> Threaded Discussion ({activeBugDetail.comments?.length || 0})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                {activeBugDetail.comments && activeBugDetail.comments.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: '#8c8c8c', fontStyle: 'italic' }}>
                    No comments posted yet.
                  </div>
                ) : (
                  activeBugDetail.comments?.map((c) => (
                    <div key={c.commentId} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e8e8e8', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <strong style={{ color: '#2b2b2b' }}>{c.authorName}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#8c8c8c' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p style={{ margin: 0, color: '#444444' }}>{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  placeholder="Post comment to defect discussion..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem' }}>
                  <Send size={13} /> Send
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ManagerBugsPage;
