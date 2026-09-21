import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import {
  FolderKanban,
  Flag,
  CheckCircle2,
  Clock,
  GitPullRequest,
  ShieldCheck,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalMilestonesCount, setTotalMilestonesCount] = useState(0);
  const [completedMilestonesCount, setCompletedMilestonesCount] = useState(0);

  useEffect(() => {
    fetchClientOverview();
  }, []);

  const fetchClientOverview = async () => {
    try {
      const res = await api.get('/projects');
      const list = res.data || [];
      setProjects(list);

      // Fetch milestone totals for client projects
      let totalM = 0;
      let completedM = 0;
      for (const p of list) {
        try {
          const statsRes = await api.get(`/projects/${p.projectId}/milestones/stats`);
          if (statsRes.data) {
            totalM += statsRes.data.total || 0;
            completedM += statsRes.data.completed || 0;
          }
        } catch (e) {
          // ignore individual stats fail
        }
      }
      setTotalMilestonesCount(totalM);
      setCompletedMilestonesCount(completedM);
    } catch (err) {
      console.error('Failed to load client dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const avgProgress = projects.length > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.progressPercentage || 0), 0) / projects.length)
    : 0;

  const totalContractValue = projects.reduce((acc, p) => acc + (Number(p.budget) || 0), 0);
  const totalPaid = projects.reduce((acc, p) => acc + (Number(p.paidAmount) || 0), 0);
  const totalRemaining = projects.reduce((acc, p) => {
    const rem = p.remainingAmount !== null && p.remainingAmount !== undefined
      ? Number(p.remainingAmount)
      : Math.max(0, (Number(p.budget) || 0) - (Number(p.paidAmount) || 0));
    return acc + rem;
  }, 0);
  const settlementPct = totalContractValue > 0 ? Math.round((totalPaid / totalContractValue) * 100) : 0;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Top Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
          Client Portal Overview — {user?.fullName}
        </h1>
        <p style={{ color: '#666666', fontSize: '0.92rem', margin: 0 }}>
          Transparent, real-time access to your contracted projects, milestones, release deliverables, and change requests.
        </p>
      </div>

      {/* Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#666666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Contracted Projects
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2b2b2b' }}>
            {loading ? '—' : projects.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.2rem' }}>
            Active corporate engagements
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#666666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Overall Delivery Progress
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2b2b2b' }}>
            {loading ? '—' : `${avgProgress}%`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.2rem' }}>
            Across all active projects
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#666666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Delivered Milestones
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0ca678' }}>
            {loading ? '—' : `${completedMilestonesCount} / ${totalMilestonesCount}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.2rem' }}>
            Passed acceptance &amp; demo
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#666666', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Contract Settlement
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2b8a3e' }}>
            {loading ? '—' : `$${totalPaid.toLocaleString()}`}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#8c8c8c', marginTop: '0.2rem' }}>
            {settlementPct}% settled (${totalRemaining.toLocaleString()} due)
          </div>
        </div>
      </div>

      {/* Active Projects Quick List */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#2b2b2b', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderKanban size={18} color="#2b2b2b" /> Your Active Contracts
          </h2>
          <Link
            to="/client/projects"
            style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2b2b2b', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
          >
            View All Deliverables <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.88rem' }}>
            Loading your contracts...
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#8c8c8c', fontSize: '0.88rem' }}>
            No contracted projects currently associated with your account.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {projects.map((p) => (
              <div
                key={p.projectId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  backgroundColor: '#fafafa',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.15rem 0.45rem', backgroundColor: '#f0f0f0', color: '#2b2b2b', borderRadius: '4px' }}>
                    {p.projectCode}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#2b2b2b', margin: 0 }}>
                      {p.projectName}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#666666' }}>
                      PM: <strong>{p.projectManagerName || 'Appointed Manager'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  {/* Financial Settlement */}
                  <div style={{ minWidth: '130px', fontSize: '0.75rem', textAlign: 'right' }}>
                    <div style={{ color: '#8c8c8c' }}>Contract Value: <strong style={{ color: '#2b2b2b' }}>${Number(p.budget || 0).toLocaleString()}</strong></div>
                    <div style={{ color: '#2b8a3e' }}>Paid: <strong>${Number(p.paidAmount || 0).toLocaleString()}</strong></div>
                    <div style={{ color: Number(p.remainingAmount) > 0 ? '#d9480f' : '#0ca678', fontWeight: 700 }}>
                      {Number(p.remainingAmount) > 0 ? `Due: $${Number(p.remainingAmount).toLocaleString()}` : '✓ Settled'}
                    </div>
                  </div>

                  <div style={{ width: '110px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#666666' }}>Progress</span>
                      <span style={{ fontWeight: 800, color: '#2b2b2b' }}>{p.progressPercentage}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: '#e5e5e5', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${p.progressPercentage}%`,
                          backgroundColor: p.progressPercentage === 100 ? '#0ca678' : '#2b2b2b'
                        }}
                      />
                    </div>
                  </div>

                  <Link
                    to="/client/projects"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    Roadmap <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Portal Navigation Modules */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1e1e', margin: '0 0 1rem 0' }}>
          Portal Management Hub
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <Link
            to="/client/deliverables"
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e5e5e5',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'box-shadow 0.2s'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c8c8c', textTransform: 'uppercase' }}>Scope &amp; Roadmaps</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e1e1e', margin: '0.25rem 0 0.35rem 0' }}>
                Milestones &amp; Deliverables
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
                Track milestone acceptance criteria, release dates, and sprint deliverables.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700, color: '#1e1e1e', marginTop: '1rem' }}>
              View Deliverables <ChevronRight size={13} />
            </div>
          </Link>

          <Link
            to="/client/feedback"
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e5e5e5',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'box-shadow 0.2s'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c8c8c', textTransform: 'uppercase' }}>Delivery Reviews</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e1e1e', margin: '0.25rem 0 0.35rem 0' }}>
                Project Completion Feedback
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
                Submit ratings, quality evaluations, and testimonials for completed contracts.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700, color: '#1e1e1e', marginTop: '1rem' }}>
              Submit Reviews <ChevronRight size={13} />
            </div>
          </Link>

          <Link
            to="/client/invoices"
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e5e5e5',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'box-shadow 0.2s'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c8c8c', textTransform: 'uppercase' }}>Settlement &amp; Billing</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e1e1e', margin: '0.25rem 0 0.35rem 0' }}>
                Invoices &amp; Billing
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
                Review contract billing history, paid receipts, and payment terms.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700, color: '#1e1e1e', marginTop: '1rem' }}>
              View Invoices <ChevronRight size={13} />
            </div>
          </Link>

          <Link
            to="/client/settings"
            className="card"
            style={{
              padding: '1.25rem',
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #e5e5e5',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'box-shadow 0.2s'
            }}
          >
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c8c8c', textTransform: 'uppercase' }}>Profile &amp; Security</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e1e1e', margin: '0.25rem 0 0.35rem 0' }}>
                Company Settings
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#666666', margin: 0 }}>
                Manage organization profile, representative contact details, and password security.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 700, color: '#1e1e1e', marginTop: '1rem' }}>
              Open Settings <ChevronRight size={13} />
            </div>
          </Link>
        </div>
      </div>

      {/* Security Privacy Notice */}
      <div className="card" style={{ borderLeft: '4px solid #2b2b2b' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
          <ShieldCheck size={22} color="#2b2b2b" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.25rem', color: '#2b2b2b' }}>
              Client Privacy &amp; Data Isolation Guaranteed
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#666666', lineHeight: 1.5, margin: 0 }}>
              TaskFlow strictly isolates client data at the backend level. You will only ever view contracted assets, approved milestones, and client-visible releases belonging to your organization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
