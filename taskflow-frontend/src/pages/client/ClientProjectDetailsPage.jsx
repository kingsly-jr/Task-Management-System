import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import TaskDetailModal from '../../components/TaskDetailModal';
import {
  FolderKanban,
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Flag,
  FileText,
  MessageSquare,
  GitPullRequest,
  CheckSquare,
  Users,
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Send,
  Eye,
  History,
  X,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  User,
  Paperclip,
  CheckSquare2,
  FileCode,
  FileSpreadsheet,
  Image,
  Archive,
  RefreshCw,
  Hash
} from 'lucide-react';

const TABS = [
  { id: 'progress', label: 'Progress & Tasks', icon: CheckSquare2 },
  { id: 'documents', label: 'Project Documents', icon: FileText },
  { id: 'messages', label: 'Direct Messages & PM Chat', icon: MessageSquare },
  { id: 'change-requests', label: 'Change Requests', icon: GitPullRequest }
];

const DOC_CATEGORIES = [
  { key: 'ALL', label: 'All Files' },
  { key: 'CONTRACT', label: 'Contracts' },
  { key: 'REQUIREMENTS', label: 'Requirements' },
  { key: 'DESIGN_SPEC', label: 'Design Specs' },
  { key: 'DELIVERABLE', label: 'Deliverables' },
  { key: 'RELEASE_NOTES', label: 'Release Notes' },
  { key: 'OTHER', label: 'Other Documents' }
];

const CHANNELS = [
  { id: 'GENERAL', label: 'General Discussion', desc: 'Project coordination & general inquiries' },
  { id: 'MILESTONES', label: 'Milestones & Releases', desc: 'Deliverables demos, acceptance & feedback' },
  { id: 'CHANGE_REQUESTS', label: 'Scope & Change Requests', desc: 'Scope clarifications, questions & adjustments' },
  { id: 'TECHNICAL', label: 'Technical & Architecture', desc: 'System specs, architecture & questions' }
];

const getFileIcon = (ext) => {
  const e = (ext || '').toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'].includes(e)) return Image;
  if (['.zip', '.tar', '.gz', '.rar', '.7z'].includes(e)) return Archive;
  if (['.xls', '.xlsx', '.csv'].includes(e)) return FileSpreadsheet;
  if (['.js', '.jsx', '.ts', '.tsx', '.java', '.py', '.json', '.sql', '.html', '.css'].includes(e)) return FileCode;
  return FileText;
};

const ClientProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Active tab state
  const currentTab = searchParams.get('tab') || 'progress';
  const setTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Main project data state
  const [project, setProject] = useState(null);
  const [taskStats, setTaskStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tasks filter & modal state
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docSearch, setDocSearch] = useState('');
  const [docCategory, setDocCategory] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    category: 'REQUIREMENTS',
    description: '',
    file: null
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedDocDetail, setSelectedDocDetail] = useState(null);

  // Messages state
  const [selectedChannel, setSelectedChannel] = useState('GENERAL');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef(null);

  // Change Requests state
  const [changeRequests, setChangeRequests] = useState([]);
  const [crLoading, setCrLoading] = useState(false);
  const [showCrModal, setShowCrModal] = useState(false);
  const [crFormData, setCrFormData] = useState({
    title: '',
    description: '',
    reasonForChange: '',
    estimatedCost: 0,
    scheduleImpactDays: 0,
    priority: 'MEDIUM'
  });
  const [submittingCr, setSubmittingCr] = useState(false);

  // Load Project on mount
  useEffect(() => {
    fetchProjectCore();
  }, [id]);

  // Load tab-specific data when tab changes
  useEffect(() => {
    if (!project) return;
    if (currentTab === 'progress') {
      fetchTasksAndMilestones();
    } else if (currentTab === 'documents') {
      fetchDocuments();
    } else if (currentTab === 'messages') {
      fetchMessages();
    } else if (currentTab === 'change-requests') {
      fetchChangeRequests();
    }
  }, [id, currentTab, project]);

  // Polling for direct messages if active on messages tab
  useEffect(() => {
    if (currentTab !== 'messages' || !id) return;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id, currentTab, selectedChannel]);

  useEffect(() => {
    if (currentTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentTab]);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (showUploadModal || showCrModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showUploadModal, showCrModal]);

  const fetchProjectCore = async () => {
    setLoading(true);
    setError('');
    try {
      const projRes = await api.get(`/projects/${id}`);
      setProject(projRes.data);

      // Load task stats
      try {
        const statsRes = await api.get(`/projects/${id}/tasks/stats`);
        setTaskStats(statsRes.data);
      } catch (err) {
        console.warn('Failed to load task stats', err);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasksAndMilestones = async () => {
    try {
      const [tRes, mRes] = await Promise.all([
        api.get(`/projects/${id}/tasks`),
        api.get(`/projects/${id}/milestones`)
      ]);
      setTasks(tRes.data || []);
      setMilestones(mRes.data || []);
    } catch (err) {
      console.error('Failed to load tasks and milestones', err);
    }
  };

  const fetchDocuments = async () => {
    setDocLoading(true);
    try {
      const params = {};
      if (docCategory !== 'ALL') params.category = docCategory;
      if (docSearch.trim()) params.search = docSearch.trim();
      const res = await api.get(`/projects/${id}/documents`, { params });
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setDocLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/projects/${id}/messages`, {
        params: { channel: selectedChannel }
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const fetchChangeRequests = async () => {
    setCrLoading(true);
    try {
      const res = await api.get('/change-requests');
      const all = res.data || [];
      const forThis = all.filter((cr) => cr.projectId === Number(id));
      setChangeRequests(forThis);
    } catch (err) {
      console.error('Failed to load change requests', err);
    } finally {
      setCrLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      const res = await api.post(`/projects/${id}/messages`, {
        content: inputText.trim(),
        channel: selectedChannel,
        isClientVisible: true
      });
      setInputText('');
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDocumentDownload = async (docId, fileName) => {
    try {
      const res = await api.get(`/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download document: ' + (err.message || 'Network error'));
    }
  };

  const handleUploadDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFormData.file) {
      alert('Please select a file to upload');
      return;
    }
    if (!uploadFormData.title.trim()) {
      alert('Please enter a document title');
      return;
    }

    setUploadingDoc(true);
    try {
      const data = new FormData();
      data.append('file', uploadFormData.file);
      data.append('title', uploadFormData.title.trim());
      data.append('category', uploadFormData.category);
      if (uploadFormData.description.trim()) {
        data.append('description', uploadFormData.description.trim());
      }
      data.append('isClientVisible', true);

      await api.post(`/projects/${id}/documents`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowUploadModal(false);
      setUploadFormData({ title: '', category: 'REQUIREMENTS', description: '', file: null });
      fetchDocuments();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleCreateCrSubmit = async (e) => {
    e.preventDefault();
    if (!crFormData.title.trim() || !crFormData.description.trim()) {
      alert('Please provide title and description');
      return;
    }

    setSubmittingCr(true);
    try {
      await api.post('/change-requests', {
        projectId: Number(id),
        ...crFormData
      });
      setShowCrModal(false);
      setCrFormData({
        title: '',
        description: '',
        reasonForChange: '',
        estimatedCost: 0,
        scheduleImpactDays: 0,
        priority: 'MEDIUM'
      });
      fetchChangeRequests();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to submit change request');
    } finally {
      setSubmittingCr(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#e6fcf5', color: '#0ca678', label: 'COMPLETED' };
      case 'IN_PROGRESS':
        return { bg: '#2b2b2b', color: '#ffffff', label: 'IN PROGRESS' };
      case 'IN_REVIEW':
        return { bg: '#fff4e6', color: '#d9480f', label: 'IN REVIEW' };
      case 'DELAYED':
        return { bg: '#ffe3e3', color: '#c92a2a', label: 'DELAYED' };
      case 'ON_HOLD':
        return { bg: '#fff9db', color: '#f59f00', label: 'ON HOLD' };
      default:
        return { bg: '#f1f1f1', color: '#666666', label: status || 'PLANNING' };
    }
  };

  const getTaskStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#e6fcf5', color: '#0ca678', label: 'Completed' };
      case 'IN_REVIEW':
        return { bg: '#e7f5ff', color: '#1971c2', label: 'Awaiting PM Approval' };
      case 'IN_PROGRESS':
        return { bg: '#fff4e6', color: '#d9480f', label: 'In Progress' };
      case 'BLOCKED':
        return { bg: '#ffe3e3', color: '#c92a2a', label: 'Blocked' };
      default:
        return { bg: '#f1f3f5', color: '#495057', label: 'To Do' };
    }
  };

  if (loading) {
    return (
      <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: '#666666' }}>
        Loading project workspace hub...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ padding: '1rem', backgroundColor: '#fff5f5', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', marginBottom: '1rem' }}>
          {error || 'Project not found or access denied'}
        </div>
        <Link to="/client/projects" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to My Projects
        </Link>
      </div>
    );
  }

  const progressVal = project.progressPercentage !== undefined && project.progressPercentage !== null
    ? project.progressPercentage
    : (project.progress !== undefined && project.progress !== null ? project.progress : 0);

  const filteredTasks = tasks.filter((t) => {
    const matchStatus = taskStatusFilter === 'ALL' || t.status === taskStatusFilter;
    const matchSearch = !taskSearch.trim() ||
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.taskCode?.toLowerCase().includes(taskSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Breadcrumb & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#8c8c8c', marginBottom: '1rem' }}>
        <Link to="/client/projects" style={{ color: '#666666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ArrowLeft size={14} /> My Projects
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: '#2b2b2b', fontWeight: 700 }}>{project.projectCode}</span>
        <ChevronRight size={14} />
        <span style={{ color: '#2b2b2b' }}>{project.projectName}</span>
      </div>

      {/* Hero Project Banner */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          borderTop: '5px solid #2b2b2b',
          backgroundColor: '#ffffff',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, padding: '0.2rem 0.55rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', letterSpacing: '0.04em' }}>
                {project.projectCode}
              </span>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2b2b2b', margin: 0, letterSpacing: '-0.02em' }}>
                {project.projectName}
              </h1>
              <span style={{
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 800,
                backgroundColor: getStatusBadge(project.status).bg,
                color: getStatusBadge(project.status).color
              }}>
                {getStatusBadge(project.status).label}
              </span>
            </div>

            {project.description && (
              <p style={{ fontSize: '0.92rem', color: '#555555', margin: 0, lineHeight: 1.5, maxWidth: '800px' }}>
                {project.description}
              </p>
            )}
          </div>

          {/* Quick Contact PM Button */}
          <button
            onClick={() => setTab('messages')}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
          >
            <MessageSquare size={16} /> Direct Message PM
          </button>
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          backgroundColor: '#fafafa',
          padding: '1.25rem',
          borderRadius: '8px',
          border: '1px solid #f0f0f0'
        }}>
          {/* Progress Gauge */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 700, color: '#2b2b2b' }}>Overall Completion</span>
              <span style={{ fontWeight: 800, color: '#2b2b2b', fontSize: '0.95rem' }}>{progressVal}%</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#e5e5e5', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progressVal}%`,
                  backgroundColor: progressVal === 100 ? '#0ca678' : '#2b2b2b',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <div style={{ fontSize: '0.74rem', color: '#8c8c8c', marginTop: '0.35rem' }}>
              {taskStats ? `${taskStats.completed || 0} of ${taskStats.total || 0} tasks completed` : 'Calculated in real-time'}
            </div>
          </div>

          {/* Project Manager */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2b2b2b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>
              {project.projectManagerName ? project.projectManagerName.charAt(0) : 'P'}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#8c8c8c', fontWeight: 700, textTransform: 'uppercase' }}>Project Manager</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2b2b2b' }}>{project.projectManagerName || 'Appointed Manager'}</div>
              <div style={{ fontSize: '0.76rem', color: '#666666' }}>{project.projectManagerEmail}</div>
            </div>
          </div>

          {/* Schedule */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.3rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#666666' }}>
              <Calendar size={14} color="#2b2b2b" />
              <span>Start: <strong>{project.startDate || '—'}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#666666' }}>
              <Clock size={14} color="#2b2b2b" />
              <span>Target End: <strong>{project.expectedEndDate || project.endDate || '—'}</strong></span>
            </div>
          </div>

          {/* Financials */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.8rem' }}>
              <span style={{ fontWeight: 700, color: '#2b2b2b' }}>Contract Billing</span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                backgroundColor: (project.remainingAmount !== null && project.remainingAmount !== undefined ? Number(project.remainingAmount) : Math.max(0, (Number(project.budget) || 0) - (Number(project.paidAmount) || 0))) === 0 && Number(project.budget) > 0 ? '#e6fcf5' : '#f1f1f1',
                color: (project.remainingAmount !== null && project.remainingAmount !== undefined ? Number(project.remainingAmount) : Math.max(0, (Number(project.budget) || 0) - (Number(project.paidAmount) || 0))) === 0 && Number(project.budget) > 0 ? '#0ca678' : '#2b2b2b'
              }}>
                {(project.remainingAmount !== null && project.remainingAmount !== undefined ? Number(project.remainingAmount) : Math.max(0, (Number(project.budget) || 0) - (Number(project.paidAmount) || 0))) === 0 && Number(project.budget) > 0 ? '✓ Settled' : 'Partial / Active'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#666666', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Budget:</span>
                <strong style={{ color: '#2b2b2b' }}>${project.budget ? Number(project.budget).toLocaleString() : 'N/A'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Paid:</span>
                <strong style={{ color: '#2b8a3e' }}>${project.paidAmount ? Number(project.paidAmount).toLocaleString() : '0'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Tabs Header */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid #d4d4d4',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.15rem',
                fontSize: '0.88rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#2b2b2b' : '#666666',
                border: 'none',
                borderBottom: isActive ? '3px solid #2b2b2b' : '3px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#2b2b2b' : '#8c8c8c'} />
              <span>{tab.label}</span>
              {tab.id === 'documents' && documents.length > 0 && (
                <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', backgroundColor: '#e5e5e5', borderRadius: '999px', fontWeight: 700 }}>
                  {documents.length}
                </span>
              )}
              {tab.id === 'change-requests' && changeRequests.length > 0 && (
                <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', backgroundColor: '#e5e5e5', borderRadius: '999px', fontWeight: 700 }}>
                  {changeRequests.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: PROGRESS & SPRINT TASKS */}
      {currentTab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Task Status Breakdown Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #2b2b2b' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Total Tasks</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#2b2b2b', marginTop: '0.2rem' }}>
                {taskStats?.total || tasks.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#666666' }}>Engineered sprint items</div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #0ca678' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0ca678', textTransform: 'uppercase' }}>Completed</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0ca678', marginTop: '0.2rem' }}>
                {taskStats?.completed || tasks.filter(t => t.status === 'COMPLETED').length}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#666666' }}>Fully delivered &amp; closed</div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #1971c2' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1971c2', textTransform: 'uppercase' }}>In Review</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1971c2', marginTop: '0.2rem' }}>
                {taskStats?.inReview || tasks.filter(t => t.status === 'IN_REVIEW').length}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#666666' }}>Submitted with deliverables</div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #f59f00' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59f00', textTransform: 'uppercase' }}>In Progress</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f59f00', marginTop: '0.2rem' }}>
                {taskStats?.inProgress || tasks.filter(t => t.status === 'IN_PROGRESS').length}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#666666' }}>Actively in engineering</div>
            </div>

            <div className="card" style={{ padding: '1rem 1.25rem', borderLeft: '4px solid #868e96' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#868e96', textTransform: 'uppercase' }}>To Do / Backlog</div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#868e96', marginTop: '0.2rem' }}>
                {taskStats?.todo || tasks.filter(t => t.status === 'TODO').length}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#666666' }}>Planned for execution</div>
            </div>
          </div>

          {/* Tasks Table & Inspection */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <CheckSquare2 size={18} /> Sprint Tasks &amp; Deliverables Breakdown
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
                  Inspect every task, subtask checklist completion, implementation documents, and pull request URLs.
                </p>
              </div>

              {/* Filter and Search */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={15} color="#8c8c8c" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.65rem 0.4rem 2.15rem',
                      border: '1px solid #d4d4d4',
                      borderRadius: '6px',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {['ALL', 'COMPLETED', 'IN_REVIEW', 'IN_PROGRESS', 'TODO'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setTaskStatusFilter(st)}
                      style={{
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        border: '1px solid',
                        borderColor: taskStatusFilter === st ? '#2b2b2b' : '#e0e0e0',
                        backgroundColor: taskStatusFilter === st ? '#2b2b2b' : '#ffffff',
                        color: taskStatusFilter === st ? '#ffffff' : '#666666',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {st === 'ALL' ? 'All' : st === 'IN_REVIEW' ? 'In Review' : st === 'IN_PROGRESS' ? 'In Progress' : st === 'COMPLETED' ? 'Done' : 'To Do'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                <CheckSquare size={32} color="#b3b3b3" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                  No tasks match the filter criteria
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
                  Try changing the filter or search keyword.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left', color: '#8c8c8c', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Task</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Subtasks</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Deliverable / Artifact</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Assignee</th>
                      <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((t) => {
                      const tBadge = getTaskStatusBadge(t.status);
                      const subTotal = t.totalSubtasks || 0;
                      const subDone = t.completedSubtasks || 0;
                      const subPercent = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;

                      return (
                        <tr
                          key={t.taskId}
                          style={{
                            borderBottom: '1px solid #f0f0f0',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {/* Code & Title */}
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.12rem 0.4rem', backgroundColor: '#f0f0f0', borderRadius: '3px', color: '#2b2b2b' }}>
                                {t.taskCode || `TSK-${t.taskId}`}
                              </span>
                              <span style={{ fontWeight: 700, color: '#2b2b2b' }}>
                                {t.title}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              backgroundColor: tBadge.bg,
                              color: tBadge.color
                            }}>
                              {t.status === 'COMPLETED' ? <CheckCircle2 size={12} /> : t.status === 'IN_REVIEW' ? <Clock3 size={12} /> : null}
                              {tBadge.label}
                            </span>
                          </td>

                          {/* Subtasks Progress */}
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            {subTotal > 0 ? (
                              <div style={{ width: '130px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#666666', marginBottom: '0.2rem' }}>
                                  <span>{subDone}/{subTotal} done</span>
                                  <span style={{ fontWeight: 700 }}>{subPercent}%</span>
                                </div>
                                <div style={{ height: '5px', backgroundColor: '#e9ecef', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${subPercent}%`, backgroundColor: subPercent === 100 ? '#0ca678' : '#2b2b2b' }} />
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#adb5bd' }}>No subtasks</span>
                            )}
                          </td>

                          {/* Deliverable/PR Links */}
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            {t.prUrl ? (
                              <a
                                href={t.prUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.76rem',
                                  color: '#1971c2',
                                  textDecoration: 'none',
                                  fontWeight: 600,
                                  backgroundColor: '#e7f5ff',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px'
                                }}
                              >
                                <ExternalLink size={12} />
                                <span>Inspect PR / Build</span>
                              </a>
                            ) : t.reviewDocumentFileName ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.76rem',
                                color: '#2b2b2b',
                                backgroundColor: '#f1f1f1',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px'
                              }}>
                                <Paperclip size={12} />
                                <span>{t.reviewDocumentFileName}</span>
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#adb5bd' }}>—</span>
                            )}
                          </td>

                          {/* Assignees */}
                          <td style={{ padding: '0.85rem 0.5rem' }}>
                            {t.assignees && t.assignees.length > 0 ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#2b2b2b', color: '#fff', fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                  {t.assignees[0].fullName?.charAt(0) || 'U'}
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#495057' }}>{t.assignees[0].fullName}</span>
                                {t.assignees.length > 1 && (
                                  <span style={{ fontSize: '0.7rem', color: '#8c8c8c' }}>+{t.assignees.length - 1}</span>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#adb5bd' }}>Unassigned</span>
                            )}
                          </td>

                          {/* Action */}
                          <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedTaskId(t.taskId)}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Eye size={13} />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Milestones & Deliverables Roadmap */}
          <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Flag size={18} /> Sprint Milestones &amp; Release Acceptance Roadmap
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
                  High-level contracted milestones, release deliverables, and acceptance verification.
                </p>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#8c8c8c' }}>
                {milestones.length} Deliverables Planned
              </span>
            </div>

            {milestones.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
                  No milestone deliverables have been published yet for this project.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {milestones.map((m) => {
                  const mBadge = getStatusBadge(m.status);
                  return (
                    <div
                      key={m.milestoneId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                        padding: '1rem 1.25rem',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e5e5',
                        borderRadius: '6px',
                        borderLeft: m.status === 'COMPLETED' ? '4px solid #0ca678' : m.status === 'DELAYED' ? '4px solid #c92a2a' : '4px solid #2b2b2b'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem', flex: 1, minWidth: '240px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          backgroundColor: '#2b2b2b',
                          color: '#ffffff',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          flexShrink: 0
                        }}>
                          M{m.orderIndex}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                              {m.title}
                            </h4>
                            <span style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '3px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              backgroundColor: mBadge.bg,
                              color: mBadge.color
                            }}>
                              {mBadge.label}
                            </span>
                          </div>
                          {m.description && (
                            <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0, lineHeight: 1.35 }}>
                              {m.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                        <div style={{ width: '130px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#666666' }}>Progress</span>
                            <span style={{ fontWeight: 800, color: '#2b2b2b' }}>{m.progressPercentage}%</span>
                          </div>
                          <div style={{ height: '6px', backgroundColor: '#ececec', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${m.progressPercentage}%`,
                                backgroundColor: m.progressPercentage === 100 ? '#0ca678' : '#2b2b2b'
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', fontSize: '0.78rem' }}>
                          <div style={{ color: '#8c8c8c', fontSize: '0.7rem' }}>TARGET DELIVERY</div>
                          <div style={{ fontWeight: 700, color: '#2b2b2b' }}>{m.targetDate || 'TBD'}</div>
                          {m.actualCompletionDate && (
                            <div style={{ color: '#0ca678', fontSize: '0.72rem', fontWeight: 600 }}>
                              Delivered {m.actualCompletionDate}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: PROJECT DOCUMENTS */}
      {currentTab === 'documents' && (
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <FileText size={18} /> Project Documents &amp; Contracted Assets
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
                Access specifications, deliverables, architecture briefs, and upload requirements directly.
              </p>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
            >
              <Upload size={15} /> Upload Project Document
            </button>
          </div>

          {/* Filter Pills & Search */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', backgroundColor: '#fafafa', padding: '0.75rem', borderRadius: '6px' }}>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {DOC_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setDocCategory(c.key)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: '1px solid',
                    borderColor: docCategory === c.key ? '#2b2b2b' : '#d4d4d4',
                    backgroundColor: docCategory === c.key ? '#2b2b2b' : '#ffffff',
                    color: docCategory === c.key ? '#ffffff' : '#555555',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} color="#8c8c8c" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search files..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.65rem 0.35rem 2.1rem',
                  border: '1px solid #d4d4d4',
                  borderRadius: '4px',
                  fontSize: '0.82rem'
                }}
              />
            </div>
          </div>

          {docLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666666' }}>Loading documents...</div>
          ) : documents.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
              <FileText size={36} color="#b3b3b3" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>No Documents Found</h4>
              <p style={{ fontSize: '0.85rem', color: '#666666', maxWidth: '400px', margin: '0 auto 1rem auto' }}>
                There are no documents uploaded under this category yet. Upload a brief or spec to share with the team.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <Upload size={14} /> Upload First Document
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {documents.map((doc) => {
                const FileIcon = getFileIcon(doc.fileExtension);
                return (
                  <div
                    key={doc.documentId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      padding: '1rem 1.25rem',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: 1, minWidth: '240px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#f1f1f1',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2b2b2b',
                        flexShrink: 0
                      }}>
                        <FileIcon size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                            {doc.title}
                          </h4>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.12rem 0.45rem', backgroundColor: '#e9ecef', color: '#495057', borderRadius: '3px' }}>
                            {doc.category}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.12rem 0.35rem', backgroundColor: '#f8f9fa', color: '#868e96', borderRadius: '3px' }}>
                            v{doc.version || 1}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#666666', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span>{doc.fileName}</span>
                          <span>•</span>
                          <span>{doc.fileSizeFormatted || '—'}</span>
                          <span>•</span>
                          <span>Uploaded {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '—'} by {doc.uploadedByName || 'Team'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDocumentDownload(doc.documentId, doc.fileName)}
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                      >
                        <Download size={14} /> Download
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: DIRECT MESSAGES & PM DISCUSSION */}
      {currentTab === 'messages' && (
        <div className="card" style={{ padding: '0', backgroundColor: '#ffffff', overflow: 'hidden' }}>
          {/* Messages Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', backgroundColor: '#fafafa' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.2rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <MessageSquare size={18} /> Project Direct Messages — {project.projectName}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
                Directly communicate with Project Manager <strong>{project.projectManagerName || 'Alex Morgan'}</strong>. All discussions stay organized inside this project.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#0ca678', fontWeight: 700, backgroundColor: '#e6fcf5', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
              <RefreshCw size={12} className="spin-slow" /> Real-time Sync Active
            </div>
          </div>

          {/* Channels Row */}
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid #f0f0f0', overflowX: 'auto', backgroundColor: '#ffffff' }}>
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: selectedChannel === ch.id ? '#2b2b2b' : '#e0e0e0',
                  backgroundColor: selectedChannel === ch.id ? '#2b2b2b' : '#fafafa',
                  color: selectedChannel === ch.id ? '#ffffff' : '#666666',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <Hash size={13} />
                <span>{ch.label}</span>
              </button>
            ))}
          </div>

          {/* Messages Feed Area */}
          <div style={{ padding: '1.5rem', height: '420px', overflowY: 'auto', backgroundColor: '#fcfcfc', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#8c8c8c' }}>
                <MessageSquare size={36} color="#d4d4d4" style={{ margin: '0 auto 0.5rem auto' }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 600, margin: '0 0 0.25rem 0', color: '#2b2b2b' }}>
                  No messages in #{CHANNELS.find(c => c.id === selectedChannel)?.label} yet
                </p>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>
                  Send a message below to reach out directly to the project manager.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === user?.id || msg.senderEmail === user?.email;
                return (
                  <div
                    key={msg.messageId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem', fontSize: '0.74rem', color: '#8c8c8c' }}>
                      <span style={{ fontWeight: 700, color: '#2b2b2b' }}>{isMe ? 'You' : msg.senderName}</span>
                      {!isMe && (
                        <span style={{ fontSize: '0.66rem', fontWeight: 800, padding: '0.1rem 0.35rem', backgroundColor: '#e9ecef', borderRadius: '3px', color: '#495057' }}>
                          {msg.senderRole || 'PM'}
                        </span>
                      )}
                      <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>

                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '0.75rem 1rem',
                        borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        backgroundColor: isMe ? '#2b2b2b' : '#ffffff',
                        color: isMe ? '#ffffff' : '#2b2b2b',
                        border: isMe ? 'none' : '1px solid #e0e0e0',
                        fontSize: '0.88rem',
                        lineHeight: 1.45,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Send Input Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e5e5',
              display: 'flex',
              gap: '0.75rem',
              backgroundColor: '#ffffff'
            }}
          >
            <input
              type="text"
              placeholder={`Message Alex Morgan & team in #${CHANNELS.find(c => c.id === selectedChannel)?.label}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem 0.95rem',
                border: '1px solid #d4d4d4',
                borderRadius: '6px',
                fontSize: '0.88rem'
              }}
            />
            <button
              type="submit"
              disabled={sendingMsg || !inputText.trim()}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.25rem',
                fontSize: '0.88rem'
              }}
            >
              <Send size={15} />
              <span>{sendingMsg ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT 4: CHANGE REQUESTS */}
      {currentTab === 'change-requests' && (
        <div className="card" style={{ padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <GitPullRequest size={18} /> Project Scope &amp; Change Requests
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
                Formal scope change requests, cost/time impacts, and approval status for this project.
              </p>
            </div>

            <button
              onClick={() => setShowCrModal(true)}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem' }}
            >
              <Plus size={15} /> Request Scope Change
            </button>
          </div>

          {crLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#666666' }}>Loading change requests...</div>
          ) : changeRequests.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
              <GitPullRequest size={36} color="#b3b3b3" style={{ margin: '0 auto 0.75rem auto' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                No Scope Change Requests for this Project
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#666666', maxWidth: '420px', margin: '0 auto 1rem auto' }}>
                Need additional features, architecture adjustments, or schedule changes? Submit a request directly to the PM.
              </p>
              <button
                onClick={() => setShowCrModal(true)}
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
              >
                <Plus size={14} /> Submit New Change Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {changeRequests.map((cr) => {
                const isApproved = cr.status === 'APPROVED' || cr.status === 'IMPLEMENTED';
                const isRejected = cr.status === 'REJECTED';
                const isPending = !isApproved && !isRejected;

                return (
                  <div
                    key={cr.changeRequestId}
                    style={{
                      padding: '1.25rem',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      backgroundColor: '#ffffff',
                      borderLeft: isApproved ? '4px solid #0ca678' : isRejected ? '4px solid #c92a2a' : '4px solid #f59f00'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.45rem', backgroundColor: '#f0f0f0', borderRadius: '3px' }}>
                          CR-{cr.changeRequestId}
                        </span>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                          {cr.title}
                        </h4>
                      </div>

                      <span style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: isApproved ? '#e6fcf5' : isRejected ? '#ffe3e3' : '#fff9db',
                        color: isApproved ? '#0ca678' : isRejected ? '#c92a2a' : '#f59f00'
                      }}>
                        {cr.status || 'SUBMITTED'}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: '#555555', margin: '0 0 0.85rem 0', lineHeight: 1.4 }}>
                      {cr.description}
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: '#666666', borderTop: '1px solid #f0f0f0', paddingTop: '0.65rem' }}>
                      <div>
                        Est. Cost: <strong style={{ color: '#2b2b2b' }}>${cr.estimatedCost ? Number(cr.estimatedCost).toLocaleString() : '0'}</strong>
                      </div>
                      <div>
                        Schedule Impact: <strong style={{ color: '#2b2b2b' }}>+{cr.scheduleImpactDays || 0} days</strong>
                      </div>
                      <div>
                        Priority: <strong style={{ color: '#2b2b2b' }}>{cr.priority || 'MEDIUM'}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => {
            fetchTasksAndMilestones();
            fetchProjectCore();
          }}
        />
      )}

      {/* Upload Document Modal (Via React Portal) */}
      {showUploadModal && createPortal(
        <div
          onClick={() => setShowUploadModal(false)}
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
              maxWidth: '540px',
              margin: 'auto',
              padding: '1.75rem',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2b2b2b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Upload size={18} /> Upload Document for {project.projectCode}
              </h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadDocumentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Project Scope Specifications v2"
                  value={uploadFormData.title}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Category *
                </label>
                <select
                  value={uploadFormData.category}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                >
                  <option value="REQUIREMENTS">Requirements &amp; Scope</option>
                  <option value="CONTRACT">Contract &amp; SOW</option>
                  <option value="DESIGN_SPEC">Design Specifications &amp; UI Assets</option>
                  <option value="DELIVERABLE">Deliverable Asset</option>
                  <option value="RELEASE_NOTES">Release Notes</option>
                  <option value="OTHER">Other Document</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Notes or context regarding this file..."
                  value={uploadFormData.description}
                  onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Select File *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadFormData({ ...uploadFormData, file: e.target.files[0] })}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {uploadingDoc ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Scope Change Request Modal (Via React Portal) */}
      {showCrModal && createPortal(
        <div
          onClick={() => setShowCrModal(false)}
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
              maxWidth: '580px',
              margin: 'auto',
              padding: '1.75rem',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2b2b2b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <GitPullRequest size={18} /> Request Scope Change for {project.projectCode}
              </h3>
              <button onClick={() => setShowCrModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCrSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Change Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Integrate Stripe Payment Gateway in addition to PayPal"
                  value={crFormData.title}
                  onChange={(e) => setCrFormData({ ...crFormData, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Description &amp; Deliverables Desired *
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed breakdown of new requirements..."
                  value={crFormData.description}
                  onChange={(e) => setCrFormData({ ...crFormData, description: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Business Justification / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Customer checkout conversion requirement"
                  value={crFormData.reasonForChange}
                  onChange={(e) => setCrFormData({ ...crFormData, reasonForChange: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Est. Budget Adjustment ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={crFormData.estimatedCost}
                    onChange={(e) => setCrFormData({ ...crFormData, estimatedCost: Number(e.target.value) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Priority
                  </label>
                  <select
                    value={crFormData.priority}
                    onChange={(e) => setCrFormData({ ...crFormData, priority: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #d4d4d4', borderRadius: '6px', fontSize: '0.85rem' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCrModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCr}
                  className="btn btn-primary"
                  style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem' }}
                >
                  {submittingCr ? 'Submitting...' : 'Submit Change Request'}
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

export default ClientProjectDetailsPage;
