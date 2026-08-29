import React, { useState } from 'react';

export const SandboxRunner: React.FC = () => {
  const [running, setRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(3); // default show all finished or interactive

  const handleRunPipeline = async () => {
    setRunning(true);
    setActiveStepIndex(0);

    for (let i = 0; i < 4; i++) {
      setActiveStepIndex(i);
      await new Promise(r => setTimeout(r, 600));
    }

    setRunning(false);
  };

  const handleReset = () => {
    setActiveStepIndex(-1);
    setRunning(false);
  };

  return (
    <div className="w-full flex flex-col gap-lg animate-fadeIn">
      {/* Header matching Stitch Screen 5 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md border-b border-outline-variant pb-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs flex items-center gap-sm">
            <span className="material-symbols-outlined text-secondary text-[32px]">terminal</span>
            Daytona Sandbox Test Execution
          </h1>
          <div className="font-code text-body-sm text-on-surface-variant">
            Isolated CI harness executing multi-stage acceptance tests.
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleReset}
            disabled={running}
            className="bg-surface text-on-surface font-label-md text-label-md px-4 py-2 border border-outline-variant rounded-none hover:bg-surface-variant transition-colors flex items-center gap-2 uppercase cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span> Reset
          </button>
          <button
            onClick={handleRunPipeline}
            disabled={running}
            className="bg-primary-container text-on-primary-container font-label-md text-label-md px-4 py-2 border border-primary-container rounded-none hover:opacity-90 transition-opacity flex items-center gap-2 uppercase shadow-sm cursor-pointer disabled:opacity-50 font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            {running ? 'Executing Sandbox...' : 'Run Sandbox Verification Cycle'}
          </button>
        </div>
      </div>

      {/* CI Pipeline Steps */}
      <div className="flex flex-col gap-sm">
        {/* PHASE 1: Baseline */}
        <div className="bg-surface-container-low border border-outline-variant rounded-none overflow-hidden">
          <div className="flex items-center justify-between p-md border-b border-outline-variant bg-surface-container">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary-container/20 border border-secondary flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <div>
                <h3 className="font-headline-md text-body-lg text-on-surface m-0 font-bold">PHASE 1: Baseline (v14.3.0)</h3>
                <div className="font-code text-body-sm text-on-surface-variant mt-1">Setup initial environment and run baseline tests</div>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-body-sm text-secondary px-2 py-1 bg-secondary-container/10 border border-secondary/30 rounded font-bold">
                PASSED
              </span>
              <span className="text-body-sm text-on-surface-variant">0.04s</span>
            </div>
          </div>
          {(activeStepIndex >= 0) && (
            <div className="p-md bg-surface-container-lowest font-code text-code text-on-surface-variant border-l-4 border-secondary overflow-x-auto">
              <pre className="m-0 leading-relaxed">
<span className="text-outline">============================= test session starts ==============================</span>
platform linux -- Python 3.11.4, pytest-7.4.0, pluggy-1.2.0
rootdir: /sandbox/workspace
collected 7 items

tests/test_customer.py <span className="text-secondary font-bold">.......</span>                                           <span className="text-secondary">[100%]</span>

<span className="text-secondary">============================== </span><span className="text-secondary font-bold">7 passed in 0.04s</span><span className="text-secondary"> ===============================</span>
              </pre>
            </div>
          )}
        </div>

        {/* PHASE 2: Dependency-only */}
        <div className="bg-surface-container-low border border-outline-variant rounded-none overflow-hidden">
          <div className="flex items-center justify-between p-md border-b border-outline-variant bg-surface-container">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-error-container/20 border border-error flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </div>
              <div>
                <h3 className="font-headline-md text-body-lg text-on-surface m-0 font-bold">PHASE 2: Dependency-only (v15.6.0)</h3>
                <div className="font-code text-body-sm text-on-surface-variant mt-1">Upgrade Stripe SDK and identify breaking changes</div>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-body-sm text-error px-2 py-1 bg-error-container/10 border border-error/30 rounded font-bold">
                EXPECTED FAILURE
              </span>
              <span className="text-body-sm text-on-surface-variant">0.08s</span>
            </div>
          </div>
          {(activeStepIndex >= 1) && (
            <div className="p-md bg-surface-container-lowest font-code text-code text-on-surface-variant border-l-4 border-error overflow-x-auto">
              <pre className="m-0 leading-relaxed">
<span className="text-outline">============================= test session starts ==============================</span>
platform linux -- Python 3.11.4, pytest-7.4.0, pluggy-1.2.0
rootdir: /sandbox/workspace
collected 7 items

tests/test_customer.py <span className="text-error font-bold">FFFFFFF</span>                                           <span className="text-error">[100%]</span>

=================================== FAILURES ===================================
<span className="text-error font-bold">_________________________ test_get_customer_details __________________________</span>

    def test_get_customer_details():
        customer_service = CustomerService()
&gt;       result = customer_service.get_customer("cus_123")

tests/test_customer.py:12: 
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ 
src/customer_service.py:45: in get_customer
    return stripe.Customer.get(customer_id)
<span className="text-error font-bold">E   AttributeError: 'Customer' object has no attribute 'get'</span>

<span className="text-error">=========================== </span><span className="text-error font-bold">7 failed in 0.08s</span><span className="text-error"> ==============================</span>
              </pre>
            </div>
          )}
        </div>

        {/* PHASE 3: Apply DriftFix Patch */}
        <div className="bg-surface-container-low border border-outline-variant rounded-none overflow-hidden">
          <div className="flex items-center justify-between p-md border-b border-outline-variant bg-surface-container">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">build</span>
              </div>
              <div>
                <h3 className="font-headline-md text-body-lg text-on-surface m-0 font-bold">PHASE 3: Apply DriftFix Patch</h3>
                <div className="font-code text-body-sm text-on-surface-variant mt-1">Inject AST modifications to resolve drift</div>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-body-sm text-primary px-2 py-1 bg-primary-container/10 border border-primary/30 rounded font-bold">
                APPLIED
              </span>
            </div>
          </div>
          {(activeStepIndex >= 2) && (
            <div className="p-md bg-surface-container-lowest font-code text-code text-on-surface-variant border-l-4 border-primary overflow-x-auto flex flex-col gap-4">
              <div className="text-on-surface">Applying driftfix patch to <span className="text-primary font-bold">src/customer_service.py</span>...</div>
              <div className="border border-outline-variant rounded overflow-hidden">
                <div className="bg-surface-container px-3 py-1.5 border-b border-outline-variant text-label-md font-label-md text-on-surface-variant flex justify-between">
                  <span>src/customer_service.py</span>
                  <span>Python</span>
                </div>
                <div className="p-3 bg-[#0d1117]">
                  <pre className="m-0 leading-relaxed text-[12px]">
<span className="text-on-surface-variant/50">42 |</span>     def get_customer(self, customer_id: str):
<span className="text-on-surface-variant/50">43 |</span>         """Retrieve customer details from Stripe."""
<span className="bg-error-container/20 text-error"><span className="text-error/50">44 |</span>-        return stripe.Customer.get(customer_id)</span>
<span className="bg-secondary-container/20 text-secondary font-bold"><span className="text-secondary/50">45 |</span>+        return stripe.Customer.to_dict().get(customer_id)</span>
<span className="text-on-surface-variant/50">46 |</span>
<span className="text-on-surface-variant/50">47 |</span>     def update_customer(self, customer_id: str, data: dict):
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PHASE 4: Final Verification */}
        <div className="bg-surface-container-low border border-outline-variant rounded-none overflow-hidden shadow-[4px_4px_0_0_#000]">
          <div className="flex items-center justify-between p-md border-b border-outline-variant bg-surface-container">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-secondary-container/20 border border-secondary flex items-center justify-center text-secondary relative">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <div className="absolute inset-0 bg-secondary rounded-full animate-ping opacity-20"></div>
              </div>
              <div>
                <h3 className="font-headline-md text-body-lg text-on-surface m-0 font-bold text-secondary">PHASE 4: Final Verification (v15.6.0)</h3>
                <div className="font-code text-body-sm text-on-surface-variant mt-1">Run test suite against patched codebase</div>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-body-sm text-secondary font-bold px-2 py-1 bg-secondary-container/20 border border-secondary rounded">
                VERIFIED GREEN
              </span>
              <span className="text-body-sm text-on-surface-variant font-bold">0.05s</span>
            </div>
          </div>
          {(activeStepIndex >= 3) && (
            <div className="p-md bg-surface-container-lowest font-code text-code text-on-surface-variant border-l-4 border-secondary overflow-x-auto relative">
              <pre className="m-0 leading-relaxed">
<span className="text-outline">============================= test session starts ==============================</span>
platform linux -- Python 3.11.4, pytest-7.4.0, pluggy-1.2.0
rootdir: /sandbox/workspace
collected 7 items

tests/test_customer.py <span className="text-secondary font-bold">.......</span>                                           <span className="text-secondary">[100%]</span>

<span className="text-secondary">============================== </span><span className="text-secondary font-bold">7 passed in 0.05s</span><span className="text-secondary"> ===============================</span>
              </pre>
              <div className="absolute right-4 top-4 text-secondary/10 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">check_circle</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
