import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import TaskDetailModal from '../../components/TaskDetailModal';
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
  Briefcase,
  CheckSquare2,
  Kanban,
  Flag,
  Bug,
  GitPullRequest,
  FileText,
  MessageSquare,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Upload,
  Download,
  History,
  X,
  Send,
  Eye,
  EyeOff,
  Check,
  Ban,
  ShieldCheck,
  User,
  Image,
  Archive,
  FileSpreadsheet,
  FileCode,
  CheckSquare
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview & Specs', icon: FolderKanban },
  { id: 'team', label: 'Project Team', icon: Users2 },
  { id: 'tasks', label: 'Sprint Tasks', icon: CheckSquare2 },
  { id: 'kanban', label: 'Kanban Board', icon: Kanban },
  { id: 'milestones', label: 'Milestones', icon: Flag },
  { id: 'bugs', label: 'Bugs & Retest', icon: Bug },
  { id: 'change-requests', label: 'Change Requests', icon: GitPullRequest },
  { id: 'documents', label: 'Documents & Files', icon: FileText },
  { id: 'messages', label: 'Messages & Channels', icon: MessageSquare }
];

const DOC_CATEGORIES = [
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

const CHANNELS = [
  { id: 'GENERAL', label: 'General Discussion', desc: 'Project coordination & milestone updates' },
  { id: 'MILESTONES', label: 'Milestones & Releases', desc: 'Deliverable demos, acceptance & feedback' },
  { id: 'CHANGE_REQUESTS', label: 'Scope & Change Requests', desc: 'Scope clarifications and budget inquiries' },
  { id: 'TECHNICAL', label: 'Technical & Architecture', desc: 'System specs and technical questions' }
];

const KANBAN_COLUMNS = [
  { id: 'TODO', title: 'To Do', color: '#666666', bg: '#f5f5f5' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#2b2b2b', bg: '#ececec' },
  { id: 'IN_REVIEW', title: 'In Review', color: '#099268', bg: '#e6fcf5' },
  { id: 'COMPLETED', title: 'Completed', color: '#2b8a3e', bg: '#ebfbee' }
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

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const backPath = isAdmin ? '/admin/projects' : '/manager/projects';
  const backLabel = isAdmin ? 'Back to Projects' : 'Back to Assigned Projects';

  // Active Tab: sync with ?tab= in URL
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // Main Project & Team State
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableCandidates, setAvailableCandidates] = useState([]);
  const [roleCategories, setRoleCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals for Overview & Team
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [allocation, setAllocation] = useState(100);

  const [editData, setEditData] = useState({
    projectName: '',
    description: '',
    status: '',
    priority: '',
    progress: 0,
    expectedEndDate: '',
    actualEndDate: '',
    technologyStack: '',
    budget: '',
    paidAmount: '',
    remainingAmount: ''
  });

  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('ALL');
  const [taskPriorityFilter, setTaskPriorityFilter] = useState('ALL');
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    milestoneId: '',
    estimatedHours: '',
    startDate: '',
    dueDate: '',
    assigneeIds: []
  });

  // Milestones State
  const [milestones, setMilestones] = useState([]);
  const [milestonesLoading, setMilestonesLoading] = useState(false);
  const [showCreateMilestoneModal, setShowCreateMilestoneModal] = useState(false);
  const [showEditMilestoneModal, setShowEditMilestoneModal] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [milestoneFormData, setMilestoneFormData] = useState({
    title: '',
    description: '',
    targetDate: '',
    orderIndex: 1,
    status: 'PENDING',
    actualCompletionDate: ''
  });

  // Bugs State
  const [bugs, setBugs] = useState([]);
  const [bugsLoading, setBugsLoading] = useState(false);
  const [bugSearch, setBugSearch] = useState('');
  const [bugStatusFilter, setBugStatusFilter] = useState('ALL');
  const [bugSeverityFilter, setBugSeverityFilter] = useState('ALL');
  const [selectedBugId, setSelectedBugId] = useState(null);
  const [activeBugDetail, setActiveBugDetail] = useState(null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState('');
  const [bugCommentContent, setBugCommentContent] = useState('');

  // Change Requests State
  const [changeRequests, setChangeRequests] = useState([]);
  const [crLoading, setCrLoading] = useState(false);
  const [crStatusFilter, setCrStatusFilter] = useState('ALL');
  const [selectedCrId, setSelectedCrId] = useState(null);
  const [activeCrDetail, setActiveCrDetail] = useState(null);
  const [crReviewNotes, setCrReviewNotes] = useState('');
  const [crApprovedCost, setCrApprovedCost] = useState('');
  const [crApprovedDays, setCrApprovedDays] = useState('');
  const [crCommentText, setCrCommentText] = useState('');

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [docCategoryFilter, setDocCategoryFilter] = useState('ALL');
  const [docSearch, setDocSearch] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('CONTRACT');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadClientVisible, setUploadClientVisible] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedDocForVersion, setSelectedDocForVersion] = useState(null);
  const [versionFile, setVersionFile] = useState(null);
  const [versionChangeLog, setVersionChangeLog] = useState('');
  const [versionUploading, setVersionUploading] = useState(false);
  const versionFileInputRef = useRef(null);
  const [isVersionDragging, setIsVersionDragging] = useState(false);
  const [selectedDocDetail, setSelectedDocDetail] = useState(null);

  // Messages State
  const [selectedChannel, setSelectedChannel] = useState('GENERAL');
  const [messages, setMessages] = useState([]);
  const [msgInputText, setMsgInputText] = useState('');
  const [msgClientVisible, setMsgClientVisible] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgSending, setMsgSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Lock body scroll when any modal is open
  const isAnyModalOpen =
    showEditModal ||
    showAssignModal ||
    showCreateTaskModal ||
    showCreateMilestoneModal ||
    showEditMilestoneModal ||
    (selectedBugId && activeBugDetail) ||
    (selectedCrId && activeCrDetail) ||
    isUploadModalOpen ||
    (isVersionModalOpen && selectedDocForVersion) ||
    selectedDocDetail;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAnyModalOpen]);

  // Initial Load
  useEffect(() => {
    fetchProjectData();
    fetchRoleCategories();
  }, [id]);

  // Tab change triggers
  useEffect(() => {
    if (!id) return;
    if (activeTab === 'tasks' || activeTab === 'kanban') {
      fetchTasks();
    } else if (activeTab === 'milestones') {
      fetchMilestones();
    } else if (activeTab === 'bugs') {
      fetchBugs();
    } else if (activeTab === 'change-requests') {
      fetchChangeRequests();
    } else if (activeTab === 'documents') {
      fetchDocuments();
    } else if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [id, activeTab]);

  // Messages polling
  useEffect(() => {
    if (activeTab !== 'messages' || !id) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id, activeTab, selectedChannel]);

  useEffect(() => {
    if (activeTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // 1. Data Fetchers
  const fetchProjectData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, mRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/members`)
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

  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await api.get(`/projects/${id}/tasks`);
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const fetchMilestones = async () => {
    setMilestonesLoading(true);
    try {
      const res = await api.get(`/projects/${id}/milestones`);
      setMilestones(res.data || []);
    } catch (err) {
      console.error('Failed to fetch milestones', err);
    } finally {
      setMilestonesLoading(false);
    }
  };

  const fetchBugs = async () => {
    setBugsLoading(true);
    try {
      const res = await api.get(`/projects/${id}/bugs`);
      setBugs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch bugs', err);
    } finally {
      setBugsLoading(false);
    }
  };

  const fetchChangeRequests = async () => {
    setCrLoading(true);
    try {
      const res = await api.get(`/projects/${id}/change-requests`);
      setChangeRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch change requests', err);
    } finally {
      setCrLoading(false);
    }
  };

  const fetchDocuments = async () => {
    setDocLoading(true);
    try {
      const params = {};
      if (docCategoryFilter !== 'ALL') params.category = docCategoryFilter;
      if (docSearch.trim()) params.search = docSearch.trim();
      const res = await api.get(`/projects/${id}/documents`, { params });
      setDocuments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch documents', err);
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
      console.error('Failed to fetch messages', err);
    }
  };

  // 2. Overview / Edit Project Handlers
  const handleOpenEditModal = () => {
    if (!project) return;
    const bVal = project.budget !== null && project.budget !== undefined ? project.budget : '';
    const pVal = project.paidAmount !== null && project.paidAmount !== undefined ? project.paidAmount : 0;
    const rVal = project.remainingAmount !== null && project.remainingAmount !== undefined
      ? project.remainingAmount
      : (bVal !== '' ? Math.max(0, bVal - pVal) : '');

    setEditData({
      projectName: project.projectName,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      progress: project.progress || 0,
      expectedEndDate: project.expectedEndDate || '',
      actualEndDate: project.actualEndDate || '',
      technologyStack: project.technologyStack || '',
      budget: bVal !== '' ? String(bVal) : '',
      paidAmount: String(pVal),
      remainingAmount: rVal !== '' ? String(rVal) : ''
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
        budget: editData.budget ? parseFloat(editData.budget) : null,
        paidAmount: editData.paidAmount ? parseFloat(editData.paidAmount) : 0,
        remainingAmount: editData.remainingAmount ? parseFloat(editData.remainingAmount) : null
      };
      await api.put(`/projects/${id}`, payload);
      setShowEditModal(false);
      setSuccessMsg('Project specs and financials updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to update project specs');
    }
  };

  // 3. Team Member Handlers
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
      setAllocation(100);
      setShowAssignModal(true);
    } catch (err) {
      setError(err.message || 'Failed to load available team members');
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
        allocationPercentage: allocation
      };
      await api.post(`/projects/${id}/members`, payload);
      setShowAssignModal(false);
      setSuccessMsg('Team member allocated to project successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to allocate team member');
    }
  };

  const handleRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.fullName} from this project?`)) return;
    setError('');
    try {
      await api.delete(`/projects/${id}/members/${member.projectMemberId}`);
      setSuccessMsg(`${member.fullName} removed from project.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProjectData();
    } catch (err) {
      setError(err.message || 'Failed to remove member');
    }
  };

  // 4. Tasks Handlers
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        projectId: parseInt(id, 10),
        title: taskFormData.title.trim(),
        description: taskFormData.description.trim() || null,
        priority: taskFormData.priority,
        milestoneId: taskFormData.milestoneId ? parseInt(taskFormData.milestoneId, 10) : null,
        estimatedHours: taskFormData.estimatedHours ? parseFloat(taskFormData.estimatedHours) : null,
        startDate: taskFormData.startDate || null,
        dueDate: taskFormData.dueDate || null,
        assigneeIds: taskFormData.assigneeIds
      };
      await api.post(`/projects/${id}/tasks`, payload);
      setShowCreateTaskModal(false);
      setTaskFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        milestoneId: '',
        estimatedHours: '',
        startDate: '',
        dueDate: '',
        assigneeIds: []
      });
      setSuccessMsg('Sprint task created successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchTasks();
    } catch (err) {
      setError(err.message || 'Failed to create sprint task');
    }
  };

  const handleToggleTaskAssignee = (userId) => {
    const list = [...taskFormData.assigneeIds];
    const idx = list.indexOf(userId);
    if (idx > -1) list.splice(idx, 1);
    else list.push(userId);
    setTaskFormData({ ...taskFormData, assigneeIds: list });
  };

  const handleMoveKanbanStatus = async (e, task, direction) => {
    e.stopPropagation();
    const order = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];
    const currentIdx = order.indexOf(task.status);
    let targetStatus;
    if (currentIdx === -1) {
      targetStatus = direction === 'next' ? 'IN_PROGRESS' : 'TODO';
    } else {
      const nextIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
      if (nextIdx >= 0 && nextIdx < order.length) {
        targetStatus = order[nextIdx];
      }
    }
    if (targetStatus) {
      try {
        await api.patch(`/tasks/${task.taskId}/status`, { status: targetStatus });
        fetchTasks();
      } catch (err) {
        console.error('Failed to update task status', err);
      }
    }
  };

  // 5. Milestones Handlers
  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: milestoneFormData.title.trim(),
        description: milestoneFormData.description.trim() || null,
        targetDate: milestoneFormData.targetDate,
        orderIndex: parseInt(milestoneFormData.orderIndex, 10),
        status: milestoneFormData.status
      };
      await api.post(`/projects/${id}/milestones`, payload);
      setShowCreateMilestoneModal(false);
      setMilestoneFormData({ title: '', description: '', targetDate: '', orderIndex: 1, status: 'PENDING', actualCompletionDate: '' });
      setSuccessMsg('Milestone created successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchMilestones();
    } catch (err) {
      setError(err.message || 'Failed to create milestone');
    }
  };

  const handleUpdateMilestone = async (e) => {
    e.preventDefault();
    if (!activeMilestone) return;
    try {
      const payload = {
        title: milestoneFormData.title.trim(),
        description: milestoneFormData.description.trim() || null,
        targetDate: milestoneFormData.targetDate,
        orderIndex: parseInt(milestoneFormData.orderIndex, 10),
        status: milestoneFormData.status,
        actualCompletionDate: milestoneFormData.actualCompletionDate || null
      };
      await api.put(`/milestones/${activeMilestone.milestoneId}`, payload);
      setShowEditMilestoneModal(false);
      setActiveMilestone(null);
      setSuccessMsg('Milestone updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchMilestones();
    } catch (err) {
      setError(err.message || 'Failed to update milestone');
    }
  };

  // 6. Bugs Handlers
  const openBugDetail = async (bugId) => {
    setSelectedBugId(bugId);
    try {
      const res = await api.get(`/bugs/${bugId}`);
      setActiveBugDetail(res.data);
      setSelectedAssigneeId(res.data.assignedToUserId || '');
    } catch (err) {
      console.error('Failed to load bug details', err);
    }
  };

  const handleAssignBug = async () => {
    if (!selectedBugId) return;
    try {
      await api.put(`/bugs/${selectedBugId}/assign`, {
        assigneeId: selectedAssigneeId ? parseInt(selectedAssigneeId, 10) : null
      });
      setSuccessMsg('Bug developer assigned successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
      openBugDetail(selectedBugId);
      fetchBugs();
    } catch (err) {
      setError(err.message || 'Failed to assign bug');
    }
  };

  const handleAddBugComment = async (e) => {
    e.preventDefault();
    if (!bugCommentContent.trim() || !selectedBugId) return;
    try {
      await api.post(`/bugs/${selectedBugId}/comments`, { content: bugCommentContent.trim() });
      setBugCommentContent('');
      openBugDetail(selectedBugId);
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  // 7. Change Requests Handlers
  const openCrDetail = async (crId) => {
    setSelectedCrId(crId);
    try {
      const res = await api.get(`/change-requests/${crId}`);
      setActiveCrDetail(res.data);
      setCrReviewNotes(res.data.reviewNotes || '');
      setCrApprovedCost(res.data.approvedCost || res.data.estimatedCost || '');
      setCrApprovedDays(res.data.approvedScheduleImpactDays || res.data.estimatedScheduleImpactDays || '');
    } catch (err) {
      console.error('Failed to load change request details', err);
    }
  };

  const handleReviewCr = async (actionStatus) => {
    if (!selectedCrId) return;
    try {
      await api.post(`/change-requests/${selectedCrId}/review`, {
        approved: actionStatus === 'APPROVED',
        reviewNotes: crReviewNotes.trim() || (actionStatus === 'APPROVED' ? 'Approved by Project Manager.' : 'Rejected by Project Manager.')
      });
      setSelectedCrId(null);
      setActiveCrDetail(null);
      setSuccessMsg(`Change request ${actionStatus.toLowerCase()} successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchChangeRequests();
    } catch (err) {
      setError(err.message || 'Failed to review change request');
    }
  };

  const handleAddCrComment = async (e) => {
    e.preventDefault();
    if (!crCommentText.trim() || !selectedCrId) return;
    try {
      await api.post(`/change-requests/${selectedCrId}/comments`, { content: crCommentText.trim() });
      setCrCommentText('');
      openCrDetail(selectedCrId);
    } catch (err) {
      console.error('Failed to post CR comment', err);
    }
  };

  // 8. Documents Handlers
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle.trim() || uploadFile.name);
      formData.append('category', uploadCategory);
      formData.append('description', uploadDescription.trim());
      formData.append('clientVisible', uploadClientVisible);

      await api.post(`/projects/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle('');
      setUploadDescription('');
      setSuccessMsg('Document uploaded successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleVersionSubmit = async (e) => {
    e.preventDefault();
    if (!versionFile || !selectedDocForVersion) return;
    setVersionUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', versionFile);
      formData.append('changeLog', versionChangeLog.trim());

      await api.post(`/documents/${selectedDocForVersion.documentId}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsVersionModalOpen(false);
      setSelectedDocForVersion(null);
      setVersionFile(null);
      setVersionChangeLog('');
      setSuccessMsg('New version uploaded successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Failed to upload document version');
    } finally {
      setVersionUploading(false);
    }
  };

  const openHistoryModal = async (docId) => {
    try {
      const res = await api.get(`/documents/${docId}`);
      setSelectedDocDetail(res.data);
    } catch (err) {
      console.error('Failed to load document history', err);
    }
  };

  const handleDownload = async (docId, fileName) => {
    try {
      const res = await api.get(`/documents/${docId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.message || 'Failed to download document');
    }
  };

  const handleDeleteDoc = async (docId, docTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${docTitle}"?`)) return;
    try {
      await api.delete(`/documents/${docId}`);
      setSuccessMsg(`"${docTitle}" deleted successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchDocuments();
    } catch (err) {
      setError(err.message || 'Failed to delete document');
    }
  };

  // 9. Messages Handlers
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgInputText.trim()) return;
    setMsgSending(true);
    try {
      await api.post(`/projects/${id}/messages`, {
        channel: selectedChannel,
        content: msgInputText.trim(),
        isClientVisible: msgClientVisible
      });
      setMsgInputText('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setMsgSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#8c8c8c' }}>
        Loading project workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <AlertCircle size={36} color="#e03131" style={{ margin: '0 auto 0.75rem auto' }} />
        <h2 style={{ fontSize: '1.25rem', color: '#2b2b2b' }}>Project Workspace Not Found</h2>
        <button
          onClick={() => navigate(backPath)}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          {backLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(backPath)}
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
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={14} /> {backLabel}
        </button>
      </div>

      {/* Main Project Header Card */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '12px', padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.2rem 0.55rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', letterSpacing: '0.04em' }}>
                {project.projectCode}
              </span>
              {isAdmin && (
                <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.55rem', backgroundColor: '#1e1e1e', color: '#ffffff', borderRadius: '4px', letterSpacing: '0.04em' }}>
                  ADMIN GOVERNANCE
                </span>
              )}
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: project.status === 'COMPLETED' ? '#e6fcf5' : project.status === 'IN_PROGRESS' ? '#2b2b2b' : '#f1f1f1',
                color: project.status === 'COMPLETED' ? '#0ca678' : project.status === 'IN_PROGRESS' ? '#ffffff' : '#666666'
              }}>
                {project.status?.replace('_', ' ')}
              </span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: project.priority === 'URGENT' ? '#ffe3e3' : project.priority === 'HIGH' ? '#fff3bf' : '#f1f1f1',
                color: project.priority === 'URGENT' ? '#c92a2a' : project.priority === 'HIGH' ? '#d9480f' : '#495057'
              }}>
                {project.priority} PRIORITY
              </span>
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
              {project.projectName}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#666666' }}>
              <Building2 size={14} color="#8c8c8c" />
              <span>Client: <strong>{project.clientCompanyName}</strong></span>
              <span style={{ color: '#d4d4d4' }}>•</span>
              <span>Contact: {project.clientContactPerson}</span>
            </div>
          </div>

          <button
            onClick={handleOpenEditModal}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
          >
            <Edit2 size={14} /> Update Project Status
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.4rem' }}>
            <span>Milestone Completion Progress</span>
            <span>{project.progress || 0}% Complete</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${project.progress || 0}%`, height: '100%', backgroundColor: '#2b2b2b', borderRadius: '4px', transition: 'width 0.3s ease' }} />
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#ebfbee', border: '1px solid #b2f2bb', borderRadius: '6px', color: '#2b8a3e', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}
      {error && (
        <div style={{ padding: '0.85rem 1rem', backgroundColor: '#fff2f2', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Project Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        borderBottom: '1px solid #d4d4d4',
        overflowX: 'auto',
        paddingBottom: '1px'
      }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#1e1e1e' : '#666666',
                borderBottom: isActive ? '2px solid #1e1e1e' : '2px solid transparent',
                background: 'none',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} color={isActive ? '#1e1e1e' : '#8c8c8c'} />
              <span>{t.label}</span>
              {t.id === 'tasks' && tasks.length > 0 && (
                <span style={{ fontSize: '0.72rem', backgroundColor: '#f0f0f0', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 700 }}>
                  {tasks.length}
                </span>
              )}
              {t.id === 'team' && members.length > 0 && (
                <span style={{ fontSize: '0.72rem', backgroundColor: '#f0f0f0', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 700 }}>
                  {members.length}
                </span>
              )}
              {t.id === 'bugs' && bugs.length > 0 && (
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ffe3e3', color: '#c92a2a', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 700 }}>
                  {bugs.length}
                </span>
              )}
              {t.id === 'change-requests' && changeRequests.length > 0 && (
                <span style={{ fontSize: '0.72rem', backgroundColor: '#fff3bf', color: '#d9480f', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 700 }}>
                  {changeRequests.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREA */}

      {/* 1. OVERVIEW & SPECS TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Scope / Description */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.6rem 0' }}>
                Project Scope &amp; Specifications
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#4d4d4d', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-line' }}>
                {project.description || 'No detailed specifications documented yet. Use "Update Project Status" above to record client project scope.'}
              </p>
            </div>

            {/* Technology Stack */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code2 size={18} /> Technology &amp; Architecture Stack
              </h3>
              {project.technologyStack ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {project.technologyStack.split(',').map((tech, idx) => (
                    <span key={idx} style={{ padding: '0.35rem 0.75rem', backgroundColor: '#f4f4f4', border: '1px solid #e0e0e0', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b' }}>
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>No technology stack specified.</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Budget & Timeline */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                  Timeline &amp; Budget
                </h3>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: (project.remainingAmount !== null && project.remainingAmount !== undefined ? Number(project.remainingAmount) : Math.max(0, (Number(project.budget) || 0) - (Number(project.paidAmount) || 0))) === 0 && Number(project.budget) > 0 ? '#e6fcf5' : Number(project.paidAmount) > 0 ? '#e7f5ff' : '#f1f1f1',
                  color: (project.remainingAmount !== null && project.remainingAmount !== undefined ? Number(project.remainingAmount) : Math.max(0, (Number(project.budget) || 0) - (Number(project.paidAmount) || 0))) === 0 && Number(project.budget) > 0 ? '#0ca678' : Number(project.paidAmount) > 0 ? '#1971c2' : '#666666'
                }}>
                  {(project.remainingAmount !== null && project.remainingAmount !== undefined ? Number(project.remainingAmount) : Math.max(0, (Number(project.budget) || 0) - (Number(project.paidAmount) || 0))) === 0 && Number(project.budget) > 0 ? '✓ Settled in Full' : Number(project.paidAmount) > 0 ? 'Partially Paid' : 'Pending Payment'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Contract Budget</span>
                  <div style={{ fontWeight: 800, color: '#1e1e1e', fontSize: '1.35rem', marginTop: '0.15rem' }}>
                    ${project.budget ? Number(project.budget).toLocaleString() : 'N/A'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: '#fafafa', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Paid to Date</span>
                    <div style={{ fontWeight: 700, color: '#2b8a3e', fontSize: '1rem', marginTop: '0.1rem' }}>
                      ${project.paidAmount !== null && project.paidAmount !== undefined ? Number(project.paidAmount).toLocaleString() : '0'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Remaining Balance</span>
                    <div style={{ fontWeight: 800, color: Number(project.remainingAmount) > 0 ? '#d9480f' : '#2b2b2b', fontSize: '1rem', marginTop: '0.1rem' }}>
                      ${project.remainingAmount !== null && project.remainingAmount !== undefined ? Number(project.remainingAmount).toLocaleString() : (project.budget ? Number(project.budget - (project.paidAmount || 0)).toLocaleString() : '0')}
                    </div>
                  </div>
                </div>

                {/* Settlement Progress */}
                {Number(project.budget) > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#666666', marginBottom: '0.25rem' }}>
                      <span>Payment Settlement</span>
                      <span style={{ fontWeight: 700, color: '#2b2b2b' }}>
                        {Math.min(100, Math.round(((Number(project.paidAmount) || 0) / Number(project.budget)) * 100))}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e9ecef', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, Math.round(((Number(project.paidAmount) || 0) / Number(project.budget)) * 100))}%`,
                        height: '100%',
                        backgroundColor: '#2b8a3e',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Project Kickoff</span>
                  <div style={{ color: '#2b2b2b', fontWeight: 600, marginTop: '0.15rem' }}>{project.startDate}</div>
                </div>
                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.6rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Target Delivery</span>
                  <div style={{ color: '#2b2b2b', fontWeight: 600, marginTop: '0.15rem' }}>{project.expectedEndDate}</div>
                </div>
                {project.actualEndDate && (
                  <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '0.6rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Actual Delivery</span>
                    <div style={{ color: '#2b8a3e', fontWeight: 700, marginTop: '0.15rem' }}>{project.actualEndDate}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROJECT TEAM TAB */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                Allocated Team Members ({members.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#666666', margin: '0.2rem 0 0 0' }}>
                Engineers, QA specialists, and designers staffed to this project.
              </p>
            </div>
            <button
              onClick={handleOpenAssignModal}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
            >
              <Plus size={16} /> Allocate Member
            </button>
          </div>

          {members.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              <Users2 size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <div>No team members allocated to this project yet. Click "Allocate Member" to staff engineers.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {members.map((m) => (
                <div key={m.projectMemberId} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                        {m.fullName}
                      </h4>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666666' }}>
                        {m.roleCategoryName || 'General Contributor'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(m)}
                      style={{ color: '#c92a2a', padding: '0.35rem', border: 'none', background: 'none', cursor: 'pointer' }}
                      title="Deallocate member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: '#666666', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={13} color="#8c8c8c" />
                      <span>{m.email}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      <span>Allocated Workload:</span>
                      <strong style={{ color: '#1e1e1e' }}>{m.allocationPercentage || 100}%</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. SPRINT TASKS TAB */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c' }} />
                <input
                  type="text"
                  placeholder="Search sprint tasks..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="form-control"
                style={{ width: '140px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                value={taskPriorityFilter}
                onChange={(e) => setTaskPriorityFilter(e.target.value)}
                className="form-control"
                style={{ width: '140px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateTaskModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
            >
              <Plus size={16} /> Create Sprint Task
            </button>
          </div>

          {tasksLoading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              Loading sprint tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              <CheckSquare2 size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <div>No sprint tasks created for this project yet. Click "Create Sprint Task" to get started.</div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #e5e5e5', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Task Title</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Milestone</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Due Date</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Assignees</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks
                    .filter((t) => {
                      if (taskStatusFilter !== 'ALL' && t.status !== taskStatusFilter) return false;
                      if (taskPriorityFilter !== 'ALL' && t.priority !== taskPriorityFilter) return false;
                      if (taskSearch.trim() && !t.title.toLowerCase().includes(taskSearch.toLowerCase())) return false;
                      return true;
                    })
                    .map((t) => (
                      <tr
                        key={t.taskId}
                        onClick={() => setActiveTaskId(t.taskId)}
                        style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                      >
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#1e1e1e' }}>
                          {t.title}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: t.priority === 'URGENT' ? '#ffe3e3' : t.priority === 'HIGH' ? '#fff3bf' : '#f0f0f0',
                            color: t.priority === 'URGENT' ? '#c92a2a' : t.priority === 'HIGH' ? '#d9480f' : '#495057'
                          }}>
                            {t.priority}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: t.status === 'COMPLETED' ? '#ebfbee' : t.status === 'IN_PROGRESS' ? '#2b2b2b' : '#f0f0f0',
                            color: t.status === 'COMPLETED' ? '#2b8a3e' : t.status === 'IN_PROGRESS' ? '#ffffff' : '#495057'
                          }}>
                            {t.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#666666' }}>
                          {t.milestoneTitle || 'Standalone'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#666666' }}>
                          {t.dueDate || 'No due date'}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#1e1e1e' }}>
                          {t.assignees && t.assignees.length > 0 ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              {t.assignees.map((a) => a.fullName).join(', ')}
                            </span>
                          ) : (
                            <span style={{ color: '#8c8c8c', fontStyle: 'italic' }}>Unassigned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. KANBAN BOARD TAB */}
      {activeTab === 'kanban' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', minHeight: '520px' }}>
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                style={{
                  backgroundColor: '#fbfbfb',
                  border: '1px solid #e5e5e5',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '750px',
                  overflow: 'hidden'
                }}
              >
                {/* Column Header */}
                <div style={{
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid #e5e5e5',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#1e1e1e' }}>{col.title}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#f0f0f0', color: '#666666', borderRadius: '999px' }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {colTasks.map((t) => (
                    <div
                      key={t.taskId}
                      onClick={() => setActiveTaskId(t.taskId)}
                      className="card"
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: '1px solid #e5e5e5',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          backgroundColor: t.priority === 'URGENT' ? '#ffe3e3' : t.priority === 'HIGH' ? '#fff3bf' : '#f0f0f0',
                          color: t.priority === 'URGENT' ? '#c92a2a' : t.priority === 'HIGH' ? '#d9480f' : '#495057'
                        }}>
                          {t.priority}
                        </span>
                        {t.estimatedHours && (
                          <span style={{ fontSize: '0.72rem', color: '#8c8c8c' }}>{t.estimatedHours}h</span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1e1e', marginBottom: '0.6rem' }}>
                        {t.title}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '0.5rem' }}>
                        <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                          {t.assignees && t.assignees.length > 0 ? t.assignees[0].fullName.split(' ')[0] : 'Unassigned'}
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={(e) => handleMoveKanbanStatus(e, t, 'prev')}
                            disabled={col.id === 'TODO'}
                            style={{ padding: '0.2rem 0.4rem', border: '1px solid #d4d4d4', borderRadius: '4px', backgroundColor: '#ffffff', opacity: col.id === 'TODO' ? 0.3 : 1, cursor: col.id === 'TODO' ? 'not-allowed' : 'pointer' }}
                            title="Move Previous"
                          >
                            <ChevronLeft size={13} />
                          </button>
                          <button
                            onClick={(e) => handleMoveKanbanStatus(e, t, 'next')}
                            disabled={col.id === 'COMPLETED'}
                            style={{ padding: '0.2rem 0.4rem', border: '1px solid #d4d4d4', borderRadius: '4px', backgroundColor: '#ffffff', opacity: col.id === 'COMPLETED' ? 0.3 : 1, cursor: col.id === 'COMPLETED' ? 'not-allowed' : 'pointer' }}
                            title="Advance Next"
                          >
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MILESTONES TAB */}
      {activeTab === 'milestones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                Deliverable Milestones ({milestones.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#666666', margin: '0.2rem 0 0 0' }}>
                Key deliverable checkpoints, client demos, and acceptance sign-offs.
              </p>
            </div>
            <button
              onClick={() => {
                setMilestoneFormData({ title: '', description: '', targetDate: '', orderIndex: milestones.length + 1, status: 'PENDING', actualCompletionDate: '' });
                setShowCreateMilestoneModal(true);
              }}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
            >
              <Plus size={16} /> Create Milestone
            </button>
          </div>

          {milestonesLoading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              Loading deliverable milestones...
            </div>
          ) : milestones.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              <Flag size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <div>No milestones defined for this project yet. Click "Create Milestone" to establish target delivery checkpoints.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {milestones.map((m) => (
                <div key={m.milestoneId} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, padding: '0.25rem 0.6rem', backgroundColor: '#2b2b2b', color: '#ffffff', borderRadius: '4px' }}>
                        M{m.orderIndex}
                      </span>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                          {m.title}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#666666', marginTop: '0.2rem' }}>
                          Target Delivery: <strong>{m.targetDate}</strong> {m.actualCompletionDate && `• Completed on ${m.actualCompletionDate}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '4px',
                        backgroundColor: m.status === 'COMPLETED' ? '#ebfbee' : m.status === 'IN_PROGRESS' ? '#fff3bf' : '#f0f0f0',
                        color: m.status === 'COMPLETED' ? '#2b8a3e' : m.status === 'IN_PROGRESS' ? '#d9480f' : '#495057'
                      }}>
                        {m.status}
                      </span>
                      <button
                        onClick={() => {
                          setActiveMilestone(m);
                          setMilestoneFormData({
                            title: m.title,
                            description: m.description || '',
                            targetDate: m.targetDate,
                            orderIndex: m.orderIndex,
                            status: m.status,
                            actualCompletionDate: m.actualCompletionDate || ''
                          });
                          setShowEditMilestoneModal(true);
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    </div>
                  </div>

                  {m.description && (
                    <p style={{ fontSize: '0.85rem', color: '#4d4d4d', margin: '0.5rem 0 0 0', lineHeight: 1.5, backgroundColor: '#fcfcfc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                      {m.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. BUGS & RETEST TAB */}
      {activeTab === 'bugs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8c8c8c' }} />
                <input
                  type="text"
                  placeholder="Search bugs..."
                  value={bugSearch}
                  onChange={(e) => setBugSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                />
              </div>

              <select
                value={bugStatusFilter}
                onChange={(e) => setBugStatusFilter(e.target.value)}
                className="form-control"
                style={{ width: '150px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>

              <select
                value={bugSeverityFilter}
                onChange={(e) => setBugSeverityFilter(e.target.value)}
                className="form-control"
                style={{ width: '150px', fontSize: '0.85rem' }}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {bugsLoading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              Loading defects and bug tickets...
            </div>
          ) : bugs.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              <Bug size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <div>Zero defects reported on this project workspace. Clean QA build!</div>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid #e5e5e5', color: '#666666', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Defect Code &amp; Title</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Severity</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Reported By</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Assigned Dev</th>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bugs
                    .filter((b) => {
                      if (bugStatusFilter !== 'ALL' && b.status !== bugStatusFilter) return false;
                      if (bugSeverityFilter !== 'ALL' && b.severity !== bugSeverityFilter) return false;
                      if (bugSearch.trim() && !b.title.toLowerCase().includes(bugSearch.toLowerCase())) return false;
                      return true;
                    })
                    .map((b) => (
                      <tr
                        key={b.bugId}
                        onClick={() => openBugDetail(b.bugId)}
                        style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fafafa')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                      >
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.4rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', marginRight: '0.5rem' }}>
                            {b.bugCode}
                          </span>
                          <strong style={{ color: '#1e1e1e' }}>{b.title}</strong>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: b.severity === 'CRITICAL' ? '#ffe3e3' : b.severity === 'HIGH' ? '#fff3bf' : '#f0f0f0',
                            color: b.severity === 'CRITICAL' ? '#c92a2a' : b.severity === 'HIGH' ? '#d9480f' : '#495057'
                          }}>
                            {b.severity}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: b.status === 'CLOSED' || b.status === 'RESOLVED' ? '#ebfbee' : '#f0f0f0',
                            color: b.status === 'CLOSED' || b.status === 'RESOLVED' ? '#2b8a3e' : '#495057'
                          }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#666666' }}>
                          {b.reportedByName || 'QA Engineer'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#1e1e1e', fontWeight: 600 }}>
                          {b.assignedToName || <span style={{ color: '#8c8c8c', fontStyle: 'italic', fontWeight: 400 }}>Unassigned</span>}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#1e1e1e', fontWeight: 700, textDecoration: 'underline' }}>
                            Triage &amp; Assign &gt;
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. CHANGE REQUESTS TAB */}
      {activeTab === 'change-requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                Scope Change Requests ({changeRequests.length})
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#666666', margin: '0.2rem 0 0 0' }}>
                Client scope modifications, feature revisions, and contract budget impacts.
              </p>
            </div>

            <select
              value={crStatusFilter}
              onChange={(e) => setCrStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: '160px', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          {crLoading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              Loading change requests...
            </div>
          ) : changeRequests.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              <GitPullRequest size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <div>No scope change requests submitted on this project. Baseline scope intact!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {changeRequests
                .filter((cr) => crStatusFilter === 'ALL' || cr.status === crStatusFilter)
                .map((cr) => (
                  <div
                    key={cr.changeRequestId}
                    onClick={() => openCrDetail(cr.changeRequestId)}
                    className="card"
                    style={{ padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px' }}>
                            {cr.requestNumber || `CR-#${cr.changeRequestId}`}
                          </span>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                            {cr.title}
                          </h3>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666666' }}>
                          Submitted by {cr.submittedByName || 'Client'} on {new Date(cr.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '4px',
                        backgroundColor: cr.status === 'APPROVED' ? '#ebfbee' : cr.status === 'REJECTED' ? '#ffe3e3' : '#fff3bf',
                        color: cr.status === 'APPROVED' ? '#2b8a3e' : cr.status === 'REJECTED' ? '#c92a2a' : '#d9480f'
                      }}>
                        {cr.status}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.86rem', color: '#4d4d4d', margin: '0.5rem 0 0.85rem 0', lineHeight: 1.5 }}>
                      {cr.description}
                    </p>

                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: '#666666', borderTop: '1px solid #f0f0f0', paddingTop: '0.65rem' }}>
                      <div>Estimated Cost: <strong style={{ color: '#1e1e1e' }}>${Number(cr.estimatedCost || 0).toLocaleString()}</strong></div>
                      <div>Schedule Impact: <strong style={{ color: '#1e1e1e' }}>+{cr.estimatedScheduleImpactDays || 0} days</strong></div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 8. DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {DOC_CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setDocCategoryFilter(c.key)}
                  className={docCategoryFilter === c.key ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 1.1rem' }}
            >
              <Upload size={16} /> Upload Document
            </button>
          </div>

          {docLoading ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              Loading project documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#8c8c8c' }}>
              <FileText size={32} style={{ margin: '0 auto 0.5rem auto' }} />
              <div>No documents uploaded in this project repository yet. Click "Upload Document" to attach files.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {documents.map((doc) => {
                const IconComponent = getFileIcon(doc.extension);
                return (
                  <div
                    key={doc.documentId}
                    className="card"
                    style={{ padding: '1.15rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: '#f4f4f4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <IconComponent size={22} color="#2b2b2b" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                            {doc.title}
                          </h4>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.45rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                            v{doc.version}
                          </span>
                          {doc.clientVisible && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.4rem', backgroundColor: '#e6fcf5', color: '#0ca678', borderRadius: '4px' }}>
                              Client Visible
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#666666', marginTop: '0.2rem' }}>
                          {doc.fileName} • {doc.fileSizeFormatted} • Uploaded by {doc.uploadedByName} on {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleDownload(doc.documentId, doc.fileName)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
                      >
                        <Download size={14} /> Download
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDocForVersion(doc);
                          setIsVersionModalOpen(true);
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
                      >
                        <Upload size={14} /> New Version
                      </button>
                      <button
                        onClick={() => openHistoryModal(doc.documentId)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                        title="Audit Archive & History"
                      >
                        <History size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(doc.documentId, doc.title)}
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
      )}

      {/* 9. MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.25rem', height: '600px' }}>
          {/* Channels Sidebar */}
          <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', height: '100%', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c8c8c', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.05em' }}>
              Project Channels
            </div>
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '0.65rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: selectedChannel === ch.id ? '#2b2b2b' : 'transparent',
                  color: selectedChannel === ch.id ? '#ffffff' : '#2b2b2b',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}># {ch.label}</div>
                <div style={{ fontSize: '0.7rem', color: selectedChannel === ch.id ? '#cccccc' : '#8c8c8c', marginTop: '0.15rem' }}>
                  {ch.desc}
                </div>
              </button>
            ))}
          </div>

          {/* Chat Stream */}
          <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                  # {CHANNELS.find((c) => c.id === selectedChannel)?.label}
                </h3>
                <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
                  Real-time project discussion stream
                </div>
              </div>
            </div>

            {/* Messages container */}
            <div style={{ flex: 1, padding: '1rem 0', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: '0.85rem', margin: 'auto' }}>
                  No messages in this channel yet. Post an update or start the conversation!
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderEmail === user?.email;
                  return (
                    <div
                      key={m.messageId}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        gap: '0.2rem'
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', color: '#8c8c8c', padding: '0 0.25rem' }}>
                        <strong>{m.senderName}</strong> • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        style={{
                          maxWidth: '75%',
                          padding: '0.75rem 1rem',
                          borderRadius: '10px',
                          fontSize: '0.88rem',
                          backgroundColor: isMe ? '#2b2b2b' : '#f4f4f4',
                          color: isMe ? '#ffffff' : '#1e1e1e',
                          lineHeight: 1.45
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message composer */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #f0f0f0', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  placeholder={`Message #${CHANNELS.find((c) => c.id === selectedChannel)?.label}...`}
                  value={msgInputText}
                  onChange={(e) => setMsgInputText(e.target.value)}
                  className="form-control"
                  style={{ flex: 1, fontSize: '0.88rem' }}
                />
                <button
                  type="submit"
                  disabled={msgSending || !msgInputText.trim()}
                  className="btn btn-primary"
                  style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
                >
                  <Send size={15} /> Send
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#666666', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={msgClientVisible}
                    onChange={(e) => setMsgClientVisible(e.target.checked)}
                    style={{ accentColor: '#2b2b2b' }}
                  />
                  <span>Visible to Client Stakeholders</span>
                </label>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODALS (PORTALED WITH BLUR(12PX)) ================= */}

      {/* 1. EDIT PROJECT SPECS MODAL */}
      {showEditModal && createPortal(
        <div
          onClick={() => setShowEditModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.4rem 0' }}>Update Project Specs</h2>
            <form onSubmit={handleUpdateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Project Name *</label>
                <input
                  type="text"
                  required
                  value={editData.projectName}
                  onChange={(e) => setEditData({ ...editData, projectName: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="form-control"
                  >
                    <option value="PLANNING">PLANNING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="ON_HOLD">ON_HOLD</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Priority</label>
                  <select
                    value={editData.priority}
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                    className="form-control"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
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
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Expected End Date</label>
                  <input
                    type="date"
                    value={editData.expectedEndDate}
                    onChange={(e) => setEditData({ ...editData, expectedEndDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Actual End Date</label>
                  <input
                    type="date"
                    value={editData.actualEndDate}
                    onChange={(e) => setEditData({ ...editData, actualEndDate: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              {/* Financials & Settlement in Workspace Edit Modal */}
              <div style={{ padding: '0.85rem', backgroundColor: '#fcfcfc', border: '1px solid #e5e5e5', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e1e1e', textTransform: 'uppercase' }}>
                    Financial Settlement &amp; Billing
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: Number(editData.remainingAmount) === 0 && Number(editData.budget) > 0 ? '#e6fcf5' : Number(editData.paidAmount) > 0 ? '#e7f5ff' : '#f1f1f1',
                    color: Number(editData.remainingAmount) === 0 && Number(editData.budget) > 0 ? '#0ca678' : Number(editData.paidAmount) > 0 ? '#1971c2' : '#666666'
                  }}>
                    {Number(editData.remainingAmount) === 0 && Number(editData.budget) > 0 ? '✓ Settled' : Number(editData.paidAmount) > 0 ? 'Partial' : 'Pending'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.25rem' }}>Total Budget ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={editData.budget}
                      onChange={(e) => {
                        const newB = e.target.value;
                        const bNum = parseFloat(newB);
                        const pNum = parseFloat(editData.paidAmount || '0');
                        const rem = !isNaN(bNum) ? String(Math.max(0, bNum - (isNaN(pNum) ? 0 : pNum))) : '';
                        setEditData({ ...editData, budget: newB, remainingAmount: rem });
                      }}
                      className="form-control"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#2b8a3e', marginBottom: '0.25rem' }}>Paid by Client ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={editData.paidAmount}
                      onChange={(e) => {
                        const newP = e.target.value;
                        const bNum = parseFloat(editData.budget || '0');
                        const pNum = parseFloat(newP);
                        const rem = !isNaN(bNum) ? String(Math.max(0, bNum - (isNaN(pNum) ? 0 : pNum))) : '';
                        setEditData({ ...editData, paidAmount: newP, remainingAmount: rem });
                      }}
                      className="form-control"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: Number(editData.remainingAmount) > 0 ? '#d9480f' : '#2b2b2b', marginBottom: '0.25rem' }}>Remaining ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={editData.remainingAmount}
                      onChange={(e) => setEditData({ ...editData, remainingAmount: e.target.value })}
                      className="form-control"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Technology Stack</label>
                <input
                  type="text"
                  placeholder="e.g. React, Spring Boot, PostgreSQL, Docker"
                  value={editData.technologyStack}
                  onChange={(e) => setEditData({ ...editData, technologyStack: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Scope / Description</label>
                <textarea
                  rows={3}
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 2. ALLOCATE TEAM MEMBER MODAL */}
      {showAssignModal && createPortal(
        <div
          onClick={() => setShowAssignModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.4rem 0' }}>Allocate Team Member</h2>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: '0 0 1.25rem 0' }}>
              Assign an available engineer to <strong>{project.projectName}</strong>.
            </p>

            {availableCandidates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <p style={{ fontSize: '0.85rem', color: '#666666' }}>All active company engineers are already allocated to this project.</p>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleAssignMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Select Team Member *
                  </label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      const c = availableCandidates.find((cand) => cand.userId === e.target.value);
                      if (c && c.roleCategoryId) setSelectedCategoryId(c.roleCategoryId);
                    }}
                    className="form-control"
                  >
                    {availableCandidates.map((c) => (
                      <option key={c.userId} value={c.userId}>
                        {c.fullName} ({c.roleCategoryName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                    Project Specialization Role *
                  </label>
                  <select
                    required
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="form-control"
                  >
                    {roleCategories.map((rc) => (
                      <option key={rc.roleCategoryId} value={rc.roleCategoryId}>
                        {rc.roleCategoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b' }}>
                      Workload Allocation ({allocation}%)
                    </label>
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
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowAssignModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Confirm Allocation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* 3. CREATE SPRINT TASK MODAL */}
      {showCreateTaskModal && createPortal(
        <div
          onClick={() => setShowCreateTaskModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '580px',
              width: '100%',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.35rem 0' }}>
              Create Sprint Task
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#666666', margin: '0 0 1.25rem 0' }}>
              Project: <strong>{project.projectName}</strong> ({project.projectCode})
            </p>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement refresh token rotation & session expiry"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Priority</label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                    className="form-control"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="8.0"
                    value={taskFormData.estimatedHours}
                    onChange={(e) => setTaskFormData({ ...taskFormData, estimatedHours: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Start Date</label>
                  <input
                    type="date"
                    value={taskFormData.startDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, startDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Due Date</label>
                  <input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Deliverable Milestone (Optional)
                </label>
                <select
                  value={taskFormData.milestoneId}
                  onChange={(e) => setTaskFormData({ ...taskFormData, milestoneId: e.target.value })}
                  className="form-control"
                >
                  <option value="">-- None / Standalone Sprint Task --</option>
                  {milestones.map((m) => (
                    <option key={m.milestoneId} value={m.milestoneId}>
                      M{m.orderIndex}: {m.title} ({m.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assignees */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Assign Project Team Members
                </label>
                {members.length === 0 ? (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fcfcfc', border: '1px dashed #d4d4d4', borderRadius: '6px', fontSize: '0.8rem', color: '#8c8c8c' }}>
                    No team members allocated. Staff engineers in the "Project Team" tab.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '130px', overflowY: 'auto', border: '1px solid #e0e0e0', padding: '0.5rem', borderRadius: '6px' }}>
                    {members.map((m) => {
                      const isChecked = taskFormData.assigneeIds.includes(m.userId);
                      return (
                        <label key={m.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#2b2b2b', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleTaskAssignee(m.userId)}
                            style={{ accentColor: '#2b2b2b' }}
                          />
                          <span><strong>{m.fullName}</strong> — {m.roleCategoryName}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Acceptance criteria and implementation specs..."
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateTaskModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 4. CREATE / EDIT MILESTONE MODALS */}
      {showCreateMilestoneModal && createPortal(
        <div
          onClick={() => setShowCreateMilestoneModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.4rem 0' }}>Create Milestone</h2>
            <form onSubmit={handleCreateMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Milestone Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phase 1: MVP Core Architecture Demo"
                  value={milestoneFormData.title}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Target Date *</label>
                  <input
                    type="date"
                    required
                    value={milestoneFormData.targetDate}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, targetDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Order Index</label>
                  <input
                    type="number"
                    min="1"
                    value={milestoneFormData.orderIndex}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, orderIndex: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Scope / Acceptance Criteria</label>
                <textarea
                  rows={3}
                  placeholder="Deliverables included in this milestone..."
                  value={milestoneFormData.description}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateMilestoneModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {showEditMilestoneModal && activeMilestone && createPortal(
        <div
          onClick={() => setShowEditMilestoneModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.4rem 0' }}>Edit Milestone</h2>
            <form onSubmit={handleUpdateMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Milestone Title *</label>
                <input
                  type="text"
                  required
                  value={milestoneFormData.title}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Target Date *</label>
                  <input
                    type="date"
                    required
                    value={milestoneFormData.targetDate}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, targetDate: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Status</label>
                  <select
                    value={milestoneFormData.status}
                    onChange={(e) => setMilestoneFormData({ ...milestoneFormData, status: e.target.value })}
                    className="form-control"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Actual Completion Date</label>
                <input
                  type="date"
                  value={milestoneFormData.actualCompletionDate}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, actualCompletionDate: e.target.value })}
                  className="form-control"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Description</label>
                <textarea
                  rows={3}
                  value={milestoneFormData.description}
                  onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowEditMilestoneModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 5. BUG TRIAGE DRAWER MODAL */}
      {selectedBugId && activeBugDetail && createPortal(
        <div
          onClick={() => { setSelectedBugId(null); setActiveBugDetail(null); }}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              padding: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    {activeBugDetail.bugCode}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#ffe3e3', color: '#c92a2a', borderRadius: '4px' }}>
                    {activeBugDetail.severity}
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    {activeBugDetail.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                  {activeBugDetail.title}
                </h2>
              </div>
              <button
                onClick={() => { setSelectedBugId(null); setActiveBugDetail(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Developer Assignment Section */}
            <div style={{ backgroundColor: '#fbfbfb', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Assigned Developer (Project Team)
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select
                  value={selectedAssigneeId}
                  onChange={(e) => setSelectedAssigneeId(e.target.value)}
                  className="form-control"
                  style={{ flex: 1 }}
                >
                  <option value="">-- Unassigned --</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullName} ({m.roleCategoryName})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignBug}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}
                >
                  Save Assignment
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              {activeBugDetail.description && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Description</span>
                  <p style={{ fontSize: '0.86rem', color: '#2b2b2b', margin: '0.2rem 0 0 0', backgroundColor: '#fcfcfc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                    {activeBugDetail.description}
                  </p>
                </div>
              )}

              {activeBugDetail.stepsToReproduce && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Steps to Reproduce</span>
                  <pre style={{ fontSize: '0.82rem', color: '#2b2b2b', margin: '0.2rem 0 0 0', padding: '0.75rem', backgroundColor: '#fcfcfc', borderRadius: '6px', border: '1px solid #f0f0f0', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {activeBugDetail.stepsToReproduce}
                  </pre>
                </div>
              )}
            </div>

            {/* Comments Thread */}
            <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 0.75rem 0' }}>
                Defect Discussion ({activeBugDetail.comments?.length || 0})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto', marginBottom: '0.75rem' }}>
                {activeBugDetail.comments?.map((c) => (
                  <div key={c.commentId} style={{ padding: '0.6rem 0.85rem', backgroundColor: '#fafafa', borderRadius: '6px', border: '1px solid #e8e8e8', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <strong>{c.authorName}</strong>
                      <span style={{ fontSize: '0.7rem', color: '#8c8c8c' }}>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p style={{ margin: 0, color: '#4d4d4d' }}>{c.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddBugComment} style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Post comment to defect discussion..."
                  value={bugCommentContent}
                  onChange={(e) => setBugCommentContent(e.target.value)}
                  className="form-control"
                  style={{ flex: 1, fontSize: '0.85rem' }}
                />
                <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }}>
                  <Send size={13} /> Send
                </button>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 6. CHANGE REQUEST REVIEW MODAL */}
      {selectedCrId && activeCrDetail && createPortal(
        <div
          onClick={() => { setSelectedCrId(null); setActiveCrDetail(null); }}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              padding: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                  {activeCrDetail.requestNumber || `CR-#${activeCrDetail.changeRequestId}`}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1e1e', margin: '0.35rem 0 0 0' }}>
                  {activeCrDetail.title}
                </h2>
              </div>
              <button
                onClick={() => { setSelectedCrId(null); setActiveCrDetail(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>Scope Modification Summary</span>
                <p style={{ fontSize: '0.88rem', color: '#2b2b2b', margin: '0.2rem 0 0 0', backgroundColor: '#fcfcfc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f0f0f0' }}>
                  {activeCrDetail.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Approved Cost ($)</label>
                  <input
                    type="number"
                    value={crApprovedCost}
                    onChange={(e) => setCrApprovedCost(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Approved Schedule Impact (Days)</label>
                  <input
                    type="number"
                    value={crApprovedDays}
                    onChange={(e) => setCrApprovedDays(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Manager Review Findings &amp; Notes</label>
                <textarea
                  rows={3}
                  placeholder="Record assessment, feasibility notes, or rationale for approval/rejection..."
                  value={crReviewNotes}
                  onChange={(e) => setCrReviewNotes(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e5e5e5', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => handleReviewCr('REJECTED')}
                style={{ padding: '0.6rem 1.25rem', backgroundColor: '#fff5f5', color: '#c92a2a', border: '1px solid #ffc9c9', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Reject Scope Change
              </button>
              <button
                type="button"
                onClick={() => handleReviewCr('APPROVED')}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
              >
                Approve Scope Change
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 7. UPLOAD DOCUMENT MODAL */}
      {isUploadModalOpen && createPortal(
        <div
          onClick={() => setIsUploadModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '580px',
              width: '100%',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Upload size={20} color="#1e1e1e" />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                    Upload Project Document
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: '#666666', margin: '0.2rem 0 0 0' }}>
                    Attach specifications, deliverables, or contracts to <strong>{project.projectName}</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
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
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Upload size={20} color="#444444" />
                    </div>
                    <div style={{ fontSize: '0.88rem' }}>
                      <span style={{ fontWeight: 700, color: '#1e1e1e' }}>Click to browse</span> or drag and drop file here
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>PDF, DOCX, XLSX, Images, ZIP (up to 50 MB)</span>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#f8fbf9', border: '1px solid #b2f2bb', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#e6fcf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {React.createElement(getFileIcon(uploadFile.name.slice(uploadFile.name.lastIndexOf('.'))), { size: 20, color: '#0ca678' })}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1e1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {uploadFile.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666666' }}>{formatBytes(uploadFile.size)} • Ready to upload</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.35rem 0.65rem', border: '1px solid #d4d4d4', borderRadius: '6px', backgroundColor: '#ffffff' }}
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        style={{ padding: '0.35rem', color: '#8c8c8c', border: 'none', background: 'none', cursor: 'pointer' }}
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>
                  Document Display Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Service Agreement 2026"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Category *</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="form-control"
                    style={{ height: '46px' }}
                  >
                    {DOC_CATEGORIES.filter((c) => c.key !== 'ALL').map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Client Visibility</label>
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
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {uploadClientVisible ? <Eye size={16} color="#0ca678" /> : <EyeOff size={16} color="#8c8c8c" />}
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: uploadClientVisible ? '#1e1e1e' : '#666666' }}>
                        {uploadClientVisible ? 'Visible to Client' : 'Internal Only'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={uploadClientVisible}
                      onChange={() => {}}
                      style={{ accentColor: '#2b2b2b', width: '16px', height: '16px' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Description Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="btn btn-primary"
                >
                  {uploading ? 'Uploading...' : 'Save & Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 8. UPLOAD NEW VERSION MODAL */}
      {isVersionModalOpen && selectedDocForVersion && createPortal(
        <div
          onClick={() => setIsVersionModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666666', textTransform: 'uppercase' }}>REVISION UPDATE</div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e1e1e', margin: '0.2rem 0 0 0' }}>
                  Upload v{selectedDocForVersion.version + 1} for "{selectedDocForVersion.title}"
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsVersionModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleVersionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Select Replacement File *</label>
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
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Upload size={20} color="#444444" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1e1e' }}>Click to browse replacement file</span>
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#f8fbf9', border: '1px solid #b2f2bb', borderRadius: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e1e1e' }}>{versionFile.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666666' }}>{formatBytes(versionFile.size)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVersionFile(null)}
                      style={{ padding: '0.35rem', color: '#8c8c8c', border: 'none', background: 'none', cursor: 'pointer' }}
                    >
                      <X size={16} />
                    </button>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '0.35rem' }}>Changelog / Revision Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what changed in this version..."
                  value={versionChangeLog}
                  onChange={(e) => setVersionChangeLog(e.target.value)}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsVersionModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={versionUploading || !versionFile}
                  className="btn btn-primary"
                >
                  {versionUploading ? 'Uploading...' : `Upload v${selectedDocForVersion.version + 1}`}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 9. VERSION HISTORY ARCHIVE MODAL */}
      {selectedDocDetail && createPortal(
        <div
          onClick={() => setSelectedDocDetail(null)}
          style={{
            position: 'fixed',
            inset: 0,
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
            className="animate-scale-up"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '2rem 2.25rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#666666' }}>DOCUMENT AUDIT ARCHIVE</div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                  {selectedDocDetail.title} — Version History
                </h2>
              </div>
              <button onClick={() => setSelectedDocDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8c8c8c' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Current Active */}
              <div style={{ padding: '1rem', backgroundColor: '#fafafa', border: '1px solid #2b2b2b', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.5rem', backgroundColor: '#2b2b2b', color: '#ffffff', borderRadius: '4px' }}>
                    v{selectedDocDetail.version} (CURRENT)
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#666666' }}>{selectedDocDetail.fileSizeFormatted}</span>
                </div>
                <strong style={{ fontSize: '0.9rem', color: '#2b2b2b' }}>{selectedDocDetail.fileName}</strong>
                <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.2rem' }}>
                  Uploaded by {selectedDocDetail.uploadedByName} on {new Date(selectedDocDetail.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Archived Versions */}
              {selectedDocDetail.versions && selectedDocDetail.versions.length > 0 ? (
                selectedDocDetail.versions.map((v) => (
                  <div key={v.versionId} style={{ padding: '0.85rem 1rem', backgroundColor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.45rem', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                        v{v.versionNumber}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>{v.fileSizeFormatted}</span>
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#2b2b2b' }}>{v.fileName}</div>
                    {v.changeLog && (
                      <p style={{ fontSize: '0.8rem', color: '#666666', margin: '0.25rem 0', fontStyle: 'italic' }}>
                        "{v.changeLog}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#8c8c8c', fontSize: '0.85rem' }}>
                  No prior revisions archived for this document.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e5e5e5', paddingTop: '1rem' }}>
              <button onClick={() => setSelectedDocDetail(null)} className="btn btn-secondary">
                Close Archive
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* TASK DETAIL DRAWER MODAL */}
      {activeTaskId && (
        <TaskDetailModal
          taskId={activeTaskId}
          onClose={() => setActiveTaskId(null)}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;
