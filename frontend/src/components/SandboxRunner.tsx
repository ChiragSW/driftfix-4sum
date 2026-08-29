import React, { useState } from 'react';

export const SandboxRunner: React.FC = () => {
  const [running, setRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(3);

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
    <div className="w-full flex flex-col gap-6 animate-fadeIn">
      {/* Header matching Stitch Screen 5 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#30363d] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#dfe2eb] mb-1.5 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#7bdb80] text-[32px]">terminal</span>
            Daytona Sandbox Test Execution
          </h1>
          <div className="text-xs text-[#8b949e] font-normal">
            Isolated CI harness executing multi-stage acceptance tests.
          </div>
        </div>

        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={handleReset}
            disabled={running}
            className="bg-[#181c22] text-[#dfe2eb] text-xs font-semibold px-4 py-2 border border-[#30363d] rounded hover:bg-[#262a31] hover:border-[#8b949e] transition flex items-center gap-2 uppercase cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span> Reset
          </button>
          <button
            onClick={handleRunPipeline}
            disabled={running}
            className="bg-[#8957e5] text-white text-xs font-bold px-5 py-2.5 rounded hover:bg-[#713dcc] transition flex items-center gap-2 uppercase shadow-md cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            {running ? 'Executing Sandbox...' : 'Run Sandbox Verification Cycle'}
          </button>
        </div>
      </div>

      {/* CI Pipeline Steps */}
      <div className="flex flex-col gap-4">
        {/* PHASE 1: Baseline */}
        <div className="bg-[#181c22] border border-[#30363d] rounded overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-[#30363d] bg-[#1c2026]">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7bdb80]/20 border border-[#7bdb80] flex items-center justify-center text-[#7bdb80]">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#dfe2eb] m-0">PHASE 1: Baseline (v14.3.0)</h3>
                <div className="text-xs text-[#8b949e] mt-0.5">Setup initial environment and run baseline tests</div>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-xs text-[#7bdb80] px-2.5 py-1 bg-[#7bdb80]/15 border border-[#7bdb80]/30 rounded font-bold">
                PASSED
              </span>
              <span className="text-xs text-[#8b949e]">0.04s</span>
            </div>
          </div>
          {(activeStepIndex >= 0) && (
            <div className="p-5 bg-[#0d1117] font-mono text-xs text-[#8b949e] border-l-4 border-l-[#7bdb80] overflow-x-auto">
              <pre className="m-0 leading-relaxed">
<span className="text-[#8b949e]">============================= test session starts ==============================</span>
platform linux -- Python 3.11.4, pytest-7.4.0, pluggy-1.2.0
rootdir: /sandbox/workspace
collected 7 items

tests/test_customer.py <span className="text-[#7bdb80] font-bold">.......</span>                                           <span className="text-[#7bdb80]">[100%]</span>

<span className="text-[#7bdb80]">============================== </span><span className="text-[#7bdb80] font-bold">7 passed in 0.04s</span><span className="text-[#7bdb80]"> ===============================</span>
              </pre>
            </div>
          )}
        </div>

        {/* PHASE 2: Dependency-only */}
        <div className="bg-[#181c22] border border-[#30363d] rounded overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-[#30363d] bg-[#1c2026]">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#da3633]/20 border border-[#da3633] flex items-center justify-center text-[#ffb4ab]">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#dfe2eb] m-0">PHASE 2: Dependency-only (v15.6.0)</h3>
                <div className="text-xs text-[#8b949e] mt-0.5">Upgrade Stripe SDK and identify breaking changes</div>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-xs text-[#ffb4ab] px-2.5 py-1 bg-[#da3633]/20 border border-[#da3633] rounded font-bold">
                EXPECTED FAILURE
              </span>
              <span className="text-xs text-[#8b949e]">0.08s</span>
            </div>
          </div>
          {(activeStepIndex >= 1) && (
            <div className="p-5 bg-[#0d1117] font-mono text-xs text-[#8b949e] border-l-4 border-l-[#da3633] overflow-x-auto">
              <pre className="m-0 leading-relaxed">
<span className="text-[#8b949e]">============================= test session starts ==============================</span>
platform linux -- Python 3.11.4, pytest-7.4.0, pluggy-1.2.0
rootdir: /sandbox/workspace
collected 7 items

tests/test_customer.py <span className="text-[#da3633] font-bold">FFFFFFF</span>                                           <span className="text-[#da3633]">[100%]</span>

=================================== FAILURES ===================================
<span className="text-[#da3633] font-bold">_________________________ test_get_customer_details __________________________</span>

    def test_get_customer_details():
        customer_service = CustomerService()
&gt;       result = customer_service.get_customer("cus_123")

tests/test_customer.py:12: 
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ 
src/customer_service.py:45: in get_customer
    return stripe.Customer.get(customer_id)
<span className="text-[#da3633] font-bold">E   AttributeError: 'Customer' object has no attribute 'get'</span>

<span className="text-[#da3633]">=========================== </span><span className="text-[#da3633] font-bold">7 failed in 0.08s</span><span className="text-[#da3633]"> ==============================</span>
              </pre>
            </div>
          )}
        </div>

        {/* PHASE 3: Apply DriftFix Patch */}
        <div className="bg-[#181c22] border border-[#30363d] rounded overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-[#30363d] bg-[#1c2026]">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#8957e5]/20 border border-[#8957e5] flex items-center justify-center text-[#d3bbff]">
                <span className="material-symbols-outlined text-[18px]">build</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#dfe2eb] m-0">PHASE 3: Apply DriftFix Patch</h3>
                <div className="text-xs text-[#8b949e] mt-0.5">Inject AST modifications to resolve drift</div>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-xs text-[#d3bbff] px-2.5 py-1 bg-[#8957e5]/20 border border-[#8957e5]/40 rounded font-bold">
                APPLIED
              </span>
            </div>
          </div>
          {(activeStepIndex >= 2) && (
            <div className="p-5 bg-[#0d1117] font-mono text-xs text-[#8b949e] border-l-4 border-l-[#8957e5] overflow-x-auto flex flex-col gap-4">
              <div className="text-[#dfe2eb]">Applying driftfix patch to <span className="text-[#d3bbff] font-bold">src/customer_service.py</span>...</div>
              <div className="border border-[#30363d] rounded overflow-hidden">
                <div className="bg-[#181c22] px-4 py-2 border-b border-[#30363d] text-xs font-mono text-[#8b949e] flex justify-between">
                  <span>src/customer_service.py</span>
                  <span>Python</span>
                </div>
                <div className="p-4 bg-[#0d1117]">
                  <pre className="m-0 leading-relaxed text-[13px]">
<span className="text-[#8b949e]/60">42 |</span>     def get_customer(self, customer_id: str):
<span className="text-[#8b949e]/60">43 |</span>         """Retrieve customer details from Stripe."""
<span className="bg-[#da3633]/20 text-[#ffb4ab] px-1 py-0.5 rounded"><span className="text-[#da3633]/70">44 |</span>-        return stripe.Customer.get(customer_id)</span>
<span className="bg-[#7bdb80]/20 text-[#7bdb80] font-bold px-1 py-0.5 rounded"><span className="text-[#7bdb80]/70">45 |</span>+        return stripe.Customer.to_dict().get(customer_id)</span>
<span className="text-[#8b949e]/60">46 |</span>
<span className="text-[#8b949e]/60">47 |</span>     def update_customer(self, customer_id: str, data: dict):
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PHASE 4: Final Verification */}
        <div className="bg-[#181c22] border border-[#30363d] rounded overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-[#30363d] bg-[#1c2026]">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-[#7bdb80]/20 border border-[#7bdb80] flex items-center justify-center text-[#7bdb80] relative">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <div className="absolute inset-0 bg-[#7bdb80] rounded-full animate-ping opacity-20"></div>
              </div>
              <div>
                <h3 className="text-base font-bold text-[#7bdb80] m-0">PHASE 4: Final Verification (v15.6.0)</h3>
                <div className="text-xs text-[#8b949e] mt-0.5">Run test suite against patched codebase</div>
              </div>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-xs text-[#7bdb80] font-bold px-2.5 py-1 bg-[#7bdb80]/20 border border-[#7bdb80] rounded">
                VERIFIED GREEN
              </span>
              <span className="text-xs text-[#8b949e] font-bold">0.05s</span>
            </div>
          </div>
          {(activeStepIndex >= 3) && (
            <div className="p-5 bg-[#0d1117] font-mono text-xs text-[#8b949e] border-l-4 border-l-[#7bdb80] overflow-x-auto relative">
              <pre className="m-0 leading-relaxed">
<span className="text-[#8b949e]">============================= test session starts ==============================</span>
platform linux -- Python 3.11.4, pytest-7.4.0, pluggy-1.2.0
rootdir: /sandbox/workspace
collected 7 items

tests/test_customer.py <span className="text-[#7bdb80] font-bold">.......</span>                                           <span className="text-[#7bdb80]">[100%]</span>

<span className="text-[#7bdb80]">============================== </span><span className="text-[#7bdb80] font-bold">7 passed in 0.05s</span><span className="text-[#7bdb80]"> ===============================</span>
              </pre>
              <div className="absolute right-6 top-6 text-[#7bdb80]/10 pointer-events-none">
                <span className="material-symbols-outlined text-[100px]">check_circle</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
