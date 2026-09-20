import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Briefcase,
  Users2,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';

const roleConfigs = {
  ADMIN: {
    role: 'ADMIN',
    slug: 'admin',
    title: 'Admin Portal Sign In',
    subtitle: 'Executive organizational governance, user provisioning & audit trails',
    badge: 'SUPER ADMIN ROOT',
    icon: ShieldCheck,
    buttonText: 'Sign In to Admin Portal',
    defaultEmail: 'admin@taskflow.com',
    defaultPassword: 'admin123',
    demoAccounts: [
      { label: 'Super Admin', email: 'admin@taskflow.com', password: 'admin123', sub: 'Root Governance' }
    ]
  },
  PROJECT_MANAGER: {
    role: 'PROJECT_MANAGER',
    slug: 'manager',
    title: 'Project Manager Sign In',
    subtitle: 'Project pipelines, agile sprint milestones & team allocations',
    badge: 'DELIVERY LEAD',
    icon: Briefcase,
    buttonText: 'Sign In to Project Manager',
    defaultEmail: 'manager@taskflow.com',
    defaultPassword: 'manager123',
    demoAccounts: [
      { label: 'Project Manager', email: 'manager@taskflow.com', password: 'manager123', sub: 'Delivery & Sprints' }
    ]
  },
  TEAM_MEMBER: {
    role: 'TEAM_MEMBER',
    slug: 'member',
    title: 'Team Member Sign In',
    subtitle: 'Assigned tasks, interactive Kanban board & timesheets',
    badge: 'ENGINEERING & QA',
    icon: Users2,
    buttonText: 'Sign In as Team Member',
    defaultEmail: 'developer@taskflow.com',
    defaultPassword: 'dev123',
    demoAccounts: [
      { label: 'Developer', email: 'developer@taskflow.com', password: 'dev123', sub: 'Full Stack Dev' },
      { label: 'QA Tester', email: 'tester@taskflow.com', password: 'qa123', sub: 'Quality Assurance' }
    ]
  },
  CLIENT: {
    role: 'CLIENT',
    slug: 'client',
    title: 'Client Portal Sign In',
    subtitle: 'Review milestone deliverables, track progress & submit change requests',
    badge: 'CLIENT STAKEHOLDER',
    icon: Building2,
    buttonText: 'Sign In to Client Portal',
    defaultEmail: 'client@taskflow.com',
    defaultPassword: 'client123',
    demoAccounts: [
      { label: 'Client Contact', email: 'client@taskflow.com', password: 'client123', sub: 'Deliverables & Scope' }
    ]
  }
};

