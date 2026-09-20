import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, portalPath } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #d4d4d4',
          borderTopColor: '#2b2b2b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fbfbfb',
        padding: '2rem'
      }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#f4f4f4',
            border: '1px solid #d4d4d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <ShieldAlert size={28} color="#2b2b2b" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>403 Access Denied</h2>
          <p style={{ color: '#666666', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Your role (<strong style={{ color: '#2b2b2b' }}>{user?.role}</strong>) does not have authorization to view this section.
          </p>
          <Link to={portalPath} className="btn-primary" style={{ width: '100%' }}>
            <ArrowLeft size={16} /> Return to Your Portal
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
