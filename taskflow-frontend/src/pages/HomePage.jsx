import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  ChevronDown,
  Clock,
  FileCheck2,
  History,
  Star,
  Sparkles,
  ExternalLink,
  Mail,
  HelpCircle
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setLoginDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const rolePortals = [
    {
      role: 'ADMIN',
      title: 'Admin',
      subtitle: 'System administration',
      path: '/login/admin',
      icon: ShieldCheck,
      badge: 'GOVERNANCE'
    },
    {
      role: 'PROJECT_MANAGER',
      title: 'Manager',
      subtitle: 'Project management',
      path: '/login/manager',
      icon: Briefcase,
      badge: 'DELIVERY'
    },
    {
      role: 'TEAM_MEMBER',
      title: 'Team Member',
      subtitle: 'Task execution',
      path: '/login/member',
      icon: Users2,
      badge: 'ENGINEERING'
    },
    {
      role: 'CLIENT',
      title: 'Client',
      subtitle: 'Scope & deliverables',
      path: '/login/client',
      icon: Building2,
      badge: 'PARTNER'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', color: '#2b2b2b', fontFamily: 'inherit' }}>
      {/* Fixed Modern Navbar */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        zIndex: 100,
        transition: 'all 0.2s ease'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '-0.02em'
          }}>TF</div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', color: '#1e1e1e' }}>
            TaskFlow
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <button
            onClick={() => scrollToSection('features')}
            style={{ background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500, color: '#4a4a4a', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => (e.target.style.color = '#1e1e1e')}
            onMouseLeave={(e) => (e.target.style.color = '#4a4a4a')}
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            style={{ background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500, color: '#4a4a4a', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => (e.target.style.color = '#1e1e1e')}
            onMouseLeave={(e) => (e.target.style.color = '#4a4a4a')}
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('about')}
            style={{ background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500, color: '#4a4a4a', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => (e.target.style.color = '#1e1e1e')}
            onMouseLeave={(e) => (e.target.style.color = '#4a4a4a')}
          >
            About
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            style={{ background: 'none', border: 'none', fontSize: '0.9rem', fontWeight: 500, color: '#4a4a4a', cursor: 'pointer', transition: 'color 0.15s ease' }}
            onMouseEnter={(e) => (e.target.style.color = '#1e1e1e')}
            onMouseLeave={(e) => (e.target.style.color = '#4a4a4a')}
          >
            Contact
          </button>
        </nav>

        {/* Right Actions: Login Dropdown & Get Started */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }} ref={dropdownRef}>
          {/* Login Button with Role Shortcuts Popover */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#2b2b2b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f4f4f4')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span>Login</span>
              <ChevronDown size={14} style={{ transform: loginDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {/* Login Role Shortcuts Dropdown */}
            {loginDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '115%',
                right: 0,
                width: '260px',
                backgroundColor: '#ffffff',
                border: '1px solid #d4d4d4',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                padding: '0.5rem',
                zIndex: 110,
                animation: 'fadeIn 0.15s ease-out'
              }}>
                <div style={{ padding: '0.5rem 0.75rem 0.35rem 0.75rem', fontSize: '0.72rem', fontWeight: 700, color: '#8c8c8c', letterSpacing: '0.05em' }}>
                  CHOOSE YOUR PORTAL
                </div>
                {rolePortals.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.role}
                      onClick={() => {
                        setLoginDropdownOpen(false);
                        navigate(item.path);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.75rem',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f4f4f4')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: '#2b2b2b',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Icon size={15} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#2b2b2b' }}>{item.title}</div>
                          <div style={{ fontSize: '0.72rem', color: '#8c8c8c' }}>{item.subtitle}</div>
                        </div>
                      </div>
                      <ChevronRight size={14} color="#8c8c8c" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Get Started Button */}
          <button
            onClick={() => scrollToSection('role-portals')}
            style={{
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1.25rem',
              borderRadius: '6px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333333')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1e1e1e')}
          >
            <span>Get Started</span>
          </button>
        </div>
      </header>

      {/* Hero Section with Role Shortcuts (Matching User Mockup Layout) */}
      <section id="role-portals" style={{
        padding: '140px 2rem 80px 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Rating & Avatar Badge */}
        <div style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '1.75rem'
        }}>
          {/* Avatar Ring */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#f4f4f4',
            border: '2px solid #d4d4d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#2b2b2b',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.95rem'
            }}>
              TF
            </div>
          </div>

          {/* 5 Stars Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', marginBottom: '0.35rem' }}>
            <Star size={16} fill="#f59e0b" />
            <Star size={16} fill="#f59e0b" />
            <Star size={16} fill="#f59e0b" />
            <Star size={16} fill="#f59e0b" />
            <Star size={16} fill="#f59e0b" />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>
            Enterprise Role Governance Platform
          </span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          color: '#1e1e1e',
          maxWidth: '900px',
          margin: '0 auto 1.25rem auto'
        }}>
          Ready to Bring Your Team's Work Together?
        </h1>

        {/* Hero Subtitle */}
        <p style={{
          fontSize: '1.15rem',
          color: '#666666',
          maxWidth: '720px',
          margin: '0 auto 3rem auto',
          lineHeight: 1.6
        }}>
          Organize your projects, empower your team, and keep work moving forward.
          Choose your role portal below to get started.
        </p>

        {/* 4 Role Portal Shortcut Cards (Monochromatic Enterprise Theme) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {rolePortals.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.role}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#2b2b2b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  e.currentTarget.style.borderColor = '#e0e0e0';
                }}
              >
                {/* Icon Container */}
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#f4f4f4',
                  border: '1px solid #dcdcdc',
                  color: '#2b2b2b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                  transition: 'background-color 0.2s ease'
                }}>
                  <Icon size={24} />
                </div>

                {/* Role Title */}
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#1e1e1e',
                  marginBottom: '0.35rem'
                }}>
                  {item.title}
                </h3>

                {/* Subtitle */}
                <p style={{
                  fontSize: '0.85rem',
                  color: '#666666',
                  marginBottom: '1.5rem'
                }}>
                  {item.subtitle}
                </p>

                {/* Sign In Link */}
                <div style={{
                  marginTop: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#1e1e1e'
                }}>
                  <span>Sign In</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Micro Caption */}
        <p style={{
          fontSize: '0.82rem',
          color: '#8c8c8c',
          maxWidth: '650px',
          margin: '0 auto'
        }}>
          Access is granted by your administrator. Team members are created by Project Managers.
        </p>
      </section>

      {/* SECTION 1: Features */}
      <section id="features" style={{ padding: '80px 2rem', borderTop: '1px solid #e5e5e5', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#8c8c8c', textTransform: 'uppercase' }}>
              PLATFORM CAPABILITIES
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.4rem', marginBottom: '0.75rem', color: '#1e1e1e' }}>
              Engineered for Total Operational Clarity
            </h2>
            <p style={{ color: '#666666', fontSize: '1rem', maxWidth: '700px', margin: '0 auto' }}>
              Four dedicated portals seamlessly communicating through strict role-based access control and immutable audit logging.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.75rem' }}>
              <ShieldCheck size={26} color="#1e1e1e" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1e1e1e' }}>Company Governance &amp; RBAC</h4>
              <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Dynamic employee role categories, user onboarding with forced first-login password updates, client registration, and system audit trails.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <Kanban size={26} color="#1e1e1e" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1e1e1e' }}>Interactive Kanban Sprints</h4>
              <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Visual task boards progressing from TODO to ASSIGNED, IN_PROGRESS, IN_REVIEW, and COMPLETED with drag-and-drop state transitions.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <Bug size={26} color="#1e1e1e" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1e1e1e' }}>QA Bug Tracking &amp; Retests</h4>
              <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Complete bug lifecycle with steps to reproduce, severity ratings, developer assignments, and QA retest audit verification.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <GitPullRequest size={26} color="#1e1e1e" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1e1e1e' }}>Client Change Requests</h4>
              <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Clients propose scope modifications, PMs audit schedule and budget impact, and approve items directly into project task backlogs.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <Clock size={26} color="#1e1e1e" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1e1e1e' }}>Timesheets &amp; Productivity</h4>
              <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Live stopwatch tracking, manual worklog entries, PM approval queues, department hours distribution, and 1-click CSV export.
              </p>
            </div>

            <div className="card" style={{ padding: '1.75rem' }}>
              <History size={26} color="#1e1e1e" style={{ marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#1e1e1e' }}>Immutable Audit Logging</h4>
              <p style={{ color: '#666666', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Comprehensive logging of user authentication, admin mutations, client onboarding, and project events with full JSON inspection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: How It Works */}
      <section id="how-it-works" style={{ padding: '80px 2rem', borderTop: '1px solid #e5e5e5', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#8c8c8c', textTransform: 'uppercase' }}>
              WORKFLOW PIPELINE
            </span>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.4rem', marginBottom: '0.75rem', color: '#1e1e1e' }}>
              How TaskFlow Operates
            </h2>
            <p style={{ color: '#666666', fontSize: '1rem', maxWidth: '650px', margin: '0 auto' }}>
              A structured lifecycle connecting executive administration to engineer sprints and client deliveries.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#1e1e1e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                margin: '0 auto 1rem auto'
              }}>
                1
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1e1e1e' }}>Provision &amp; Assign</h4>
              <p style={{ fontSize: '0.85rem', color: '#666666', lineHeight: 1.5 }}>
                Admin creates roles, onboards project managers, clients, and assigns projects.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#f4f4f4',
                border: '1px solid #d4d4d4',
                color: '#1e1e1e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                margin: '0 auto 1rem auto'
              }}>
                2
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1e1e1e' }}>Team &amp; Milestones</h4>
              <p style={{ fontSize: '0.85rem', color: '#666666', lineHeight: 1.5 }}>
                Project Manager assembles skilled engineers, breaks deliverables into sprint milestones, and assigns tasks.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#f4f4f4',
                border: '1px solid #d4d4d4',
                color: '#1e1e1e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                margin: '0 auto 1rem auto'
              }}>
                3
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1e1e1e' }}>Execution &amp; QA</h4>
              <p style={{ fontSize: '0.85rem', color: '#666666', lineHeight: 1.5 }}>
                Team Members update Kanban boards, log hours, upload documents, and collaborate on bug remediation.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#f4f4f4',
                border: '1px solid #d4d4d4',
                color: '#1e1e1e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                margin: '0 auto 1rem auto'
              }}>
                4
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1e1e1e' }}>Client Sign-Off</h4>
              <p style={{ fontSize: '0.85rem', color: '#666666', lineHeight: 1.5 }}>
                Clients review milestone deliverables, track progress, and submit change requests for PM review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: About */}
      <section id="about" style={{ padding: '80px 2rem', borderTop: '1px solid #e5e5e5', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#8c8c8c', textTransform: 'uppercase' }}>
                ARCHITECTURE &amp; STACK
              </span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.4rem', marginBottom: '1rem', color: '#1e1e1e' }}>
                Built on Modern Enterprise Standards
              </h2>
              <p style={{ color: '#666666', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                TaskFlow eliminates software bloat with clean architectural layers. Every API request is verified with stateless JSON Web Tokens (JWT) and encrypted with BCrypt 12-round hashing.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1e1e1e' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2b2b2b' }}>Sequential BIGSERIAL Identity Primary Keys (1, 2, 3...)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1e1e1e' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2b2b2b' }}>Spring Boot 3.4.3 &amp; Java 25 Virtual Threads</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1e1e1e' }} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2b2b2b' }}>PostgreSQL 18 Normalized Relational Integrity</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: '#1e1e1e' }}>Security Governance Summary</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Role Segregation</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e1e1e' }}>4 Distinct Portals</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Session Tokens</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e1e1e' }}>Stateless JWT (HMAC-SHA256)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Auditing System</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#137333' }}>Active &amp; Immutable</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Password Policy</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e1e1e' }}>Forced 1st Login Reset</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Contact */}
      <section id="contact" style={{ padding: '80px 2rem', borderTop: '1px solid #e5e5e5', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#8c8c8c', textTransform: 'uppercase' }}>
            SUPPORT &amp; INQUIRIES
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '0.4rem', marginBottom: '0.75rem', color: '#1e1e1e' }}>
            Corporate Governance Contact
          </h2>
          <p style={{ color: '#666666', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Need enterprise assistance or specialized integration? Contact the internal systems administration team.
          </p>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.75rem',
            backgroundColor: '#fbfbfb',
            border: '1px solid #d4d4d4',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#1e1e1e'
          }}>
            <Mail size={18} />
            <span>support@taskflow.com</span>
          </div>
        </div>
      </section>

      {/* Modern Minimalist Footer */}
      <footer style={{
        padding: '2.5rem 2rem',
        borderTop: '1px solid #e5e5e5',
        backgroundColor: '#ffffff',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '26px',
              height: '26px',
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>TF</div>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e1e1e' }}>TaskFlow</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#8c8c8c', margin: 0 }}>
            Enterprise Task &amp; Project Management System • Monochromatic Architecture
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: '#666666', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/login/admin" style={{ color: '#666', textDecoration: 'none' }}>Admin Login</Link>
            <span>•</span>
            <Link to="/login/manager" style={{ color: '#666', textDecoration: 'none' }}>Manager Login</Link>
            <span>•</span>
            <Link to="/login/member" style={{ color: '#666', textDecoration: 'none' }}>Member Login</Link>
            <span>•</span>
            <Link to="/login/client" style={{ color: '#666', textDecoration: 'none' }}>Client Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
