import React, { useState } from 'react';
import { HistoryEntry } from '../api/types';
import { StatusBadge } from '../components/StatusBadge';

interface Props {
  history: HistoryEntry[];
  onClear: () => void;
}

export const History: React.FC<Props> = ({ history, onClear }) => {
  const [filter, setFilter] = useState('');

  const filteredHistory = history.filter(entry => 
    entry.repo_name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-accent" style={{ margin: 0 }}>Analysis History</h2>
        <div className="flex gap-4 items-center">
          <input 
            placeholder="Filter by repo name..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <button onClick={onClear} style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>
            Clear History
          </button>
        </div>
      </div>

      <div className="card">
        {filteredHistory.length === 0 ? (
          <div className="text-muted text-center" style={{ padding: '2rem' }}>No history found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredHistory.map(entry => (
              <div key={entry.id} style={{ 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{entry.repo_name}</div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={entry.old_status as any} /> 
                    <span className="text-muted">-></span> 
                    <StatusBadge status={entry.new_status as any} />
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {entry.target_version && (
                    <div className="mb-1">Target: <span className="text-accent">{entry.target_version}</span></div>
                  )}
                  {entry.breaking_changes_count > 0 && (
                    <div style={{ color: 'var(--warning-color)' }}>
                      {entry.breaking_changes_count} breaking changes
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
