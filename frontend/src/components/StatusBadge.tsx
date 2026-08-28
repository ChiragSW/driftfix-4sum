import React from 'react';
import { MigrationReport } from '../api/types';

interface Props {
  status?: MigrationReport['status'] | 'unknown';
}

export const StatusBadge: React.FC<Props> = ({ status = 'unknown' }) => {
  let color = 'var(--text-muted)';
  
  switch(status) {
    case 'up_to_date':
      color = 'var(--success-color)';
      break;
    case 'upgrade_available':
      color = 'var(--warning-color)';
      break;
    case 'source_unavailable':
      color = 'var(--error-color)';
      break;
  }

  return (
    <span style={{ 
      color,
      border: `1px solid ${color}`,
      padding: '0.2rem 0.5rem',
      fontSize: '0.8rem',
      textTransform: 'uppercase'
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
