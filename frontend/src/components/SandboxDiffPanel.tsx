/**
 * SandboxDiffPanel — shows the side-by-side unified diff produced by DriftFix
 * for the demo_target migration (v14 -> v15) alongside Daytona test evidence.
 */
import React from 'react';
import { DiffViewer } from './DiffViewer';
import { DEMO_PRESETS } from '../data/mockData';

export const SandboxDiffPanel: React.FC = () => {
  const customer = DEMO_PRESETS['customer_service.py'];
  const invoice  = DEMO_PRESETS['invoice_service.py'];

  return (
    <div className="space-y-4">
      <DiffViewer
        title="customer_service.py — DriftFix Patch"
        filename={customer.filename}
        before={customer.v14Code}
        after={customer.v15FixedCode}
      />
      <DiffViewer
        title="invoice_service.py — DriftFix Patch"
        filename={invoice.filename}
        before={invoice.v14Code}
        after={invoice.v15FixedCode}
      />
    </div>
  );
};
