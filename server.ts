import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

// Initialize Google GenAI client (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instructions for the financial chatbot
const SYSTEM_INSTRUCTION = `You are FinPulse AI, an intelligent, empathetic, and highly analytical personal financial advisor and educator.
Your mission is to provide clear, actionable, mathematically sound guidance on personal finance, including:
1. Budgeting (50/30/20 rule, zero-based budgeting, tracking expenses, curbing discretionary spending).
2. Savings & Emergency Funds (high-yield savings accounts, CD ladders, 3-6 month safety buffers).
3. Debt & Loans (student loans, mortgages, auto loans, credit cards, EMI calculations, Debt Avalanche vs. Debt Snowball payoff strategies).
4. Investments & Wealth Building (index funds/ETFs, asset allocation, dollar-cost averaging, compound interest, retirement accounts like 401(k), IRA, Roth IRA).
5. Comprehensive Financial Planning (net worth growth, risk management, milestone setting).

Guidelines for your responses:
- Tone: Professional, encouraging, educational, and objective.
- Clarity: Use structured markdown formatting with clear bold headings, bullet points, and concise action steps.
- Mathematical rigor: When the user asks about calculations (e.g., compound interest, loan payments, budgeting splits), show the step-by-step math and concrete numbers.
- Tailored Context: When the user shares their financial profile (income, expenses, debts, goals), ALWAYS incorporate their specific numbers directly into your analysis and recommendations.
- Practicality: Explain real-world tradeoffs (e.g. paying high-interest debt at 22% APR gives a guaranteed 22% return, beating average stock market returns).
- Disclaimer: Always include a brief disclaimer when providing investment or tax considerations stating that you provide educational guidance and users should consult a licensed CFP/CPA for complex legal or tax filings.
- Follow-up prompts: At the end of every response, provide 2 to 3 concise, highly relevant follow-up questions the user can ask next, formatted as:
[Suggestions]
• <Question 1>
• <Question 2>
• <Question 3>`;

