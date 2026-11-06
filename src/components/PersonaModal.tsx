import React from 'react';
import { X, UserCheck, Check, Plus, ArrowRight } from 'lucide-react';
import { FinancialProfile, SAMPLE_PROFILES } from '../types/financial';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: FinancialProfile;
  onSelectProfile: (profile: FinancialProfile) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  onSelectProfile,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="glass-panel rounded-3xl max-w-xl w-full border border-white/90 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/50 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <UserCheck className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Select Financial Persona
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                Test how FinPulse AI adapts advice to different financial situations
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

        {/* Persona Options */}
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {SAMPLE_PROFILES.map((profile) => {
            const isSelected = profile.id === activeProfile.id;
            return (
              <div
                key={profile.id}
                onClick={() => {
                  onSelectProfile(profile);
                  onClose();
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-white/90 shadow-md ring-2 ring-emerald-500/20'
                    : 'glass-card border-white/80 hover:bg-white/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {profile.personaName}
                    </span>
                    {isSelected && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {profile.personaDescription}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center gap-4 text-xs font-mono text-slate-500">
                  <span>Income: ${profile.monthlyIncome.toLocaleString()}/mo</span>
                  <span>·</span>
                  <span>Savings: ${profile.currentSavings.toLocaleString()}</span>
                  <span>·</span>
                  <span className={profile.totalDebt > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
                    Debt: ${profile.totalDebt.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white/40 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
          <span>You can also edit parameters directly in the Budget and Loan calculators.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
