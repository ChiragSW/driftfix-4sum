import React, { useState } from 'react';
import { Repo } from '../api/types';
import { StatusBadge } from './StatusBadge';
import { apiClient } from '../api/client';

interface Props {
  repo: Repo;
  onUpdate: (id: string, updates: Partial<Repo>) => void;
  onRemove: (id: string) => void;
  onAnalyzed: (repoName: string, oldStatus: string | undefined, newStatus: string, targetVersion: string | null, breakingCount: number) => void;
}

export const RepoCard: React.FC<Props> = ({ repo, onUpdate, onRemove, onAnalyzed }) => {
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const report = await apiClient.analyzeUpgrade(repo.current_version);
      
      onUpdate(repo.id, {
        status: report.status,
        last_checked: new Date().toISOString(),
        report
      });

      onAnalyzed(
        repo.name, 
        repo.status, 
        report.status, 
        report.target_version, 
        report.breaking_changes.length
      );
    } catch (err) {
      console.error(err);
      alert('Failed to analyze upgrade');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-2">
        <h3 style={{ margin: 0 }}>{repo.name}</h3>
        <StatusBadge status={repo.status} />
      </div>
      
      <div className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
        <div>Current Version: <span className="text-accent">{repo.current_version}</span></div>
        {repo.last_checked && (
          <div>Last Checked: {new Date(repo.last_checked).toLocaleString()}</div>
        )}
      </div>

      {repo.report && repo.report.status === 'upgrade_available' && (
        <div className="mb-3" style={{ border: '1px solid var(--warning-color)', padding: '1rem' }}>
          <div style={{ color: 'var(--warning-color)', marginBottom: '0.5rem' }}>
            Upgrade available to {repo.report.target_version}
          </div>
          <div>Breaking changes: {repo.report.breaking_changes.length}</div>
        </div>
      )}

      <div className="flex gap-4">
        <button onClick={handleAnalyze} disabled={analyzing}>
          {analyzing ? 'Analyzing...' : 'Analyze'}
        </button>
        <button onClick={() => onRemove(repo.id)} style={{ borderColor: 'var(--error-color)', color: 'var(--error-color)' }}>
          Delete
        </button>
      </div>
    </div>
  );
};
