import React from 'react';

export const MacOsChrome: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '12px 16px',
      background: 'var(--card-bg)',
      borderBottom: '1px solid var(--border-color)',
      alignItems: 'center'
    }}>
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--error-color)' }}></div>
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--warning-color)' }}></div>
      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></div>
    </div>
  );
};
