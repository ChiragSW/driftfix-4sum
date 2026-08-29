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
  target_version?: string | null;
  breaking_changes: BreakingChange[];
  warnings: string[];
}

export interface PullRequestReport {
  repository: string;
  number: number;
  title: string;
  url: string;
  state: 'open' | 'merged';
  draft: boolean;
  author: string;
  head_branch: string;
  base_branch: string;
  body: string;
  created_at: string;
  updated_at: string;
  merged_at: string | null;
}

export interface ProviderHealth {
  status: 'ok' | 'unavailable';
  codex_installed: boolean;
  authentication: string;
}

export interface ProviderModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: {
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }[];
  timestamp: string;
}

export interface SandboxStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  command: string;
  output: string;
  duration_ms?: number;
}

export interface TrueForgeTraceEvent {
  id: string;
  timestamp: string;
  type: 'agent_loop' | 'codex_adapter' | 'mcp_call' | 'subagent_start' | 'sandbox_exec' | 'github_pr' | 'human_checkpoint';
  actor: string;
  title: string;
  details: any;
  status: 'info' | 'success' | 'warning' | 'pending' | 'denied';
}
