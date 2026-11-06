import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  Bot,
  PieChart,
  Calculator,
  TrendingUp,
  ShieldCheck,
  Code2,
  CheckCircle2,
  Lightbulb,
  Cpu,
  BookOpen,
} from 'lucide-react';

interface ProjectReportViewProps {
  onStartDemoTour?: () => void;
}

export const ProjectReportView: React.FC<ProjectReportViewProps> = ({
  onStartDemoTour,
}) => {
  const [activeSection, setActiveSection] = useState<
    'overview' | 'ai_arch' | 'features' | 'benefits' | 'source_code'
  >('overview');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const reportText = `# PROJECT REPORT: FinPulse AI - Intelligent Financial Chatbot & Planning Suite

**Course/Category**: AI-Powered Financial Applications  
**Project Title**: FinPulse AI: Conversational Financial Advisory & Decision Support System  
**Date**: November 2026  
**Technologies**: Google Gemini 3.8 Flash & Flash Latest Cascade, Express, React 19, TypeScript, Tailwind CSS v4, Web Speech API  

---

## 1. Executive Summary & Problem Statement
Financial illiteracy and debt anxiety represent significant real-world challenges. Millions of individuals struggle with:
- High-interest revolving debt (averaging >22% APR) without understanding the mathematical velocity of compound borrowing fees.
- Unstructured budgeting that leads to living paycheck-to-paycheck despite adequate net income.
- Intimidation by complex investment terminology (ETFs, 401k employer matches, Roth IRAs, asset allocation).
- High barriers to entry for professional financial advisors (often requiring $100k+ investable assets or charging 1% AUM).

FinPulse AI bridges this gap by combining an empathetic, mathematically disciplined Natural Language Processing (NLP) agent with real-time interactive financial planning tools and hands-free Voice Mode.

---

## 2. Artificial Intelligence Integration
- **Model Cascade**: Google Gemini 3.8 Flash (\`gemini-3.8-flash\`) with automatic failover to \`gemini-flash-latest\` and \`gemini-3.1-flash-lite\` via the \`@google/genai\` TypeScript SDK.
- **Resilient Fallback**: Algorithmic financial responder handling transient 503 high-demand spikes so user inquiries never fail.
- **Voice Mode**: Web Speech Recognition (speech-to-text) paired with natural speech synthesis (text-to-speech) and real-time audio visualization.
- **Context Injection**: Dynamically injects the user's active financial parameters (net income, fixed costs, debt accounts, interest rates) into the LLM system prompt.
- **Financial Safety Guardrails**: Strict CFP advisory persona, mathematical transparency, objective comparison between strategies (Avalanche vs. Snowball), and educational disclaimer governance.

---

## 3. Features & Functionality Matrix
1. **Intelligent AI Advisor & Voice Mode**: Natural language Q&A with live streaming, voice recognition, audio speech synthesis, and suggested inquiry pills.
2. **50/30/20 & Zero-Based Budget Planner**: Dynamic expense manager, proportional allocation bar, and AI budget audit.
3. **Loan Payoff & Amortization Engine**: Precise EMI calculations, interest savings from extra principal, and Avalanche vs. Snowball comparison.
4. **Compound Interest Simulator**: Long-term DCA projection, Rule of 72 doubling calculations, and tabular figures.
5. **Instant Financial Health Audit**: Algorithmic & AI scoring (0-100) with prioritized 30-day action items.

---

## 4. Practical Applications & Societal Impact
- Enables college graduates to eliminate student debt with systematic timelines.
- Guides families in saving home down payments while maintaining cash buffers.
- Empowers freelancers with variable income buffering strategies.
`;

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinPulse_AI_Project_Report.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Project Documentation & Academic Report</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            FinPulse AI: Intelligent Financial Chatbot Project
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            A comprehensive overview of the AI system architecture, real-world financial problem resolution, feature demonstration, and practical applications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white/80 hover:bg-white border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200/60 overflow-x-auto pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'overview'
              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          1. Executive Summary & Problem
        </button>
        <button
          onClick={() => setActiveSection('ai_arch')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'ai_arch'
              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          2. AI, NLP & Voice Architecture
        </button>
        <button
          onClick={() => setActiveSection('features')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'features'
              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          3. Features & Sample Data
        </button>
        <button
          onClick={() => setActiveSection('benefits')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'benefits'
              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          4. Benefits & Practical Impact
        </button>
        <button
          onClick={() => setActiveSection('source_code')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeSection === 'source_code'
              ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          5. Source Code & Tech Stack
        </button>
      </div>

      {/* Tab 1: Executive Summary & Real-World Problem */}
      {activeSection === 'overview' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Section 01
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              The Real-World Financial Problem
            </h2>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            Personal finance is one of the most critical determinants of individual health, security, and long-term well-being. However, broad segments of society face persistent structural challenges:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">
                Problem 1: High-Interest Debt Trap
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Credit card revolving interest averages over 22% APR. Consumers who make only minimum payments spend years paying interest while the underlying principal barely decreases.
              </p>
            </div>

            <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                Problem 2: Budgeting Friction & Leakage
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Traditional static spreadsheets are cumbersome to maintain. Without clear categorization (Needs vs Wants vs Savings), individuals experience cash leaks and have zero emergency buffer.
              </p>
            </div>

            <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                Problem 3: Advisory Cost Barrier
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Certified Financial Planners (CFPs) typically require $100,000+ in investable assets or charge $200–$400/hour, making professional guidance inaccessible to students and young families.
              </p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2 shadow-xs">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">
              The FinPulse AI Solution
            </span>
            <p className="text-xs text-emerald-950 leading-relaxed">
              FinPulse AI delivers a zero-barrier, interactive, and personalized advisory suite. It pairs advanced Natural Language Processing and hands-free Voice Mode with deterministic mathematical calculation engines. Users can converse in plain language ("How should I tackle my $28k student loan?"), and the chatbot immediately extracts their profile context, computes mathematical schedules, and suggests actionable next steps.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: AI & NLP Architecture */}
      {activeSection === 'ai_arch' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Section 02
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Artificial Intelligence, NLP & Voice Architecture
            </h2>
          </div>

          <div className="space-y-4 text-sm text-slate-700">
            <p className="leading-relaxed">
              FinPulse AI uses a multi-tier foundation cascade featuring <strong>Gemini 3.8 Flash</strong> (<code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">gemini-3.8-flash</code>) with automated failover to <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">gemini-flash-latest</code> and <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">gemini-3.1-flash-lite</code> via the official <strong>@google/genai</strong> TypeScript SDK on a full-stack Node.js/Express server.
            </p>

            {/* Architecture Flow Diagram */}
            <div className="p-5 bg-slate-900 text-white rounded-2xl font-mono text-xs space-y-3 shadow-md">
              <div className="text-emerald-400 font-bold">
                [SYSTEM DATAFLOW & RESILIENT CASCADE PIPELINE]
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-300">
                <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
                  <span className="text-emerald-400 font-bold block mb-1">1. User Speech or Text</span>
                  Natural voice recognition (Web Speech API) or text input + active profile context attached.
                </div>
                <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
                  <span className="text-emerald-400 font-bold block mb-1">2. Server Proxy Cascade</span>
                  Express backend manages keys; tries Gemini 3.8 Flash with automatic fallback to Flash Latest.
                </div>
                <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
                  <span className="text-emerald-400 font-bold block mb-1">3. Resilient Responder</span>
                  If 503 high-demand spike occurs, resilient local financial engine immediately provides guidance.
                </div>
                <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
                  <span className="text-emerald-400 font-bold block mb-1">4. Audio & Text Stream</span>
                  Tokens stream in real-time with Web Speech audio narration and clickable follow-up chips.
                </div>
              </div>
            </div>

            {/* Prompt Engineering & Guardrails */}
            <h3 className="text-base font-bold text-slate-900 pt-2">
              Key Prompt Engineering & Safety Mechanisms:
            </h3>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Interactive Hands-Free Voice Mode</strong>: Real-time microphone listening combined with natural speech synthesis allows users to speak and listen naturally.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Dynamic Financial Context Injection</strong>: User income, fixed costs, debts, and savings are automatically injected into the LLM context.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>503 High Demand Resilience</strong>: Transient model capacity spikes are caught and gracefully resolved via model cascade and algorithmic fallback.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Advisory Disclaimer Governance</strong>: Clear compliance notices are enforced so users understand that the system provides financial education.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Features & Sample Data */}
      {activeSection === 'features' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Section 03
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Main Features & Pre-Configured Sample Data
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Conversational AI Financial Advisor & Voice Mode</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Live streaming chat powered by Gemini cascade. Supports microphone dictation, interactive Voice Mode console, markdown tables, audio synthesis, and transcript export.
              </p>
            </div>

            <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">50/30/20 & Zero-Based Budget Planner</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dynamic visual allocation bar comparing actual expenditure against ideal benchmarks. Includes an itemized line-item manager and an "AI Budget Optimization" engine.
              </p>
            </div>

            <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-600" />
                <h4 className="text-sm font-bold text-slate-900">Loan Amortization & Strategy Engine</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Exact monthly EMI calculation and extra principal simulator. Features a multi-debt comparator for Debt Avalanche (highest APR first) vs Debt Snowball (lowest balance first).
              </p>
            </div>

            <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-2 shadow-xs">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Compound Interest & Growth Simulator</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visualizes long-term dollar-cost averaging up to 40 years. Calculates the Rule of 72 doubling timeline and generates tabular year-by-year balance breakdowns.
              </p>
            </div>
          </div>

          {/* Sample Data Persona Table */}
          <div className="pt-2">
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Demonstration Sample Personas
            </h4>
            <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white/50">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-white/80 font-semibold text-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Persona</th>
                    <th className="px-4 py-2.5">Monthly Net</th>
                    <th className="px-4 py-2.5">Debt Obligation</th>
                    <th className="px-4 py-2.5">Current Savings</th>
                    <th className="px-4 py-2.5">Primary Challenge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white/40 font-mono tabular-nums">
                  <tr>
                    <td className="px-4 py-2 font-sans font-semibold text-slate-900">College Graduate</td>
                    <td className="px-4 py-2 text-slate-700">$3,800/mo</td>
                    <td className="px-4 py-2 text-red-600">$31,500 (CC + Student)</td>
                    <td className="px-4 py-2 text-slate-700">$2,500</td>
                    <td className="px-4 py-2 font-sans text-slate-600">High credit card interest vs student debt</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-sans font-semibold text-slate-900">Young Professional</td>
                    <td className="px-4 py-2 text-slate-700">$6,500/mo</td>
                    <td className="px-4 py-2 text-emerald-600">$0 (Debt-Free)</td>
                    <td className="px-4 py-2 text-slate-700">$18,000</td>
                    <td className="px-4 py-2 font-sans text-slate-600">Maximizing 401(k), Roth IRA, index funds</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-sans font-semibold text-slate-900">Family Homebuyer</td>
                    <td className="px-4 py-2 text-slate-700">$8,800/mo</td>
                    <td className="px-4 py-2 text-slate-700">$19,500 (Auto)</td>
                    <td className="px-4 py-2 text-slate-700">$42,000</td>
                    <td className="px-4 py-2 font-sans text-slate-600">Accumulating 20% down payment for $400k home</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-sans font-semibold text-slate-900">Freelancer</td>
                    <td className="px-4 py-2 text-slate-700">$4,600/mo</td>
                    <td className="px-4 py-2 text-slate-700">$4,500 (Equipment)</td>
                    <td className="px-4 py-2 text-slate-700">$9,000</td>
                    <td className="px-4 py-2 font-sans text-slate-600">Smoothing seasonal revenue & tax reserves</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Benefits & Practical Applications */}
      {activeSection === 'benefits' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Section 04
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Practical Applications & Societal Benefits
            </h2>
          </div>

          <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
            <p>
              The practical applications of FinPulse AI extend across individual financial planning, educational institutions, and financial wellness programs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-1.5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  1. Financial Literacy Education
                </h4>
                <p className="text-xs text-slate-600">
                  Universities and high schools can deploy this application as an interactive laboratory where students immediately see the mathematical consequence of loan terms, compound growth, and discretionary leaks.
                </p>
              </div>

              <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-1.5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2. Debt Reduction & Credit Counseling
                </h4>
                <p className="text-xs text-slate-600">
                  Non-profit credit counselors can use the Debt Avalanche vs Snowball simulator to illustrate clear payoff horizons and inspire client confidence.
                </p>
              </div>

              <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-1.5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  3. Workplace Financial Wellness
                </h4>
                <p className="text-xs text-slate-600">
                  Employers can offer the tool to help staff optimize 401(k) matches, budget for life events, and avoid financial stress that degrades workplace productivity.
                </p>
              </div>

              <div className="p-4 bg-white/60 border border-slate-200/80 rounded-2xl space-y-1.5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  4. Automated Financial Health Auditing
                </h4>
                <p className="text-xs text-slate-600">
                  Instant algorithmic and AI evaluation provides unbiased, non-judgmental scoring and 30-day priorities that keep users accountable.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Source Code & Tech Stack */}
      {activeSection === 'source_code' && (
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Section 05
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Source Code Architecture & Technical Stack
            </h2>
          </div>

          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <p>
              The application is engineered as a modern, production-grade full-stack TypeScript application:
            </p>

            <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl font-mono space-y-1 overflow-x-auto shadow-md">
              <div className="text-emerald-400 font-bold mb-2">// Project File Structure</div>
              <div>├── server.ts                       # Express backend with Gemini cascade & 503 resilience</div>
              <div>├── index.html                      # HTML entry with Plus Jakarta Sans & JetBrains Mono</div>
              <div>├── package.json                    # Dependencies & full-stack scripts</div>
              <div>└── src/</div>
              <div>    ├── App.tsx                     # Main layout & light glass canvas orchestrator</div>
              <div>    ├── index.css                   # Light glassmorphism, radial ambient mesh & animations</div>
              <div>    ├── types/</div>
              <div>    │   └── financial.ts            # Type definitions & 4 preset sample personas</div>
              <div>    ├── utils/</div>
              <div>    │   └── markdownRenderer.tsx    # Custom markdown parser with table support</div>
              <div>    └── components/</div>
              <div>        ├── Navbar.tsx              # Light glass header with Voice Mode trigger</div>
              <div>        ├── ChatAdvisor.tsx         # AI Chatbot with dictation & retry resilience</div>
              <div>        ├── VoiceModeModal.tsx      # Full-screen interactive speech console & orb</div>
              <div>        ├── BudgetPlanner.tsx       # 50/30/20 & zero-based budget calculator</div>
              <div>        ├── LoanCalculator.tsx      # EMI amortization & Avalanche vs Snowball</div>
              <div>        ├── InvestmentProjector.tsx # Compound interest DCA wealth projector</div>
              <div>        ├── FinancialAuditModal.tsx # Instant AI financial health score & actions</div>
              <div>        ├── PersonaModal.tsx        # Persona selection modal for demonstrations</div>
              <div>        └── ProjectReportView.tsx   # Project report & documentation component</div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="font-semibold text-slate-700">Ready for academic submission and live demonstration.</span>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white rounded-xl font-semibold transition-all shadow-xs cursor-pointer"
              >
                Print / Save PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
