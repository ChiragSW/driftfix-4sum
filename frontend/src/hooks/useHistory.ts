import { useState, useEffect } from 'react';
import { HistoryEntry } from '../api/types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('driftfix_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('driftfix_history', JSON.stringify(history));
  }, [history]);

  const addHistory = (entry: Omit<HistoryEntry, 'id'>) => {
    const newEntry = { ...entry, id: crypto.randomUUID() };
    setHistory(prev => [newEntry, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addHistory, clearHistory };
}
