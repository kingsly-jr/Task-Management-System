import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import TaskDetailModal from '../../components/TaskDetailModal';
import {
  Kanban,
  FolderKanban,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Calendar,
  AlertCircle,
  Plus
} from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: '#666666', bg: '#f5f5f5' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#2b2b2b', bg: '#ececec' },
  { id: 'IN_REVIEW', title: 'In Review', color: '#099268', bg: '#e6fcf5' },
  { id: 'BLOCKED', title: 'Blocked', color: '#e03131', bg: '#ffe3e3' },
  { id: 'COMPLETED', title: 'Completed', color: '#2b8a3e', bg: '#ebfbee' },
];

const ManagerKanbanPage = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTaskId, setActiveTaskId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks();
    }
  }, [selectedProjectId]);

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

  const fetchTasks = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/projects/${selectedProjectId}/tasks`);
      setTasks(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveStatus = async (e, task, direction) => {
    e.stopPropagation();
    const order = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'];
    const currentIdx = order.indexOf(task.status);
    let targetStatus;

    if (currentIdx === -1) {
      // If currently BLOCKED
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
        setError(err.message || 'Failed to update task status');
      }
    }
  };

  const currentProject = projects.find((p) => p.projectId === selectedProjectId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2b2b2b', letterSpacing: '-0.02em', margin: 0 }}>
            Interactive Kanban Board
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666666' }}>
            Visual sprint board for workload tracking and progressive milestone transitions.
          </p>
        </div>

        {/* Project Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#ffffff', border: '1px solid #d4d4d4', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
          <FolderKanban size={18} color="#2b2b2b" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b', cursor: 'pointer' }}
          >
            {projects.map((p) => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName} ({p.projectCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fff2f2', border: '1px solid #ffc9c9', borderRadius: '6px', color: '#c92a2a', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Board Columns Container */}
      <div style={{ display: 'flex', gap: '1rem', flex: 1, overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              style={{
                width: '300px',
                minWidth: '280px',
                backgroundColor: '#f8f8f8',
                border: '1px solid #e2e2e2',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%',
              }}
            >
              {/* Column Header */}
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid #e2e2e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2b2b2b' }}>{col.title}</span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', backgroundColor: col.bg, color: col.color, borderRadius: '12px' }}>
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Column Cards List */}
              <div style={{ padding: '0.75rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {colTasks.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#b3b3b3', fontSize: '0.78rem' }}>
                    No tasks in {col.title.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.taskId}
                      onClick={() => setActiveTaskId(t.taskId)}
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d4d4d4',
                        borderRadius: '6px',
                        padding: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'transform 0.1s, box-shadow 0.1s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
                      }}
                    >
                      {/* Top: Code & Priority */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.4rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px', letterSpacing: '0.04em' }}>
                          {t.taskCode}
                        </span>

                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            backgroundColor: t.priority === 'URGENT' ? '#ffe3e3' : t.priority === 'HIGH' ? '#fff3bf' : '#f1f1f1',
                            color: t.priority === 'URGENT' ? '#c92a2a' : t.priority === 'HIGH' ? '#d9480f' : '#495057',
                          }}
                        >
                          {t.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2b2b2b', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                        {t.title}
                      </h4>

                      {/* Checklist & Dates */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#666666', marginBottom: '0.65rem' }}>
                        {t.subtasksCount > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckSquare size={12} color="#2b8a3e" />
                            {t.completedSubtasksCount}/{t.subtasksCount}
                          </span>
                        ) : (
                          <span />
                        )}

                        {t.dueDate && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={12} color="#8c8c8c" /> {t.dueDate}
                          </span>
                        )}
                      </div>

                      {/* Bottom Footer: Assignees & Movement Buttons */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '0.5rem' }}>
                        {/* Assignee Avatars */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          {t.assignees?.map((a) => (
                            <div
                              key={a.userId}
                              title={a.fullName}
                              style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#2b2b2b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.65rem' }}
                            >
                              {a.fullName.charAt(0)}
                            </div>
                          ))}
                        </div>

                        {/* Quick state change buttons */}
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          {col.id !== 'TODO' && (
                            <button
                              title="Move back"
                              onClick={(e) => handleMoveStatus(e, t, 'prev')}
                              style={{ padding: '0.2rem 0.4rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <ChevronLeft size={12} />
                            </button>
                          )}

                          {col.id !== 'COMPLETED' && (
                            <button
                              title="Move forward"
                              onClick={(e) => handleMoveStatus(e, t, 'next')}
                              style={{ padding: '0.2rem 0.4rem', border: '1px solid #d4d4d4', backgroundColor: '#ffffff', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Details Drawer Modal */}
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

export default ManagerKanbanPage;
