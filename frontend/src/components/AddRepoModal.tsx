import React, { useState } from 'react';
import { apiClient } from '../api/client';

interface Props {
  onAdd: (name: string, currentVersion: string) => void;
  onClose: () => void;
}

export const AddRepoModal: React.FC<Props> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);
  const [detectionSource, setDetectionSource] = useState<string | null>(null);

  const handleAutoDetect = async (targetToDetect?: string) => {
    const target = (targetToDetect !== undefined ? targetToDetect : name).trim();
    if (!target) return;

    setDetecting(true);
    setDetectionMessage(null);
    setDetectionSource(null);
    try {
      const res = await apiClient.detectStripeVersion(target);
      if (res && res.detected_version) {
        setVersion(res.detected_version);
        setDetectionSource(res.source);
        setDetectionMessage(`Detected stripe==${res.detected_version}`);
      }
    } catch (err: any) {
      setDetectionMessage('Could not auto-detect Stripe version in pyproject.toml / requirements.txt. Please specify manually.');
    } finally {
      setDetecting(false);
    }
  };

  const handleNameBlur = () => {
    if (name.trim() && !version.trim()) {
      handleAutoDetect(name.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && version) {
      onAdd(name, version);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(5, 14, 6, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div className="card" style={{ width: '460px' }}>
        <h2 className="mb-3 text-accent">Add Repository</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Repository Path or GitHub URL</label>
            <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
              Local directory or GitHub repo (e.g. demo_target or ChiragSW/driftfix-4sum)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                style={{ flex: 1 }}
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={handleNameBlur}
                placeholder="e.g. demo_target or ChiragSW/driftfix-4sum"
              />
              <button 
                type="button" 
                onClick={() => handleAutoDetect()} 
                disabled={detecting || !name.trim()}
                style={{ whiteSpace: 'nowrap' }}
              >
                {detecting ? 'Checking...' : 'Auto-Detect'}
              </button>
            </div>
          </div>

          {detectionMessage && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: detectionSource ? 'var(--accent-color)' : 'var(--warning-color)',
              marginBottom: '0.75rem' 
            }}>
              {detectionMessage}
              {detectionSource && <div>Source: {detectionSource}</div>}
            </div>
          )}

          <div className="mb-3">
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Stripe SDK Version</label>
            <span className="text-muted" style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
              Auto-filled if found in repo's dependencies, or edit manually
            </span>
            <input 
              style={{ width: '100%' }}
              value={version}
              onChange={e => setVersion(e.target.value)}
              placeholder="e.g. 14.3.0"
            />
          </div>
          <div className="flex gap-4 justify-between">
            <button type="button" onClick={onClose} style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || !version.trim()}>Add Repo</button>
          </div>
        </form>
      </div>
    </div>
  );
};
