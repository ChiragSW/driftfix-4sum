import React from 'react';
import { 
  ShieldCheck, 
  GitPullRequest, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import { StatCard } from './StatCard';

export const SummaryStats: React.FC = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      label="Tests Passed (v14 Baseline)"
      value="7 / 7"
      subValue="All green on Stripe 14.3.0"
      icon={<CheckCircle2 className="w-5 h-5" />}
      variant="success"
      trend="up"
    />
    <StatCard
      label="Tests Failed (v15 Raw Bump)"
      value="7 / 7"
      subValue="AttributeError on .get(), .keys()"
      icon={<Zap className="w-5 h-5" />}
      variant="error"
      trend="down"
    />
    <StatCard
      label="Tests Passed (v15 Patched)"
      value="7 / 7"
      subValue=".to_dict() conversions applied"
      icon={<ShieldCheck className="w-5 h-5" />}
      variant="success"
      trend="up"
    />
    <StatCard
      label="Draft PR Created"
      value="PR #1"
      subValue="Merged after human approval"
      icon={<GitPullRequest className="w-5 h-5" />}
      variant="info"
      trend="neutral"
    />
  </div>
);
