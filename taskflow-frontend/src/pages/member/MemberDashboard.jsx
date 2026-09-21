import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  CheckSquare2,
  Clock,
  Bug,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Kanban,
  Plus,
  ArrowRight,
  Calendar,
  Building2,
  User,
  Activity,
  ChevronRight
} from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [worklogSummary, setWorklogSummary] = useState({
    totalHours: 0,
    billableHours: 0,
    nonBillableHours: 0,
    approvedHours: 0,
    pendingHours: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projsRes, tasksRes, bugsRes, summaryRes] = await Promise.all([
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/tasks/my-tasks').catch(() => ({ data: [] })),
        api.get('/bugs/my-bugs', { params: { filter: 'ASSIGNED' } }).catch(() => ({ data: [] })),
        api.get('/worklogs/summary').catch(() => ({ data: { data: null } }))
      ]);

      setProjects(projsRes.data || []);
      setTasks(tasksRes.data || []);
      setBugs(bugsRes.data || []);
      if (summaryRes.data?.data) {
        setWorklogSummary(summaryRes.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Computed metrics
  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const openBugs = bugs.filter((b) => b.status === 'OPEN' || b.status === 'IN_PROGRESS');
  const totalHours = worklogSummary.totalHours || 0;

  const getTaskPriorityBadge = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'URGENT':
        return { bg: '#fff5f5', color: '#e03131', label: 'URGENT' };
      case 'HIGH':
        return { bg: '#fff0f6', color: '#c2255c', label: 'HIGH' };
      case 'MEDIUM':
        return { bg: '#eff6ff', color: '#2563eb', label: 'MEDIUM' };
      default:
        return { bg: '#f8fafc', color: '#64748b', label: 'LOW' };
    }
  };

  const getTaskStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'DONE':
        return { bg: '#e6fcf5', color: '#0ca678', label: 'DONE' };
      case 'IN_PROGRESS':
        return { bg: '#1e1e1e', color: '#ffffff', label: 'IN PROGRESS' };
      case 'IN_REVIEW':
        return { bg: '#fff9db', color: '#f59f00', label: 'IN REVIEW' };
      case 'BLOCKED':
        return { bg: '#fff5f5', color: '#fa5252', label: 'BLOCKED' };
      default:
        return { bg: '#f3f4f6', color: '#4b5563', label: 'TODO' };
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1e1e1e' }}>
              Hello, {user?.firstName || 'Team Member'}
            </h1>
            <span className="badge badge-dark">
              {user?.roleCategory || 'Full Stack Developer'}
            </span>
          </div>
          <p style={{ color: '#666666', fontSize: '0.92rem' }}>
            Your daily workload, active sprints, assigned subtasks, reported blockers, and recorded timesheets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/member/time-tracking')} className="btn-secondary">
            <Clock size={16} /> Log Time
          </button>
          <button onClick={() => navigate('/member/kanban')} className="btn-primary">
            <Kanban size={16} /> Task Board
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fff4f4',
          border: '1px solid #e0b4b4',
          color: '#b00020',
          padding: '0.85rem 1.15rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic 4-KPI Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Projects */}
        <div
          className="card"
          style={{ padding: '1.35rem', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
          onClick={() => navigate('/member/projects')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>My Projects</span>
            <div style={{ padding: '0.45rem', backgroundColor: '#f4f4f4', borderRadius: '6px', color: '#1e1e1e' }}>
              <FolderKanban size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1e1e1e', marginBottom: '0.2rem' }}>
            {projects.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>
            {activeProjects.length} active in progress
          </div>
        </div>

        {/* Assigned Tasks */}
        <div
          className="card"
          style={{ padding: '1.35rem', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
          onClick={() => navigate('/member/tasks')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Assigned Tasks</span>
            <div style={{ padding: '0.45rem', backgroundColor: '#eff6ff', borderRadius: '6px', color: '#2563eb' }}>
              <CheckSquare2 size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1e1e1e', marginBottom: '0.2rem' }}>
            {tasks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: inProgressTasks.length > 0 ? '#2563eb' : '#8c8c8c' }}>
            {inProgressTasks.length} currently in progress
          </div>
        </div>

        {/* Bugs Assigned */}
        <div
          className="card"
          style={{ padding: '1.35rem', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
          onClick={() => navigate('/member/bugs')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Bugs Assigned</span>
            <div style={{ padding: '0.45rem', backgroundColor: '#fff5f5', borderRadius: '6px', color: '#e03131' }}>
              <Bug size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: openBugs.length > 0 ? '#e03131' : '#1e1e1e', marginBottom: '0.2rem' }}>
            {bugs.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: openBugs.length > 0 ? '#e03131' : '#8c8c8c' }}>
            {openBugs.length > 0 ? `${openBugs.length} require action` : 'All bugs resolved'}
          </div>
        </div>

        {/* Hours Logged */}
        <div
          className="card"
          style={{ padding: '1.35rem', cursor: 'pointer', transition: 'border-color 0.15s ease' }}
          onClick={() => navigate('/member/time-tracking')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>Hours Logged</span>
            <div style={{ padding: '0.45rem', backgroundColor: '#e6fcf5', borderRadius: '6px', color: '#0ca678' }}>
              <Clock size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#1e1e1e', marginBottom: '0.2rem' }}>
            {totalHours}h
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0ca678' }}>
            {worklogSummary.billableHours || 0}h billable logged
          </div>
        </div>
      </div>

      {/* Main Content Grid: Assigned Tasks & Active Projects */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Recent Assigned Tasks */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                My Assigned Tasks
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#666666' }}>Tasks queued or active in your sprint</span>
            </div>
            <button
              onClick={() => navigate('/member/tasks')}
              className="btn-ghost"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            >
              View All ({tasks.length}) <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#8c8c8c', fontSize: '0.88rem' }}>
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#8c8c8c' }}>
              <CheckSquare2 size={36} style={{ margin: '0 auto 0.65rem auto', color: '#b3b3b3' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444444', marginBottom: '0.25rem' }}>
                No Tasks Currently Assigned
              </p>
              <p style={{ fontSize: '0.8rem', color: '#8c8c8c' }}>
                When project managers assign tasks or tickets to you, they will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.slice(0, 5).map((t) => {
                const priorityInfo = getTaskPriorityBadge(t.priority);
                const statusInfo = getTaskStatusBadge(t.status);

                return (
                  <div
                    key={t.taskId}
                    onClick={() => navigate('/member/tasks')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#fbfbfb',
                      border: '1px solid #eeeeee',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f4'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fbfbfb'; }}
                  >
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#666666' }}>{t.taskCode}</span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          backgroundColor: priorityInfo.bg,
                          color: priorityInfo.color
                        }}>
                          {priorityInfo.label}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        color: '#1e1e1e',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.15rem' }}>
                        {t.projectName || 'Active Project'}
                      </div>
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                      flexShrink: 0
                    }}>
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Projects Overview */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
                Assigned Projects
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#666666' }}>Active initiatives you are developing</span>
            </div>
            <button
              onClick={() => navigate('/member/projects')}
              className="btn-ghost"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            >
              View All ({projects.length}) <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#8c8c8c', fontSize: '0.88rem' }}>
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#8c8c8c' }}>
              <FolderKanban size={36} style={{ margin: '0 auto 0.65rem auto', color: '#b3b3b3' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#444444', marginBottom: '0.25rem' }}>
                No Projects Assigned
              </p>
              <p style={{ fontSize: '0.8rem', color: '#8c8c8c' }}>
                You have not yet been assigned to any project by your team lead.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {projects.slice(0, 4).map((p) => (
                <div
                  key={p.projectId}
                  onClick={() => navigate('/member/projects')}
                  style={{
                    padding: '1rem',
                    borderRadius: '8px',
                    backgroundColor: '#fbfbfb',
                    border: '1px solid #eeeeee',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fbfbfb'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8c8c8c', textTransform: 'uppercase' }}>
                        {p.projectCode}
                      </span>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e1e1e', margin: '0.1rem 0' }}>
                        {p.projectName}
                      </h4>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: p.status === 'IN_PROGRESS' ? '#1e1e1e' : '#f3f4f6',
                      color: p.status === 'IN_PROGRESS' ? '#ffffff' : '#4b5563'
                    }}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', color: '#666666', marginBottom: '0.65rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Building2 size={13} /> {p.clientCompanyName || 'Internal'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <User size={13} /> PM: {p.projectManagerName}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 600, color: '#666666', marginBottom: '0.25rem' }}>
                      <span>Progress</span>
                      <span>{p.progress || 0}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#e5e5e5', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(0, p.progress || 0))}%`,
                          backgroundColor: '#1e1e1e',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e1e1e', margin: 0 }}>
              Team Member Shortcuts
            </h3>
            <p style={{ color: '#666666', fontSize: '0.82rem', margin: '0.25rem 0 0 0' }}>
              Direct access to execution workflows and sprint tracking tools.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div
            onClick={() => navigate('/member/kanban')}
            style={{
              padding: '1.15rem',
              borderRadius: '8px',
              backgroundColor: '#fbfbfb',
              border: '1px solid #e5e5e5',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.backgroundColor = '#fbfbfb'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
              <Kanban size={18} color="#1e1e1e" />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e1e1e' }}>Interactive Board</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#666666', margin: 0, lineHeight: 1.4 }}>
              Drag-and-drop tasks across Todo, In Progress, Review, and Done.
            </p>
          </div>

          <div
            onClick={() => navigate('/member/time-tracking')}
            style={{
              padding: '1.15rem',
              borderRadius: '8px',
              backgroundColor: '#fbfbfb',
              border: '1px solid #e5e5e5',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.backgroundColor = '#fbfbfb'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
              <Clock size={18} color="#0ca678" />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e1e1e' }}>Timesheets & Timer</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#666666', margin: 0, lineHeight: 1.4 }}>
              Log billable hours or start the live task stopwatch for accurate reporting.
            </p>
          </div>

          <div
            onClick={() => navigate('/member/bugs')}
            style={{
              padding: '1.15rem',
              borderRadius: '8px',
              backgroundColor: '#fbfbfb',
              border: '1px solid #e5e5e5',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.backgroundColor = '#fbfbfb'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
              <Bug size={18} color="#e03131" />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e1e1e' }}>Bugs & Issues</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#666666', margin: 0, lineHeight: 1.4 }}>
              Report regression issues or resolve tickets assigned by QA and PMs.
            </p>
          </div>

          <div
            onClick={() => navigate('/member/documents')}
            style={{
              padding: '1.15rem',
              borderRadius: '8px',
              backgroundColor: '#fbfbfb',
              border: '1px solid #e5e5e5',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.backgroundColor = '#ffffff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.backgroundColor = '#fbfbfb'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
              <FolderKanban size={18} color="#4b5563" />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e1e1e' }}>Project Specs</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#666666', margin: 0, lineHeight: 1.4 }}>
              Access architecture specs, uploaded sprint assets, and contract docs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
