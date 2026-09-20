import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Flag,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  ListTodo
} from 'lucide-react';

const ManagerMilestonesPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0, pending: 0, delayed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [expandedMilestones, setExpandedMilestones] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    orderIndex: 1,
    status: 'PENDING',
    actualCompletionDate: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchMilestones(selectedProjectId);
      fetchMilestoneStats(selectedProjectId);
      fetchProjectTasks(selectedProjectId);
    }
  }, [selectedProjectId]);

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

  const fetchMilestones = async (projId) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/projects/${projId}/milestones`);
      setMilestones(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const fetchMilestoneStats = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/milestones/stats`);
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  };

  const fetchProjectTasks = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/tasks`);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to fetch project tasks', err);
    }
  };

  const currentProject = projects.find((p) => p.projectId === selectedProjectId);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      description: '',
      targetDate: '',
      orderIndex: (milestones.length + 1),
      status: 'PENDING',
      actualCompletionDate: ''
    });
    setShowCreateModal(true);
  };

  const handleOpenEdit = (m) => {
    setActiveMilestone(m);
    setFormData({
      title: m.title || '',
      description: m.description || '',
      targetDate: m.targetDate || '',
      orderIndex: m.orderIndex || 1,
      status: m.status || 'PENDING',
      actualCompletionDate: m.actualCompletionDate || ''
    });
    setShowEditModal(true);
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        targetDate: formData.targetDate,
        orderIndex: parseInt(formData.orderIndex, 10) || 1,
        status: formData.status
      };
      await api.post(`/projects/${selectedProjectId}/milestones`, payload);
      setShowCreateModal(false);
      setSuccessMsg('Milestone created successfully!');
      fetchMilestones(selectedProjectId);
      fetchMilestoneStats(selectedProjectId);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to create milestone');
    }
  };

  const handleUpdateMilestone = async (e) => {
    e.preventDefault();
    if (!activeMilestone) return;
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        targetDate: formData.targetDate,
        orderIndex: parseInt(formData.orderIndex, 10) || 1,
        status: formData.status,
        actualCompletionDate: formData.actualCompletionDate || null
      };
      await api.put(`/milestones/${activeMilestone.milestoneId}`, payload);
      setShowEditModal(false);
      setSuccessMsg('Milestone updated successfully!');
      fetchMilestones(selectedProjectId);
      fetchMilestoneStats(selectedProjectId);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Are you sure you want to delete this milestone? Linked tasks will be unlinked.')) {
      return;
    }
    try {
      await api.delete(`/milestones/${milestoneId}`);
      setSuccessMsg('Milestone deleted successfully!');
      fetchMilestones(selectedProjectId);
      fetchMilestoneStats(selectedProjectId);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to delete milestone');
    }
  };

  const toggleExpand = (id) => {
    setExpandedMilestones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#e6fcf5', color: '#0ca678', label: 'COMPLETED' };
      case 'IN_PROGRESS':
        return { bg: '#2b2b2b', color: '#ffffff', label: 'IN PROGRESS' };
      case 'DELAYED':
        return { bg: '#ffe3e3', color: '#c92a2a', label: 'DELAYED' };
      default:
        return { bg: '#f1f1f1', color: '#666666', label: 'PENDING' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', margin: '0 0 0.35rem 0' }}>
            Milestones &amp; Sprint Deliverables
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Establish client deliverables, set target deadlines, and monitor real-time completion progress.
          </p>
        </div>

        {/* Project Selector & Create Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
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

          <button
            onClick={handleOpenCreate}
            disabled={!selectedProjectId}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> New Milestone
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

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>Total Milestones</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.total}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>In Progress</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.inProgress}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0ca678', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>Completed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0ca678' }}>{stats.completed}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c92a2a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>Delayed / Overdue</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c92a2a' }}>{stats.delayed}</div>
        </div>
      </div>

      {/* Milestone List */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#666666' }}>
          Loading milestones...
        </div>
      ) : milestones.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <Flag size={38} color="#b3b3b3" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
            No Milestones Configured Yet
          </h3>
          <p style={{ color: '#666666', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
            Break down <strong>{currentProject?.projectName}</strong> into deliverables, sprints, and key client demo phases.
          </p>
          <button onClick={handleOpenCreate} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} /> Create First Milestone
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {milestones.map((m) => {
            const badge = getStatusBadge(m.status);
            const isExpanded = !!expandedMilestones[m.milestoneId];
            const linkedTasks = tasks.filter((t) => t.milestoneId === m.milestoneId);

            return (
              <div
                key={m.milestoneId}
                className="card"
                style={{
                  padding: '1.5rem',
                  borderLeft: m.status === 'COMPLETED' ? '5px solid #0ca678' : m.status === 'DELAYED' ? '5px solid #c92a2a' : '5px solid #2b2b2b',
                  transition: 'box-shadow 0.15s ease'
                }}
              >
                {/* Milestone Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      backgroundColor: '#2b2b2b',
                      color: '#ffffff',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}>
                      M{m.orderIndex}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                          {m.title}
                        </h3>
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
                      {m.description && (
                        <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0, lineHeight: 1.4 }}>
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleOpenEdit(m)}
                      title="Edit Milestone"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.35rem 0.65rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #d4d4d4',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#2b2b2b',
                        cursor: 'pointer'
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(m.milestoneId)}
                      title="Delete Milestone"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.35rem 0.65rem',
                        backgroundColor: '#fff5f5',
                        border: '1px solid #ffc9c9',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#c92a2a',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>

                {/* Progress Rollup & Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', backgroundColor: '#fafafa', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #f0f0f0' }}>
                  {/* Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 700, color: '#2b2b2b' }}>Task Completion Progress</span>
                      <span style={{ fontWeight: 800, color: '#2b2b2b' }}>{m.progressPercentage}%</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#e5e5e5', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${m.progressPercentage}%`,
                          backgroundColor: m.progressPercentage === 100 ? '#0ca678' : '#2b2b2b',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.35rem' }}>
                      <strong>{m.completedTasks}</strong> of <strong>{m.totalTasks}</strong> linked tasks completed
                    </div>
                  </div>

                  {/* Dates */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666666' }}>
                      <Calendar size={14} color="#2b2b2b" />
                      <span>Target Date: <strong>{m.targetDate || 'Not specified'}</strong></span>
                    </div>
                    {m.actualCompletionDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0ca678' }}>
                        <CheckCircle2 size={14} color="#0ca678" />
                        <span>Completed On: <strong>{m.actualCompletionDate}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Linked Tasks Accordion */}
                <div>
                  <button
                    onClick={() => toggleExpand(m.milestoneId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#2b2b2b',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      cursor: 'pointer'
                    }}
                  >
                    {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    {isExpanded ? 'Hide' : 'View'} Linked Tasks ({linkedTasks.length})
                  </button>

                  {isExpanded && (
                    <div style={{ marginTop: '0.75rem', borderTop: '1px solid #ececec', paddingTop: '0.75rem' }}>
                      {linkedTasks.length === 0 ? (
                        <div style={{ fontSize: '0.8rem', color: '#8c8c8c', padding: '0.5rem 0' }}>
                          No tasks currently linked to this milestone. Assign this milestone when creating or editing tasks.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {linkedTasks.map((t) => (
                            <div
                              key={t.taskId}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.6rem 0.85rem',
                                backgroundColor: '#fcfcfc',
                                border: '1px solid #e8e8e8',
                                borderRadius: '4px',
                                fontSize: '0.82rem'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.72rem', backgroundColor: '#f0f0f0', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                                  {t.taskCode}
                                </span>
                                <span style={{ fontWeight: 600, color: '#2b2b2b' }}>{t.title}</span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: '3px',
                                  backgroundColor: t.status === 'COMPLETED' ? '#e6fcf5' : '#f1f1f1',
                                  color: t.status === 'COMPLETED' ? '#0ca678' : '#666666'
                                }}>
                                  {t.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE MILESTONE */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '520px', width: '100%', padding: '1.5rem', border: '1px solid #d4d4d4' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.35rem 0' }}>
              Create Deliverable Milestone
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: '0 0 1.25rem 0' }}>
              Project: <strong>{currentProject?.projectName}</strong> ({currentProject?.projectCode})
            </p>

            <form onSubmit={handleCreateMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 1: Core Architecture & Identity Verification"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Description &amp; Acceptance Scope
                </label>
                <textarea
                  rows="3"
                  placeholder="Summarize key features, deliverables, and acceptance criteria for this milestone..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Order Sequence
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MILESTONE */}
      {showEditModal && activeMilestone && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '520px', width: '100%', padding: '1.5rem', border: '1px solid #d4d4d4' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.35rem 0' }}>
              Edit Milestone
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: '0 0 1.25rem 0' }}>
              Updating sequence and delivery status for: <strong>{activeMilestone.title}</strong>
            </p>

            <form onSubmit={handleUpdateMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Milestone Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Order Sequence
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.orderIndex}
                    onChange={(e) => setFormData({ ...formData, orderIndex: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Actual Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.actualCompletionDate}
                    onChange={(e) => setFormData({ ...formData, actualCompletionDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerMilestonesPage;
