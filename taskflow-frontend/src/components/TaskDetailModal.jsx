import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/client';
import {
  X,
  CheckSquare,
  Square,
  MessageSquare,
  Clock,
  Calendar,
  AlertCircle,
  Send,
  Trash2,
  Plus,
  Building2,
  FolderKanban,
  CheckCircle2,
  Users
} from 'lucide-react';

const TaskDetailModal = ({ taskId, onClose, onTaskUpdated }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingSubtask, setSubmittingSubtask] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [taskId]);

  const fetchTaskDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/tasks/${taskId}`);
      setTask(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubmittingSubtask(true);
    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title: newSubtaskTitle.trim() });
      setNewSubtaskTitle('');
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add subtask');
    } finally {
      setSubmittingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      setError(err.message || 'Failed to toggle subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      setError(err.message || 'Failed to delete subtask');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await api.post(`/tasks/${taskId}/comments`, { content: newComment.trim() });
      setNewComment('');
      fetchTaskDetails();
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!taskId) return null;

  return createPortal(
    <div
      onClick={onClose}
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
          maxWidth: '780px',
          width: '100%',
          margin: 'auto',
          maxHeight: 'min(90vh, 760px)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: '#fafafa'
        }}>
          <div>
            {task && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.5rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', letterSpacing: '0.04em' }}>
                  {task.taskCode}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#8c8c8c', fontWeight: 600 }}>
                  {task.projectName} ({task.projectCode})
                </span>
              </div>
            )}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: 0, letterSpacing: '-0.01em' }}>
              {loading ? 'Loading Task Details...' : task?.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#666666' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
            Loading task details...
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#c92a2a' }}>
            <AlertCircle size={28} style={{ margin: '0 auto 0.5rem auto' }} />
            <div>{error}</div>
          </div>
        ) : task && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', flex: 1, overflowY: 'auto' }}>
            {/* Left Main Column */}
            <div style={{ padding: '1.5rem', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Description */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', margin: '0 0 0.5rem 0' }}>
                  Description & Specifications
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#333333', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                  {task.description || 'No detailed description provided for this task.'}
                </p>
              </div>

              {/* Subtasks / Checklist */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', margin: 0 }}>
                    Checklist & Subtasks ({task.completedSubtasksCount}/{task.subtasksCount})
                  </h4>
                  {task.subtasksCount > 0 && (
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b' }}>
                      {Math.round((task.completedSubtasksCount / task.subtasksCount) * 100)}%
                    </span>
                  )}
                </div>

                {/* Subtask list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  {task.subtasks && task.subtasks.map((sub) => (
                    <div
                      key={sub.subtaskId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#fbfbfb',
                        border: '1px solid #ebebeb',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div
                        onClick={() => handleToggleSubtask(sub.subtaskId)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', flex: 1 }}
                      >
                        {sub.isCompleted ? (
                          <CheckSquare size={16} color="#2b8a3e" />
                        ) : (
                          <Square size={16} color="#8c8c8c" />
                        )}
                        <span style={{ textDecoration: sub.isCompleted ? 'line-through' : 'none', color: sub.isCompleted ? '#8c8c8c' : '#2b2b2b' }}>
                          {sub.title}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteSubtask(sub.subtaskId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b3b3b3', padding: '0.2rem' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#e03131')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#b3b3b3')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Input */}
                <form onSubmit={handleAddSubtask} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Add a new checklist item..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    style={{ flex: 1, padding: '0.45rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.82rem' }}
                  />
                  <button
                    type="submit"
                    disabled={submittingSubtask || !newSubtaskTitle.trim()}
                    style={{
                      padding: '0.45rem 0.85rem',
                      backgroundColor: '#2b2b2b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Plus size={13} /> Add
                  </button>
                </form>
              </div>

              {/* Discussion & Comments */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', margin: '0 0 0.75rem 0' }}>
                  Activity & Discussion ({task.comments?.length || 0})
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {task.comments && task.comments.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#8c8c8c', fontStyle: 'italic' }}>
                      No comments yet. Start the conversation below.
                    </div>
                  ) : (
                    task.comments?.map((comment) => (
                      <div key={comment.commentId} style={{ backgroundColor: '#fafafa', border: '1px solid #ebebeb', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b' }}>{comment.userName}</span>
                          <span style={{ fontSize: '0.7rem', color: '#8c8c8c' }}>
                            {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#444444', lineHeight: 1.5 }}>
                          {comment.content}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Post a status update or question..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ flex: 1, padding: '0.45rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.82rem' }}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    style={{
                      padding: '0.45rem 0.85rem',
                      backgroundColor: '#2b2b2b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Send size={13} /> Send
                  </button>
                </form>
              </div>
            </div>

            {/* Right Attributes Sidebar */}
            <div style={{ padding: '1.5rem', backgroundColor: '#fcfcfc', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Status Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Task Status
                </label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b' }}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Priority
                </label>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: task.priority === 'URGENT' ? '#ffe3e3' : task.priority === 'HIGH' ? '#fff3bf' : '#f1f1f1',
                    color: task.priority === 'URGENT' ? '#c92a2a' : task.priority === 'HIGH' ? '#d9480f' : '#495057',
                  }}
                >
                  {task.priority}
                </span>
              </div>

              {/* Assignees */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Assigned Team ({task.assignees?.length || 0})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {task.assignees && task.assignees.length === 0 ? (
                    <span style={{ fontSize: '0.78rem', color: '#8c8c8c' }}>Unassigned</span>
                  ) : (
                    task.assignees?.map((a) => (
                      <div key={a.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#2b2b2b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.7rem' }}>
                          {a.fullName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#2b2b2b' }}>{a.fullName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#8c8c8c' }}>{a.roleCategoryName}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dates & Hours */}
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666666' }}>
                  <Calendar size={13} color="#8c8c8c" />
                  <span>Due Date: <strong>{task.dueDate || 'No date'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666666' }}>
                  <Clock size={13} color="#8c8c8c" />
                  <span>Estimated: <strong>{task.estimatedHours ? `${task.estimatedHours} hrs` : 'N/A'}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#666666' }}>
                  <CheckCircle2 size={13} color="#8c8c8c" />
                  <span>Logged: <strong>{task.loggedHours || 0} hrs</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default TaskDetailModal;
