import React, { useState } from 'react';
import {
  Calculator,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { FinancialProfile, DebtItem } from '../types/financial';

interface LoanCalculatorProps {
  activeProfile: FinancialProfile;
  onSendToChat: (message: string) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  activeProfile,
  onSendToChat,
}) => {
  // Calculator mode: single loan EMI or full debt payoff strategy
  const [mode, setMode] = useState<'single' | 'avalanche_snowball'>('single');

  // Single Loan state
  const [loanAmount, setLoanAmount] = useState<number>(25000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(100);

  // Multi-debt state (preset from activeProfile)
  const [debts, setDebts] = useState<DebtItem[]>(
    activeProfile.debts.length > 0
      ? activeProfile.debts
      : [
          { id: '1', name: 'Credit Card Balance', balance: 4200, interestRate: 23.9, minimumPayment: 130 },
          { id: '2', name: 'Student Loan', balance: 18500, interestRate: 5.8, minimumPayment: 210 },
          { id: '3', name: 'Auto Loan', balance: 12000, interestRate: 6.9, minimumPayment: 265 },
        ]
  );
  const [extraPayoffPool, setExtraPayoffPool] = useState<number>(250);

  // New debt form state
  const [newDebtName, setNewDebtName] = useState('');
  const [newDebtBalance, setNewDebtBalance] = useState('');
  const [newDebtRate, setNewDebtRate] = useState('');
  const [newDebtMin, setNewDebtMin] = useState('');

  // Single Loan EMI Math
  const tenureMonths = tenureYears * 12;
  const monthlyRate = interestRate / 100 / 12;

  // Base monthly EMI formula
  const baseMonthlyEMI =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      : loanAmount / tenureMonths;

  // Standard payoff schedule
  let standardTotalInterest = 0;
  let remainingStandard = loanAmount;
  for (let m = 0; m < tenureMonths; m++) {
    const interestCharge = remainingStandard * monthlyRate;
    const principalPaid = baseMonthlyEMI - interestCharge;
    standardTotalInterest += interestCharge;
    remainingStandard -= principalPaid;
    if (remainingStandard <= 0) break;
  }

  // Accelerated payoff schedule
  let acceleratedMonths = 0;
  let acceleratedTotalInterest = 0;
  let remainingAccelerated = loanAmount;
  const totalAcceleratedMonthly = baseMonthlyEMI + extraMonthlyPayment;

  while (remainingAccelerated > 0 && acceleratedMonths < tenureMonths * 2) {
    acceleratedMonths++;
    const interestCharge = remainingAccelerated * monthlyRate;
    const principalPaid = Math.min(remainingAccelerated, totalAcceleratedMonthly - interestCharge);
    acceleratedTotalInterest += interestCharge;
    remainingAccelerated -= principalPaid;
  }

  const interestSaved = Math.max(0, standardTotalInterest - acceleratedTotalInterest);
  const monthsSaved = Math.max(0, tenureMonths - acceleratedMonths);

  // Multi-Debt Avalanche vs Snowball Calculations
  const avalancheSorted = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  const snowballSorted = [...debts].sort((a, b) => a.balance - b.balance);

  const totalDebtBalance = debts.reduce((sum, d) => sum + d.balance, 0);
  const totalMinimumPayments = debts.reduce((sum, d) => sum + d.minimumPayment, 0);

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(newDebtBalance);
    const rate = parseFloat(newDebtRate);
    const minPay = parseFloat(newDebtMin);
    if (!newDebtName.trim() || isNaN(balance) || isNaN(rate) || isNaN(minPay)) return;

    const newDebt: DebtItem = {
      id: `debt-${Date.now()}`,
      name: newDebtName.trim(),
      balance,
      interestRate: rate,
      minimumPayment: minPay,
    };

    setDebts([...debts, newDebt]);
    setNewDebtName('');
    setNewDebtBalance('');
    setNewDebtRate('');
    setNewDebtMin('');
  };

  const handleDeleteDebt = (id: string) => {
    setDebts(debts.filter((d) => d.id !== id));
  };

  const handleAskAIAboutLoan = () => {
    const prompt = `Please review my loan and accelerated payoff plan:
- Loan Principal: $${loanAmount.toLocaleString()}
- Annual Interest Rate (APR): ${interestRate}%
- Loan Tenure: ${tenureYears} Years (${tenureMonths} Months)
- Standard Base EMI: $${Math.round(baseMonthlyEMI).toLocaleString()}/month
- Extra Monthly Payment Applied: $${extraMonthlyPayment.toLocaleString()}/month (Total Payment: $${Math.round(baseMonthlyEMI + extraMonthlyPayment).toLocaleString()}/mo)

Key Calculations:
- Standard Total Interest: $${Math.round(standardTotalInterest).toLocaleString()}
- Accelerated Total Interest: $${Math.round(acceleratedTotalInterest).toLocaleString()}
- Projected Interest Savings: $${Math.round(interestSaved).toLocaleString()}
- Time Saved: ${monthsSaved} Months (${(monthsSaved / 12).toFixed(1)} years sooner)

Can you explain the mathematical leverage behind paying this extra amount and provide advice on whether I should put this extra $${extraMonthlyPayment}/mo into the loan or invest in an index fund?`;

    onSendToChat(prompt);
  };

  const handleAskAIAboutStrategy = () => {
    const prompt = `Please analyze and compare Debt Avalanche vs Debt Snowball for my active liabilities:
Total Debt: $${totalDebtBalance.toLocaleString()} across ${debts.length} accounts.
Total Minimum Monthly Payments: $${totalMinimumPayments.toLocaleString()}/month.
Extra Payoff Acceleration Pool: $${extraPayoffPool.toLocaleString()}/month.

Debt Accounts:
${debts.map((d) => `• ${d.name}: Balance $${d.balance.toLocaleString()} @ ${d.interestRate}% APR (Min: $${d.minimumPayment}/mo)`).join('\n')}

1. Calculate the exact order of accounts to attack for both Avalanche and Snowball.
2. Estimate the difference in total interest paid.
3. Recommend which method fits best given the psychological and mathematical balance.`;

    onSendToChat(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Mathematical Debt & EMI Optimization</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Loan Amortization & Debt Payoff Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Calculate exact monthly payments, quantify the power of extra payments, and compare Debt Avalanche vs. Debt Snowball strategies.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-white/70 border border-slate-200/80 rounded-xl shrink-0">
          <button
            onClick={() => setMode('single')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'single'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Loan EMI
          </button>
          <button
            onClick={() => setMode('avalanche_snowball')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'avalanche_snowball'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Avalanche vs. Snowball
          </button>
        </div>
      </div>

      {mode === 'single' ? (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Standard Monthly EMI
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                ${Math.round(baseMonthlyEMI).toLocaleString()}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
              <span className="text-xs text-slate-400 mt-1 block">
                Principal + Interest without extra pay
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
                Accelerated Payment
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
                ${Math.round(baseMonthlyEMI + extraMonthlyPayment).toLocaleString()}
                <span className="text-xs font-normal text-slate-400">/mo</span>
              </p>
              <span className="text-xs text-emerald-600 font-medium mt-1 block">
                Includes +${extraMonthlyPayment}/mo extra principal
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block">
                Interest Saved
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-2">
                ${Math.round(interestSaved).toLocaleString()}
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Total borrowing fees avoided
              </span>
            </div>

            <div className="glass-card rounded-2xl p-5 shadow-xs">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">
                Time Saved
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-2">
                {monthsSaved} Months
              </p>
              <span className="text-xs text-slate-500 mt-1 block">
                Debt-free {(monthsSaved / 12).toFixed(1)} years sooner
              </span>
            </div>
          </div>

          {/* Calculator Inputs & Visual Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="glass-panel rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200/50 flex items-center justify-between">
                <span>Loan Parameters</span>
                <span className="text-xs text-slate-400 font-normal">Dynamic Sliders</span>
              </h3>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Loan Amount / Principal</span>
                  <span className="font-mono text-slate-900">${loanAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="100000"
                  step="500"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Annual Interest Rate (APR)</span>
                  <span className="font-mono text-slate-900">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Loan Tenure</span>
                  <span className="font-mono text-slate-900">{tenureYears} Years ({tenureMonths} Mo)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-emerald-700 mb-1">
                  <span>Extra Monthly Principal</span>
                  <span className="font-mono text-emerald-800 font-bold">+${extraMonthlyPayment}/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="25"
                  value={extraMonthlyPayment}
                  onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <button
                onClick={handleAskAIAboutLoan}
                className="w-full py-2.5 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>Ask AI to Analyze Payoff vs Investing</span>
              </button>
            </div>

            {/* Payoff Comparison Visual */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                  Standard vs Accelerated Payoff Comparison
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                  <div className="p-4 bg-white/60 border border-slate-200/80 rounded-xl space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      Standard Plan (0 Extra)
                    </span>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monthly Payment:</span>
                        <span className="font-mono font-semibold">${Math.round(baseMonthlyEMI).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Interest Paid:</span>
                        <span className="font-mono font-semibold text-red-600">${Math.round(standardTotalInterest).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Loan Cost:</span>
                        <span className="font-mono font-semibold">${Math.round(loanAmount + standardTotalInterest).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration:</span>
                        <span className="font-mono font-semibold">{tenureYears} Years</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                      Accelerated Plan (+${extraMonthlyPayment}/mo)
                    </span>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Monthly Payment:</span>
                        <span className="font-mono font-semibold text-emerald-900">${Math.round(baseMonthlyEMI + extraMonthlyPayment).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Interest Paid:</span>
                        <span className="font-mono font-semibold text-emerald-700">${Math.round(acceleratedTotalInterest).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Loan Cost:</span>
                        <span className="font-mono font-semibold text-slate-900">${Math.round(loanAmount + acceleratedTotalInterest).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Duration:</span>
                        <span className="font-mono font-semibold text-emerald-800">
                          {Math.floor(acceleratedMonths / 12)} Yrs {acceleratedMonths % 12} Mo
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-white/60 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-800 block">Financial Advisor Takeaway:</span>
                  <p>
                    Adding an extra <strong>${extraMonthlyPayment}/month</strong> saves you <strong>${Math.round(interestSaved).toLocaleString()}</strong> in borrowing fees and eliminates debt <strong>{monthsSaved} months faster</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Multi-Debt Avalanche vs Snowball Mode */
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Active Debt Portfolio ({debts.length} Accounts)
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-1">
                ${totalDebtBalance.toLocaleString()}
              </p>
              <span className="text-xs text-slate-500">
                Minimum Monthly Obligation: ${totalMinimumPayments.toLocaleString()}/mo
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Extra Monthly Acceleration Pool:
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-mono text-xs">$</span>
                  <input
                    type="number"
                    value={extraPayoffPool}
                    onChange={(e) => setExtraPayoffPool(Math.max(0, Number(e.target.value)))}
                    className="pl-6 pr-3 py-1.5 text-sm font-bold font-mono bg-white/80 border border-slate-200 rounded-xl w-36 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleAskAIAboutStrategy}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 rounded-xl transition-all shadow-xs cursor-pointer self-end"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>AI Payoff Strategy Audit</span>
              </button>
            </div>
          </div>

          {/* Comparison Columns: Avalanche vs Snowball */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Avalanche Column */}
            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Debt Avalanche Method
                  </h3>
                  <span className="text-xs text-emerald-700 font-medium">
                    Highest APR First (Mathematically Optimal)
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                  Saves Maximum $$
                </span>
              </div>

              <p className="text-xs text-slate-500 my-3">
                Pay minimums on all accounts, then funnel the entire +${extraPayoffPool}/mo extra pool into the highest interest account. Rollover payments upon payoff.
              </p>

              <div className="space-y-2">
                {avalancheSorted.map((debt, index) => (
                  <div
                    key={debt.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      index === 0
                        ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-500/20'
                        : 'bg-white/60 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">#{index + 1}</span>
                        <span className="font-semibold text-slate-900">{debt.name}</span>
                        {index === 0 && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-emerald-600 text-white rounded">
                            Target Now
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 font-mono text-[11px] block mt-0.5">
                        Balance: ${debt.balance.toLocaleString()} · Min: ${debt.minimumPayment}/mo
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold font-mono text-red-600 text-sm">
                        {debt.interestRate}% APR
                      </span>
                      {index === 0 && (
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          Pay: ${debt.minimumPayment + extraPayoffPool}/mo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Snowball Column */}
            <div className="glass-panel rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Debt Snowball Method
                  </h3>
                  <span className="text-xs text-blue-700 font-medium">
                    Lowest Balance First (Psychological Momentum)
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/60">
                  Quickest Wins
                </span>
              </div>

              <p className="text-xs text-slate-500 my-3">
                Pay minimums on all accounts, then attack the smallest balance account first to rapidly eliminate individual accounts and build confidence.
              </p>

              <div className="space-y-2">
                {snowballSorted.map((debt, index) => (
                  <div
                    key={debt.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      index === 0
                        ? 'bg-blue-50/80 border-blue-300 ring-1 ring-blue-500/20'
                        : 'bg-white/60 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">#{index + 1}</span>
                        <span className="font-semibold text-slate-900">{debt.name}</span>
                        {index === 0 && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-blue-600 text-white rounded">
                            Target Now
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 font-mono text-[11px] block mt-0.5">
                        Balance: ${debt.balance.toLocaleString()} · Min: ${debt.minimumPayment}/mo
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold font-mono text-slate-700 text-sm">
                        {debt.interestRate}% APR
                      </span>
                      {index === 0 && (
                        <span className="text-[10px] text-blue-700 font-bold block">
                          Pay: ${debt.minimumPayment + extraPayoffPool}/mo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Debt Form */}
          <div className="glass-panel rounded-2xl p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Add Debt Account to Portfolio</span>
            </h3>
            <form onSubmit={handleAddDebt} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="e.g. Visa Card, Car Loan"
                  value={newDebtName}
                  onChange={(e) => setNewDebtName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Balance ($)"
                  value={newDebtBalance}
                  onChange={(e) => setNewDebtBalance(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="APR (%)"
                  value={newDebtRate}
                  onChange={(e) => setNewDebtRate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min Pay ($)"
                  value={newDebtMin}
                  onChange={(e) => setNewDebtMin(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-white/80 border border-slate-200 rounded-xl outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
