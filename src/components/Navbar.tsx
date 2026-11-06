import React from 'react';
import {
  Bot,
  PieChart,
  Calculator,
  TrendingUp,
  FileText,
  Sparkles,
  UserCheck,
  Headphones,
} from 'lucide-react';
import { FinancialProfile } from '../types/financial';

export type ActiveTab = 'chat' | 'budget' | 'loan' | 'invest' | 'report';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeProfile: FinancialProfile;
  onOpenAudit: () => void;
  onOpenProfileModal: () => void;
  onOpenVoiceMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeProfile,
  onOpenAudit,
  onOpenProfileModal,
  onOpenVoiceMode,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-header border-b border-white/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <button
            onClick={() => setActiveTab('chat')}
            className="text-left group cursor-pointer"
          >
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-600 transition-colors whitespace-nowrap">
              FinPulse AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-medium whitespace-nowrap">
              Financial Intelligence
            </span>
          </button>
        </div>

        {/* Zone 2: 5 Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs lg:text-sm transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'chat'
                ? 'bg-emerald-50/90 text-emerald-800 font-semibold shadow-xs border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Bot className="w-4 h-4 text-emerald-600" />
            <span>AI Advisor</span>
          </button>

          <button
            onClick={() => setActiveTab('budget')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs lg:text-sm transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'budget'
                ? 'bg-emerald-50/90 text-emerald-800 font-semibold shadow-xs border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Budgeting</span>
          </button>

          <button
            onClick={() => setActiveTab('loan')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs lg:text-sm transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'loan'
                ? 'bg-emerald-50/90 text-emerald-800 font-semibold shadow-xs border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Loan Payoff</span>
          </button>

          <button
            onClick={() => setActiveTab('invest')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs lg:text-sm transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'invest'
                ? 'bg-emerald-50/90 text-emerald-800 font-semibold shadow-xs border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Compound Growth</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs lg:text-sm transition-all whitespace-nowrap shrink-0 ${
              activeTab === 'report'
                ? 'bg-emerald-50/90 text-emerald-800 font-semibold shadow-xs border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Project Report</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Voice Mode + Persona Switcher */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenVoiceMode && (
            <button
              onClick={onOpenVoiceMode}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
              title="Launch Live Voice Conversation Mode"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voice Mode</span>
            </button>
          )}

          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white/70 hover:bg-white border border-slate-200/80 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Switch Sample Financial Persona"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline text-slate-500">Persona:</span>
            <span className="font-semibold text-slate-800 max-w-[120px] truncate">{activeProfile.personaName}</span>
          </button>

          <button
            onClick={onOpenAudit}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-emerald-700 rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI Health Audit</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Tab Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200/60 px-2 py-1.5 bg-white/60 backdrop-blur-md overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'chat' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          AI Advisor
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'budget' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Budget
        </button>
        <button
          onClick={() => setActiveTab('loan')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'loan' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Loans
        </button>
        <button
          onClick={() => setActiveTab('invest')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'invest' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Invest
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap ${
            activeTab === 'report' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'
          }`}
        >
          Report
        </button>
      </div>
    </header>
  );
};
