import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';

export const NavBar: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<string>('checking...');

  useEffect(() => {
    apiClient.getHealth().then(res => {
      setHealthStatus(res.status || 'online');
    }).catch(() => {
      setHealthStatus('offline');
    });
  }, []);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--card-bg)'
    }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-color)' }}>DriftFix</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/">Dashboard</Link>
          <Link to="/history">History</Link>
        </div>
      </div>
      <div>
        <span className="text-muted">Provider: </span>
        <span style={{ 
          color: healthStatus === 'online' || healthStatus === 'ok' ? 'var(--success-color)' : 'var(--error-color)' 
        }}>
          [{healthStatus}]
        </span>
      </div>
    </nav>
  );
};
