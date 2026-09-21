import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  Users2,
  Plus,
  Search,
  Filter,
  Briefcase,
  Building2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Percent,
  X,
  UserCheck,
  Layers,
  ChevronRight
} from 'lucide-react';

const ManagerTeamPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [roleCategories, setRoleCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [allocation, setAllocation] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAssignModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAssignModal]);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch PM's assigned projects
      const projRes = await api.get('/projects');
      const projectList = projRes.data || [];
      setProjects(projectList);

      // 2. Fetch role categories for filtering and assignments
      const roleRes = await api.get('/role-categories?status=ACTIVE');
      setRoleCategories(roleRes.data || []);

      // 3. For each project, fetch its assigned members
      const memberListAgg = [];
      for (const p of projectList) {
        try {
          const mRes = await api.get(`/projects/${p.projectId}/members`);
          const list = mRes.data || [];
          list.forEach((m) => {
            memberListAgg.push({
              ...m,
              projectId: p.projectId,
              projectCode: p.projectCode,
              projectName: p.projectName,
              clientCompanyName: p.clientCompanyName || 'N/A'
            });
          });
        } catch (err) {
          console.warn(`Failed to fetch members for project ${p.projectId}`, err);
        }
      }
      setTeamMembers(memberListAgg);
    } catch (err) {
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  // When project changes in assign modal, load available members for that project
  const handleProjectSelectInModal = async (pId) => {
    setSelectedProjectId(pId);
    setModalError('');
    setSelectedUserId('');
    try {
      const res = await api.get(`/projects/${pId}/members/available`);
      const candidates = res.data || [];
      setAvailableCandidates(candidates);
      if (candidates.length > 0) {
        setSelectedUserId(candidates[0].userId);
        if (candidates[0].roleCategoryId) {
          setSelectedCategoryId(candidates[0].roleCategoryId);
        } else if (roleCategories.length > 0) {
          setSelectedCategoryId(roleCategories[0].roleCategoryId);
        }
      }
    } catch (err) {
      setModalError(err.message || 'Failed to fetch available candidates for this project');
    }
  };

  const handleOpenAssignModal = () => {
    setModalError('');
    if (projects.length > 0) {
      const initialProjId = projects[0].projectId;
      setSelectedProjectId(initialProjId);
      handleProjectSelectInModal(initialProjId);
    }
    setAllocation(100);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedUserId) {
      setModalError('Please select a project and candidate member');
      return;
    }
    setIsSubmitting(true);
    setModalError('');
    try {
      await api.post(`/projects/${selectedProjectId}/members`, {
        userId: Number(selectedUserId),
        roleCategoryId: selectedCategoryId ? Number(selectedCategoryId) : null,
        allocationPercentage: Number(allocation)
      });
      setShowAssignModal(false);
      setSuccessMsg('Team member assigned successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchTeamData();
    } catch (err) {
      setModalError(err.message || 'Failed to assign team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (m) => {
    if (!window.confirm(`Are you sure you want to remove ${m.fullName || m.email} from project "${m.projectName}"?`)) {
      return;
    }
    try {
      await api.delete(`/projects/${m.projectId}/members/${m.projectMemberId}`);
      setSuccessMsg(`Removed ${m.fullName || m.email} from ${m.projectCode}`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchTeamData();
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  };

  // Filtered members
  const filteredMembers = teamMembers.filter((m) => {
    const matchProject = projectFilter === 'ALL' || String(m.projectId) === String(projectFilter);
    const matchRole = roleFilter === 'ALL' || (m.roleCategoryCode && m.roleCategoryCode === roleFilter);
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      (m.fullName && m.fullName.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.projectCode && m.projectCode.toLowerCase().includes(q)) ||
      (m.roleCategoryName && m.roleCategoryName.toLowerCase().includes(q));
    return matchProject && matchRole && matchSearch;
  });

  // Calculate distinct headcount
  const uniqueMemberEmails = new Set(teamMembers.map((m) => m.email));
  const distinctHeadcount = uniqueMemberEmails.size;
  const distinctRoles = new Set(teamMembers.map((m) => m.roleCategoryName).filter(Boolean)).size;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{ padding: '0.35rem', backgroundColor: '#2b2b2b', color: '#ffffff', borderRadius: '6px', display: 'flex' }}>
              <Users2 size={18} />
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', margin: 0 }}>
              Project Team & Resources
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#666666' }}>
            Cross-project staffing, role category assignments, and workload allocations under your management.
          </p>
        </div>

        <button
          onClick={handleOpenAssignModal}
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.55rem 1.15rem',
            fontSize: '0.85rem'
          }}
        >
          <Plus size={16} /> Assign Team Member
        </button>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={16} color="#16a34a" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: '#fff4f4',
          border: '1px solid #e0b4b4',
          color: '#b00020',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Total Team Members</span>
            <div style={{ padding: '0.35rem', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#2b2b2b' }}>
              <UserCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b' }}>{distinctHeadcount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Unique engineers & specialists</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Active Project Allocations</span>
            <div style={{ padding: '0.35rem', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#2b2b2b' }}>
              <Briefcase size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b' }}>{teamMembers.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Cross-project roles assigned</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Role Specializations</span>
            <div style={{ padding: '0.35rem', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#2b2b2b' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b' }}>{distinctRoles}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Active technical tracks</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Staffed Projects</span>
            <div style={{ padding: '0.35rem', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#2b2b2b' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b' }}>{projects.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Under your management</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c' }} />
            <input
              type="text"
              placeholder="Search member, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>
              <Filter size={14} /> Filter:
            </div>

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="input-field"
              style={{ width: 'auto', minWidth: '180px', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
            >
              <option value="ALL">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode}: {p.projectName}
                </option>
              ))}
            </select>

            {/* Role Category Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
              style={{ width: 'auto', minWidth: '160px', fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
            >
              <option value="ALL">All Specializations</option>
              {roleCategories.map((r) => (
                <option key={r.roleCategoryId} value={r.roleCategoryCode}>
                  {r.roleCategoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Team Roster Grid */}
      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
          Loading team roster and cross-project allocations...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f4f4f4', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#8c8c8c' }}>
            <Users2 size={24} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.4rem 0' }}>
            No Team Members Found
          </h3>
          <p style={{ color: '#666666', fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
            {search || projectFilter !== 'ALL' || roleFilter !== 'ALL'
              ? 'No members match your current filter parameters. Try clearing the filters.'
              : 'You have not staffed any team members to your assigned projects yet. Click "+ Assign Team Member" to begin building your team.'}
          </p>
          {projects.length > 0 && (
            <button onClick={handleOpenAssignModal} className="btn-primary" style={{ fontSize: '0.82rem' }}>
              <Plus size={14} /> Assign First Member
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredMembers.map((m) => {
            const initials = m.fullName
              ? m.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
              : m.email.substring(0, 2).toUpperCase();

            return (
              <div
                key={`${m.projectId}-${m.projectMemberId || m.userId}`}
                className="card animate-fade-in"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                {/* Member Identity */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#2b2b2b',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        letterSpacing: '-0.02em',
                        flexShrink: 0
                      }}>
                        {initials}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.15rem 0' }}>
                          {m.fullName || m.email}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: '#666666' }}>{m.email}</div>
                      </div>
                    </div>

                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: '#2b2b2b',
                      color: '#ffffff'
                    }}>
                      {m.allocationPercentage || 100}%
                    </span>
                  </div>

                  {/* Role Specialization Pill */}
                  <div style={{ marginBottom: '0.85rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      backgroundColor: '#f4f4f4',
                      color: '#2b2b2b',
                      border: '1px solid #e5e5e5'
                    }}>
                      <Layers size={12} color="#666" />
                      {m.roleCategoryName || m.roleCategoryCode || 'Technical Contributor'}
                    </span>
                  </div>

                  {/* Project Context Box */}
                  <div style={{
                    backgroundColor: '#fafafa',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.78rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ color: '#8c8c8c', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.68rem' }}>Assigned Project</span>
                      <span style={{ fontWeight: 700, color: '#2b2b2b' }}>{m.projectCode}</span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#2b2b2b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.projectName}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#666666', marginTop: '0.2rem' }}>
                      Client: {m.clientCompanyName}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f0f0f0',
                  paddingTop: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  <button
                    onClick={() => navigate(`/manager/projects/${m.projectId}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#2b2b2b',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: 0
                    }}
                  >
                    View Project <ChevronRight size={13} />
                  </button>

                  <button
                    onClick={() => handleRemoveMember(m)}
                    title="Remove from project"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: '0.35rem 0.65rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #fca5a5',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#b91c1c',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ASSIGN MEMBER MODAL (Portaled to document.body with blur(12px)) */}
      {showAssignModal && createPortal(
        <div
          onClick={() => setShowAssignModal(false)}
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
              maxWidth: '540px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
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
                  marginBottom: '0.5rem'
                }}>
                  Resource Allocation
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.02em' }}>
                  Assign Team Member
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#666666', margin: '0.35rem 0 0 0' }}>
                  Staff an engineer or specialist to one of your assigned project workspaces.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8c8c8c'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div style={{
                backgroundColor: '#fff4f4',
                border: '1px solid #e0b4b4',
                color: '#b00020',
                padding: '0.65rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Target Project */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Target Project *
                </label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => handleProjectSelectInModal(e.target.value)}
                  className="input-field"
                >
                  <option value="" disabled>Select project...</option>
                  {projects.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectCode}: {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Candidate Member */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Team Member Candidate *
                </label>
                {availableCandidates.length === 0 ? (
                  <div style={{ fontSize: '0.82rem', color: '#8c8c8c', padding: '0.65rem', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px dashed #d4d4d4' }}>
                    No available unassigned team members found for this project, or all members are already assigned.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="input-field"
                  >
                    <option value="" disabled>Select candidate...</option>
                    {availableCandidates.map((c) => (
                      <option key={c.userId} value={c.userId}>
                        {c.fullName || `${c.firstName} ${c.lastName}`} ({c.email}) {c.roleCategoryName ? `— [${c.roleCategoryName}]` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Role Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Project Role Specialization
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="input-field"
                >
                  <option value="">Default / General Contributor</option>
                  {roleCategories.map((r) => (
                    <option key={r.roleCategoryId} value={r.roleCategoryId}>
                      {r.roleCategoryName} ({r.roleCategoryCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Workload Allocation Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b' }}>
                    Workload Allocation
                  </label>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b' }}>
                    {allocation}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={allocation}
                  onChange={(e) => setAllocation(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#2b2b2b' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8c8c8c', marginTop: '0.25rem' }}>
                  <span>Part-Time (25%)</span>
                  <span>Half-Time (50%)</span>
                  <span>Full-Time (100%)</span>
                </div>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || availableCandidates.length === 0}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign to Project'}
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

export default ManagerTeamPage;
