import { ProviderHealth, ProviderModel, StripeRelease, MigrationReport, PullRequestReport } from '../types';
import { SAMPLE_LATEST_RELEASE, SAMPLE_MIGRATION_REPORT } from '../data/mockData';

export class ApiService {
  public static async getProviderHealth(): Promise<ProviderHealth> {
    try {
      const res = await fetch('/api/provider/healthz');
      const data = await res.json();
      return {
        status: res.ok && data.status === 'ok' ? 'ok' : 'unavailable',
        codex_installed: Boolean(data.codex_installed),
        authentication: data.authentication === 'signed_in' ? 'Ready' : (data.authentication || 'unavailable')
      };
    } catch {
      return {
        status: 'unavailable',
        codex_installed: false,
        authentication: 'unavailable'
      };
    }
  }

  public static async getModels(): Promise<ProviderModel[]> {
    try {
      const res = await fetch('/api/provider/v1/models');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data || [];
    } catch {
      return [{
        id: "codex-subscription",
        object: "model",
        created: Math.floor(Date.now() / 1000),
        owned_by: "local-codex"
      }];
    }
  }

  public static async getLatestRelease(): Promise<StripeRelease> {
    try {
      // 1. Try local backend endpoint backed by official GitHub data
      const res = await fetch('/api/provider/api/latest-release');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    // 2. Direct GitHub API fallback
    try {
      const res = await fetch('https://api.github.com/repos/stripe/stripe-python/releases');
      if (res.ok) {
        const releases = await res.json();
        const valid = releases.filter((r: any) => !r.draft && !r.prerelease && /^v?\d+\.\d+\.\d+$/.test(r.tag_name));
        if (valid.length > 0) {
          const top = valid.sort((a: any, b: any) => {
            const left = a.tag_name.replace(/^v/, '').split('.').map(Number);
            const right = b.tag_name.replace(/^v/, '').split('.').map(Number);
            return right[0] - left[0] || right[1] - left[1] || right[2] - left[2];
          })[0];
          const ver = top.tag_name.replace(/^v/, '');
          const major = parseInt(ver.split('.')[0], 10);
          return {
            version: ver,
            major: major,
            published_at: top.published_at,
            release_url: top.html_url,
            prerelease: false
          };
        }
      }
    } catch {
      // fallback to cached sample
    }

    return SAMPLE_LATEST_RELEASE;
  }

  public static async analyzeUpgrade(currentVersion: string): Promise<MigrationReport> {
    try {
      // 1. Try local backend endpoint backed by deterministic LangGraph analysis
      const res = await fetch(`/api/provider/api/analyze-upgrade?current_version=${encodeURIComponent(currentVersion)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }

    const latest = await this.getLatestRelease();
    const currentMajor = parseInt(currentVersion.split('.')[0], 10) || 14;

    if (currentMajor >= latest.major) {
      return {
        status: "up_to_date",
        current_version: currentVersion,
        target_version: latest.version,
        breaking_changes: [],
        warnings: [`Stripe Python SDK version ${currentVersion} is already on the current major release (${latest.major}).`]
      };
    }

    return {
      ...SAMPLE_MIGRATION_REPORT,
      current_version: currentVersion,
      target_version: latest.version
    };
  }

  public static async getPullRequestReports(): Promise<PullRequestReport[]> {
    const res = await fetch('/api/provider/api/pull-reports?state=all');
    if (!res.ok) throw new Error(`Unable to load pull request reports (HTTP ${res.status})`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Pull request report response is invalid');
    return data;
  }

  public static async sendChatMessage(prompt: string, tools: unknown[] = [], systemPrompt = ''): Promise<unknown> {
    const messages = [
      ...(systemPrompt.trim() ? [{ role: 'system', content: systemPrompt.trim() }] : []),
      { role: 'user', content: prompt }
    ];
    const res = await fetch('/api/provider/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'codex-subscription',
        messages,
        tools: tools.length > 0 ? tools : undefined,
        stream: false
      })
    });
    if (!res.ok) throw new Error(`Provider request failed (HTTP ${res.status})`);
    return await res.json();
  }
}
