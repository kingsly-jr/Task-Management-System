import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/client';
import {
  X,
  Upload,
  Link2,
  FileText,
  FileCheck,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Square,
  CheckSquare
} from 'lucide-react';

const SubmitReviewModal = ({ task, isOpen, onClose, onSuccess }) => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);

  useEffect(() => {
    if (task && isOpen) {
      loadSubtasks();
      // Pre-fill existing review URL/notes if present
      if (task.reviewUrl) setUrl(task.reviewUrl);
      if (task.reviewNotes) setNotes(task.reviewNotes);
      setError('');
    }
  }, [task, isOpen]);

  const loadSubtasks = async () => {
    setLoadingSubtasks(true);
    try {
      const res = await api.get(`/tasks/${task.taskId}`);
      if (res.data && res.data.subtasks) {
        setSubtasks(res.data.subtasks);
      }
    } catch (err) {
      console.error('Failed to load subtasks in review modal', err);
    } finally {
      setLoadingSubtasks(false);
    }
  };

  const handleToggleModalSubtask = async (subtaskId) => {
    // Optimistic toggle
    setSubtasks((prev) =>
      prev.map((s) => (s.subtaskId === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s))
    );
    try {
      await api.patch(`/tasks/${task.taskId}/subtasks/${subtaskId}/toggle`);
    } catch (err) {
      // Revert on error
      setSubtasks((prev) =>
        prev.map((s) => (s.subtaskId === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s))
      );
      setError(err.message || 'Failed to toggle subtask');
    }
  };

  if (!isOpen || !task) return null;

  const completedCount = subtasks.filter((s) => s.isCompleted).length;
  const totalCount = subtasks.length;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please provide a deliverable, PR, or staging URL.');
      return;
    }
    if (!file && !task.reviewDocumentName) {
      setError('Please attach the implementation document outlining what you built.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('url', url.trim());
      if (notes.trim()) {
        formData.append('notes', notes.trim());
      }

      await api.post(`/tasks/${task.taskId}/submit-for-review`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit deliverables for review');
    } finally {
      setLoading(false);
    }
  };

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
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
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
          maxWidth: '620px',
          width: '100%',
          margin: 'auto',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.45rem', backgroundColor: '#e6fcf5', color: '#099268', borderRadius: '4px' }}>
                {task.taskCode || 'TASK'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#8c8c8c', fontWeight: 600 }}>
                {task.projectName || 'Project Task'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2b2b2b', margin: 0, letterSpacing: '-0.01em' }}>
              Submit Deliverables for Review
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#666666' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Instructions banner */}
        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: '0.78rem', color: '#166534', lineHeight: 1.5 }}>
          Review and tick your checklist subtasks, attach the implementation document, and supply the deliverable / PR link for manager approval.
        </div>

        {/* Error notification */}
        {error && (
          <div style={{ margin: '1rem 1.5rem 0 1.5rem', padding: '0.75rem 1rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto' }}>
          {/* Checklist & Subtasks Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckSquare size={14} color="#099268" />
                Checklist & Subtasks ({completedCount}/{totalCount})
              </label>
              {totalCount > 0 && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: completedCount === totalCount ? '#16a34a' : '#64748b' }}>
                  {Math.round((completedCount / totalCount) * 100)}% Completed
                </span>
              )}
            </div>

            {loadingSubtasks ? (
              <div style={{ padding: '0.85rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.78rem' }}>
                Loading checklist subtasks...
              </div>
            ) : subtasks.length === 0 ? (
              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>
                No checklist subtasks attached to this task.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '150px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                {subtasks.map((sub) => (
                  <button
                    key={sub.subtaskId}
                    type="button"
                    onClick={() => handleToggleModalSubtask(sub.subtaskId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.65rem',
                      backgroundColor: sub.isCompleted ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${sub.isCompleted ? '#bbf7d0' : '#e2e8f0'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: '0.8rem',
                      transition: 'all 0.1s ease',
                      width: '100%',
                    }}
                  >
                    {sub.isCompleted ? (
                      <CheckSquare size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                    ) : (
                      <Square size={16} color="#94a3b8" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{
                      textDecoration: sub.isCompleted ? 'line-through' : 'none',
                      color: sub.isCompleted ? '#166534' : '#334155',
                      fontWeight: sub.isCompleted ? 600 : 500,
                      flex: 1
                    }}>
                      {sub.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Deliverable URL */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
              Deliverable / PR / Staging URL <span style={{ color: '#e03131' }}>*</span>
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Link2 size={16} color="#8c8c8c" style={{ position: 'absolute', left: '0.75rem' }} />
              <input
                type="url"
                required
                placeholder="https://github.com/org/repo/pull/12 or https://staging.domain.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem 0.55rem 2.25rem',
                  border: '1px solid #d4d4d4',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#2b2b2b',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.3rem' }}>
              Direct link to pull request, repository branch, Figma mockups, or live deployment.
            </div>
          </div>

          {/* Implementation Document Upload */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
              Implementation Document / Report <span style={{ color: '#e03131' }}>*</span>
            </label>

            {!file && !task.reviewDocumentName ? (
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem',
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  textAlign: 'center'
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0]);
                    setError('');
                  }
                }}
              >
                <Upload size={24} color="#64748b" style={{ marginBottom: '0.4rem' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                  Click to upload or drag & drop document
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                  PDF, DOCX, TXT, MD, ZIP, PNG, JPG (up to 50MB)
                </span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.md,.zip,.png,.jpg,.jpeg"
                  style={{ display: 'none' }}
                />
              </label>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FileCheck size={20} color="#16a34a" />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>
                      {file ? file.name : task.reviewDocumentName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Previously uploaded file'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFile(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.25rem' }}
                  title="Remove file"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Implementation Notes (Optional) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
              Implementation Summary & Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Highlight key architecture decisions, completed subtasks, test coverage, or instructions for the reviewer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d4d4d4',
                borderRadius: '6px',
                fontSize: '0.82rem',
                color: '#2b2b2b',
                fontFamily: 'inherit',
                lineHeight: 1.5
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d4d4d4',
                background: '#ffffff',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#666666',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: '#099268',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle size={15} /> Submit for Review
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default SubmitReviewModal;
