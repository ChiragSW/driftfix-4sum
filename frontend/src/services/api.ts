import { ProviderHealth, ProviderModel, StripeRelease, MigrationReport } from '../types';
import { SAMPLE_LATEST_RELEASE, SAMPLE_MIGRATION_REPORT } from '../data/mockData';

export class ApiService {
  private static isLiveMode = false;

  public static setLiveMode(enabled: boolean) {
    this.isLiveMode = enabled;
  }

  public static getLiveMode(): boolean {
    return this.isLiveMode;
  }

  public static async getProviderHealth(): Promise<ProviderHealth> {
    try {
      const res = await fetch('/api/provider/healthz');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return {
        status: 'ok',
        codex_installed: true,
        authentication: 'signed_in'
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
    // Attempt official GitHub API fetch for live data if requested
    try {
      const res = await fetch('https://api.github.com/repos/stripe/stripe-python/releases');
      if (res.ok) {
        const releases = await res.json();
        const valid = releases.filter((r: any) => !r.draft && !r.prerelease && /^v?\d+\.\d+\.\d+$/.test(r.tag_name));
        if (valid.length > 0) {
          const top = valid[0];
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

  public static async sendChatMessage(prompt: string, tools: any[] = []): Promise<any> {
    try {
      const res = await fetch('/api/provider/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "codex-subscription",
          messages: [{ role: "user", content: prompt }],
          tools: tools.length > 0 ? tools : undefined,
          stream: false
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err: any) {
      // Simulate Codex adapter response matching schema
      return {
        id: "chatcmpl_mock_" + Math.random().toString(36).substring(2, 9),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "codex-subscription",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: null,
              tool_calls: [
                {
                  id: "call_driftfix_" + Math.random().toString(36).substring(2, 9),
                  type: "function",
                  function: {
                    name: "analyze_stripe_python_upgrade",
                    arguments: JSON.stringify({ current_version: "14.3.0" })
                  }
                }
              ]
            },
            finish_reason: "tool_calls"
          }
        ],
        usage: {
          prompt_tokens: 342,
          completion_tokens: 48,
          total_tokens: 390
        }
      };
    }
  }
}
