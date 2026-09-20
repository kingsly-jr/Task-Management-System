import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  FileText,
  Download,
  Search,
  Filter,
  History,
  FolderKanban,
  FileCode,
  FileSpreadsheet,
  Image,
  Archive,
  Eye,
  X,
  ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
  { key: 'ALL', label: 'All Files' },
  { key: 'CONTRACT', label: 'Contracts' },
  { key: 'REQUIREMENTS', label: 'Requirements' },
  { key: 'DESIGN_SPEC', label: 'Design Specs' },
  { key: 'DELIVERABLE', label: 'Deliverables' },
  { key: 'RELEASE_NOTES', label: 'Release Notes' },
  { key: 'OTHER', label: 'Other Documents' }
];

const getFileIcon = (ext) => {
  const e = (ext || '').toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'].includes(e)) return Image;
  if (['.zip', '.tar', '.gz', '.rar', '.7z'].includes(e)) return Archive;
  if (['.xls', '.xlsx', '.csv'].includes(e)) return FileSpreadsheet;
  if (['.js', '.jsx', '.ts', '.tsx', '.java', '.py', '.json', '.sql', '.html', '.css'].includes(e)) return FileCode;
  return FileText;
};

const ClientDocumentsPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [error, setError] = useState('');

  // History Modal
  const [selectedDocDetail, setSelectedDocDetail] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchDocuments();
    }
  }, [selectedProjectId, categoryFilter, search]);

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
      setError(err.message || 'Failed to load contracted projects');
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
      setError('Failed to download file: ' + (err.message || 'Unknown error'));
    }
  };

  const openHistoryModal = async (docId) => {
    try {
      const res = await api.get(`/documents/${docId}`);
      setSelectedDocDetail(res.data);
    } catch (err) {
      setError('Failed to load version history');
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
            Contracts, Deliverables &amp; Shared Assets
          </h1>
          <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
            Official contracted files, signed specifications, and approved project deliverables released by your engineering team.
          </p>
        </div>

        {projects.length > 1 && (
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
      </div>

      {/* Notifications */}
      {error && (
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', color: '#c92a2a', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}

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
            placeholder="Search documents or files..."
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
            Loading shared deliverables and contracts...
          </div>
        ) : documents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
            <FileText size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
              No Shared Documents
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
              {categoryFilter !== 'ALL' ? `No client-visible files in category "${categoryFilter}"` : 'Your project manager will publish contracts and deliverables here as milestones progress.'}
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
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#666666', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                        <span>Original File: <strong>{doc.fileName}</strong></span>
                        <span>Size: <strong>{doc.fileSizeFormatted}</strong></span>
                        <span>Published: <strong>{new Date(doc.createdAt).toLocaleDateString()}</strong></span>
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
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Download size={14} /> Download File
                    </button>

                    <button
                      onClick={() => openHistoryModal(doc.documentId)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                      title="View Version History"
                    >
                      <History size={14} /> Revisions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Version History Modal */}
      {selectedDocDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div className="card animate-scale-up" style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #d4d4d4', paddingBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666666' }}>OFFICIAL RELEASE HISTORY</div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                  {selectedDocDetail.title}
                </h2>
              </div>
              <button onClick={() => setSelectedDocDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                  Released on {new Date(selectedDocDetail.createdAt).toLocaleDateString()}
                </div>
              </div>

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
                      Archived on {new Date(v.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : null}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #d4d4d4', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedDocDetail(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDocumentsPage;
