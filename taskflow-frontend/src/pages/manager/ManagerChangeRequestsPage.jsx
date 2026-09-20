import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  GitPullRequest,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Send,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
  Ban,
  FileText
} from 'lucide-react';

const ManagerChangeRequestsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [changeRequests, setChangeRequests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0,
    implemented: 0,
    totalApprovedCost: 0,
    totalScheduleImpactDays: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review Drawer state
  const [selectedCrId, setSelectedCrId] = useState(null);
  const [activeCrDetail, setActiveCrDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Comment thread state
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchChangeRequests();
      fetchStats(selectedProjectId);
    }
  }, [selectedProjectId, statusFilter, search]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setProjects(list);
      if (list.length > 0) {
        setSelectedProjectId(list[0].projectId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      setLoading(false);
    }
  };

  const fetchChangeRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get(`/projects/${selectedProjectId}/change-requests`, { params });
      setChangeRequests(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load change requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/change-requests/stats`);
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const openDetail = async (id) => {
    setSelectedCrId(id);
    setDetailLoading(true);
    setReviewNotes('');
    try {
      const res = await api.get(`/change-requests/${id}`);
      setActiveCrDetail(res.data);
      if (res.data.reviewNotes) {
        setReviewNotes(res.data.reviewNotes);
      }
    } catch (err) {
      setError('Failed to load change request details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedCrId(null);
    setActiveCrDetail(null);
    setReviewNotes('');
    setCommentText('');
  };

  const handleReviewDecision = async (approved) => {
    if (!reviewNotes.trim()) {
      setError('Please provide review notes or justification before confirming your decision.');
      return;
    }
    setReviewSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/change-requests/${selectedCrId}/review`, {
        approved,
        reviewNotes: reviewNotes.trim()
      });
      setSuccessMsg(`Change request successfully marked as ${approved ? 'APPROVED' : 'REJECTED'}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setActiveCrDetail((prev) => ({
        ...prev,
        status: res.data.status,
        reviewNotes: res.data.reviewNotes,
        reviewedByName: res.data.reviewedByName,
        reviewedAt: res.data.reviewedAt
      }));
      fetchChangeRequests();
      fetchStats(selectedProjectId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit review decision');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setReviewSubmitting(true);
    setError('');
    try {
      const res = await api.patch(`/change-requests/${selectedCrId}/status`, { status: newStatus });
      setSuccessMsg(`Status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setActiveCrDetail((prev) => ({ ...prev, status: res.data.status }));
      fetchChangeRequests();
      fetchStats(selectedProjectId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedCrId) return;
    setCommentSubmitting(true);
    try {
      const res = await api.post(`/change-requests/${selectedCrId}/comments`, { content: commentText.trim() });
      if (res.data) {
        setActiveCrDetail((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data],
          commentsCount: (prev.commentsCount || 0) + 1
        }));
        setCommentText('');
      }
    } catch (err) {
      setError('Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return { bg: '#2b2b2b', color: '#ffffff', border: '#2b2b2b', label: 'APPROVED' };
      case 'REJECTED':
        return { bg: '#f4f4f4', color: '#8c8c8c', border: '#d4d4d4', label: 'REJECTED' };
      case 'IMPLEMENTED':
        return { bg: '#0ca678', color: '#ffffff', border: '#0ca678', label: 'IMPLEMENTED' };
      case 'UNDER_REVIEW':
        return { bg: '#ffffff', color: '#2b2b2b', border: '#2b2b2b', label: 'UNDER REVIEW' };
      default:
        return { bg: '#f4f4f4', color: '#2b2b2b', border: '#d4d4d4', label: 'SUBMITTED' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
            Change Request Governance &amp; Scope Control
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Assess client-requested scope modifications, audit budget and delivery schedule impacts, and make official approval decisions.
          </p>
        </div>

        {projects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2b2b2b' }}>Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="form-control"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.88rem', fontWeight: 600, minWidth: '220px' }}
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode} — {p.projectName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', color: '#c92a2a', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#ebfbee', border: '1px solid #b2f2bb', color: '#2b8a3e', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          {successMsg}
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '1.15rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Pending Triage
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.submitted + stats.underReview}</div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Needs PM evaluation</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Approved
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0ca678' }}>{stats.approved}</div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Ready for execution</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Implemented
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.implemented}</div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Delivered to build</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Rejected
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8c8c8c' }}>{stats.rejected}</div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Out of scope / declined</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Approved Budget Delta
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>
            ${parseFloat(stats.totalApprovedCost || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Authorized scope fees</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Schedule Impact
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>
            +{stats.totalScheduleImpactDays}d
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Total timeline delta</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '1.15rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'IMPLEMENTED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={statusFilter === st ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', textTransform: 'capitalize' }}
            >
              {st === 'ALL' ? 'All Requests' : st.replace('_', ' ').toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c' }} />
          <input
            type="text"
            placeholder="Search CR code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Change Requests List */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.9rem' }}>
            Loading change requests...
          </div>
        ) : changeRequests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
            <GitPullRequest size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
              No Change Requests
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
              {statusFilter !== 'ALL' ? `No change requests in status "${statusFilter}"` : 'All project deliverables are progressing within baseline scope.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {changeRequests.map((cr) => {
              const badge = getStatusBadge(cr.status);
              return (
                <div
                  key={cr.changeRequestId}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    padding: '1.25rem',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.5rem', backgroundColor: '#2b2b2b', color: '#ffffff', borderRadius: '4px' }}>
                        {cr.changeRequestCode}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                        {cr.title}
                      </h3>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        border: `1px solid ${badge.border}`,
                        backgroundColor: badge.bg,
                        color: badge.color
                      }}>
                        {badge.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => openDetail(cr.changeRequestId)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <FileText size={14} /> Review &amp; Decide
                      </button>
                    </div>
                  </div>

                  {cr.description && (
                    <p style={{ fontSize: '0.88rem', color: '#4d4d4d', lineHeight: 1.5, margin: 0 }}>
                      {cr.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.78rem', color: '#666666', borderTop: '1px solid #ebebeb', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <DollarSign size={14} color="#2b2b2b" />
                      Cost Impact: <strong style={{ color: '#2b2b2b' }}>${parseFloat(cr.estimatedCost || 0).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} color="#2b2b2b" />
                      Schedule Impact: <strong style={{ color: '#2b2b2b' }}>+{cr.scheduleImpactDays || 0} days</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      Priority: <strong style={{ color: '#2b2b2b' }}>{cr.priority}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      Client Requester: <strong style={{ color: '#2b2b2b' }}>{cr.requestedByName}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto' }}>
                      <Calendar size={13} /> {new Date(cr.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {cr.reviewNotes && (
                    <div style={{
                      backgroundColor: cr.status === 'APPROVED' ? '#f4fbf7' : '#fafafa',
                      borderLeft: `3px solid ${cr.status === 'APPROVED' ? '#0ca678' : '#8c8c8c'}`,
                      padding: '0.75rem 1rem',
                      borderRadius: '0 4px 4px 0',
                      fontSize: '0.82rem'
                    }}>
                      <div style={{ fontWeight: 700, color: '#2b2b2b', marginBottom: '0.2rem' }}>
                        Your Decision Notes ({cr.reviewedByName}):
                      </div>
                      <div style={{ color: '#4d4d4d', fontStyle: 'italic' }}>
                        "{cr.reviewNotes}"
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Drawer & Decision Studio */}
      {selectedCrId && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '600px',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          zIndex: 110,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.2s ease-out'
        }}>
          {/* Drawer Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #d4d4d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#666666', letterSpacing: '0.04em' }}>
                {activeCrDetail?.changeRequestCode || 'CR ASSESSMENT'}
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                {activeCrDetail?.title || 'Review Change Request'}
              </h2>
            </div>
            <button onClick={closeDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {detailLoading ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>Loading details...</div>
            ) : activeCrDetail ? (
              <>
                {/* Status & Priority Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    ...getStatusBadge(activeCrDetail.status)
                  }}>
                    {activeCrDetail.status}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.6rem', backgroundColor: '#f4f4f4', color: '#2b2b2b', borderRadius: '4px' }}>
                    PRIORITY: {activeCrDetail.priority}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#666666', marginLeft: 'auto' }}>
                    Requested by {activeCrDetail.requestedByName}
                  </span>
                </div>

                {/* Scope Description */}
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#666666', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    Client Scope Description
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: '#2b2b2b', lineHeight: 1.6, margin: 0, backgroundColor: '#fafafa', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
                    {activeCrDetail.description}
                  </p>
                </div>

                {/* Justification */}
                {activeCrDetail.reasonForChange && (
                  <div>
                    <h4 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#666666', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                      Business Justification
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#4d4d4d', lineHeight: 1.5, margin: 0 }}>
                      {activeCrDetail.reasonForChange}
                    </p>
                  </div>
                )}

                {/* Impact Assessment Card */}
                <div className="card" style={{ padding: '1rem', backgroundColor: '#fafafa' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.5rem' }}>
                    Scope &amp; Contractual Impact
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#666666' }}>Requested Cost Impact</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b' }}>
                        ${parseFloat(activeCrDetail.estimatedCost || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#666666' }}>Schedule Impact</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b' }}>
                        +{activeCrDetail.scheduleImpactDays || 0} days
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decision Action Studio */}
                <div className="card" style={{ padding: '1.25rem', border: '1px solid #2b2b2b' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={16} /> PM Evaluation &amp; Formal Decision
                  </h4>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                      Review Notes &amp; Decision Rationale *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="State contractual adjustments, justification, or rejection reasons clearly for the client..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={reviewSubmitting}
                      onClick={() => handleReviewDecision(true)}
                      className="btn"
                      style={{
                        backgroundColor: '#2b2b2b',
                        color: '#ffffff',
                        fontSize: '0.82rem',
                        padding: '0.45rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Check size={15} /> Approve Scope Change
                    </button>

                    <button
                      type="button"
                      disabled={reviewSubmitting}
                      onClick={() => handleReviewDecision(false)}
                      className="btn btn-secondary"
                      style={{
                        fontSize: '0.82rem',
                        padding: '0.45rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <Ban size={15} /> Reject Request
                    </button>

                    {activeCrDetail.status === 'SUBMITTED' && (
                      <button
                        type="button"
                        disabled={reviewSubmitting}
                        onClick={() => handleStatusUpdate('UNDER_REVIEW')}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                      >
                        Mark Under Review
                      </button>
                    )}

                    {activeCrDetail.status === 'APPROVED' && (
                      <button
                        type="button"
                        disabled={reviewSubmitting}
                        onClick={() => handleStatusUpdate('IMPLEMENTED')}
                        className="btn"
                        style={{
                          backgroundColor: '#0ca678',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          padding: '0.45rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <CheckCircle2 size={15} /> Mark as Implemented
                      </button>
                    )}
                  </div>
                </div>

                {/* Negotiation & Discussion Thread */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={16} /> Negotiation &amp; Discussion Thread ({activeCrDetail.comments?.length || 0})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {(!activeCrDetail.comments || activeCrDetail.comments.length === 0) ? (
                      <div style={{ fontSize: '0.82rem', color: '#8c8c8c', fontStyle: 'italic', padding: '0.5rem 0' }}>
                        No comments posted yet. Add a message below to negotiate terms or clarify scope items with the client.
                      </div>
                    ) : (
                      activeCrDetail.comments.map((c) => (
                        <div key={c.commentId} style={{ padding: '0.75rem', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                            <span>{c.authorName}</span>
                            <span style={{ color: '#8c8c8c', fontWeight: 400 }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#4d4d4d', margin: 0, lineHeight: 1.4 }}>
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Reply to client or add negotiation note..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                    />
                    <button
                      type="submit"
                      disabled={commentSubmitting || !commentText.trim()}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.85rem' }}
                    >
                      <Send size={14} /> Send
                    </button>
                  </form>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerChangeRequestsPage;
