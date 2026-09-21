import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Briefcase,
  Layers,
  Phone,
  Mail,
  AlertCircle,
  Copy,
  Check,
  X,
  RefreshCw
} from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalManagers: 0, totalTeamMembers: 0, inactiveUsers: 0 });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isPmModalOpen, setIsPmModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Lock background scroll when any modal is open
  const isAnyModalOpen = isPmModalOpen || isMemberModalOpen || isEditModalOpen || isResetModalOpen;
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Form states
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    roleCategoryId: '',
    temporaryPassword: '',
    status: 'ACTIVE'
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== 'ALL') params.roleCode = roleFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const [usersRes, statsRes] = await Promise.all([
        api.get('/users', { params }),
        api.get('/users/stats')
      ]);

      setUsers(usersRes.data?.content || []);
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/role-categories?status=ACTIVE');
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load active role categories', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenCreatePm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roleCategoryId: '',
      temporaryPassword: 'PM@' + Math.floor(100 + Math.random() * 900),
      status: 'ACTIVE'
    });
    setFormError('');
    setIsPmModalOpen(true);
  };

  const handleOpenCreateMember = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roleCategoryId: categories.length > 0 ? categories[0].roleCategoryId : '',
      temporaryPassword: 'Dev@' + Math.floor(100 + Math.random() * 900),
      status: 'ACTIVE'
    });
    setFormError('');
    setIsMemberModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      roleCategoryId: user.roleCategoryId || (categories[0]?.roleCategoryId || ''),
      status: user.status
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleCreatePmSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/users/managers', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        temporaryPassword: formData.temporaryPassword
      });
      setIsPmModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create Project Manager');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMemberSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/users/team-members', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        roleCategoryId: formData.roleCategoryId,
        temporaryPassword: formData.temporaryPassword
      });
      setIsMemberModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create Team Member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.put(`/users/${editingUser.userId}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        roleCategoryId: editingUser.role === 'TEAM_MEMBER' ? formData.roleCategoryId : null,
        status: formData.status
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user.userId}/status`);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Could not change user status');
    }
  };

  const handleResetPassword = async (user) => {
    const customPass = 'Pass@' + Math.floor(100 + Math.random() * 900);
    try {
      const res = await api.post(`/users/${user.userId}/reset-password`, {
        newTemporaryPassword: customPass
      });
      setResetResult({
        email: user.email,
        temporaryPassword: res.data.temporaryPassword
      });
      setCopied(false);
      setIsResetModalOpen(true);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to deactivate and remove ${user.fullName}?`)) {
      try {
        await api.delete(`/users/${user.userId}`);
        fetchUsers();
      } catch (err) {
        alert(err.message || 'Failed to delete user');
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
            User Management
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem' }}>
            Provision and administer Project Managers, Team Members, and Client accounts.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleOpenCreatePm} className="btn-secondary">
            <UserPlus size={16} /> Add Project Manager
          </button>
          <button onClick={handleOpenCreateMember} className="btn-primary">
            <UserPlus size={16} /> Add Team Member
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666', marginBottom: '0.35rem' }}>Total Accounts</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.totalUsers}</div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>Active company roster</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666', marginBottom: '0.35rem' }}>Project Managers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.totalManagers}</div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>Delivery leadership</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666', marginBottom: '0.35rem' }}>Team Members</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.totalTeamMembers}</div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>Across all skill categories</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666', marginBottom: '0.35rem' }}>Inactive Users</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b' }}>{stats.inactiveUsers}</div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>Deactivated accounts</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="#8c8c8c" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Role Filters */}
          <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f4f4f4', padding: '0.25rem', borderRadius: '6px' }}>
            {[
              { id: 'ALL', label: 'All Roles' },
              { id: 'PROJECT_MANAGER', label: 'Managers' },
              { id: 'TEAM_MEMBER', label: 'Team Members' },
              { id: 'CLIENT', label: 'Clients' }
            ].map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoleFilter(r.id)}
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  backgroundColor: roleFilter === r.id ? '#ffffff' : 'transparent',
                  color: roleFilter === r.id ? '#2b2b2b' : '#666666',
                  boxShadow: roleFilter === r.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '130px', padding: '0.5rem 0.75rem' }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: '#fff4f4',
          border: '1px solid #e0b4b4',
          color: '#b00020',
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#fbfbfb', borderBottom: '1px solid #d4d4d4' }}>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>USER</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>ROLE</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>SPECIALIZATION</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>PHONE</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>STATUS</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
                  No users found matching filter criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.userId} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  {/* User Profile */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: '#f4f4f4',
                        border: '1px solid #d4d4d4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: '#2b2b2b',
                        flexShrink: 0
                      }}>
                        {u.firstName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#2b2b2b', fontSize: '0.92rem' }}>
                          {u.fullName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#8c8c8c' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className="badge badge-dark">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Category / Specialization */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    {u.roleCategoryName ? (
                      <span className="badge badge-subtle">
                        {u.roleCategoryName}
                      </span>
                    ) : (
                      <span style={{ color: '#b3b3b3', fontSize: '0.85rem' }}>—</span>
                    )}
                  </td>

                  {/* Phone */}
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#666666' }}>
                    {u.phone || <span style={{ color: '#b3b3b3' }}>—</span>}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${u.status === 'ACTIVE' ? 'badge-dark' : 'badge-subtle'}`}>
                        {u.status}
                      </span>
                      {u.firstLogin && (
                        <span style={{ fontSize: '0.68rem', backgroundColor: '#f4f4f4', border: '1px solid #d4d4d4', padding: '0.15rem 0.4rem', borderRadius: '4px', color: '#666666' }}>
                          Temp Password
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEdit(u)}
                        title="Edit User"
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.55rem', fontSize: '0.78rem' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(u)}
                        title="Reset Password"
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.55rem', fontSize: '0.78rem' }}
                      >
                        <KeyRound size={13} /> Reset
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        title={u.status === 'ACTIVE' ? 'Deactivate User' : 'Reactivate User'}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.55rem', fontSize: '0.78rem' }}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                      </button>
                      {u.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Delete User"
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.55rem', fontSize: '0.78rem', color: '#8c8c8c' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Project Manager Modal */}
      {isPmModalOpen && createPortal(
        <div
          onClick={() => setIsPmModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
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
              maxWidth: '520px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              padding: '2.25rem',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#ffffff'
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
                  Project Manager Provisioning
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#1e1e1e', letterSpacing: '-0.02em' }}>
                  Create Project Manager
                </h2>
                <p style={{ color: '#666666', fontSize: '0.84rem', margin: '0.35rem 0 0 0' }}>
                  Provision a new Project Manager with temporary credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPmModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666666',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#1e1e1e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#666666'; }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                backgroundColor: '#fff4f4',
                border: '1px solid #e0b4b4',
                color: '#b00020',
                padding: '0.65rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.15rem'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreatePmSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.15rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="+1-555-0100"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', margin: 0 }}>
                    Temporary Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, temporaryPassword: 'PM@' + Math.floor(100 + Math.random() * 900) })}
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: '#2b2b2b',
                      background: '#f4f4f4',
                      border: '1px solid #d4d4d4',
                      borderRadius: '4px',
                      padding: '0.2rem 0.55rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e5e5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f4'; }}
                  >
                    <RefreshCw size={12} />
                    <span>Generate Random</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.temporaryPassword}
                  onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #f0f0f0'
              }}>
                <button
                  type="button"
                  onClick={() => setIsPmModalOpen(false)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Add Team Member Modal */}
      {isMemberModalOpen && createPortal(
        <div
          onClick={() => setIsMemberModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
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
              maxWidth: '520px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              padding: '2.25rem',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#ffffff'
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
                  Team Member Provisioning
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#1e1e1e', letterSpacing: '-0.02em' }}>
                  Create Team Member
                </h2>
                <p style={{ color: '#666666', fontSize: '0.84rem', margin: '0.35rem 0 0 0' }}>
                  Provision an employee and link them to an active Role Category specialization.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666666',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#1e1e1e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#666666'; }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                backgroundColor: '#fff4f4',
                border: '1px solid #e0b4b4',
                color: '#b00020',
                padding: '0.65rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.15rem'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateMemberSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.15rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="input-field"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Dynamic Role Category Dropdown */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Professional Role Category (Skill) *
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.roleCategoryId}
                  onChange={(e) => setFormData({ ...formData, roleCategoryId: e.target.value })}
                >
                  <option value="">Select Specialization Category</option>
                  {categories.map(cat => (
                    <option key={cat.roleCategoryId} value={cat.roleCategoryId}>
                      {cat.roleCategoryName} ({cat.roleCategoryCode})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Phone
                </label>
                <input
                  type="text"
                  placeholder="+1-555-0100"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', margin: 0 }}>
                    Temporary Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, temporaryPassword: 'Dev@' + Math.floor(100 + Math.random() * 900) })}
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      color: '#2b2b2b',
                      background: '#f4f4f4',
                      border: '1px solid #d4d4d4',
                      borderRadius: '4px',
                      padding: '0.2rem 0.55rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e5e5'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f4'; }}
                  >
                    <RefreshCw size={12} />
                    <span>Generate Random</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.temporaryPassword}
                  onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                />
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #f0f0f0'
              }}>
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Team Member'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && createPortal(
        <div
          onClick={() => setIsEditModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
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
              maxWidth: '520px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              padding: '2.25rem',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#ffffff'
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
                  User Management
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#2b2b2b', letterSpacing: '-0.02em' }}>
                  Edit User Information
                </h2>
                <p style={{ color: '#666666', fontSize: '0.84rem', margin: '0.35rem 0 0 0' }}>
                  Update profile details for <strong>{editingUser?.email}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666666',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#1e1e1e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#666666'; }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div style={{
                backgroundColor: '#fff4f4',
                border: '1px solid #e0b4b4',
                color: '#b00020',
                padding: '0.65rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.15rem'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.15rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Phone
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {editingUser?.role === 'TEAM_MEMBER' && (
                <div style={{ marginBottom: '1.15rem' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Role Category Specialization
                  </label>
                  <select
                    className="input-field"
                    value={formData.roleCategoryId || ''}
                    onChange={(e) => setFormData({ ...formData, roleCategoryId: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.roleCategoryId} value={cat.roleCategoryId}>
                        {cat.roleCategoryName} ({cat.roleCategoryCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Status
                </label>
                <select
                  className="input-field"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.5rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid #f0f0f0'
              }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Password Reset Result Modal */}
      {isResetModalOpen && createPortal(
        <div
          onClick={() => setIsResetModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
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
              maxWidth: '460px',
              width: '100%',
              margin: 'auto',
              maxHeight: 'min(90vh, 720px)',
              overflowY: 'auto',
              padding: '2.25rem',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666666',
                  transition: 'background-color 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#1e1e1e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#666666'; }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#f4f4f4',
              border: '1px solid #d4d4d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <KeyRound size={24} color="#2b2b2b" />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.35rem', color: '#2b2b2b' }}>
              Temporary Password Generated
            </h2>
            <p style={{ color: '#666666', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              The password for <strong>{resetResult?.email}</strong> has been reset. The user will be required to choose a new password upon first login.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8f8f8',
              border: '1px solid #e0e0e0',
              padding: '0.9rem 1.15rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <code style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '0.05em', color: '#1e1e1e' }}>
                {resetResult?.temporaryPassword}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(resetResult?.temporaryPassword)}
                className="btn-secondary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button
              onClick={() => setIsResetModalOpen(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem' }}
            >
              Done
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UsersPage;
