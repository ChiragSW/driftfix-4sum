import { useState, useEffect } from 'react';

/**
 * useLocalStorage — persists state to localStorage under `key`.
 * Falls back to `defaultValue` when the key is absent or parse fails.
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }, [key, value]);

  return [value, setValue];
}
