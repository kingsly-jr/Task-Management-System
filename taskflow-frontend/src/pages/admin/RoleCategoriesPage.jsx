import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import {
  Tags,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  RefreshCw,
  Users,
  X
} from 'lucide-react';

const RoleCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Lock body scroll when either modal is open
  useEffect(() => {
    if (isCreateModalOpen || isEditModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateModalOpen, isEditModalOpen]);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCategories = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/role-categories');
      setCategories(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load role categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (name, isNew = true) => {
    setFormName(name);
    if (isNew) {
      // Auto slugify code
      const slug = name.toUpperCase().trim().replace(/[^A-Z0-9]+/g, '_');
      setFormCode(slug);
    }
  };

  const handleOpenCreate = () => {
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormStatus('ACTIVE');
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.roleCategoryName);
    setFormCode(cat.roleCategoryCode);
    setFormDesc(cat.description || '');
    setFormStatus(cat.status);
    setFormError('');
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/role-categories', {
        roleCategoryName: formName,
        roleCategoryCode: formCode,
        description: formDesc,
        status: formStatus
      });
      setIsCreateModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.put(`/role-categories/${editingCategory.roleCategoryId}`, {
        roleCategoryName: formName,
        description: formDesc,
        status: formStatus
      });
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      await api.patch(`/role-categories/${cat.roleCategoryId}/status`);
      fetchCategories();
    } catch (err) {
      alert(err.message || 'Could not change category status');
    }
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.roleCategoryName.toLowerCase().includes(search.toLowerCase()) ||
                          c.roleCategoryCode.toLowerCase().includes(search.toLowerCase()) ||
                          (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
            Role Categories Management
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem' }}>
            Configure dynamic technical specializations (Full Stack, UI/UX, QA, DevOps) for team member assignment.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <Plus size={16} /> Create Role Category
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
            <input
              type="text"
              placeholder="Search category by name, code or description..."
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={16} color="#8c8c8c" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#f4f4f4', padding: '0.25rem', borderRadius: '6px' }}>
            {['ALL', 'ACTIVE', 'INACTIVE'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  backgroundColor: statusFilter === status ? '#ffffff' : 'transparent',
                  color: statusFilter === status ? '#2b2b2b' : '#666666',
                  boxShadow: statusFilter === status ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error alert */}
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

      {/* Categories Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#fbfbfb', borderBottom: '1px solid #d4d4d4' }}>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>CATEGORY NAME</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>SYSTEM CODE</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>DESCRIPTION</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>ASSIGNED USERS</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em' }}>STATUS</th>
              <th style={{ padding: '0.9rem 1.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#666666', letterSpacing: '0.04em', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
                  Loading role categories...
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
                  No role categories match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.roleCategoryId} style={{ borderBottom: '1px solid #e5e5e5', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#2b2b2b', fontSize: '0.92rem' }}>
                      {cat.roleCategoryName}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <code style={{
                      backgroundColor: '#f4f4f4',
                      border: '1px solid #d4d4d4',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#2b2b2b'
                    }}>
                      {cat.roleCategoryCode}
                    </code>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#666666', maxWidth: '300px' }}>
                    {cat.description || <span style={{ color: '#b3b3b3' }}>—</span>}
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b' }}>
                      <Users size={14} color="#8c8c8c" />
                      <span>{cat.assignedUsersCount} active</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span className={`badge ${cat.status === 'ACTIVE' ? 'badge-dark' : 'badge-subtle'}`}>
                      {cat.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        title="Edit Category"
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        title={cat.status === 'ACTIVE' ? 'Deactivate Category' : 'Activate Category'}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                      >
                        {cat.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && createPortal(
        <div
          onClick={() => setIsCreateModalOpen(false)}
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
                  Governance & Organization
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#1e1e1e', letterSpacing: '-0.02em' }}>
                  Create Role Category
                </h2>
                <p style={{ color: '#666666', fontSize: '0.84rem', margin: '0.35rem 0 0 0' }}>
                  Add a new technical specialization category for company employees.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
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

            {formError && (
              <div style={{
                backgroundColor: '#fff4f4',
                border: '1px solid #e0b4b4',
                color: '#b00020',
                padding: '0.65rem 0.9rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Solutions Architect"
                  className="input-field"
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value, true)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Category Code (UPPERCASE_IDENTIFIER) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CLOUD_ARCHITECT"
                  className="input-field"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Responsibilities and skill requirements..."
                  className="input-field"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Modal */}
      {isEditModalOpen && createPortal(
        <div
          onClick={() => setIsEditModalOpen(false)}
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
                  Category Modification
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#1e1e1e', letterSpacing: '-0.02em' }}>
                  Edit Role Category
                </h2>
                <p style={{ color: '#666666', fontSize: '0.84rem', margin: '0.35rem 0 0 0' }}>
                  Update description or category naming for <strong>{editingCategory?.roleCategoryCode}</strong>.
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
                  color: '#8c8c8c'
                }}
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
                marginBottom: '1rem'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Status
                </label>
                <select
                  className="input-field"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Description
                </label>
                <textarea
                  rows="3"
                  className="input-field"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
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
    </div>
  );
};

export default RoleCategoriesPage;
