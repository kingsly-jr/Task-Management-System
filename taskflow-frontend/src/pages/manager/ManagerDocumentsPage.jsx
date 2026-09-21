import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/client';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  History,
  CheckCircle2,
  FolderKanban,
  File,
  FileCode,
  FileSpreadsheet,
  Image,
  Archive,
  Eye,
  EyeOff,
  Plus,
  X,
  Clock,
  HardDrive
} from 'lucide-react';

const CATEGORIES = [
  { key: 'ALL', label: 'All Documents' },
  { key: 'CONTRACT', label: 'Contracts' },
  { key: 'REQUIREMENTS', label: 'Requirements' },
  { key: 'DESIGN_SPEC', label: 'Design Specs' },
  { key: 'ARCHITECTURE', label: 'Architecture' },
  { key: 'DELIVERABLE', label: 'Deliverables' },
  { key: 'MEETING_NOTES', label: 'Meeting Notes' },
  { key: 'RELEASE_NOTES', label: 'Release Notes' },
  { key: 'OTHER', label: 'Other Files' }
];

const getFileIcon = (ext) => {
  const e = (ext || '').toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'].includes(e)) return Image;
  if (['.zip', '.tar', '.gz', '.rar', '.7z'].includes(e)) return Archive;
  if (['.xls', '.xlsx', '.csv'].includes(e)) return FileSpreadsheet;
  if (['.js', '.jsx', '.ts', '.tsx', '.java', '.py', '.json', '.sql', '.html', '.css'].includes(e)) return FileCode;
  return FileText;
};

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const ManagerDocumentsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ totalDocuments: 0, totalBytes: 0, totalSizeFormatted: '0 B', categoryCounts: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('CONTRACT');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadClientVisible, setUploadClientVisible] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // New Version Modal State
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedDocForVersion, setSelectedDocForVersion] = useState(null);
  const [versionFile, setVersionFile] = useState(null);
  const [versionChangeLog, setVersionChangeLog] = useState('');
  const [versionUploading, setVersionUploading] = useState(false);
  const versionFileInputRef = useRef(null);
  const [isVersionDragging, setIsVersionDragging] = useState(false);

  // Detail & History Modal State
  const [selectedDocDetail, setSelectedDocDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchDocuments();
      fetchStats(selectedProjectId);
    }
  }, [selectedProjectId, categoryFilter, search]);

  useEffect(() => {
    if (isUploadModalOpen || isVersionModalOpen || selectedDocDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isUploadModalOpen, isVersionModalOpen, selectedDocDetail]);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setProjects(list);
      if (list.length > 0) {
        setSelectedProjectId(list[0].projectId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.get(`/projects/${selectedProjectId}/documents`, { params });
      setDocuments(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (projId) => {
    try {
      const res = await api.get(`/projects/${projId}/documents/stats`);
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const res = await api.get(`/documents/${documentId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download document: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setError('Please select a file to upload');
      return;
    }
    if (!uploadTitle.trim()) {
      setError('Document title is required');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim());
      formData.append('category', uploadCategory);
      formData.append('description', uploadDescription);
      formData.append('isClientVisible', uploadClientVisible);

      await api.post(`/projects/${selectedProjectId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('Document uploaded successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      fetchDocuments();
      fetchStats(selectedProjectId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleVersionSubmit = async (e) => {
    e.preventDefault();
    if (!versionFile || !selectedDocForVersion) {
      setError('Please select a file revision');
      return;
    }

    setVersionUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', versionFile);
      formData.append('changeLog', versionChangeLog.trim());

      await api.post(`/documents/${selectedDocForVersion.documentId}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg(`New version uploaded for ${selectedDocForVersion.title}!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setIsVersionModalOpen(false);
      setSelectedDocForVersion(null);
      setVersionFile(null);
      setVersionChangeLog('');
      fetchDocuments();
      fetchStats(selectedProjectId);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to upload revision');
    } finally {
      setVersionUploading(false);
    }
  };

  const openHistoryModal = async (docId) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/documents/${docId}`);
      setSelectedDocDetail(res.data);
    } catch (err) {
      setError('Failed to load version history');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.delete(`/documents/${docId}`);
      setSuccessMsg(`Document "${title}" deleted.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchDocuments();
      fetchStats(selectedProjectId);
    } catch (err) {
      setError('Failed to delete document: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
            Project Documents &amp; Digital Assets
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Centralized document repository with version archiving, client confidentiality controls, and direct binary downloads.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="form-control"
              style={{ padding: '0.5rem 0.85rem', fontSize: '0.88rem', fontWeight: 600, minWidth: '220px' }}
            >
              {projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectCode} — {p.projectName}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 1.15rem' }}
          >
            <Upload size={16} /> Upload Document
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', color: '#c92a2a', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#ebfbee', border: '1px solid #b2f2bb', color: '#2b8a3e', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          {successMsg}
        </div>
      )}

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.15rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Total Documents
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>
            {stats.totalDocuments}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>All project files</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Storage Used
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>
            {stats.totalSizeFormatted}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Local disk storage</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Contracts &amp; Specs
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2b2b2b' }}>
            {(stats.categoryCounts?.CONTRACT || 0) + (stats.categoryCounts?.REQUIREMENTS || 0)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Legal &amp; scope assets</div>
        </div>

        <div className="card" style={{ padding: '1.15rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Client Deliverables
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0ca678' }}>
            {(stats.categoryCounts?.DELIVERABLE || 0) + (stats.categoryCounts?.RELEASE_NOTES || 0)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.2rem' }}>Release assets</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="card" style={{ padding: '1.15rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategoryFilter(c.key)}
              className={categoryFilter === c.key ? 'btn btn-primary' : 'btn btn-secondary'}
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c' }} />
          <input
            type="text"
            placeholder="Search by title or filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="card" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.9rem' }}>
            Loading project documents...
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
            <FileText size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
              No Documents Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
              {categoryFilter !== 'ALL' ? `No documents in category "${categoryFilter}"` : 'Upload your first contract, spec sheet, or deliverable asset.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {documents.map((doc) => {
              const IconComponent = getFileIcon(doc.fileExtension);
              return (
                <div
                  key={doc.documentId}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    padding: '1.25rem',
                    backgroundColor: '#fafafa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, minWidth: '280px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '6px',
                      backgroundColor: '#f0f0f0',
                      border: '1px solid #d4d4d4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComponent size={22} color="#2b2b2b" />
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                          {doc.title}
                        </h3>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', backgroundColor: '#2b2b2b', color: '#ffffff', borderRadius: '4px' }}>
                          v{doc.version}
                        </span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', backgroundColor: '#f0f0f0', color: '#4d4d4d', borderRadius: '4px', border: '1px solid #d4d4d4' }}>
                          {doc.category}
                        </span>
                        {doc.clientVisible ? (
                          <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#0ca678', fontWeight: 600 }}>
                            <Eye size={12} /> Client Visible
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#8c8c8c', fontWeight: 600 }}>
                            <EyeOff size={12} /> Internal Only
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#666666', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <span>File: <strong>{doc.fileName}</strong></span>
                        <span>Size: <strong>{doc.fileSizeFormatted}</strong></span>
                        <span>Uploaded by: <strong>{doc.uploadedByName}</strong></span>
                        <span>Date: <strong>{new Date(doc.createdAt).toLocaleDateString()}</strong></span>
                      </div>

                      {doc.description && (
                        <p style={{ fontSize: '0.82rem', color: '#4d4d4d', margin: '0.4rem 0 0', lineHeight: 1.4 }}>
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleDownload(doc.documentId, doc.fileName)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Download size={14} /> Download
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDocForVersion(doc);
                        setIsVersionModalOpen(true);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Upload size={14} /> New Version
                    </button>

                    <button
                      onClick={() => openHistoryModal(doc.documentId)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      title="Version History"
                    >
                      <History size={14} />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.documentId, doc.title)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', color: '#c92a2a' }}
                      title="Delete Document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {isUploadModalOpen && createPortal(
        <div
          onClick={() => setIsUploadModalOpen(false)}
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
            className="card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '580px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem 2.25rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Upload size={20} color="#1e1e1e" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1e1e', margin: 0, letterSpacing: '-0.01em' }}>
                    Upload Project Document
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#666666', margin: '0.2rem 0 0 0' }}>
                    Attach specifications, deliverables, contracts, or architecture files to this workspace.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c', padding: '0.25rem', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* File Dropzone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Select File <span style={{ color: '#c92a2a' }}>*</span>
                </label>

                {!uploadFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const f = e.dataTransfer.files[0];
                      if (f) {
                        setUploadFile(f);
                        if (!uploadTitle) setUploadTitle(f.name.replace(/\.[^/.]+$/, ''));
                      }
                    }}
                    style={{
                      border: isDragging ? '2px dashed #1e1e1e' : '2px dashed #d4d4d4',
                      backgroundColor: isDragging ? '#f5f5f5' : '#fcfcfc',
                      borderRadius: '10px',
                      padding: '1.75rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={20} color="#444444" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1e1e' }}>
                        Click to browse
                      </span>
                      <span style={{ fontSize: '0.88rem', color: '#666666' }}> or drag and drop file here</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                      Supports PDF, DOCX, XLSX, Images, ZIP, Source Code (up to 50 MB)
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) {
                          setUploadFile(f);
                          if (!uploadTitle) setUploadTitle(f.name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f8fbf9',
                    border: '1px solid #b2f2bb',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e6fcf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {React.createElement(getFileIcon(uploadFile.name.slice(uploadFile.name.lastIndexOf('.'))), { size: 20, color: '#0ca678' })}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1e1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {uploadFile.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                          {formatBytes(uploadFile.size)} • Ready to upload
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e1e1e', padding: '0.35rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', backgroundColor: '#ffffff' }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        style={{ padding: '0.35rem', color: '#8c8c8c', border: 'none', background: 'none', cursor: 'pointer' }}
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) {
                          setUploadFile(f);
                          if (!uploadTitle) setUploadTitle(f.name.replace(/\.[^/.]+$/, ''));
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Document Display Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Document Display Title <span style={{ color: '#c92a2a' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Service Agreement 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '0.65rem 0.85rem' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#8c8c8c', marginTop: '0.25rem', display: 'block' }}>
                  Friendly title shown in document lists and client stakeholder portals.
                </span>
              </div>

              {/* Category & Visibility Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Document Category <span style={{ color: '#c92a2a' }}>*</span>
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="form-control"
                    style={{ width: '100%', height: '46px', fontSize: '0.88rem', padding: '0.55rem 0.85rem' }}
                  >
                    {CATEGORIES.filter(c => c.key !== 'ALL').map(c => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                    Client Portal Visibility
                  </label>
                  <div
                    onClick={() => setUploadClientVisible(!uploadClientVisible)}
                    style={{
                      height: '46px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 0.85rem',
                      borderRadius: '6px',
                      border: uploadClientVisible ? '1px solid #b2f2bb' : '1px solid #d4d4d4',
                      backgroundColor: uploadClientVisible ? '#f8fbf9' : '#fafafa',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {uploadClientVisible ? <Eye size={16} color="#0ca678" /> : <EyeOff size={16} color="#8c8c8c" />}
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: uploadClientVisible ? '#1e1e1e' : '#666666' }}>
                        {uploadClientVisible ? 'Visible in Client Portal' : 'Internal Team Only'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={uploadClientVisible}
                      onChange={() => {}}
                      style={{ accentColor: '#2b2b2b', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Description / Deliverable Notes <span style={{ fontWeight: 400, color: '#8c8c8c' }}>(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary, version notes, or client deliverable sign-off notes..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '0.65rem 0.85rem', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid #e5e5e5', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.35rem', fontSize: '0.86rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="btn btn-primary"
                  style={{
                    padding: '0.6rem 1.6rem',
                    fontSize: '0.86rem',
                    opacity: (uploading || !uploadFile) ? 0.7 : 1,
                    cursor: (uploading || !uploadFile) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Save & Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Upload New Version Modal */}
      {isVersionModalOpen && selectedDocForVersion && createPortal(
        <div
          onClick={() => setIsVersionModalOpen(false)}
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
            className="card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem 2.25rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <History size={20} color="#1e1e1e" />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    REVISION UPDATE
                  </div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1e1e', margin: '0.1rem 0 0 0' }}>
                    Upload v{selectedDocForVersion.version + 1} for "{selectedDocForVersion.title}"
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVersionModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c', padding: '0.25rem', display: 'flex' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVersionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* File Dropzone */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Select Replacement File <span style={{ color: '#c92a2a' }}>*</span>
                </label>

                {!versionFile ? (
                  <div
                    onClick={() => versionFileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsVersionDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsVersionDragging(false); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsVersionDragging(false);
                      const f = e.dataTransfer.files[0];
                      if (f) setVersionFile(f);
                    }}
                    style={{
                      border: isVersionDragging ? '2px dashed #1e1e1e' : '2px dashed #d4d4d4',
                      backgroundColor: isVersionDragging ? '#f5f5f5' : '#fcfcfc',
                      borderRadius: '10px',
                      padding: '1.75rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={20} color="#444444" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1e1e' }}>
                        Click to browse replacement file
                      </span>
                      <span style={{ fontSize: '0.88rem', color: '#666666' }}> or drag and drop here</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                      Replaces active download while preserving v{selectedDocForVersion.version} in audit archive
                    </span>
                    <input
                      ref={versionFileInputRef}
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) setVersionFile(f);
                      }}
                    />
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#f8fbf9',
                    border: '1px solid #b2f2bb',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e6fcf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {React.createElement(getFileIcon(versionFile.name.slice(versionFile.name.lastIndexOf('.'))), { size: 20, color: '#0ca678' })}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1e1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {versionFile.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                          {formatBytes(versionFile.size)} • New revision v{selectedDocForVersion.version + 1}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => versionFileInputRef.current?.click()}
                        style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e1e1e', padding: '0.35rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', backgroundColor: '#ffffff' }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => { setVersionFile(null); if (versionFileInputRef.current) versionFileInputRef.current.value = ''; }}
                        style={{ padding: '0.35rem', color: '#8c8c8c', border: 'none', background: 'none', cursor: 'pointer' }}
                        title="Remove file"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <input
                      ref={versionFileInputRef}
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const f = e.target.files[0];
                        if (f) setVersionFile(f);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Changelog */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
                  Changelog / Revision Notes <span style={{ color: '#c92a2a' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what changed in this version (e.g. Revised SLA clauses, updated milestone schedules, or new deliverables matrix)..."
                  value={versionChangeLog}
                  onChange={(e) => setVersionChangeLog(e.target.value)}
                  className="form-control"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '0.65rem 0.85rem', minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid #e5e5e5', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsVersionModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.6rem 1.35rem', fontSize: '0.86rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={versionUploading || !versionFile}
                  className="btn btn-primary"
                  style={{
                    padding: '0.6rem 1.6rem',
                    fontSize: '0.86rem',
                    opacity: (versionUploading || !versionFile) ? 0.7 : 1,
                    cursor: (versionUploading || !versionFile) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {versionUploading ? 'Uploading...' : `Upload v${selectedDocForVersion.version + 1}`}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Version History Modal */}
      {selectedDocDetail && createPortal(
        <div
          onClick={() => setSelectedDocDetail(null)}
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
            className="card animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '2rem',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #d4d4d4', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666666' }}>DOCUMENT AUDIT ARCHIVE</div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                  {selectedDocDetail.title} — Version History
                </h2>
              </div>
              <button onClick={() => setSelectedDocDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Current Active Version */}
              <div style={{ padding: '1rem', backgroundColor: '#fafafa', border: '1px solid #2b2b2b', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#2b2b2b', color: '#ffffff', borderRadius: '4px' }}>
                      v{selectedDocDetail.version} (CURRENT)
                    </span>
                    <strong style={{ fontSize: '0.9rem', color: '#2b2b2b' }}>{selectedDocDetail.fileName}</strong>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#666666' }}>{selectedDocDetail.fileSizeFormatted}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                  Uploaded by {selectedDocDetail.uploadedByName} on {new Date(selectedDocDetail.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Historical Versions */}
              {selectedDocDetail.versions && selectedDocDetail.versions.length > 0 ? (
                selectedDocDetail.versions.map((v) => (
                  <div key={v.versionId} style={{ padding: '1rem', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#f0f0f0', color: '#4d4d4d', borderRadius: '4px', border: '1px solid #d4d4d4' }}>
                          v{v.versionNumber}
                        </span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2b2b2b' }}>{v.fileName}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#666666' }}>{v.fileSizeFormatted}</span>
                    </div>
                    {v.changeLog && (
                      <p style={{ fontSize: '0.82rem', color: '#4d4d4d', margin: '0.3rem 0', fontStyle: 'italic' }}>
                        "{v.changeLog}"
                      </p>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                      Archived by {v.uploadedByName} on {new Date(v.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#8c8c8c', fontSize: '0.85rem' }}>
                  This document is on its initial version (no prior revisions).
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #d4d4d4', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedDocDetail(null)} className="btn btn-secondary">
                Close Archive
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ManagerDocumentsPage;
