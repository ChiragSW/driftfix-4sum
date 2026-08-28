import { useState, useEffect } from 'react';
import { Repo } from '../api/types';

export function useRepos() {
  const [repos, setRepos] = useState<Repo[]>(() => {
    const saved = localStorage.getItem('driftfix_repos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('driftfix_repos', JSON.stringify(repos));
  }, [repos]);

  const addRepo = (repo: Omit<Repo, 'id'>) => {
    const newRepo = { ...repo, id: crypto.randomUUID() };
    setRepos(prev => [...prev, newRepo]);
  };

  const removeRepo = (id: string) => {
    setRepos(prev => prev.filter(r => r.id !== id));
  };

  const updateRepo = (id: string, updates: Partial<Repo>) => {
    setRepos(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  return { repos, addRepo, removeRepo, updateRepo };
}
