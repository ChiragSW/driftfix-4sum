import React from 'react';
import { GitCommit, ExternalLink, CalendarClock } from 'lucide-react';

interface ReleaseEntry {
  version: string;
  major: number;
  label: string;
  date: string;
  note: string;
  breaking: boolean;
  url: string;
}

const STRIPE_RELEASE_HISTORY: ReleaseEntry[] = [
  {
    version: '15.6.0', major: 15, label: 'Latest Stable',
    date: '2026-08-28',
    note: 'StripeObject no longer inherits from dict; use .to_dict() or attribute access.',
    breaking: true,
    url: 'https://github.com/stripe/stripe-python/releases/tag/v15.6.0'
  },
  {
    version: '15.0.0', major: 15, label: 'Major Release',
    date: '2025-11-04',
    note: 'Python 3.7 support dropped; native Decimal fields; dict-style StripeObject removed.',
    breaking: true,
    url: 'https://github.com/stripe/stripe-python/releases/tag/v15.0.0'
  },
  {
    version: '14.3.0', major: 14, label: 'Demo Target',
    date: '2025-09-15',
    note: 'Stable v14 release; StripeObject still inherits from dict.',
    breaking: false,
    url: 'https://github.com/stripe/stripe-python/releases/tag/v14.3.0'
  },
  {
    version: '14.0.0', major: 14, label: 'Major Release',
    date: '2025-06-01',
    note: 'New resource-specific list methods; legacy list() retained with deprecation warning.',
    breaking: false,
    url: 'https://github.com/stripe/stripe-python/releases/tag/v14.0.0'
  },
  {
    version: '13.0.0', major: 13, label: 'Legacy Release',
    date: '2025-01-20',
    note: 'Type stubs added; stripe.api_key property deprecated in favour of StripeClient.',
    breaking: false,
    url: 'https://github.com/stripe/stripe-python/releases/tag/v13.0.0'
  },
];

export const VersionHistory: React.FC = () => {
  return (
    <section className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
      <h3 className="font-display text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
        <CalendarClock className="w-4 h-4 text-primary" />
        Stripe Python SDK Version Timeline
      </h3>

      <ol className="relative border-l border-outline-variant ml-3 space-y-6">
        {STRIPE_RELEASE_HISTORY.map((rel) => (
          <li key={rel.version} className="pl-6 relative">
            {/* Dot */}
            <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full flex items-center justify-center ${
              rel.breaking ? 'bg-tertiary-container/20 border border-tertiary' : 'bg-surface-container border border-outline-variant'
            }`}>
              <GitCommit className={`w-2.5 h-2.5 ${rel.breaking ? 'text-tertiary' : 'text-outline'}`} />
            </span>

            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono font-bold text-on-surface text-sm">{rel.version}</span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold border ${
                rel.label === 'Latest Stable'
                  ? 'bg-secondary-container/20 text-secondary border-secondary-container'
                  : rel.label === 'Demo Target'
                  ? 'bg-primary-container/20 text-primary border-primary-container'
                  : 'bg-surface-container text-outline border-outline-variant'
              }`}>
                {rel.label}
              </span>
              {rel.breaking && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded font-semibold bg-tertiary-container/20 text-tertiary border border-tertiary-container">
                  ⚠ Breaking
                </span>
              )}
              <span className="text-[11px] text-outline font-mono">{rel.date}</span>
            </div>

            <p className="font-mono text-xs text-on-surface-variant leading-relaxed">{rel.note}</p>

            <a
              href={rel.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono mt-1"
            >
              Release notes <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
};
