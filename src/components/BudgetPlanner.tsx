import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { FinancialProfile, BudgetItem } from '../types/financial';

interface BudgetPlannerProps {
  activeProfile: FinancialProfile;
  onUpdateProfile: (updated: Partial<FinancialProfile>) => void;
  onSendToChat: (message: string) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  activeProfile,
  onUpdateProfile,
  onSendToChat,
}) => {
  const [income, setIncome] = useState<number>(activeProfile.monthlyIncome);
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', category: 'needs', name: 'Housing & Rent / Mortgage', amount: Math.round(activeProfile.monthlyNeeds * 0.6) },
    { id: '2', category: 'needs', name: 'Groceries & Household Supplies', amount: Math.round(activeProfile.monthlyNeeds * 0.2) },
    { id: '3', category: 'needs', name: 'Utilities, Internet & Insurance', amount: Math.round(activeProfile.monthlyNeeds * 0.2) },
    { id: '4', category: 'wants', name: 'Dining Out & Takeaway', amount: Math.round(activeProfile.monthlyWants * 0.45) },
    { id: '5', category: 'wants', name: 'Streaming, Entertainment & Hobbies', amount: Math.round(activeProfile.monthlyWants * 0.35) },
    { id: '6', category: 'wants', name: 'Shopping & Apparel', amount: Math.round(activeProfile.monthlyWants * 0.2) },
    { id: '7', category: 'savings', name: 'High-Yield Emergency Fund', amount: Math.round(activeProfile.monthlySavings * 0.5) },
    { id: '8', category: 'savings', name: 'Retirement (401k/Roth IRA/Index)', amount: Math.round(activeProfile.monthlySavings * 0.5) },
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<'needs' | 'wants' | 'savings'>('needs');

  // Calculate totals
  const totalNeeds = items
    .filter((i) => i.category === 'needs')
    .reduce((sum, i) => sum + i.amount, 0);
  const totalWants = items
    .filter((i) => i.category === 'wants')
    .reduce((sum, i) => sum + i.amount, 0);
  const totalSavings = items
    .filter((i) => i.category === 'savings')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalSpent = totalNeeds + totalWants + totalSavings;
  const netRemaining = income - totalSpent;

  // Percentages
  const needsPct = income > 0 ? Math.round((totalNeeds / income) * 100) : 0;
  const wantsPct = income > 0 ? Math.round((totalWants / income) * 100) : 0;
  const savingsPct = income > 0 ? Math.round((totalSavings / income) * 100) : 0;

  // 50/30/20 Targets
  const targetNeeds = Math.round(income * 0.5);
  const targetWants = Math.round(income * 0.3);
  const targetSavings = Math.round(income * 0.2);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newItemAmount);
    if (!newItemName.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newItem: BudgetItem = {
      id: `item-${Date.now()}`,
      category: newItemCategory,
      name: newItemName.trim(),
      amount: parsedAmount,
    };

    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemAmount('');
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleSyncToProfile = () => {
    onUpdateProfile({
      monthlyIncome: income,
      monthlyNeeds: totalNeeds,
      monthlyWants: totalWants,
      monthlySavings: totalSavings,
    });
  };

  const handleAskAIToOptimize = () => {
    handleSyncToProfile();
    const prompt = `Please review and optimize my monthly budget breakdown based on the 50/30/20 rule:
- Monthly Net Income: $${income.toLocaleString()}
- Total Spent: $${totalSpent.toLocaleString()} (Remaining Unallocated: $${netRemaining.toLocaleString()})
- Needs (Essentials): $${totalNeeds.toLocaleString()} (${needsPct}% vs 50% target of $${targetNeeds.toLocaleString()})
- Wants (Discretionary): $${totalWants.toLocaleString()} (${wantsPct}% vs 30% target of $${targetWants.toLocaleString()})
- Savings & Debt Repayment: $${totalSavings.toLocaleString()} (${savingsPct}% vs 20% target of $${targetSavings.toLocaleString()})

Itemized Expenses:
${items.map((i) => `• [${i.category.toUpperCase()}] ${i.name}: $${i.amount}`).join('\n')}

What specific line items should I adjust to balance this budget, eliminate waste, and accelerate my savings?`;

    onSendToChat(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <PieChart className="w-4 h-4 text-emerald-600" />
            <span>Interactive Allocation Simulator</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            50/30/20 & Zero-Based Budget Planner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulate your income allocation, test expense adjustments, and balance essential needs, discretionary wants, and wealth-building savings.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSyncToProfile}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Sync to Profile
          </button>
          <button
            onClick={handleAskAIToOptimize}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>AI Budget Optimization</span>
          </button>
        </div>
      </div>

      {/* Income & Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Net Income Input */}
        <div className="glass-card rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Monthly Net Income
          </span>
          <div className="relative mt-2">
            <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">$</span>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
              className="w-full pl-8 pr-3 py-2 text-lg font-bold font-mono tabular-nums text-slate-900 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 mt-2 block">
            Take-home pay after taxes & health deductions.
          </span>
        </div>

        {/* Needs Card */}
        <div className="glass-card rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Needs (50% Target)
            </span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
              {needsPct}%
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            ${totalNeeds.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Target: ${targetNeeds.toLocaleString()}{' '}
            <span className={totalNeeds > targetNeeds ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
              ({totalNeeds > targetNeeds ? `+$${(totalNeeds - targetNeeds).toLocaleString()} over` : `-$${(targetNeeds - totalNeeds).toLocaleString()} under`})
            </span>
          </span>
        </div>

        {/* Wants Card */}
        <div className="glass-card rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
              Wants (30% Target)
            </span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60">
              {wantsPct}%
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            ${totalWants.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Target: ${targetWants.toLocaleString()}{' '}
            <span className={totalWants > targetWants ? 'text-amber-600 font-semibold' : 'text-slate-400'}>
              ({totalWants > targetWants ? `+$${(totalWants - targetWants).toLocaleString()} over` : `-$${(targetWants - totalWants).toLocaleString()} under`})
            </span>
          </span>
        </div>

        {/* Savings Card */}
        <div className="glass-card rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Savings & Debt (20% Target)
            </span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              {savingsPct}%
            </span>
          </div>
          <p className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            ${totalSavings.toLocaleString()}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">
            Target: ${targetSavings.toLocaleString()}{' '}
            <span className={totalSavings < targetSavings ? 'text-amber-600 font-semibold' : 'text-emerald-600'}>
              ({totalSavings >= targetSavings ? `+$${(totalSavings - targetSavings).toLocaleString()} ahead` : `-$${(targetSavings - totalSavings).toLocaleString()} gap`})
            </span>
          </span>
        </div>
      </div>

      {/* Visual Proportion Bar */}
      <div className="glass-panel rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-slate-700">Current Allocation Breakdown:</span>
          <span className="font-mono tabular-nums text-slate-500">
            Total Allocated: ${totalSpent.toLocaleString()} of ${income.toLocaleString()} (
            {income > 0 ? Math.round((totalSpent / income) * 100) : 0}%)
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-6 w-full bg-slate-100/80 rounded-xl overflow-hidden flex shadow-inner border border-slate-200/60">
          <div
            style={{ width: `${Math.min(100, needsPct)}%` }}
            className="bg-blue-500 h-full flex items-center justify-center text-white text-xs font-bold transition-all"
            title={`Needs: ${needsPct}%`}
          >
            {needsPct >= 8 && `${needsPct}% Needs`}
          </div>
          <div
            style={{ width: `${Math.min(100 - needsPct, wantsPct)}%` }}
            className="bg-purple-500 h-full flex items-center justify-center text-white text-xs font-bold transition-all"
            title={`Wants: ${wantsPct}%`}
          >
            {wantsPct >= 8 && `${wantsPct}% Wants`}
          </div>
          <div
            style={{ width: `${Math.min(100 - needsPct - wantsPct, savingsPct)}%` }}
            className="bg-emerald-500 h-full flex items-center justify-center text-white text-xs font-bold transition-all"
            title={`Savings: ${savingsPct}%`}
          >
            {savingsPct >= 8 && `${savingsPct}% Savings`}
          </div>
        </div>

        {/* Zero-Based Status Notice */}
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-200/50">
          <div className="flex items-center gap-2">
            {netRemaining === 0 ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero-Based Budget Achieved: Every single dollar is intentionally allocated!
              </span>
            ) : netRemaining > 0 ? (
              <span className="text-blue-700 font-medium flex items-center gap-1">
                <Info className="w-4 h-4 text-blue-600" />
                Surplus Remaining: You have ${netRemaining.toLocaleString()} unassigned cash to assign to savings or debt.
              </span>
            ) : (
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Budget Deficit: Spending exceeds income by ${Math.abs(netRemaining).toLocaleString()}. Trim discretionary wants.
              </span>
            )}
          </div>
          <span className="font-mono tabular-nums text-slate-600 font-semibold">
            Net Remaining: ${netRemaining.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Itemized Expenses & Add Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Expense Form */}
        <div className="glass-panel rounded-2xl p-5 shadow-xs h-fit space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-200/50 flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add Monthly Line Item</span>
          </h3>
          <form onSubmit={handleAddItem} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Expense / Category Name
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Car Insurance, Gym, Roth IRA"
                className="w-full px-3 py-2 text-sm bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Monthly Amount ($)
                </label>
                <input
                  type="number"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  placeholder="250"
                  className="w-full px-3 py-2 text-sm font-mono bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Budget Pillar
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                >
                  <option value="needs">Needs (50%)</option>
                  <option value="wants">Wants (30%)</option>
                  <option value="savings">Savings / Debt (20%)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Add to Budget
            </button>
          </form>

          {/* Educational Callout */}
          <div className="p-3.5 bg-white/50 border border-slate-200/60 rounded-xl text-xs space-y-1.5 text-slate-600">
            <span className="font-semibold text-slate-800 block">50/30/20 Rule Clarification:</span>
            <p><strong>Needs:</strong> Survival essentials (housing, groceries, utilities, minimum debt payments).</p>
            <p><strong>Wants:</strong> Discretionary (dining, streaming, travel, entertainment).</p>
            <p><strong>Savings:</strong> Emergency fund, extra principal debt payments, 401(k), and index funds.</p>
          </div>
        </div>

        {/* Itemized List Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="px-5 py-4 border-b border-slate-200/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Active Monthly Allocations ({items.length} Items)
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Total: ${totalSpent.toLocaleString()}/mo
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[440px] overflow-y-auto">
              {items.map((item) => {
                const categoryColor =
                  item.category === 'needs'
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : item.category === 'wants'
                    ? 'text-purple-700 bg-purple-50 border-purple-200'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200';

                return (
                  <div
                    key={item.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-white/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs uppercase font-bold px-2 py-0.5 rounded-md border ${categoryColor}`}
                      >
                        {item.category}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
                        ${item.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
