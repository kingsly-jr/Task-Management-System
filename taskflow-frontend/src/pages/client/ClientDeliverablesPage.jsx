import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import {
  CheckSquare2,
  FolderKanban,
  Flag,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';

const ClientDeliverablesPage = () => {
  const [projects, setProjects] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    fetchDeliverables();
  }, []);

  const fetchDeliverables = async () => {
    setLoading(true);
    try {
      const projRes = await api.get('/projects');
      const projectList = projRes.data || [];
      setProjects(projectList);

      const milestonesAgg = [];
      for (const p of projectList) {
        try {
          const mRes = await api.get(`/projects/${p.projectId}/milestones`);
          const list = mRes.data || [];
          list.forEach(m => {
            milestonesAgg.push({
              ...m,
              projectCode: p.projectCode,
              projectName: p.projectName,
            });
          });
        } catch (e) {
          // ignore individual fails
        }
      }
      setAllMilestones(milestonesAgg);
    } catch (err) {
      console.error('Failed to load deliverables', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = allMilestones.filter(m => {
    if (statusFilter === 'ALL') return true;
    return (m.status || 'PLANNED').toUpperCase() === statusFilter;
  });

  const completedCount = allMilestones.filter(m => m.status === 'COMPLETED').length;
  const inProgressCount = allMilestones.filter(m => m.status === 'IN_PROGRESS').length;
  const plannedCount = allMilestones.filter(m => !['COMPLETED', 'IN_PROGRESS'].includes(m.status)).length;

  const handleOpenMilestone = (m) => {
    setSelectedMilestone(m);
    setShowModal(true);
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
            Deliverables
          </span>
          <span style={{ fontSize: '0.75rem', color: '#8c8c8c', fontWeight: 600 }}>
            Contracted Milestones &amp; Sign-offs
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.02em' }}>
          Milestones &amp; Project Deliverables
        </h1>
        <p style={{ color: '#666666', fontSize: '0.9rem', margin: '0.35rem 0 0 0' }}>
          Track scheduled release dates, acceptance criteria, and completed milestone deliverables across your engagements.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Milestones
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1e1e', margin: '0.4rem 0 0.2rem 0' }}>
            {loading ? '—' : allMilestones.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            Across {projects.length} contracted engagements
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Accepted &amp; Completed
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2b8a3e', margin: '0.4rem 0 0.2rem 0' }}>
            {loading ? '—' : completedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            Formally passed demo &amp; acceptance
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            In Active Execution
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1e1e', margin: '0.4rem 0 0.2rem 0' }}>
            {loading ? '—' : inProgressCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            Currently in development / QA
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e5e5e5' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Upcoming Iterations
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#8c8c8c', margin: '0.4rem 0 0.2rem 0' }}>
            {loading ? '—' : plannedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#666666' }}>
            Scheduled on project roadmap
          </div>
        </div>
      </div>

      {/* Deliverables Registry Card */}
      <div className="card" style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e5e5e5',
        overflow: 'hidden'
      }}>
        {/* Table Filter Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e' }}>
              Deliverables Registry ({filtered.length})
            </h3>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#8c8c8c' }}>
              Milestones and release criteria
            </p>
          </div>

          <div style={{ display: 'inline-flex', gap: '0.4rem', backgroundColor: '#f2f2f2', padding: '0.25rem', borderRadius: '6px' }}>
            {['ALL', 'COMPLETED', 'IN_PROGRESS', 'PLANNED'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.35rem 0.75rem',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: statusFilter === status ? '#1e1e1e' : 'transparent',
                  color: statusFilter === status ? '#ffffff' : '#666666',
                  transition: 'all 0.15s'
                }}
              >
                {status === 'ALL' ? 'All' : status === 'COMPLETED' ? 'Completed' : status === 'IN_PROGRESS' ? 'In Progress' : 'Upcoming'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.88rem' }}>
            No deliverables found matching the filter.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e5e5e5' }}>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#666666' }}>Milestone / Release</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Project</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Target Date</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Progress</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#666666' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#666666', textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.milestoneId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.95rem 1.25rem' }}>
                      <div style={{ fontWeight: 800, color: '#1e1e1e' }}>{m.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#666666', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.description || 'No detailed specifications provided.'}
                      </div>
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#1e1e1e' }}>{m.projectName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>{m.projectCode}</div>
                    </td>
                    <td style={{ padding: '0.95rem 1rem', color: '#444444' }}>
                      {m.targetDate || 'TBD'}
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '80px', height: '6px', backgroundColor: '#ebebeb', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${m.progressPercentage || (m.status === 'COMPLETED' ? 100 : 0)}%`,
                            height: '100%',
                            backgroundColor: '#1e1e1e',
                            borderRadius: '3px'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e1e1e' }}>
                          {m.progressPercentage || (m.status === 'COMPLETED' ? 100 : 0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.95rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: m.status === 'COMPLETED' ? '#eef8ee' : m.status === 'IN_PROGRESS' ? '#e9ecef' : '#f8f9fa',
                        color: m.status === 'COMPLETED' ? '#2b8a3e' : m.status === 'IN_PROGRESS' ? '#2b2b2b' : '#666666'
                      }}>
                        {m.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {m.status || 'PLANNED'}
                      </span>
                    </td>
                    <td style={{ padding: '0.95rem 1.25rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenMilestone(m)}
                        style={{
                          padding: '0.4rem 0.85rem',
                          backgroundColor: '#ffffff',
                          border: '1px solid #d4d4d4',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#2b2b2b'
                        }}
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MILESTONE INSPECT MODAL (Via React Portal) */}
      {showModal && selectedMilestone && createPortal(
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
              maxWidth: '560px',
              width: '100%',
              margin: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
              padding: '2.25rem'
            }}
          >
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
                  Deliverable Specifications
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                  {selectedMilestone.title}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#666666', marginTop: '0.25rem' }}>
                  Project: <strong>{selectedMilestone.projectName}</strong> ({selectedMilestone.projectCode})
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: '#f2f2f2', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#444444', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#fcfcfc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Scope &amp; Description</span>
                <div style={{ fontSize: '0.88rem', color: '#2b2b2b', marginTop: '0.2rem', lineHeight: 1.5 }}>
                  {selectedMilestone.description || 'Deliverables verified through formal sprint demonstrations.'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#666666' }}>Target Date:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1e1e' }}>{selectedMilestone.targetDate || 'TBD'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#666666' }}>Status:</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: selectedMilestone.status === 'COMPLETED' ? '#2b8a3e' : '#2b2b2b' }}>
                  {selectedMilestone.status || 'PLANNED'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  padding: '0.6rem 1.4rem',
                  backgroundColor: '#1e1e1e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ClientDeliverablesPage;
