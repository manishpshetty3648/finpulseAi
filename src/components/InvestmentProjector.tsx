import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Percent,
  Clock,
  PiggyBank,
  CheckCircle2,
} from 'lucide-react';
import { FinancialProfile } from '../types/financial';

interface InvestmentProjectorProps {
  activeProfile: FinancialProfile;
  onSendToChat: (message: string) => void;
}

export const InvestmentProjector: React.FC<InvestmentProjectorProps> = ({
  activeProfile,
  onSendToChat,
}) => {
  const [initialDeposit, setInitialDeposit] = useState<number>(activeProfile.currentSavings);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(activeProfile.monthlySavings);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(8.0);
  const [timeHorizonYears, setTimeHorizonYears] = useState<number>(20);

  // Compute Year-by-Year Growth Table and Totals
  const monthlyRate = annualReturnRate / 100 / 12;

  let currentBalance = initialDeposit;
  let totalDeposited = initialDeposit;

  const yearlyBreakdown: Array<{
    year: number;
    totalBalance: number;
    totalDeposits: number;
    compoundInterestEarned: number;
  }> = [];

  for (let y = 1; y <= timeHorizonYears; y++) {
    for (let m = 0; m < 12; m++) {
      currentBalance = currentBalance * (1 + monthlyRate) + monthlyContribution;
      totalDeposited += monthlyContribution;
    }
    yearlyBreakdown.push({
      year: y,
      totalBalance: Math.round(currentBalance),
      totalDeposits: Math.round(totalDeposited),
      compoundInterestEarned: Math.max(0, Math.round(currentBalance - totalDeposited)),
    });
  }

  const finalBalance = yearlyBreakdown[yearlyBreakdown.length - 1]?.totalBalance || initialDeposit;
  const finalDeposits = yearlyBreakdown[yearlyBreakdown.length - 1]?.totalDeposits || initialDeposit;
  const finalInterest = yearlyBreakdown[yearlyBreakdown.length - 1]?.compoundInterestEarned || 0;

  // Rule of 72
  const doublingYears = annualReturnRate > 0 ? (72 / annualReturnRate).toFixed(1) : '∞';

  const handleAskAIAboutInvestments = () => {
    const prompt = `Please review my wealth accumulation and compound interest projection:
- Starting Principal: $${initialDeposit.toLocaleString()}
- Monthly Contribution: $${monthlyContribution.toLocaleString()}/month ($${(monthlyContribution * 12).toLocaleString()}/year)
- Expected Annual Return: ${annualReturnRate}% (Historical S&P 500 inflation-adjusted is ~7-8%)
- Investment Horizon: ${timeHorizonYears} Years

Results:
- Total Personal Contributions: $${finalDeposits.toLocaleString()}
- Pure Compound Growth (Interest Earned): $${finalInterest.toLocaleString()}
- Projected Total Portfolio Value: $${finalBalance.toLocaleString()}
- Rule of 72 Doubling Time: Every ~${doublingYears} years

Please provide guidance on:
1. Recommended asset allocation for this horizon (e.g. 3-Fund Portfolio: VTI / VXUS / BND).
2. Which tax-advantaged accounts to fill first (401k match, Roth IRA, HSA, Taxable Brokerage).
3. How inflation affects real purchasing power and how to hedge against it.`;

    onSendToChat(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Exponential Wealth Accumulation</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Compound Interest & Wealth Growth Simulator
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Harness the mathematical power of exponential compounding. Visualize your capital growth over decades through disciplined dollar-cost averaging.
          </p>
        </div>

        <button
          onClick={handleAskAIAboutInvestments}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
          <span>AI Investment Strategy Guidance</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Future Portfolio Value
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            ${finalBalance.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            After {timeHorizonYears} years of compounding
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
            Compound Interest Earned
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-2">
            ${finalInterest.toLocaleString()}
          </p>
          <span className="text-xs text-emerald-600 font-medium mt-1 block">
            {finalBalance > 0 ? Math.round((finalInterest / finalBalance) * 100) : 0}% of your wealth is pure interest!
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
            Total Out-of-Pocket Deposits
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-2">
            ${finalDeposits.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Principal contributed over time
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block">
            Rule of 72 Doubling Time
          </span>
          <p className="text-2xl font-bold font-mono tabular-nums text-purple-700 mt-2">
            ~{doublingYears} Years
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            At {annualReturnRate}% annual return
          </span>
        </div>
      </div>

      {/* Simulator Inputs & Progress Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200/50 flex items-center justify-between">
            <span>Projection Parameters</span>
            <span className="text-xs text-slate-400 font-normal">Real-Time Sliders</span>
          </h3>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Initial Starting Deposit</span>
              <span className="font-mono text-slate-900">${initialDeposit.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="500"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Monthly Recurring Contribution</span>
              <span className="font-mono text-emerald-800 font-bold">${monthlyContribution.toLocaleString()}/mo</span>
            </div>
            <input
              type="range"
              min="25"
              max="5000"
              step="25"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Expected Annual Return Rate</span>
              <span className="font-mono text-slate-900">{annualReturnRate}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>4.5% (HYSA)</span>
              <span>8.0% (Index Fund)</span>
              <span>12% (Aggressive)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Time Horizon</span>
              <span className="font-mono text-slate-900">{timeHorizonYears} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={timeHorizonYears}
              onChange={(e) => setTimeHorizonYears(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Asset Allocation Preset Pills */}
          <div className="pt-2 border-t border-slate-200/50">
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              Common Vehicle Benchmarks:
            </span>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setAnnualReturnRate(4.5)}
                className="p-1.5 bg-white/70 hover:bg-white border border-slate-200/80 rounded-lg text-center transition-colors font-medium text-slate-700 cursor-pointer"
              >
                HYSA (4.5%)
              </button>
              <button
                type="button"
                onClick={() => setAnnualReturnRate(7.5)}
                className="p-1.5 bg-white/70 hover:bg-white border border-slate-200/80 rounded-lg text-center transition-colors font-medium text-slate-700 cursor-pointer"
              >
                Balanced (7.5%)
              </button>
              <button
                type="button"
                onClick={() => setAnnualReturnRate(10.0)}
                className="p-1.5 bg-white/70 hover:bg-white border border-slate-200/80 rounded-lg text-center transition-colors font-medium text-slate-700 cursor-pointer"
              >
                S&P 500 (10%)
              </button>
            </div>
          </div>
        </div>

        {/* Milestone Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-200/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Year-by-Year Growth Trajectory (Tabular Figures)
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Horizon: {timeHorizonYears} Years
              </span>
            </div>

            <div className="overflow-x-auto max-h-[380px]">
              <table className="min-w-full divide-y divide-slate-200/60 text-xs text-left">
                <thead className="bg-white/60 font-semibold text-slate-700 sticky top-0 backdrop-blur-xs">
                  <tr>
                    <th className="px-4 py-2.5">Timeline</th>
                    <th className="px-4 py-2.5">Total Deposits</th>
                    <th className="px-4 py-2.5">Interest Earned</th>
                    <th className="px-4 py-2.5">End-of-Year Portfolio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60 bg-white/30">
                  {yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-white/60">
                      <td className="px-4 py-2 font-semibold text-slate-900">
                        Year {row.year}
                      </td>
                      <td className="px-4 py-2 font-mono tabular-nums text-slate-600">
                        ${row.totalDeposits.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 font-mono tabular-nums text-emerald-600 font-medium">
                        +${row.compoundInterestEarned.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 font-mono tabular-nums font-bold text-slate-900">
                        ${row.totalBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-white/60 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-600">
            <span>
              Disciplined <strong>${monthlyContribution.toLocaleString()}/month</strong> DCA compounding over time.
            </span>
            <span className="font-mono font-semibold text-slate-900">
              Final: ${finalBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
