import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Trash2,
  Edit2,
  Briefcase,
  CheckSquare
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const MemberTimesheetsPage = () => {
  const [worklogs, setWorklogs] = useState([]);
  const [summary, setSummary] = useState({
    totalHours: 0,
    billableHours: 0,
    nonBillableHours: 0,
    approvedHours: 0,
    pendingHours: 0,
    rejectedHours: 0
  });
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);

  // Stopwatch state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    logDate: new Date().toISOString().split('T')[0],
    hoursSpent: '',
    description: '',
    isBillable: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  // Timer interval handling
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [logsRes, summaryRes, projsRes, tasksRes] = await Promise.all([
        axios.get(`${API_BASE}/worklogs/my`, authHeaders),
        axios.get(`${API_BASE}/worklogs/summary`, authHeaders),
        axios.get(`${API_BASE}/projects`, authHeaders),
        axios.get(`${API_BASE}/tasks/my-tasks`, authHeaders).catch(() => ({ data: { data: [] } }))
      ]);

      setWorklogs(logsRes.data.data || []);
      setSummary(summaryRes.data.data || {});
      setProjects(projsRes.data.data || []);
      setMyTasks(tasksRes.data.data || []);

      if (projsRes.data.data && projsRes.data.data.length > 0 && !formData.projectId) {
        setFormData((prev) => ({ ...prev, projectId: projsRes.data.data[0].projectId }));
      }
    } catch (err) {
      console.error('Error fetching timesheet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handleLogFromTimer = () => {
    setIsTimerRunning(false);
    // Convert seconds to decimal hours (rounded to 2 decimal places, minimum 0.1)
    const hours = Math.max(0.1, Number((timerSeconds / 3600).toFixed(2)));
    setFormData((prev) => ({
      ...prev,
      hoursSpent: hours.toString()
    }));
    setEditingLog(null);
    setModalOpen(true);
  };

  const formatTimerDisplay = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleOpenModal = (log = null) => {
    if (log) {
      setEditingLog(log);
      setFormData({
        projectId: log.projectId,
        taskId: log.taskId || '',
        logDate: log.logDate,
        hoursSpent: log.hoursSpent.toString(),
        description: log.description,
        isBillable: log.isBillable
      });
    } else {
      setEditingLog(null);
      setFormData({
        projectId: projects[0]?.projectId || '',
        taskId: '',
        logDate: new Date().toISOString().split('T')[0],
        hoursSpent: '',
        description: '',
        isBillable: true
      });
    }
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.projectId) {
      setErrorMsg('Please select a project');
      return;
    }
    if (!formData.hoursSpent || Number(formData.hoursSpent) <= 0) {
      setErrorMsg('Please enter valid hours spent (greater than 0)');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMsg('Please enter a description of work performed');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        projectId: formData.projectId,
        taskId: formData.taskId || null,
        logDate: formData.logDate,
        hoursSpent: parseFloat(formData.hoursSpent),
        description: formData.description.trim(),
        isBillable: formData.isBillable
      };

      if (editingLog) {
        await axios.put(`${API_BASE}/worklogs/${editingLog.worklogId}`, payload, authHeaders);
      } else {
        await axios.post(`${API_BASE}/worklogs`, payload, authHeaders);
        // Reset timer if we logged from timer
        if (timerSeconds > 0) {
          setTimerSeconds(0);
        }
      }

      setModalOpen(false);
      fetchInitialData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save timesheet entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this unapproved timesheet entry?')) return;
    try {
      await axios.delete(`${API_BASE}/worklogs/${id}`, authHeaders);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete entry');
    }
  };

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1400px', margin: '0 auto', color: '#2b2b2b' }}>
      {/* Top Header & Live Stopwatch */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Time Tracking & Timesheets
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Record worklogs, track billable project deliverables, and monitor approval status.
          </p>
        </div>

        {/* Stopwatch Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          backgroundColor: '#ffffff',
          border: '1px solid #d4d4d4',
          borderRadius: '8px',
          padding: '0.6rem 1.2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        }}>
          <Clock size={20} color="#2b2b2b" />
          <div style={{
            fontFamily: 'monospace',
            fontSize: '1.35rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            minWidth: '100px',
            textAlign: 'center'
          }}>
            {formatTimerDisplay(timerSeconds)}
          </div>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {!isTimerRunning ? (
              <button
                onClick={handleStartTimer}
                title="Start Stopwatch"
                style={{
                  backgroundColor: '#2b2b2b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.45rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <Play size={14} style={{ fill: '#ffffff' }} />
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                title="Pause Stopwatch"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#2b2b2b',
                  border: '1px solid #2b2b2b',
                  borderRadius: '6px',
                  padding: '0.45rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <Pause size={14} />
              </button>
            )}

            <button
              onClick={handleResetTimer}
              disabled={timerSeconds === 0}
              title="Reset Stopwatch"
              style={{
                backgroundColor: '#ffffff',
                color: timerSeconds === 0 ? '#b3b3b3' : '#2b2b2b',
                border: '1px solid #d4d4d4',
                borderRadius: '6px',
                padding: '0.45rem 0.65rem',
                cursor: timerSeconds === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <RotateCcw size={14} />
            </button>

            <button
              onClick={handleLogFromTimer}
              disabled={timerSeconds < 60}
              title="Log Stopwatch Time"
              style={{
                backgroundColor: timerSeconds < 60 ? '#f0f0f0' : '#2b2b2b',
                color: timerSeconds < 60 ? '#b3b3b3' : '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: timerSeconds < 60 ? 'not-allowed' : 'pointer'
              }}
            >
              Log Time
            </button>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: '#d4d4d4', margin: '0 0.5rem' }} />

          <button
            onClick={() => handleOpenModal()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#2b2b2b',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Log Work
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Total Logged Hours</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{summary.totalHours || '0.00'}h</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>All historical submissions</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Billable Hours</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{summary.billableHours || '0.00'}h</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>Client invoiced work</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Approved Hours</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{summary.approvedHours || '0.00'}h</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>Verified by PM / Admin</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Pending Review</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{summary.pendingHours || '0.00'}h</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>Awaiting PM approval</div>
        </div>
      </div>

      {/* Timesheets Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d4d4d4',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          padding: '1.25rem',
          borderBottom: '1px solid #d4d4d4',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>My Worklogs History</h2>
          <span style={{ fontSize: '0.85rem', color: '#888' }}>{worklogs.length} entries recorded</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>Loading timesheets...</div>
        ) : worklogs.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <Clock size={40} color="#b3b3b3" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.5rem' }}>No Worklogs Recorded Yet</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Use the stopwatch widget or click "Log Work" to log your daily project tasks and billable deliverables.
            </p>
            <button
              onClick={() => handleOpenModal()}
              style={{
                backgroundColor: '#2b2b2b',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.2rem',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Log First Entry
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #d4d4d4', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Project / Task</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Description</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Hours</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Type</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {worklogs.map((log) => {
                  const isApproved = log.status === 'APPROVED';
                  const isRejected = log.status === 'REJECTED';

                  return (
                    <tr
                      key={log.worklogId}
                      style={{
                        borderBottom: '1px solid #eee',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={14} color="#888" />
                          {log.logDate}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#2b2b2b' }}>
                          {log.projectCode} — {log.projectName}
                        </div>
                        {log.taskCode ? (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckSquare size={12} /> {log.taskCode}: {log.taskTitle}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.2rem' }}>
                            Project-level general work
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', maxWidth: '380px' }}>
                        <div style={{ color: '#2b2b2b', lineHeight: 1.4 }}>{log.description}</div>
                        {isRejected && log.reviewNotes && (
                          <div style={{
                            marginTop: '0.4rem',
                            padding: '0.35rem 0.6rem',
                            backgroundColor: '#f5f5f5',
                            borderLeft: '3px solid #2b2b2b',
                            fontSize: '0.8rem',
                            color: '#444'
                          }}>
                            <strong>Reviewer Feedback:</strong> {log.reviewNotes}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 800, fontSize: '1rem' }}>
                        {Number(log.hoursSpent).toFixed(2)}h
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: log.isBillable ? '#2b2b2b' : '#eee',
                          color: log.isBillable ? '#ffffff' : '#666'
                        }}>
                          {log.isBillable ? 'BILLABLE' : 'INTERNAL'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: isApproved ? '#2b2b2b' : isRejected ? '#f5f5f5' : '#ffffff',
                          color: isApproved ? '#ffffff' : isRejected ? '#2b2b2b' : '#2b2b2b',
                          border: isApproved ? 'none' : isRejected ? '1px solid #2b2b2b' : '1px solid #d4d4d4'
                        }}>
                          {isApproved && <CheckCircle2 size={12} />}
                          {isRejected && <XCircle size={12} />}
                          {!isApproved && !isRejected && <AlertCircle size={12} />}
                          {log.status}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {!isApproved ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleOpenModal(log)}
                              title="Edit worklog"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '4px'
                              }}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(log.worklogId)}
                              title="Delete worklog"
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#666',
                                padding: '4px'
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#999' }}>Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Work Modal via Portal */}
      {modalOpen && createPortal(
        <div
          onClick={() => setModalOpen(false)}
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
              width: '100%',
              maxWidth: '540px',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
              padding: '2rem'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
              borderBottom: '1px solid #e5e5e5',
              paddingBottom: '1rem'
            }}>
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
                  marginBottom: '0.4rem'
                }}>
                  Time Tracking &amp; Worklog
                </span>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#1e1e1e', letterSpacing: '-0.02em' }}>
                  {editingLog ? 'Edit Timesheet Entry' : 'Log Daily Work'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
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
                  transition: 'background 0.2s',
                  flexShrink: 0
                }}
                title="Close modal"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              {errorMsg && (
                <div style={{
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #2b2b2b',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#2b2b2b',
                  fontWeight: 600
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Project Selection */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Target Project *
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #d4d4d4',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectCode} - {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Task Selection (Optional) */}
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Linked Task (Optional)
                </label>
                <select
                  value={formData.taskId}
                  onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #d4d4d4',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="">-- No Specific Task (General Project Work) --</option>
                  {myTasks
                    .filter((t) => !formData.projectId || t.projectId === formData.projectId)
                    .map((t) => (
                      <option key={t.taskId} value={t.taskId}>
                        {t.taskCode}: {t.title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Date & Hours Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Work Date *
                  </label>
                  <input
                    type="date"
                    value={formData.logDate}
                    onChange={(e) => setFormData({ ...formData, logDate: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      border: '1px solid #d4d4d4',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Hours Spent *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    placeholder="e.g. 2.5"
                    value={formData.hoursSpent}
                    onChange={(e) => setFormData({ ...formData, hoursSpent: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.8rem',
                      border: '1px solid #d4d4d4',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Work Description & Deliverables *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail the technical tasks completed, code merged, defects fixed, or design mockups produced..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #d4d4d4',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Billable Toggle */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '1.5rem',
                backgroundColor: '#f9f9f9',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #eee'
              }}>
                <input
                  type="checkbox"
                  id="billableCheck"
                  checked={formData.isBillable}
                  onChange={(e) => setFormData({ ...formData, isBillable: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#2b2b2b', cursor: 'pointer' }}
                />
                <label htmlFor="billableCheck" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  Mark as Billable Hours (invoiced to project client)
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d4d4d4',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.65rem 1.4rem',
                    backgroundColor: '#2b2b2b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Saving...' : editingLog ? 'Update Worklog' : 'Submit Worklog'}
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

export default MemberTimesheetsPage;
