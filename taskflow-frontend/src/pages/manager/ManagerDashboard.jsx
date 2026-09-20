import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FolderKanban,
  CheckSquare2,
  Users2,
  Clock,
  AlertTriangle,
  GitPullRequest,
  CheckCircle2
} from 'lucide-react';

const ManagerDashboard = () => {
  const { user } = useAuth();

  const metrics = [
    { title: 'My Assigned Projects', value: '3', change: '2 Active, 1 Planning', icon: FolderKanban },
    { title: 'Active Tasks', value: '28', change: '6 In Review', icon: CheckSquare2 },
    { title: 'Project Team Members', value: '11', change: 'Across 3 projects', icon: Users2 },
    { title: 'Open Client Requests', value: '2', change: 'Pending review', icon: GitPullRequest },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
          Project Delivery Workspace — {user?.fullName}
        </h1>
        <p style={{ color: '#666666', fontSize: '0.92rem' }}>
          Track sprint progress, team allocations, milestones, and pending change reviews.
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
          Manager Portal Baseline Initialized
        </h3>
        <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
          Project Manager authentication and portal routing verified. Project assignment, team allocation by role category, and task Kanban boards will be connected in Phase 3 and Phase 4.
        </p>
      </div>
    </div>
  );
};

export default ManagerDashboard;
