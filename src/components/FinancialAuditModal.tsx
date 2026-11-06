import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { FinancialProfile, FinancialAuditResult } from '../types/financial';

interface FinancialAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: FinancialProfile;
  onDiscussInChat: (prompt: string) => void;
}

export const FinancialAuditModal: React.FC<FinancialAuditModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onDiscussInChat,
}) => {
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<FinancialAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: activeProfile }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setAuditResult(data);
    } catch (err: any) {
      console.error('Audit error:', err);
      setError('Could not run automated audit. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runAudit();
    }
  }, [isOpen, activeProfile.id]);

  if (!isOpen) return null;

  const handleDiscuss = () => {
    if (!auditResult) return;
    const prompt = `I just received my AI Financial Health Audit with a score of ${auditResult.score}/100.
Key Metrics:
- Savings Rate: ${auditResult.savingsRate}
- Emergency Runway: ${auditResult.emergencyRunway}
- Debt-to-Income: ${auditResult.debtToIncomeRatio}

Immediate Recommended Actions:
${auditResult.immediateActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Can you help me build a practical step-by-step roadmap to implement Action #1 this week?`;

    onClose();
    onDiscussInChat(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="glass-panel rounded-3xl max-w-2xl w-full border border-white/90 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/50 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                AI Financial Health Audit
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Persona: {activeProfile.personaName}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-white/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Evaluating financial health metrics...
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Analyzing savings rate, emergency buffer runway, and debt burden against standard financial planning benchmarks.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-xl text-xs flex items-center justify-between border border-red-200">
              <span>{error}</span>
              <button
                onClick={runAudit}
                className="px-3 py-1 bg-red-600 text-white font-semibold rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : auditResult ? (
            <>
              {/* Score & Key Metrics Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/60 p-4 rounded-2xl border border-white/80 shadow-xs">
                <div className="text-center sm:text-left sm:border-r border-slate-200/60 sm:pr-4">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Health Score
                  </span>
                  <div className="flex items-baseline justify-center sm:justify-start gap-1 mt-1">
                    <span className="text-3xl font-extrabold font-mono text-emerald-600">
                      {auditResult.score}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">/100</span>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Savings Rate
                  </span>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {auditResult.savingsRate}
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Emergency Runway
                  </span>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {auditResult.emergencyRunway}
                  </p>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Debt-to-Income
                  </span>
                  <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                    {auditResult.debtToIncomeRatio}
                  </p>
                </div>
              </div>

              {/* Strengths & Vulnerabilities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Key Strengths
                  </span>
                  <ul className="text-xs text-emerald-900/90 space-y-1.5">
                    {auditResult.strengths.map((str, idx) => (
                      <li key={idx} className="leading-relaxed">
                        • {str}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Critical Vulnerabilities
                  </span>
                  <ul className="text-xs text-amber-900/90 space-y-1.5">
                    {auditResult.vulnerabilities.map((vuln, idx) => (
                      <li key={idx} className="leading-relaxed">
                        • {vuln}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Immediate Actions */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Prioritized 30-Day Action Items
                </span>
                <div className="space-y-2">
                  {auditResult.immediateActions.map((action, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/70 border border-white/80 rounded-xl text-xs text-slate-700 flex items-start gap-2.5 shadow-xs"
                    >
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="leading-relaxed">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 12-Month Milestones */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  12-Month Strategic Milestones
                </span>
                <div className="space-y-2">
                  {auditResult.strategicMilestones.map((milestone, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/50 border border-white/80 rounded-xl text-xs text-slate-700 flex items-start gap-2.5 shadow-xs"
                    >
                      <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{milestone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/40 border-t border-slate-200/50 flex items-center justify-between">
          <button
            onClick={runAudit}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-run Audit</span>
          </button>

          <button
            onClick={handleDiscuss}
            disabled={!auditResult || loading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Discuss Audit with AI Advisor</span>
          </button>
        </div>
      </div>
    </div>
  );
};
