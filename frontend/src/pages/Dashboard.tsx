import React, { useState, useEffect } from 'react';
import { useRepos } from '../hooks/useRepos';
import { RepoCard } from '../components/RepoCard';
import { AddRepoModal } from '../components/AddRepoModal';
import { apiClient } from '../api/client';
import { StripeRelease } from '../api/types';

interface Props {
  onAddHistory: (entry: any) => void;
}

export const Dashboard: React.FC<Props> = ({ onAddHistory }) => {
  const { repos, addRepo, removeRepo, updateRepo } = useRepos();
  const [showAddModal, setShowAddModal] = useState(false);
  const [latestRelease, setLatestRelease] = useState<StripeRelease | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const rel = await apiClient.getLatestRelease();
        setLatestRelease(rel);
      } catch (err) {
        console.error('Failed to fetch latest release', err);
      }
    };
    
    fetchLatest();
    const interval = setInterval(fetchLatest, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyzed = (repoName: string, oldStatus: string | undefined, newStatus: string, targetVersion: string | null, breakingCount: number) => {
    onAddHistory({
      timestamp: new Date().toISOString(),
      repo_name: repoName,
      old_status: oldStatus,
      new_status: newStatus,
      target_version: targetVersion,
      breaking_changes_count: breakingCount
    });
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-accent" style={{ margin: 0 }}>Tracked Repositories</h2>
          <button onClick={() => setShowAddModal(true)}>+ Add Repository</button>
        </div>

        {repos.length === 0 ? (
          <div className="text-muted card text-center">No repositories tracked yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {repos.map(repo => (
              <RepoCard 
                key={repo.id} 
                repo={repo} 
                onUpdate={updateRepo} 
                onRemove={removeRepo}
                onAnalyzed={handleAnalyzed}
              />
            ))}
          </div>
        )}
      </div>

      <div style={{ width: '300px' }}>
        <div className="card">
          <h3 className="text-accent mb-2" style={{ margin: '0 0 1rem 0' }}>Latest Release</h3>
          {latestRelease ? (
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>v{latestRelease.version}</div>
              <div className="text-muted mb-1">Major version: {latestRelease.major}</div>
              <div className="text-muted mb-2">Published: {new Date(latestRelease.published_at).toLocaleDateString()}</div>
              {latestRelease.prerelease && (
                <div style={{ color: 'var(--warning-color)', marginBottom: '1rem' }}>Prerelease</div>
              )}
              <a href={latestRelease.release_url} target="_blank" rel="noreferrer">
                <button style={{ width: '100%' }}>View Changelog</button>
              </a>
            </div>
          ) : (
            <div className="text-muted">Loading latest release...</div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddRepoModal 
          onClose={() => setShowAddModal(false)}
          onAdd={(name, version) => addRepo({ name, current_version: version })}
        />
      )}
    </div>
  );
};
