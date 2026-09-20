import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Briefcase,
  Users2,
  Building2,
  FolderKanban,
  CheckSquare2,
  Kanban,
  Bug,
  GitPullRequest,
  Lock,
  ArrowRight,
  Database,
  Layers,
  ChevronRight,
  Clock,
  FileCheck2,
  History
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#2b2b2b' }}>
      {/* Fixed Minimalist Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '68px',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #d4d4d4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        zIndex: 100
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#2b2b2b',
            color: '#ffffff',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.05rem',
            letterSpacing: '-0.02em'
          }}>TF</div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>TASKFLOW</span>
        </div>

        {/* Navigation Sections */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button onClick={() => scrollToSection('overview')} className="btn-ghost" style={{ fontSize: '0.85rem' }}>Overview</button>
          <button onClick={() => scrollToSection('admin')} className="btn-ghost" style={{ fontSize: '0.85rem' }}>Admin</button>
          <button onClick={() => scrollToSection('manager')} className="btn-ghost" style={{ fontSize: '0.85rem' }}>Project Manager</button>
          <button onClick={() => scrollToSection('member')} className="btn-ghost" style={{ fontSize: '0.85rem' }}>Team Member</button>
          <button onClick={() => scrollToSection('qa')} className="btn-ghost" style={{ fontSize: '0.85rem' }}>QA & Bugs</button>
          <button onClick={() => scrollToSection('client')} className="btn-ghost" style={{ fontSize: '0.85rem' }}>Client Portal</button>
        </nav>

        {/* 4 Role Login Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => navigate('/login?role=ADMIN')}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
          >
            Admin Login
          </button>
          <button
            onClick={() => navigate('/login?role=PROJECT_MANAGER')}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
          >
            Manager Login
          </button>
          <button
            onClick={() => navigate('/login?role=TEAM_MEMBER')}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
          >
            Member Login
          </button>
          <button
            onClick={() => navigate('/login?role=CLIENT')}
            className="btn-primary"
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem' }}
          >
            Client Login
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '130px 2rem 80px 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className="badge badge-dark">TASKFLOW 1.0</span>
          <span style={{ fontSize: '0.85rem', color: '#666666' }}>Role-Segregated Enterprise Project Platform</span>
        </div>
        <h1 style={{
          fontSize: '3.4rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          color: '#2b2b2b'
        }}>
          Engineered for Total Clarity Across Every Role
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#666666',
          maxWidth: '780px',
          margin: '0 auto 2.5rem auto',
          lineHeight: 1.6
        }}>
          TaskFlow establishes strict boundaries between Company Governance, Project Execution,
          Developer Sprints, and Client Collaboration. Seamless, auditable, and production-ready.
        </p>

        {/* 4 Role Portal Direct Access Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.25rem',
          textAlign: 'left',
          marginTop: '2rem'
        }}>
          {/* Admin Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#2b2b2b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <ShieldCheck size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Admin Portal</h3>
              <p style={{ fontSize: '0.88rem', color: '#666666', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Company governance, dynamic employee role categories, user onboarding, project creation, and audit logging.
              </p>
            </div>
            <button
              onClick={() => navigate('/login?role=ADMIN')}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span>Access Admin Portal</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Project Manager Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#f4f4f4',
                border: '1px solid #d4d4d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Briefcase size={22} color="#2b2b2b" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Project Manager</h3>
              <p style={{ fontSize: '0.88rem', color: '#666666', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Assigned projects, assembling project teams by specialization, milestones, task assignments, and review cycles.
              </p>
            </div>
            <button
              onClick={() => navigate('/login?role=PROJECT_MANAGER')}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span>Access PM Portal</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Team Member Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#f4f4f4',
                border: '1px solid #d4d4d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Users2 size={22} color="#2b2b2b" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Team Member</h3>
              <p style={{ fontSize: '0.88rem', color: '#666666', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Developers, designers, and testers. Kanban boards, progress updates, task comments, attachments, and time logs.
              </p>
            </div>
            <button
              onClick={() => navigate('/login?role=TEAM_MEMBER')}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span>Access Member Portal</span>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Client Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#2b2b2b',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Building2 size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>Client Portal</h3>
              <p style={{ fontSize: '0.88rem', color: '#666666', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Strictly scoped client access. Real-time project progress, milestone timelines, deliverables, and change requests.
              </p>
            </div>
            <button
              onClick={() => navigate('/login?role=CLIENT')}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <span>Access Client Portal</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Sections */}

      {/* Section 1: Overview */}
      <section id="overview" style={{ padding: '80px 2rem', borderTop: '1px solid #d4d4d4', backgroundColor: '#fbfbfb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="badge badge-subtle" style={{ marginBottom: '0.75rem' }}>ARCHITECTURE</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              System Overview & Core Architecture
            </h2>
            <p style={{ color: '#666666', fontSize: '1.05rem', maxWidth: '750px' }}>
              TaskFlow is built on clean architectural boundaries, separating corporate governance, project execution, and client transparency.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="card">
              <Database size={24} style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>PostgreSQL Normalized Schema</h4>
              <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
                20+ relational tables with UUID external keys, foreign key constraints, timestamps, and soft deletion protection.
              </p>
            </div>
            <div className="card">
              <Lock size={24} style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>JWT & Spring Security RBAC</h4>
              <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Stateless token authorization, BCrypt password hashing, method-level security, and role-enforced API routes.
              </p>
            </div>
            <div className="card">
              <Layers size={24} style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.4rem' }}>Minimalist Design System</h4>
              <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Distraction-free high-contrast grayscale interface using #ffffff, #d4d4d4, #b3b3b3, and #2b2b2b.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Admin */}
      <section id="admin" style={{ padding: '80px 2rem', borderTop: '1px solid #d4d4d4', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="badge badge-dark" style={{ marginBottom: '0.75rem' }}>ADMINISTRATION</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Company Governance & User Provisioning
            </h2>
            <p style={{ color: '#666666', fontSize: '1.05rem', maxWidth: '750px' }}>
              Admin exercises organization-wide management without micromanaging daily developer tasks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Dynamic Role Categories</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Define customizable professional categories (Full Stack, UI/UX, QA, DevOps) stored in database.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>User Provisioning</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Create PMs, team members, and clients. First-time login password resets enforced securely.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Project Initialization</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Set up projects, define budget/dates, link client, and assign an active Project Manager.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Full Audit Trail</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Every critical entity modification is immutably recorded with actor, IP, timestamp, and changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Manager */}
      <section id="manager" style={{ padding: '80px 2rem', borderTop: '1px solid #d4d4d4', backgroundColor: '#fbfbfb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="badge badge-subtle" style={{ marginBottom: '0.75rem' }}>PROJECT MANAGEMENT</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Project Leadership & Team Allocation
            </h2>
            <p style={{ color: '#666666', fontSize: '1.05rem', maxWidth: '750px' }}>
              Project Managers manage execution: adding team members, planning milestones, and creating role-based tasks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Project Team Assignment</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Allocate developers, designers, and testers to specific projects with role category association.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Milestone Management</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Break projects into delivery milestones with due dates, target deliverables, and progress tracking.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Task Review Workflow</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Review completed work: approve tasks or send back with 'Changes Requested' annotations.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Strict Project Scoping</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                PMs can only access projects assigned to them by Admin, strictly enforced in backend queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Team Member */}
      <section id="member" style={{ padding: '80px 2rem', borderTop: '1px solid #d4d4d4', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="badge badge-dark" style={{ marginBottom: '0.75rem' }}>DEVELOPMENT & EXECUTION</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Task Workflows, Kanban & Time Tracking
            </h2>
            <p style={{ color: '#666666', fontSize: '1.05rem', maxWidth: '750px' }}>
              Engineers and designers focus on assigned tasks with zero clutter.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Interactive Kanban Board</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Visual columns from TODO to ASSIGNED, IN_PROGRESS, IN_REVIEW, and COMPLETED.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Task Discussions & Attachments</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Real-time comment threads, file uploads, screenshots, and requirement references.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Subtask Hierarchy</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Break complex tasks into nested subtasks with individual progress indicators.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Time Logging</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Record billable and execution hours against specific tasks with duration audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: QA & Bugs */}
      <section id="qa" style={{ padding: '80px 2rem', borderTop: '1px solid #d4d4d4', backgroundColor: '#fbfbfb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="badge badge-subtle" style={{ marginBottom: '0.75rem' }}>QUALITY ASSURANCE</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Bug Tracking & Retest Verification
            </h2>
            <p style={{ color: '#666666', fontSize: '1.05rem', maxWidth: '750px' }}>
              Full QA lifecycle ensuring software reliability before client delivery.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Detailed Bug Filing</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Capture steps to reproduce, environment, expected vs actual results, and severity ratings.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Lifecycle Workflow</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                OPEN → ASSIGNED → IN_PROGRESS → FIXED → RETEST → CLOSED / REOPENED.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Developer Linkage</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Link bugs directly to tasks or projects, enabling rapid remediation and retesting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Client Portal */}
      <section id="client" style={{ padding: '80px 2rem', borderTop: '1px solid #d4d4d4', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <span className="badge badge-dark" style={{ marginBottom: '0.75rem' }}>CLIENT COLLABORATION</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
              Transparent Client Portal & Change Requests
            </h2>
            <p style={{ color: '#666666', fontSize: '1.05rem', maxWidth: '750px' }}>
              Clients view progress without accessing internal employee discussions or sensitive notes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Strict Data Isolation</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Backend filters ensure clients can only access their specific contracts and deliverables.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Change Request Workflow</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Submit formal change requests. Upon PM review and approval, seamlessly convert into project tasks.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Deliverable Approval</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Access CLIENT_VISIBLE documents, design prototypes, and milestone releases.
              </p>
            </div>
            <div className="card">
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Direct Communication</h4>
              <p style={{ color: '#666666', fontSize: '0.85rem', lineHeight: 1.5 }}>
                Communicate directly with the Project Manager on milestone status and change requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '3rem 2rem',
        borderTop: '1px solid #d4d4d4',
        backgroundColor: '#ffffff',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '26px',
              height: '26px',
              backgroundColor: '#2b2b2b',
              color: '#ffffff',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>TF</div>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>TASKFLOW</span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#8c8c8c' }}>
            Enterprise Task & Project Management System • Minimalist Grayscale Theme
          </p>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#666666' }}>
            <span>Java 25</span>
            <span>•</span>
            <span>Spring Boot</span>
            <span>•</span>
            <span>PostgreSQL</span>
            <span>•</span>
            <span>React</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
