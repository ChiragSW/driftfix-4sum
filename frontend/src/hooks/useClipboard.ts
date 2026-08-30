import { useState, useCallback } from 'react';

/**
 * useClipboard — copies text to the system clipboard and exposes a transient
 * `copied` flag that resets after `resetMs` milliseconds.
 */
export function useClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetMs);
      } catch {
        /* clipboard not available in non-secure context – silently no-op */
      }
    },
    [resetMs]
  );

  return { copied, copy };
}
