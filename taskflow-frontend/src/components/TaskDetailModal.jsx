import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
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
  Users,
  Check,
  AlertTriangle,
  RotateCcw,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  Download,
  FileText,
  Globe,
  Paperclip,
  Upload
} from 'lucide-react';
import SubmitReviewModal from './SubmitReviewModal';

const TaskDetailModal = ({ taskId, onClose, onTaskUpdated }) => {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingSubtask, setSubmittingSubtask] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Approval review state
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectMessage, setRejectMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showSubmitReviewModal, setShowSubmitReviewModal] = useState(false);

  const isManager = user?.role === 'PROJECT_MANAGER' || user?.role === 'ADMIN';

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

  const fetchTaskDetails = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    if (!silent) {
      setShowRejectForm(false);
      setRejectMessage('');
    }
    try {
      const res = await api.get(`/tasks/${taskId}`);
      setTask(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load task details');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'IN_REVIEW') {
      setShowSubmitReviewModal(true);
      return;
    }
    if (newStatus === 'COMPLETED' && !isManager) {
      setError('Team members cannot mark tasks as Completed directly. Please submit deliverables to In Review for Manager approval.');
      return;
    }
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleDownloadReviewDocument = async () => {
    try {
      const blob = await api.get(`/tasks/${taskId}/review-document`, {
        responseType: 'blob',
      });
      const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', task.reviewDocumentName || 'task-review-deliverable');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err.message || 'Failed to download review document');
    }
  };

  const handleApproveTask = async () => {
    setSubmittingReview(true);
    try {
      await api.post(`/tasks/${taskId}/approve`);
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      setError(err.message || 'Failed to approve task');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRejectTask = async (e) => {
    e.preventDefault();
    if (!rejectMessage.trim()) return;
    setSubmittingReview(true);
    try {
      await api.post(`/tasks/${taskId}/reject`, { message: rejectMessage.trim() });
      setShowRejectForm(false);
      setRejectMessage('');
      fetchTaskDetails();
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      setError(err.message || 'Failed to return task with feedback');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubmittingSubtask(true);
    try {
      await api.post(`/tasks/${taskId}/subtasks`, { title: newSubtaskTitle.trim() });
      setNewSubtaskTitle('');
      fetchTaskDetails(true);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      setError(err.message || 'Failed to add subtask');
    } finally {
      setSubmittingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    // Optimistically update UI so checkbox ticks immediately without modal flicker
    setTask((prev) => {
      if (!prev || !prev.subtasks) return prev;
      const updatedSubtasks = prev.subtasks.map((s) =>
        s.subtaskId === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
      );
      const completedCount = updatedSubtasks.filter((s) => s.isCompleted).length;
      return {
        ...prev,
        subtasks: updatedSubtasks,
        completedSubtasksCount: completedCount,
      };
    });

    try {
      await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`);
      fetchTaskDetails(true);
      if (onTaskUpdated) onTaskUpdated();
    } catch (err) {
      fetchTaskDetails(true);
      setError(err.message || 'Failed to toggle subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
      fetchTaskDetails(true);
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
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            {/* Approval Workflow Banner */}
            {task.approvalStatus === 'PENDING_APPROVAL' && (
              <div style={{
                margin: '1rem 1.5rem 0 1.5rem',
                padding: '1rem 1.25rem',
                backgroundColor: isManager ? '#eff6ff' : '#fff9db',
                border: `1px solid ${isManager ? '#bfdbfe' : '#ffe066'}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color={isManager ? '#1d4ed8' : '#e67700'} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isManager ? '#1e40af' : '#d9480f' }}>
                      {isManager ? 'Task Completion Review Required' : 'Waiting for Manager Approval'}
                    </span>
                  </div>

                  {isManager && !showRejectForm && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={handleApproveTask}
                        disabled={submittingReview}
                        style={{
                          padding: '0.4rem 0.85rem',
                          backgroundColor: '#2b8a3e',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Check size={14} /> Approve Task
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        disabled={submittingReview}
                        style={{
                          padding: '0.4rem 0.85rem',
                          backgroundColor: '#e03131',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <RotateCcw size={14} /> Request Changes
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', color: isManager ? '#1e3a8a' : '#92400e', lineHeight: 1.5 }}>
                  {isManager ? (
                    <span>
                      This task was submitted for review & approval by <strong>{task.completedByName || task.submittedForReviewByName || 'Team Member'}</strong>
                      {task.submittedForReviewAt ? ` on ${new Date(task.submittedForReviewAt).toLocaleDateString()} at ${new Date(task.submittedForReviewAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}.
                      Review the implementation specifications, preview URL, and attached deliverables before approving.
                    </span>
                  ) : (
                    <span>
                      You have submitted this task to In Review with deliverables. It is currently waiting for your Project Manager to review and approve.
                    </span>
                  )}
                </div>

                {/* Manager Feedback Form for Changes Request */}
                {isManager && showRejectForm && (
                  <form onSubmit={handleRejectTask} style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#ffffff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #fed7aa' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase' }}>
                      Instructions / Feedback for {task.completedByName || 'Team Member'} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={rejectMessage}
                      onChange={(e) => setRejectMessage(e.target.value)}
                      placeholder="Explain specifically what needs to be fixed, revised, or tested before this task can be approved..."
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.82rem', fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => { setShowRejectForm(false); setRejectMessage(''); }}
                        style={{ padding: '0.35rem 0.75rem', border: '1px solid #d4d4d4', background: '#ffffff', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview || !rejectMessage.trim()}
                        style={{ padding: '0.35rem 0.85rem', backgroundColor: '#e03131', color: '#ffffff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        {submittingReview ? 'Sending...' : 'Send Feedback & Request Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {task.approvalStatus === 'REJECTED' && (
              <div style={{
                margin: '1rem 1.5rem 0 1.5rem',
                padding: '0.85rem 1.25rem',
                backgroundColor: '#fff5f5',
                border: '1px solid #ffc9c9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <AlertTriangle size={20} color="#e03131" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#c92a2a', marginBottom: '0.25rem' }}>
                    Changes Requested by Manager
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#495057', fontStyle: 'italic', backgroundColor: '#ffffff', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #ffe3e3', marginBottom: '0.35rem' }}>
                    "{task.rejectionReason}"
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#868e96' }}>
                    Please address the feedback above, update subtasks, and advance the task when complete.
                  </div>
                </div>
              </div>
            )}

            {task.approvalStatus === 'APPROVED' && (
              <div style={{
                margin: '1rem 1.5rem 0 1.5rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: '#ebfbee',
                border: '1px solid #b2f2bb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}>
                <CheckCircle2 size={18} color="#2b8a3e" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b8a3e' }}>
                  Task Approved & Signed Off {task.approvedByName ? `by ${task.approvedByName}` : ''} {task.approvedAt ? `on ${new Date(task.approvedAt).toLocaleDateString()}` : ''}
                </span>
              </div>
            )}

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

              {/* Deliverables & Implementation Review Section */}
              {(task.reviewUrl || task.reviewDocumentName || task.reviewNotes || task.status === 'IN_REVIEW') && (
                <div style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} color="#099268" />
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Deliverables & Implementation Review
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSubmitReviewModal(true)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#099268',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      <Upload size={12} /> {task.reviewUrl || task.reviewDocumentName ? 'Update Deliverables' : 'Attach Deliverables'}
                    </button>
                  </div>

                  {/* URL link */}
                  {task.reviewUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                      <Globe size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                      <span style={{ fontWeight: 700, color: '#475569' }}>Deliverable / Preview:</span>
                      <a
                        href={task.reviewUrl.startsWith('http') ? task.reviewUrl : `https://${task.reviewUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#2563eb',
                          fontWeight: 600,
                          textDecoration: 'underline',
                          wordBreak: 'break-all',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {task.reviewUrl}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      No deliverable URL attached yet.
                    </div>
                  )}

                  {/* Document Download */}
                  {task.reviewDocumentName ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Paperclip size={15} color="#099268" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                          {task.reviewDocumentName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadReviewDocument}
                        style={{
                          padding: '0.35rem 0.75rem',
                          backgroundColor: '#099268',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Download size={13} /> Download Document
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      No implementation document attached yet.
                    </div>
                  )}

                  {/* Notes */}
                  {task.reviewNotes && (
                    <div style={{ fontSize: '0.8rem', color: '#334155', backgroundColor: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 700, color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Implementation Notes:</div>
                      {task.reviewNotes}
                    </div>
                  )}

                  {/* Submitter timestamp info */}
                  {task.submittedForReviewByName && (
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Submitted by <strong>{task.submittedForReviewByName}</strong>
                      {task.submittedForReviewAt ? ` on ${new Date(task.submittedForReviewAt).toLocaleDateString()} at ${new Date(task.submittedForReviewAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                    </div>
                  )}
                </div>
              )}

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
                        padding: '0.55rem 0.75rem',
                        backgroundColor: sub.isCompleted ? '#f0fdf4' : '#fbfbfb',
                        border: `1px solid ${sub.isCompleted ? '#bbf7d0' : '#e2e8f0'}`,
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleSubtask(sub.subtaskId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: 'pointer',
                          flex: 1,
                          textAlign: 'left',
                          fontFamily: 'inherit',
                        }}
                      >
                        {sub.isCompleted ? (
                          <CheckSquare size={17} color="#2b8a3e" style={{ flexShrink: 0 }} />
                        ) : (
                          <Square size={17} color="#8c8c8c" style={{ flexShrink: 0 }} />
                        )}
                        <span style={{
                          textDecoration: sub.isCompleted ? 'line-through' : 'none',
                          color: sub.isCompleted ? '#166534' : '#2b2b2b',
                          fontWeight: sub.isCompleted ? 600 : 500
                        }}>
                          {sub.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(sub.subtaskId)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b3b3b3', padding: '0.2rem' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#e03131')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#b3b3b3')}
                        title="Delete checklist item"
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
                  {isManager ? (
                    <option value="COMPLETED">COMPLETED</option>
                  ) : (
                    <option value="COMPLETED" disabled>COMPLETED (Manager Approval Required)</option>
                  )}
                </select>

                {task.approvalStatus === 'PENDING_APPROVAL' && (
                  <div style={{ marginTop: '0.35rem', padding: '0.25rem 0.5rem', backgroundColor: '#fff9db', border: '1px solid #ffe066', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#d9480f', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} /> Awaiting Manager Approval
                  </div>
                )}
                {task.approvalStatus === 'REJECTED' && (
                  <div style={{ marginTop: '0.35rem', padding: '0.25rem 0.5rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#e03131', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertTriangle size={12} /> Changes Requested
                  </div>
                )}
                {task.approvalStatus === 'APPROVED' && (
                  <div style={{ marginTop: '0.35rem', padding: '0.25rem 0.5rem', backgroundColor: '#ebfbee', border: '1px solid #b2f2bb', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#2b8a3e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={12} /> Approved
                  </div>
                )}
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
        </div>
      )}
      {/* Submit Deliverables Modal */}
      {showSubmitReviewModal && (
        <SubmitReviewModal
          task={task}
          isOpen={showSubmitReviewModal}
          onClose={() => setShowSubmitReviewModal(false)}
          onSuccess={() => {
            fetchTaskDetails();
            if (onTaskUpdated) onTaskUpdated();
          }}
        />
      )}
    </div>
  </div>,
  document.body
);
};

export default TaskDetailModal;
