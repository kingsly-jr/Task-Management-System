import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Bug,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Play,
  Check,
  X,
  MessageSquare,
  Send,
  ExternalLink,
  FolderKanban
} from 'lucide-react';

const MemberBugsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('ASSIGNED'); // 'ASSIGNED' or 'REPORTED'
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [activeBugDetail, setActiveBugDetail] = useState(null);
  const [commentContent, setCommentContent] = useState('');

  // Background scroll lock when any modal is active
  const isAnyModalOpen = showReportModal || showResolveModal || showReopenModal || showDetailModal;
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Form States
  const [reportFormData, setReportFormData] = useState({
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

  const [resolveNotes, setResolveNotes] = useState('');
  const [reopenNotes, setReopenNotes] = useState('');

  useEffect(() => {
    fetchMyBugs(activeTab);
    fetchMemberProjects();
  }, [activeTab]);

  const fetchMyBugs = async (tab) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bugs/my-bugs', { params: { filter: tab } });
      setBugs(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load bugs');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberProjects = async () => {
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setProjects(list);
      if (list.length > 0 && !reportFormData.projectId) {
        setReportFormData((prev) => ({ ...prev, projectId: list[0].projectId }));
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    }
  };

  const handleOpenDetail = async (bug) => {
    setSelectedBug(bug);
    try {
      const res = await api.get(`/bugs/${bug.bugId}`);
      setActiveBugDetail(res.data);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message || 'Failed to load defect details');
    }
  };

  const handleStartWorking = async (bugId) => {
    try {
      await api.patch(`/bugs/${bugId}/status`, { status: 'IN_PROGRESS' });
      setSuccessMsg('Status updated to IN_PROGRESS');
      fetchMyBugs(activeTab);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleOpenResolve = (bug) => {
    setSelectedBug(bug);
    setResolveNotes('');
    setShowResolveModal(true);
  };

  const handleSubmitResolve = async (e) => {
    e.preventDefault();
    if (!resolveNotes.trim() || !selectedBug) return;
    try {
      await api.post(`/bugs/${selectedBug.bugId}/resolve`, { resolutionNotes: resolveNotes.trim() });
      setShowResolveModal(false);
      setSuccessMsg('Bug marked as RESOLVED and queued for QA Retest!');
      fetchMyBugs(activeTab);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to resolve defect');
    }
  };

  const handleRetestPass = async (bugId) => {
    try {
      await api.post(`/bugs/${bugId}/retest`, { passed: true, retestNotes: 'Verified fix on build release. Retest passed.' });
      setSuccessMsg('Retest PASSED: Defect successfully verified and CLOSED!');
      fetchMyBugs(activeTab);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to close defect');
    }
  };

  const handleOpenReopen = (bug) => {
    setSelectedBug(bug);
    setReopenNotes('');
    setShowReopenModal(true);
  };

  const handleSubmitReopen = async (e) => {
    e.preventDefault();
    if (!selectedBug) return;
    try {
      await api.post(`/bugs/${selectedBug.bugId}/retest`, { passed: false, retestNotes: reopenNotes.trim() });
      setShowReopenModal(false);
      setSuccessMsg('Retest failed: Defect REOPENED and sent back to developer');
      fetchMyBugs(activeTab);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to reopen defect');
    }
  };

  const handleReportBug = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await api.post(`/projects/${reportFormData.projectId}/bugs`, reportFormData);
      setShowReportModal(false);
      setSuccessMsg('Defect reported successfully!');
      setActiveTab('REPORTED');
      fetchMyBugs('REPORTED');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to submit bug report');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim() || !selectedBug) return;
    try {
      await api.post(`/bugs/${selectedBug.bugId}/comments`, { content: commentContent.trim() });
      setCommentContent('');
      handleOpenDetail(selectedBug);
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

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', margin: '0 0 0.35rem 0' }}>
            Bug Workspace &amp; QA Retest Hub
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Resolve defects assigned to you and execute QA retest verification cycles.
          </p>
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

      {/* Role Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #d4d4d4', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('ASSIGNED')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderBottom: activeTab === 'ASSIGNED' ? '3px solid #2b2b2b' : '3px solid transparent',
            color: activeTab === 'ASSIGNED' ? '#2b2b2b' : '#666666'
          }}
        >
          Assigned to Me ({activeTab === 'ASSIGNED' ? bugs.length : '—'})
        </button>

        <button
          onClick={() => setActiveTab('REPORTED')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'transparent',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            borderBottom: activeTab === 'REPORTED' ? '3px solid #2b2b2b' : '3px solid transparent',
            color: activeTab === 'REPORTED' ? '#2b2b2b' : '#666666'
          }}
        >
          Reported by Me / QA Log ({activeTab === 'REPORTED' ? bugs.length : '—'})
        </button>
      </div>

      {/* Bugs List */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#666666' }}>
          Loading your defect queue...
        </div>
      ) : bugs.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <CheckCircle2 size={38} color="#0ca678" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
            Queue Clean — Zero Pending Defects
          </h3>
          <p style={{ color: '#666666', fontSize: '0.88rem' }}>
            {activeTab === 'ASSIGNED'
              ? 'You have no assigned bugs awaiting resolution.'
              : 'You have not reported any open defects.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bugs.map((b) => {
            const sBadge = getSeverityBadge(b.severity);
            const stBadge = getStatusBadge(b.status);

            return (
              <div
                key={b.bugId}
                className="card"
                style={{
                  padding: '1.25rem',
                  borderLeft: b.severity === 'CRITICAL' ? '4px solid #c92a2a' : '4px solid #2b2b2b'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.45rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px' }}>
                        {b.bugCode}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#666666', fontWeight: 600 }}>
                        {b.projectName}
                      </span>
                      <span style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '3px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: sBadge.bg,
                        color: sBadge.color
                      }}>
                        {sBadge.label}
                      </span>
                      <span style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '3px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        backgroundColor: stBadge.bg,
                        color: stBadge.color
                      }}>
                        {stBadge.label}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.35rem 0' }}>
                      {b.title}
                    </h3>

                    {b.description && (
                      <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0, lineHeight: 1.4 }}>
                        {b.description}
                      </p>
                    )}
                  </div>

                  {/* Operational Action Triggers */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Developer: Start Working */}
                    {activeTab === 'ASSIGNED' && (b.status === 'ASSIGNED' || b.status === 'REOPENED') && (
                      <button
                        onClick={() => handleStartWorking(b.bugId)}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      >
                        <Play size={13} /> Start Working
                      </button>
                    )}

                    {/* Developer: Mark Resolved */}
                    {activeTab === 'ASSIGNED' && b.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleOpenResolve(b)}
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      >
                        <Check size={14} /> Mark Resolved
                      </button>
                    )}

                    {/* QA Tester: Retest Pass or Fail */}
                    {activeTab === 'REPORTED' && b.status === 'RESOLVED' && (
                      <>
                        <button
                          onClick={() => handleRetestPass(b.bugId)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            padding: '0.4rem 0.75rem',
                            backgroundColor: '#e6fcf5',
                            color: '#0ca678',
                            border: '1px solid #b2f2bb',
                            borderRadius: '4px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <CheckCircle2 size={14} /> Retest Pass (Close)
                        </button>
                        <button
                          onClick={() => handleOpenReopen(b)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.8rem',
                            padding: '0.4rem 0.75rem',
                            backgroundColor: '#fff5f5',
                            color: '#c92a2a',
                            border: '1px solid #ffc9c9',
                            borderRadius: '4px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <RotateCcw size={14} /> Retest Fail (Reopen)
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleOpenDetail(b)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d4d4d4',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: '#2b2b2b',
                        cursor: 'pointer'
                      }}
                    >
                      Details &amp; Audit
                    </button>
                  </div>
                </div>

                {/* Metadata Strip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem', color: '#666666', borderTop: '1px solid #f0f0f0', paddingTop: '0.65rem' }}>
                  <div>Reported By: <strong>{b.reportedByName}</strong></div>
                  <div>Assigned To: <strong>{b.assignedToName || 'Unassigned'}</strong></div>
                  {b.environment && <div>Env: <strong>{b.environment}</strong></div>}
                  {b.resolutionNotes && (
                    <div style={{ color: '#1c7ed6' }}>Fix Notes Available</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: REPORT NEW DEFECT */}
      {showReportModal && createPortal(
        <div
          onClick={() => setShowReportModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            className="card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '640px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              padding: '2.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
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
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }}>
                  QA &amp; Defect Tracking
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.02em' }}>
                  Report Software Defect
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#666666', margin: '0.35rem 0 0 0' }}>
                  Submit reproducible issue details, system environment, and expected outcomes for triage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666666',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#1e1e1e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#666666'; }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReportBug} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Target Project *
                </label>
                <select
                  value={reportFormData.projectId}
                  onChange={(e) => setReportFormData({ ...reportFormData, projectId: e.target.value })}
                  className="input-field"
                >
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectCode} — {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Defect Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Session token expiration throws unhandled 500 internal server error"
                  value={reportFormData.title}
                  onChange={(e) => setReportFormData({ ...reportFormData, title: e.target.value })}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Severity
                  </label>
                  <select
                    value={reportFormData.severity}
                    onChange={(e) => setReportFormData({ ...reportFormData, severity: e.target.value })}
                    className="input-field"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Priority
                  </label>
                  <select
                    value={reportFormData.priority}
                    onChange={(e) => setReportFormData({ ...reportFormData, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Environment (Browser / Device / OS)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chrome 122 on Windows 11 / Node 20"
                  value={reportFormData.environment}
                  onChange={(e) => setReportFormData({ ...reportFormData, environment: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Steps to Reproduce
                </label>
                <textarea
                  rows="3"
                  placeholder="1. Navigate to /login&#10;2. Input expired credentials&#10;3. Click submit"
                  value={reportFormData.stepsToReproduce}
                  onChange={(e) => setReportFormData({ ...reportFormData, stepsToReproduce: e.target.value })}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Expected Outcome
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Clear error toast shown..."
                    value={reportFormData.expectedBehavior}
                    onChange={(e) => setReportFormData({ ...reportFormData, expectedBehavior: e.target.value })}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Actual Outcome
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Page crashes with unhandled exception..."
                    value={reportFormData.actualBehavior}
                    onChange={(e) => setReportFormData({ ...reportFormData, actualBehavior: e.target.value })}
                    className="input-field"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.75rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #f0f0f0'
              }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Submit Bug Report
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: MARK RESOLVED (Developer) */}
      {showResolveModal && selectedBug && createPortal(
        <div
          onClick={() => setShowResolveModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            className="card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '540px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              padding: '2.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.35rem 0' }}>
                  Resolve Defect: {selectedBug.bugCode}
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#666666', margin: 0 }}>
                  Describe the applied code fix, commit/PR details, and verification steps for QA retesting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666666'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitResolve} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Resolution Notes *
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="e.g. Configured JwtAuthenticationEntryPoint to catch expired claims and return 401 Unauthorized."
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #f0f0f0'
              }}>
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Mark as Resolved
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: RETEST FAIL & REOPEN (QA) */}
      {showReopenModal && selectedBug && createPortal(
        <div
          onClick={() => setShowReopenModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            className="card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '540px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              padding: '2.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c92a2a', margin: '0 0 0.35rem 0' }}>
                  Retest Failed: Reopen Defect {selectedBug.bugCode}
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#666666', margin: 0 }}>
                  Provide exact failure details and screenshots/logs so the developer can address regressions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666666'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitReopen} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Retest Failure Details *
                </label>
                <textarea
                  required
                  rows="4"
                  placeholder="e.g. Verified on staging build v1.0.2: Token refresh still fails when header has malformed bearer prefix."
                  value={reopenNotes}
                  onChange={(e) => setReopenNotes(e.target.value)}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #f0f0f0'
              }}>
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.2rem',
                    backgroundColor: '#c92a2a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Reopen
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* DETAIL MODAL WITH DISCUSSION */}
      {showDetailModal && activeBugDetail && createPortal(
        <div
          onClick={() => setShowDetailModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            className="card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '680px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              padding: '2.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #ececec', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.5rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px' }}>
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
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                  {activeBugDetail.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666666'
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {activeBugDetail.stepsToReproduce && (
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>Steps to Reproduce</h4>
                  <pre style={{ fontSize: '0.84rem', color: '#2b2b2b', margin: 0, padding: '0.75rem 1rem', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #f0f0f0', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {activeBugDetail.stepsToReproduce}
                  </pre>
                </div>
              )}

              {activeBugDetail.resolutionNotes && (
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1c7ed6', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>Developer Fix Notes</h4>
                  <p style={{ fontSize: '0.84rem', color: '#2b2b2b', margin: 0, padding: '0.75rem 1rem', backgroundColor: '#f0f8ff', borderRadius: '6px', border: '1px solid #d0ebff', lineHeight: 1.5 }}>
                    {activeBugDetail.resolutionNotes}
                  </p>
                </div>
              )}

              {activeBugDetail.retestNotes && (
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', textTransform: 'uppercase', margin: '0 0 0.35rem 0' }}>Retest Audit Log</h4>
                  <p style={{ fontSize: '0.84rem', color: '#2b2b2b', margin: 0, padding: '0.75rem 1rem', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e0e0e0', lineHeight: 1.5 }}>
                    {activeBugDetail.retestNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Discussion Thread */}
            <div style={{ borderTop: '1px solid #ececec', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e1e1e', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <MessageSquare size={16} /> Discussion ({activeBugDetail.comments?.length || 0})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.15rem', maxHeight: '180px', overflowY: 'auto' }}>
                {activeBugDetail.comments?.map((c) => (
                  <div key={c.commentId} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e8e8e8', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <strong style={{ color: '#1e1e1e' }}>{c.authorName}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#8c8c8c' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style={{ margin: 0, color: '#444444', lineHeight: 1.4 }}>{c.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.65rem' }}>
                <input
                  type="text"
                  placeholder="Post reply to this defect..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="input-field"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  <Send size={14} />
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

export default MemberBugsPage;
