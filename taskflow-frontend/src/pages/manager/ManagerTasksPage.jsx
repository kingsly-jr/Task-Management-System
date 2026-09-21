import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import TaskDetailModal from '../../components/TaskDetailModal';
import {
  CheckSquare2,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckSquare,
  Users,
  Building2,
  FolderKanban,
  ArrowRight
} from 'lucide-react';

const ManagerTasksPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [error, setError] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Form State
  const [projectMembers, setProjectMembers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    milestoneId: '',
    estimatedHours: '',
    startDate: '',
    dueDate: '',
    assigneeIds: [],
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
      fetchProjectMembers(selectedProjectId);
      fetchProjectMilestones(selectedProjectId);
    }
  }, [selectedProjectId, search, statusFilter, priorityFilter]);

  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal]);

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

  const fetchTasks = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      const res = await api.get(`/projects/${selectedProjectId}/tasks`, { params });
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setProjectMembers(res.data || []);
    } catch (err) {
      console.error('Failed to load project members', err);
    }
  };

  const fetchProjectMilestones = async (projectId) => {
    try {
      const res = await api.get(`/projects/${projectId}/milestones`);
      setMilestones(res.data || []);
    } catch (err) {
      console.error('Failed to load project milestones', err);
    }
  };

  const handleOpenAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      milestoneId: '',
      estimatedHours: '8',
      startDate: today,
      dueDate: nextWeek,
      assigneeIds: [],
    });
    setShowAddModal(true);
  };

  const handleToggleAssignee = (userId) => {
    setFormData((prev) => {
      const exists = prev.assigneeIds.includes(userId);
      return {
        ...prev,
        assigneeIds: exists
          ? prev.assigneeIds.filter((id) => id !== userId)
          : [...prev.assigneeIds, userId],
      };
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) return;
    setError('');
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        priority: formData.priority,
        milestoneId: formData.milestoneId || null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
        assigneeIds: formData.assigneeIds,
      };
      await api.post(`/projects/${selectedProjectId}/tasks`, payload);
      setShowAddModal(false);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    }
  };

  const currentProject = projects.find((p) => p.projectId === selectedProjectId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2b2b2b', letterSpacing: '-0.02em', margin: 0 }}>
            Task Management & Sprint Execution
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666666' }}>
            Plan deliverables, allocate developers, track checklists, and regulate sprint timelines.
          </p>
        </div>

        {selectedProjectId && (
          <button
            onClick={handleOpenAddModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.65rem 1.1rem',
              backgroundColor: '#2b2b2b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {/* Project Selector Bar */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FolderKanban size={20} color="#2b2b2b" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2b2b2b' }}>Select Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ padding: '0.45rem 0.85rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b', minWidth: '240px' }}
          >
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName} ({p.projectCode})
              </option>
            ))}
          </select>
        </div>

        {currentProject && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: '#666666' }}>
            <span>Client: <strong>{currentProject.clientCompanyName}</strong></span>
            <span>Allocated Team: <strong>{projectMembers.length} members</strong></span>
            <span>Progress: <strong>{currentProject.progress || 0}%</strong></span>
          </div>
        )}
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fbfbfb', border: '1px solid #d4d4d4', borderRadius: '6px', padding: '0.45rem 0.75rem', minWidth: '260px', flex: 1 }}>
          <Search size={16} color="#8c8c8c" />
          <input
            type="text"
            placeholder="Search tasks by code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: '#2b2b2b' }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.4rem 0.7rem',
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

      {/* Tasks Table */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
            Loading sprint tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <CheckSquare2 size={36} color="#b3b3b3" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', margin: '0 0 0.25rem 0' }}>No Tasks Found</h3>
            <p style={{ fontSize: '0.82rem', color: '#8c8c8c', margin: '0 0 1rem 0' }}>
              {search ? 'Try adjusting your search criteria.' : 'Create tasks and allocate them to project team members.'}
            </p>
            {!search && (
              <button
                onClick={handleOpenAddModal}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2b2b2b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Create Task
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid #d4d4d4', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Task & Code</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Assignees</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Priority</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Checklist</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Due Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr
                    key={t.taskId}
                    style={{ borderBottom: '1px solid #ececec', cursor: 'pointer', transition: 'background-color 0.1s' }}
                    onClick={() => setActiveTaskId(t.taskId)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.45rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', letterSpacing: '0.03em' }}>
                          {t.taskCode}
                        </span>
                        {t.milestoneTitle && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.12rem 0.45rem', backgroundColor: '#e9ecef', color: '#495057', borderRadius: '3px' }}>
                            {t.milestoneTitle}
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 700, color: '#2b2b2b' }}>{t.title}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {t.assignees && t.assignees.length === 0 ? (
                          <span style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>Unassigned</span>
                        ) : (
                          t.assignees?.map((a) => (
                            <div
                              key={a.userId}
                              title={`${a.fullName} (${a.roleCategoryName})`}
                              style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#2b2b2b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.72rem' }}
                            >
                              {a.fullName.charAt(0)}
                            </div>
                          ))
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: t.priority === 'URGENT' ? '#ffe3e3' : t.priority === 'HIGH' ? '#fff3bf' : '#f1f1f1',
                          color: t.priority === 'URGENT' ? '#c92a2a' : t.priority === 'HIGH' ? '#d9480f' : '#495057',
                        }}
                      >
                        {t.priority}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#666666' }}>
                      {t.subtasksCount > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckSquare size={13} color="#2b8a3e" />
                          <strong>{t.completedSubtasksCount}</strong> / {t.subtasksCount}
                        </span>
                      ) : (
                        <span style={{ color: '#8c8c8c' }}>—</span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', color: '#666666', fontSize: '0.8rem' }}>
                      {t.dueDate || 'No date'}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: t.status === 'COMPLETED' ? '#e6fcf5' : t.status === 'IN_PROGRESS' ? '#2b2b2b' : '#f1f1f1',
                          color: t.status === 'COMPLETED' ? '#0ca678' : t.status === 'IN_PROGRESS' ? '#ffffff' : '#666666',
                        }}
                      >
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2b2b2b', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        Details <ArrowRight size={13} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: CREATE TASK */}
      {showAddModal && createPortal(
        <div
          onClick={() => setShowAddModal(false)}
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
              maxWidth: '580px',
              width: '100%',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.4rem 0' }}>
              Create Sprint Task
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: '0 0 1.25rem 0' }}>
              Project: <strong>{currentProject?.projectName}</strong> ({currentProject?.projectCode})
            </p>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement User Authentication and Refresh Tokens"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="8.0"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Deliverable Milestone (Optional)
                </label>
                <select
                  value={formData.milestoneId}
                  onChange={(e) => setFormData({ ...formData, milestoneId: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="">-- None / Standalone Sprint Task --</option>
                  {milestones.map((m) => (
                    <option key={m.milestoneId} value={m.milestoneId}>
                      M{m.orderIndex}: {m.title} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignees checkboxes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Assign Project Team Members
                </label>
                {projectMembers.length === 0 ? (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fcfcfc', border: '1px dashed #d4d4d4', borderRadius: '6px', fontSize: '0.8rem', color: '#8c8c8c' }}>
                    No team members are currently allocated to this project. You can allocate members in Project Details &gt; Team Allocation.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '140px', overflowY: 'auto', border: '1px solid #e0e0e0', padding: '0.5rem', borderRadius: '6px' }}>
                    {projectMembers.map((m) => {
                      const isChecked = formData.assigneeIds.includes(m.userId);
                      return (
                        <label key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#2b2b2b', cursor: 'pointer', padding: '0.2rem 0' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleAssignee(m.userId)}
                            style={{ accentColor: '#2b2b2b' }}
                          />
                          <span>
                            <strong>{m.fullName}</strong> — <span style={{ color: '#666666' }}>{m.roleCategoryName}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Description / Acceptance Criteria</label>
                <textarea
                  rows="3"
                  placeholder="Outline requirements, expected outcome, API specifications..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.55rem 1rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', color: '#666666', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.55rem 1.25rem', backgroundColor: '#2b2b2b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Task Details Drawer Modal */}
      {activeTaskId && (
        <TaskDetailModal
          taskId={activeTaskId}
          onClose={() => setActiveTaskId(null)}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
};

export default ManagerTasksPage;
