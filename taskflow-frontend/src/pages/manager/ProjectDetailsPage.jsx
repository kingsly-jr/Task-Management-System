import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  FolderKanban,
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Layers,
  Users2,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Code2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Briefcase
} from 'lucide-react';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [roleCategories, setRoleCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('team'); // 'team' | 'overview'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Assign Form
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Edit Form
  const [editData, setEditData] = useState({
    projectName: '',
    description: '',
    status: '',
    priority: '',
    progress: 0,
    expectedEndDate: '',
    actualEndDate: '',
    technologyStack: '',
  });

  useEffect(() => {
    fetchProjectData();
    fetchRoleCategories();
  }, [id]);

  const fetchProjectData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, mRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/members`),
      ]);
      setProject(pRes.data);
      setMembers(mRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleCategories = async () => {
    try {
      const res = await api.get('/role-categories?status=ACTIVE');
      setRoleCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load role categories', err);
    }
  };

  const handleOpenAssignModal = async () => {
    try {
      const res = await api.get(`/projects/${id}/members/available`);
      const candidates = res.data || [];
      setAvailableCandidates(candidates);
      if (candidates.length > 0) {
        setSelectedUserId(candidates[0].userId);
        setSelectedCategoryId(candidates[0].roleCategoryId || (roleCategories[0]?.roleCategoryId || ''));
      } else {
        setSelectedUserId('');
        setSelectedCategoryId('');
      }
      setShowAssignModal(true);
    } catch (err) {
      setError(err.message || 'Failed to load available team members');
    }
  };

  const handleCandidateChange = (userId) => {
    setSelectedUserId(userId);
    const candidate = availableCandidates.find((c) => c.userId === userId);
    if (candidate && candidate.roleCategoryId) {
      setSelectedCategoryId(candidate.roleCategoryId);
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setError('');
    setSuccessMsg('');
    try {
      const payload = {
        userId: selectedUserId,
        roleCategoryId: selectedCategoryId ? parseInt(selectedCategoryId, 10) : null,
      };
      await api.post(`/projects/${id}/members`, payload);
      setShowAssignModal(false);
      setSuccessMsg('Team member successfully assigned to project.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to assign team member');
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.fullName} from this project?`)) {
      return;
    }
    setError('');
    setSuccessMsg('');
    try {
      await api.delete(`/projects/${id}/members/${member.projectMemberId}`);
      setSuccessMsg(`${member.fullName} removed from project.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  };

  const handleOpenEditModal = () => {
    if (!project) return;
    setEditData({
      projectName: project.projectName,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      progress: project.progress || 0,
      expectedEndDate: project.expectedEndDate || '',
      actualEndDate: project.actualEndDate || '',
      technologyStack: project.technologyStack || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        projectName: editData.projectName.trim(),
        description: editData.description.trim() || null,
        status: editData.status,
        priority: editData.priority,
        progress: parseInt(editData.progress, 10),
        expectedEndDate: editData.expectedEndDate,
        actualEndDate: editData.actualEndDate || null,
        technologyStack: editData.technologyStack.trim() || null,
      };
      await api.put(`/projects/${id}`, payload);
      setShowEditModal(false);
      setSuccessMsg('Project updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to update project');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertCircle size={36} color="#e03131" style={{ margin: '0 auto 0.75rem auto' }} />
        <h2 style={{ fontSize: '1.25rem', color: '#2b2b2b' }}>Project Not Found</h2>
        <button
          onClick={() => navigate('/manager/projects')}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#2b2b2b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Return to Projects
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Back button & Breadcrumb */}
      <div>
        <button
          onClick={() => navigate('/manager/projects')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            backgroundColor: '#ffffff',
            border: '1px solid #d4d4d4',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#666666',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} /> Back to Projects
        </button>
      </div>

      {/* Main Project Header Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.55rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', letterSpacing: '0.04em' }}>
                {project.projectCode}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.55rem',
                  borderRadius: '4px',
                  backgroundColor: project.status === 'COMPLETED' ? '#e6fcf5' : project.status === 'IN_PROGRESS' ? '#2b2b2b' : '#f1f1f1',
                  color: project.status === 'COMPLETED' ? '#0ca678' : project.status === 'IN_PROGRESS' ? '#ffffff' : '#666666',
                }}
              >
                {project.status.replace('_', ' ')}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.55rem',
                  borderRadius: '4px',
                  backgroundColor: project.priority === 'URGENT' ? '#ffe3e3' : project.priority === 'HIGH' ? '#fff3bf' : '#f1f1f1',
                  color: project.priority === 'URGENT' ? '#c92a2a' : project.priority === 'HIGH' ? '#d9480f' : '#495057',
                }}
              >
                {project.priority} PRIORITY
              </span>
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
              {project.projectName}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#666666' }}>
              <Building2 size={14} color="#8c8c8c" />
              <span>Client: <strong>{project.clientCompanyName}</strong></span>
              <span style={{ color: '#d4d4d4' }}>•</span>
              <span>Contact: {project.clientContactPerson}</span>
            </div>
          </div>

          <button
            onClick={handleOpenEditModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              backgroundColor: '#ffffff',
              border: '1px solid #d4d4d4',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#2b2b2b',
              cursor: 'pointer',
            }}
          >
            <Edit2 size={14} /> Update Project Status
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
            <span>Milestone Progress</span>
            <span>{project.progress || 0}% Complete</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${project.progress || 0}%`, height: '100%', backgroundColor: '#2b2b2b', borderRadius: '4px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ebfbee', border: '1px solid #b2f2bb', borderRadius: '6px', color: '#2b8a3e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fff2f2', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #d4d4d4' }}>
        <button
          onClick={() => setActiveTab('team')}
          style={{
            padding: '0.65rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderBottom: activeTab === 'team' ? '2px solid #2b2b2b' : '2px solid transparent',
            color: activeTab === 'team' ? '#2b2b2b' : '#666666',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <Users2 size={15} /> Project Team ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.65rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 700,
            borderBottom: activeTab === 'overview' ? '2px solid #2b2b2b' : '2px solid transparent',
            color: activeTab === 'overview' ? '#2b2b2b' : '#666666',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <FolderKanban size={15} /> Overview & Specs
        </button>
      </div>

      {/* TAB 1: TEAM ALLOCATION */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                Assigned Team Members
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#666666' }}>
                Developers, Designers, Testers, and Specialists allocated to execute project sprints.
              </p>
            </div>

            <button
              onClick={handleOpenAssignModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.1rem',
                backgroundColor: '#2b2b2b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              <UserPlus size={15} /> Allocate Team Member
            </button>
          </div>

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', overflow: 'hidden' }}>
            {members.length === 0 ? (
              <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <Users2 size={36} color="#b3b3b3" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', margin: '0 0 0.25rem 0' }}>No Team Members Allocated</h3>
                <p style={{ fontSize: '0.82rem', color: '#8c8c8c', margin: '0 0 1rem 0' }}>
                  Assign your first developer, QA engineer, or designer to start assigning tasks.
                </p>
                <button
                  onClick={handleOpenAssignModal}
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
                  <Plus size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Allocate Member
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid #d4d4d4', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Team Member</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Specialization Role</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Assigned Date</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => (
                      <tr key={m.projectMemberId} style={{ borderBottom: '1px solid #ececec' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2b2b2b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                              {m.fullName.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#2b2b2b' }}>{m.fullName}</div>
                              <div style={{ fontSize: '0.78rem', color: '#666666' }}>{m.email}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                            {m.roleCategoryName}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: '#666666', fontSize: '0.8rem' }}>
                          {m.assignedAt ? new Date(m.assignedAt).toLocaleDateString() : 'N/A'}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem', backgroundColor: '#eef8ee', color: '#2b8a3e', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                            ACTIVE
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            title="Remove from Project"
                            onClick={() => handleRemoveMember(m)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              border: '1px solid #d4d4d4',
                              backgroundColor: '#ffffff',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#e03131',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW & SPECS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
          {/* Left Column: Scope & Tech */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.75rem 0' }}>Project Scope & Objectives</h3>
              <p style={{ fontSize: '0.85rem', color: '#4a4a4a', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                {project.description || 'No detailed description specified for this project.'}
              </p>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.75rem 0' }}>Technology Stack</h3>
              {project.technologyStack ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {project.technologyStack.split(',').map((tech, idx) => (
                    <span key={idx} style={{ padding: '0.3rem 0.65rem', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#2b2b2b' }}>
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.82rem', color: '#8c8c8c', margin: 0 }}>No technology stack specified.</p>
              )}
            </div>
          </div>

          {/* Right Column: Financials, Dates & Client */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.75rem 0' }}>Client Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Company</span>
                  <div style={{ fontWeight: 700, color: '#2b2b2b' }}>{project.clientCompanyName}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Representative</span>
                  <div style={{ color: '#2b2b2b' }}>{project.clientContactPerson}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Email</span>
                  <div style={{ color: '#2b2b2b' }}>{project.clientEmail}</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.75rem 0' }}>Timeline & Budget</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Contract Budget</span>
                  <div style={{ fontWeight: 800, color: '#2b2b2b', fontSize: '1.1rem' }}>
                    ${project.budget ? Number(project.budget).toLocaleString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Start Date</span>
                  <div style={{ color: '#2b2b2b' }}>{project.startDate}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Target Delivery</span>
                  <div style={{ color: '#2b2b2b' }}>{project.expectedEndDate}</div>
                </div>
                {project.actualEndDate && (
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Actual Delivery</span>
                    <div style={{ color: '#2b8a3e', fontWeight: 700 }}>{project.actualEndDate}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ALLOCATE TEAM MEMBER */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '480px', width: '100%', padding: '1.5rem', border: '1px solid #d4d4d4' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.4rem 0' }}>Allocate Team Member</h2>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: '0 0 1.25rem 0' }}>
              Assign an available employee and select their specialization role for <strong>{project.projectName}</strong>.
            </p>

            {availableCandidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <p style={{ fontSize: '0.85rem', color: '#666666' }}>All active company team members are already assigned to this project.</p>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#2b2b2b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignMember} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Select Team Member *
                  </label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => handleCandidateChange(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    {availableCandidates.map((c) => (
                      <option key={c.userId} value={c.userId}>
                        {c.fullName} ({c.roleCategoryName}) — [{c.activeProjectsCount} active project{c.activeProjectsCount === 1 ? '' : 's'}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Project Specialization Role *
                  </label>
                  <select
                    required
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    {roleCategories.map((rc) => (
                      <option key={rc.roleCategoryId} value={rc.roleCategoryId}>
                        {rc.roleCategoryName}
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.25rem', display: 'block' }}>
                    Defaults to member's primary capability, but can be tailored per project.
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    style={{ padding: '0.55rem 1rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', color: '#666666', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '0.55rem 1.25rem', backgroundColor: '#2b2b2b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Confirm Allocation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: UPDATE STATUS & SPECS */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '520px', width: '100%', padding: '1.5rem', border: '1px solid #d4d4d4', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.5rem 0' }}>Update Project Specs</h2>

            <form onSubmit={handleUpdateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Project Name *</label>
                <input
                  type="text"
                  required
                  value={editData.projectName}
                  onChange={(e) => setEditData({ ...editData, projectName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Project Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Priority</label>
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Progress Completion ({editData.progress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editData.progress}
                  onChange={(e) => setEditData({ ...editData, progress: e.target.value })}
                  style={{ width: '100%', accentColor: '#2b2b2b' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Expected End Date</label>
                  <input
                    type="date"
                    value={editData.expectedEndDate}
                    onChange={(e) => setEditData({ ...editData, expectedEndDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Actual End Date</label>
                  <input
                    type="date"
                    value={editData.actualEndDate}
                    onChange={(e) => setEditData({ ...editData, actualEndDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Technology Stack</label>
                <input
                  type="text"
                  value={editData.technologyStack}
                  onChange={(e) => setEditData({ ...editData, technologyStack: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Scope / Description</label>
                <textarea
                  rows="3"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: '0.55rem 1rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', color: '#666666', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.55rem 1.25rem', backgroundColor: '#2b2b2b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
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

export default ProjectDetailsPage;