// Intelligent financial responder used when external AI models experience temporary 503 high demand
function generateIntelligentFallbackResponse(userQuestion: string, userProfile: any): string {
  const q = userQuestion.toLowerCase();
  const income = userProfile?.monthlyIncome || 3800;
  const needs = userProfile?.monthlyNeeds || 2200;
  const wants = userProfile?.monthlyWants || 900;
  const savings = userProfile?.monthlySavings || 700;
  const debt = userProfile?.totalDebt || 31500;
  const currentSavings = userProfile?.currentSavings || 2500;
  const persona = userProfile?.personaName || 'Financial Planner';

  // Budgeting & 50/30/20 inquiries
  if (q.includes('50/30/20') || q.includes('budget') || q.includes('allocate') || q.includes('income')) {
    const targetNeeds = Math.round(income * 0.5);
    const targetWants = Math.round(income * 0.3);
    const targetSavings = Math.round(income * 0.2);

    const actualNeedsPct = Math.round((needs / income) * 100);
    const actualWantsPct = Math.round((wants / income) * 100);
    const actualSavingsPct = Math.round((savings / income) * 100);

    return `### Personalized 50/30/20 Budget Breakdown for **${persona}**

Based on your net monthly income of **$${income.toLocaleString()}**, here is how your numbers map to the standard 50/30/20 benchmark:

| Category | Benchmark Target | Target Amount | Your Current | Current % | Variance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Needs (Essentials)** | 50% | $${targetNeeds.toLocaleString()} | $${needs.toLocaleString()} | ${actualNeedsPct}% | ${needs > targetNeeds ? `+$${(needs - targetNeeds).toLocaleString()} (Over)` : `-$${(targetNeeds - needs).toLocaleString()} (Under)`} |
| **Wants (Discretionary)** | 30% | $${targetWants.toLocaleString()} | $${wants.toLocaleString()} | ${actualWantsPct}% | ${wants > targetWants ? `+$${(wants - targetWants).toLocaleString()} (Over)` : `-$${(targetWants - wants).toLocaleString()} (Under)`} |
| **Savings & Extra Debt** | 20% | $${targetSavings.toLocaleString()} | $${savings.toLocaleString()} | ${actualSavingsPct}% | ${savings >= targetSavings ? `+$${(savings - targetSavings).toLocaleString()} (Ahead)` : `-$${(targetSavings - savings).toLocaleString()} (Gap)`} |

#### Key Financial Recommendations:
1. **Housing & Fixed Costs**: Ensure your primary fixed expenses stay below 50% ($${targetNeeds.toLocaleString()}).
2. **Discretionary Capping**: Cap non-essential spending at $${targetWants.toLocaleString()} to prevent lifestyle creep.
3. **Pay Yourself First**: Automate the transfer of $${targetSavings.toLocaleString()} into your high-yield savings or investment account on pay day.

*Disclaimer: FinPulse AI provides educational financial frameworks. Consult a licensed CFP for customized fiduciary plans.*

[Suggestions]
• How do I cut my discretionary wants down to 30%?
• Compare Avalanche vs Snowball for paying off my $${debt.toLocaleString()} debt.
• How much should I hold in an emergency fund?`;
  }

  // Debt & Loan Inquiries
  if (q.includes('debt') || q.includes('loan') || q.includes('avalanche') || q.includes('snowball') || q.includes('payoff') || q.includes('emi') || q.includes('apr')) {
    const hasCC = debt > 10000;
    return `### Debt Reduction Strategy: Avalanche vs. Snowball for **$${debt.toLocaleString()}**

When tackling **$${debt.toLocaleString()}** in debt, two mathematically and behaviorally proven frameworks exist:

#### 1. The Debt Avalanche Method (Mathematically Optimal)
- **Mechanism**: Make minimum payments on all accounts, then apply every surplus dollar towards the debt with the **highest interest rate (APR%)** (e.g., credit cards at 22%+ APR).
- **Benefit**: Minimizes the total interest paid and gets you debt-free faster mathematically.
- **Example**: Paying an extra $150/month towards a 22% card guarantees an equivalent 22% risk-free return on your money.

#### 2. The Debt Snowball Method (Psychologically Optimal)
- **Mechanism**: Make minimum payments on all accounts, then attack the account with the **smallest balance first**, regardless of interest rate.
- **Benefit**: Delivers immediate emotional and behavioral wins, rapidly eliminating separate monthly bills.

#### Recommended Action Steps for Your Profile:
- **Phase 1**: Ensure a starter emergency buffer of at least $1,500 - $2,500 so unexpected expenses don't force you back into credit card borrowing.
- **Phase 2**: If you have high-interest debt (>10% APR), use the Avalanche method immediately. If your debts are all low interest (<6%), you can balance payoff with investing.

*Disclaimer: For loan consolidation or formal refinancing agreements, check terms with accredited lenders.*

[Suggestions]
• What is the mathematical threshold between paying debt vs investing?
• How much interest do I save by adding $100/mo extra principal?
• How do I calculate my debt-to-income (DTI) ratio?`;
  }

  // Savings & Emergency Fund Inquiries
  if (q.includes('saving') || q.includes('emergency') || q.includes('hysa') || q.includes('buffer') || q.includes('cash')) {
    const threeMonth = needs * 3;
    const sixMonth = needs * 6;
    const currentRunway = Math.round((currentSavings / Math.max(1, needs)) * 10) / 10;

    return `### Emergency Fund & Savings Optimization Guide

For **${persona}**, your essential monthly needs are approximately **$${needs.toLocaleString()}/month**.

#### Emergency Buffer Runway Benchmarks:
- **Current Liquid Savings**: $${currentSavings.toLocaleString()} (**${currentRunway} months** of runway)
- **3-Month Baseline**: **$${threeMonth.toLocaleString()}** (Standard recommendation for stable dual-income or salaried jobs)
- **6-Month Full Cushion**: **$${sixMonth.toLocaleString()}** (Recommended for single-income, variable income, or home owners)

#### Where to Keep Your Savings:
1. **High-Yield Savings Account (HYSA)**: Look for FDIC-insured institutions offering competitive rates (typically 4.0% - 5.0% APY). On a $10,000 balance, that yields $400 - $500/year in passive interest vs ~$1 in a standard checking account.
2. **Never Invest Emergency Reserves**: Keep this capital liquid and cash-equivalent. Never expose required living expenses to stock market volatility.

[Suggestions]
• What is the difference between an HYSA and a CD ladder?
• How do I build a sinking fund for annual expenses?
• Should I invest while still building my emergency fund?`;
  }

  // Investment Inquiries
  if (q.includes('invest') || q.includes('stock') || q.includes('etf') || q.includes('index') || q.includes('401') || q.includes('roth') || q.includes('compound') || q.includes('retirement')) {
    return `### Wealth Building & Investment Strategy

Investing allows your money to work for you through **compound interest** and dividend reinvestment.

#### The Financial Order of Operations:
1. **Emergency Buffer**: Maintain 3-6 months of essential living expenses ($${needs * 3} - $${needs * 6}) in an HYSA.
2. **Employer 401(k) Match**: Always capture 100% of your employer match (this is an instant, guaranteed 100% return).
3. **High-Interest Debt Eradication**: Pay off credit cards or any debt with >8% APR.
4. **Roth IRA / HSA**: Maximize tax-free growth accounts (annual Roth IRA limit is typically $7,000 for eligible earners).
5. **Broad-Market Low-Cost Index Funds**: Invest in diversified total-market funds (e.g. S&P 500 / VTI / VOO) with low expense ratios (<0.05%).

#### The Power of Compound Growth (Rule of 72):
- At an **8% average annual return**, your invested capital doubles approximately every **9 years** (\`72 / 8 = 9\`).
- Investing **$500/month** consistently over 25 years at an 8% return yields over **$475,000**, with more than **$325,000** consisting purely of compound gains!

*Disclaimer: Past market performance does not guarantee future results. Diversification does not guarantee against loss.*

[Suggestions]
• What is an ETF and how does it compare to a mutual fund?
• How does a Roth IRA differ from a Traditional 401(k)?
• Walk me through building a 3-Fund Portfolio (Stocks, International, Bonds).`;
  }

  // Default General Advice
  return `### Comprehensive Financial Guidance for **${persona}**

Here is a holistic overview tailored to your current financial parameters:
- **Net Monthly Cashflow**: $${income.toLocaleString()}
- **Monthly Obligations**: $${needs.toLocaleString()} (Needs) + $${wants.toLocaleString()} (Wants)
- **Monthly Savings Capacity**: $${savings.toLocaleString()}
- **Total Debt Portfolio**: $${debt.toLocaleString()}

#### 3 Immediate Strategic Priorities:
1. **Automate Your Budget**: Protect your $${savings.toLocaleString()} monthly savings by automating deposits on payday before discretionary spending occurs.
2. **Optimize Debt Payoff**: Direct surplus cash towards the highest-interest debt account to reduce interest drag.
3. **Maintain Cash Liquidity**: Keep your emergency buffer in an FDIC-insured high-yield savings account (HYSA) earning compound interest.

*Disclaimer: FinPulse provides educational personal finance frameworks. Consult a certified financial planner for individual advisory.*

[Suggestions]
• How should I allocate my monthly income using the 50/30/20 rule?
• Compare the Debt Avalanche and Debt Snowball methods for my debts.
• How much should I keep in an emergency fund vs investments?`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Financial Chat Endpoint with Resilient Fallback & Server-Sent Events (SSE) Streaming
app.post('/api/chat', async (req, res) => {
  const { messages, userProfile, context } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required' });
    return;
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const lastMessage = messages[messages.length - 1];
  const userQuestion = lastMessage ? lastMessage.content : '';

  // Helper to stream text in clean chunks
  const streamTextChunks = async (text: string) => {
    const words = text.split(' ');
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(' ') + ' ';
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      // Micro-pause for pleasant natural reading cadence
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  };

  // If AI client is not available, stream intelligent local response
  if (!ai) {
    const intelligentFallback = generateIntelligentFallbackResponse(userQuestion, userProfile);
    await streamTextChunks(intelligentFallback);
    return;
  }

  // Format conversation history for Gemini
  let contextualPrompt = '';
  if (userProfile) {
    contextualPrompt += `[ACTIVE USER FINANCIAL CONTEXT]\n`;
    contextualPrompt += `- Monthly Net Income: $${userProfile.monthlyIncome ?? 'N/A'}\n`;
    contextualPrompt += `- Monthly Fixed Expenses (Needs): $${userProfile.monthlyNeeds ?? 'N/A'}\n`;
    contextualPrompt += `- Monthly Discretionary (Wants): $${userProfile.monthlyWants ?? 'N/A'}\n`;
    contextualPrompt += `- Monthly Savings/Investments: $${userProfile.monthlySavings ?? 'N/A'}\n`;
    contextualPrompt += `- Current Liquid Savings: $${userProfile.currentSavings ?? 'N/A'}\n`;
    contextualPrompt += `- Total Outstanding Debts: $${userProfile.totalDebt ?? 'N/A'}\n`;
    if (userProfile.debts && userProfile.debts.length > 0) {
      contextualPrompt += `- Debt Breakdown: ${JSON.stringify(userProfile.debts)}\n`;
    }
    if (userProfile.financialGoal) {
      contextualPrompt += `- Primary Financial Goal: ${userProfile.financialGoal}\n`;
    }
    contextualPrompt += `\n`;
  }

  if (context) {
    contextualPrompt += `[ADDITIONAL CONTEXT / CALCULATOR DATA]\n${context}\n\n`;
  }

  // Build the contents array for generateContentStream
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (let i = 0; i < messages.length - 1; i++) {
    const msg = messages[i];
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    });
  }

  const finalUserText = contextualPrompt
    ? `${contextualPrompt}User Question: ${lastMessage.content}`
    : lastMessage.content;

  contents.push({
    role: 'user',
    parts: [{ text: finalUserText }],
  });

  // Model cascade: try primary gemini-3.8-flash, fallback to gemini-flash-latest, then gemini-3.1-flash-lite
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let streamSuccess = false;

  for (const modelName of candidateModels) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || '';
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      streamSuccess = true;
      break;
    } catch (modelError: any) {
      console.warn(`Model ${modelName} stream failed or high demand (code ${modelError?.status || modelError?.code}):`, modelError?.message);
      // If it's a 503 (high demand) or 429, loop to next candidate model
      continue;
    }
  }

  // If all remote models experienced temporary high demand, stream intelligent fallback response
  if (!streamSuccess) {
    console.log('Using resilient local financial responder due to transient model demand spike.');
    const intelligentFallback = generateIntelligentFallbackResponse(userQuestion, userProfile);
    await streamTextChunks(intelligentFallback);
  }
});

