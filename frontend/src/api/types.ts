export interface StripeRelease {
  version: string;
  major: number;
  published_at: string;
  release_url: string;
  prerelease: boolean;
}

export interface BreakingChange {
  title: string;
  summary: string;
  search_hints: string[];
  source_url: string;
}

export interface MigrationReport {
  status: 'upgrade_available' | 'up_to_date' | 'source_unavailable';
  current_version: string;
  target_version: string | null;
  breaking_changes: BreakingChange[];
  warnings: string[];
}

export interface Repo {
  id: string;
  name: string;
  current_version: string;
  last_checked?: string;
  status?: MigrationReport['status'];
  report?: MigrationReport;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  repo_name: string;
  old_status?: string;
  new_status: string;
  target_version: string | null;
  breaking_changes_count: number;
}
