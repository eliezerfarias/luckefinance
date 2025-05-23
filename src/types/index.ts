export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'completed' | 'late';
export type TransactionRecurring = 'one-time' | 'recurring';

export interface Transaction {
  id: string;
  description: string;
  category: string;
  date: Date;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  recurring: TransactionRecurring;
}

export interface FinancialGoal {
  id: string | null;
  title: string;
  description: string;
  target: number;
  current: number;
  period: 'weekly' | 'monthly' | 'yearly';
  deadline: Date;
}

export interface DebtAgreement {
  id: string;
  name: string;
  totalAmount: number;
  installments: number;
  startDate: Date;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export type FinancialMoment = 'saudável' | 'equilibrado' | 'endividado';

export type TimeFilter = 'week' | 'month' | 'year';