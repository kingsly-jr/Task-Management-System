import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  EyeOff
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, portalPath } = useAuth();

  const roleParam = searchParams.get('role');

  const [activeRole, setActiveRole] = useState('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Demo accounts
  const demoAccounts = [
    {
      role: 'ADMIN',
      label: 'Admin',
      email: 'admin@taskflow.com',
      password: 'admin123',
      sub: 'Company Governance',
      icon: ShieldCheck
    },
    {
      role: 'PROJECT_MANAGER',
      label: 'Project Manager',
      email: 'manager@taskflow.com',
      password: 'manager123',
      sub: 'Project Execution',
      icon: Briefcase
    },
    {
      role: 'TEAM_MEMBER',
      label: 'Developer',
      email: 'developer@taskflow.com',
      password: 'dev123',
      sub: 'Full Stack Dev',
      icon: Users2
    },
    {
      role: 'TEAM_MEMBER',
      label: 'QA Tester',
      email: 'tester@taskflow.com',
      password: 'qa123',
      sub: 'Quality Assurance',
      icon: Users2
    },
    {
      role: 'CLIENT',
      label: 'Client',
      email: 'client@taskflow.com',
      password: 'client123',
      sub: 'Deliverables & Requests',
      icon: Building2
    }
  ];

  // If already authenticated, redirect to portal
  useEffect(() => {
    if (isAuthenticated) {
      navigate(portalPath, { replace: true });
    }
  }, [isAuthenticated, portalPath, navigate]);

  // Sync role from query param
  useEffect(() => {
    if (roleParam) {
      const match = demoAccounts.find(a => a.role === roleParam.toUpperCase());
      if (match) {
        setActiveRole(match.role);
        setEmail(match.email);
        setPassword(match.password);
      }
    } else {
      // Default to admin autofill
      setEmail('admin@taskflow.com');
      setPassword('admin123');
    }
  }, [roleParam]);

  const handleRoleTabClick = (roleCode) => {
    setActiveRole(roleCode);
    const demo = demoAccounts.find(a => a.role === roleCode);
    if (demo) {
      setEmail(demo.email);
      setPassword(demo.password);
    }
    setError('');
  };

  const handleAutofill = (demo) => {
    setActiveRole(demo.role);
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
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOneClickLogin = async (demo) => {
    handleAutofill(demo);
    setIsLoading(true);
    setError('');
    try {
      const result = await login(demo.email, demo.password);
      navigate(result.portalPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fbfbfb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      {/* Back to Home Link */}
      <div style={{ maxWidth: '480px', width: '100%', marginBottom: '1.25rem' }}>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem',
          color: '#666666',
          fontWeight: 500
        }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>

      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.25rem' }}>
        {/* Brand & Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            backgroundColor: '#2b2b2b',
            color: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.25rem',
            margin: '0 auto 0.75rem auto'
          }}>TF</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#2b2b2b', marginBottom: '0.35rem' }}>
            Sign In to TaskFlow
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#666666' }}>
            Select your role or choose a demo account below
          </p>
        </div>

        {/* Role Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0.25rem',
          backgroundColor: '#f4f4f4',
          padding: '0.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          {[
            { id: 'ADMIN', label: 'Admin' },
            { id: 'PROJECT_MANAGER', label: 'Manager' },
            { id: 'TEAM_MEMBER', label: 'Member' },
            { id: 'CLIENT', label: 'Client' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleRoleTabClick(tab.id)}
              style={{
                padding: '0.55rem 0',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                textAlign: 'center',
                backgroundColor: activeRole === tab.id ? '#ffffff' : 'transparent',
                color: activeRole === tab.id ? '#2b2b2b' : '#666666',
                boxShadow: activeRole === tab.id ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Autofill Demo Credentials Section */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #d4d4d4',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
            <Sparkles size={15} color="#2b2b2b" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em', color: '#2b2b2b' }}>
              ONE-CLICK DEMO AUTOFILL:
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {demoAccounts.map(demo => (
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
                  backgroundColor: email === demo.email ? '#2b2b2b' : '#f4f4f4',
                  color: email === demo.email ? '#ffffff' : '#2b2b2b',
                  border: '1px solid',
                  borderColor: email === demo.email ? '#2b2b2b' : '#d4d4d4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
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

        {/* Form */}
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
                style={{ paddingLeft: '2.5rem' }}
              />
              <Mail size={16} color="#8c8c8c" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#2b2b2b' }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
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
                  color: '#8c8c8c'
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
            style={{ width: '100%', padding: '0.75rem', fontSize: '0.92rem' }}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to {activeRole.replace('_', ' ')}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
