import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Check,
  X,
  MessageSquare,
  Calendar,
  User,
  FolderKanban,
  CheckSquare,
  Search
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const ManagerTimesheetsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [worklogs, setWorklogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, SUBMITTED, APPROVED, REJECTED
  const [searchQuery, setSearchQuery] = useState('');

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [targetLog, setTargetLog] = useState(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const token = localStorage.getItem('token');
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectWorklogs(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`, authHeaders);
      const projs = res.data.data || [];
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].projectId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching manager projects:', err);
      setLoading(false);
    }
  };

  const fetchProjectWorklogs = async (projId) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/projects/${projId}/worklogs`, authHeaders);
      setWorklogs(res.data.data || []);
    } catch (err) {
      console.error('Error fetching project timesheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (logId) => {
    try {
      await axios.patch(`${API_BASE}/worklogs/${logId}/review`, {
        status: 'APPROVED',
        reviewNotes: 'Approved by Project Manager'
      }, authHeaders);

      fetchProjectWorklogs(selectedProjectId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve timesheet entry');
    }
  };

  const handleOpenRejectModal = (log) => {
    setTargetLog(log);
    setRejectNotes('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!targetLog) return;

    try {
      setReviewing(true);
      await axios.patch(`${API_BASE}/worklogs/${targetLog.worklogId}/review`, {
        status: 'REJECTED',
        reviewNotes: rejectNotes.trim() || 'Worklog rejected by Project Manager'
      }, authHeaders);

      setRejectModalOpen(false);
      fetchProjectWorklogs(selectedProjectId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject timesheet entry');
    } finally {
      setReviewing(false);
    }
  };

  // Metrics calculation
  const totalHours = worklogs.reduce((acc, curr) => acc + (parseFloat(curr.hoursSpent) || 0), 0);
  const pendingCount = worklogs.filter((w) => w.status === 'SUBMITTED').length;
  const approvedHours = worklogs
    .filter((w) => w.status === 'APPROVED')
    .reduce((acc, curr) => acc + (parseFloat(curr.hoursSpent) || 0), 0);
  const billableHours = worklogs
    .filter((w) => w.isBillable)
    .reduce((acc, curr) => acc + (parseFloat(curr.hoursSpent) || 0), 0);
  const billableRate = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0;

  // Filtered List
  const filteredWorklogs = worklogs.filter((log) => {
    const matchesTab = activeTab === 'ALL' || log.status === activeTab;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      log.userName.toLowerCase().includes(query) ||
      log.description.toLowerCase().includes(query) ||
      (log.taskTitle && log.taskTitle.toLowerCase().includes(query)) ||
      (log.taskCode && log.taskCode.toLowerCase().includes(query));

    return matchesTab && matchesSearch;
  });

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1400px', margin: '0 auto', color: '#2b2b2b' }}>
      {/* Top Header & Project Switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Project Timesheets & Worklog Approvals
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Review employee daily deliverables, verify billable hours, and govern timesheet submissions.
          </p>
        </div>

        {/* Project Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#666' }}>Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: '1px solid #d4d4d4',
              backgroundColor: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 600,
              minWidth: '260px'
            }}
          >
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectCode} — {p.projectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Total Project Hours</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{totalHours.toFixed(2)}h</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>All employee submissions</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Pending Approvals</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.8rem', color: pendingCount > 0 ? '#2b2b2b' : '#888', fontWeight: pendingCount > 0 ? 700 : 400, marginTop: '0.2rem' }}>
            Requires PM review
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Approved Hours</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{approvedHours.toFixed(2)}h</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>Ready for client reporting</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Billable Ratio</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.35rem' }}>{billableRate}%</div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.2rem' }}>{billableHours.toFixed(2)}h billable</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { key: 'ALL', label: 'All Timesheets' },
            { key: 'SUBMITTED', label: `Pending Review (${pendingCount})` },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: activeTab === tab.key ? '1px solid #2b2b2b' : '1px solid #d4d4d4',
                backgroundColor: activeTab === tab.key ? '#2b2b2b' : '#ffffff',
                color: activeTab === tab.key ? '#ffffff' : '#2b2b2b',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#888" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search employee, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.8rem 0.5rem 2.2rem',
              border: '1px solid #d4d4d4',
              borderRadius: '6px',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* Timesheet Review Table */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d4d4d4',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#888' }}>Loading project timesheets...</div>
        ) : filteredWorklogs.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <Clock size={40} color="#b3b3b3" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.5rem' }}>
              No Timesheets in this Category
            </h3>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              {activeTab === 'SUBMITTED'
                ? 'All submitted timesheets for this project have been reviewed.'
                : 'No worklogs match your filter query.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #d4d4d4', color: '#666', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Employee</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Task / Work Done</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Hours</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Type</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Approval Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorklogs.map((log) => {
                  const isPending = log.status === 'SUBMITTED';
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
                      {/* Employee Info */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: '#2b2b2b' }}>{log.userName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>
                          {log.userRoleCategory || 'General Team'}
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '1rem 1.25rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                          <Calendar size={14} color="#888" />
                          {log.logDate}
                        </div>
                      </td>

                      {/* Work Description */}
                      <td style={{ padding: '1rem 1.25rem', maxWidth: '380px' }}>
                        {log.taskCode && (
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                            {log.taskCode}: {log.taskTitle}
                          </div>
                        )}
                        <div style={{ color: '#444', lineHeight: 1.4 }}>{log.description}</div>
                        {isRejected && log.reviewNotes && (
                          <div style={{
                            marginTop: '0.4rem',
                            padding: '0.35rem 0.6rem',
                            backgroundColor: '#f5f5f5',
                            borderLeft: '3px solid #2b2b2b',
                            fontSize: '0.8rem',
                            color: '#444'
                          }}>
                            <strong>Reason:</strong> {log.reviewNotes}
                          </div>
                        )}
                      </td>

                      {/* Hours */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 800, fontSize: '1rem' }}>
                        {Number(log.hoursSpent).toFixed(2)}h
                      </td>

                      {/* Billable */}
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

                      {/* Status */}
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
                          {isPending && <AlertCircle size={12} />}
                          {log.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {isPending ? (
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleApprove(log.worklogId)}
                              title="Approve Timesheet"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                backgroundColor: '#2b2b2b',
                                color: '#ffffff',
                                border: 'none',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(log)}
                              title="Reject Timesheet"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                backgroundColor: '#ffffff',
                                color: '#2b2b2b',
                                border: '1px solid #2b2b2b',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#888' }}>
                            Reviewed by {log.reviewedByName || 'Manager'}
                          </span>
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

      {/* Reject Timesheet Modal */}
      {rejectModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #d4d4d4',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Reject Timesheet Submission
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} style={{ padding: '1.5rem' }}>
              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '0.85rem',
                borderRadius: '6px',
                marginBottom: '1.25rem',
                fontSize: '0.85rem'
              }}>
                <div><strong>Employee:</strong> {targetLog?.userName}</div>
                <div><strong>Date & Hours:</strong> {targetLog?.logDate} ({targetLog?.hoursSpent}h)</div>
                <div style={{ marginTop: '0.35rem', color: '#555' }}>
                  <strong>Description:</strong> {targetLog?.description}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Reason for Rejection *
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain why this timesheet entry is being returned (e.g. Please link to defect ticket, Hours exceed milestone estimate, etc.)..."
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
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
                  disabled={reviewing}
                  style={{
                    padding: '0.6rem 1.3rem',
                    backgroundColor: '#2b2b2b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: reviewing ? 'not-allowed' : 'pointer'
                  }}
                >
                  {reviewing ? 'Submitting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTimesheetsPage;