// Financial Health Audit Analysis Endpoint with Resilient Model Cascade
app.post('/api/analyze-plan', async (req, res) => {
  const { profile } = req.body;

  if (!profile) {
    res.status(400).json({ error: 'Financial profile is required' });
    return;
  }

  const generateLocalAudit = () => {
    const income = Number(profile.monthlyIncome) || 3800;
    const needs = Number(profile.monthlyNeeds) || 2200;
    const wants = Number(profile.monthlyWants) || 900;
    const savings = Number(profile.monthlySavings) || 700;
    const currentSavings = Number(profile.currentSavings) || 2500;
    const totalDebt = Number(profile.totalDebt) || 31500;

    const savingsRate = Math.round((savings / income) * 100);
    const emergencyRunwayMonths = Math.round((currentSavings / Math.max(1, needs)) * 10) / 10;
    const healthScore = Math.min(95, Math.max(45, Math.round(savingsRate * 1.5 + emergencyRunwayMonths * 7 - (totalDebt > 20000 ? 15 : 5))));

    return {
      score: healthScore,
      savingsRate: `${savingsRate}%`,
      emergencyRunway: `${emergencyRunwayMonths} months`,
      debtToIncomeRatio: `${Math.round(((needs * 0.3) / income) * 100)}%`,
      strengths: [
        `Active monthly savings rate of ${savingsRate}%, building financial momentum.`,
        `Liquid emergency fund currently cushions ${emergencyRunwayMonths} months of essential needs.`,
        `Consistent income cash flow provides predictable budgeting foundation.`,
      ],
      vulnerabilities: [
        totalDebt > 0 ? `Total outstanding debt of $${totalDebt.toLocaleString()} requires structured payoff.` : 'Maintain emergency buffer against liquidity shock.',
        emergencyRunwayMonths < 3 ? 'Liquid safety buffer is below the recommended 3-6 month safety threshold.' : 'Ensure reserves are placed in high-yield accounts (>4% APY).',
      ],
      immediateActions: [
        'Automate pay-yourself-first savings deposits on direct deposit day.',
        'Apply the Debt Avalanche method to the highest APR loan to reduce borrowing fees.',
        'Review discretionary recurring charges and subscriptions for low-hanging savings.',
      ],
      strategicMilestones: [
        'Achieve a fully funded 3-to-6 month emergency cash reserve in an HYSA.',
        'Eliminate high-interest debt accounts to free up monthly cash flow.',
        'Initiate monthly index fund contributions (e.g. S&P 500) for compound growth.',
      ],
    };
  };

  if (!ai) {
    res.json(generateLocalAudit());
    return;
  }

  const prompt = `Analyze this user's personal financial snapshot and return a structured JSON assessment:
Profile Data:
- Monthly Net Income: $${profile.monthlyIncome}
- Monthly Needs (Essentials): $${profile.monthlyNeeds}
- Monthly Wants (Discretionary): $${profile.monthlyWants}
- Monthly Savings/Investments: $${profile.monthlySavings}
- Current Liquid Savings: $${profile.currentSavings}
- Total Outstanding Debt: $${profile.totalDebt}
- Primary Financial Goal: ${profile.financialGoal || 'Achieve Financial Stability'}

Return valid JSON with the following structure:
{
  "score": number (0 to 100 realistic financial health score based on savings rate, emergency runway, and debt burden),
  "savingsRate": string (e.g. "22%"),
  "emergencyRunway": string (e.g. "2.5 months"),
  "debtToIncomeRatio": string (e.g. "18%"),
  "strengths": string[] (3 specific positive financial habits or metrics),
  "vulnerabilities": string[] (2-3 realistic risks or bottlenecks),
  "immediateActions": string[] (3 concrete step-by-step actions for this month),
  "strategicMilestones": string[] (3 realistic 6-12 month goals)
}`;

  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.score && parsed.strengths) {
        res.json(parsed);
        return;
      }
    } catch (err: any) {
      console.warn(`Audit model ${modelName} failed or high demand:`, err?.message);
      continue;
    }
  }

  // Fallback to local mathematical audit if external models fail
  res.json(generateLocalAudit());
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`FinPulse AI Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
