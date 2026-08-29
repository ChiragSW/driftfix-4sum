import React, { useState } from 'react';
import { 
  Terminal as TerminalIcon,
  Check, 
  Copy,
  ExternalLink,
  Search,
  Sparkles,
  AlertTriangle,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/mockData';

export const CodeScanner: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('customer_service.py');
  const [scanned, setScanned] = useState<boolean>(false);
  const [fixed, setFixed] = useState<boolean>(false);
  const [copiedPatch, setCopiedPatch] = useState<boolean>(false);
  const [copiedDiff, setCopiedDiff] = useState<boolean>(false);

  const currentPresetData = DEMO_PRESETS[selectedPreset];

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    setScanned(false);
    setFixed(false);
  };

  const handleCopy = (text: string, isDiff = false) => {
    navigator.clipboard.writeText(text);
    if (isDiff) {
      setCopiedDiff(true);
      setTimeout(() => setCopiedDiff(false), 2000);
    } else {
      setCopiedPatch(true);
      setTimeout(() => setCopiedPatch(false), 2000);
    }
  };

  // Preset specific lines for accurate table representation
  const isCustomerService = selectedPreset === 'customer_service.py';

  const v14LinesCustomer = [
    { no: 42, text: 'def get_customer_email(customer_id):', broken: false },
    { no: 43, text: '    customer = stripe.Customer.retrieve(customer_id)', broken: false },
    { no: 44, text: '    return customer.get("email")', broken: true },
    { no: 45, text: '', broken: false },
    { no: 46, text: 'def customer_fields(customer):', broken: false },
    { no: 47, text: '    return sorted(customer.keys())', broken: true },
    { no: 48, text: '', broken: false },
    { no: 49, text: 'def customer_metadata(customer):', broken: false },
    { no: 50, text: '    return dict(customer.get("metadata", {}).items())', broken: true },
    { no: 51, text: '', broken: false },
    { no: 52, text: 'def customer_snapshot(customer):', broken: false },
    { no: 53, text: '    return dict(customer)', broken: true },
  ];

  const v15LinesCustomer = [
    { no: 42, text: 'def get_customer_email(customer_id):', fixed: false },
    { no: 43, text: '    customer = stripe.Customer.retrieve(customer_id)', fixed: false },
    { no: 44, text: '    return customer.to_dict().get("email")', fixed: true },
    { no: 45, text: '', fixed: false },
    { no: 46, text: 'def customer_fields(customer):', fixed: false },
    { no: 47, text: '    return sorted(customer.to_dict().keys())', fixed: true },
    { no: 48, text: '', fixed: false },
    { no: 49, text: 'def customer_metadata(customer):', fixed: false },
    { no: 50, text: '    return dict(customer.to_dict().get("metadata", {}).items())', fixed: true },
    { no: 51, text: '', fixed: false },
    { no: 52, text: 'def customer_snapshot(customer):', fixed: false },
    { no: 53, text: '    return customer.to_dict()', fixed: true },
  ];

  const v14LinesInvoice = [
    { no: 12, text: 'def invoice_summary(invoice: stripe.Invoice) -> dict:', broken: false },
    { no: 13, text: '    return {', broken: false },
    { no: 14, text: '        "id": invoice.get("id"),', broken: true },
    { no: 15, text: '        "status": invoice.get("status"),', broken: true },
    { no: 16, text: '        "amount_due": invoice.get("amount_due", 0),', broken: true },
    { no: 17, text: '    }', broken: false },
    { no: 18, text: '', broken: false },
    { no: 19, text: 'def invoice_field_pairs(invoice: stripe.Invoice) -> dict:', broken: false },
    { no: 20, text: '    return dict(invoice.items())', broken: true },
  ];

  const v15LinesInvoice = [
    { no: 12, text: 'def invoice_summary(invoice: stripe.Invoice) -> dict:', fixed: false },
    { no: 13, text: '    data = invoice.to_dict()', fixed: true },
    { no: 14, text: '    return {', fixed: false },
    { no: 15, text: '        "id": data.get("id"),', fixed: false },
    { no: 16, text: '        "status": data.get("status"),', fixed: false },
    { no: 17, text: '        "amount_due": data.get("amount_due", 0),', fixed: false },
    { no: 18, text: '    }', fixed: false },
    { no: 19, text: '', fixed: false },
    { no: 20, text: 'def invoice_field_pairs(invoice: stripe.Invoice) -> dict:', fixed: false },
    { no: 21, text: '    return dict(invoice.to_dict().items())', fixed: true },
  ];

  const originalLines = isCustomerService ? v14LinesCustomer : v14LinesInvoice;
  const patchedLines = isCustomerService ? v15LinesCustomer : v15LinesInvoice;
  const breakingCount = originalLines.filter(l => l.broken).length;

  const rawDiff = isCustomerService ? `--- a/demo_target/customer_service.py
+++ b/demo_target/customer_service.py
@@ -44,10 +44,10 @@ def get_customer_email(customer_id):
-    return customer.get("email")
+    return customer.to_dict().get("email")

 def customer_fields(customer):
-    return sorted(customer.keys())
+    return sorted(customer.to_dict().keys())

 def customer_metadata(customer):
-    return dict(customer.get("metadata", {}).items())
+    return dict(customer.to_dict().get("metadata", {}).items())

 def customer_snapshot(customer):
-    return dict(customer)
+    return customer.to_dict()` : `--- a/demo_target/invoice_service.py
+++ b/demo_target/invoice_service.py
@@ -13,8 +13,9 @@ def invoice_summary(invoice: stripe.Invoice) -> dict:
+    data = invoice.to_dict()
     return {
-        "id": invoice.get("id"),
-        "status": invoice.get("status"),
-        "amount_due": invoice.get("amount_due", 0),
+        "id": data.get("id"),
+        "status": data.get("status"),
+        "amount_due": data.get("amount_due", 0),
     }

 def invoice_field_pairs(invoice: stripe.Invoice) -> dict:
-    return dict(invoice.items())
+    return dict(invoice.to_dict().items())`;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header matching Stitch Screen 4 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-4">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">manage_search</span>
            Impact Scout &amp; Migration Reviewer
          </h1>
          <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Target:</span>
            <code className="bg-surface-container px-2 py-0.5 rounded border border-outline-variant text-secondary font-bold">
              {currentPresetData.filename}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 mr-2">
            {Object.keys(DEMO_PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => handleSelectPreset(key)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                  selectedPreset === key
                    ? 'bg-primary-container text-on-primary-container font-bold border border-primary'
                    : 'bg-surface-container text-on-surface-variant border border-outline-variant hover:text-on-surface'
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          <button
            onClick={() => { setScanned(true); setFixed(false); }}
            className="bg-surface border border-outline-variant text-on-surface font-mono text-xs px-3.5 py-2 rounded hover:border-primary hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Run Impact Scout
          </button>
          <button
            onClick={() => { setScanned(true); setFixed(true); }}
            className="bg-primary-container text-on-primary-container font-mono text-xs font-bold px-3.5 py-2 rounded hover:bg-inverse-primary transition-colors flex items-center gap-1.5 border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Run Migration Reviewer
          </button>
        </div>
      </div>

      {/* Two-Column Code Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Original / Incompatible Code */}
        <div className="bg-surface border border-outline-variant rounded flex flex-col overflow-hidden">
          <div className="bg-surface-container-high border-b border-outline-variant px-4 py-2.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-tertiary" />
              <span className="font-mono text-xs font-bold text-on-surface">Original / Incompatible Code</span>
            </div>
            <div className="bg-tertiary-container/20 border border-tertiary-container text-tertiary font-mono text-[11px] px-2 py-0.5 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              {scanned ? `${breakingCount} breaking occurrences` : 'Ready to scan'}
            </div>
          </div>

          <div className="p-0 overflow-x-auto font-mono text-xs bg-[#0d1117] flex-1 min-h-[280px]">
            <table className="w-full text-left border-collapse">
              <tbody>
                {originalLines.map((line, idx) => {
                  const isBreaking = scanned && line.broken;
                  return (
                    <tr
                      key={idx}
                      className={isBreaking ? 'bg-tertiary-container/15 border-l-4 border-tertiary' : ''}
                    >
                      <td className="w-[42px] min-w-[42px] text-right pr-3 text-outline select-none border-r border-outline-variant bg-surface-container-low py-0.5">
                        {line.no}
                      </td>
                      <td className="pl-3 py-0.5 whitespace-pre font-mono">
                        {isBreaking ? (
                          <span className="text-tertiary font-semibold">
                            <span className="text-tertiary font-bold mr-1.5">-</span>
                            <span className="line-through decoration-tertiary/70">{line.text}</span>
                          </span>
                        ) : (
                          <span className="text-on-surface">{line.text}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Sourced Migration Patch */}
        <div className="bg-surface border border-outline-variant rounded flex flex-col overflow-hidden relative shadow-[6px_6px_0px_0px_rgba(48,54,61,0.4)] border-primary/50">
          <div className="bg-surface-container-high border-b border-outline-variant px-4 py-2.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="font-mono text-xs font-bold text-on-surface">Sourced Migration Patch</span>
            </div>
            {fixed && (
              <button
                onClick={() => handleCopy(currentPresetData.v15FixedCode)}
                className="bg-transparent border border-outline-variant text-on-surface-variant hover:text-on-surface font-mono text-[11px] px-2 py-0.5 rounded hover:border-outline transition-colors flex items-center gap-1"
              >
                {copiedPatch ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
                {copiedPatch ? 'Copied' : 'Copy Patch'}
              </button>
            )}
          </div>

          <div className="p-0 overflow-x-auto font-mono text-xs bg-[#0d1117] flex-1 min-h-[280px]">
            {fixed ? (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {patchedLines.map((line, idx) => {
                    return (
                      <tr
                        key={idx}
                        className={line.fixed ? 'bg-secondary-container/15 border-l-4 border-secondary' : ''}
                      >
                        <td className="w-[42px] min-w-[42px] text-right pr-3 text-outline select-none border-r border-outline-variant bg-surface-container-low py-0.5">
                          {line.no}
                        </td>
                        <td className="pl-3 py-0.5 whitespace-pre font-mono">
                          {line.fixed ? (
                            <span className="text-secondary font-bold">
                              <span className="mr-1.5">+</span>
                              {line.text}
                            </span>
                          ) : (
                            <span className="text-on-surface">{line.text}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-outline">
                <FileCode className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-xs font-mono">
                  Click <strong>Run Migration Reviewer</strong> to produce the verified <code className="text-primary font-bold">.to_dict()</code> patch.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified Diff View */}
      {fixed && (
        <div className="bg-surface border border-outline-variant rounded flex flex-col overflow-hidden animate-fadeIn">
          <div className="bg-surface-container-high border-b border-outline-variant px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="font-mono text-xs text-on-surface font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">difference</span>
                Unified Diff View
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] bg-surface-container px-2.5 py-0.5 rounded-full border border-outline-variant">
                <span className="text-secondary font-bold">+4 additions</span>
                <span className="text-outline">|</span>
                <span className="text-tertiary font-bold">-4 deletions</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(rawDiff, true)}
                className="bg-surface border border-outline-variant text-on-surface-variant hover:text-on-surface font-mono text-[11px] px-2.5 py-1 rounded hover:border-outline transition-colors flex items-center gap-1"
              >
                {copiedDiff ? <Check className="w-3 h-3 text-secondary" /> : <Copy className="w-3 h-3" />}
                {copiedDiff ? 'Copied Diff' : 'Copy Diff'}
              </button>
              <a
                href="https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15#stripeobject"
                target="_blank"
                rel="noreferrer"
                className="bg-transparent border border-outline-variant text-primary hover:bg-primary/10 font-mono text-[11px] px-2.5 py-1 rounded hover:border-primary transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">menu_book</span>
                View Official Stripe Wiki <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="p-0 overflow-x-auto font-mono text-xs bg-[#0d1117]">
            <div className="px-4 py-1.5 bg-surface-container-low border-b border-outline-variant text-outline flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">commit</span>
              @@ {currentPresetData.filename} @@
            </div>
            <pre className="p-4 leading-relaxed font-mono text-xs">
              {rawDiff.split('\n').map((line, idx) => {
                const isAdd = line.startsWith('+') && !line.startsWith('+++');
                const isRem = line.startsWith('-') && !line.startsWith('---');
                return (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded ${
                      isAdd ? 'bg-secondary-container/15 text-secondary font-bold' :
                      isRem ? 'bg-tertiary-container/15 text-tertiary font-semibold' :
                              'text-on-surface-variant'
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </pre>
          </div>
        </div>
      )}

      {/* Sourced Citation Note */}
      <div className="p-4 rounded bg-surface-container-low border border-outline-variant text-xs font-mono text-on-surface-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
          <span>
            <strong className="text-on-surface">Official Stripe Migration Rule:</strong> In v15, dictionary operations on <code className="text-primary font-bold">StripeObject</code> must be called on <code className="text-secondary font-bold">.to_dict()</code>.
          </span>
        </div>
        <a
          href="https://github.com/stripe/stripe-python/wiki/Migration-guide-for-v15#stripeobject"
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline font-mono flex items-center gap-1 shrink-0"
        >
          Wiki Citation <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
export { DiffViewer } from './DiffViewer';
