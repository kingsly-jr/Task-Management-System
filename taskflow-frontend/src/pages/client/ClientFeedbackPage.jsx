import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import {
  Star,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  AlertCircle,
  FolderKanban,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Send,
  Edit2
} from 'lucide-react';

const ClientFeedbackPage = () => {
  const [projects, setProjects] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    rating: 5,
    qualityRating: 5,
    communicationRating: 5,
    timelinessRating: 5,
    valueRating: 5,
    testimonial: '',
    comments: '',
    strengths: '',
    improvements: '',
    wouldRecommend: true
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, feedRes] = await Promise.all([
        api.get('/projects'),
        api.get('/feedbacks/my-feedbacks').catch(() => ({ data: [] }))
      ]);
      setProjects(projRes.data || []);
      setFeedbacks(feedRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load project feedback data');
    } finally {
      setLoading(false);
    }
  };

  const getFeedbackForProject = (projectId) => {
    return feedbacks.find(f => f.projectId === projectId);
  };

  const handleOpenReviewModal = (project) => {
    setSelectedProject(project);
    const existing = getFeedbackForProject(project.projectId);
    if (existing) {
      setFormData({
        rating: existing.rating || 5,
        qualityRating: existing.qualityRating || 5,
        communicationRating: existing.communicationRating || 5,
        timelinessRating: existing.timelinessRating || 5,
        valueRating: existing.valueRating || 5,
        testimonial: existing.testimonial || '',
        comments: existing.comments || '',
        strengths: existing.strengths || '',
        improvements: existing.improvements || '',
        wouldRecommend: existing.wouldRecommend ?? true
      });
    } else {
      setFormData({
        rating: 5,
        qualityRating: 5,
        communicationRating: 5,
        timelinessRating: 5,
        valueRating: 5,
        testimonial: '',
        comments: '',
        strengths: '',
        improvements: '',
        wouldRecommend: true
      });
    }
    setShowModal(true);
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post(`/projects/${selectedProject.projectId}/feedback`, formData);
      setShowModal(false);
      setSuccessMsg(`Thank you! Your feedback for "${selectedProject.projectName}" has been recorded.`);
      await fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');
  const activeProjects = projects.filter(p => p.status !== 'COMPLETED');
  const submittedCount = feedbacks.length;
  const pendingReviewCount = completedProjects.length - feedbacks.filter(f => completedProjects.some(cp => cp.projectId === f.projectId)).length;
  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
    : '5.0';

  const renderStars = (ratingVal, interactive = false, onSelect = null) => {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= ratingVal;
          return (
            <button
              key={star}
              type={interactive ? 'button' : undefined}
              onClick={interactive ? () => onSelect(star) : undefined}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: interactive ? 'pointer' : 'default',
                color: filled ? '#1e1e1e' : '#d4d4d4',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Star
                size={interactive ? 24 : 16}
                fill={filled ? '#1e1e1e' : 'none'}
                stroke={filled ? '#1e1e1e' : '#b0b0b0'}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            backgroundColor: '#2b2b2b',
            color: '#ffffff',
            padding: '0.2rem 0.55rem',
            borderRadius: '4px'
          }}>
            Client Reviews
          </span>
          <span style={{ fontSize: '0.75rem', color: '#8c8c8c', fontWeight: 600 }}>
            Post-Delivery Quality Assurance
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.02em' }}>
          Project Completion Feedback &amp; Ratings
        </h1>
        <p style={{ color: '#666666', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
          Evaluate deliverable quality, execution adherence, and team collaboration for completed contracted projects.
        </p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#f2f9f2',
          border: '1px solid #c3e6c3',
          borderRadius: '8px',
          color: '#2b8a3e',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#fff5f5',
          border: '1px solid #ffd8d8',
          borderRadius: '8px',
          color: '#c92a2a',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completed Projects
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1e1e', margin: '0.4rem 0 0.2rem 0' }}>
            {loading ? '—' : completedProjects.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            Eligible for client completion review
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Reviews Submitted
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2b8a3e', margin: '0.4rem 0 0.2rem 0' }}>
            {loading ? '—' : submittedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            Submitted to project leadership
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pending Reviews
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: pendingReviewCount > 0 ? '#1e1e1e' : '#8c8c8c', margin: '0.4rem 0 0.2rem 0' }}>
            {loading ? '—' : Math.max(0, pendingReviewCount)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            Awaiting client feedback
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Average Rating Given
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1e1e', margin: '0.4rem 0 0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>{loading ? '—' : avgRating}</span>
            <Star size={20} fill="#1e1e1e" color="#1e1e1e" />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            Across all submitted reviews
          </div>
        </div>
      </div>

      {/* Completed Projects Feedback Section */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
            Completed Engagements ({completedProjects.length})
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#8c8c8c' }}>
            Formal sign-off evaluations
          </span>
        </div>

        {completedProjects.length === 0 ? (
          <div className="card" style={{
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px dashed #d4d4d4'
          }}>
            <Sparkles size={36} color="#8c8c8c" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2b2b2b', margin: '0 0 0.35rem 0' }}>
              No Completed Projects Yet
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666666', maxWidth: '480px', margin: '0 auto' }}>
              Project feedback unlocks automatically when a project transitions to <strong>COMPLETED</strong> status upon final milestone acceptance.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {completedProjects.map((p) => {
              const existingFeedback = getFeedbackForProject(p.projectId);
              return (
                <div
                  key={p.projectId}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e5e5e5',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '0.15rem 0.5rem',
                          backgroundColor: '#f2f2f2',
                          borderRadius: '4px',
                          color: '#2b2b2b'
                        }}>
                          {p.projectCode}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.5rem',
                          backgroundColor: '#eef8ee',
                          color: '#2b8a3e',
                          borderRadius: '4px'
                        }}>
                          COMPLETED
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.35rem 0' }}>
                        {p.projectName}
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: '#666666', margin: 0, maxWidth: '700px' }}>
                        {p.description || 'Contract deliverables completed and approved.'}
                      </p>
                    </div>

                    {/* Action or Review Summary */}
                    <div>
                      {existingFeedback ? (
                        <button
                          onClick={() => handleOpenReviewModal(p)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.55rem 1rem',
                            backgroundColor: '#ffffff',
                            border: '1px solid #d4d4d4',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#2b2b2b',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Edit Review</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenReviewModal(p)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            padding: '0.6rem 1.25rem',
                            backgroundColor: '#1e1e1e',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                          }}
                        >
                          <Star size={14} fill="#ffffff" />
                          <span>Submit Project Review</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If feedback was submitted, show review details */}
                  {existingFeedback && (
                    <div style={{
                      marginTop: '1.25rem',
                      paddingTop: '1.25rem',
                      borderTop: '1px solid #f0f0f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e1e1e' }}>Overall Evaluation:</span>
                          {renderStars(existingFeedback.rating)}
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1e1e' }}>
                            ({existingFeedback.rating}.0 / 5.0)
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                          Submitted by {existingFeedback.submittedByName} on {new Date(existingFeedback.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Dimensions Breakdown */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.75rem',
                        backgroundColor: '#fbfbfb',
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#8c8c8c', fontWeight: 700, textTransform: 'uppercase' }}>Deliverable Quality</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b' }}>{existingFeedback.qualityRating || 5} / 5 Stars</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#8c8c8c', fontWeight: 700, textTransform: 'uppercase' }}>Communication</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b' }}>{existingFeedback.communicationRating || 5} / 5 Stars</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#8c8c8c', fontWeight: 700, textTransform: 'uppercase' }}>Schedule &amp; Timeliness</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b' }}>{existingFeedback.timelinessRating || 5} / 5 Stars</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#8c8c8c', fontWeight: 700, textTransform: 'uppercase' }}>Value &amp; Budget</div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b' }}>{existingFeedback.valueRating || 5} / 5 Stars</div>
                        </div>
                      </div>

                      {/* Testimonial Quote */}
                      {existingFeedback.testimonial && (
                        <blockquote style={{
                          margin: '0.25rem 0 0 0',
                          padding: '0.75rem 1rem',
                          backgroundColor: '#ffffff',
                          borderLeft: '3px solid #1e1e1e',
                          borderRadius: '0 6px 6px 0',
                          fontStyle: 'italic',
                          color: '#333333',
                          fontSize: '0.88rem'
                        }}>
                          "{existingFeedback.testimonial}"
                        </blockquote>
                      )}

                      {/* Comments */}
                      {existingFeedback.comments && (
                        <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
                          <strong>Detailed Notes:</strong> {existingFeedback.comments}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Projects (In Progress) Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
            Active Projects ({activeProjects.length})
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#8c8c8c' }}>
            Feedback unlocks upon project completion
          </span>
        </div>

        {activeProjects.length === 0 ? (
          <div className="card" style={{ padding: '1.5rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.85rem' }}>
            No in-progress projects currently active.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {activeProjects.map((p) => (
              <div
                key={p.projectId}
                className="card"
                style={{
                  padding: '1.25rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e5e5e5'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#f2f2f2', borderRadius: '4px', color: '#2b2b2b' }}>
                    {p.projectCode}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', backgroundColor: '#e9ecef', color: '#495057', borderRadius: '4px' }}>
                    {p.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.35rem 0' }}>
                  {p.projectName}
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#666666', marginBottom: '0.75rem' }}>
                  Delivery Progress: <strong>{p.progressPercentage || 0}%</strong>
                </div>

                <div style={{
                  height: '6px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    width: `${p.progressPercentage || 0}%`,
                    height: '100%',
                    backgroundColor: '#1e1e1e',
                    borderRadius: '3px'
                  }} />
                </div>

                <div style={{ fontSize: '0.75rem', color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={12} />
                  <span>Feedback unlocks once milestones complete &amp; project is closed.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SUBMIT / EDIT FEEDBACK MODAL (Via React Portal) */}
      {showModal && selectedProject && createPortal(
        <div
          onClick={() => setShowModal(false)}
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
            className="card animate-fade-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '620px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 760px)',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
              padding: '2.25rem'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#444444',
                  backgroundColor: '#f2f2f2',
                  border: '1px solid #e5e5e5',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '4px',
                  marginBottom: '0.4rem'
                }}>
                  Project Evaluation
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.02em' }}>
                  Review for {selectedProject.projectName}
                </h2>
                <p style={{ fontSize: '0.82rem', color: '#666666', margin: '0.25rem 0 0 0' }}>
                  Project Code: <strong>{selectedProject.projectCode}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: '#f2f2f2',
                  border: 'none',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  color: '#444444',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Overall Star Rating */}
              <div style={{
                padding: '1.15rem',
                backgroundColor: '#fafafa',
                borderRadius: '8px',
                border: '1px solid #ebebeb',
                textAlign: 'center'
              }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#1e1e1e', marginBottom: '0.5rem' }}>
                  Overall Satisfaction Rating *
                </label>
                {renderStars(formData.rating, true, (newVal) => setFormData({ ...formData, rating: newVal }))}
                <div style={{ fontSize: '0.78rem', color: '#666666', marginTop: '0.4rem', fontWeight: 600 }}>
                  {formData.rating === 5 ? 'Exceptional (5/5)' : formData.rating === 4 ? 'Great (4/5)' : formData.rating === 3 ? 'Good (3/5)' : formData.rating === 2 ? 'Needs Improvement (2/5)' : 'Unsatisfactory (1/5)'}
                </div>
              </div>

              {/* Sub-ratings Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                    Quality of Deliverables (1-5)
                  </label>
                  <select
                    value={formData.qualityRating}
                    onChange={(e) => setFormData({ ...formData, qualityRating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                    Team Communication (1-5)
                  </label>
                  <select
                    value={formData.communicationRating}
                    onChange={(e) => setFormData({ ...formData, communicationRating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                    Schedule &amp; Timeliness (1-5)
                  </label>
                  <select
                    value={formData.timelinessRating}
                    onChange={(e) => setFormData({ ...formData, timelinessRating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                    Budget &amp; Value (1-5)
                  </label>
                  <select
                    value={formData.valueRating}
                    onChange={(e) => setFormData({ ...formData, valueRating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
              </div>

              {/* Testimonial Quote */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Testimonial / Highlight Quote
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. TaskFlow delivered our cloud architecture ahead of schedule with remarkable quality."
                  value={formData.testimonial}
                  onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {/* Detailed Feedback */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Detailed Project Evaluation &amp; Comments
                </label>
                <textarea
                  rows="3"
                  placeholder="Detailed observations regarding project deliverables, technical execution, milestone demos, etc."
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {/* Would Recommend Toggle */}
              <div style={{ backgroundColor: '#f9f9f9', padding: '0.85rem', borderRadius: '6px', border: '1px solid #ebebeb' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.84rem', fontWeight: 700, color: '#1e1e1e' }}>
                  <input
                    type="checkbox"
                    checked={formData.wouldRecommend}
                    onChange={(e) => setFormData({ ...formData, wouldRecommend: e.target.checked })}
                    style={{ accentColor: '#1e1e1e', width: '16px', height: '16px' }}
                  />
                  I would recommend TaskFlow to partner organizations and enterprise peers
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.6rem 1.25rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', color: '#666666', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.6rem 1.5rem',
                    backgroundColor: '#1e1e1e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Send size={14} />
                  <span>{submitting ? 'Submitting...' : 'Submit Evaluation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ClientFeedbackPage;
