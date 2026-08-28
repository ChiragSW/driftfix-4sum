import axios from 'axios';
import { StripeRelease, MigrationReport } from './types';

const API_BASE = 'http://localhost:8080/api';

export const apiClient = {
  async getLatestRelease(): Promise<StripeRelease> {
    const res = await axios.get(`${API_BASE}/latest-release`);
    return res.data;
  },

  async analyzeUpgrade(currentVersion: string): Promise<MigrationReport> {
    const res = await axios.post(`${API_BASE}/analyze`, { current_version: currentVersion });
    return res.data;
  },

  async getHealth(): Promise<any> {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  async detectStripeVersion(target: string): Promise<{ detected_version: string; source: string }> {
    const res = await axios.post(`${API_BASE}/detect-version`, { target });
    return res.data;
  }
};
