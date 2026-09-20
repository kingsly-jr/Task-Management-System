import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Building2,
  Plus,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Globe,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showProvisionModal, setShowProvisionModal] = useState(false);

  // Selected / Form States
  const [selectedClient, setSelectedClient] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    country: '',
    createPortalAccount: true,
    initialPassword: '',
  });

  const [provisionPassword, setProvisionPassword] = useState('');

  useEffect(() => {
    fetchClients();
  }, [search, statusFilter]);

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      const res = await api.get('/clients', { params });
      const clientList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.content)
          ? res.data.content
          : Array.isArray(res?.content)
            ? res.content
            : [];
      setClients(clientList);
    } catch (err) {
      setError(err.message || 'Failed to fetch clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = 'Clt!';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleOpenAddModal = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      country: '',
      createPortalAccount: true,
      initialPassword: generateRandomPassword(),
    });
    setShowAddModal(true);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        country: formData.country.trim() || null,
        temporaryPassword: formData.createPortalAccount ? formData.initialPassword : null,
      };
      const res = await api.post('/clients', payload);
      setShowAddModal(false);

      if (formData.createPortalAccount) {
        setCreatedCredentials({
          companyName: payload.companyName,
          email: payload.email,
          password: payload.initialPassword,
        });
        setShowCredentialsModal(true);
      }
      fetchClients();
    } catch (err) {
      setError(err.message || 'Failed to create client');
    }
  };

  const handleOpenEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      companyName: client.companyName,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone || '',
      address: client.address || '',
      country: client.country || '',
      status: client.status,
    });
    setShowEditModal(true);
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    setError('');
    try {
      const payload = {
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        country: formData.country.trim() || null,
        status: formData.status,
      };
      await api.put(`/clients/${selectedClient.clientId}`, payload);
      setShowEditModal(false);
      fetchClients();
    } catch (err) {
      setError(err.message || 'Failed to update client');
    }
  };

  const handleOpenProvisionModal = (client) => {
    setSelectedClient(client);
    setProvisionPassword(generateRandomPassword());
    setShowProvisionModal(true);
  };

  const handleProvisionAccount = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    setError('');
    try {
      await api.post(`/clients/${selectedClient.clientId}/provision-account`, {
        password: provisionPassword,
      });
      setShowProvisionModal(false);
      setCreatedCredentials({
        companyName: selectedClient.companyName,
        email: selectedClient.email,
        password: provisionPassword,
      });
      setShowCredentialsModal(true);
      fetchClients();
    } catch (err) {
      setError(err.message || 'Failed to provision portal account');
    }
  };

  const handleDeleteClient = async (client) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove client "${client.companyName}"?`)) {
      return;
    }
    try {
      await api.delete(`/clients/${client.clientId}`);
      fetchClients();
    } catch (err) {
      setError(err.message || 'Failed to delete client');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Stats calculation
  const clientList = Array.isArray(clients) ? clients : [];
  const totalClients = clientList.length;
  const activeClients = clientList.filter((c) => c.status === 'ACTIVE').length;
  const portalAccessCount = clientList.filter((c) => c.hasPortalAccount).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2b2b2b', letterSpacing: '-0.02em', margin: 0 }}>
            Client Management
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666666' }}>
            Register client organizations, contact persons, and provision secure Client Portal access.
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
          <Plus size={16} /> Add New Client
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Total Clients</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{totalClients}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>Registered accounts</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Active Clients</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{activeClients}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>In good standing</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Portal Enabled</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.35rem' }}>{portalAccessCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#666666', marginTop: '0.2rem' }}>With client logins</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fff2f2', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '0.75rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fbfbfb', border: '1px solid #d4d4d4', borderRadius: '6px', padding: '0.45rem 0.75rem', minWidth: '280px', flex: 1 }}>
          <Search size={16} color="#8c8c8c" />
          <input
            type="text"
            placeholder="Search company, contact person, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem', color: '#2b2b2b' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: statusFilter === status ? '#2b2b2b' : '#d4d4d4',
                backgroundColor: statusFilter === status ? '#2b2b2b' : '#ffffff',
                color: statusFilter === status ? '#ffffff' : '#666666',
                transition: 'all 0.15s',
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.9rem' }}>
            Loading clients...
          </div>
        ) : clientList.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <Building2 size={36} color="#b3b3b3" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', margin: '0 0 0.25rem 0' }}>No Clients Found</h3>
            <p style={{ fontSize: '0.82rem', color: '#8c8c8c', margin: '0 0 1rem 0' }}>
              {search ? 'Try adjusting your search criteria.' : 'Get started by creating your first client organization.'}
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
                <Plus size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Add Client
              </button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid #d4d4d4', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Company & Contact</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Email & Phone</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Location</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Portal Access</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientList.map((client) => (
                  <tr key={client.clientId} style={{ borderBottom: '1px solid #ececec', transition: 'background-color 0.1s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#2b2b2b' }}>{client.companyName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#666666', marginTop: '2px' }}>{client.contactPerson}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2b2b2b' }}>
                        <Mail size={13} color="#8c8c8c" /> {client.email}
                      </div>
                      {client.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#666666', marginTop: '2px' }}>
                          <Phone size={13} color="#8c8c8c" /> {client.phone}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#4a4a4a' }}>
                        <Globe size={13} color="#8c8c8c" /> {client.country || 'Not specified'}
                      </div>
                      {client.address && (
                        <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {client.address}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      {client.hasPortalAccount ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.55rem', backgroundColor: '#eef8ee', color: '#2b8a3e', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                          <ShieldCheck size={12} /> Active Account
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenProvisionModal(client)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.55rem',
                            backgroundColor: '#f1f1f1',
                            color: '#444444',
                            border: '1px solid #d4d4d4',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <KeyRound size={12} /> Provision Login
                        </button>
                      )}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor: client.status === 'ACTIVE' ? '#2b2b2b' : '#ececec',
                          color: client.status === 'ACTIVE' ? '#ffffff' : '#666666',
                        }}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {client.hasPortalAccount && (
                          <button
                            title="Reset Portal Password"
                            onClick={() => handleOpenProvisionModal(client)}
                            style={{ padding: '0.4rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            <KeyRound size={14} color="#666666" />
                          </button>
                        )}
                        <button
                          title="Edit Client"
                          onClick={() => handleOpenEditModal(client)}
                          style={{ padding: '0.4rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} color="#666666" />
                        </button>
                        <button
                          title="Delete Client"
                          onClick={() => handleDeleteClient(client)}
                          style={{ padding: '0.4rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} color="#e03131" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: ADD CLIENT */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '520px', width: '100%', padding: '1.5rem', border: '1px solid #d4d4d4', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.5rem 0' }}>Register Client Organization</h2>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: '0 0 1.25rem 0' }}>
              Add organization details and optionally create credentials for Client Portal self-service.
            </p>

            <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Company / Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Global Industries"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Contact Person *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Connor"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Country</label>
                  <input
                    type="text"
                    placeholder="e.g. United States"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Business Address</label>
                <textarea
                  rows="2"
                  placeholder="Street address, Suite, City, Postal Code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>

              {/* Checkbox for portal account */}
              <div style={{ backgroundColor: '#f9f9f9', padding: '0.85rem', borderRadius: '6px', border: '1px solid #e5e5e5' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b' }}>
                  <input
                    type="checkbox"
                    checked={formData.createPortalAccount}
                    onChange={(e) => setFormData({ ...formData, createPortalAccount: e.target.checked })}
                    style={{ accentColor: '#2b2b2b', width: '16px', height: '16px' }}
                  />
                  Provision Client Portal login account automatically
                </label>
                {formData.createPortalAccount && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666666' }}>Temporary Password</label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, initialPassword: generateRandomPassword() })}
                        style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: '#2b2b2b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      >
                        <RefreshCw size={11} /> Regenerate
                      </button>
                    </div>
                    <input
                      type="text"
                      required={formData.createPortalAccount}
                      value={formData.initialPassword}
                      onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.3rem' }}>
                      Client will be required to change this password upon first login.
                    </div>
                  </div>
                )}
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
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CLIENT */}
      {showEditModal && selectedClient && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '500px', width: '100%', padding: '1.5rem', border: '1px solid #d4d4d4' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.5rem 0' }}>Edit Client Details</h2>
            <form onSubmit={handleUpdateClient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
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
        </div>
      )}

      {/* MODAL: PROVISION / RESET PORTAL ACCOUNT */}
      {showProvisionModal && selectedClient && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '440px', width: '100%', padding: '1.5rem', border: '1px solid #d4d4d4' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.5rem 0' }}>
              {selectedClient.hasPortalAccount ? 'Reset Client Portal Password' : 'Enable Client Portal Access'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: '0 0 1rem 0' }}>
              Generate credentials for <strong>{selectedClient.companyName}</strong> ({selectedClient.email}).
            </p>

            <form onSubmit={handleProvisionAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2b2b2b' }}>Temporary Password</label>
                  <button
                    type="button"
                    onClick={() => setProvisionPassword(generateRandomPassword())}
                    style={{ background: 'none', border: 'none', fontSize: '0.72rem', color: '#2b2b2b', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <RefreshCw size={11} /> Regenerate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={provisionPassword}
                  onChange={(e) => setProvisionPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowProvisionModal(false)}
                  style={{ padding: '0.55rem 1rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', color: '#666666', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.55rem 1.25rem', backgroundColor: '#2b2b2b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save & Issue Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREDENTIALS SUMMARY (POST CREATION / RESET) */}
      {showCredentialsModal && createdCredentials && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '1rem' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', maxWidth: '460px', width: '100%', padding: '1.75rem', border: '1px solid #d4d4d4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2b8a3e', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={22} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>Client Credentials Generated</h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666666', margin: '0 0 1.25rem 0' }}>
              Please copy these temporary credentials and deliver them securely to the client. The client must change their password on first sign-in.
            </p>

            <div style={{ backgroundColor: '#fbfbfb', border: '1px solid #d4d4d4', borderRadius: '6px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Organization</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2b2b2b' }}>{createdCredentials.companyName}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Login Email</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2b2b2b' }}>{createdCredentials.email}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Temporary Password</span>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2b2b2b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {createdCredentials.password}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `TaskFlow Client Portal Login:\nURL: http://localhost:5173/login\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.password}`
                  )
                }
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.55rem 0.95rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d4d4d4',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#2b2b2b',
                }}
              >
                {copied ? <Check size={14} color="#2b8a3e" /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
              </button>

              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                style={{
                  padding: '0.55rem 1.25rem',
                  backgroundColor: '#2b2b2b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
