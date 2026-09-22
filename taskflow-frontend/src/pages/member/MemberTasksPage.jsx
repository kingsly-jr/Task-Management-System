import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import TaskDetailModal from '../../components/TaskDetailModal';
import {
  CheckSquare2,
  Search,
  Calendar,
  Clock,
  CheckSquare,
  Play,
  CheckCircle,
  Eye,
  AlertCircle,
  Paperclip,
  Globe
} from 'lucide-react';
import SubmitReviewModal from '../../components/SubmitReviewModal';

const MemberTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [reviewTask, setReviewTask] = useState(null);

  useEffect(() => {
    fetchMyTasks();
  }, [statusFilter]);

  const fetchMyTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get('/tasks/my-tasks', { params });
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatus = async (e, taskId, nextStatus) => {
    e.stopPropagation();
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: nextStatus });
      fetchMyTasks();
    } catch (err) {
      setError(err.message || 'Failed to update task status');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!search.trim()) return true;
    return (
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.taskCode.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const todoCount = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const inReviewCount = tasks.filter((t) => t.status === 'IN_REVIEW').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2b2b2b', letterSpacing: '-0.02em', margin: 0 }}>
          My Task Execution Workspace
        </h1>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666666' }}>
          Sprint deliverables assigned to you across company client projects. Update checklists, track hours, and submit reviews.
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>In Progress</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{inProgressCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Currently working</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>To Do / Backlog</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{todoCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Pending start</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Under Review</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{inReviewCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>QA / PM validation</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Completed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{completedCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Successfully shipped</div>
        </div>
      </div>

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
            placeholder="Search your tasks or projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: '#2b2b2b' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'IN_PROGRESS', 'TODO', 'IN_REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.4rem 0.75rem',
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
            Loading your tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <CheckSquare2 size={36} color="#b3b3b3" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', margin: '0 0 0.25rem 0' }}>No Tasks Assigned</h3>
            <p style={{ fontSize: '0.82rem', color: '#8c8c8c', margin: 0 }}>
              You currently have no tasks assigned in this filter status.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid #d4d4d4', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Task & Project</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Priority</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Checklist</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Due Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => (
                  <tr
                    key={t.taskId}
                    style={{ borderBottom: '1px solid #ececec', cursor: 'pointer', transition: 'background-color 0.1s' }}
                    onClick={() => setActiveTaskId(t.taskId)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.4rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px' }}>
                          {t.taskCode}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#8c8c8c' }}>{t.projectName}</span>
                      </div>
                      <div style={{ fontWeight: 700, color: '#2b2b2b' }}>{t.title}</div>
                      {(t.reviewUrl || t.reviewDocumentName) && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem', padding: '0.15rem 0.4rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>
                          <Paperclip size={10} /> Deliverables Attached
                          {t.reviewUrl && <Globe size={10} />}
                        </div>
                      )}
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
                      {t.status === 'IN_REVIEW' && t.approvalStatus === 'PENDING_APPROVAL' ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: '#fff9db',
                            color: '#d9480f',
                            border: '1px solid #ffe066'
                          }}
                        >
                          Awaiting Approval
                        </span>
                      ) : t.approvalStatus === 'REJECTED' ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: '#fff5f5',
                            color: '#e03131',
                            border: '1px solid #ffc9c9'
                          }}
                        >
                          Changes Requested
                        </span>
                      ) : (
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
                          {t.status === 'COMPLETED' && t.approvalStatus === 'APPROVED' ? 'Approved' : t.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {t.status === 'TODO' && (
                          <button
                            onClick={(e) => handleQuickStatus(e, t.taskId, 'IN_PROGRESS')}
                            style={{ padding: '0.35rem 0.65rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#2b2b2b' }}
                          >
                            <Play size={12} /> Start
                          </button>
                        )}

                        {t.status === 'IN_PROGRESS' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewTask(t);
                            }}
                            style={{ padding: '0.35rem 0.65rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#099268' }}
                          >
                            <Eye size={12} /> Review
                          </button>
                        )}

                        {t.status === 'IN_REVIEW' && (
                          <button
                            title="Inspect or update review deliverables"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewTask(t);
                            }}
                            style={{ padding: '0.35rem 0.65rem', border: '1px solid #bbf7d0', backgroundColor: '#f0fdf4', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#15803d' }}
                          >
                            <Paperclip size={12} /> Deliverables
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Task Details Drawer Modal */}
      {activeTaskId && (
        <TaskDetailModal
          taskId={activeTaskId}
          onClose={() => setActiveTaskId(null)}
          onTaskUpdated={fetchMyTasks}
        />
      )}

      {/* Submit Deliverables Modal */}
      {reviewTask && (
        <SubmitReviewModal
          task={reviewTask}
          isOpen={!!reviewTask}
          onClose={() => setReviewTask(null)}
          onSuccess={fetchMyTasks}
        />
      )}
    </div>
  );
};

export default MemberTasksPage;
