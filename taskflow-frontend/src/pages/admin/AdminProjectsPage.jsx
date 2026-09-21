import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  DollarSign,
  UserCheck,
  Building2,
  Edit2,
  Trash2,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

const AdminProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [error, setError] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Lock body scroll when either modal is open
  useEffect(() => {
    if (showAddModal || showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddModal, showEditModal]);

  // Form Data
  const [formData, setFormData] = useState({
    projectCode: '',
    projectName: '',
    description: '',
    clientId: '',
    projectManagerId: '',
    startDate: '',
    expectedEndDate: '',
    budget: '',
    paidAmount: '0',
    remainingAmount: '',
    priority: 'MEDIUM',
    status: 'PLANNING',
    technologyStack: '',
  });

  const handleBudgetChange = (newBudget) => {
    const bNum = parseFloat(newBudget);
    const pNum = parseFloat(formData.paidAmount || '0');
    let rem = '';
    if (!isNaN(bNum)) {
      rem = String(Math.max(0, bNum - (isNaN(pNum) ? 0 : pNum)));
    }
    setFormData(prev => ({ ...prev, budget: newBudget, remainingAmount: rem }));
  };

  const handlePaidChange = (newPaid) => {
    const bNum = parseFloat(formData.budget || '0');
    const pNum = parseFloat(newPaid);
    let rem = '';
    if (!isNaN(bNum)) {
      rem = String(Math.max(0, bNum - (isNaN(pNum) ? 0 : pNum)));
    }
    setFormData(prev => ({ ...prev, paidAmount: newPaid, remainingAmount: rem }));
  };

  useEffect(() => {
    fetchAuxiliaryData();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter, priorityFilter]);

  const fetchAuxiliaryData = async () => {
    try {
      const [clientsRes, pmsRes] = await Promise.all([
        api.get('/clients/active'),
        api.get('/users?roleCode=PROJECT_MANAGER&status=ACTIVE&size=100'),
      ]);
      const clientList = Array.isArray(clientsRes?.data)
        ? clientsRes.data
        : (clientsRes?.data?.content || []);
      setClients(clientList);
      setProjectManagers(pmsRes.data?.content || []);
    } catch (err) {
      console.error('Failed to load clients or project managers', err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (priorityFilter !== 'ALL') params.priority = priorityFilter;
      const res = await api.get('/projects', { params });
      setProjects(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData({
      projectCode: '',
      projectName: '',
      description: '',
      clientId: clients.length > 0 ? clients[0].clientId : '',
      projectManagerId: projectManagers.length > 0 ? projectManagers[0].userId : '',
      startDate: today,
      expectedEndDate: nextMonth,
      budget: '15000',
      paidAmount: '0',
      remainingAmount: '15000',
      priority: 'MEDIUM',
      status: 'PLANNING',
      technologyStack: 'React, Java Spring Boot, PostgreSQL',
    });
    setShowAddModal(true);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        projectCode: formData.projectCode.trim() || null,
        projectName: formData.projectName.trim(),
        description: formData.description.trim() || null,
        clientId: formData.clientId,
        projectManagerId: formData.projectManagerId,
        startDate: formData.startDate,
        expectedEndDate: formData.expectedEndDate,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : 0,
        remainingAmount: formData.remainingAmount ? parseFloat(formData.remainingAmount) : null,
        priority: formData.priority,
        status: formData.status,
        technologyStack: formData.technologyStack.trim() || null,
      };

      await api.post('/projects', payload);
      setShowAddModal(false);
      fetchProjects();
    } catch (err) {
      setError(err.message || 'Failed to create project');
    }
  };

  const handleOpenEditModal = (project) => {
    setSelectedProject(project);
    const bVal = project.budget !== null && project.budget !== undefined ? project.budget : '';
    const pVal = project.paidAmount !== null && project.paidAmount !== undefined ? project.paidAmount : 0;
    const rVal = project.remainingAmount !== null && project.remainingAmount !== undefined
      ? project.remainingAmount
      : (bVal !== '' ? Math.max(0, bVal - pVal) : '');

    setFormData({
      projectName: project.projectName,
      description: project.description || '',
      projectManagerId: project.projectManagerId,
      startDate: project.startDate || '',
      expectedEndDate: project.expectedEndDate || '',
      actualEndDate: project.actualEndDate || '',
      budget: bVal !== '' ? String(bVal) : '',
      paidAmount: String(pVal),
      remainingAmount: rVal !== '' ? String(rVal) : '',
      priority: project.priority || 'MEDIUM',
      status: project.status || 'PLANNING',
      progress: project.progress || 0,
      technologyStack: project.technologyStack || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    setError('');
    try {
      const payload = {
        projectName: formData.projectName.trim(),
        description: formData.description.trim() || null,
        projectManagerId: formData.projectManagerId,
        startDate: formData.startDate,
        expectedEndDate: formData.expectedEndDate,
        actualEndDate: formData.actualEndDate || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        paidAmount: formData.paidAmount ? parseFloat(formData.paidAmount) : 0,
        remainingAmount: formData.remainingAmount ? parseFloat(formData.remainingAmount) : null,
        priority: formData.priority,
        status: formData.status,
        progress: parseInt(formData.progress, 10),
        technologyStack: formData.technologyStack.trim() || null,
      };

      await api.put(`/projects/${selectedProject.projectId}`, payload);
      setShowEditModal(false);
      fetchProjects();
    } catch (err) {
      setError(err.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (project) => {
    if (!window.confirm(`Are you sure you want to cancel and delete project "${project.projectName}" (${project.projectCode})?`)) {
      return;
    }
    try {
      await api.delete(`/projects/${project.projectId}`);
      fetchProjects();
    } catch (err) {
      setError(err.message || 'Failed to delete project');
    }
  };

  // Metrics
  const totalCount = projects.length;
  const planningCount = projects.filter((p) => p.status === 'PLANNING').length;
  const inProgressCount = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2b2b2b', letterSpacing: '-0.02em', margin: 0 }}>
            Project Governance & Allocation
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666666' }}>
            Initialize client projects, assign Project Managers, regulate budgets, and monitor milestones.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.65rem 1.1rem',
            backgroundColor: '#2b2b2b',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2b2b2b')}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>All Projects</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{totalCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Total in workspace</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>In Progress</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{inProgressCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Active execution</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Planning</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{planningCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Scoping & staffing</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Completed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{completedCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Delivered to client</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fff2f2', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Search & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fbfbfb', border: '1px solid #d4d4d4', borderRadius: '6px', padding: '0.45rem 0.75rem', minWidth: '260px', flex: 1 }}>
          <Search size={16} color="#8c8c8c" />
          <input
            type="text"
            placeholder="Search by code, title, client company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: '#2b2b2b' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.45rem 0.75rem',
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

      {/* Projects Grid / List */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.9rem', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px' }}>
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px' }}>
          <FolderKanban size={38} color="#b3b3b3" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', margin: '0 0 0.25rem 0' }}>No Projects Found</h3>
          <p style={{ fontSize: '0.82rem', color: '#8c8c8c', margin: '0 0 1rem 0' }}>
            {search ? 'Try clearing your search query.' : 'Initialize your first project and assign it to a Project Manager.'}
          </p>
          {!search && (
            <button
              onClick={handleOpenAddModal}
              style={{
                padding: '0.55rem 1rem',
                backgroundColor: '#2b2b2b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {projects.map((p) => (
            <div
              key={p.projectId}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d4d4d4',
                borderRadius: '8px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'box-shadow 0.15s',
              }}
            >
              <div>
                {/* Header: Code & Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span
                    onClick={() => navigate(`/admin/projects/${p.projectId}`)}
                    title="View Project Workspace"
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.5rem',
                      backgroundColor: '#f0f0f0',
                      color: '#2b2b2b',
                      borderRadius: '4px',
                      letterSpacing: '0.04em',
                      cursor: 'pointer'
                    }}
                  >
                    {p.projectCode}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: p.priority === 'URGENT' ? '#ffe3e3' : p.priority === 'HIGH' ? '#fff3bf' : '#f1f1f1',
                        color: p.priority === 'URGENT' ? '#c92a2a' : p.priority === 'HIGH' ? '#d9480f' : '#495057',
                      }}
                    >
                      {p.priority}
                    </span>

                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: p.status === 'COMPLETED' ? '#e6fcf5' : p.status === 'IN_PROGRESS' ? '#2b2b2b' : '#f1f1f1',
                        color: p.status === 'COMPLETED' ? '#0ca678' : p.status === 'IN_PROGRESS' ? '#ffffff' : '#666666',
                      }}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Project Title & Client */}
                <h3
                  onClick={() => navigate(`/admin/projects/${p.projectId}`)}
                  title="View Project Workspace"
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: '#2b2b2b',
                    margin: '0 0 0.35rem 0',
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    transition: 'color 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#000000')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#2b2b2b')}
                >
                  {p.projectName}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#666666', marginBottom: '0.75rem' }}>
                  <Building2 size={13} color="#8c8c8c" />
                  <strong>{p.clientCompanyName}</strong>
                </div>

                {p.description && (
                  <p style={{ fontSize: '0.8rem', color: '#666666', margin: '0 0 0.85rem 0', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>
                )}

                {/* Progress bar */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: '#666666', marginBottom: '0.3rem' }}>
                    <span>Progress</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${p.progress || 0}%`, height: '100%', backgroundColor: '#2b2b2b', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* Metadata List */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.76rem', color: '#666666', backgroundColor: '#fafafa', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <UserCheck size={13} color="#8c8c8c" />
                    <span>PM: <strong>{p.projectManagerName.split(' ')[0]}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Layers size={13} color="#8c8c8c" />
                    <span>Team: <strong>{p.teamMembersCount} members</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DollarSign size={13} color="#8c8c8c" />
                    <span>Budget: <strong>${p.budget ? Number(p.budget).toLocaleString() : 'N/A'}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={13} color="#2b8a3e" />
                    <span>Paid: <strong style={{ color: '#2b8a3e' }}>${p.paidAmount !== null && p.paidAmount !== undefined ? Number(p.paidAmount).toLocaleString() : '0'}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} color={Number(p.remainingAmount) > 0 ? '#d9480f' : '#8c8c8c'} />
                    <span>Due: <strong style={{ color: Number(p.remainingAmount) > 0 ? '#d9480f' : '#2b2b2b' }}>${p.remainingAmount !== null && p.remainingAmount !== undefined ? Number(p.remainingAmount).toLocaleString() : (p.budget ? Number(p.budget - (p.paidAmount || 0)).toLocaleString() : '0')}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} color="#8c8c8c" />
                    <span>Target: <strong>{p.expectedEndDate}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate(`/admin/projects/${p.projectId}`)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.42rem 0.85rem',
                    backgroundColor: '#2b2b2b',
                    color: '#ffffff',
                    border: '1px solid #2b2b2b',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#111111';
                    e.currentTarget.style.borderColor = '#111111';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2b2b2b';
                    e.currentTarget.style.borderColor = '#2b2b2b';
                  }}
                >
                  <FolderKanban size={13} /> View Workspace & Details
                </button>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => handleOpenEditModal(p)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.75rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d4d4d4',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#2b2b2b',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={12} /> Edit
                  </button>

                  <button
                    onClick={() => handleDeleteProject(p)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.75rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d4d4d4',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#e03131',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREATE PROJECT */}
      {showAddModal && createPortal(
        <div
          onClick={() => setShowAddModal(false)}
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
              maxWidth: '580px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 760px)',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
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
                  Project Provisioning
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.02em' }}>
                  Initialize New Project
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#666666', margin: '0.35rem 0 0 0' }}>
                  Assign client ownership, appoint an executive Project Manager, and set budget boundaries.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Cloud Migration"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Project Code</label>
                  <input
                    type="text"
                    placeholder="Auto (PRJ-0001)"
                    value={formData.projectCode}
                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Client Organization *</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="" disabled>Select client...</option>
                    {clients.map((c) => (
                      <option key={c.clientId} value={c.clientId}>
                        {c.companyName} ({c.contactPerson})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Project Manager *</label>
                  <select
                    required
                    value={formData.projectManagerId}
                    onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="" disabled>Select Project Manager...</option>
                    {projectManagers.map((pm) => (
                      <option key={pm.userId} value={pm.userId}>
                        {pm.firstName} {pm.lastName} ({pm.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Expected End Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expectedEndDate}
                    onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* Financial Breakdown Section in Create Modal */}
              <div style={{ padding: '0.9rem', backgroundColor: '#fcfcfc', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#1e1e1e', letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                  Client Billing &amp; Financials
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>Total Budget ($ USD)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="25000"
                      value={formData.budget}
                      onChange={(e) => handleBudgetChange(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2b8a3e', marginBottom: '0.3rem' }}>Paid by Client ($ USD)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.paidAmount}
                      onChange={(e) => handlePaidChange(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', color: '#2b8a3e' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>Remaining Balance ($)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.remainingAmount}
                      onChange={(e) => setFormData({ ...formData, remainingAmount: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Technology Stack</label>
                <input
                  type="text"
                  placeholder="e.g. React, Spring Boot, PostgreSQL, Docker, AWS"
                  value={formData.technologyStack}
                  onChange={(e) => setFormData({ ...formData, technologyStack: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Project Scope / Description</label>
                <textarea
                  rows="3"
                  placeholder="Summarize project scope, deliverables, and architecture..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.55rem 1rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', color: '#666666', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.55rem 1.25rem', backgroundColor: '#2b2b2b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: EDIT PROJECT */}
      {showEditModal && selectedProject && createPortal(
        <div
          onClick={() => setShowEditModal(false)}
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
              maxWidth: '580px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 760px)',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
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
                  Project Configuration
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.02em' }}>
                  Edit Project: {selectedProject.projectCode}
                </h2>
                <p style={{ fontSize: '0.84rem', color: '#666666', margin: '0.35rem 0 0 0' }}>
                  Update project status, managerial assignment, timeline dates, and allocated budget.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
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

            <form onSubmit={handleUpdateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Reassign Project Manager</label>
                  <select
                    value={formData.projectManagerId}
                    onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    {projectManagers.map((pm) => (
                      <option key={pm.userId} value={pm.userId}>
                        {pm.firstName} {pm.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Progress ({formData.progress}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                    style={{ width: '100%', accentColor: '#2b2b2b' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Expected End Date</label>
                <input
                  type="date"
                  value={formData.expectedEndDate}
                  onChange={(e) => setFormData({ ...formData, expectedEndDate: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Client Financials & Settlement Section in Edit Modal */}
              <div style={{ padding: '1rem', backgroundColor: '#fcfcfc', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1e1e1e', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    Client Financials &amp; Settlement
                  </span>
                  {Number(formData.budget) > 0 && (
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: Number(formData.remainingAmount) === 0 ? '#e6fcf5' : Number(formData.paidAmount) > 0 ? '#e7f5ff' : '#f1f1f1',
                      color: Number(formData.remainingAmount) === 0 ? '#0ca678' : Number(formData.paidAmount) > 0 ? '#1971c2' : '#666666'
                    }}>
                      {Number(formData.remainingAmount) === 0 ? '✓ Settled in Full' : Number(formData.paidAmount) > 0 ? 'Partially Settled' : 'Pending Payment'}
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.3rem' }}>
                      Contract Budget ($ USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.budget}
                      onChange={(e) => handleBudgetChange(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#2b8a3e', marginBottom: '0.3rem' }}>
                      Paid by Client ($ USD)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.paidAmount}
                      onChange={(e) => handlePaidChange(e.target.value)}
                      placeholder="0"
                      style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#2b8a3e' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: Number(formData.remainingAmount) > 0 ? '#d9480f' : '#2b2b2b', marginBottom: '0.3rem' }}>
                      Remaining Balance ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.remainingAmount}
                      onChange={(e) => setFormData({ ...formData, remainingAmount: e.target.value })}
                      placeholder="0"
                      style={{ width: '100%', padding: '0.5rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, color: Number(formData.remainingAmount) > 0 ? '#d9480f' : '#2b2b2b' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.65rem', fontSize: '0.74rem', color: '#666666', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <span>
                    Settled: <strong style={{ color: '#2b8a3e' }}>${Number(formData.paidAmount || 0).toLocaleString()}</strong> of <strong>${Number(formData.budget || 0).toLocaleString()}</strong>
                  </span>
                  <span>
                    Remaining Due: <strong style={{ color: Number(formData.remainingAmount) > 0 ? '#d9480f' : '#0ca678' }}>${Number(formData.remainingAmount || 0).toLocaleString()}</strong>
                  </span>
                </div>
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminProjectsPage;
