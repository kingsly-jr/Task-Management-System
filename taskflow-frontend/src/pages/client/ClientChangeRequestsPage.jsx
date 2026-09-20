import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  GitPullRequest,
  Plus,
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
  ShieldAlert,
  ArrowRight,
  FileText
} from 'lucide-react';

const ClientChangeRequestsPage = () => {
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

  // Submit modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reasonForChange: '',
    estimatedCost: 0,
    scheduleImpactDays: 0,
    priority: 'MEDIUM'
  });
  const [submitting, setSubmitting] = useState(false);

  // Detail & Discussion drawer state
  const [selectedCrId, setSelectedCrId] = useState(null);
  const [activeCrDetail, setActiveCrDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
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
    try {
      const res = await api.get(`/change-requests/${id}`);
      setActiveCrDetail(res.data);
    } catch (err) {
      setError('Failed to load change request details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedCrId(null);
    setActiveCrDetail(null);
    setCommentText('');
  };

  const handleSubmitCr = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post(`/projects/${selectedProjectId}/change-requests`, {
        ...formData,
        estimatedCost: parseFloat(formData.estimatedCost) || 0,
        scheduleImpactDays: parseInt(formData.scheduleImpactDays, 10) || 0
      });
      setSuccessMsg('Change request submitted successfully to Project Manager for evaluation!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsSubmitModalOpen(false);
      setFormData({
        title: '',
        description: '',
        reasonForChange: '',
        estimatedCost: 0,
        scheduleImpactDays: 0,
        priority: 'MEDIUM'
      });
      fetchChangeRequests();
      fetchStats(selectedProjectId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit change request');
    } finally {
      setSubmitting(false);
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
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
            Change Requests &amp; Scope Governance
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Submit formal scope adjustments, track budget and schedule impact evaluations, and negotiate deliverables with your Project Manager.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {projects.length > 1 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="form-control"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.88rem', fontWeight: 600, minWidth: '200px' }}
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode} — {p.projectName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.15rem' }}
          >
            <Plus size={16} /> Submit Change Request
          </button>
        </div>
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.15rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Total Requests
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.total}</div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>All submitted CRs</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            In Review
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.underReview + stats.submitted}</div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Awaiting PM assessment</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Approved
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0ca678' }}>{stats.approved + stats.implemented}</div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Authorized scope changes</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Approved Cost Impact
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>
            ${parseFloat(stats.totalApprovedCost || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Budget delta added</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Schedule Impact
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>
            +{stats.totalScheduleImpactDays}d
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Target timeline extended</div>
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
              No Change Requests Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
              {statusFilter !== 'ALL' ? `No change requests match status "${statusFilter}"` : 'Your project scope is aligned with baseline contract deliverables.'}
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
                    gap: '0.85rem',
                    transition: 'border-color 0.15s ease'
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
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <MessageSquare size={14} /> Review &amp; Thread ({cr.commentsCount || 0})
                      </button>
                    </div>
                  </div>

                  {/* Description & Justification */}
                  {cr.description && (
                    <p style={{ fontSize: '0.88rem', color: '#4d4d4d', lineHeight: 1.5, margin: 0 }}>
                      {cr.description}
                    </p>
                  )}

                  {/* Impact metrics & details metadata */}
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
                      Requested by: <strong style={{ color: '#2b2b2b' }}>{cr.requestedByName}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto' }}>
                      <Calendar size={13} /> {new Date(cr.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Review Notes banner if resolved */}
                  {cr.reviewNotes && (
                    <div style={{
                      backgroundColor: cr.status === 'APPROVED' ? '#f4fbf7' : '#fafafa',
                      borderLeft: `3px solid ${cr.status === 'APPROVED' ? '#0ca678' : '#8c8c8c'}`,
                      padding: '0.75rem 1rem',
                      borderRadius: '0 4px 4px 0',
                      fontSize: '0.82rem'
                    }}>
                      <div style={{ fontWeight: 700, color: '#2b2b2b', marginBottom: '0.2rem' }}>
                        Project Manager Assessment ({cr.reviewedByName}):
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

      {/* Submit Change Request Modal */}
      {isSubmitModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card animate-scale-up" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #d4d4d4', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitPullRequest size={20} color="#2b2b2b" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                  Submit Scope Change Request
                </h2>
              </div>
              <button onClick={() => setIsSubmitModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCr} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Change Request Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add Multi-Currency Support to Checkout"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Scope Description &amp; Detailed Deliverables *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the requested feature, architecture change, or scope modification in full detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Business Justification / Reason for Change
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this change is needed now, expected ROI, or regulatory reason..."
                  value={formData.reasonForChange}
                  onChange={(e) => setFormData({ ...formData, reasonForChange: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Estimated Budget Impact ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Schedule Impact (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.scheduleImpactDays}
                    onChange={(e) => setFormData({ ...formData, scheduleImpactDays: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="form-control"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #d4d4d4', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting...' : 'Submit to Project Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discussion & Detail Drawer */}
      {selectedCrId && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '560px',
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
                {activeCrDetail?.changeRequestCode || 'CR DETAIL'}
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                {activeCrDetail?.title || 'Scope Change Request'}
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
                {/* Status & Priority Badge Strip */}
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
                    Submitted {new Date(activeCrDetail.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Scope Description */}
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#666666', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                    Proposed Scope
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
                    Scope Impact Breakdown
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#666666' }}>Estimated Cost</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b' }}>
                        ${parseFloat(activeCrDetail.estimatedCost || 0).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#666666' }}>Timeline Impact</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b' }}>
                        +{activeCrDetail.scheduleImpactDays || 0} days
                      </div>
                    </div>
                  </div>
                </div>

                {/* PM Evaluation & Decision */}
                {activeCrDetail.reviewedByName && (
                  <div style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    backgroundColor: activeCrDetail.status === 'APPROVED' ? '#f4fbf7' : '#fafafa',
                    border: `1px solid ${activeCrDetail.status === 'APPROVED' ? '#b2f2bb' : '#d4d4d4'}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      {activeCrDetail.status === 'APPROVED' ? (
                        <CheckCircle2 size={16} color="#0ca678" />
                      ) : (
                        <XCircle size={16} color="#8c8c8c" />
                      )}
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2b2b2b' }}>
                        Reviewed by {activeCrDetail.reviewedByName} on {new Date(activeCrDetail.reviewedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#4d4d4d', margin: 0, fontStyle: 'italic' }}>
                      "{activeCrDetail.reviewNotes}"
                    </p>
                  </div>
                )}

                {/* Negotiation & Discussion Thread */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MessageSquare size={16} /> Discussion Thread ({activeCrDetail.comments?.length || 0})
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {(!activeCrDetail.comments || activeCrDetail.comments.length === 0) ? (
                      <div style={{ fontSize: '0.82rem', color: '#8c8c8c', fontStyle: 'italic', padding: '0.5rem 0' }}>
                        No discussion messages yet. Use the message box below to ask questions or negotiate terms.
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
                      placeholder="Write comment or clarification..."
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

export default ClientChangeRequestsPage;
