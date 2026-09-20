import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fbfbfb',
      padding: '2rem'
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#f4f4f4',
          border: '1px solid #d4d4d4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto'
        }}>
          <FileQuestion size={26} color="#2b2b2b" />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2b2b2b', marginBottom: '0.4rem' }}>404 Not Found</h2>
        <p style={{ color: '#666666', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
          The page or resource you are looking for does not exist or has been moved.
        </p>
        <Link to="/" className="btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
