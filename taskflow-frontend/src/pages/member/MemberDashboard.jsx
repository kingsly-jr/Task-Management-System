import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  CheckSquare2,
  Clock,
  Bug,
  FolderKanban,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const MemberDashboard = () => {
  const { user } = useAuth();

  const metrics = [
    { title: 'My Projects', value: '2', change: 'E-Commerce & Core API', icon: FolderKanban },
    { title: 'Assigned Tasks', value: '7', change: '3 in progress', icon: CheckSquare2 },
    { title: 'Bugs Assigned', value: '1', change: 'Needs retest', icon: Bug },
    { title: 'Hours Logged', value: '34.5h', change: 'This week', icon: Clock },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b' }}>
            Hello, {user?.firstName}
          </h1>
          <span className="badge badge-dark">{user?.roleCategory || 'Team Member'}</span>
        </div>
        <p style={{ color: '#666666', fontSize: '0.92rem' }}>
          Your active sprints, assigned subtasks, reported blockers, and recorded timesheets.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#666666' }}>{m.title}</span>
                <div style={{
                  padding: '0.4rem',
                  backgroundColor: '#f4f4f4',
                  borderRadius: '6px',
                  color: '#2b2b2b'
                }}>
                  <Icon size={16} />
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.25rem' }}>
                {m.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>{m.change}</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2b2b2b', marginBottom: '1rem' }}>
          Team Member Workspace Initialized
        </h3>
        <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
          Role specialization mapped to <strong>{user?.roleCategory || 'General'}</strong>. Task execution workflows, interactive Kanban drag-and-drop, task comments, and time logging will be enabled in Phase 4.
        </p>
      </div>
    </div>
  );
};

export default MemberDashboard;
