import React, { useState } from 'react';

interface Props {
  onAdd: (name: string, currentVersion: string) => void;
  onClose: () => void;
}

export const AddRepoModal: React.FC<Props> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');

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
      <div className="card" style={{ width: '400px' }}>
        <h2 className="mb-3 text-accent">Add Repository</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Repository Name</label>
            <input 
              style={{ width: '100%' }}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. backend-api"
            />
          </div>
          <div className="mb-3">
            <label className="text-muted" style={{ display: 'block', marginBottom: '0.5rem' }}>Current Stripe Version</label>
            <input 
              style={{ width: '100%' }}
              value={version}
              onChange={e => setVersion(e.target.value)}
              placeholder="e.g. 5.4.0"
            />
          </div>
          <div className="flex gap-4 justify-between">
            <button type="button" onClick={onClose} style={{ borderColor: 'var(--text-muted)', color: 'var(--text-muted)' }}>
              Cancel
            </button>
            <button type="submit">Add Repo</button>
          </div>
        </form>
      </div>
    </div>
  );
};