const resolveRole = (slugOrRole) => {
  if (!slugOrRole) return null;
  const val = slugOrRole.toLowerCase().trim();
  if (val === 'admin') return 'ADMIN';
  if (val === 'manager' || val === 'project_manager' || val === 'project-manager') return 'PROJECT_MANAGER';
  if (val === 'member' || val === 'team_member' || val === 'team-member' || val === 'developer') return 'TEAM_MEMBER';
  if (val === 'client') return 'CLIENT';
  return null;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { roleSlug } = useParams();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, portalPath } = useAuth();

  const roleParam = searchParams.get('role');
  const targetRoleKey = resolveRole(roleSlug) || resolveRole(roleParam);

  const [activeRole, setActiveRole] = useState(targetRoleKey);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to portal
  useEffect(() => {
    if (isAuthenticated) {
      navigate(portalPath, { replace: true });
    }
  }, [isAuthenticated, portalPath, navigate]);

  // Sync role and set defaults
  useEffect(() => {
    const matched = targetRoleKey;
    if (matched && roleConfigs[matched]) {
      setActiveRole(matched);
      setEmail(roleConfigs[matched].defaultEmail);
      setPassword(roleConfigs[matched].defaultPassword);
      setError('');
    } else if (!targetRoleKey) {
      // Default to null to let user select their portal if not specified
      setActiveRole(null);
      setEmail('');
      setPassword('');
    }
  }, [roleSlug, roleParam, targetRoleKey]);

  const handleSelectRole = (roleKey) => {
    const config = roleConfigs[roleKey];
    if (config) {
      navigate(`/login/${config.slug}`);
    }
  };

  const handleAutofill = (demo) => {
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password);
      navigate(result.portalPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentConfig = activeRole ? roleConfigs[activeRole] : null;
  const RoleIcon = currentConfig?.icon;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fbfbfb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'inherit'
    }}>
      {/* Back to Home Link */}
      <div style={{ maxWidth: '480px', width: '100%', marginBottom: '1.25rem' }}>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          color: '#666666',
          fontWeight: 500,
          textDecoration: 'none'
        }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>

      {/* CASE 1: SPECIFIC ROLE LOGIN (ISOLATED ROLE VIEW) */}
      {currentConfig ? (
        <div className="card animate-fade-in" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          {/* Dedicated Header for this role */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <RoleIcon size={26} />
            </div>

            <div style={{ marginBottom: '0.35rem' }}>
              <span className="badge badge-dark" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
                {currentConfig.badge}
              </span>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1e1e1e', marginBottom: '0.35rem' }}>
              {currentConfig.title}
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666666', margin: 0, lineHeight: 1.5 }}>
              {currentConfig.subtitle}
            </p>
          </div>

          {/* Role-Specific Demo Credentials Box */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d4d4d4',
            borderRadius: '8px',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <Sparkles size={14} color="#1e1e1e" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', color: '#1e1e1e' }}>
                DEMO CREDENTIALS:
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {currentConfig.demoAccounts.map(demo => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleAutofill(demo)}
                  title={`Autofill ${demo.label}: ${demo.email}`}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    backgroundColor: email === demo.email ? '#1e1e1e' : '#f4f4f4',
                    color: email === demo.email ? '#ffffff' : '#1e1e1e',
                    border: '1px solid',
                    borderColor: email === demo.email ? '#1e1e1e' : '#d4d4d4',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{demo.label}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>({demo.password})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              backgroundColor: '#fff4f4',
              border: '1px solid #e0b4b4',
              color: '#b00020',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Isolated Login Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: '#2b2b2b' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="email-input"
                  type="email"
                  required
                  className="input-field"
                  placeholder="name@taskflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                />
                <Mail size={16} color="#8c8c8c" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.4rem', color: '#2b2b2b' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', width: '100%' }}
                />
                <Lock size={16} color="#8c8c8c" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#8c8c8c',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.8rem',
                fontSize: '0.92rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{currentConfig.buttonText}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch Role Link */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e5e5e5', textAlign: 'center' }}>
            <Link
              to="/login"
              style={{
                fontSize: '0.82rem',
                color: '#666666',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              onMouseEnter={(e) => (e.target.style.color = '#1e1e1e')}
              onMouseLeave={(e) => (e.target.style.color = '#666666')}
            >
              ← Not an {currentConfig.title.split(' ')[0]}? Switch to a different portal
            </Link>
          </div>
        </div>
      ) : (
        /* CASE 2: GENERIC /login ROUTE — CHOOSE PORTAL FIRST */
        <div className="card animate-fade-in" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#1e1e1e',
              color: '#ffffff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
              margin: '0 auto 0.75rem auto'
            }}>TF</div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1e1e1e', marginBottom: '0.35rem' }}>
              Select Your Role Portal
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#666666', margin: 0 }}>
              Choose your role below to access your dedicated sign in portal.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.values(roleConfigs).map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.role}
                  onClick={() => handleSelectRole(item.role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1e1e1e';
                    e.currentTarget.style.backgroundColor = '#fafafa';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#f4f4f4',
                      border: '1px solid #d4d4d4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1e1e1e'
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e1e1e' }}>
                        {item.title.replace(' Sign In', '')}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#666666' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#8c8c8c" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
