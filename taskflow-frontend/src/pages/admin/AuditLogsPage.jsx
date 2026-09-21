import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import {
  History,
  Search,
  Filter,
  Download,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Clock,
  Layers,
  Calendar,
  X,
  ArrowUpDown,
  Lock,
  Server,
  UserCheck
} from 'lucide-react';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, authEvents: 0, mutationEvents: 0, securityAlerts: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Selected Log for Inspector Modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Lock body scroll when inspector modal is open
  useEffect(() => {
    if (selectedLog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedLog]);

  const fetchLogs = async (pageNum = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (moduleFilter !== 'ALL') params.append('module', moduleFilter);
      if (actionFilter !== 'ALL') params.append('action', actionFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      params.append('page', pageNum);
      params.append('size', 15);

      const [logsRes, statsRes] = await Promise.all([
        api.get(`/audit-logs?${params.toString()}`).catch(() => ({ data: null })),
        api.get('/audit-logs/stats').catch(() => ({ data: null }))
      ]);

      if (logsRes && logsRes.data) {
        setLogs(logsRes.data.content || []);
        setTotalPages(logsRes.data.totalPages || 1);
        setTotalElements(logsRes.data.totalElements || 0);
      } else {
        setLogs([]);
      }

      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(0);
  }, [moduleFilter, actionFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchLogs(0);
  };

  const handleResetFilters = () => {
    setSearch('');
    setModuleFilter('ALL');
    setActionFilter('ALL');
    setStatusFilter('ALL');
    setPage(0);
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('taskflow_token');
      const response = await fetch(
        `http://localhost:8080/api/v1/audit-logs/export?module=${moduleFilter}&action=${actionFilter}&status=${statusFilter}&search=${encodeURIComponent(search)}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!response.ok) throw new Error('Export request failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
      // Fallback CSV generator from current logs
      const csvContent = "data:text/csv;charset=utf-8," +
        "ID,Timestamp,Actor,Role,Module,Action,Target,Status,Details\n" +
        logs.map(l => `"${l.id}","${l.timestamp}","${l.actorEmail}","${l.actorRole}","${l.module}","${l.action}","${l.targetEntity || ''} #${l.targetId || ''}","${l.status}","${(l.details || '').replace(/"/g, '""')}"`).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `taskflow_audit_logs_fallback_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setExporting(false);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taskflow_audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getModuleBadge = (module) => {
    switch (module) {
      case 'AUTH':
        return { bg: '#e6f4ea', color: '#137333', label: 'AUTH' };
      case 'USER_MGMT':
        return { bg: '#e8f0fe', color: '#1a73e8', label: 'USERS' };
      case 'ROLE_MGMT':
        return { bg: '#f3e8fd', color: '#7627bb', label: 'ROLES' };
      case 'CLIENT_MGMT':
        return { bg: '#e0f2fe', color: '#0369a1', label: 'CLIENTS' };
      case 'PROJECT_MGMT':
        return { bg: '#fef3c7', color: '#b45309', label: 'PROJECTS' };
      case 'SECURITY':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'SECURITY' };
      default:
        return { bg: '#f3f4f6', color: '#374151', label: module || 'SYSTEM' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: '#e6f4ea',
            color: '#137333'
          }}>
            <CheckCircle2 size={12} /> SUCCESS
          </span>
        );
      case 'WARNING':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: '#fef3c7',
            color: '#b45309'
          }}>
            <AlertTriangle size={12} /> WARNING
          </span>
        );
      case 'FAILED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.2rem 0.55rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            backgroundColor: '#fee2e2',
            color: '#b91c1c'
          }}>
            <XCircle size={12} /> FAILED
          </span>
        );
      default:
        return <span style={{ fontSize: '0.75rem', color: '#666' }}>{status}</span>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 0.5rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <div style={{
              padding: '0.4rem',
              backgroundColor: '#2b2b2b',
              color: '#ffffff',
              borderRadius: '6px',
              display: 'flex'
            }}>
              <History size={18} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', margin: 0 }}>
              Audit & Governance Logs
            </h1>
          </div>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Immutable chronological audit trail recording user authentication, administrative mutations, and platform security events.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => fetchLogs(page)}
            disabled={loading}
            className="btn-secondary"
            title="Refresh logs"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleExportJson}
            className="btn-secondary"
            title="Export JSON audit trace"
          >
            <FileText size={15} />
            JSON
          </button>
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="btn-primary"
            title="Export full CSV"
          >
            <Download size={15} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Total Events</span>
            <div style={{ padding: '0.4rem', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#2b2b2b' }}>
              <Layers size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.25rem' }}>
            {stats.totalEvents || totalElements || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>Logged across all modules</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Auth Sessions</span>
            <div style={{ padding: '0.4rem', backgroundColor: '#e6f4ea', borderRadius: '6px', color: '#137333' }}>
              <Lock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#137333', marginBottom: '0.25rem' }}>
            {stats.authEvents || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>Logins & token validations</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Admin Mutations</span>
            <div style={{ padding: '0.4rem', backgroundColor: '#e8f0fe', borderRadius: '6px', color: '#1a73e8' }}>
              <UserCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1a73e8', marginBottom: '0.25rem' }}>
            {stats.mutationEvents || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>Entity creates, updates, deletes</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Security &amp; Alerts</span>
            <div style={{ padding: '0.4rem', backgroundColor: '#fee2e2', borderRadius: '6px', color: '#b91c1c' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#b91c1c', marginBottom: '0.25rem' }}>
            {stats.securityAlerts || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>Warnings and failed events</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Keyword Search */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by actor, description, IP, or target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.4rem', width: '100%' }}
            />
          </div>

          {/* Module Filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="input-field"
              value={moduleFilter}
              onChange={(e) => { setModuleFilter(e.target.value); setPage(0); }}
            >
              <option value="ALL">All Modules</option>
              <option value="AUTH">Authentication</option>
              <option value="USER_MGMT">User Management</option>
              <option value="ROLE_MGMT">Role Categories</option>
              <option value="CLIENT_MGMT">Clients</option>
              <option value="PROJECT_MGMT">Projects</option>
              <option value="SECURITY">Security</option>
              <option value="SYSTEM">System Engine</option>
            </select>
          </div>

          {/* Action Filter */}
          <div style={{ minWidth: '140px' }}>
            <select
              className="input-field"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">LOGIN</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="PASSWORD_CHANGE">PASSWORD_CHANGE</option>
              <option value="STATUS_CHANGE">STATUS_CHANGE</option>
              <option value="PROVISION">PROVISION</option>
              <option value="INITIALIZE">INITIALIZE</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '130px' }}>
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            >
              <option value="ALL">All Status</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
            Search
          </button>

          {(search || moduleFilter !== 'ALL' || actionFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn-secondary"
              style={{ padding: '0.65rem 1rem' }}
            >
              <X size={15} /> Reset
            </button>
          )}
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2b2b2b' }}>
            Audit Activity Trail ({totalElements} recorded)
          </div>
          <div style={{ fontSize: '0.78rem', color: '#8c8c8c', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} /> Server Time: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto' }} />
            <div>Loading audit trail records...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#8c8c8c' }}>
            <History size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
              No audit logs matched your query
            </div>
            <p style={{ fontSize: '0.85rem', color: '#666666', maxWidth: '400px', margin: '0 auto 1rem auto' }}>
              Try adjusting your search criteria or resetting filters to view all system activity events.
            </p>
            <button onClick={handleResetFilters} className="btn-secondary">
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e5e5', backgroundColor: '#f9f9f9', color: '#666666', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>ID &amp; Time</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Actor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Module &amp; Action</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Target</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Event Description</th>
                  <th style={{ padding: '0.75rem 1rem' }}>IP Address</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const mod = getModuleBadge(log.module);
                  return (
                    <tr
                      key={log.id}
                      style={{ borderBottom: '1px solid #f0f0f0', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* ID & Time */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 700, color: '#2b2b2b' }}>#{log.id}</div>
                        <div style={{ fontSize: '0.72rem', color: '#8c8c8c' }} title={log.timestamp}>
                          {formatRelativeTime(log.timestamp)}
                        </div>
                      </td>

                      {/* Actor */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #d4d4d4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            color: '#2b2b2b',
                            flexShrink: 0
                          }}>
                            {log.actorEmail ? log.actorEmail.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#2b2b2b', fontSize: '0.82rem' }}>
                              {log.actorEmail}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#8c8c8c', textTransform: 'uppercase' }}>
                              {log.actorRole || 'SYSTEM'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Module & Action */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            backgroundColor: mod.bg,
                            color: mod.color
                          }}>
                            {mod.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555' }}>
                            {log.action}
                          </span>
                        </div>
                      </td>

                      {/* Target */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        {log.targetEntity ? (
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: '#2b2b2b',
                            backgroundColor: '#f4f4f4',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px'
                          }}>
                            {log.targetEntity} {log.targetId ? `#${log.targetId}` : ''}
                          </span>
                        ) : (
                          <span style={{ color: '#aaa', fontSize: '0.78rem' }}>-</span>
                        )}
                      </td>

                      {/* Description */}
                      <td style={{ padding: '0.85rem 1rem', maxWidth: '320px' }}>
                        <div style={{
                          color: '#444',
                          fontSize: '0.82rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }} title={log.details}>
                          {log.details || '-'}
                        </div>
                      </td>

                      {/* IP */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap', fontSize: '0.78rem', color: '#666' }}>
                        <code>{log.ipAddress || '127.0.0.1'}</code>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        {getStatusBadge(log.status)}
                      </td>

                      {/* Inspect */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Inspect raw details"
                        >
                          <Eye size={13} /> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#666' }}>
              Showing page <strong>{page + 1}</strong> of <strong>{totalPages}</strong> ({totalElements} events)
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => { const p = Math.max(0, page - 1); setPage(p); fetchLogs(p); }}
                disabled={page === 0}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Previous
              </button>
              <button
                onClick={() => { const p = Math.min(totalPages - 1, page + 1); setPage(p); fetchLogs(p); }}
                disabled={page >= totalPages - 1}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inspector Modal */}
      {selectedLog && createPortal(
        <div
          onClick={() => setSelectedLog(null)}
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
              width: '100%',
              maxWidth: '650px',
              margin: 'auto',
              maxHeight: 'min(90vh, 760px)',
              overflowY: 'auto',
              padding: 0,
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#ffffff'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e5e5e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafafa',
              borderTopLeftRadius: '14px',
              borderTopRightRadius: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  padding: '0.4rem',
                  backgroundColor: '#2b2b2b',
                  color: '#ffffff',
                  borderRadius: '6px',
                  display: 'flex'
                }}>
                  <History size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                    Audit Event #{selectedLog.id}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                    {selectedLog.timestamp ? new Date(selectedLog.timestamp).toUTCString() : '-'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0.4rem',
                  borderRadius: '6px'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Event Attributes Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                backgroundColor: '#fbfbfb',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e5e5e5'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#8c8c8c', textTransform: 'uppercase', fontWeight: 700 }}>Actor</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b', marginTop: '0.2rem' }}>
                    {selectedLog.actorEmail}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#666' }}>Role: {selectedLog.actorRole || 'SYSTEM'}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#8c8c8c', textTransform: 'uppercase', fontWeight: 700 }}>Action &amp; Status</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#2b2b2b' }}>{selectedLog.action}</span>
                    {getStatusBadge(selectedLog.status)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#666' }}>Module: {selectedLog.module}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#8c8c8c', textTransform: 'uppercase', fontWeight: 700 }}>Target Entity</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b', marginTop: '0.2rem' }}>
                    {selectedLog.targetEntity ? `${selectedLog.targetEntity} #${selectedLog.targetId || ''}` : 'None'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#8c8c8c', textTransform: 'uppercase', fontWeight: 700 }}>Network Origin</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b', marginTop: '0.2rem' }}>
                    <code>{selectedLog.ipAddress || '127.0.0.1'}</code>
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Event Details
                </label>
                <div style={{
                  padding: '0.85rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d4d4d4',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#2b2b2b',
                  lineHeight: 1.5
                }}>
                  {selectedLog.details || 'No extended description recorded.'}
                </div>
              </div>

              {/* Raw Metadata JSON */}
              {selectedLog.metadataJson && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Metadata Payload (JSON)
                  </label>
                  <pre style={{
                    padding: '0.85rem',
                    backgroundColor: '#1e1e1e',
                    color: '#d4d4d4',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    margin: 0
                  }}>
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(selectedLog.metadataJson), null, 2);
                      } catch {
                        return selectedLog.metadataJson;
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e5e5',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: '#fafafa',
              borderBottomLeftRadius: '14px',
              borderBottomRightRadius: '14px'
            }}>
              <button
                onClick={() => setSelectedLog(null)}
                className="btn-primary"
                style={{ padding: '0.5rem 1.25rem' }}
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AuditLogsPage;
