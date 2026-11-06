export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // APR %
  minimumPayment: number;
}

export interface BudgetItem {
  id: string;
  category: 'needs' | 'wants' | 'savings';
  name: string;
  amount: number;
}

export interface FinancialProfile {
  id: string;
  personaName: string;
  personaDescription: string;
  monthlyIncome: number;
  monthlyNeeds: number;
  monthlyWants: number;
  monthlySavings: number;
  currentSavings: number;
  totalDebt: number;
  debts: DebtItem[];
  financialGoal: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  contextUsed?: string;
}

export interface FinancialAuditResult {
  score: number;
  savingsRate: string;
  emergencyRunway: string;
  debtToIncomeRatio: string;
  strengths: string[];
  vulnerabilities: string[];
  immediateActions: string[];
  strategicMilestones: string[];
}

// Preset realistic sample profiles
export const SAMPLE_PROFILES: FinancialProfile[] = [
  {
    id: 'college_grad',
    personaName: 'Recent College Graduate',
    personaDescription: 'Managing entry-level income, student loans, and credit card debt while building first savings.',
    monthlyIncome: 3800,
    monthlyNeeds: 2200,
    monthlyWants: 900,
    monthlySavings: 700,
    currentSavings: 2500,
    totalDebt: 31500,
    debts: [
      { id: 'd1', name: 'Federal Student Loans', balance: 28000, interestRate: 5.5, minimumPayment: 295 },
      { id: 'd2', name: 'Credit Card Debt', balance: 3500, interestRate: 22.9, minimumPayment: 110 },
    ],
    financialGoal: 'Eliminate high-interest credit card debt and accumulate a 3-month emergency reserve ($6,600).',
  },
  {
    id: 'young_professional',
    personaName: 'Young Professional',
    personaDescription: 'Debt-free career professional optimizing wealth accumulation, 401(k), and index fund investing.',
    monthlyIncome: 6500,
    monthlyNeeds: 3100,
    monthlyWants: 1500,
    monthlySavings: 1900,
    currentSavings: 18000,
    totalDebt: 0,
    debts: [],
    financialGoal: 'Maximize Roth IRA ($7,000/yr), hit 20% annual savings rate, and invest in broad market ETFs.',
  },
  {
    id: 'family_homebuyer',
    personaName: 'Family Planning Home Purchase',
    personaDescription: 'Dual-income household saving a 20% home down payment while managing child care and auto loan.',
    monthlyIncome: 8800,
    monthlyNeeds: 4900,
    monthlyWants: 1700,
    monthlySavings: 2200,
    currentSavings: 42000,
    totalDebt: 19500,
    debts: [
      { id: 'd3', name: 'Family SUV Auto Loan', balance: 19500, interestRate: 4.9, minimumPayment: 420 },
    ],
    financialGoal: 'Reach $80,000 down payment for a $400,000 home within 18 months without depleting safety buffer.',
  },
  {
    id: 'freelancer',
    personaName: 'Freelancer / Gig Economy',
    personaDescription: 'Independent contractor managing fluctuating revenue, self-employment taxes, and irregular cash flow.',
    monthlyIncome: 4600,
    monthlyNeeds: 2400,
    monthlyWants: 1000,
    monthlySavings: 1200,
    currentSavings: 9000,
    totalDebt: 4500,
    debts: [
      { id: 'd4', name: 'Business Equipment Loan', balance: 4500, interestRate: 8.2, minimumPayment: 180 },
    ],
    financialGoal: 'Maintain a 6-month buffer to smooth seasonal income drops and automate quarterly tax reserves.',
  },
];
